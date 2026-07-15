import React from 'react';
import { FormFieldProps, TextFieldProps, SelectFieldProps, TextAreaFieldProps } from './model';


export const FormField: React.FC<FormFieldProps> = ({ label, error, children }) => (
    <div className={`form-field${error ? ' has-error' : ''}`}>
        <label>{label}</label>
        {children}
        {error && <span className="field-error">{error}</span>}
    </div>
);

export const TextField: React.FC<TextFieldProps> = ({ label, error, ...inputProps }) => (
    <FormField label={label} error={error}>
        <input {...inputProps} />
    </FormField>
);

export const SelectField: React.FC<SelectFieldProps> = ({ label, error, children, ...selectProps }) => (
    <FormField label={label} error={error}>
        <select {...selectProps}>{children}</select>
    </FormField>
);

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, error, ...textareaProps }) => (
    <FormField label={label} error={error}>
        <textarea {...textareaProps} />
    </FormField>
);

export default FormField;
