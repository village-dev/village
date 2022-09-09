import asyncio
import json
from collections import namedtuple
from dataclasses import dataclass
from datetime import timedelta
from typing import Optional

import requests
from temporalio import activity, workflow
from temporalio.client import Client
from temporalio.worker import Worker

from config import TEMPORAL_SERVER


@dataclass
class RunScheduledInput:
    schedule_id: str
    token: str


@activity.defn
async def run_script(schedule: RunScheduledInput):
    res = requests.post(
        "http://localhost:8000/schedule/run",
        data=json.dumps({"schedule_id": schedule.schedule_id, "token": schedule.token}),
        headers={"Content-type": "application/json", "Accept": "text/plain"},
    )

    return res.text


@workflow.defn
class RunScript:
    @workflow.run
    async def run(self, schedule: RunScheduledInput) -> Optional[str]:
        return await workflow.execute_activity(
            run_script, schedule, schedule_to_close_timeout=timedelta(seconds=5)
        )


async def main():
    # Create client connected to server at the given address
    client = await Client.connect(TEMPORAL_SERVER)

    # Run the worker
    worker = Worker(
        client, task_queue="main-queue", workflows=[RunScript], activities=[run_script]
    )
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
