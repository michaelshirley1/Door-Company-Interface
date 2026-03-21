import React from 'react';
import { HomePageProps } from './model';

import './style.scss';

const HomePage: React.FC<HomePageProps> = () => {
    return (
        <div className="home-page">
            <h1>Home</h1>
            <p>Welcome to the Home page.</p>
        </div>
    );
};

export default HomePage;