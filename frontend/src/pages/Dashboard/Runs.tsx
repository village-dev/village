import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { Table } from '@components/Table'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RunWithScript } from '../../../api'

const NoRuns: React.FC = () => {
    return (
        <div className="mx-6 mt-10 flex h-full flex-col items-center justify-center rounded-xl bg-gray-50 py-8 px-8">
            <h1 className="text-2xl font-semibold">No runs yet!</h1>
            <p className="text-md mt-8 text-gray-600">
                Run scripts to see your results here.
            </p>
        </div>
    )
}

const NoResults: React.FC = () => {
    return (
        <tr>
            <td colSpan={3} align="center" className="py-16 ">
                <h1 className="text-lg font-semibold text-gray-400">
                    No runs found
                </h1>
            </td>
        </tr>
    )
}

const RunRow: React.FC<{ data: RunWithScript }> = ({ data }) => {
    const run = data
    return (
        <tr key={run.id}>
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
}

const searchFilter = ({
    query,
    data,
}: {
    query: string
    data: RunWithScript
}) => {
    const run = data
    const script = run.build?.script

    return (
        script?.name.toLowerCase().includes(query.toLowerCase()) ||
        script?.id.toLowerCase().includes(query.toLowerCase()) ||
        run.status.toLowerCase().includes(query.toLowerCase())
    )
}

export const Runs: React.FC = () => {
    const [runs, setRuns] = useState<RunWithScript[]>([])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        VillageClient.runs.listRuns().then((s) => {
            setRuns(s)
            setLoading(false)
        })
    }, [])

    return (
        <div className="flex h-full flex-col space-y-6 px-8 py-4">
            <div className="px-6">
                <h1 className="text-2xl">Runs</h1>
            </div>
            <div className="h-full flex-grow px-6">
                <Table
                    loading={loading}
                    emptyState={<NoRuns />}
                    noResultsState={<NoResults />}
                    columnNames={['Name', 'Schedule', 'Updated', '']}
                    rowData={runs}
                    RowRenderer={RunRow}
                    searchFilter={searchFilter}
                />
            </div>
        </div>
    )
}
