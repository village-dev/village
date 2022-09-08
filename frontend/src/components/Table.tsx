import React from 'react'

export const Table: React.FC<{
    columnNames: string[]
    children: React.ReactNode
}> = ({ columnNames, children }) => {
    return (
        <table className="w-full table-auto border-collapse text-sm">
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
            <tbody className="bg-white dark:bg-slate-800">{children}</tbody>
        </table>
    )
}
