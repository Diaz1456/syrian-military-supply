import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  'Tactical Apparel', 'Footwear', 'Gear & Packs', 'Optics', 'Knives & Tools',
  'Surplus', 'Patches & Morale', 'Medical & Survival', 'Local Crafts',
];

const empty = {
  name: '', sku: '', category: CATEGORIES[0], description: '',
  price: '', salePrice: '', stock: '', status: 'active', featured: false,
  material: '', weight: '', capacity: '', color: '', origin: '',
};

export default function ProductForm() {
  const { t } = useLanguage();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [images, setImages] = useState([]);
  const [existingImgs, setExistingImgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState(CATEGORIES);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    api.get('/admin/settings')
      .then((r) => {
        const c = r.data.settings?.categories;
        if (Array.isArray(c) && c.length) {
          setCategories(c.map((x) => x.name));
          setForm((f) => ({ ...f, category: c.some((x) => x.name === f.category) ? f.category : c[0].name }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/admin/products/${id}`)
      .then((r) => {
        const p = r.data.product;
        setForm({
          name: p.name || '', sku: p.sku || '', category: p.category || CATEGORIES[0], description: p.description || '',
          price: p.price ?? '', salePrice: p.salePrice ?? '', stock: p.stock ?? '', status: p.status || 'active',
          featured: !!p.featured,
          material: p.specs?.material || '', weight: p.specs?.weight || '', capacity: p.specs?.capacity || '',
          color: p.specs?.color || '', origin: p.specs?.origin || '',
        });
        setExistingImgs(p.images || []);
      })
      .catch((e) => setError(e.response?.data?.message || t('admin_failed_load')))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError(t('admin_err_name'));
    if (!isEdit && images.length === 0) return setError(t('admin_err_image'));
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) return setError(t('admin_err_price'));

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, k === 'featured' ? (v ? 'true' : 'false') : String(v ?? '')));
    images.forEach((img) => fd.append('images', img));
    setBusy(true);
    try {
      if (isEdit) await api.put(`/admin/products/${id}`, fd);
      else await api.post('/admin/products', fd);
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || t('admin_save_failed'));
      setBusy(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="admin-topbar">
        <h1>{isEdit ? t('admin_edit_product') : t('admin_new_product')}</h1>
        <button className="btn" onClick={() => navigate('/admin/products')}>← {t('admin_cancel_btn')}</button>
      </div>

      <form onSubmit={submit}>
        <div className="dash-grid" style={{ marginTop: 0 }}>
          <div className="dash-panel">
            <h3>{t('admin_basics')}</h3>
            <div className="form-grid">
              <div className="form-group"><label>{t('admin_name')}</label><input value={form.name} onChange={set('name')} /></div>
              <div className="form-group"><label>{t('admin_sku')}</label><input value={form.sku} onChange={set('sku')} placeholder="SMS-XXX-001" /></div>
              <div className="form-group">
                <label>{t('admin_category')}</label>
                <select value={form.category} onChange={set('category')}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{t('admin_status')}</label>
                <select value={form.status} onChange={set('status')}>
                  <option value="active">{t('admin_active')}</option>
                  <option value="inactive">{t('admin_inactive')}</option>
                </select>
              </div>
              <div className="form-group"><label>{t('admin_price')}</label><input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} /></div>
              <div className="form-group"><label>{t('admin_sale_price')}</label><input type="number" step="0.01" min="0" value={form.salePrice ?? ''} onChange={set('salePrice')} /></div>
              <div className="form-group"><label>{t('admin_stock')}</label><input type="number" min="0" value={form.stock} onChange={set('stock')} /></div>
              <div className="form-group full">
                <label>{t('admin_description')}</label>
                <textarea value={form.description} onChange={set('description')} />
              </div>
              <label className="form-group full" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, fontFamily: 'var(--font-head)' }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                {t('admin_featured')}
              </label>
            </div>
          </div>

          <div className="dash-panel">
            <h3>{t('admin_images')}</h3>
            {existingImgs.length > 0 && (
              <>
                <p className="muted" style={{ fontSize: '0.82rem', marginBottom: 8 }}>{t('admin_current_images')}</p>
                <div className="img-stack">
                  {existingImgs.map((img, i) => (
                    <img key={i} src={img.url} alt="" />
                  ))}
                </div>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ margin: '12px 0', color: 'var(--sand)' }}
              onChange={(e) => setImages(Array.from(e.target.files || []))}
            />
            {images.length > 0 && (
              <>
                <div className="img-stack">
                  {images.map((img, i) => (
                    <img key={i} src={URL.createObjectURL(img)} alt="" />
                  ))}
                </div>
                <p className="muted" style={{ fontSize: '0.8rem', marginTop: 8 }}>
                  {t('admin_files_staged', { count: images.length, replace: isEdit ? t('admin_replace_imgs') : '' })}
                </p>
              </>
            )}

            <h3 className="mt-24">{t('admin_specs')}</h3>
            <div className="form-grid mt-8">
              <div className="form-group"><label>{t('admin_material')}</label><input value={form.material} onChange={set('material')} /></div>
              <div className="form-group"><label>{t('admin_weight')}</label><input value={form.weight} onChange={set('weight')} /></div>
              <div className="form-group"><label>{t('admin_capacity')}</label><input value={form.capacity} onChange={set('capacity')} /></div>
              <div className="form-group"><label>{t('admin_color')}</label><input value={form.color} onChange={set('color')} /></div>
              <div className="form-group full"><label>{t('admin_origin')}</label><input value={form.origin} onChange={set('origin')} /></div>
            </div>
          </div>
        </div>

        {error && <div className="field-error mt-8">{error}</div>}
        <button className="btn primary block mt-16" type="submit" disabled={busy}>
          {busy ? t('admin_saving') : isEdit ? t('admin_save_changes') : t('admin_create_product')}
        </button>
      </form>
    </>
  );
}