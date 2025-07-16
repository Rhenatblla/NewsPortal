import React from 'react';
import { Router } from './Router';
import { AppProviders } from './AppProviders';
import { NewsProvider } from '../context/NewsContext'; 
import '../assets/styles/index.css';

const App = () => {
  return (
    <AppProviders>
      <NewsProvider>
        <Router />
      </NewsProvider>
    </AppProviders>
  );
};

export default App;
