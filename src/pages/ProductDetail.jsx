import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import products from "../data/products";
import "../styles/productDetail.css";

const API_URL = "http://localhost:5000/api";

export default function ProductDetail({ onBuyNow, onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/shops/${id}`);
        if (!mounted) return;
        if (res?.data?.data) {
          setProduct(res.data.data);
        } else {
          // fallback to local product list
          const local = products.find((p) => String(p.id) === String(id));
          setProduct(local || null);
        }
      } catch (err) {
        // fallback to local product list
        const local = products.find((p) => String(p.id) === String(id));
        if (local) {
          setProduct(local);
        } else {
          setError(err.response?.data?.msg || "Product not found");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="no-results">Loading product...</div>;
  if (error) return <div className="no-results">{error}</div>;
  if (!product) return <div className="no-results">Product not found</div>;

  const maxStock = product.stock ?? 99;
  const isQtyValid = qty > 0 && qty <= maxStock;

  const handleBuyNow = () => {
    if (!isQtyValid) return;
    setLoadingBuy(true);

    // In future: call backend to create order / payment session
    setTimeout(() => {
      setLoadingBuy(false);
      alert("Redirecting to checkout (simulated)");
    }, 1200);
  };

  const handleAddToCart = () => {
    if (!isQtyValid) return;
    onAddToCart && onAddToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-detail-page">
      <div className="container detail-grid">
        <div className="detail-left">
          <div className="detail-card">
            <div className="product-image-large">
              {product.image_url || product.image ? (
                <img src={product.image_url || product.image} alt={product.name || product.title} />
              ) : (
                <div className="image-placeholder">🛠</div>
              )}
            </div>

            <h1 className="product-title">{product.name || product.title}</h1>
            {product.category && <div className="product-category">{product.category}</div>}

            <p className="product-description">{product.description}</p>

            <div className="product-meta">
              <div><strong>Delivery:</strong> {product.deliveryTime || "3–5 days"}</div>
              <div><strong>Revisions:</strong> {product.revisions || "Unlimited"}</div>
              <div><strong>Experience:</strong> {product.priceLevel || "Standard"}</div>
              <div><strong>Stock:</strong> {maxStock}</div>
            </div>
          </div>
        </div>

        <aside className="detail-right">
          <div className="purchase-card">
            <div className="price-row">
              <span className="price-label">Price</span>
              <span className="price-value">${product.price || 0}</span>
            </div>

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
              ✔ Secure payment <br />
              ✔ Instant checkout <br />
              ✔ 24/7 support
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
