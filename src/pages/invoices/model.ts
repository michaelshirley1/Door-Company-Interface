export interface InvoicesPageProps {}

export interface Invoice {
    id: string;
    customer: string;
    amount: string;
    status: string;
    issueDate: string;
    dueDate: string;
}