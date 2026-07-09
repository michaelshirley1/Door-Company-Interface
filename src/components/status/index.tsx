import React from 'react';
import { StatusProps, ActiveStatusProps } from './model';

import './styles.scss';

export const Status: React.FC<StatusProps> = (props) => {
    const { content, variation, type } = props
    var typeValue = type
    
    const jobStatusType = (s: string): 'good' | 'processing' | 'warn' | 'error' | 'neutral' => {
        if (s === 'Completed') return 'good';
        if (s === 'Cancelled') return 'error';
        if (s === 'On Hold') return 'warn';
        return 'processing';
    };

    const invoiceStatusType = (s: string): 'good' | 'processing' | 'warn' | 'error' | 'neutral' => {
        if (s === 'Paid') return 'good';
        if (s === 'Overdue' || s === 'Void') return 'error';
        if (s === 'Invoice') return 'processing';
        if (s === 'Draft') return 'neutral';
        return 'processing';
    };

    const orderStatusType = (s: string): 'good' | 'processing' | 'warn' | 'error' | 'neutral' => {
        if (s === 'Delivered') return 'good';
        if (s === 'Cancelled') return 'error';
        if (s === 'Ready') return 'warn';
        if (s === 'Received') return 'neutral';
        return 'processing';
    };

    const quotesStatusType = (s: string): 'good' | 'processing' | 'warn' | 'error' | 'neutral' => {
        if (s === 'Accepted') return 'good';
        if (s === 'Order' || s === 'Dispatched') return 'processing';
        if (s === 'Delivered') return 'good';
        if (s === 'Declined') return 'error';
        if (s === 'Expired') return 'warn';
        if (s === 'Draft' || s === 'Nullified') return 'neutral';
        return 'processing';
    };

    if (!typeValue) {
        switch (variation) {
            case "customer":
            case "invoice":
                typeValue = invoiceStatusType(content)
                break
            case "job":
                typeValue = jobStatusType(content)
                break
            case "quotes":
                typeValue = quotesStatusType(content)
                break
            case "order":
                typeValue = orderStatusType(content)
        }
    }

    return (
        <span className={`status-badge ${typeValue}`}>{content}</span>
    )
}

export const ActiveStatus: React.FC<ActiveStatusProps> = ({ active }) => (
    <Status content={active ? 'Active' : 'Inactive'} type={active ? 'good' : 'warn'} />
);