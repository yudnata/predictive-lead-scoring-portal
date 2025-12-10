import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AIContextProvider } from './context/AIContextProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AIContextProvider>
          <App />
        </AIContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
