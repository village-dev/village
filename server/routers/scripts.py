import json
import logging
import re
import tarfile
from datetime import datetime
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Dict, List, Optional, Union

import aiofiles
import docker  # type: ignore
import prisma.partials as PrismaPartials
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.security import HTTPBearer
from prisma import models as PrismaModels
from prisma import types as PrismaTypes
from prisma.enums import Engine, ParamType
from prisma.errors import UniqueViolationError
from pydantic import BaseModel

from models.config import Config
from routers.users import get_user, verify_token
from server.docker import docker_client, execute  # type: ignore
from utils.index import ParsedToken  # type: ignore

router = APIRouter(tags=["scripts"])

# Scheme for the Authorization header
token_auth_scheme = HTTPBearer()


class CreateScriptInput(BaseModel):
    """
    Script registration input
    """

    id: Optional[str]
    name: str
    workspace_id: str
    description: Optional[str]
    engine: Engine
    engine_version: str
    workspace_id: str


async def check_workspace_access(user_id: str, workspace_id: str):

    # check that user is member of workspace
    workspace = await PrismaModels.Workspace.prisma().find_first(
        where={
            "id": workspace_id,
            "users": {"some": {"user_id": {"equals": user_id}}},
        }
    )
    if not workspace:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this workspace",
        )

    return


async def check_script_access(user_id: str, script_id: str):

    # check that user is member of workspace
    workspace = await PrismaModels.Workspace.prisma().find_first(
        where={
            "users": {"some": {"user_id": {"equals": user_id}}},
            "scripts": {"some": {"id": {"equals": script_id}}},
        }
    )
    if not workspace:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this script",
        )

    return


@router.get("/scripts/propose_id", operation_id="propose_id", response_model=str)
async def propose_id(
    name: str,
    token: ParsedToken = Depends(verify_token),  # to require authentication
):
    """
    Propose a script ID based on the name.
    """

    # generate default id by replacing non-alphanumeric characters with underscores and lowercasing
    script_id = re.sub("[^0-9a-zA-Z]+", "_", name).lower()

    # if script with this id already exists, append a number to the id
    prefix_scripts = await PrismaModels.Script.prisma().find_many(
        order={"id": "desc"}, where={"id": {"startswith": script_id + "_"}}
    )
    same_id = await PrismaModels.Script.prisma().find_unique(where={"id": script_id})

    prefix_script_ids = [s.id[len(script_id) + 1 :] for s in prefix_scripts]
    script_nums = [int(s) for s in prefix_script_ids if s.isnumeric()]
    next_num = None if not script_nums else max(script_nums) + 1

    if next_num is not None:
        script_id = f"{script_id}_{next_num}"

    else:
        if same_id is not None:
            script_id = f"{script_id}_1"

    return script_id


@router.get("/scripts/check_id", operation_id="check_id", response_model=bool)
async def check_id(
    id: str,
    token: ParsedToken = Depends(verify_token),  # to require authentication
):
    """
    Check if a script ID is available.
    """

    script = await PrismaModels.Script.prisma().find_unique(where={"id": id})

    return script is None


@router.post(
    "/script/create",
    operation_id="create_script",
    response_model=PrismaModels.Script,
)
async def create_script(
    script: CreateScriptInput, user: PrismaModels.User = Depends(get_user)
):
    """
    Initialize a script.
    """

    await check_workspace_access(user.id, script.workspace_id)

    script_id = script.id

    if script_id is None or script_id == "":
        script_id = await propose_id(script.name)

    try:
        created_script = await PrismaModels.Script.prisma().create(
            {
                "id": script_id,
                "name": script.name,
                "description": "" if script.description is None else script.description,
                "engine": script.engine,
                "engine_version": script.engine_version,
                "workspace_id": script.workspace_id,
                "creator_id": user.id,
            }
        )
        return created_script
    except UniqueViolationError:
        raise HTTPException(
            status_code=400, detail="Script with this id already exists"
        )


class UpdateScriptInput(BaseModel):
    """
    Script registration input
    """

    name: Optional[str]
    id: str


@router.post(
    "/script/update",
    response_model=PrismaModels.Script,
    operation_id="update_script",
)
async def update_script(
    script: UpdateScriptInput, user: PrismaModels.User = Depends(get_user)
):
    """
    Update script contents.
    """

    await check_script_access(user.id, script.id)

    update_dict: PrismaTypes.ScriptUpdateInput = {}
    if script.name is not None:
        update_dict["name"] = script.name

    updated_script = await PrismaModels.Script.prisma().update(
        data=update_dict, where={"id": script.id}
    )

    if updated_script is None:
        raise HTTPException(status_code=404, detail="Script not found")

    return updated_script


