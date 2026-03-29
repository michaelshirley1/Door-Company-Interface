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
    { id: 1, name: 'John Smith',     companyName: 'Acme Corp',        email: 'john@acme.co.nz',           phone: '021 123 4567', address: '123 Main St, Auckland',        notes: 'Key account — prefers morning calls.', createdAt: '2025-11-05' },
    { id: 2, name: 'Sarah Smith',    companyName: null,                email: 'sarah.smith@email.com',     phone: '021 987 6543', address: '45 Oak Ave, Wellington',        notes: null,                                   createdAt: '2025-12-18' },
    { id: 3, name: 'Tom Richards',   companyName: 'City Council',      email: 'trichards@council.govt.nz', phone: '04 890 0000',  address: '1 Council Rd, Wellington',      notes: 'All invoices require PO number on face.', createdAt: '2026-01-01' },
    { id: 4, name: 'Dan Doe',        companyName: 'Doe Builds Ltd',    email: 'dan@doesbuilds.co.nz',      phone: '027 555 1234', address: '99 Pine St, Christchurch',      notes: null,                                   createdAt: '2026-01-14' },
    { id: 5, name: 'Priya Patel',    companyName: 'Patel Properties',  email: 'priya@patelprop.co.nz',     phone: '027 321 9876', address: '8 Harbour View, Tauranga',      notes: 'Large development pipeline — 3 sites pending.', createdAt: '2026-01-22' },
    { id: 6, name: 'Marcus Webb',    companyName: null,                email: 'm.webb@gmail.com',          phone: '022 456 7890', address: '17 Elm Crescent, Hamilton',     notes: null,                                   createdAt: '2026-02-03' },
    { id: 7, name: 'Linda Nguyen',   companyName: 'Nguyen Joinery',    email: 'linda@nguyenjoinery.co.nz', phone: '09 412 3300',  address: '2 Factory Rd, Manukau',         notes: 'Trade account — net 30 terms agreed.', createdAt: '2026-02-10' },
    { id: 8, name: 'Steve Halliday', companyName: 'Halliday Homes',    email: 'steve@hallidayhomes.co.nz', phone: '021 700 1122', address: '55 Settlers Way, Palmerston North', notes: null,                               createdAt: '2026-02-28' },
    { id: 9, name: 'Claire Taufa',   companyName: null,                email: 'claire.taufa@xtra.co.nz',   phone: '027 888 4455', address: '3 Pohutukawa Lane, Napier',     notes: 'Referred by Dan Doe.', createdAt: '2026-03-05' },
    { id: 10, name: 'Brett Lawson',  companyName: 'Lawson & Co Build', email: 'brett@lawsonbuild.co.nz',   phone: '03 341 9900',  address: '101 Industrial Dr, Christchurch', notes: 'Credit application in progress.', createdAt: '2026-03-12' },
];

