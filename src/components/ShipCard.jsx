import React, { useMemo, useState } from "react";
import "../styles/shipsearch.css";

// fallback image
const DEFAULT_SHIP =
  "https://images.unsplash.com/photo-1566375637269-6d6d8f88b3c2?q=80&w=1200&auto=format&fit=crop";

const API_BASE = "http://localhost:5000"; // change if needed

export default function ShipCard({ ship, onView, onApply }) {
  const [imgError, setImgError] = useState(false);

  /* -----------------------------
     Smart posted time
  ------------------------------*/
  const postedAgo = useMemo(() => {
    if (!ship.postedAt) return "";
    const posted = new Date(ship.postedAt);
    const now = new Date();
    const diff = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    return diff === 0 ? "Today" : `${diff}d ago`;
  }, [ship.postedAt]);

  /* -----------------------------
     Smart image resolver
  ------------------------------*/
  // const imageSrc = useMemo(() => {
  //   if (imgError) return DEFAULT_SHIP;

  //   if (!ship.image) return DEFAULT_SHIP;

  //   // absolute URL
  //   if (ship.image.startsWith("http")) return ship.image;

  //   // relative path from backend
  //   console.log("Attempting to resolve image URL:", API_BASE, ship.image);
    
  //   return `${API_BASE}${ship.image}`;
  // }, [ship.image, imgError]);

  const imageSrc = `${API_BASE}${ship.image_url}`

  /* ----------------------------- */

  return (
    <div className="ship-card smart-ship-card" onClick={() => onView(ship)}>
      {/* Image */}
      <div className="ship-image">
        <img
          src={imageSrc}
          alt={ship.name}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Main info */}
      <div className="ship-main">
        <div className="title-row">
          <h3 className="ship-title">{ship.name}</h3>

          {ship.imo && <span className="imo">IMO: {ship.imo}</span>}

          {ship.type && (
            <span className={`badge badge-${ship.type.toLowerCase()}`}>
              {ship.type}
            </span>
          )}
        </div>

        <div className="ship-route">
          {ship.startPort} → {ship.endPort}
        </div>

        <div className="ship-meta">
          {(ship.distance ?? 0).toLocaleString()} km • ETA{" "}
          {Math.floor((ship.etaHours || 0) / 24)}d {(ship.etaHours || 0) % 24}h
        </div>

        <div className="ship-capacity">
          Capacity: {(ship.capacityTons ?? 0).toLocaleString()} t
        </div>

        {ship.tags?.length > 0 && (
          <div className="tags">
            {ship.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="ship-actions">
        <div className="posted">{postedAgo}</div>

        <div className="owner-info">
          <span className="owner-name">{ship.ownerCompany}</span>

          <span className="rating">
            {ship.verified && <span className="verified">✔</span>}
            {"★".repeat(Math.round(ship.rating || 0))}
            <span className="rating-num">
              {ship.rating ? ship.rating.toFixed(1) : "—"}
            </span>
          </span>
        </div>

        <div className="action-buttons">
          <button
            className="view-btn"
            onClick={(e) => {
              e.stopPropagation();
              onView(ship);
            }}
          >
            View
          </button>

          <button
            className="apply-btn"
            onClick={(e) => {
              e.stopPropagation();
              onApply(ship);
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
