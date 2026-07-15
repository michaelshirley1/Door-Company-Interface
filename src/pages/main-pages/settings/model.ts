export interface SettingsPageProps {}

export type UserRole = 'staff' | 'admin' | 'owner';

export interface AppUser {
    id: string;
    email: string | null;
    role: UserRole;
    inviteAccepted: boolean;
    createdAt: string | null;
}
