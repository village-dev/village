import { setWorkspaces, warnUnauthenticated } from '@common/auth'
import { villageClient } from '@common/villageClient'
import { Command } from 'commander'
import inquirer from 'inquirer'
import { Workspace } from '../../api'

export const chooseWorkspace = (program: Command) => {
    program
        .command('workspace')
        .description('Choose workspace')
        .action(async function () {
            const debug: boolean = this.opts().debug

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
            }
        })
}