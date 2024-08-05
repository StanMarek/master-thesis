import ReactDOM from 'react-dom/client'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Auth0Provider
    domain='dev-12wyyjij7ak1f3zd.us.auth0.com'
    clientId='iB85PTTSKFi6v5TTZrWZ91h3Fnt6Bkep'
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: 'https://master-thesis-api.com',
      display: 'popup',
    }}>
    <App />
  </Auth0Provider>
)