const initialJobs: Job[] = [
    { id: 1,  jobNumber: 'JOB-001', customerId: 1,  customerName: 'Acme Corp',           status: 'InProgress', siteAddress: '123 Main St, Auckland',          assignedTo: 'Mike B',  scheduledDate: '2026-04-01', completedDate: null,         purchaseOrderId: 1,    notes: 'Existing frame reuse — confirm measurements on site.' },
    { id: 2,  jobNumber: 'JOB-002', customerId: 2,  customerName: 'Sarah Smith',          status: 'Scheduled',  siteAddress: '45 Oak Ave, Wellington',          assignedTo: 'Jake R',  scheduledDate: '2026-04-10', completedDate: null,         purchaseOrderId: null, notes: null },
    { id: 3,  jobNumber: 'JOB-003', customerId: 3,  customerName: 'City Council',         status: 'OnHold',     siteAddress: '1 Council Rd, Wellington',         assignedTo: null,      scheduledDate: '2026-03-20', completedDate: null,         purchaseOrderId: null, notes: 'On hold pending council sign-off on fire rating spec.' },
    { id: 4,  jobNumber: 'JOB-004', customerId: 1,  customerName: 'Acme Corp',           status: 'Completed',  siteAddress: '123 Main St, Auckland',          assignedTo: 'Mike B',  scheduledDate: '2026-02-15', completedDate: '2026-02-18', purchaseOrderId: 2,    notes: null },
    { id: 5,  jobNumber: 'JOB-005', customerId: 4,  customerName: 'Doe Builds Ltd',       status: 'Cancelled',  siteAddress: '99 Pine St, Christchurch',        assignedTo: null,      scheduledDate: '2026-03-01', completedDate: null,         purchaseOrderId: null, notes: 'Client cancelled — scope changed.' },
    { id: 6,  jobNumber: 'JOB-006', customerId: 5,  customerName: 'Patel Properties',     status: 'Scheduled',  siteAddress: '8 Harbour View, Tauranga',        assignedTo: 'Jake R',  scheduledDate: '2026-04-22', completedDate: null,         purchaseOrderId: 3,    notes: null },
    { id: 7,  jobNumber: 'JOB-007', customerId: 7,  customerName: 'Nguyen Joinery',       status: 'InProgress', siteAddress: '2 Factory Rd, Manukau',           assignedTo: 'Sam T',   scheduledDate: '2026-03-28', completedDate: null,         purchaseOrderId: 4,    notes: 'Trade install — access key with reception.' },
    { id: 8,  jobNumber: 'JOB-008', customerId: 8,  customerName: 'Halliday Homes',       status: 'Scheduled',  siteAddress: '12 Rosewood Dr, Palmerston North', assignedTo: 'Mike B', scheduledDate: '2026-05-05', completedDate: null,         purchaseOrderId: null, notes: null },
    { id: 9,  jobNumber: 'JOB-009', customerId: 6,  customerName: 'Marcus Webb',          status: 'Completed',  siteAddress: '17 Elm Crescent, Hamilton',       assignedTo: 'Jake R',  scheduledDate: '2026-02-20', completedDate: '2026-02-24', purchaseOrderId: null, notes: null },
    { id: 10, jobNumber: 'JOB-010', customerId: 10, customerName: 'Lawson & Co Build',    status: 'Scheduled',  siteAddress: '101 Industrial Dr, Christchurch', assignedTo: 'Sam T',   scheduledDate: '2026-05-12', completedDate: null,         purchaseOrderId: 5,    notes: 'New build — rough-in framing complete.' },
    { id: 11, jobNumber: 'JOB-011', customerId: 3,  customerName: 'City Council',         status: 'Completed',  siteAddress: '4 Library Sq, Wellington',        assignedTo: 'Mike B',  scheduledDate: '2026-01-10', completedDate: '2026-01-14', purchaseOrderId: null, notes: null },
    { id: 12, jobNumber: 'JOB-012', customerId: 9,  customerName: 'Claire Taufa',         status: 'Scheduled',  siteAddress: '3 Pohutukawa Lane, Napier',       assignedTo: 'Jake R',  scheduledDate: '2026-04-30', completedDate: null,         purchaseOrderId: null, notes: null },
];

