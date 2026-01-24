import { useState } from "react";
import "../styles/modal.css";

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  // Remove $ sign and parse float
  const priceNumber = parseFloat(product.price.replace("$", ""));
  const totalPrice = (priceNumber * quantity).toFixed(2);

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2>{product.title}</h2>
        <p className="modal-price">${priceNumber.toFixed(2)}</p>

        <p className="modal-desc">
          Professional service delivered by verified experts.
        </p>

        <div className="quantity-selector">
          <label>Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, e.target.value))}
          />
        </div>

        <p className="total-price">Total: ${totalPrice}</p>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => onAddToCart(product, quantity)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
