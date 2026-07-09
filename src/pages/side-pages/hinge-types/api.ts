import { makeCrudApi } from '../../../api/crud';
import { HingeType } from './model';

const crud = makeCrudApi<HingeType>('hinge-type');

export const getHingeTypes   = crud.getAll;
export const getHingeType    = crud.get;
export const createHingeType = crud.create;
export const updateHingeType = crud.update;
export const deleteHingeType = crud.remove;
