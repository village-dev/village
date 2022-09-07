import { getTokens, warnUnauthenticated } from '@common/auth'
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
            const tokens = await getTokens({ debug })
            const { access_token } = tokens

            try {
                villageClient.request.config.HEADERS = {
                    Authorization: `Bearer ${access_token}`,
                }
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
                    .then(async ({ workspace }) => {
                        const success =
                            await villageClient.workspace.setDefaultWorkspace(
                                workspace
                            )
                        success && console.log('Default workspace updated')
                    })
                    .catch((err) => {
                        debug && console.error(err)
                    })
            } catch (error) {
                console.error(error)
            }
        })
}
