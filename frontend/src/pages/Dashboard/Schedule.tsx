import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BeatLoader } from 'react-spinners'
import { ScheduleWithScriptAndRuns } from '../../../api'
import cronParser from 'cron-parser'
import cronstrue from 'cronstrue'

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
        return (
            <div className="flex h-full w-full items-center justify-center">
                <BeatLoader color="rgb(52 211 153)" />
            </div>
        )
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
                    {(schedule.runs ?? []).map((run) => (
                        <div className="flex flex-row space-x-4">
                            <div className="w-32">
                                <p>{run.id}</p>
                                <p>{run.status}</p>
                            </div>
                            <div className="w-32">
                                <p>{getTimeSince(run.created_at)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
