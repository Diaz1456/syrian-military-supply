import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const STATUS = {
  in: { cls: 'in', label: 'In Supply', icon: '🟢' },
  low: { cls: 'low', label: 'Limited', icon: '🟡' },
  out: { cls: 'out', label: 'Depleted', icon: '🔴' },
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const status = product.stockStatus || (product.stock <= 0 ? 'out' : product.stock <= 5 ? 'low' : 'in');
  const st = STATUS[status] || STATUS.in;
  const onSale = product.salePrice && product.salePrice < product.price;
  const eff = onSale ? product.salePrice : product.price;

  return (
    <article className="product-card">
      <div className="card-img">
        <Link to={`/product/${product._id}`}>
          <img src={product.images?.[0]?.url || 'https://placehold.co/900x900/20242b/6b7279?text=No+Image'} alt={product.name} loading="lazy" />
        </Link>
        <div className="card-badges">
          {onSale && <span className="tag sale">Mission Sale</span>}
          {product.featured && <span className="tag">Featured</span>}
        </div>
        <span className={`stock-pill ${st.cls}`}>{st.icon} {st.label}</span>
      </div>
      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <h3 className="card-title"><Link to={`/product/${product._id}`}>{product.name}</Link></h3>
        <div className="price-row">
          <span className={`price ${onSale ? 'sale' : ''}`}>${Number(eff).toFixed(2)}</span>
          {onSale && <span className="price old">${Number(product.price).toFixed(2)}</span>}
        </div>
        <div className="card-actions">
          <button
            className="btn small primary"
            disabled={status === 'out'}
            onClick={() => addToCart(product)}
          >
            {status === 'out' ? 'Depleted' : '+ Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}