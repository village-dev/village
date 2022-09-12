import logging
import os
import re
from typing import Any, Union

import prisma.models as PrismaModels
import prisma.partials as PrismaPartials
import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from prisma import Prisma
from prisma.enums import Role
from prisma.errors import UniqueViolationError
from prisma.partials import UserWithWorkspaces
from prisma.types import WorkspaceUsersCreateInput

from utils.auth import ParsedToken, VerifyToken
from utils.ids import propose_workspace_id_internal
from utils.logger import logger

router = APIRouter(prefix="/user", tags=["users"])

# Scheme for the Authorization header
token_auth_scheme = HTTPBearer()


async def verify_token(
    token: Any = Depends(token_auth_scheme),
) -> ParsedToken:
    try:
        result = VerifyToken(token.credentials).verify()
    except Exception as e:
        logging.debug(e)
        raise HTTPException(status_code=401, detail="Invalid token")

    return result


async def refresh_token(
    refresh_token: str,
) -> ParsedToken:
    try:
        result = VerifyToken(refresh_token).verify()
    except Exception as e:
        logging.debug(e)
        raise HTTPException(status_code=401, detail="Invalid token")

    return result


async def verify_token_with_auth0(
    token: Any = Depends(token_auth_scheme),
):
    """ """
    domain = os.getenv("AUTH0_DOMAIN", "https://your.domain.com/")
    r = requests.get(
        f"{domain}userinfo", headers={"Authorization": f"Bearer {token.credentials}"}
    )

    return r.json()


async def verify_token_with_create_user(
    token: Any = Depends(token_auth_scheme),
):
    """
    Get or create a user
    """
    try:
        result = VerifyToken(token.credentials).verify()
    except Exception as e:
        logging.debug(e)
        raise HTTPException(status_code=401, detail="Invalid token")

    uid = result["sub"]
    logger.debug(f"uid: {uid}")

    user = await PrismaModels.User.prisma().find_unique(
        where={"id": uid},
        include={
            "workspaces": {"include": {"workspace": True}},
        },
    )

    # if user exists and has a default workspace, return
    if user is not None and user.workspaces:
        return user

    # user-workspace creator
    workspace_name = "Default Workspace"
    workspace_id = await propose_workspace_id_internal(workspace_name)
    workspace_users_data: WorkspaceUsersCreateInput = {
        "role": Role.ADMIN,
        "user": {
            "connect": {
                "id": uid,
            }
        },
        "workspace": {
            "create": {
                "name": workspace_name,
                "id": workspace_id,
                "creator_id": uid,
            }
        },
    }

    # if user exists and has no workspaces, create one
    if user is not None and not user.workspaces:

        await PrismaModels.WorkspaceUsers.prisma().create(
            data=workspace_users_data,
        )
        user = await PrismaModels.User.prisma().find_unique(
            where={"id": uid},
            include={"workspaces": {"include": {"workspace": True}}},
        )
        return user

    # if user doesn't exist and has no workspaces, create both
    try:

        db = Prisma()
        await db.connect()

        async with db.batch_() as batcher:
            batcher.user.create(
                {
                    "id": uid,
                }
            )
            batcher.workspaceusers.create(workspace_users_data)

        await db.disconnect()

        user = await PrismaModels.User.prisma().find_unique(
            where={"id": uid},
            include={"workspaces": {"include": {"workspace": True}}},
        )
        return user
    except UniqueViolationError:
        raise HTTPException(status_code=400, detail="User with this id already exists")


async def get_user(
    token: Any = Depends(verify_token),
) -> UserWithWorkspaces:
    """
    Get user, fail if user DNE.
    """

    uid = token["sub"]

    logger.info(f"uid: {uid}")

    user: Union[
        UserWithWorkspaces, None
    ] = await PrismaModels.User.prisma().find_unique(  # type: ignore
        where={"id": uid},
        include={
            "workspaces": {"include": {"workspace": True}},
            "default_workspace": True,
        },
    )
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.post(
    "/create",
    operation_id="get_or_create_user",
    response_model=PrismaPartials.UserWithWorkspaces,
)
async def get_or_create_user(user: Any = Depends(verify_token_with_create_user)):
    return user


@router.get(
    "/get",
    operation_id="get_current_user",
    response_model=UserWithWorkspaces,
)
async def get_current_user(user: UserWithWorkspaces = Depends(get_user)):
    """
    Get a user.
    """

    return user
