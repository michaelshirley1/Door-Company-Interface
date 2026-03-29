import React from 'react';
import { StatusProps } from './model';

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
        if (s === 'Draft') return 'neutral';
        return 'processing';
    };

    const purchaseOrderStatusType = (s: string): 'good' | 'processing' | 'warn' | 'error' | 'neutral' => {
        if (s === 'Delivered' || s === 'Ready') return 'good';
        if (s === 'Cancelled') return 'error';
        return 'processing';
    };

    const quotesStatusType = (s: string): 'good' | 'processing' | 'warn' | 'error' | 'neutral' => {
        if (s === 'Accepted') return 'good';
        if (s === 'Declined') return 'error';
        if (s === 'Expired') return 'warn';
        if (s === 'Draft') return 'neutral';
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
            case "purchase-order":
                typeValue = purchaseOrderStatusType(content)
                break
            case "quotes":
                typeValue = quotesStatusType(content)
        }
    }

    return (
        <span className={`status-badge ${typeValue}`}>{content}</span>
    )
}