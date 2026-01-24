import React from "react";
import "../styles/shipsearch.css";

export default function ShipCard({ ship, onView, onApply }) {
  const postedAgo = (() => {
    const posted = new Date(ship.postedAt);
    const now = new Date();
    const diff = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    return diff === 0 ? "Today" : `${diff}d ago`;
  })();

  const initials = ship.ownerCompany.split(" ").map(w => w[0]).slice(0,2).join("");

  return (
    <div className="ship-card" onClick={() => onView(ship)}>
      <div className="ship-left">
        <div className="avatar">{initials}</div>
      </div>

      <div className="ship-main">
        <div className="title-row">
          <div>
            <h4>{ship.name}</h4>
            {ship.imo && <div className="imo">IMO: {ship.imo}</div>}
          </div>
          <span className="badge">{ship.type}</span>
        </div>

        <div className="ship-route">{ship.startPort} → {ship.endPort}</div>
        <div className="ship-meta">{ship.distance.toLocaleString()} km • ETA {Math.floor(ship.etaHours / 24)}d {ship.etaHours % 24}h</div>

        <div className="ship-sub">Capacity: {ship.capacityTons.toLocaleString()} t</div>

        {ship.tags && ship.tags.length > 0 && (
          <div className="tags">
            {ship.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="ship-actions">
        <div className="posted">{postedAgo}</div>
        <div className="owner-row"> 
          <div className="owner-info">
            <div className="owner-name">{ship.ownerCompany}</div>
            <div className="rating">
              {ship.verified && <span className="verified-badge">✔</span>}
              <span className="rating-stars">{'★'.repeat(Math.round(ship.rating || 0))}</span>
              <span className="rating-num">{ship.rating ? ship.rating.toFixed(1) : "—"}</span>
            </div>
          </div>
        </div>
        <div className="action-row">
          <button className="view-btn" onClick={(e) => { e.stopPropagation(); onView(ship); }}>View</button>
          <button className="apply-btn" onClick={(e) => { e.stopPropagation(); onApply(ship); }}>Apply</button>
        </div>
      </div>
    </div>
  );
}
