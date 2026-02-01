import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/product-card.css";

export default function ProductCard({ product, onView }) {
  const navigate = useNavigate();
  return (
    <div className="product-card" onClick={() => onView(product)}>
      
      {/* Image */}
      <div className="product-image">
        <img
          src={product.image || "/placeholder-ship.png"}
          alt={product.title}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="product-content">
        <h4>{product.title}</h4>

        <p className="meta">
          {product.origin} → {product.destination}
        </p>

        <p className="capacity">
          Capacity: <strong>{product.capacity} t</strong>
        </p>
      </div>

      {/* Hover Action */}
      <button
        className="view-btn"
        onClick={(e) => {
          e.stopPropagation(); // prevent card click
          navigate(`/product/${product.id}`);
        }}
      >
        View Details
      </button>
    </div>
  );
}
