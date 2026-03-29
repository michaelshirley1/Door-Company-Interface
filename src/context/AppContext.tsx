import React, { createContext, useContext, useState } from 'react';
import { Customer } from '../pages/main-pages/customers/model';
import { Job } from '../pages/main-pages/jobs/model';
import { Quote } from '../pages/main-pages/quotes/model';
import { Invoice } from '../pages/main-pages/invoices/model';
import { PurchaseOrder } from '../pages/main-pages/purchase-orders/model';
import { DoorType } from '../pages/door-types/model';
import { HingeType } from '../pages/hinge-types/model';
import { HandleType } from '../pages/handle-types/model';

const initialCustomers: Customer[] = [
    { id: 1, name: 'John Smith', companyName: 'Acme Corp', email: 'john@acme.co.nz', phone: '021 123 4567', address: '123 Main St, Auckland', notes: null, createdAt: '2026-01-05' },
    { id: 2, name: 'Sarah Smith', companyName: null, email: 'sarah.smith@email.com', phone: '021 987 6543', address: '45 Oak Ave, Wellington', notes: null, createdAt: '2026-01-18' },
    { id: 3, name: 'Tom Richards', companyName: 'City Council', email: 'trichards@council.govt.nz', phone: '04 890 0000', address: '1 Council Rd, Wellington', notes: null, createdAt: '2026-02-01' },
    { id: 4, name: 'Dan Doe', companyName: 'Doe Builds Ltd', email: 'dan@doesbuilds.co.nz', phone: '027 555 1234', address: '99 Pine St, Christchurch', notes: null, createdAt: '2026-02-14' },
];

const initialJobs: Job[] = [
    { id: 1, jobNumber: 'JOB-001', customerId: 1, customerName: 'Acme Corp', status: 'InProgress', siteAddress: '123 Main St', assignedTo: 'Mike B', scheduledDate: '2026-04-01', completedDate: null, purchaseOrderId: 1, notes: null },
    { id: 2, jobNumber: 'JOB-002', customerId: 2, customerName: 'Smith Residence', status: 'Scheduled', siteAddress: '45 Oak Ave', assignedTo: 'Jake R', scheduledDate: '2026-04-10', completedDate: null, purchaseOrderId: null, notes: null },
    { id: 3, jobNumber: 'JOB-003', customerId: 3, customerName: 'City Council', status: 'OnHold', siteAddress: '1 Council Rd', assignedTo: null, scheduledDate: '2026-03-20', completedDate: null, purchaseOrderId: null, notes: null },
    { id: 4, jobNumber: 'JOB-004', customerId: 1, customerName: 'Acme Corp', status: 'Completed', siteAddress: '123 Main St', assignedTo: 'Mike B', scheduledDate: '2026-02-15', completedDate: '2026-02-18', purchaseOrderId: 2, notes: null },
    { id: 5, jobNumber: 'JOB-005', customerId: 4, customerName: 'Doe Builds Ltd', status: 'Cancelled', siteAddress: '99 Pine St', assignedTo: null, scheduledDate: '2026-03-01', completedDate: null, purchaseOrderId: null, notes: null },
];

const initialQuotes: Quote[] = [
    { id: 1, quoteNumber: 'QTE-001', customerId: 1, customerName: 'Acme Corp', status: 'Draft', totalAmount: null, validUntil: null, createdBy: 'Mike B', notes: null },
    { id: 2, quoteNumber: 'QTE-002', customerId: 2, customerName: 'Smith Residence', status: 'Sent', totalAmount: 4200.00, validUntil: '2026-04-30', createdBy: 'Jake R', notes: null },
    { id: 3, quoteNumber: 'QTE-003', customerId: 3, customerName: 'City Council', status: 'Accepted', totalAmount: 18500.00, validUntil: '2026-05-01', createdBy: 'Mike B', notes: null },
    { id: 4, quoteNumber: 'QTE-004', customerId: 4, customerName: 'Doe Builds Ltd', status: 'Declined', totalAmount: 3100.00, validUntil: '2026-03-15', createdBy: 'Jake R', notes: null },
    { id: 5, quoteNumber: 'QTE-005', customerId: 1, customerName: 'Acme Corp', status: 'Expired', totalAmount: 9750.00, validUntil: '2026-02-28', createdBy: 'Mike B', notes: null },
];

