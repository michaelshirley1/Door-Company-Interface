import React from 'react';
import { TableProps } from './model';

import './styles.scss';

export const Table: React.FC<TableProps> = (props) => {
    const { headers, rows, onRowClick } = props
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header.id}>{header.title}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row: any, rowIndex: number) => (
                        <tr key={rowIndex} onClick={() => onRowClick?.(row)}>
                            {headers.map((header) => (
                                <td key={header.id}>
                                    {header.render ? header.render(row[header.id], row) : row[header.id]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
