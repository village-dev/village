import { Command } from 'commander'
import { runs } from '@commands/list/runs'
import { builds } from './builds'
import { scripts } from './scripts'
import { schedules } from './schedules'
import { workspaces } from './workspaces'

export const list = (program: Command) => {
    const list = program.command('list')
    runs(list)
    builds(list)
    scripts(list)
    schedules(list)
    workspaces(list)
}
