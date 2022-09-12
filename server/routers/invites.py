import prisma.models as PrismaModels
from fastapi import APIRouter, Depends, HTTPException
from prisma.enums import Role

from routers.schedules import hash_token, verify_token
from routers.scripts import check_workspace_access
from routers.users import get_user, verify_token_with_auth0

router = APIRouter(tags=["invites"])


@router.post(
    "/invites/create",
    operation_id="create_invite",
    response_model=str,
)
async def create_invite(
    email: str,
    workspace_id: str,
    role: Role,
    user: PrismaModels.User = Depends(get_user),
):
    """
    Create an invite for a user
    """

    await check_workspace_access(user.id, workspace_id)

    token_hash = hash_token(email)

    try:
        invite = await PrismaModels.Invites.prisma().create(
            data={
                "hash": token_hash,
                "workspace_id": workspace_id,
                "role": role,
            }
        )
        return invite.id
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create invite")


@router.get(
    "/invites/get",
    operation_id="get_invite",
    response_model=str,
)
async def get_invite(invite_id: str, user=Depends(verify_token_with_auth0)):
    """
    Get an invite for a user
    """

    invite = await PrismaModels.Invites.prisma().find_unique(where={"id": invite_id})

    if invite is None:
        raise HTTPException(status_code=404, detail="Invite not found")

    if not verify_token(invite.hash, user["email"]):
        raise HTTPException(status_code=403, detail="Invalid invite")

    workspaceUser = await PrismaModels.WorkspaceUsers.prisma().create(
        data={
            "workspace": {
                "connect": {
                    "id": invite.workspace_id,
                },
            },
            "user": {
                "connect": {
                    "id": user["sub"],
                },
            },
            "role": invite.role,
        },
        include={"workspace": True},
    )

    return workspaceUser.workspace.name if workspaceUser.workspace else ""
