import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RepoStoreProvider } from './stores/RepoStore.tsx';
import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <RepoStoreProvider>
        <App />
      </RepoStoreProvider>
    </React.StrictMode>
);