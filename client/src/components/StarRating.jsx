import React from 'react';

export default function StarRating({ value = 0, onChange, readOnly = true, size = '1.1rem' }) {
  const stars = [1, 2, 3, 4, 5];
  const render = onChange ? 'button' : 'span';
  return (
    <span className="review-stars" style={{ fontSize: size, display: 'inline-flex', gap: 2 }}>
      {stars.map((s) => {
        const filled = s <= Math.round(value);
        const comp = React.createElement(
          render,
          {
            key: s,
            type: onChange ? 'button' : undefined,
            onClick: onChange ? () => onChange(s) : undefined,
            style:
              onChange
                ? { background: 'none', border: 'none', padding: 2, cursor: 'pointer', fontSize: 'inherit', color: 'inherit' }
                : undefined,
            ariaLabel: `${s} star${s > 1 ? 's' : ''}`,
          },
          filled ? '★' : '☆'
        );
        return React.cloneElement(comp, { key: s });
      })}
    </span>
  );
}