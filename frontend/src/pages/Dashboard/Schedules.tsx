import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { Input } from '@components/Input'
import { ListDropdown } from '@components/ListDropdown'
import { Table } from '@components/Table'
import React, { useEffect, useState } from 'react'
import { HiOutlineArrowRight } from 'react-icons/hi'
import { MdDeleteOutline } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { ScheduleWithScript } from '../../../api'

const ScheduleRow: React.FC<{ data: ScheduleWithScript }> = ({ data }) => {
    const schedule = data

    return (
        <tr key={schedule.id}>
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

const NoSchedules: React.FC = () => {
    return (
        <div className="mx-6 flex h-full flex-col items-center justify-center rounded-xl bg-gray-100">
            <h1 className="text-2xl font-semibold">No schedules</h1>
            <p className="mt-8 text-gray-600">
                Create a schedule to run a script at specific times
            </p>
        </div>
    )
}

const NoResults: React.FC = () => {
    return (
        <h1 className="text-lg font-semibold text-gray-400">
            No schedules found
        </h1>
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
        <div className="flex h-full flex-col space-y-6 px-8 py-4">
            <div className="flex items-center space-x-6 px-6">
                <h1 className="text-2xl">Schedules</h1>{' '}
                <Link
                    to="/app/new/schedule"
                    className="flex items-center rounded-md bg-lightgreen px-3 py-1.5 text-sm font-semibold text-green hover:bg-emerald-200"
                >
                    Create schedule <HiOutlineArrowRight className="ml-1" />
                </Link>
            </div>
            <div className="h-full flex-grow px-6">
                <Table
                    loading={loading}
                    emptyState={<NoSchedules />}
                    noResultsState={<NoResults />}
                    columnNames={['Name', 'Schedule', 'Updated', '']}
                    rowData={schedules}
                    RowRenderer={ScheduleRow}
                    searchFilter={searchFilter}
                />
            </div>
        </div>
    )
}