const initialQuotes: Quote[] = [
    { id: 1,  quoteNumber: 'QTE-001', customerId: 1,  customerName: 'Acme Corp',        status: 'Draft',    totalAmount: null,      validUntil: null,         createdBy: 'Mike B', notes: 'Awaiting final door schedule from client.' },
    { id: 2,  quoteNumber: 'QTE-002', customerId: 2,  customerName: 'Sarah Smith',       status: 'Sent',     totalAmount: 4200.00,   validUntil: '2026-04-30', createdBy: 'Jake R', notes: null },
    { id: 3,  quoteNumber: 'QTE-003', customerId: 3,  customerName: 'City Council',      status: 'Accepted', totalAmount: 18500.00,  validUntil: '2026-05-01', createdBy: 'Mike B', notes: 'Includes FRR 60/60/60 fire doors for stairwell.' },
    { id: 4,  quoteNumber: 'QTE-004', customerId: 4,  customerName: 'Doe Builds Ltd',    status: 'Declined', totalAmount: 3100.00,   validUntil: '2026-03-15', createdBy: 'Jake R', notes: 'Client went with cheaper supplier.' },
    { id: 5,  quoteNumber: 'QTE-005', customerId: 1,  customerName: 'Acme Corp',        status: 'Expired',  totalAmount: 9750.00,   validUntil: '2026-02-28', createdBy: 'Mike B', notes: null },
    { id: 6,  quoteNumber: 'QTE-006', customerId: 5,  customerName: 'Patel Properties',  status: 'Sent',     totalAmount: 31400.00,  validUntil: '2026-05-15', createdBy: 'Mike B', notes: '14-unit development — pricing based on volume.' },
    { id: 7,  quoteNumber: 'QTE-007', customerId: 7,  customerName: 'Nguyen Joinery',    status: 'Accepted', totalAmount: 8850.00,   validUntil: '2026-04-20', createdBy: 'Jake R', notes: null },
    { id: 8,  quoteNumber: 'QTE-008', customerId: 8,  customerName: 'Halliday Homes',    status: 'Draft',    totalAmount: null,      validUntil: null,         createdBy: 'Mike B', notes: 'Quote for 6-bedroom spec home.' },
    { id: 9,  quoteNumber: 'QTE-009', customerId: 6,  customerName: 'Marcus Webb',       status: 'Accepted', totalAmount: 2650.00,   validUntil: '2026-03-10', createdBy: 'Jake R', notes: null },
    { id: 10, quoteNumber: 'QTE-010', customerId: 10, customerName: 'Lawson & Co Build', status: 'Sent',     totalAmount: 22100.00,  validUntil: '2026-05-20', createdBy: 'Mike B', notes: 'Commercial fit-out — 3 tenancies.' },
    { id: 11, quoteNumber: 'QTE-011', customerId: 9,  customerName: 'Claire Taufa',      status: 'Draft',    totalAmount: null,      validUntil: null,         createdBy: 'Jake R', notes: null },
    { id: 12, quoteNumber: 'QTE-012', customerId: 3,  customerName: 'City Council',      status: 'Sent',     totalAmount: 7200.00,   validUntil: '2026-05-30', createdBy: 'Mike B', notes: 'Replacement of existing doors at library.' },
];

const initialPurchaseOrders: PurchaseOrder[] = [
    { id: 1, poNumber: 'PO-001', customerId: 3,  customerName: 'City Council',      quoteId: 3,    status: 'InProduction', orderDate: '2026-03-01', expectedDelivery: '2026-04-05', totalAmount: 18500.00, notes: 'Fire doors — confirm FRR certification on delivery.' },
    { id: 2, poNumber: 'PO-002', customerId: 2,  customerName: 'Sarah Smith',        quoteId: 2,    status: 'Confirmed',    orderDate: '2026-03-10', expectedDelivery: '2026-04-10', totalAmount: 4200.00,  notes: null },
    { id: 3, poNumber: 'PO-003', customerId: 5,  customerName: 'Patel Properties',   quoteId: 6,    status: 'Received',     orderDate: '2026-03-20', expectedDelivery: '2026-05-10', totalAmount: 31400.00, notes: 'Stage 1 of 3 — 5 units.' },
    { id: 4, poNumber: 'PO-004', customerId: 7,  customerName: 'Nguyen Joinery',     quoteId: 7,    status: 'Ready',        orderDate: '2026-02-25', expectedDelivery: '2026-03-28', totalAmount: 8850.00,  notes: null },
    { id: 5, poNumber: 'PO-005', customerId: 10, customerName: 'Lawson & Co Build',  quoteId: null, status: 'Received',     orderDate: '2026-03-22', expectedDelivery: '2026-05-12', totalAmount: 22100.00, notes: null },
    { id: 6, poNumber: 'PO-006', customerId: 1,  customerName: 'Acme Corp',          quoteId: null, status: 'Delivered',    orderDate: '2026-01-10', expectedDelivery: '2026-02-10', totalAmount: 4800.00,  notes: null },
    { id: 7, poNumber: 'PO-007', customerId: 8,  customerName: 'Halliday Homes',     quoteId: null, status: 'Confirmed',    orderDate: '2026-03-28', expectedDelivery: '2026-05-05', totalAmount: null,     notes: 'Awaiting final door count from builder.' },
    { id: 8, poNumber: 'PO-008', customerId: 3,  customerName: 'City Council',       quoteId: 12,   status: 'Received',     orderDate: '2026-03-29', expectedDelivery: '2026-05-30', totalAmount: 7200.00,  notes: 'Library replacement doors.' },
];