const initialPurchaseOrders: PurchaseOrder[] = [
    { id: 1, poNumber: 'PO-001', customerId: 1, customerName: 'Acme Corp', quoteId: 3, status: 'InProduction', orderDate: '2026-03-01', expectedDelivery: '2026-04-05', totalAmount: 18500.00, notes: null },
    { id: 2, poNumber: 'PO-002', customerId: 2, customerName: 'Smith Residence', quoteId: 2, status: 'Confirmed', orderDate: '2026-03-10', expectedDelivery: '2026-04-10', totalAmount: 4200.00, notes: null },
    { id: 3, poNumber: 'PO-003', customerId: 4, customerName: 'Doe Builds Ltd', quoteId: null, status: 'Received', orderDate: '2026-03-20', expectedDelivery: null, totalAmount: null, notes: null },
    { id: 4, poNumber: 'PO-004', customerId: 1, customerName: 'Acme Corp', quoteId: null, status: 'Ready', orderDate: '2026-02-01', expectedDelivery: '2026-02-28', totalAmount: 4800.00, notes: null },
    { id: 5, poNumber: 'PO-005', customerId: 3, customerName: 'City Council', quoteId: null, status: 'Cancelled', orderDate: '2026-01-15', expectedDelivery: null, totalAmount: 3100.00, notes: null },
];

const initialInvoices: Invoice[] = [
    { id: 1, invoiceNumber: 'INV-001', jobId: 4, jobNumber: 'JOB-004', status: 'Paid',    subtotal: 4173.91, taxRate: 0.15, taxAmount: 626.09,  total: 4800.00,  amountPaid: 4800.00, dueDate: '2026-03-15', notes: null, issuedAt: '2026-02-20', paidAt: '2026-03-10' },
    { id: 2, invoiceNumber: 'INV-002', jobId: 1, jobNumber: 'JOB-001', status: 'Sent',    subtotal: 16086.96, taxRate: 0.15, taxAmount: 2413.04, total: 18500.00, amountPaid: 0,       dueDate: '2026-04-15', notes: null, issuedAt: '2026-03-15', paidAt: null },
    { id: 3, invoiceNumber: 'INV-003', jobId: 2, jobNumber: 'JOB-002', status: 'Draft',   subtotal: 3652.17, taxRate: 0.15, taxAmount: 547.83,  total: 4200.00,  amountPaid: 0,       dueDate: null,         notes: null, issuedAt: null,         paidAt: null },
    { id: 4, invoiceNumber: 'INV-004', jobId: 3, jobNumber: 'JOB-003', status: 'Overdue', subtotal: 8478.26, taxRate: 0.15, taxAmount: 1271.74, total: 9750.00,  amountPaid: 0,       dueDate: '2026-03-01', notes: null, issuedAt: '2026-02-01', paidAt: null },
    { id: 5, invoiceNumber: 'INV-005', jobId: 5, jobNumber: 'JOB-005', status: 'Void',    subtotal: 2695.65, taxRate: 0.15, taxAmount: 404.35,  total: 3100.00,  amountPaid: 0,       dueDate: null,         notes: null, issuedAt: null,         paidAt: null },
];

const initialDoorTypes: DoorType[] = [
    { id: 1, name: 'Solid Timber', material: 'Timber', description: 'Full solid timber construction', isActive: true, createdAt: '2026-01-01' },
    { id: 2, name: 'Hollow Core', material: 'Timber', description: 'Lightweight hollow core interior door', isActive: true, createdAt: '2026-01-01' },
    { id: 3, name: 'Steel Security', material: 'Steel', description: 'Heavy-duty steel security door', isActive: true, createdAt: '2026-01-01' },
    { id: 4, name: 'Aluminium Sliding', material: 'Aluminium', description: 'Aluminium frame sliding door', isActive: true, createdAt: '2026-01-01' },
    { id: 5, name: 'uPVC Double Glazed', material: 'uPVC', description: 'Double glazed uPVC frame door', isActive: false, createdAt: '2026-01-01' },
];

