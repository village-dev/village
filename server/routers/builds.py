import prisma.models as PrismaModels
from fastapi import APIRouter, Depends, HTTPException

from routers.scripts import check_script_access
from routers.users import get_user

router = APIRouter(tags=["builds"])


async def check_build_access(user_id: str, build_id: str):

    build = await PrismaModels.Build.prisma().find_unique(where={"id": build_id})

    if build is None:
        raise HTTPException(
            status_code=403, detail="You do not have access to this build"
        )

    try:
        await check_script_access(user_id, build.script_id)
    except HTTPException:
        # Intercept the exception and throw a new one
        raise HTTPException(
            status_code=403, detail="You do not have access to this build"
        )

    return


@router.get("/build/get", operation_id="get_build")
async def get_build(build_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    Get a build.
    """
    await check_build_access(user.id, build_id)

    build = await PrismaModels.Build.prisma().find_first(where={"id": build_id})

    if build is None:
        raise HTTPException(status_code=404, detail="Build not found")

    return build


@router.get("/build/list", operation_id="list_builds")
async def list_builds(user: PrismaModels.User = Depends(get_user)):
    """
    List all builds.
    """

    builds = await PrismaModels.Build.prisma().find_many(
        order={"created_at": "desc"},
        where={
            "script": {
                "is": {
                    "workspace": {
                        "is": {"users": {"some": {"user_id": {"equals": user.id}}}}
                    }
                }
            }
        },
    )

    return builds


@router.get("/build/runs", operation_id="get_build_runs")
async def get_build_runs(build_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    Get all runs for a build.
    """

    await check_build_access(user.id, build_id)

    runs = await PrismaModels.Run.prisma().find_many(where={"build_id": build_id})

    return runs


@router.delete(
    "/build/delete", operation_id="delete_build", response_model=PrismaModels.Build
)
async def delete_build(build_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    Delete a build.
    """
    await check_build_access(user.id, build_id)

    build = await PrismaModels.Build.prisma().delete(where={"id": build_id})

    return build
