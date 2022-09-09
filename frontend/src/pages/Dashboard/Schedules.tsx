import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { Table } from '@components/Table'
import React, { useEffect, useState } from 'react'
import { HiOutlineArrowRight } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { BarLoader } from 'react-spinners'
import { ScheduleWithScript } from '../../../api'

export const Schedules: React.FC = () => {
    const [schedules, setSchedules] = useState<ScheduleWithScript[]>([])
    const [query, setQuery] = useState('')
    const [filteredSchedules, setFilteredSchedules] = useState<
        ScheduleWithScript[]
    >([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        VillageClient.schedules.listSchedules().then((s) => {
            setSchedules(s)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        setFilteredSchedules(
            schedules.filter((schedule) => {
                const script = schedule.script

                return (
                    script?.name.toLowerCase().includes(query.toLowerCase()) ||
                    script?.id.toLowerCase().includes(query.toLowerCase()) ||
                    schedule.name.toLowerCase().includes(query.toLowerCase())
                )
            })
        )
    }, [query, schedules])

    let innerTable

    if (loading) {
        innerTable = (
            <div className="mx-6 flex h-full flex-col items-center justify-center rounded-xl bg-gray-100">
                <h1 className="text-2xl font-semibold text-gray-700">
                    Loading...
                </h1>
                <div className="mt-12 w-64">
                    <BarLoader width="100%" color="rgb(107 114 128)" />
                </div>
            </div>
        )
    } else if (schedules.length === 0) {
        innerTable = (
            <div className="mx-6 flex h-full flex-col items-center justify-center rounded-xl bg-gray-100">
                <h1 className="text-2xl font-semibold">No schedules</h1>
                <p className="mt-8 text-gray-600">
                    Create a schedule to run a script at specific times
                </p>
            </div>
        )
    } else {
        let searchResults

        if (filteredSchedules.length === 0) {
            searchResults = (
                <tr>
                    <td colSpan={3} align="center" className="py-16 ">
                        <h1 className="text-lg font-semibold text-gray-400">
                            No schedules found
                        </h1>
                    </td>
                </tr>
            )
        } else {
            searchResults = schedules.map((schedule) => {
                return (
                    <tr>
                        <td className="py-4">
                            <Link
                                to={`/app/schedules/${schedule.id}`}
                                className="w-full py-4 pl-4 pr-8 hover:text-emerald-500"
                            >
                                {schedule.name}
                            </Link>
                        </td>
                        <td className="pl-4">
                            {schedule.minute} {schedule.hour}{' '}
                            {schedule.day_of_month} {schedule.month_of_year}{' '}
                            {schedule.day_of_week}
                        </td>
                        <td className="pl-4">
                            {getTimeSince(schedule.updated_at)}
                        </td>
                    </tr>
                )
            })
        }

        innerTable = (
            <>
                <div className="px-6">
                    <input
                        type="text"
                        onChange={(e) => {
                            setQuery(e.target.value)
                        }}
                        className=" mb-4 w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-gray-400 focus:outline-none"
                        placeholder="Search"
                    />
                </div>
                <div className="mx-6 mt-4">
                    <Table columnNames={['Name', 'Schedule', 'Updated']}>
                        {searchResults}
                    </Table>
                </div>
            </>
        )
    }

    return (
        <div className="flex h-full flex-col space-y-6 px-8 py-16">
            <div className="flex items-center space-x-6 px-6">
                <h1 className="text-2xl">Schedules</h1>{' '}
                <Link
                    to="/app/new/schedule"
                    className="flex items-center rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-200"
                >
                    Create schedule <HiOutlineArrowRight className="ml-1" />
                </Link>
            </div>
            <div className="h-full flex-grow">{innerTable}</div>
        </div>
    )
}
