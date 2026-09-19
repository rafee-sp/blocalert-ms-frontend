import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from 'react-oidc-context'

const oidcConfig = {
  authority: import.meta.env.VITE_KEYCLOAK_AUTHORITY,
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: `${window.location.origin}/callback`,    
  scope: "openid profile email",
  automaticSilentRenew: true,
  userStore: undefined,
  onSignCallback: (user) => {
    try{
      const returnTo = user?.state?.returnTo || window.location.pathname || "/";
      window.history.replaceState({}, document.title, returnTo);
    } catch (error) {
      console.error("Redirect callback error:", error);
      window.location.href = "/";
    }
  }
}

createRoot(document.getElementById('root')).render(
  
   <AuthProvider {...oidcConfig}>  
      <App />    
   </AuthProvider>
  ,
)
