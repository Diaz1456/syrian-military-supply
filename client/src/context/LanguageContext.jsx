import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

/**
 * Language provider.
 *
 * Arabic (ar) is the site default; preference is persisted to localStorage
 * under `sms_lang`. Switching language updates <html lang> and <html dir>
 * (LTR / RTL) so layout mirrors correctly, and sets `dir=rtl` on the html
 * element so CSS can use `[dir="rtl"]` selectors.
 */
const LanguageContext = createContext(null);

const LS_KEY = 'sms_lang';
const DEFAULT_LANG = 'ar';

function readStoredLang() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch { /* ignore */ }
  return DEFAULT_LANG;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang);

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.classList.toggle('rtl', lang === 'ar');
    document.documentElement.classList.toggle('ltr', lang === 'en');
    try {
      localStorage.setItem(LS_KEY, lang);
    } catch { /* ignore */ }
  }, [lang]);

  /**
   * Translate a key, interpolating {{var}} placeholders from `vars`.
   * Falls back to the raw key if a translation is missing.
   */
  const t = useCallback(
    (key, vars = {}) => {
      let str = translations[lang]?.[key] ?? translations.en[key] ?? key;
      Object.entries(vars).forEach(([k, v]) => {
        str = String(str).split(`{{${k}}}`).join(v === null || v === undefined ? '' : String(v));
      });
      return str;
    },
    [lang]
  );

  /**
   * Plural-aware label helper: pass the number and up to three variants.
   *   tN(1, one, other)        → one
   *   tN(2, one, two, other)   → two  (Arabic dual)
   */
  const tN = useCallback(
    (n, one, two, other) => {
      if (n === 1) return one;
      if (two && n === 2) return two;
      return other ?? one;
    },
    []
  );

  const setLang = useCallback((nextLang) => {
    if (nextLang === 'ar' || nextLang === 'en') setLangState(nextLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, tN, dir: lang === 'ar' ? 'rtl' : 'ltr', isRTL: lang === 'ar' }),
    [lang, setLang, toggleLang, t, tN]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};