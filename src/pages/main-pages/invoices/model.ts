export interface InvoicesPageProps {}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    jobId: number | null;
    jobNumber: string | null;
    quoteId: number | null;
    quoteNumber: string | null;
    customerName: string;
    status: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    amountPaid: number;
    dueDate: string | null;
    notes: string | null;
    issuedAt: string | null;
    paidAt: string | null;
}
