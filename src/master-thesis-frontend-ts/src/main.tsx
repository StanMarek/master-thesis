import ReactDOM from 'react-dom/client';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { App } from './App';

export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL ?? 'http://127.0.0.1:3000/api';
export const BASE_WS_URL = import.meta.env.VITE_BASE_WS_URL ?? 'ws://127.0.0.1:3001/ws-events';
export const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
export const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;
export const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Auth0Provider
    domain={AUTH0_DOMAIN}
    clientId={AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: AUTH0_AUDIENCE,
      display: 'popup',
    }}
  >
    <App />
  </Auth0Provider>,
);
