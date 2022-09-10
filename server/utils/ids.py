import re

import prisma.models as PrismaModels


async def propose_workspace_id_internal(name: str) -> str:
    """
    Propose a workspace ID from a name
    """
    # generate default id by replacing non-alphanumeric characters with underscores and lowercasing
    workspace_id = re.sub("[^0-9a-zA-Z]+", "_", name).lower()

    # if workspace with this id already exists, append a number to the id
    prefix_workspaces = await PrismaModels.Workspace.prisma().find_many(
        order={"id": "desc"}, where={"id": {"startswith": workspace_id + "_"}}
    )
    same_id = await PrismaModels.Workspace.prisma().find_unique(
        where={"id": workspace_id}
    )

    prefix_workspace_ids = [s.id[len(workspace_id) + 1 :] for s in prefix_workspaces]
    script_nums = [int(s) for s in prefix_workspace_ids if s.isnumeric()]
    next_num = None if not script_nums else max(script_nums) + 1

    if next_num is not None:
        workspace_id = f"{workspace_id}_{next_num}"

    else:
        if same_id is not None:
            workspace_id = f"{workspace_id}_1"

    return workspace_id


async def propose_script_id_internal(name: str) -> str:
    # generate default id by replacing non-alphanumeric characters with underscores and lowercasing
    script_id = re.sub("[^0-9a-zA-Z]+", "_", name).lower()

    # if script with this id already exists, append a number to the id
    prefix_scripts = await PrismaModels.Script.prisma().find_many(
        order={"id": "desc"}, where={"id": {"startswith": script_id + "_"}}
    )
    same_id = await PrismaModels.Script.prisma().find_unique(where={"id": script_id})

    prefix_script_ids = [s.id[len(script_id) + 1 :] for s in prefix_scripts]
    script_nums = [int(s) for s in prefix_script_ids if s.isnumeric()]
    next_num = None if not script_nums else max(script_nums) + 1

    if next_num is not None:
        script_id = f"{script_id}_{next_num}"

    else:
        if same_id is not None:
            script_id = f"{script_id}_1"

    return script_id
