import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { VillageClient } from '@common/VillageClient'
import { Script } from '../../../api/models/Script'
import { getTimeSince } from '@common/dates'
import { useUserContext } from '@contexts/UserContext'
import { HiOutlineArrowRight } from 'react-icons/hi'

export const Scripts: React.FC = () => {
    const { user } = useUserContext()
    const [scripts, setScripts] = useState<Script[]>([])

    useEffect(() => {
        if (!user?.currentWorkspace) return
        VillageClient.scripts
            .listScripts(user?.currentWorkspace.workspace_id)
            .then((s) => {
                setScripts(s)
            })
    }, [user?.currentWorkspace])

    return (
        <div className="flex flex-col space-y-6 px-8 py-16">
            <div className="flex space-x-6 px-6">
                <h1 className="text-2xl">Scripts</h1>{' '}
                <Link
                    to="/app/new-script"
                    className="flex items-center rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-600 hover:bg-slate-200"
                >
                    Create script <HiOutlineArrowRight className="ml-1" />
                </Link>
            </div>
            <div>
                <div className="flex-col space-y-2">
                    <div className="my-4 flex px-6 font-semibold">
                        <div className="w-96">
                            <h2>Script</h2>
                        </div>
                        <div className="w-32">
                            <h2>Created</h2>
                        </div>
                    </div>
                    {scripts.map((script) => {
                        return (
                            <Link
                                key={script.id}
                                to={script.id}
                                className="flex border-b-2 border-transparent px-6 hover:border-slate-200 hover:bg-slate-50"
                            >
                                <div className="w-96">
                                    <p>{script.name}</p>
                                </div>
                                <div className="w-32">
                                    <p>{getTimeSince(script.created_at)}</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
