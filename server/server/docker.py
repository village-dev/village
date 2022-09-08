import json
from datetime import datetime
from typing import Dict, Optional, Union

import docker  # type: ignore
from prisma import models as PrismaModels
from prisma.enums import Engine

docker_client = docker.from_env()  # type: ignore


async def execute(
    build: PrismaModels.Build,
    params: Dict[str, Union[str, int, float, bool]],
    schedule_id: Optional[str] = None,
    executor_id: Optional[str] = None,
):

    run = await PrismaModels.Run.prisma().create(
        {
            "build_id": build.id,
            "status": "pending",
            "output": "",
            "schedule_id": schedule_id,
            "creator_id": executor_id,
        }
    )

    if build.script is None:
        raise Exception

    output: str = ""

    if build.script.engine == Engine.Python:
        output = docker_client.containers.run(build.id, f"python shim.py '{json.dumps(params)}'").decode("utf-8")  # type: ignore

    elif build.script.engine == Engine.Node:
        output = docker_client.containers.run(build.id, f"node shim.js '{json.dumps(params)}'").decode("utf-8")  # type: ignore

    run = await PrismaModels.Run.prisma().update(
        {
            "output": output,
            "status": "success",
            "completed_at": datetime.now(),
        },
        where={"id": run.id},
    )

    return run