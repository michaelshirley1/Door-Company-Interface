import React from 'react';

export interface FormFieldProps {
    label: string;
    /** When set, adds `.has-error` to the wrapper and renders a `.field-error` message. */
    error?: string;
    children: React.ReactNode;
}

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    /** Raw `<option>` elements — kept flexible for conditional/dynamic option lists. */
    children: React.ReactNode;
}

export interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}
