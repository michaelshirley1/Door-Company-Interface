import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    headers: headerItem[]
    rows: any[]
    onRowClick?: (row: any) => void
}

export interface headerItem {
    id: string
    title: string
    render?: (value: any, row: any) => React.ReactNode
}
