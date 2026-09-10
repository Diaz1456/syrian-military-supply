import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';

const CACHE_KEY = 'sms_settings_cache';

const SettingsContext = createContext({ settings: null, refresh: () => {}, publish: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    } catch {
      return null;
    }
  });

  const publish = useCallback((next) => {
    setSettings(next);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(() => {
    api
      .get('/settings/public')
      .then((res) => publish(res.data))
      .catch(() => {});
  }, [publish]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, refresh, publish }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}