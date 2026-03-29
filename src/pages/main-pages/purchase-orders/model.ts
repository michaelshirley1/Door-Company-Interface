export interface PurchaseOrdersPageProps {}

export interface PurchaseOrder {
    id: number;
    poNumber: string | null;
    customerId: number;
    customerName: string;
    quoteId: number | null;
    status: string;
    orderDate: string;
    expectedDelivery: string | null;
    totalAmount: number | null;
    notes: string | null;
}
