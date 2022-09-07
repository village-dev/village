import asyncio
from datetime import timedelta
from typing import Optional

import requests
from temporalio import activity, workflow
from temporalio.client import Client
from temporalio.worker import Worker

from config import TEMPORAL_SERVER


@activity.defn
async def run_script(schedule_id: str):
    requests.post(
        f"http://localhost:8000/schedule/run?schedule_id={schedule_id}",
    )


@workflow.defn
class RunScript:
    @workflow.run
    async def run(self, name: str) -> Optional[str]:
        return await workflow.execute_activity(
            run_script, name, schedule_to_close_timeout=timedelta(seconds=5)
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
