import client from '../../../api/client';
import { makeCrudApi } from '../../../api/crud';
import { PurchaseOrder } from './model';
import { OrderItem } from '../jobs/model';

const crud = makeCrudApi<PurchaseOrder>('order');

export const getOrders   = crud.getAll;
export const getOrder    = crud.get;
export const createOrder = crud.create;
export const updateOrder = crud.update;
export const deleteOrder = crud.remove;

export const setItemDispatched = (orderId: number, itemId: number, isDispatched: boolean) =>
    client.put<OrderItem>(`/order/${orderId}/items/${itemId}/dispatched`, { isDispatched }).then(r => r.data);
