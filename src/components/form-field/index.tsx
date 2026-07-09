import React from 'react';
import { FormFieldProps, TextFieldProps, SelectFieldProps, TextAreaFieldProps } from './model';

// The `.form-field` / `.has-error` / `.field-error` styles are context-scoped and
// already live in the shared stylesheets (`components/modal/style.scss` for modal
// forms, `components/form-wrapper/styles.scss` for page forms), so this component
// deliberately has no stylesheet of its own.

/** Generic labelled field wrapper. Use the specialised variants below where possible. */
export const FormField: React.FC<FormFieldProps> = ({ label, error, children }) => (
    <div className={`form-field${error ? ' has-error' : ''}`}>
        <label>{label}</label>
        {children}
        {error && <span className="field-error">{error}</span>}
    </div>
);

/** `FormField` wrapping an `<input>`. All standard input props pass through. */
export const TextField: React.FC<TextFieldProps> = ({ label, error, ...inputProps }) => (
    <FormField label={label} error={error}>
        <input {...inputProps} />
    </FormField>
);

/** `FormField` wrapping a `<select>`. Pass `<option>` elements as children. */
export const SelectField: React.FC<SelectFieldProps> = ({ label, error, children, ...selectProps }) => (
    <FormField label={label} error={error}>
        <select {...selectProps}>{children}</select>
    </FormField>
);

/** `FormField` wrapping a `<textarea>`. All standard textarea props pass through. */
export const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, error, ...textareaProps }) => (
    <FormField label={label} error={error}>
        <textarea {...textareaProps} />
    </FormField>
);

export default FormField;
