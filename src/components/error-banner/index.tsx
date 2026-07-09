import React from 'react';
import { ErrorBannerProps } from './model';

import './styles.scss';

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => (
    <p className="error-banner">{message}</p>
);

export default ErrorBanner;
