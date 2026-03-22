import React from 'react';
import { TableProps } from './model';

import './styles.scss';

export const Table: React.FC<TableProps> = (props) => {
    const { headers, rows } = props
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th>{header.title}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((inv: any, rowIndex: number) => (
                        <tr key={rowIndex}>
                            {headers.map((header) => (
                                <td key={header.title}>
                                    {inv[header.id]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}