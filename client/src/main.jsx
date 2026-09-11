import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { VisitProvider } from './context/VisitContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import './styles/theme.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <BrowserRouter>
          <SettingsProvider>
            <AuthProvider>
              <CartProvider>
                <VisitProvider>
                  <App />
                </VisitProvider>
              </CartProvider>
            </AuthProvider>
          </SettingsProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);