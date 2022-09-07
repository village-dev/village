import { warnUnauthenticated } from '@common/auth'
import { getTimeSince } from '@common/dates'
import { villageClient } from '@common/villageClient'
import Table from 'cli-table3'
import { Command } from 'commander'

export const builds = (program: Command) => {
    program
        .command('builds')
        .description('List script builds')
        .argument('id', 'The id of the script to list builds for.')
        .action(async function () {
            const id: string = program.args[1]
            const debug: boolean = this.opts().debug

            villageClient.scripts
                .getScriptBuilds(id)
                .then((builds) => {
                    const table = new Table({
                        head: ['ID', 'Status', 'Created at'],
                    })
                    for (const build of builds) {
                        table.push([
                            build.id,
                            build.status,
                            getTimeSince(build.created_at),
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