const initialInvoices: Invoice[] = [
    { id: 1,  invoiceNumber: 'INV-001', jobId: 4,  jobNumber: 'JOB-004', status: 'Paid',    subtotal: 4173.91,  taxRate: 0.15, taxAmount: 626.09,  total: 4800.00,  amountPaid: 4800.00, dueDate: '2026-03-15', notes: null,                        issuedAt: '2026-02-20', paidAt: '2026-03-10' },
    { id: 2,  invoiceNumber: 'INV-002', jobId: 1,  jobNumber: 'JOB-001', status: 'Sent',    subtotal: 16086.96, taxRate: 0.15, taxAmount: 2413.04, total: 18500.00, amountPaid: 0,       dueDate: '2026-04-30', notes: null,                        issuedAt: '2026-03-29', paidAt: null },
    { id: 3,  invoiceNumber: 'INV-003', jobId: 2,  jobNumber: 'JOB-002', status: 'Draft',   subtotal: 3652.17,  taxRate: 0.15, taxAmount: 547.83,  total: 4200.00,  amountPaid: 0,       dueDate: null,         notes: null,                        issuedAt: null,         paidAt: null },
    { id: 4,  invoiceNumber: 'INV-004', jobId: 3,  jobNumber: 'JOB-003', status: 'Overdue', subtotal: 8478.26,  taxRate: 0.15, taxAmount: 1271.74, total: 9750.00,  amountPaid: 0,       dueDate: '2026-03-01', notes: 'Second reminder sent 10 Mar.', issuedAt: '2026-02-01', paidAt: null },
    { id: 5,  invoiceNumber: 'INV-005', jobId: 5,  jobNumber: 'JOB-005', status: 'Void',    subtotal: 2695.65,  taxRate: 0.15, taxAmount: 404.35,  total: 3100.00,  amountPaid: 0,       dueDate: null,         notes: 'Job cancelled before completion.', issuedAt: null,      paidAt: null },
    { id: 6,  invoiceNumber: 'INV-006', jobId: 9,  jobNumber: 'JOB-009', status: 'Paid',    subtotal: 2304.35,  taxRate: 0.15, taxAmount: 345.65,  total: 2650.00,  amountPaid: 2650.00, dueDate: '2026-03-20', notes: null,                        issuedAt: '2026-02-27', paidAt: '2026-03-18' },
    { id: 7,  invoiceNumber: 'INV-007', jobId: 11, jobNumber: 'JOB-011', status: 'Paid',    subtotal: 5521.74,  taxRate: 0.15, taxAmount: 828.26,  total: 6350.00,  amountPaid: 6350.00, dueDate: '2026-02-14', notes: null,                        issuedAt: '2026-01-16', paidAt: '2026-02-12' },
    { id: 8,  invoiceNumber: 'INV-008', jobId: 7,  jobNumber: 'JOB-007', status: 'Sent',    subtotal: 7695.65,  taxRate: 0.15, taxAmount: 1154.35, total: 8850.00,  amountPaid: 0,       dueDate: '2026-04-28', notes: null,                        issuedAt: '2026-03-28', paidAt: null },
    { id: 9,  invoiceNumber: 'INV-009', jobId: 6,  jobNumber: 'JOB-006', status: 'Draft',   subtotal: 27304.35, taxRate: 0.15, taxAmount: 4095.65, total: 31400.00, amountPaid: 0,       dueDate: null,         notes: 'Deposit invoice — 30% of contract.',issuedAt: null,      paidAt: null },
    { id: 10, invoiceNumber: 'INV-010', jobId: 6,  jobNumber: 'JOB-006', status: 'Overdue', subtotal: 4695.65,  taxRate: 0.15, taxAmount: 704.35,  total: 5400.00,  amountPaid: 0,       dueDate: '2026-03-10', notes: null,                        issuedAt: '2026-02-10', paidAt: null },
];

