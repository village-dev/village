import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { NoRunResults } from '@components/EmptyStates/NoRunResults'
import { NoRuns } from '@components/EmptyStates/NoRuns'
import { Table } from '@components/Table'
import { PageLoading } from '@pages/PageLoading'
import cronParser from 'cron-parser'
import cronstrue from 'cronstrue'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ScheduleWithScriptAndRuns } from '../../../api'

const RunRow: React.FC<{ data: Run }> = ({ data }) => {
    const run = data

    let trigger

    if (run.schedule !== undefined) {
        trigger = <span className="text-gray-500">Scheduled</span>
    } else if (run.created_by !== undefined) {
        trigger = <span className="text-gray-500">Manual</span>
    }

    return (
        <tr key={run.id}>
            <td className="py-4">
                <Link
                    to={`/app/runs/${run.id}`}
                    className="w-full py-4 pl-4 pr-8 hover:text-emerald-500"
                >
                    {run.id}
                </Link>
            </td>
            <td className="pl-4">{run.status}</td>
            <td className="pl-4">{getTimeSince(run.created_at)}</td>
            <td>{trigger}</td>
        </tr>
    )
}

const searchRunsFilter = ({ query, data }: { query: string; data: Run }) => {
    const run = data
    const script = run.build?.script

    return (
        script?.name.toLowerCase().includes(query.toLowerCase()) ||
        script?.id.toLowerCase().includes(query.toLowerCase()) ||
        run.status.toLowerCase().includes(query.toLowerCase())
    )
}

export const Runs: React.FC<{ runs: Run[] }> = ({ runs }) => {
    return (
        <div className="flex-col space-y-2">
            <Table
                loading={false}
                emptyState={<NoRuns />}
                noResultsState={<NoRunResults />}
                columnNames={['ID', 'Status', 'Updated', 'Trigger', '']}
                rowData={runs}
                RowRenderer={RunRow}
                searchFilter={searchRunsFilter}
            />
        </div>
    )
}

export const Schedule = () => {
    const { id } = useParams()
    const [schedule, setSchedule] = useState<ScheduleWithScriptAndRuns | null>(
        null
    )

    useEffect(() => {
        if (id === undefined) return
        if (schedule?.id === id) return

        VillageClient.schedules.getSchedule(id).then((s) => {
            setSchedule(s)
        })
    }, [id])

    if (schedule === null) {
        return <PageLoading />
    }

    const cron = `${schedule.minute} ${schedule.hour} ${schedule.day_of_month} ${schedule.month_of_year} ${schedule.day_of_week}`

    const interval = cronParser.parseExpression(cron)
    const nextRuns = []
    for (let i = 0; i < 3; i++) {
        nextRuns.push(interval.next())
    }
    const cronExpression = cronstrue.toString(cron)

    return (
        <div className="flex flex-col space-y-6 px-8 py-16">
            <div className="flex flex-col px-6">
                <h1 className="text-2xl">{schedule.name}</h1>
                <div className="py-2 font-semibold text-emerald-500">
                    {cronExpression}
                </div>
                <p>{schedule.description}</p>
                <h3 className="text-slate-600">
                    Created {getTimeSince(schedule.created_at)}
                </h3>
                Params:
                <pre>{JSON.stringify(schedule.params, null, 2)}</pre>
                <div className="py-2">
                    Next runs:
                    {nextRuns.map((r) => (
                        <div className="text-zinc-500">
                            {r.toDate().toLocaleString()}
                        </div>
                    ))}
                </div>
                <div>
                    <h1 className="text-xl">Runs</h1>
                    <div className="mt-4 w-full rounded-xl border bg-white p-3">
                        <Runs runs={schedule?.runs || []} />
                    </div>
                </div>
            </div>
        </div>
    )
}
