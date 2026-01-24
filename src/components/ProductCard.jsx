export default function ProductCard({ product, onBuyNow }) {
  return (
    <div className="product-card">
      <div className="product-media">
        <div className="product-image">{product.image ? <img src={product.image} alt={product.title} /> : <div className="placeholder">🛠</div>}</div>
        <div className="product-badge">{product.category}</div>
      </div>

      <div className="product-body">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-desc">A short service description or summary.</p>
        <div className="product-footer">
          <div className="price">{product.price}</div>
          <div className="actions">
            <button className="btn-secondary" onClick={() => alert('View details')}>View</button>
            <button className="btn-primary" onClick={onBuyNow}>Buy</button>
          </div>
        </div>
      </div>
    </div>
  );
}
