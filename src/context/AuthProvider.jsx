import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import authApi, { setToken } from "../api/authApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { toggleTheme } from "../utils/toggleTheme";
import { useAuth } from "react-oidc-context";

export const AuthProvider = ({ children }) => {
  
  const oidc = useAuth();
  const {
    isLoading: oidcLoading,
    isAuthenticated,
    signinRedirect,
    signoutRedirect,    
  } = oidc;

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    toggleTheme(savedTheme);
  }, []);

  const getAccessToken = useCallback(async () => {
    if (oidc.user && !oidc.user.expired) {      
      return oidc.user.access_token;
    }

    try {
      const refreshed = await oidc.signinRedirect();
      return refreshed?.access_token;
    } catch (err) {
      console.error("Token refresh error:", err);
      throw err;
    }
   },[oidc]);

  const authInit = useCallback(async () => {
    if (!isAuthenticated) {      
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setToken(getAccessToken);

      const { data : {data} } = await authApi.get("/users/me");
      setUser(data);

      const theme = data?.themePreference || "dark";
      localStorage.setItem("theme", theme);
      toggleTheme(theme);

    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessToken]);

  useEffect(() => {
    if (!oidcLoading) {
      authInit();
    }
  }, [oidcLoading, authInit]);

  const logout = useCallback((opts) => {

    const retunTo = opts?.logoutParam?.retunTo || window.location.origin;
    return signoutRedirect({ post_logout_redirect_uri: retunTo });

  },[signoutRedirect]);

  const login = useCallback((opts) => {
    signinRedirect({state: opts?.appState})
  }, [signinRedirect]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      refreshUser: authInit,
      getAccessToken,
      login,
      logout,
      setUser,
    }),
    [user, isAuthenticated, isLoading, authInit, getAccessToken, login, logout, setUser]
  );

  if (oidcLoading || isLoading) {
    return <LoadingSpinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
