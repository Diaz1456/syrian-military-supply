import React, { useEffect, useState } from 'react';
import api from '../api';
import { useSettings } from '../context/SettingsContext';

export default function AdminSettings() {
  const { publish } = useSettings();
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/admin/settings').then((r) => setSettings(r.data.settings)).catch(() => {});
  }, []);

  const set = (k) => (e) => setSettings({ ...settings, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setErr('');
    setSaved(false);
    try {
      const { data } = await api.put('/admin/settings', settings);
      setSettings(data.settings);
      publish(data.settings);
      setSaved(true);
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Save failed');
    }
  };

  if (!settings) return <div className="spinner" />;

  return (
    <>
      <div className="admin-topbar">
        <h1>Store Settings</h1>
        {saved && <span style={{ color: 'var(--good)' }}>✔ Saved</span>}
      </div>

      <form onSubmit={save} className="panel" style={{ maxWidth: 640 }}>
        <div className="form-grid">
          <div className="form-group"><label>Store Name</label><input value={settings.storeName} onChange={set('storeName')} /></div>
          <div className="form-group"><label>Tagline</label><input value={settings.tagline} onChange={set('tagline')} /></div>
          <div className="form-group"><label>Currency</label><input value={settings.currency} onChange={set('currency')} /></div>
          <div className="form-group"><label>Flat Shipping Rate ($)</label><input type="number" step="0.01" min="0" value={settings.shippingFlatRate} onChange={set('shippingFlatRate')} /></div>
          <div className="form-group"><label>Free Shipping Threshold ($)</label><input type="number" step="0.01" min="0" value={settings.freeShippingThreshold} onChange={set('freeShippingThreshold')} /></div>
          <div className="form-group"><label>Notification Email</label><input type="email" value={settings.notificationEmail || ''} onChange={set('notificationEmail')} /></div>
          <div className="form-group"><label>Contact Email</label><input type="email" value={settings.contactEmail || ''} onChange={set('contactEmail')} /></div>
          <div className="form-group"><label>Hours of Operation</label><input value={settings.hoursOfOperation || ''} onChange={set('hoursOfOperation')} /></div>
        </div>
        {err && <div className="field-error mt-8">{err}</div>}
        <button className="btn primary mt-16" type="submit">Save Settings</button>
      </form>
    </>
  );
}