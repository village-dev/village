"""
Main routes
"""
import logging

import ujson
import yaml
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prisma import Prisma

from config import ALLOWED_ORIGINS
from routers import builds, runs, schedules, scripts, slack, users, workspaces

app = FastAPI(title="Village API", docs_url="/")

prisma = Prisma(auto_register=True)


@app.on_event("startup")  # type: ignore
async def startup() -> None:
    # logging.getLogger("uvicorn").handlers.clear()
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

app.include_router(scripts.router)
app.include_router(builds.router)
app.include_router(runs.router)
app.include_router(schedules.router)
app.include_router(users.router)
app.include_router(workspaces.router)
app.include_router(slack.router)

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
]


openapi = app.openapi()

# write openapi.json
with open("../cli/openapi.json", "w", encoding="utf-8") as f:
    ujson.dump(openapi, f, indent=2)
with open("../frontend/openapi.json", "w", encoding="utf-8") as f:
    ujson.dump(openapi, f, indent=2)

# write openapi.yaml
with open("../docs/openapi.yaml", "w", encoding="utf-8") as f:
    yaml.dump(openapi, f, indent=2)
