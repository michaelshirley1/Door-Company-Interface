import { makeCrudApi } from '../../../api/crud';
import { Customer } from './model';

const crud = makeCrudApi<Customer>('customer');

export const getCustomers   = crud.getAll;
export const getCustomer    = crud.get;
export const createCustomer = crud.create;
export const updateCustomer = crud.update;
export const deleteCustomer = crud.remove;
