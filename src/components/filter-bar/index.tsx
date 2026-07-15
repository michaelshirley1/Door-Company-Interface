import React from 'react';
import { FilterBarProps, FilterOption, FilterSelectProps, FilterSearchProps } from './model';

import './style.scss';

export const FilterBar: React.FC<FilterBarProps> = ({ children, showClear, onClear }) => (
    <div className="filter-bar">
        {children}
        {showClear && onClear && (
            <button className="filter-bar-clear" onClick={onClear}>Clear</button>
        )}
    </div>
);

export const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, onChange, options, disabled }) => (
    <div className="filter-bar-group">
        <label>{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
            <option value="">All</option>
            {options.map(opt => {
                const o: FilterOption = typeof opt === 'object' ? opt : { value: opt, label: String(opt) };
                return <option key={o.value} value={o.value}>{o.label}</option>;
            })}
        </select>
    </div>
);

export const FilterSearch: React.FC<FilterSearchProps> = ({ label, value, onChange, placeholder }) => (
    <div className="filter-bar-group">
        <label>{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
);
