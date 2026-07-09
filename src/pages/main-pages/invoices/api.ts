import { makeCrudApi } from '../../../api/crud';
import { Invoice } from './model';

const crud = makeCrudApi<Invoice>('invoice');

export const getInvoices   = crud.getAll;
export const getInvoice    = crud.get;
export const createInvoice = crud.create;
export const updateInvoice = crud.update;
export const deleteInvoice = crud.remove;
