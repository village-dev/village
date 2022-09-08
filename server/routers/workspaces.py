import re
from typing import List, Optional

import prisma.models as PrismaModels
from fastapi import APIRouter, Depends, HTTPException
from prisma.enums import Role
from pydantic import BaseModel

from routers.users import get_user, verify_token
from utils.index import ParsedToken

router = APIRouter(tags=["workspace"])


@router.get("/workspaces/propose_id", operation_id="propose_id", response_model=str)
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


@router.get("/workspaces/check_id", operation_id="check_id", response_model=bool)
async def check_id(
    id: str,
    token: ParsedToken = Depends(verify_token),  # to require authentication
):
    """
    Check if a script ID is available.
    """

    workspace = await PrismaModels.Workspace.prisma().find_unique(where={"id": id})

    return workspace is None


class CreateWorkspaceInput(BaseModel):
    name: str
    id: Optional[str]


@router.post(
    "/workspace/create",
    operation_id="create_workspace",
    response_model=PrismaModels.Workspace,
)
async def create_workspace(
    workspace: CreateWorkspaceInput, user: PrismaModels.User = Depends(get_user)
):
    """
    Create a workspace.
    """

    if workspace.id is None or workspace.id == "":
        workspace.id = await propose_id(workspace.name)

    userWorkspace = await PrismaModels.WorkspaceUsers.prisma().create(
        data={
            "workspace": {
                "create": {
                    "id": workspace.id,
                    "name": workspace.name,
                    "creator_id": user.id,
                },
            },
            "user": {
                "connect": {
                    "id": user.id,
                },
            },
            "role": Role.ADMIN,
        },
        include={"workspace": True},
    )

    return userWorkspace.workspace


@router.get(
    "/workspace/get",
    operation_id="get_workspace",
    response_model=PrismaModels.Workspace,
)
async def get_workspace(workspace_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    Get a workspace.
    """

    workspace = await PrismaModels.Workspace.prisma().find_first(
        where={"id": workspace_id, "users": {"some": {"user_id": {"equals": user.id}}}}
    )
    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")

    return workspace


@router.get(
    "/workspace/list",
    operation_id="list_user_workspaces",
    response_model=List[PrismaModels.Workspace],
)
async def list_user_workspaces(user: PrismaModels.User = Depends(get_user)):
    """
    List all workspaces.
    """

    workspaces = await PrismaModels.Workspace.prisma().find_many(
        where={"users": {"some": {"user_id": {"equals": user.id}}}}
    )

    return workspaces


@router.post(
    "/workspace/set_default",
    operation_id="set_default_workspace",
    response_model=bool,
)
async def set_default_workspace(
    workspace_id: str, user: PrismaModels.User = Depends(get_user)
):
    """
    Set default workspace.
    """

    try:
        await PrismaModels.User.prisma().update(
            data={"default_workspace": {"connect": {"id": workspace_id}}},
            where={"id": user.id},
        )
    except Exception:
        return False

    return True
