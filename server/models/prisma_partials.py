from prisma.models import Run, Schedule, Script, User

Run.create_partial(
    "RunWithBuilds",
    include={
        "id": True,
        "status": True,
        "created_at": True,
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
    },
)
Script.create_partial(
    "ScriptWithBuild",
    include={
        "id": True,
        "name": True,
        "created_at": True,
        "updated_at": True,
        "engine": True,
        "builds": True,
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