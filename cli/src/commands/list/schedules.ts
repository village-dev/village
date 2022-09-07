import { warnUnauthenticated } from '@common/auth'
import { getTimeSince } from '@common/dates'
import { villageClient } from '@common/villageClient'
import Table from 'cli-table3'
import { Command } from 'commander'

export const schedules = (program: Command) => {
    program
        .command('schedules')
        .description('List script schedules')
        .argument('id', 'The id of the script to list schedules for.')
        .action(async function () {
            const id: string = program.args[1]
            const debug: boolean = this.opts().debug

            villageClient.scripts
                .getScriptSchedules(id)
                .then((schedules) => {
                    const table = new Table({
                        head: ['ID', 'Schedule', 'Created at'],
                    })
                    for (const schedule of schedules) {
                        table.push([
                            schedule.id,
                            `${schedule.minute} ${schedule.hour} ${schedule.day_of_month} ${schedule.month_of_year} ${schedule.day_of_week}`,
                            getTimeSince(schedule.created_at),
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
