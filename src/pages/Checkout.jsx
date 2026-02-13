import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice';
import { getAuthHeader } from '../utils/auth';
import '../styles/checkout.css';

const API_URL = 'http://localhost:5000/api';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart.items);

  const [deliveryRequired, setDeliveryRequired] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postal, setPostal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = cart.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

  const handleSubmit = async () => {
    setError(null);
    if (!cart.length) return setError('Cart is empty');
    if (deliveryRequired && (!address || !city || !country)) return setError('Delivery details required');

    const payload = {
      items: cart.map(i => ({ shop_id: i.id, quantity: i.quantity, unit_price: i.price })),
      total_amount: total,
      delivery_required: deliveryRequired,
      delivery_address: address,
      delivery_city: city,
      delivery_country: country,
      delivery_postal_code: postal,
      payment_method: 'card',
      notes: ''
    };

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/orders`, payload, { headers: getAuthHeader() });
      if (res?.data?.data) {
        dispatch(clearCart());
        navigate('/my-account');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        {error && <div className="checkout-error">{error}</div>}

        <div className="checkout-grid">
          {/* ================= LEFT FORM ================= */}
          <div className="checkout-card">
            <h2 className="card-title">Delivery Options</h2>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={deliveryRequired}
                onChange={(e) => setDeliveryRequired(e.target.checked)}
              />
              <span>Delivery required</span>
            </label>

            {deliveryRequired && (
              <div className="delivery-grid">
                <input
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
                <input
                  placeholder="Postal code"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                />
              </div>
            )}

            <button
              className="checkout-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>

          {/* ================= RIGHT SUMMARY ================= */}
          <aside className="checkout-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>

              <div className="summary-items">
                {cart.map((item) => (
                  <div key={item.id} className="summary-row">
                    <span>{item.name}</span>
                    <span>
                      ${item.price} × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
