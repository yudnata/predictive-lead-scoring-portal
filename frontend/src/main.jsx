import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* APP DIBUNGKUS DENGAN BROWSER ROUTER */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
