import React from 'react';

export interface TableProps<T = Record<string, unknown>> {
    headers: HeaderItem<T>[]
    rows: T[]
    onRowClick?: (row: T, index: number) => void
    onAddClick?: () => void
    emptyMessage?: string
}

export interface HeaderItem<T = Record<string, unknown>> {
    id: string
    title: string
    render?: (value: any, row: T, index?: number) => React.ReactNode
}
