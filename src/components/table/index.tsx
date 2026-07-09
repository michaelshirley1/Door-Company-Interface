import React from 'react';
import { TableProps } from './model';

import './styles.scss';
import Button from '../button';

export function Table<T = Record<string, unknown>>({ headers, rows, onRowClick, onAddClick, emptyMessage }: TableProps<T>) {
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header.id}>{header.title}</th>
                        ))}
                        {onAddClick && (
                            <th className="th-add-btn">
                                <Button className="table-add-btn" onClick={onAddClick}>+ Add</Button>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 && emptyMessage && (
                        <tr className="table-empty-row">
                            <td className="table-empty-cell" colSpan={headers.length + (onAddClick ? 1 : 0)}>
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} onClick={() => onRowClick?.(row, rowIndex)}>
                            {headers.map((header) => (
                                <td key={header.id}>
                                    {header.render
                                        ? header.render((row as Record<string, any>)[header.id], row, rowIndex)
                                        : (row as Record<string, any>)[header.id] ?? '—'}
                                </td>
                            ))}
                            {onAddClick && <td />}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
