import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './root/routes';
import reportWebVitals from './reportWebVitals';
import { AppProvider } from './context/AppContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);

reportWebVitals();
