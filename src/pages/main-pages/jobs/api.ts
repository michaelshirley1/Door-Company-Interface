import { makeCrudApi } from '../../../api/crud';
import { Job } from './model';

const crud = makeCrudApi<Job>('job');

export const getJobs   = crud.getAll;
export const getJob    = crud.get;
export const createJob = crud.create;
export const updateJob = crud.update;
export const deleteJob = crud.remove;
