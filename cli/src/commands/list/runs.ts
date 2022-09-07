import { warnUnauthenticated } from '@common/auth'
import { getTimeSince } from '@common/dates'
import { villageClient } from '@common/villageClient'
import Table from 'cli-table3'
import { Command } from 'commander'

export const runs = (program: Command) => {
    program
        .command('runs')
        .description('List script runs')
        .argument('id', 'The id of the script to list runs for.')
        .action(async function () {
            const id: string = program.args[1]
            const debug: boolean = this.opts().debug

            villageClient.scripts
                .getScriptRuns(id)
                .then((runs) => {
                    const table = new Table({
                        head: ['ID', 'Status', 'Created at'],
                    })
                    for (const run of runs) {
                        table.push([
                            run.id,
                            run.status,
                            getTimeSince(run.created_at),
                        ])
                    }
                    console.log(table.toString())
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