def construct_dockerfile(
    script: PrismaModels.Script,
    build_command: Optional[str],
    image: Optional[str],
    user: PrismaModels.User = Depends(get_user),
) -> str:
    """
    Construct a Dockerfile from a script.
    """

    if script.engine == Engine.Python:

        image = f"python:{script.engine_version}-alpine" if image is None else image

        return f"""
        FROM {image}
        
        WORKDIR /app
        
        COPY package.tar.gz /app
        COPY shim.py /app

        RUN tar -xzf package.tar.gz
        RUN if test -f "./requirements.txt"; then python3 -m pip install -r requirements.txt; fi
        {f'RUN {build_command}' if build_command is not None else ""}
        CMD ["python3", "shim.py"]
        """

    elif script.engine == Engine.Node:

        image = f"node:{script.engine_version}-alpine" if image is None else image

        return f"""
        FROM {image}
        
        WORKDIR /app
        
        COPY package.tar.gz /app
        COPY shim.js /app

        RUN tar -xzf package.tar.gz
        RUN yarn install
        {f'RUN {build_command}' if build_command is not None else ""}
        CMD ["node", "shim.js"]
        """

    raise ValueError(f"Unsupported engine: {script.engine}")


@router.post(
    "/script/build",
    response_model=PrismaModels.Build,
    operation_id="build_script",
)
async def build_script(
    script_id: str = Form(...),
    context: UploadFile = File(...),
    user: PrismaModels.User = Depends(get_user),
):
    """
    Build a script so that it can be run.
    """

    await check_script_access(user.id, script_id)

    # get script details
    script = await PrismaModels.Script.prisma().find_unique(where={"id": script_id})

    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")

    temp_dir = TemporaryDirectory()
    package_path = temp_dir.name + "/package.tar.gz"
    # see https://stackoverflow.com/questions/63580229/how-to-save-uploadfile-in-fastapi
    async with aiofiles.open(package_path, "wb") as out_file:
        while content := await context.read(1024):  # async read chunk
            await out_file.write(content)  # async write chunk

    with tarfile.open(package_path, "r:gz") as tar:
        config_file = tar.extractfile("village.yaml")

        if config_file is None:
            raise HTTPException(
                status_code=400, detail="village.yaml not found in build context"
            )

        config = Config.parse_raw(config_file.read())

    build = await PrismaModels.Build.prisma().create(
        {
            "script_id": script_id,
            "status": "pending",
            "output": "",
            "params": {
                "create": [
                    {
                        "key": key,
                        "type": p.type,
                        "default": p.default,
                        "description": p.description,
                        "required": p.required,
                        "options": [
                            json.dumps({"label": x, "value": x})
                            if isinstance(x, str)
                            else json.dumps(
                                {
                                    "label": x.label,
                                    "value": x.value,
                                }
                            )
                            for x in p.options
                        ],
                    }
                    for key, p in config.params.items()
                ]
            },
            "build_command": config.build_command,
            "creator_id": user.id,
        }
    )

    dockerfile_contents = construct_dockerfile(
        script, config.build_command, config.image
    )

    with open(temp_dir.name + "/Dockerfile", "w", encoding="utf-8") as file:
        file.write(dockerfile_contents)

    if script.engine == Engine.Python:
        with open(temp_dir.name + "/shim.py", "w", encoding="utf-8") as file:
            with open(
                Path(__file__).parent.parent / "sdk/shim.py", "r", encoding="utf-8"
            ) as f:
                file.write(f.read())

    elif script.engine == Engine.Node:
        with open(temp_dir.name + "/shim.js", "w", encoding="utf-8") as file:
            with open(
                Path(__file__).parent.parent / "sdk/shim.js", "r", encoding="utf-8"
            ) as f:
                file.write(f.read())

    try:
        _, logs = docker_client.images.build(path=temp_dir.name, tag=build.id)  # type: ignore
    except docker.errors.BuildError as err:  # type: ignore
        logging.error(err)  # type: ignore

        raise HTTPException(status_code=500, detail="Build failed") from err

    temp_dir.cleanup()

    log_stream: List[str] = [x["stream"] for x in logs if x.get("stream")]  # type: ignore

    build = await PrismaModels.Build.prisma().update(
        where={"id": build.id},
        data={
            "status": "success",
            "output": json.dumps(log_stream),
            "completed_at": datetime.now(),
        },
    )

    return build


