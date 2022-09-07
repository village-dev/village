import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScheduleWithScript } from '../../../api'

export const Schedules: React.FC = () => {
    const [schedules, setSchedules] = useState<ScheduleWithScript[]>([])

    useEffect(() => {
        VillageClient.schedules.listSchedules().then((s) => {
            setSchedules(s)
        })
    }, [])

    return (
        <div className="flex flex-col space-y-6 px-8 py-16">
            <div className="flex space-x-6 px-6">
                <h1 className="text-2xl">Schedules</h1>{' '}
                <Link
                    to="/app/new-schedule"
                    className="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200"
                >
                    Create Schedule
                </Link>
            </div>
            <div>
                <div className="flex-col space-y-2">
                    <div className="my-4 flex px-6 font-semibold">
                        <div className="w-96">
                            <h2>Script</h2>
                        </div>
                        <div className="w-32">
                            <h2>Schedule</h2>
                        </div>
                        <div className="w-32">
                            <h2>Created</h2>
                        </div>
                    </div>
                    {schedules.map((schedule) => {
                        return (
                            <Link
                                key={schedule.id}
                                to={schedule.id}
                                className="flex border-b-2 border-transparent px-6 hover:border-slate-200 hover:bg-slate-50"
                            >
                                <div className="w-96">
                                    <p>{schedule.script?.name}</p>
                                </div>
                                <div className="w-32">
                                    <p>
                                        {schedule.minute} {schedule.hour}{' '}
                                        {schedule.day_of_month}{' '}
                                        {schedule.month_of_year}{' '}
                                        {schedule.day_of_week}
                                    </p>
                                </div>
                                <div className="w-32">
                                    <p>{getTimeSince(schedule.created_at)}</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
