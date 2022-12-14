import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { NoScheduleResults } from '@components/EmptyStates/NoScheduleResults'
import { NoSchedules } from '@components/EmptyStates/NoSchedules'
import { ListDropdown } from '@components/ListDropdown'
import { Table } from '@components/Table'
import { toNewSchedule } from '@utils/links'
import React, { useEffect, useState } from 'react'
import { HiOutlineArrowRight } from 'react-icons/hi'
import { MdDeleteOutline } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { ScheduleWithScript } from '../../../api'

const ScheduleRow: React.FC<{ data: ScheduleWithScript; idx: number }> = ({
    data,
    idx,
}) => {
    const schedule = data

    return (
        <tr
            key={schedule.id}
            className={'hover:bg-lightgreen' + (idx % 2 ? ' bg-gray-50' : '')}
        >
            <td className="py-4">
                <Link
                    to={`/app/schedules/${schedule.id}`}
                    className="w-full py-4 pl-4 pr-8 hover:text-emerald-500"
                >
                    {schedule.name}
                </Link>
            </td>
            <td className="pl-4">
                {schedule.minute} {schedule.hour} {schedule.day_of_month}{' '}
                {schedule.month_of_year} {schedule.day_of_week}
            </td>
            <td className="pl-4">{getTimeSince(schedule.updated_at)}</td>
            <td>
                <ListDropdown
                    options={[
                        {
                            id: 'delete',
                            name: 'Delete',
                            icon: <MdDeleteOutline className="mr-2 text-xl" />,
                            handler: () => {
                                // TODO: Delete schedule
                                console.log('Delete')
                            },
                        },
                    ]}
                />
            </td>
        </tr>
    )
}
const searchFilter = ({
    query,
    data,
}: {
    query: string
    data: ScheduleWithScript
}) => {
    const schedule = data
    const script = schedule.script

    return (
        script?.name.toLowerCase().includes(query.toLowerCase()) ||
        script?.id.toLowerCase().includes(query.toLowerCase()) ||
        schedule.name.toLowerCase().includes(query.toLowerCase())
    )
}

export const Schedules: React.FC = () => {
    const [schedules, setSchedules] = useState<ScheduleWithScript[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        VillageClient.schedules.listSchedules().then((s) => {
            setSchedules(s)
            setLoading(false)
        })
    }, [])

    return (
        <>
            <div className="flex items-center space-x-6 px-6">
                <h1 className="text-2xl">Schedules</h1>{' '}
                <Link
                    to={toNewSchedule}
                    className="flex items-center rounded-md bg-lightgreen px-3 py-1.5 text-sm font-semibold text-green hover:bg-emerald-200"
                >
                    Create schedule <HiOutlineArrowRight className="ml-1" />
                </Link>
            </div>
            <div className="mt-8 h-full flex-grow px-6">
                <Table
                    loading={loading}
                    emptyState={<NoSchedules />}
                    noResultsState={<NoScheduleResults />}
                    columnNames={['Name', 'Schedule', 'Updated', '']}
                    rowData={schedules}
                    RowRenderer={ScheduleRow}
                    searchFilter={searchFilter}
                />
            </div>
        </>
    )
}
