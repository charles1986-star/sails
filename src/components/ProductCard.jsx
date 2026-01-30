import { Link } from "react-router-dom";

export default function ProductCard({ product, onBuyNow, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-media">
        <div className="product-image">{product.image ? <img src={product.image} alt={product.title} /> : <div className="placeholder">🛠</div>}</div>
        <div className="product-badge">{product.category}</div>
      </div>

      <div className="product-body">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <div className="price">{product.priceText}</div>
          <div className="actions">
            <Link to={`/product/${product.id}`} className="btn-secondary">View</Link>
            <button className="btn-secondary" onClick={() => onAddToCart && onAddToCart(product, 1)}>Add to Cart</button>
            <button className="btn-primary" onClick={() => onBuyNow && onBuyNow(product)}>Purchase</button>
          </div>
        </div>
      </div>
    </div>
  );
}
