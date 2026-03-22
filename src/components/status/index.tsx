import React from 'react';
import { StatusProps } from './model';

import './styles.scss';

export const Status: React.FC<StatusProps> = (props) => {
    const { content, type } = props

    return (
        <span className={`status-badge ${type}`}>{content}</span>
    )
}