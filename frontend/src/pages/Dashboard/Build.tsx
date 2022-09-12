import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { NoRunResults } from '@components/EmptyStates/NoRunResults'
import { NoRuns } from '@components/EmptyStates/NoRuns'
import { Table } from '@components/Table'
import { PageLoading } from '@pages/PageLoading'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BuildWithMeta, Run } from '../../../api'

const RunRow: React.FC<{ data: Run; idx: number }> = ({ data, idx }) => {
    const run = data

    let trigger

    if (run.schedule !== undefined) {
        trigger = <span className="text-gray-500">Scheduled</span>
    } else if (run.created_by !== undefined) {
        trigger = <span className="text-gray-500">Manual</span>
    }

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

export const Build = () => {
    const { id } = useParams()
    const [build, setBuild] = useState<BuildWithMeta | null>(null)

    useEffect(() => {
        if (id === undefined) return
        if (build?.id === id) return

        VillageClient.builds.getBuild(id).then((s) => {
            setBuild(s)
        })
    }, [id])

    if (build === null) {
        return <PageLoading />
    }

    return (
        <>
            <h1>{build.id}</h1>
            <h1>{build.status}</h1>
            <h1>{build.script?.name}</h1>
            <h1>{build.created_at}</h1>
            <h1>{build.updated_at}</h1>
            <h1>{build.completed_at}</h1>
            <h1>Runs</h1>
            <div className="mt-4 w-full rounded-xl border bg-white p-3">
                <Runs runs={build.runs ?? []} />
            </div>
        </>
    )
}
