import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeItem } from '../redux/slices/cartSlice';
import '../styles/cart.css';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart.items || []);

  const updateQty = (id, qty) => {
    const q = Math.max(0, Number(q) || 0);
    if (q <= 0) {
      dispatch(removeItem(id));
    } else {
      dispatch(updateQuantity({ id, quantity: q }));
    }
  };

  const remove = (id) => {
    dispatch(removeItem(id));
  };

  const total = cart.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

  return (
    <div className="cart-page container">
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <div className="no-results">Your cart is empty.</div>
      ) : (
        <div className="cart-grid">
          <div className="cart-items">
            {cart.map((it) => (
              <div className="cart-item" key={it.id}>
                <div className="ci-left">
                  <div className="ci-image">
                    {it.image_url ? <img src={it.image_url} alt={it.name} /> : <div className="image-placeholder">No Image</div>}
                  </div>
                  <div className="ci-meta">
                    <h3>{it.name || it.title}</h3>
                    <div className="ci-sku">{it.sku}</div>
                  </div>
                </div>

                <div className="ci-right">
                  <div className="ci-price">${it.price || 0}</div>
                  <input type="number" min="1" value={it.quantity} onChange={(e) => updateQty(it.id, e.target.value)} />
                  <button className="btn-remove" onClick={() => remove(it.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Summary</h3>
            <div className="summary-row"><span>Items</span><span>{cart.length}</span></div>
            <div className="summary-row"><strong>Total</strong><strong>${total.toFixed(2)}</strong></div>
            <div className="summary-actions">
              <button className="btn-primary" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
