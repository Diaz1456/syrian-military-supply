import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';

const SettingsContext = createContext({ settings: null, loaded: false, refresh: () => {}, publish: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const publish = useCallback((next) => {
    setSettings(next);
    setLoaded(true);
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
    <SettingsContext.Provider value={{ settings, loaded, refresh, publish }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}