from prisma.models import Run, Schedule, Script, User

Run.create_partial(
    "RunWithScript",
    include={
        "id": True,
        "status": True,
        "created_at": True,
        "build": {"include": {"script": True}},
    },
)
Run.create_partial(
    "RunWithScriptDetailed",
    include={
        "id": True,
        "status": True,
        "created_at": True,
        "output": True,
        "build": {"include": {"script": True}},
    },
)
Schedule.create_partial(
    "ScheduleWithScript",
    include={
        "id": True,
        "name": True,
        "created_at": True,
        "updated_at": True,
        "script": True,
        "minute": True,
        "hour": True,
        "day_of_month": True,
        "month_of_year": True,
        "day_of_week": True,
        "description": True,
        "params": True,
    },
)
Schedule.create_partial(
    "ScheduleWithScriptAndRuns",
    include={
        "id": True,
        "name": True,
        "created_at": True,
        "updated_at": True,
        "script": True,
        "description": True,
        "minute": True,
        "hour": True,
        "day_of_month": True,
        "month_of_year": True,
        "day_of_week": True,
        "runs": True,
        "params": True,
    },
)
Script.create_partial(
    "ScriptWithMeta",
    include={
        "id": True,
        "name": True,
        "created_at": True,
        "updated_at": True,
        "engine": True,
        "builds": True,
        "runs": True,
        "schedules": True,
        "engine_version": True,
        "description": True,
        "workspace_id": True,
    },
)
User.create_partial(
    "UserWithWorkspaces",
    include={
        "id": True,
        "created_at": True,
        "updated_at": True,
        "workspaces": True,
        "default_workspace": True,
    },
)
