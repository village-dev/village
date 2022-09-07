import { warnUnauthenticated } from '@common/auth'
import { getTimeSince } from '@common/dates'
import { villageClient } from '@common/villageClient'
import Table from 'cli-table3'
import { Command } from 'commander'

export const scripts = (program: Command) => {
    program
        .command('scripts')
        .description('List scripts')
        .argument('<workspace>', 'Workspace to list scripts from')
        .action(async function () {
            const workspace = program.args[1]
            const debug: boolean = this.opts().debug

            villageClient.scripts
                .listScripts(workspace) // TODO: set workspace ID here
                .then((scripts) => {
                    const table = new Table({
                        head: ['ID', 'Name', 'Engine', 'Created at'],
                    })
                    for (const script of scripts) {
                        table.push([
                            script.id,
                            script.name,
                            script.engine,
                            getTimeSince(script.created_at),
                        ])
                    }
                    console.log(table.toString())
                })
                .catch(warnUnauthenticated)
                .catch((err) => {
                    debug && console.error(err)
                })
        })
}
