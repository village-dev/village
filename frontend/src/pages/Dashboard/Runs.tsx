import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RunWithBuilds } from '../../../api'

export const Runs: React.FC = () => {
    const [runs, setRuns] = useState<RunWithBuilds[]>([])

    useEffect(() => {
        VillageClient.runs.listRuns().then((s) => {
            setRuns(s)
        })
    }, [])

    return (
        <div className="flex flex-col space-y-6 px-8 py-16">
            <div className="px-6">
                <h1 className="text-2xl">Runs</h1>
            </div>
            <div>
                <div className="flex-col space-y-2">
                    <div className="my-4 flex px-6 font-semibold">
                        <div className="w-64">
                            <h2>Script</h2>
                        </div>
                        <div className="w-96">
                            <h2>Status</h2>
                        </div>
                        <div className="w-32">
                            <h2>Time</h2>
                        </div>
                    </div>
                    {runs.map((run) => {
                        return (
                            <Link
                                key={run.id}
                                to={run.id}
                                className="flex border-b-2 border-transparent px-6 hover:border-slate-200 hover:bg-slate-50"
                            >
                                <div className="w-64">
                                    <p>{run.build?.script?.name}</p>
                                </div>
                                <div className="w-96">
                                    <p>{run.status}</p>
                                </div>
                                <div className="w-32">
                                    <p>{getTimeSince(run.created_at)}</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
