import client from '../../../api/client';
import { makeCrudApi } from '../../../api/crud';
import { DoorType, DoorPricingEntry } from './model';

const crud = makeCrudApi<DoorType>('door-type');

export const getDoorTypes   = crud.getAll;
export const getDoorType    = crud.get;
export const createDoorType = crud.create;
export const updateDoorType = crud.update;
export const deleteDoorType = crud.remove;

export const getDoorTypePrices = (doorTypeId: number) =>
    client.get<DoorPricingEntry[]>(`/door-type/${doorTypeId}/prices`).then(r => r.data);

export const createDoorTypePrice = (doorTypeId: number, data: { configuration?: string | null; priceFor?: 'Prehung' | 'Leaf' | null; heightMm: number; widthMm: number; thicknessMm: number; price: number }) =>
    client.post<DoorPricingEntry>(`/door-type/${doorTypeId}/prices`, { ...data, doorTypeId }).then(r => r.data);

export const deleteDoorTypePrice = (doorTypeId: number, entryId: number) =>
    client.delete(`/door-type/${doorTypeId}/prices/${entryId}`);
