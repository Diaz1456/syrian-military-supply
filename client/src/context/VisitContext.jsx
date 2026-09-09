import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

const VisitContext = createContext(null);

function genId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const VISITOR_KEY = 'sms_visitor_id';
const VISIT_COUNT_KEY = 'sms_visits';
const PRODUCTIVITY_KEY = 'sms_last_page_ts';

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = genId();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getVisitCount() {
  const n = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
  return Number.isNaN(n) ? 0 : n;
}

function rankOf(visits) {
  if (visits >= 25) return { name: 'General Goods', icon: '⭐', level: 4 };
  if (visits >= 10) return { name: 'Captain Cart', icon: '🎖️', level: 3 };
  if (visits >= 5) return { name: 'Sergeant Shopper', icon: '🪖', level: 2 };
  return { name: 'Private Browser', icon: '🎗️', level: 1 };
}

export function VisitProvider({ children }) {
  const location = useLocation();
  const idRef = useRef(null);
  const [visits, setVisits] = useState(getVisitCount);
  const [rank, setRank] = useState(() => rankOf(getVisitCount()));
  const lastTs = useRef(Date.now());

  const send = (action) => {
    const payload = {
      action,
      visitorId: idRef.current,
      page: window.location.pathname,
      duration: Math.floor((Date.now() - lastTs.current) / 1000),
    };
    api
      .post('/visitors/track', payload)
      .then((res) => {
        if (res.data && res.data.visitCount) {
          localStorage.setItem(VISIT_COUNT_KEY, String(res.data.visitCount));
          setVisits(res.data.visitCount);
          setRank(rankOf(res.data.visitCount));
        }
      })
      .catch(() => {});
    lastTs.current = Date.now();
  };

  useEffect(() => {
    idRef.current = getVisitorId();
    send('enter');
  }, []);

  useEffect(() => {
    send('page');
  }, [location.pathname]);

  useEffect(() => {
    const onUnload = () => {
      const payload = {
        action: 'exit',
        visitorId: idRef.current,
        page: window.location.pathname,
        duration: Math.floor((Date.now() - lastTs.current) / 1000),
      };
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon
        ? navigator.sendBeacon('/api/visitors/track', blob)
        : navigator.sendBeacon && fetch('/api/visitors/track', { method: 'POST', body: blob, keepalive: true });
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return (
    <VisitContext.Provider value={{ visits, rank }}>{children}</VisitContext.Provider>
  );
}

export const useVisit = () => useContext(VisitContext);