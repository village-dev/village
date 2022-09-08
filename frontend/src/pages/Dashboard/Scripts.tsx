import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { Table } from '@components/Table'
import { useUserContext } from '@contexts/UserContext'
import React, { useEffect, useState } from 'react'
import { HiOutlineArrowRight } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { BarLoader } from 'react-spinners'
import { Script } from '../../../api/models/Script'

export const Scripts: React.FC = () => {
    const { user } = useUserContext()
    const [scripts, setScripts] = useState<Script[] | null>(null)

    useEffect(() => {
        if (!user?.currentWorkspace) return
        VillageClient.scripts
            .listScripts(user?.currentWorkspace.workspace_id)
            .then((s) => {
                setScripts(s)
            })
    }, [user?.currentWorkspace])

    let innerTable

    if (scripts === null) {
        innerTable = (
            <div className="mx-6 flex h-full flex-col items-center justify-center rounded-xl bg-gray-100">
                <h1 className="text-2xl font-semibold text-gray-700">
                    Loading...
                </h1>
                <div className="mt-12 w-64">
                    <BarLoader width="100%" color="rgb(107 114 128)" />
                </div>
            </div>
        )
    } else if (scripts.length === 0) {
        innerTable = (
            <div className="mx-6 flex h-full flex-col items-center justify-center rounded-xl bg-gray-100">
                <h1 className="text-2xl font-semibold">No scripts</h1>
                <p className="mt-8 text-gray-600">
                    Scripts can automate anything
                </p>
            </div>
        )
    } else {
        innerTable = (
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
        )
    }

    return (
        <div className="flex h-full flex-col space-y-6 px-8 py-16">
            <div className="flex space-x-6 px-6">
                <h1 className="text-2xl">Scripts</h1>{' '}
                <Link
                    to="/app/new-script"
                    className="flex items-center rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-200"
                >
                    Create script <HiOutlineArrowRight className="ml-1" />
                </Link>
            </div>
            <div className="flex-grow">{innerTable}</div>
        </div>
    )
}
