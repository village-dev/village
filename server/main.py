"""
Main routes
"""
import logging

import ujson
import yaml
from fastapi import APIRouter, FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prisma import Prisma

from config import ALLOWED_ORIGINS
from routers import builds, invites, runs, schedules, scripts, users, workspaces

tags_meta = [
    {
        "name": "scripts",
        "description": "Scripts",
    },
    {
        "name": "builds",
        "description": "Builds",
    },
    {
        "name": "runs",
        "description": "Runs",
    },
    {
        "name": "schedules",
        "description": "Schedules",
    },
    {
        "name": "users",
        "description": "Users",
    },
    {
        "name": "workspaces",
        "description": "Workspaces",
    },
    {
        "name": "invites",
        "description": "Invites",
    },
]

app = FastAPI(title="Village API", docs_url="/", openapi_tags=tags_meta)

prisma = Prisma(auto_register=True)


@app.on_event("startup")  # type: ignore
async def startup() -> None:
    await prisma.connect()


@app.on_event("shutdown")  # type: ignore
async def shutdown() -> None:
    if prisma.is_connected():
        await prisma.disconnect()


@app.exception_handler(RequestValidationError)  # type: ignore
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f"{exc}".replace("\n", " ").replace("   ", " ")
    logging.error(f"{request}: {exc_str}")
    content = {"status_code": 10422, "message": exc_str, "data": None}
    return JSONResponse(
        content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def add_router(router: APIRouter):
    app.include_router(router)


add_router(scripts.router)
add_router(builds.router)
add_router(runs.router)
add_router(schedules.router)
add_router(users.router)
add_router(workspaces.router)
add_router(invites.router)

openapi = app.openapi()

# write openapi.json
with open("../cli/openapi.json", "w", encoding="utf-8") as f:
    ujson.dump(openapi, f, indent=2)
with open("../frontend/openapi.json", "w", encoding="utf-8") as f:
    ujson.dump(openapi, f, indent=2)

# write openapi.yaml
with open("../docs/openapi.yaml", "w", encoding="utf-8") as f:
    yaml.dump(openapi, f, indent=2)
