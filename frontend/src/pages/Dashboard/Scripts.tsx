import { getFormattedDate } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { Table } from '@components/Table'
import { useUserContext } from '@contexts/UserContext'
import React, { useEffect, useState } from 'react'
import { HiOutlineArrowRight, HiOutlineLink } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { Script } from '../../../api/models/Script'

const NoScripts: React.FC = () => {
    return (
        <div className="mx-6 mt-10 flex h-full flex-col items-center justify-center rounded-xl bg-gray-50 py-8 px-8">
            <h1 className="text-2xl font-semibold text-black">
                No scripts yet!
            </h1>
            <p className="text-md mt-8 text-gray-600">
                Get started by looking at our{' '}
                <a
                    href="http://docs.village.dev"
                    className="text-green underline-offset-4 hover:underline"
                >
                    Documentation.
                </a>
            </p>
        </div>
    )
}

const NoResults: React.FC = () => {
    return (
        <h1 className="mt-10 text-lg font-semibold text-gray-400">
            No scripts found!
        </h1>
    )
}

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
        <div className="flex h-full flex-col space-y-6 px-8 py-4">
            <div className="flex space-x-6 px-6">
                <h1 className="text-2xl">Scripts</h1>{' '}
                <Link
                    to="/app/new/script"
                    className="flex items-center rounded-md bg-lightgreen px-3 py-1.5 text-sm font-semibold text-green hover:bg-emerald-200"
                >
                    Create script <HiOutlineArrowRight className="ml-1" />
                </Link>
            </div>
            <div className="h-full flex-grow px-6">
                <Table
                    loading={loading}
                    emptyState={<NoScripts />}
                    noResultsState={<NoResults />}
                    columnNames={['Name', 'Modified', 'Engine', '']} //TODO(John): Replace with Status icons
                    columnWidths={['w-9/12', 'w-30', 'w-30', 'w-10']}
                    rowData={scripts}
                    RowRenderer={ScriptRow}
                    searchFilter={searchFilter}
                />
            </div>
        </div>
    )
}
