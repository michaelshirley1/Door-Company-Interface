import { makeCrudApi } from '../../../api/crud';
import { JambType } from './model';

const crud = makeCrudApi<JambType>('jamb-type');

export const getJambTypes   = crud.getAll;
export const createJambType = crud.create;
export const updateJambType = crud.update;
export const deleteJambType = crud.remove;
