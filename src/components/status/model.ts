export type StatusProps = {
    content: string,
    variation?: 'job' | 'customer' | 'invoice' | 'quotes' | 'order'
    type?: string
}

export type ActiveStatusProps = {
    active: boolean
}