import React from 'react';
import { FormWrapperProps } from './model';

import './styles.scss';

export const FormWrapper: React.FC<FormWrapperProps> = ({ title, onSubmit, onCancel, onDelete, children }) => {
    return (
        <div className="form-wrapper">
            <div className="form-header">
                <h1>{title}</h1>
            </div>
            <div className="form-body">
                {children}
            </div>
            <div className="form-actions">
                {onDelete && (
                    <button className="btn-danger" type="button" onClick={onDelete}>Delete</button>
                )}
                <div className="form-actions-right">
                    <button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button>
                    <button className="btn-primary" type="button" onClick={onSubmit}>Save</button>
                </div>
            </div>
        </div>
    );
};
