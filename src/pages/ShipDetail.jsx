import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import shipsData from "../data/ships";
import "../styles/shipsearch.css";

export default function ShipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ship = shipsData.find((s) => s.id === id);
  const [proposal, setProposal] = useState("");

  if (!ship) {
    return (
      <div className="ship-detail-page">
        <div className="container">
          <div className="no-results">Ship not found.</div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Proposal sent for ${ship.name}: ${proposal || "(no message)"}`);
    setProposal("");
  };

  return (
    <div className="ship-detail-page">
      <div className="container detail-grid">
        <div className="detail-left">
          <div className="detail-card">
            <div className="detail-header">
              <div>
                <h1>{ship.name}</h1>
                {ship.imo && <div className="imo">IMO: {ship.imo}</div>}
                <div className="detail-sub">{ship.type} • {ship.startPort} → {ship.endPort}</div>
              </div>
              <div className="detail-meta">
                <div className="posted">Posted: {new Date(ship.postedAt).toLocaleDateString()}</div>
                <button className="back-link" onClick={() => navigate(-1)}>← Back to search</button>
              </div>
            </div>

            <section className="card-section">
              <h3>Description</h3>
              <p>{ship.description || "No description provided."}</p>
            </section>

            <section className="card-section">
              <h3>Details</h3>
              <ul>
                <li>Distance: {ship.distance.toLocaleString()} km</li>
                <li>ETA: {Math.floor(ship.etaHours / 24)} days {ship.etaHours % 24} hours</li>
                <li>Capacity: {ship.capacityTons.toLocaleString()} t</li>
                <li>Available from: {ship.availabilityDate}</li>
                <li>Estimated duration: {ship.estimatedDurationDays} days</li>
              </ul>
            </section>

            <section className="card-section">
              <h3>Skills / Tags</h3>
              <div className="tags">
                {ship.tags && ship.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </section>
          </div>
        </div>

        <aside className="detail-right">
          <div className="sticky-card">
            <div className="budget">
              <div className="owner">
                <div className="owner-left">
                  <div className="avatar-small">{ship.ownerCompany.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                </div>
                <div className="owner-right">
                  <div className="owner-name">{ship.ownerCompany}</div>
                  <div className="owner-meta">Verified: {ship.verified ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="cta-row">
                <button className="apply-primary" onClick={() => navigate(`/ships/${ship.id}/apply`)}>Submit Proposal</button>
              </div>
            </div>

            <form className="proposal-form" onSubmit={handleSubmit}>
              <label>Your message</label>
              <textarea id="proposal" value={proposal} onChange={(e) => setProposal(e.target.value)} placeholder="Briefly explain your offer and availability" />
              <label>Attach files (optional)</label>
              <input type="file" />
              <button className="apply-btn full" type="submit">Send Proposal</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
