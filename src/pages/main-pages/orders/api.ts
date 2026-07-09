import { makeCrudApi } from '../../../api/crud';
import { PurchaseOrder } from './model';

const crud = makeCrudApi<PurchaseOrder>('order');

export const getOrders   = crud.getAll;
export const getOrder    = crud.get;
export const createOrder = crud.create;
export const updateOrder = crud.update;
export const deleteOrder = crud.remove;
