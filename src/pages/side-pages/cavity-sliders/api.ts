import { makeCrudApi } from '../../../api/crud';
import { CavitySliderType } from './model';

const crud = makeCrudApi<CavitySliderType>('cavity-slider');

export const getCavitySliders   = crud.getAll;
export const getCavitySlider    = crud.get;
export const createCavitySlider = crud.create;
export const updateCavitySlider = crud.update;
export const deleteCavitySlider = crud.remove;
