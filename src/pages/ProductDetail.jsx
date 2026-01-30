import { useParams, useNavigate } from "react-router-dom";
import products from "../data/products";
import { useState } from "react";
import "../styles/productDetail.css";

export default function ProductDetail({ onAddToCart, onBuyNow }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => String(p.id) === String(id));
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState(product?.colors?.[0] || "");

  if (!product) return <div style={{ padding: 24 }}>Product not found</div>;

  const handleAdd = () => {
    onAddToCart && onAddToCart(product, quantity);
    navigate('/cart');
  };

  const handlePurchase = () => {
    onBuyNow && onBuyNow(product);
  };

  return (
    <div className="product-detail page-container">
      <div className="detail-grid">
        <div className="detail-media">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="detail-info">
          <h1>{product.title}</h1>
          <div className="detail-meta">Serial: <strong>{product.serial}</strong> • Stock: <strong>{product.stock}</strong></div>
          <div className="detail-price">{product.priceText}</div>
          <p className="detail-desc">{product.description}</p>

          <div className="detail-controls">
            <div className="field">
              <label>Color</label>
              <div className="color-row">
                {product.colors.map((c) => (
                  <button key={c} className={`color-swatch ${color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>

            <div className="field">
              <label>Quantity</label>
              <input type="number" min={1} max={product.stock} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </div>

            <div className="field">
              <label>Price Level</label>
              <div className="muted">{product.priceLevel} • Accepted: {product.accepted} offers</div>
            </div>

            <div className="actions">
              <button className="btn-secondary" onClick={handleAdd}>Add to Cart</button>
              <button className="btn-primary" onClick={handlePurchase}>Purchase Now</button>
            </div>

            <div className="contact-row">
              <div>Contact: <a href={`tel:${product.contact}`}>{product.contact}</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
