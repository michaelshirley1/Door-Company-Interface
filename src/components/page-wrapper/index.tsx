import React from 'react';
import { PageWrapperProps } from './model';

import './styles.scss';

export const PageWrapper: React.FC<PageWrapperProps> = (props) => {
    const { title, buttonTitle, buttonAction, children } = props
    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h1>{title}</h1>
                {buttonTitle && <button className="btn-primary" onClick={buttonAction}>{buttonTitle}</button>}
            </div>
            {children}
        </div>
    )
}