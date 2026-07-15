import client from '../../../api/client';
import { AppUser, UserRole } from './model';

export const getUsers = () => client.get<AppUser[]>('/users').then(r => r.data);

export const inviteUser = (email: string, role: UserRole) =>
    client.post<AppUser>('/users/invite', { email, role }).then(r => r.data);

export const setUserRole = (id: string, role: UserRole) =>
    client.put<AppUser>(`/users/${id}/role`, { role }).then(r => r.data);
