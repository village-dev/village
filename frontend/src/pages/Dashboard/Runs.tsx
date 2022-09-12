import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { NoRunResults } from '@components/EmptyStates/NoRunResults'
import { NoRuns } from '@components/EmptyStates/NoRuns'
import { Table } from '@components/Table'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RunWithScript } from '../../../api'

const RunRow: React.FC<{ data: RunWithScript; idx: number }> = ({
    data,
    idx,
}) => {
    const run = data

    let trigger

    if (run.schedule !== null) {
        trigger = <span className="text-gray-500">Scheduled</span>
    } else if (run.created_by !== null) {
        trigger = <span className="text-gray-500">Manual</span>
    }

    console.log(run.schedule)

    return (
        <tr
            key={run.id}
            className={'hover:bg-lightgreen' + (idx % 2 ? ' bg-gray-50' : '')}
        >
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
            <td>{trigger}</td>
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
        <>
            <div className="px-6">
                <h1 className="text-2xl">Runs</h1>
            </div>
            <div className="mt-8 h-full flex-grow px-6">
                <Table
                    loading={loading}
                    emptyState={<NoRuns />}
                    noResultsState={<NoRunResults />}
                    columnNames={['Name', 'Schedule', 'Updated', '']}
                    rowData={runs}
                    RowRenderer={RunRow}
                    searchFilter={searchFilter}
                />
            </div>
        </>
    )
}
