export interface QuotesPageProps {}

export interface Quote {
    id: number;
    quoteNumber: string;
    customerId: number;
    customerName: string;
    status: string;
    totalAmount: number | null;
    validUntil: string | null;
    createdBy: string | null;
    notes: string | null;
}
