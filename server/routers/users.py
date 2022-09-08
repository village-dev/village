import logging
import re
from typing import Any, Union

import prisma.models as PrismaModels
import prisma.partials as PrismaPartials
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from prisma import Prisma
from prisma.enums import Role
from prisma.errors import UniqueViolationError
from prisma.partials import UserWithWorkspaces

from utils.auth import ParsedToken, VerifyToken
from utils.logger import logger

router = APIRouter(tags=["user"])

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


async def get_user(
    token: Any = Depends(token_auth_scheme),
) -> UserWithWorkspaces:
    """
    Create a private script.
    """
    try:
        result = VerifyToken(token.credentials).verify()
    except Exception as e:
        logging.debug(e)
        raise HTTPException(status_code=401, detail="Invalid token")

    uid = result["sub"]

    logger.debug(f"uid: {uid}")

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
    "/user/create",
    operation_id="create_user",
    response_model=PrismaPartials.UserWithWorkspaces,
)
async def create_user(user_id: str):
    """
    Create a user.
    """

    workspace_name = "Default Workspace"

    # generate default id by replacing non-alphanumeric characters with underscores and lowercasing
    workspace_id = re.sub("[^0-9a-zA-Z]+", "_", workspace_name).lower()

    # if script with this id already exists, append a number to the id
    prefix_scripts = await PrismaModels.Workspace.prisma().find_many(
        order={"id": "desc"}, where={"id": {"startswith": workspace_id + "_"}}
    )
    same_id = await PrismaModels.Workspace.prisma().find_unique(
        where={"id": workspace_id}
    )

    prefix_script_ids = [s.id[len(workspace_id) + 1 :] for s in prefix_scripts]
    script_nums = [int(s) for s in prefix_script_ids if s.isnumeric()]
    next_num = None if not script_nums else max(script_nums) + 1

    if next_num is not None:

        workspace_id = f"{workspace_id}_{next_num}"

    else:
        if same_id is not None:
            workspace_id = f"{workspace_id}_1"

    try:

        db = Prisma()
        await db.connect()

        async with db.batch_() as batcher:
            batcher.user.create(
                {
                    "id": user_id,
                }
            )
            batcher.workspaceusers.create(
                {
                    "role": Role.ADMIN,
                    "user": {
                        "connect": {
                            "id": user_id,
                        }
                    },
                    "workspace": {
                        "create": {
                            "name": "Default Workspace",
                            "id": workspace_id,
                            "creator_id": user_id,
                            "default_of": {  # type: ignore
                                "connect": {"id": user_id},
                            },
                        }
                    },
                }
            )

        await db.disconnect()

        user = await PrismaModels.User.prisma().find_unique(
            where={"id": user_id},
            include={"workspaces": {"include": {"workspace": True}}},
        )
        return user
    except UniqueViolationError:
        raise HTTPException(status_code=400, detail="User with this id already exists")


@router.get(
    "/users/get",
    operation_id="get_current_user",
    response_model=UserWithWorkspaces,
)
async def get_current_user(user: UserWithWorkspaces = Depends(get_user)):
    """
    Get a user.
    """

    return user
