import { Input } from '@components/Input'
import React, { useEffect, useState } from 'react'

interface TableProps<T> {
    columnNames: string[]
    loading: boolean
    emptyState: React.ReactNode
    noResultsState: React.ReactNode
    rowData: T[]
    RowRenderer: React.FC<{ data: T; idx: number }>
    searchFilter: ({ data, query }: { data: T; query: string }) => boolean
    columnWidths?: string[] // class names for widths
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
    columnWidths,
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
        innerTable = [null, null, null].map((_, idx) => {
            const arr = new Array(columnNames.length).fill(null)
            return (
                <tr key={idx}>
                    {arr.map((_, idx) => {
                        return (
                            <td key={idx} className="py-4 px-4">
                                <div className="h-4 w-full animate-pulse rounded bg-gray-300"></div>
                            </td>
                        )
                    })}
                </tr>
            )
        })
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
                innerTable = searchResults.map((x, idx) => {
                    return <RowRenderer data={x} idx={idx} />
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
            <table className="mt-8 w-full table-fixed border-collapse text-sm">
                <thead>
                    <tr>
                        {columnNames.map((name, idx) => {
                            return (
                                <th
                                    key={idx}
                                    className={
                                        (columnWidths !== undefined
                                            ? columnWidths[idx]
                                            : '') +
                                        ' border-b p-4 pt-0 pb-1 text-left text-gray-400 '
                                    }
                                >
                                    {name}
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody className="bg-white">{innerTable}</tbody>
            </table>
        </>
    )
}
