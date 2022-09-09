import { VillageClient } from '@common/VillageClient'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BeatLoader } from 'react-spinners'
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
        return (
            <div className="flex h-full w-full items-center justify-center">
                <BeatLoader color="rgb(52 211 153)" />
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6 px-8 py-16">
            <div className="flex flex-col px-6">
                <h1 className="text-2xl">{run.build?.script?.name}</h1>
                <h2>Build: {run.build?.id}</h2>
                <p>Output: {run.output}</p>
            </div>
        </div>
    )
}