const initialHingeTypes: HingeType[] = [
    { id: 1, name: 'Butt Hinge', finish: 'Satin Stainless', description: 'Standard butt hinge for interior doors', isActive: true, createdAt: '2026-01-01' },
    { id: 2, name: 'Continuous Piano Hinge', finish: 'Aluminium', description: 'Full-length piano hinge', isActive: true, createdAt: '2026-01-01' },
    { id: 3, name: 'Ball Bearing Hinge', finish: 'Polished Brass', description: 'Heavy-duty ball bearing hinge', isActive: true, createdAt: '2026-01-01' },
    { id: 4, name: 'Spring Hinge', finish: 'Satin Chrome', description: 'Self-closing spring hinge', isActive: true, createdAt: '2026-01-01' },
    { id: 5, name: 'Concealed Hinge', finish: 'Nickel', description: 'European concealed cabinet hinge', isActive: false, createdAt: '2026-01-01' },
];

const initialHandleTypes: HandleType[] = [
    { id: 1, name: 'Lever Handle', finish: 'Satin Stainless', mechanism: 'Latch', description: 'Standard lever latch handle', isActive: true, createdAt: '2026-01-01' },
    { id: 2, name: 'Deadbolt Handle', finish: 'Polished Chrome', mechanism: 'Deadbolt', description: 'Keyed deadbolt entry handle', isActive: true, createdAt: '2026-01-01' },
    { id: 3, name: 'Passage Lever', finish: 'Matte Black', mechanism: 'Passage', description: 'No-lock passage lever', isActive: true, createdAt: '2026-01-01' },
    { id: 4, name: 'Privacy Lever', finish: 'Satin Chrome', mechanism: 'Privacy', description: 'Privacy thumb-turn lever', isActive: true, createdAt: '2026-01-01' },
    { id: 5, name: 'Flush Pull', finish: 'Brushed Nickel', mechanism: null, description: 'Recessed flush pull for sliding doors', isActive: false, createdAt: '2026-01-01' },
];

interface AppContextValue {
    customers: Customer[];
    addCustomer(d: Omit<Customer, 'id'>): void;
    updateCustomer(d: Customer): void;
    removeCustomer(id: number): void;

    jobs: Job[];
    addJob(d: Omit<Job, 'id'>): void;
    updateJob(d: Job): void;
    removeJob(id: number): void;

    quotes: Quote[];
    addQuote(d: Omit<Quote, 'id'>): void;
    updateQuote(d: Quote): void;
    removeQuote(id: number): void;

    invoices: Invoice[];
    addInvoice(d: Omit<Invoice, 'id'>): void;
    updateInvoice(d: Invoice): void;
    removeInvoice(id: number): void;

    purchaseOrders: PurchaseOrder[];
    addPurchaseOrder(d: Omit<PurchaseOrder, 'id'>): void;
    updatePurchaseOrder(d: PurchaseOrder): void;
    removePurchaseOrder(id: number): void;

    doorTypes: DoorType[];
    addDoorType(d: Omit<DoorType, 'id'>): void;
    updateDoorType(d: DoorType): void;
    removeDoorType(id: number): void;

    hingeTypes: HingeType[];
    addHingeType(d: Omit<HingeType, 'id'>): void;
    updateHingeType(d: HingeType): void;
    removeHingeType(id: number): void;

    handleTypes: HandleType[];
    addHandleType(d: Omit<HandleType, 'id'>): void;
    updateHandleType(d: HandleType): void;
    removeHandleType(id: number): void;
}

const AppContext = createContext<AppContextValue>(null!);

