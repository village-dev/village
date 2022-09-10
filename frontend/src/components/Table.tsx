import React, { useEffect, useState } from 'react'
import BarLoader from 'react-spinners/BarLoader'
import { Input } from '@components/Input'

interface TableProps<T> {
    columnNames: string[]
    loading: boolean
    emptyState: React.ReactNode
    noResultsState: React.ReactNode
    rowData: T[]
    RowRenderer: React.FC<{ data: T }>
    searchFilter: ({ data, query }: { data: T; query: string }) => boolean
}

type TableComponent<T = any> = React.FC<TableProps<T>>

export const Table: TableComponent = ({
    columnNames,
    emptyState,
    noResultsState,
    loading,
    rowData,
    RowRenderer,
    searchFilter,
}) => {
    const [query, setQuery] = useState('')
    const [searchResults, setSearchResults] = useState(rowData)

    useEffect(() => {
        setSearchResults(
            rowData.filter((data) => searchFilter({ data, query }))
        )
    }, [query, rowData])

    let innerTable

    if (loading) {
        innerTable = (
            <tr>
                <td colSpan={columnNames.length} align="center">
                    <div className="mx-6 flex h-full flex-col items-center justify-center py-16">
                        <h1 className="text-2xl font-semibold text-gray-700">
                            Loading...
                        </h1>
                        <div className="mt-12 w-64">
                            <BarLoader width="100%" color="rgb(107 114 128)" />
                        </div>
                    </div>
                </td>
            </tr>
        )
    } else {
        if (rowData.length === 0) {
            innerTable = (
                <tr>
                    <td colSpan={columnNames.length} align="center">
                        {emptyState}
                    </td>
                </tr>
            )
        } else {
            if (searchResults.length === 0) {
                innerTable = (
                    <tr>
                        <td colSpan={columnNames.length} align="center">
                            {noResultsState}
                        </td>
                    </tr>
                )
            } else {
                innerTable = searchResults.map((x) => {
                    return <RowRenderer data={x} />
                })
            }
        }
    }

    return (
        <>
            <div className="">
                <Input
                    type="text"
                    onChange={(e) => {
                        setQuery(e.target.value)
                    }}
                    placeholder="Search"
                />
            </div>
            <table className="mt-8 w-full table-auto border-collapse text-sm">
                <thead>
                    <tr>
                        {columnNames.map((name) => {
                            return (
                                <th className="border-b p-4 pt-0 pb-3 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200">
                                    {name}
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800">
                    {innerTable}
                </tbody>
            </table>
        </>
    )
}
