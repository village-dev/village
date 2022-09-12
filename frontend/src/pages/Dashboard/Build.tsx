import { VillageClient } from '@common/VillageClient'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BeatLoader } from 'react-spinners'
import { Build as BuildType } from '../../../api'

export const Build = () => {
    const { id } = useParams()
    const [build, setBuild] = useState<BuildType | null>(null)

    useEffect(() => {
        if (id === undefined) return
        if (build?.id === id) return

        VillageClient.builds.getBuild(id).then((s) => {
            setBuild(s)
        })
    }, [id])

    if (build === null) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <BeatLoader color="rgb(52 211 153)" />
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6 px-8 py-16">
            <h1>{build.id}</h1>
            <h1>{build.status}</h1>
            <h1>{build.script_id}</h1>
            <h1>{build.created_at}</h1>
            <h1>{build.updated_at}</h1>
            <h1>{build.completed_at}</h1>
        </div>
    )
}
