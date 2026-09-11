import React, { useEffect, useState } from 'react';
import api from '../api';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminSettings() {
  const { t } = useLanguage();
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
      setErr(e2.response?.data?.message || t('admin_save_failed'));
    }
  };

  if (!settings) return <div className="spinner" />;

  return (
    <>
      <div className="admin-topbar">
        <h1>{t('admin_store_settings')}</h1>
        {saved && <span style={{ color: 'var(--good)' }}>{t('admin_saved')}</span>}
      </div>

      <form onSubmit={save} className="panel" style={{ maxWidth: 640 }}>
        <div className="form-grid">
          <div className="form-group"><label>{t('admin_store_name')}</label><input value={settings.storeName} onChange={set('storeName')} /></div>
          <div className="form-group"><label>{t('admin_tagline')}</label><input value={settings.tagline} onChange={set('tagline')} /></div>
          <div className="form-group"><label>{t('admin_currency')}</label><input value={settings.currency} onChange={set('currency')} /></div>
          <div className="form-group"><label>{t('admin_flat_shipping')}</label><input type="number" step="0.01" min="0" value={settings.shippingFlatRate} onChange={set('shippingFlatRate')} /></div>
          <div className="form-group"><label>{t('admin_free_ship_threshold')}</label><input type="number" step="0.01" min="0" value={settings.freeShippingThreshold} onChange={set('freeShippingThreshold')} /></div>
          <div className="form-group"><label>{t('admin_notify_email')}</label><input type="email" value={settings.notificationEmail || ''} onChange={set('notificationEmail')} /></div>
          <div className="form-group"><label>{t('admin_contact_email')}</label><input type="email" value={settings.contactEmail || ''} onChange={set('contactEmail')} /></div>
          <div className="form-group"><label>{t('admin_hours')}</label><input value={settings.hoursOfOperation || ''} onChange={set('hoursOfOperation')} /></div>
        </div>
        {err && <div className="field-error mt-8">{err}</div>}
        <button className="btn primary mt-16" type="submit">{t('admin_save_settings')}</button>
      </form>
    </>
  );
}