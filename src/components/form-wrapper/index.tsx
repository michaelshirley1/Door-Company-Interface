import React, { useState } from 'react';
import { FormWrapperProps } from './model';

import './styles.scss';
import Button from '../button';

export const FormWrapper: React.FC<FormWrapperProps> = ({ title, onSubmit, onCancel, onDelete, extraActions, error, submitting, children }) => {
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    return (
        <div className="form-wrapper">
            <div className="form-header">
                <h1>{title}</h1>
            </div>
            {error && (
                <div className="form-error-banner">{error}</div>
            )}
            <div className="form-body">
                {children}
            </div>
            <div className="form-actions">
                {onDelete && (
                    confirmingDelete ? (
                        <>
                            <span className="delete-confirm-label">Are you sure?</span>
                            <Button variant="danger" type="button" onClick={() => { setConfirmingDelete(false); onDelete(); }}>Yes, Delete</Button>
                            <Button variant="secondary" type="button" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
                        </>
                    ) : (
                        <Button variant="danger" type="button" onClick={() => setConfirmingDelete(true)}>Delete</Button>
                    )
                )}
                {extraActions && (
                    <div className="form-actions-extra">{extraActions}</div>
                )}
                <div className="form-actions-right">
                    <Button variant='secondary' type="button" onClick={onCancel} disabled={submitting}>Cancel</Button>
                    <Button variant='primary' type="button" onClick={onSubmit} loading={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
                </div>
            </div>
        </div>
    );
};
