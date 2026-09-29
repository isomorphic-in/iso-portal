import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { API_BASE_URL } from './config/api';

if (API_BASE_URL && typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (resource, init) {
    if (typeof resource === 'string' && resource.startsWith('/api')) {
      resource = `${API_BASE_URL.replace(/\/$/, '')}${resource}`;
    }
    return originalFetch(resource, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
