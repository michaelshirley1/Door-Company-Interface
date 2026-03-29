export interface JobPageProps {}

export interface Job {
    id: number;
    jobNumber: string | null;
    customerId: number;
    customerName: string;
    status: string;
    siteAddress: string | null;
    assignedTo: string | null;
    scheduledDate: string | null;
    completedDate: string | null;
    purchaseOrderId: number | null;
    notes: string | null;
}
