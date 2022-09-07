import { villageClient } from '@common/villageClient'
import { Command } from 'commander'
import Table from 'cli-table3'
import { getTimeSince } from '@common/dates'
import { warnUnauthenticated } from '@common/auth'

export const workspaces = (program: Command) => {
    program
        .command('workspaces')
        .description('List workspaces')
        .action(function () {
            const debug: boolean = this.opts().debug

            villageClient.workspace
                .listUserWorkspaces() // TODO: report if workspace is the default
                .then((workspaces) => {
                    const table = new Table({
                        head: ['ID', 'Name', 'Created at'],
                    })
                    for (const workspace of workspaces) {
                        table.push([
                            workspace.id,
                            workspace.name,
                            getTimeSince(workspace.created_at),
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
