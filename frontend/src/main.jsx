import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SocketProvider } from './api/socketContext.jsx'; // 1. Import your provider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider> {/* 2. Wrap App inside it */}
      <App />
    </SocketProvider>
  </React.StrictMode>
);