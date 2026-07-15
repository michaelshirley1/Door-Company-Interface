import React from 'react';

export interface FilterBarProps {
    children: React.ReactNode;
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
    options: (string | number | FilterOption)[];
    disabled?: boolean;
}

export interface FilterSearchProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}
