import client from './client';

/**
 * Builds the standard five CRUD functions for a backend resource.
 * `resource` is the base route without leading slash, e.g. 'job' or 'cavity-slider'.
 */
export function makeCrudApi<T>(resource: string) {
    return {
        getAll: () =>
            client.get<T[]>(`/${resource}`).then(r => r.data),
        get: (id: number) =>
            client.get<T>(`/${resource}/${id}`).then(r => r.data),
        create: (data: Omit<T, 'id'>) =>
            client.post<T>(`/${resource}`, data).then(r => r.data),
        update: (id: number, data: T) =>
            client.put<T>(`/${resource}/${id}`, data).then(r => r.data),
        remove: (id: number) =>
            client.delete(`/${resource}/${id}`),
    };
}
