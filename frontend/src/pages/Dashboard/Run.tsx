import { getDuration, getFormattedDateTime, getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { PageLoading } from '@pages/PageLoading'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { RunWithScriptDetailed } from '../../../api'

export const Run = () => {
    const { id } = useParams()
    const [run, setRun] = useState<RunWithScriptDetailed | null>(null)

    useEffect(() => {
        if (id === undefined) return
        if (run?.id === id) return

        VillageClient.runs.getRun(id).then((s) => {
            setRun(s)
        })
    }, [id])

    if (run === null) {
        return <PageLoading />
    }

    return (
        <>
            <h1 className="text-2xl">{run.build?.script?.name}</h1>

            <div className="mt-4 max-w-max rounded-lg border p-4">
                <h2>
                    <span className="font-semibold">Created</span>{' '}
                    {getFormattedDateTime(run.created_at)} (
                    {getTimeSince(run.created_at)})
                </h2>

                {run.completed_at && (
                    <>
                        <h2 className="mt-2">
                            <span className="font-semibold text-green">
                                Finished
                            </span>{' '}
                            {getFormattedDateTime(run.completed_at)} (
                            {getTimeSince(run.completed_at)})
                        </h2>
                        <h2 className="mt-2">
                            <span className="font-semibold">Duration:</span>{' '}
                            {getDuration(run.completed_at, run.created_at)}
                        </h2>
                    </>
                )}
            </div>

            <h2 className="mt-8 text-lg">Output</h2>
            <div>
                <pre className="mt-4 rounded-lg bg-gray-50 p-4">
                    {run.output}
                </pre>
            </div>
        </>
    )
}
