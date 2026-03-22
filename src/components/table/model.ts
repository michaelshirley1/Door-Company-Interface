export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    headers: headerItem[]
    rows: any
}

export interface headerItem {
    id: string
    title: string
}