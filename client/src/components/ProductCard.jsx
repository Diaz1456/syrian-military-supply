import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const STATUS = {
  in: { cls: 'in', key: 'status_in', icon: '●' },
  low: { cls: 'low', key: 'status_low', icon: '●' },
  out: { cls: 'out', key: 'status_out', icon: '●' },
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const status = product.stockStatus || (product.stock <= 0 ? 'out' : product.stock <= 5 ? 'low' : 'in');
  const st = STATUS[status] || STATUS.in;
  const onSale = product.salePrice && product.salePrice < product.price;
  const eff = onSale ? product.salePrice : product.price;

  return (
    <article className="product-card">
      <div className="pc-media">
        <Link to={`/product/${product._id}`}>
          <img src={product.images?.[0]?.url || 'https://placehold.co/900x900/efede6/9aa1a9?text=No+Image'} alt={product.name} loading="lazy" />
        </Link>
      </div>
      <div className="pc-body">
        <div className="pc-top">
          <span className="pc-cat">{product.category}</span>
          {onSale && <span className="pc-sale">{t('sale')}</span>}
        </div>
        <h3 className="pc-name"><Link to={`/product/${product._id}`}>{product.name}</Link></h3>
        <div className="pc-foot">
          <span>
            <span className="pc-price">${Number(eff).toFixed(2)}</span>
            {onSale && <span className="pc-price old">${Number(product.price).toFixed(2)}</span>}
          </span>
          <span className="pc-stock"><span className={`dot ${st.cls}`} />{t(st.key)}</span>
        </div>
      </div>
    </article>
  );
}