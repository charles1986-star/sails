import { useParams } from "react-router-dom";
import { useState } from "react";
import products from "../data/products";
import "../styles/productDetail.css";

export default function ProductDetail({ onBuyNow, onAddToCart }) {
  const { id } = useParams();
  const product = products.find((p) => String(p.id) === id);

  // ---------- STATE ----------
  const [qty, setQty] = useState(1);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) {
    return <div className="no-results">Product not found</div>;
  }

  const maxStock = product.stock ?? 99;
  const isQtyValid = qty > 0 && qty <= maxStock;

  // ---------- HANDLERS ----------
  const handleBuyNow = () => {
    if (!isQtyValid) return;

    setLoadingBuy(true);

    // Simulate Stripe checkout
    setTimeout(() => {
      setLoadingBuy(false);

      // REAL WORLD:
      // window.location.href = session.url;
      alert("Redirecting to Stripe checkout...");
    }, 1500);
  };

  const handleAddToCart = () => {
    if (!isQtyValid) return;

    onAddToCart && onAddToCart(product, qty);
    setAdded(true);

    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="product-detail-page">
      <div className="container detail-grid">

        {/* ---------- LEFT ---------- */}
        <div className="detail-left">
          <div className="detail-card">
            <div className="product-image-large">
              {product.image ? (
                <img src={product.image} alt={product.title} />
              ) : (
                <div className="image-placeholder">🛠</div>
              )}
            </div>

            <h1 className="product-title">{product.title}</h1>
            <div className="product-category">{product.category}</div>

            <p className="product-description">{product.description}</p>

            <div className="product-meta">
              <div><strong>Delivery:</strong> {product.deliveryTime || "3–5 days"}</div>
              <div><strong>Revisions:</strong> {product.revisions || "Unlimited"}</div>
              <div><strong>Experience:</strong> {product.priceLevel}</div>
              <div><strong>Stock:</strong> {maxStock}</div>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT (PURCHASE CARD) ---------- */}
        <aside className="detail-right">
          <div className="purchase-card">

            <div className="price-row">
              <span className="price-label">Price</span>
              <span className="price-value">${product.price}</span>
            </div>

            {/* Quantity */}
            <div className="qty-row">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                max={maxStock}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>

            {/* Actions */}
            <div className="action-buttons">
              <button
                className="btn-buy"
                disabled={!isQtyValid || loadingBuy}
                onClick={handleBuyNow}
              >
                {loadingBuy ? <span className="spinner" /> : "Buy Now"}
                <span className="btn-subtext">Secure checkout</span>
              </button>

              <button
                className="btn-cart"
                disabled={!isQtyValid}
                onClick={handleAddToCart}
              >
                {added ? "✓ Added to cart" : "Add to Cart"}
              </button>
            </div>

            <div className="purchase-note">
              ✔ Stripe secure payment <br />
              ✔ Instant checkout <br />
              ✔ 24/7 support
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}
