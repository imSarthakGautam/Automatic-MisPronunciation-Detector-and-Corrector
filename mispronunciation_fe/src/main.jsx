import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AudioProvider } from './contexts/AudioContext';
import { SidebarProvider } from './contexts/SidebarContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <SidebarProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
      </SidebarProvider>
    </BrowserRouter>
  </React.StrictMode>
);