const initialDoorTypes: DoorType[] = [
    { id: 1,  name: 'Solid Timber',           material: 'Timber',     description: 'Full solid timber construction, suitable for interior and exterior',     isActive: true,  createdAt: '2025-06-01' },
    { id: 2,  name: 'Hollow Core',             material: 'Timber',     description: 'Lightweight hollow core interior door, standard residential use',       isActive: true,  createdAt: '2025-06-01' },
    { id: 3,  name: 'Steel Security',          material: 'Steel',      description: 'Heavy-duty steel security door with reinforced frame',                  isActive: true,  createdAt: '2025-06-01' },
    { id: 4,  name: 'Aluminium Sliding',       material: 'Aluminium',  description: 'Aluminium frame sliding door for interior or exterior openings',        isActive: true,  createdAt: '2025-06-01' },
    { id: 5,  name: 'uPVC Double Glazed',      material: 'uPVC',       description: 'Double glazed uPVC frame door for thermal performance',                 isActive: true,  createdAt: '2025-06-01' },
    { id: 6,  name: 'Fire Door FRR 30',        material: 'Steel/Timber', description: 'Fire rated FRR 30/30/30 — commercial and residential',               isActive: true,  createdAt: '2025-07-15' },
    { id: 7,  name: 'Fire Door FRR 60',        material: 'Steel',      description: 'Fire rated FRR 60/60/60 — stairwells and egress routes',               isActive: true,  createdAt: '2025-07-15' },
    { id: 8,  name: 'Cavity Slider',           material: 'Timber',     description: 'Timber cavity slider for space-saving interior applications',           isActive: true,  createdAt: '2025-09-01' },
    { id: 9,  name: 'Bifold Timber',           material: 'Timber',     description: 'Folding panel door set — 2, 3, or 4 panel configurations',             isActive: true,  createdAt: '2025-09-01' },
    { id: 10, name: 'Louvre Ventilation',      material: 'Timber',     description: 'Fixed louvre panel for ventilated spaces — laundries and bathrooms',   isActive: false, createdAt: '2025-11-01' },
];

const initialHingeTypes: HingeType[] = [
    { id: 1, name: 'Butt Hinge — 100mm',        finish: 'Satin Stainless', description: '100mm butt hinge, standard for interior timber doors',        isActive: true,  createdAt: '2025-06-01' },
    { id: 2, name: 'Butt Hinge — 75mm',         finish: 'Satin Stainless', description: '75mm butt hinge for lightweight interior doors',               isActive: true,  createdAt: '2025-06-01' },
    { id: 3, name: 'Ball Bearing Hinge — 100mm', finish: 'Polished Chrome', description: 'Heavy-duty ball bearing hinge for high-traffic doors',         isActive: true,  createdAt: '2025-06-01' },
    { id: 4, name: 'Ball Bearing Hinge — 100mm', finish: 'Matte Black',     description: 'Heavy-duty ball bearing hinge — matte black finish',           isActive: true,  createdAt: '2025-08-01' },
    { id: 5, name: 'Spring Hinge',               finish: 'Satin Chrome',    description: 'Single action self-closing spring hinge',                      isActive: true,  createdAt: '2025-06-01' },
    { id: 6, name: 'Continuous Piano Hinge',     finish: 'Aluminium',       description: 'Full-length piano hinge for heavy or wide door panels',        isActive: true,  createdAt: '2025-06-01' },
    { id: 7, name: 'Fire Door Hinge — CE Rated', finish: 'Satin Stainless', description: 'CE marked hinge rated for use on fire doors',                  isActive: true,  createdAt: '2025-07-15' },
    { id: 8, name: 'Pivot Hinge — Floor',        finish: 'Polished Brass',  description: 'Floor-mounted pivot for frameless glass or heavy timber doors', isActive: true,  createdAt: '2025-09-01' },
    { id: 9, name: 'Concealed Hinge',            finish: 'Nickel',          description: 'European 35mm cup concealed hinge — discontinued',             isActive: false, createdAt: '2025-06-01' },
];

