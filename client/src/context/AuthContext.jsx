import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'sms_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/admin/login', { username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  const me = useCallback(async () => {
    const { data } = await api.get('/admin/me');
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    const { data } = await api.post('/admin/change-password', { currentPassword, newPassword });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    return data;
  }, []);

  useEffect(() => {
    if (token) {
      me().catch(() => logout());
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const value = { token, admin, loading, login, logout, me, changePassword };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);