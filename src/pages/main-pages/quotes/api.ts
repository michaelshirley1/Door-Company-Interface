import { makeCrudApi } from '../../../api/crud';
import { Quote } from './model';

const crud = makeCrudApi<Quote>('quote');

export const getQuotes   = crud.getAll;
export const getQuote    = crud.get;
export const createQuote = crud.create;
export const updateQuote = crud.update;
export const deleteQuote = crud.remove;
