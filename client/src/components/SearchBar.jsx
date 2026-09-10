import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function SearchBar({ onNavigate }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      const term = q.trim();
      if (term.length < 2) {
        setResults([]);
        return;
      }
      api
        .get('/products/search', { params: { q: term } })
        .then((res) => setResults(res.data.results || []))
        .catch(() => setResults([]));
    }, 220);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
      onNavigate && onNavigate();
    }
  };

  const go = (id) => {
    navigate(`/product/${id}`);
    setOpen(false);
    setQ('');
    onNavigate && onNavigate();
  };

  return (
    <form className="search-box" onSubmit={submit} ref={boxRef}>
      <input
        type="search"
        placeholder={t('search_placeholder')}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      <button type="submit" aria-label={t('search_label')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.5-4.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && results.length > 0 && (
        <div className="search-suggest">
          {results.map((p) => (
            <Link key={p._id} to={`/product/${p._id}`} onClick={() => go(p._id)}>
              <img src={p.images?.[0]?.url || 'https://placehold.co/80x80/efede6/9aa1a9?text=No+Image'} alt={p.name} loading="lazy" />
              <div className="p">
                <div>{p.name}</div>
                <div className="muted" style={{ fontSize: '0.72rem' }}>{p.category}</div>
              </div>
              <span className="pr">
                ${((p.salePrice && p.salePrice < p.price) ? p.salePrice : p.price).toFixed(2)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </form>
  );
}