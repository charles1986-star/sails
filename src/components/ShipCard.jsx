import React from "react";
import "../styles/shipsearch.css";
// import defaultShipImage from "../assets/ship-default.jpg"; // <-- add a default sail image here

export default function ShipCard({ ship, onView, onApply }) {
  const postedAgo = (() => {
    const posted = new Date(ship.postedAt);
    const now = new Date();
    const diff = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    return diff === 0 ? "Today" : `${diff}d ago`;
  })();

  //const imageSrc = ship.image || defaultShipImage; // default if no image

  return (
    <div className="ship-card" onClick={() => onView(ship)}>
      {/* Left image */}
      <div className="ship-image">
        <img src="/images/your-ship-hero.jpg" alt={ship.name} loading="lazy" />
      </div>

      {/* Main info */}
      <div className="ship-main">
        <div className="title-row">
          <h3>{ship.name}</h3>
          {ship.imo && <span className="imo">IMO: {ship.imo}</span>}
          <span className={`badge badge-${ship.type.toLowerCase()}`}>{ship.type}</span>
        </div>

        <div className="ship-route">{ship.startPort} → {ship.endPort}</div>
        <div className="ship-meta">
          {ship.distance.toLocaleString()} km • ETA {Math.floor(ship.etaHours / 24)}d {ship.etaHours % 24}h
        </div>
        <div className="ship-capacity">Capacity: {ship.capacityTons.toLocaleString()} t</div>

        {ship.tags && ship.tags.length > 0 && (
          <div className="tags">
            {ship.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Right info / actions */}
      <div className="ship-actions">
        <div className="posted">{postedAgo}</div>
        <div className="owner-info">
          <span className="owner-name">{ship.ownerCompany}</span>
          <span className="rating">
            {ship.verified && <span className="verified">✔</span>}
            {'★'.repeat(Math.round(ship.rating || 0))}
            <span className="rating-num">{ship.rating ? ship.rating.toFixed(1) : "—"}</span>
          </span>
        </div>

        <div className="action-buttons">
          <button className="view-btn" onClick={(e) => { e.stopPropagation(); onView(ship); }}>View</button>
          <button className="apply-btn" onClick={(e) => { e.stopPropagation(); onApply(ship); }}>Apply</button>
        </div>
      </div>
    </div>
  );
}
