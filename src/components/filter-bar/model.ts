import React from 'react';

export interface FilterBarProps {
    children: React.ReactNode;
    /** When true (and onClear is provided) a "Clear" button is shown after the filter groups. */
    showClear?: boolean;
    onClear?: () => void;
}

export interface FilterOption {
    value: string | number;
    label: string;
}

export interface FilterSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    /** Plain values render as-is; pass `{ value, label }` for custom option text. An "All" option is always prepended. */
    options: (string | number | FilterOption)[];
    disabled?: boolean;
}
