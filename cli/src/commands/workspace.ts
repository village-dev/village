import { promptForCurrentWorkspace, writeFile } from '@common/auth'
import { WORKSPACES_FILE } from '@config'
import { Command } from 'commander'

export const chooseWorkspace = (program: Command) => {
    program
        .command('workspace')
        .description('Choose workspace')
        .action(async function () {
            const debug: boolean = this.opts().debug
            const { workspace, error } = await promptForCurrentWorkspace()
            debug && console.error(error)
            if (!workspace) return
            const writeFileCallback = () => {
                console.log('Default workspace updated')
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
