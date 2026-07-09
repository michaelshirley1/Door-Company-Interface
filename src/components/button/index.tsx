import React from 'react';
import { ButtonProps } from './model';
import './style.scss';

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, loading, disabled, children, ...rest }) => {
    return (
        <button
            className={`btn btn-${variant}${className ? ` ${className}` : ''}`}
            disabled={loading || disabled}
            {...rest}
        >
            {loading ? <><span className="btn-spinner" />{'  '}</> : null}
            {children}
        </button>
    );
};

export default Button;