export const useAppContext = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [jobs, setJobs] = useState(initialJobs);
    const [quotes, setQuotes] = useState(initialQuotes);
    const [invoices, setInvoices] = useState(initialInvoices);
    const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
    const [doorTypes, setDoorTypes] = useState(initialDoorTypes);
    const [hingeTypes, setHingeTypes] = useState(initialHingeTypes);
    const [handleTypes, setHandleTypes] = useState(initialHandleTypes);

    const nextId = (items: { id: number }[]) =>
        items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

    const addCustomer = (d: Omit<Customer, 'id'>) => setCustomers(p => [...p, { ...d, id: nextId(p) }]);
    const updateCustomer = (d: Customer) => setCustomers(p => p.map(i => i.id === d.id ? d : i));
    const removeCustomer = (id: number) => setCustomers(p => p.filter(i => i.id !== id));

    const addJob = (d: Omit<Job, 'id'>) => setJobs(p => [...p, { ...d, id: nextId(p) }]);
    const updateJob = (d: Job) => setJobs(p => p.map(i => i.id === d.id ? d : i));
    const removeJob = (id: number) => setJobs(p => p.filter(i => i.id !== id));

    const addQuote = (d: Omit<Quote, 'id'>) => setQuotes(p => [...p, { ...d, id: nextId(p) }]);
    const updateQuote = (d: Quote) => setQuotes(p => p.map(i => i.id === d.id ? d : i));
    const removeQuote = (id: number) => setQuotes(p => p.filter(i => i.id !== id));

    const addInvoice = (d: Omit<Invoice, 'id'>) => setInvoices(p => [...p, { ...d, id: nextId(p) }]);
    const updateInvoice = (d: Invoice) => setInvoices(p => p.map(i => i.id === d.id ? d : i));
    const removeInvoice = (id: number) => setInvoices(p => p.filter(i => i.id !== id));

    const addPurchaseOrder = (d: Omit<PurchaseOrder, 'id'>) => setPurchaseOrders(p => [...p, { ...d, id: nextId(p) }]);
    const updatePurchaseOrder = (d: PurchaseOrder) => setPurchaseOrders(p => p.map(i => i.id === d.id ? d : i));
    const removePurchaseOrder = (id: number) => setPurchaseOrders(p => p.filter(i => i.id !== id));

    const addDoorType = (d: Omit<DoorType, 'id'>) => setDoorTypes(p => [...p, { ...d, id: nextId(p) }]);
    const updateDoorType = (d: DoorType) => setDoorTypes(p => p.map(i => i.id === d.id ? d : i));
    const removeDoorType = (id: number) => setDoorTypes(p => p.filter(i => i.id !== id));

    const addHingeType = (d: Omit<HingeType, 'id'>) => setHingeTypes(p => [...p, { ...d, id: nextId(p) }]);
    const updateHingeType = (d: HingeType) => setHingeTypes(p => p.map(i => i.id === d.id ? d : i));
    const removeHingeType = (id: number) => setHingeTypes(p => p.filter(i => i.id !== id));

    const addHandleType = (d: Omit<HandleType, 'id'>) => setHandleTypes(p => [...p, { ...d, id: nextId(p) }]);
    const updateHandleType = (d: HandleType) => setHandleTypes(p => p.map(i => i.id === d.id ? d : i));
    const removeHandleType = (id: number) => setHandleTypes(p => p.filter(i => i.id !== id));

    return (
        <AppContext.Provider value={{
            customers, addCustomer, updateCustomer, removeCustomer,
            jobs, addJob, updateJob, removeJob,
            quotes, addQuote, updateQuote, removeQuote,
            invoices, addInvoice, updateInvoice, removeInvoice,
            purchaseOrders, addPurchaseOrder, updatePurchaseOrder, removePurchaseOrder,
            doorTypes, addDoorType, updateDoorType, removeDoorType,
            hingeTypes, addHingeType, updateHingeType, removeHingeType,
            handleTypes, addHandleType, updateHandleType, removeHandleType,
        }}>
            {children}
        </AppContext.Provider>
    );
}
