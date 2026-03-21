export interface PurchaseOrdersPageProps {}

export interface PurchaseOrder {
    id: string;
    supplier: string;
    description: string;
    amount: string;
    status: string;
    orderDate: string;
}