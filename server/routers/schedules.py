import json
from typing import Dict, List, Optional, Union, cast

import prisma.models as PrismaModels
import prisma.partials as PrismaPartials
from fastapi import APIRouter, Depends, HTTPException
from prisma.fields import Json
from pydantic import BaseModel
from temporalio.client import Client

from config import TEMPORAL_SERVER
from routers.scripts import RunScriptInput, check_script_access, run_script_wrapper
from routers.users import get_user
from worker import RunScript

router = APIRouter(tags=["schedules"])


class CreateScheduleInput(BaseModel):
    """
    Schedule creation model
    """

    script_id: str
    name: str
    description: Optional[str]
    params: Optional[Dict[str, str]]
    day_of_month: str
    day_of_week: str
    hour: str
    minute: str
    month_of_year: str


@router.post(
    "/schedule/create",
    operation_id="create_schedule",
    response_model=PrismaModels.Schedule,
)
async def create_schedule(
    schedule: CreateScheduleInput, user: PrismaModels.User = Depends(get_user)
):
    """
    Add a script schedule to the scheduler
    """

    await check_script_access(user.id, schedule.script_id)

    if schedule.params is None:
        schedule.params = {}

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
            "params": Json(schedule.params),
            "creator_id": user.id,
        }
    )

    # Create client connected to server at the given address
    client = await Client.connect(TEMPORAL_SERVER)

    # Execute a workflow
    await client.start_workflow(
        RunScript.run,
        db_schedule.id,
        id=db_schedule.id,
        task_queue="main-queue",
        cron_schedule=f"{schedule.minute} {schedule.hour} {schedule.day_of_month} {schedule.month_of_year} {schedule.day_of_week}",
    )

    db_schedule.params = json.dumps(db_schedule.params)  # type: ignore

    return db_schedule


class UpdateScheduleInput(BaseModel):
    """
    Schedule update model
    """

    params: Optional[Dict[str, str]]
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
    "/schedule/update",
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
            "params": Json(schedule.params),
        },
    )

    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found")

    return db_schedule


# TODO: create internal token for this call
@router.post(
    "/schedule/run", operation_id="run_schedule", response_model=PrismaModels.Run
)
async def run_schedule(schedule_id: str):
    """
    Execute a script based on its schedule entry
    """

    schedule = await PrismaModels.Schedule.prisma().find_unique(
        where={"id": schedule_id}
    )

    if schedule is None:
        raise HTTPException(status_code=404, detail="Script not found")

    # TODO: declare params type somewhere
    params = cast(Optional[Dict[str, Union[str, int, float, bool]]], schedule.params)

    run_inputs = RunScriptInput(script_id=schedule.script_id, params=params)

    run = await run_script_wrapper(run_inputs, schedule_id=schedule_id)

    return run


@router.get(
    "/schedule/list",
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
    for schedule in schedules:
        schedule.params = json.dumps(schedule.params)  # type: ignore

    return schedules


@router.delete(
    "/schedule/delete",
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
