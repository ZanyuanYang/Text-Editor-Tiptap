import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { TiptapProvider } from '@/contexts/tiptap_context';
import { GlobalProvider } from '@/contexts/global_context';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalProvider>
        <TiptapProvider>
          <App />
        </TiptapProvider>
      </GlobalProvider>
    </BrowserRouter>
  </React.StrictMode>
);
