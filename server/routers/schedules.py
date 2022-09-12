import json
import secrets
from typing import Dict, List, Optional, Union, cast

import prisma.models as PrismaModels
import prisma.partials as PrismaPartials
from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from prisma.fields import Json
from pydantic import BaseModel
from temporalio.client import Client

from config import TEMPORAL_SERVER
from models.params import ParamInputType
from routers.scripts import RunScriptInput, check_script_access, run_script_wrapper
from routers.users import get_user
from worker import RunScheduledInput, RunScript

router = APIRouter(prefix="/schedule", tags=["schedules"])


token_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_token(token: str):
    """
    Hash a token for storing.
    """
    return token_context.hash(token)


def verify_token(hashed_token: str, token: str):
    """
    Verify a stored token against one provided by schedule.
    """
    return token_context.verify(token, hashed_token)


class CreateScheduleInput(BaseModel):
    """
    Schedule creation model
    """

    script_id: str
    name: str
    description: Optional[str]
    params: ParamInputType
    day_of_month: str
    day_of_week: str
    hour: str
    minute: str
    month_of_year: str


@router.post(
    "/create",
    operation_id="create_schedule",
    response_model=PrismaModels.Schedule,
)
async def create_schedule(
    schedule: CreateScheduleInput, user: PrismaModels.User = Depends(get_user)
):
    """
    Add a script schedule to the scheduler
    """

    # TODO: Validate cron expression
    # TODO: partial for params

    await check_script_access(user.id, schedule.script_id)

    if schedule.params is None:
        schedule.params = {}

    token = secrets.token_hex(32)
    token_hash = hash_token(token)

    db_schedule = await PrismaModels.Schedule.prisma().create(
        {
            "script_id": schedule.script_id,
            "name": schedule.name,
            "description": schedule.description,
            "day_of_month": schedule.day_of_month,
            "day_of_week": schedule.day_of_week,
            "hour": schedule.hour,
            "minute": schedule.minute,
            "month_of_year": schedule.month_of_year,
            "params": {
                "create": [
                    {"key": key, "value": value}
                    for key, value in schedule.params.items()
                ]
            },
            "creator_id": user.id,
            "token_hash": token_hash,
        },
        include={"params": True},
    )

    # Create client connected to server at the given address
    client = await Client.connect(TEMPORAL_SERVER)

    # Execute a workflow
    try:
        await client.start_workflow(
            RunScript.run,
            RunScheduledInput(schedule_id=db_schedule.id, token=token),
            id=db_schedule.id,
            task_queue="main-queue",
            cron_schedule=f"{schedule.minute} {schedule.hour} {schedule.day_of_month} {schedule.month_of_year} {schedule.day_of_week}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return db_schedule


class UpdateScheduleInput(BaseModel):
    """
    Schedule update model
    """

    params: ParamInputType
    name: str
    description: Optional[str]
    day_of_month: str
    day_of_week: str
    hour: str
    minute: str
    month_of_year: str
    schedule_id: str


async def check_schedule_access(user_id: str, schedule_id: str):

    schedule = await PrismaModels.Schedule.prisma().find_unique(
        where={"id": schedule_id}
    )

    if schedule is None:
        raise HTTPException(
            status_code=403, detail="You do not have access to this schedule"
        )

    try:
        await check_script_access(user_id, schedule.script_id)
    except HTTPException:
        # Intercept the exception and throw a new one
        raise HTTPException(
            status_code=403, detail="You do not have access to this schedule"
        )

    return


@router.post(
    "/update",
    operation_id="update_schedule",
    response_model=PrismaModels.Schedule,
)
async def update_schedule(
    schedule: UpdateScheduleInput, user: PrismaModels.User = Depends(get_user)
):

    await check_schedule_access(user.id, schedule.schedule_id)

    if schedule.params is None:
        schedule.params = {}

    db_schedule = await PrismaModels.Schedule.prisma().update(
        where={"id": schedule.schedule_id},
        data={
            "name": schedule.name,
            "description": schedule.description,
            "day_of_month": schedule.day_of_month,
            "day_of_week": schedule.day_of_week,
            "hour": schedule.hour,
            "minute": schedule.minute,
            "month_of_year": schedule.month_of_year,
            "params": {
                "create": [
                    {"key": key, "value": value}
                    for key, value in schedule.params.items()
                ]
            },
        },
    )

    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found")

    return db_schedule


class RunScheduleInput(BaseModel):
    """
    Schedule run model
    """

    schedule_id: str
    token: str


@router.post("/run", operation_id="run_schedule", response_model=PrismaModels.Run)
async def run_schedule(schedule_request: RunScheduleInput):
    """
    Execute a script based on its schedule entry
    """

    schedule = await PrismaModels.Schedule.prisma().find_unique(
        where={"id": schedule_request.schedule_id},
        include={"params": True},
    )

    if schedule is None:
        raise HTTPException(status_code=404, detail="Script not found")

    if not verify_token(schedule.token_hash, schedule_request.token):
        raise HTTPException(status_code=403, detail="Invalid token")

    if schedule.params is None:
        schedule.params = []

    params_dict = {param.key: param.value for param in schedule.params}

    params = cast(Optional[Dict[str, Union[str, int, float, bool]]], params_dict)

    run_inputs = RunScriptInput(script_id=schedule.script_id, params=params)

    run = await run_script_wrapper(run_inputs, schedule_id=schedule.id)

    return run


@router.get(
    "/list",
    operation_id="list_schedules",
    response_model=List[PrismaPartials.ScheduleWithScript],
)
async def list_schedules(user: PrismaModels.User = Depends(get_user)):
    """
    List all schedules
    """

    schedules = await PrismaModels.Schedule.prisma().find_many(
        order={"created_at": "desc"},
        include={"script": True},
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

    return schedules


@router.delete(
    "/delete",
    operation_id="delete_schedule",
    response_model=PrismaModels.Schedule,
)
async def delete_schedule(
    schedule_id: str, user: PrismaModels.User = Depends(get_user)
):
    """
    Delete a script schedule from the scheduler
    """
    await check_schedule_access(user.id, schedule_id)

    schedule = await PrismaModels.Schedule.prisma().delete(where={"id": schedule_id})

    if schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found")

    return schedule


@router.get(
    "/get",
    operation_id="get_schedule",
    response_model=PrismaPartials.ScheduleWithScriptAndRuns,
)
async def get_schedule(schedule_id: str, user: PrismaModels.User = Depends(get_user)):
    """
    Get a script schedule from the scheduler
    """
    await check_schedule_access(user.id, schedule_id)

    schedule = await PrismaModels.Schedule.prisma().find_unique(
        where={"id": schedule_id}, include={"script": True, "runs": True}
    )

    if schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found")

    return schedule
