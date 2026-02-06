import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import shipsData from "../data/ships";
import axios from "axios";
import "../styles/shipsearch.css";
// import defaultShipImage from "../assets/ship-default.jpg"; // add a default ship image

const API_URL = "http://localhost:5000/api/admin";

export default function ShipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const shipsFromStore = useSelector((state) => state.ships.ships);
  const [ship, setShip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState("");

  useEffect(() => {
    const loadShip = async () => {
      try {
        // Try to get from Redux store first
        if (shipsFromStore && shipsFromStore.length > 0) {
          const foundShip = shipsFromStore.find((s) => s.id === parseInt(id));
          if (foundShip) {
            setShip(foundShip);
            setLoading(false);
            return;
          }
        }
        
        // If not in store, fetch from API
        const res = await axios.get(`${API_URL}/ships/${id}`);
        if (res?.data?.data) {
          setShip(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load ship:", err);
        // Fallback to local data
        const localShip = shipsData.find((s) => s.id === id);
        if (localShip) {
          setShip(localShip);
        }
      } finally {
        setLoading(false);
      }
    };

    loadShip();
  }, [id, shipsFromStore]);

  if (loading) {
    return (
      <div className="ship-detail-page">
        <div className="container">
          <div className="no-results">Loading ship details...</div>
        </div>
      </div>
    );
  }

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

  //const shipImage = ship.image || defaultShipImage;

  return (
    <div className="ship-detail-page">
      <div className="container detail-grid">

        {/* Left / Main */}
        <div className="detail-left">
          <div className="detail-card">

            {/* Ship image */}
            <div className="ship-detail-image">
              <img src="/images/your-ship-hero.jpg" alt={ship.name} loading="lazy" />
            </div>

            {/* Header */}
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

            {/* Description */}
            <section className="card-section">
              <h3>Description</h3>
              <p>{ship.description || "No description provided."}</p>
            </section>

            <section className="card-section">
              <h3>Details</h3>
              <ul>
                <li>Capacity: {(ship.capacity_tons || ship.capacityTons)?.toLocaleString()} t</li>
                <li>Type: {ship.type}</li>
                <li>Current Port: {ship.current_port || 'N/A'}</li>
                <li>Next Port: {ship.next_port || 'N/A'}</li>
                {ship.last_maintenance_date && <li>Last Maintenance: {ship.last_maintenance_date}</li>}
              </ul>
            </section>

            {/* Tags */}
            {ship.tags && ship.tags.length > 0 && (
              <section className="card-section">
                <h3>Tags</h3>
                <div className="tags">
                  {ship.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right / Sidebar */}
        <aside className="detail-right">
          <div className="sticky-card">
            <div className="owner-card">
              <div className="owner-info">
                <div className="avatar-small">{(ship.ship_owner || ship.ownerCompany || 'SHIP').substring(0, 2).toUpperCase()}</div>
                <div className="owner-meta">
                  <div className="owner-name">{ship.ship_owner || ship.ownerCompany || 'Ship Owner'}</div>
                </div>
              </div>

              <button className="apply-btn" onClick={() => navigate(`/ships/${ship.id}/apply`)}>Go to apply page</button>
            </div>

            {/* Proposal Form */}
            <form className="proposal-form" onSubmit={handleSubmit}>
              <label>Your message</label>
              <textarea 
                id="proposal" 
                value={proposal} 
                onChange={(e) => setProposal(e.target.value)} 
                placeholder="Briefly explain your offer and availability"
              />

              <label>Attach files (optional)</label>
              <input type="file" className="file-input"/>

              <button className="apply-btn full" type="submit">Send Proposal</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
