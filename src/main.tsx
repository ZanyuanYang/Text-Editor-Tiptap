import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import 'tippy.js/dist/tippy.css';
import 'katex/dist/katex.min.css';
import { GlobalProvider } from '@/contexts/global_context';
import { DocumentsProvider } from '@/contexts/documents_context';
import { initThemeOnLoad } from '@/hooks/useTheme';

initThemeOnLoad();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalProvider>
        <DocumentsProvider>
          <App />
        </DocumentsProvider>
      </GlobalProvider>
    </BrowserRouter>
  </React.StrictMode>
);
