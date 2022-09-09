from typing import List

import prisma.models as PrismaModels
import prisma.partials as PrismaPartials
from fastapi import APIRouter, Depends, HTTPException

from routers.scripts import check_script_access
from routers.users import get_user

router = APIRouter(tags=["runs"])


@router.get(
    "/run/list",
    operation_id="list_runs",
    response_model=List[PrismaPartials.RunWithScript],
)
async def list_runs(user: PrismaModels.User = Depends(get_user)):
    """
    List all runs.
    """

    runs = await PrismaModels.Run.prisma().find_many(
        order={"created_at": "desc"},
        include={"build": {"include": {"script": True}}},
        where={
            "build": {
                "is": {
                    "script": {
                        "is": {
                            "workspace": {
                                "is": {
                                    "users": {"some": {"user_id": {"equals": user.id}}}
                                }
                            }
                        }
                    }
                }
            }
        },
    )

    return runs


async def check_run_access(user_id: str, run_id: str):

    run = await PrismaModels.Run.prisma().find_unique(
        where={"id": run_id}, include={"build": True}
    )

    if run is None or run.build is None:
        raise HTTPException(
            status_code=403, detail="You do not have access to this run"
        )

    try:
        await check_script_access(user_id, run.build.script_id)
    except HTTPException:
        # Intercept the exception and throw a new one
        raise HTTPException(
            status_code=403, detail="You do not have access to this run"
        )

    return


@router.get(
    "/run/get", operation_id="get_run", response_model=PrismaPartials.RunWithScript
)
async def get_run(run_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    Get a run.
    """

    await check_run_access(user.id, run_id)

    run = await PrismaModels.Run.prisma().find_unique(
        where={"id": run_id},
        include={"build": {"include": {"script": True}}},
    )

    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")

    return run


@router.delete(
    "/run/delete", operation_id="delete_run", response_model=PrismaModels.Run
)
async def delete_run(run_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    Delete a run.
    """

    await check_run_access(user.id, run_id)

    run = await PrismaModels.Run.prisma().delete(where={"id": run_id})

    return run
