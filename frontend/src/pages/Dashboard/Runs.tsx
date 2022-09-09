import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { Table } from '@components/Table'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarLoader } from 'react-spinners'
import { RunWithScript } from '../../../api'

export const Runs: React.FC = () => {
    const [runs, setRuns] = useState<RunWithScript[]>([])
    const [query, setQuery] = useState('')
    const [filteredRuns, setFilteredRuns] = useState<RunWithScript[]>([])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        VillageClient.runs.listRuns().then((s) => {
            setRuns(s)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        setFilteredRuns(
            runs.filter((run) => {
                const script = run.build?.script

                return (
                    script?.name.toLowerCase().includes(query.toLowerCase()) ||
                    script?.id.toLowerCase().includes(query.toLowerCase())
                )
            })
        )
    }, [query, runs])

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
    } else if (runs.length === 0) {
        innerTable = (
            <div className="mx-6 flex h-full flex-col items-center justify-center rounded-xl bg-gray-100">
                <h1 className="text-2xl font-semibold">No runs</h1>
                <p className="mt-8 text-gray-600">
                    Run scripts to see the results here
                </p>
            </div>
        )
    } else {
        let searchResults

        if (filteredRuns.length === 0) {
            searchResults = (
                <tr>
                    <td colSpan={3} align="center" className="py-16 ">
                        <h1 className="text-lg font-semibold text-gray-400">
                            No runs found
                        </h1>
                    </td>
                </tr>
            )
        } else {
            searchResults = filteredRuns.map((run) => {
                return (
                    <tr>
                        <td className="py-4">
                            <Link
                                to={`/app/runs/${run.id}`}
                                className="w-full py-4 pl-4 pr-8 hover:text-emerald-500"
                            >
                                {run.build?.script?.name}
                            </Link>
                        </td>
                        <td className="pl-4">{run.status}</td>
                        <td className="pl-4">{getTimeSince(run.created_at)}</td>
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
                    <Table columnNames={['Script', 'Status', 'Created']}>
                        {searchResults}
                    </Table>
                </div>
            </>
        )
    }

    return (
        <div className="flex h-full flex-col space-y-6 px-8 py-16">
            <div className="px-6">
                <h1 className="text-2xl">Runs</h1>
            </div>
            <div className="h-full flex-grow">{innerTable}</div>
        </div>
    )
}
