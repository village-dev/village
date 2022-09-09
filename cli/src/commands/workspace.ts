<<<<<<< HEAD:cli/src/commands/workspaces.ts
import { promptForCurrentWorkspace, writeFile } from '@common/auth'
import { WORKSPACES_FILE } from '@config'
=======
import { setWorkspaces, warnUnauthenticated } from '@common/auth'
import { villageClient } from '@common/villageClient'
>>>>>>> 605b43b0905b554e3525b89a4b8e5f61ac47a7fd:cli/src/commands/workspace.ts
import { Command } from 'commander'

export const chooseWorkspace = (program: Command) => {
    program
        .command('workspace')
        .description('Choose workspace')
        .action(async function () {
            const debug: boolean = this.opts().debug
<<<<<<< HEAD:cli/src/commands/workspaces.ts
            const { workspace, error } = await promptForCurrentWorkspace()
            debug && console.error(error)
            if (!workspace) return
            const writeFileCallback = () => {
                console.log('Default workspace updated')
=======

            try {
                let workspaces: Workspace[] = []
                try {
                    workspaces =
                        await villageClient.workspace.listUserWorkspaces()
                } catch (error) {
                    await warnUnauthenticated(error)
                }

                inquirer
                    .prompt([
                        {
                            type: 'list',
                            name: 'workspace',
                            message: 'Choose a default workspace',
                            choices: workspaces.map((workspace) => ({
                                name: workspace.name,
                                value: workspace.id,
                            })),
                        },
                    ])
                    .then(async ({ workspace }: { workspace: string }) => {
                        const success =
                            await villageClient.workspace.setDefaultWorkspace(
                                workspace
                            )
                        success && console.log('Default workspace updated')

                        const defaultWorkspace = workspaces.find(
                            (w) => w.id === workspace
                        )

                        if (defaultWorkspace === undefined) {
                            throw new Error('Unable to set default workspace')
                        }

                        setWorkspaces({
                            workspaces: { defaultWorkspace },
                            debug,
                        })
                    })
                    .catch((err) => {
                        debug && console.error(err)
                    })
            } catch (error) {
                console.error(error)
>>>>>>> 605b43b0905b554e3525b89a4b8e5f61ac47a7fd:cli/src/commands/workspace.ts
            }

            await writeFile(
                WORKSPACES_FILE,
                JSON.stringify({
                    defaultWorkspace: workspace,
                }),
                writeFileCallback
            )
        })
}
