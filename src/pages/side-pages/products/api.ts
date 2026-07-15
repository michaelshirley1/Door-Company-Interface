import { makeCrudApi } from '../../../api/crud';
import { Product } from './model';

const crud = makeCrudApi<Product>('product');

export const getProducts   = crud.getAll;
export const getProduct    = crud.get;
export const createProduct = crud.create;
export const updateProduct = crud.update;
export const deleteProduct = crud.remove;
