import { warnUnauthenticated } from '@common/auth'
import { villageClient } from '@common/villageClient'
import { Command } from 'commander'

export const remove = (program: Command) => {
    program
        .command('remove')
        .description('Remove a script')
        .argument('<id>', 'The id of the script to remove.')
        .action(async function () {
            const id: string = program.args[1]
            const debug: boolean = this.opts().debug

            villageClient.scripts
                .deleteScript(id)
                .then(() => {
                    console.log(`Removed script ${id}`)
                })
                .catch(warnUnauthenticated)
                .catch((err) => {
                    if (err.status === 404) {
                        console.log(`Script ${id} not found.`)
                    }

                    debug && console.error(err)
                })
        })
}
