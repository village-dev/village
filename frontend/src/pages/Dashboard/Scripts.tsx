import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { VillageClient } from '@common/VillageClient'
import { Script } from '../../../api/models/Script'
import { getTimeSince } from '@common/dates'
import { useUserContext } from '@contexts/UserContext'
import { HiOutlineArrowRight } from 'react-icons/hi'
import { Table } from '@components/Table'

export const Scripts: React.FC = () => {
    const { user } = useUserContext()
    const [scripts, setScripts] = useState<Script[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.currentWorkspace) return
        VillageClient.scripts
            .listScripts(user?.currentWorkspace.workspace_id)
            .then((s) => {
                setScripts(s)
                setLoading(false)
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
                <div className="my-8 overflow-hidden shadow-sm">
                    <Table columnNames={['Name', 'Engine', 'Updated']}>
                        {scripts.map((script) => {
                            return (
                                <tr>
                                    <td className="py-4">
                                        <Link
                                            to={`/app/scripts/${script.id}`}
                                            className="w-full py-4 pl-4 pr-8 hover:text-emerald-500"
                                        >
                                            {script.name}
                                        </Link>
                                    </td>
                                    <td className="pl-4">
                                        {script.engine} {script.engine_version}
                                    </td>
                                    <td className="pl-4">
                                        {getTimeSince(script.updated_at)}
                                    </td>
                                </tr>
                            )
                        })}
                    </Table>
                </div>
            </div>
        </div>
    )
}
