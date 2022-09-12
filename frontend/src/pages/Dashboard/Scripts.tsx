import { getFormattedDate } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { NoScriptResults } from '@components/EmptyStates/NoScriptResults'
import { NoScripts } from '@components/EmptyStates/NoScripts'
import { Table } from '@components/Table'
import { useUserContext } from '@contexts/UserContext'
import { toNewScript } from '@utils/links'
import React, { useEffect, useState } from 'react'
import { HiOutlineArrowRight, HiOutlineLink } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { Script } from '../../../api/models/Script'

const ScriptRow: React.FC<{ data: Script; idx: number }> = ({ data, idx }) => {
    const script = data
    return (
        <tr
            key={script.id}
            className={'hover:bg-lightgreen' + (idx % 2 ? ' bg-gray-50' : '')}
        >
            <td className="group">
                <Link to={`/app/scripts/${script.id}`}>
                    <div className="h-full w-full truncate py-4 pl-4 pr-8">
                        <span className="font-medium text-black group-hover:text-green">
                            {script.name}
                        </span>
                        <span className="pl-8 text-gray-500 group-hover:text-green">
                            {script.description}
                        </span>
                    </div>
                </Link>
            </td>
            <td className="pl-4 text-gray-500">
                {getFormattedDate(script.updated_at)}
            </td>
            <td className="rounded-r-md pl-4 text-gray-500">
                {script.engine} {script.engine_version}
            </td>
            <td>
                <button
                    className="grid h-8 w-8 place-items-center rounded-md hover:bg-white"
                    onClick={() => {
                        navigator.clipboard.writeText(
                            window.location.origin + `/app/scripts/${script.id}`
                        )
                    }}
                >
                    <HiOutlineLink className="h-4 w-4 text-gray-500" />
                </button>
            </td>
        </tr>
    )
}

const searchFilter = ({ query, data }: { query: string; data: Script }) => {
    const script = data
    return (
        script.name.toLowerCase().includes(query.toLowerCase()) ||
        script.id.toLowerCase().includes(query.toLowerCase())
    )
}

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
        <>
            <div className="flex space-x-6 px-6">
                <h1 className="text-2xl">Scripts</h1>{' '}
                <Link
                    to={toNewScript}
                    className="flex items-center rounded-md bg-lightgreen px-3 py-1.5 text-sm font-semibold text-green hover:bg-emerald-200"
                >
                    Create script <HiOutlineArrowRight className="ml-1" />
                </Link>
            </div>
            <div className="mt-8 h-full flex-grow px-6">
                <Table
                    loading={loading}
                    emptyState={<NoScripts />}
                    noResultsState={<NoScriptResults />}
                    columnNames={['Name', 'Modified', 'Engine', '']} //TODO(John): Replace with Status icons
                    columnWidths={['w-9/12', 'w-30', 'w-30', 'w-10']}
                    rowData={scripts}
                    RowRenderer={ScriptRow}
                    searchFilter={searchFilter}
                />
            </div>
        </>
    )
}
