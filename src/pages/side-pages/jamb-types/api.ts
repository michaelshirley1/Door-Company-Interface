import { makeCrudApi } from '../../../api/crud';
import { JambType, JambRequirement } from './model';

const crud = makeCrudApi<JambType>('jamb-type');

export const getJambTypes   = crud.getAll;
export const createJambType = crud.create;
export const updateJambType = crud.update;
export const deleteJambType = crud.remove;

const requirementCrud = makeCrudApi<JambRequirement>('jamb-requirement');

export const getJambRequirements   = requirementCrud.getAll;
export const createJambRequirement = requirementCrud.create;
export const updateJambRequirement = requirementCrud.update;
export const deleteJambRequirement = requirementCrud.remove;
