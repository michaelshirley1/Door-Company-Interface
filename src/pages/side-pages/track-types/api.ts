import { makeCrudApi } from '../../../api/crud';
import { TrackType } from './model';

const crud = makeCrudApi<TrackType>('track-type');

export const getTrackTypes   = crud.getAll;
export const getTrackType    = crud.get;
export const createTrackType = crud.create;
export const updateTrackType = crud.update;
export const deleteTrackType = crud.remove;