def validate_params(
    params: Dict[str, Union[str, int, float, bool]], spec: List[PrismaModels.Param]
):

    # TODO: do something cleaner than stringifying everything
    str_params = {x: str(y) for x, y in params.items()}

    for param in spec:

        if param.required and param.key not in str_params:
            raise HTTPException(status_code=400, detail=f"{param.key} is required")

        if param.key in str_params:

            param_value = str_params[param.key]

            if param.type == ParamType.bigstring or param.type == ParamType.string:
                continue

            elif param.type == ParamType.date:
                try:
                    datetime.strptime(param_value, "%Y-%m-%d")
                except ValueError:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid date format for {param.key}. Expected YYYY-MM-DD",
                    )

            elif param.type == ParamType.datetime:
                try:
                    datetime.strptime(param_value, "%Y-%m-%dT%H:%M:%S")
                except ValueError:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid datetime format for {param.key}. Expected YYYY-MM-DDTHH:MM:SS",
                    )

            elif param.type == ParamType.integer:
                if not param_value.isdigit():
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid integer format for {param.key}.",
                    )

            elif param.type == ParamType.float:
                try:
                    float(param_value)
                except ValueError:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid float format for {param.key}.",
                    )

            elif param.type == ParamType.boolean:
                if not param_value in ["true", "false"]:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid boolean format for {param.key}. Expected true or false.",
                    )

    return False


class RunScriptInput(BaseModel):
    """
    Script run input
    """

    script_id: str
    params: Optional[Dict[str, Union[str, int, float, bool]]]


async def run_script_wrapper(
    script: RunScriptInput,
    schedule_id: Optional[str] = None,
    user_id: Optional[str] = None,
):
    build = await PrismaModels.Build.prisma().find_first(
        where={"script_id": script.script_id, "status": "success"},
        order={"updated_at": "desc"},
        include={"params": True, "script": True},
    )

    if build is None or build.status != "success":
        raise HTTPException(status_code=404, detail="No builds found")

    params = [] if build.params is None else build.params
    script_params = {} if script.params is None else script.params

    validate_params(script_params, params)

    run = await execute(
        build, script_params, schedule_id=schedule_id, executor_id=user_id
    )

    return run


@router.post("/script/run", operation_id="run_script", response_model=PrismaModels.Run)
async def run_script(
    script: RunScriptInput, user: PrismaModels.User = Depends(get_user)
):
    """
    Execute the latest build for a script.
    """
    await check_script_access(user.id, script.script_id)

    return await run_script_wrapper(script)


@router.get(
    "/script/list",
    operation_id="list_scripts",
    response_model=List[PrismaModels.Script],
)
async def list_scripts(workspace_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    List all scripts.
    """

    scripts = await PrismaModels.Script.prisma().find_many(
        order={"created_at": "desc"},
        where={
            "AND": [
                {
                    "workspace": {
                        "is": {"users": {"some": {"user_id": {"equals": user.id}}}}
                    }
                },
                {"workspace_id": workspace_id},
            ]
        },
    )

    return scripts


@router.get(
    "/script/get",
    operation_id="get_script",
    response_model=PrismaPartials.ScriptWithBuild,
)
async def get_script(script_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    Get a script.
    """

    await check_script_access(user.id, script_id)

    script = await PrismaModels.Script.prisma().find_unique(
        where={"id": script_id},
        include={
            "builds": {
                "take": 1,
                "order_by": {"updated_at": "desc"},
                "include": {"params": True},
            }
        },
    )

    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")

    return script


@router.get(
    "/script/builds",
    operation_id="get_script_builds",
    response_model=List[PrismaModels.Build],
)
async def get_script_builds(
    script_id: str, user: PrismaModels.User = Depends(get_user)
):
    """
    Get all builds for a script.
    """

    await check_script_access(user.id, script_id)

    builds = await PrismaModels.Build.prisma().find_many(
        where={"script_id": script_id}, order={"updated_at": "desc"}
    )

    return builds


@router.get(
    "/script/schedules",
    operation_id="get_script_schedules",
    response_model=List[PrismaModels.Schedule],
)
async def get_script_schedules(
    script_id: str, user: PrismaModels.User = Depends(get_user)
):
    """
    Get all schedules for a script.
    """

    await check_script_access(user.id, script_id)

    schedules = await PrismaModels.Schedule.prisma().find_many(
        where={"script_id": script_id}, order={"updated_at": "desc"}
    )

    # patch JSON serialization bug with Pydantic and Prisma
    for schedule in schedules:
        schedule.params = json.dumps(schedule.params)  # type: ignore

    return schedules


@router.get(
    "/script/runs",
    operation_id="get_script_runs",
    response_model=List[PrismaModels.Run],
)
async def get_script_runs(script_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    Get all runs for a script.
    """

    await check_script_access(user.id, script_id)

    runs = await PrismaModels.Run.prisma().find_many(
        where={"build": {"is": {"script_id": script_id}}},
        order={"updated_at": "desc"},
    )

    return runs


@router.delete(
    "/script/delete", operation_id="delete_script", response_model=PrismaModels.Script
)
async def delete_script(script_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    Delete a script.
    """

    await check_script_access(user.id, script_id)

    script = await PrismaModels.Script.prisma().delete(where={"id": script_id})

    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")

    return script
