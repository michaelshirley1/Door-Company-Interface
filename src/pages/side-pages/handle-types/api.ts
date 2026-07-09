import { makeCrudApi } from '../../../api/crud';
import { HandleType } from './model';

const crud = makeCrudApi<HandleType>('handle-type');

export const getHandleTypes   = crud.getAll;
export const getHandleType    = crud.get;
export const createHandleType = crud.create;
export const updateHandleType = crud.update;
export const deleteHandleType = crud.remove;
