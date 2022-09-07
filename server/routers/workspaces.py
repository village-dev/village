from typing import List

import prisma.models as PrismaModels
from fastapi import APIRouter, Depends, HTTPException
from prisma.enums import Role

from routers.users import get_user

router = APIRouter(tags=["workspace"])


@router.post(
    "/workspace/create",
    operation_id="create_workspace",
    response_model=PrismaModels.Workspace,
)
async def create_workspace(name: str, user: PrismaModels.User = Depends(get_user)):
    """
    Create a workspace.
    """
    workspace = await PrismaModels.WorkspaceUsers.prisma().create(
        data={
            "workspace": {
                "create": {
                    "name": name,
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
    return workspace.workspace


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
