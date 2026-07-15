import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../../components/page-wrapper';
import { Table } from '../../../components/table';
import { HeaderItem } from '../../../components/table/model';
import { Status } from '../../../components/status';
import Modal from '../../../components/modal';
import { TextField, SelectField } from '../../../components/form-field';
import Loading from '../../../components/loading';
import ErrorBanner from '../../../components/error-banner';
import { getUsers, inviteUser, setUserRole } from './api';
import { AppUser, UserRole } from './model';
import { getApiErrorMessage } from '../../../api/errors';

import './styles.scss';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'staff', label: 'Staff' },
    { value: 'admin', label: 'Admin' },
    { value: 'owner', label: 'Owner' },
];

const SettingsPage: React.FC = () => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<UserRole>('staff');
    const [inviting, setInviting] = useState(false);
    const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

    useEffect(() => {
        getUsers()
            .then(setUsers)
            .catch(err => setError(`Failed to load users: ${getApiErrorMessage(err)}`))
            .finally(() => setLoading(false));
    }, []);

    const handleInvite = () => {
        if (!inviteEmail.trim()) return;
        setInviting(true);
        setError(null);
        inviteUser(inviteEmail.trim(), inviteRole)
            .then(user => {
                setUsers(prev => [...prev, user]);
                setInviteOpen(false);
                setInviteEmail('');
                setInviteRole('staff');
            })
            .catch(err => setError(`Failed to invite user: ${getApiErrorMessage(err)}`))
            .finally(() => setInviting(false));
    };

    const handleRoleChange = (user: AppUser, role: UserRole) => {
        setSavingRoleId(user.id);
        setError(null);
        setUserRole(user.id, role)
            .then(updated => setUsers(prev => prev.map(u => u.id === updated.id ? updated : u)))
            .catch(err => setError(`Failed to update role: ${getApiErrorMessage(err)}`))
            .finally(() => setSavingRoleId(null));
    };

    const headers: HeaderItem<AppUser>[] = [
        { id: 'email', title: 'Email', render: (v) => v ?? '—' },
        {
            id: 'role',
            title: 'Role',
            render: (_v, user) => (
                <select
                    className="user-role-select"
                    value={user.role}
                    disabled={savingRoleId === user.id}
                    onChange={e => handleRoleChange(user, e.target.value as UserRole)}
                >
                    {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            ),
        },
        {
            id: 'inviteAccepted',
            title: 'Status',
            render: (_v, user) => (
                <Status content={user.inviteAccepted ? 'Active' : 'Invited'} type={user.inviteAccepted ? 'good' : 'warn'} />
            ),
        },
        {
            id: 'createdAt',
            title: 'Added',
            render: (v) => v ? new Date(v).toLocaleDateString() : '—',
        },
    ];

    if (loading) return <Loading />;

    return (
        <PageWrapper title="Settings — Users" buttonTitle="Invite User" buttonAction={() => setInviteOpen(true)}>
            {error && <ErrorBanner message={error} />}

            <Table<AppUser> headers={headers} rows={users} emptyMessage="No users yet." />

            <Modal
                isOpen={inviteOpen}
                onClose={() => setInviteOpen(false)}
                title="Invite User"
                onConfirm={handleInvite}
                confirmLabel={inviting ? 'Inviting...' : 'Send Invite'}
            >
                <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="name@example.com"
                />
                <SelectField
                    label="Role"
                    name="role"
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as UserRole)}
                >
                    {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </SelectField>
            </Modal>
        </PageWrapper>
    );
};

export default SettingsPage;
