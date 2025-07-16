import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { NewsProvider } from '../context/NewsContext';
import { SearchProvider } from '../context/SearchContext';

export const AppProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NewsProvider>
          <SearchProvider> {/* ✅ Bungkus di sini */}
            {children}
          </SearchProvider>
        </NewsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
