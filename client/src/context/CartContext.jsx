import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';

const CartContext = createContext(null);
const KEY = 'sms_cart';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [notice, setNotice] = useState(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const totalCount = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((n, i) => n + i.effectivePrice * i.quantity, 0),
    [items]
  );

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.effectivePrice ?? product.price,
          effectivePrice: product.effectivePrice ?? product.price,
          originalPrice: product.price,
          image: product.images?.[0]?.url || '',
          sku: product.sku,
          stock: product.stock,
          quantity,
        },
      ];
    });
  };

  const updateQty = (productId, qty) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock || 99)) } : i
      )
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  useEffect(() => {
    if (totalCount >= 10) {
      setNotice({ type: 'squad', msg: t('cart_big_haul') });
    } else {
      setNotice(null);
    }
  }, [totalCount, lang]);

  const value = {
    items,
    totalCount,
    subtotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    notice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};