const initialHandleTypes: HandleType[] = [
    { id: 1,  name: 'Lever Latch',             finish: 'Satin Stainless', mechanism: 'Latch',    description: 'Standard lever latch — interior doors, passage or latch function',  isActive: true,  createdAt: '2025-06-01' },
    { id: 2,  name: 'Lever Latch',             finish: 'Matte Black',     mechanism: 'Latch',    description: 'Standard lever latch — matte black finish',                         isActive: true,  createdAt: '2025-08-01' },
    { id: 3,  name: 'Lever Latch',             finish: 'Polished Chrome', mechanism: 'Latch',    description: 'Standard lever latch — polished chrome finish',                     isActive: true,  createdAt: '2025-08-01' },
    { id: 4,  name: 'Privacy Lever',           finish: 'Satin Stainless', mechanism: 'Privacy',  description: 'Privacy thumb-turn with emergency release — bathrooms and ensuites', isActive: true,  createdAt: '2025-06-01' },
    { id: 5,  name: 'Privacy Lever',           finish: 'Matte Black',     mechanism: 'Privacy',  description: 'Privacy thumb-turn with emergency release — matte black',            isActive: true,  createdAt: '2025-09-01' },
    { id: 6,  name: 'Passage Lever',           finish: 'Satin Stainless', mechanism: 'Passage',  description: 'No-lock passage lever — hallways and non-lockable doors',            isActive: true,  createdAt: '2025-06-01' },
    { id: 7,  name: 'Keyed Entry Lever',       finish: 'Satin Stainless', mechanism: 'Keyed',    description: 'Lockable keyed entry lever — exterior doors',                        isActive: true,  createdAt: '2025-06-01' },
    { id: 8,  name: 'Keyed Entry Lever',       finish: 'Matte Black',     mechanism: 'Keyed',    description: 'Lockable keyed entry lever — matte black, exterior',                 isActive: true,  createdAt: '2025-10-01' },
    { id: 9,  name: 'Deadbolt — Single',       finish: 'Satin Stainless', mechanism: 'Deadbolt', description: 'Single cylinder deadbolt for exterior door security',                isActive: true,  createdAt: '2025-06-01' },
    { id: 10, name: 'Flush Pull — Sliding',    finish: 'Brushed Nickel',  mechanism: null,       description: 'Recessed flush pull for cavity sliders and barn doors',              isActive: true,  createdAt: '2025-09-01' },
    { id: 11, name: 'Flush Pull — Sliding',    finish: 'Matte Black',     mechanism: null,       description: 'Recessed flush pull — matte black finish',                          isActive: true,  createdAt: '2025-11-01' },
    { id: 12, name: 'D-Pull Barn Door Handle', finish: 'Matte Black',     mechanism: null,       description: 'Flat bar D-pull for barn door and sliding door applications',       isActive: true,  createdAt: '2025-11-01' },
    { id: 13, name: 'Mortice Knob Set',        finish: 'Polished Brass',  mechanism: 'Latch',    description: 'Traditional mortice knob set — discontinued',                       isActive: false, createdAt: '2025-06-01' },
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
