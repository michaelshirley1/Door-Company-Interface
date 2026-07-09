import React from 'react';
import { ReadOnlyFieldProps } from './model';

import './styles.scss';

export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({ label, value, onClick, title, strong }) => {
    const classes = ['read-only-input'];
    if (onClick) classes.push('clickable');
    if (strong) classes.push('strong');

    return (
        <div className="form-field read-only-field">
            <label>{label}</label>
            <input
                value={value}
                readOnly
                className={classes.join(' ')}
                onClick={onClick}
                title={title}
            />
        </div>
    );
};

export default ReadOnlyField;
