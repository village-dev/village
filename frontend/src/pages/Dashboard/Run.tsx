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
            <div className="flex flex-col px-6">
                <h1 className="text-2xl">{run.build?.script?.name}</h1>
                <h2>Build: {run.build?.id}</h2>
                <p>Output: {run.output}</p>
            </div>
        </>
    )
}
