import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, getTokenExpiry, onUnauthorized, setToken } from './api';

const AuthContext = createContext(null);
const MAX_TIMEOUT = 2 ** 31 - 3;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [sessionExpired, setSessionExpired] = useState(false);

  function endSession(expired) {
    setToken(null);
    setTokenState(null);
    setUser(null);
    setSessionExpired(expired);
  }

  // Any 401 on an authenticated request logs the user out.
  useEffect(() => {
    onUnauthorized(() => endSession(true));
    return () => onUnauthorized(() => {});
  }, []);

  // Log out as soon as the token's exp time passes, even if no request is made.
  useEffect(() => {
    if (!token) return undefined;
    const expiry = getTokenExpiry(token);
    const delay = expiry === null ? null : Math.max(expiry - Date.now(), 0);
    // setTimeout fires immediately for delays over ~24.8 days; the 401 handler covers those.
    if (delay === null || delay > MAX_TIMEOUT) return undefined;
    const timer = setTimeout(() => endSession(true), delay);
    return () => clearTimeout(timer);
  }, [token]);

  useEffect(() => {
    if (!getToken()) return;
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => endSession(false))
      .finally(() => setLoading(false));
  }, []);

  function startSession(data) {
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    setSessionExpired(false);
  }

  async function login(credentials) {
    startSession(await api.login(credentials));
  }

  async function register(credentials) {
    startSession(await api.register(credentials));
  }

  function logout() {
    endSession(false);
  }

  return (
    <AuthContext.Provider value={{ user, loading, sessionExpired, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
