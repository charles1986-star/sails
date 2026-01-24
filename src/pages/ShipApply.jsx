import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import shipsData from "../data/ships";
import "../styles/shipsearch.css";

export default function ShipApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ship = shipsData.find((s) => s.id === id);

  const [form, setForm] = useState({
    cargoType: "",
    weight: "",
    weightUnit: "t",
    preferredLoadingDate: "",
    preferredArrivalDate: "",
    message: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editId = params.get("edit");

  useEffect(() => {
    if (!editId) return;
    const list = JSON.parse(localStorage.getItem("applications") || "[]");
    const app = list.find(a => a.id === editId);
    if (app) {
      setForm(app.form || {});
    }
  }, [editId]);

  if (!ship) return <div className="no-results">Ship not found.</div>;

  const handleChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // minimal validation
    if (!form.cargoType || !form.weight || !form.contactName || !form.contactEmail) {
      alert("Please fill required fields: cargo type, weight, name, email.");
      return;
    }

    setSubmitting(true);
    const apps = JSON.parse(localStorage.getItem("applications") || "[]");
    if (editId) {
      // update existing
      const next = apps.map(a => a.id === editId ? { ...a, form, createdAt: a.createdAt } : a);
      localStorage.setItem("applications", JSON.stringify(next));
      const updated = next.find(a=>a.id===editId);
      setTimeout(()=>{
        setSubmitting(false);
        setSubmitted(updated);
      }, 400);
    } else {
      const app = {
        id: `app_${Date.now()}`,
        shipId: ship.id,
        shipName: ship.name,
        createdAt: new Date().toISOString(),
        status: "Pending",
        form,
      };
      apps.unshift(app);
      localStorage.setItem("applications", JSON.stringify(apps));
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(app);
      }, 600);
    }
  };

  return (
    <div className="apply-page">
      <div className="container detail-grid">
        <div className="detail-left">
          <div className="detail-card">
            <div className="detail-header">
              <div>
                <h1>Apply to {ship.name}</h1>
                <div className="imo">IMO: {ship.imo}</div>
                <div className="detail-sub">{ship.type} • {ship.startPort} → {ship.endPort}</div>
              </div>
              <div className="detail-meta">
                <button className="back-link" onClick={() => navigate(-1)}>← Back</button>
              </div>
            </div>

            {!submitted ? (
              <form className="apply-form" onSubmit={handleSubmit}>
                <section className="card-section">
                  <h3>Cargo Details</h3>
                  <label>Type *</label>
                  <select value={form.cargoType} onChange={handleChange("cargoType")}>
                    <option value="">Select cargo type</option>
                    <option value="containerized">Containerized</option>
                    <option value="bulk">Bulk</option>
                    <option value="liquid">Liquid / Tanker</option>
                    <option value="project">Project / Oversized</option>
                  </select>

                  <div className="row">
                    <div>
                      <label>Weight / Volume *</label>
                      <input type="number" value={form.weight} onChange={handleChange("weight")} placeholder="e.g. 12000" />
                    </div>
                    <div>
                      <label>Unit</label>
                      <select value={form.weightUnit} onChange={handleChange("weightUnit")}>
                        <option value="t">t (tons)</option>
                        <option value="kg">kg</option>
                        <option value="m3">m³</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div>
                      <label>Preferred Loading Date</label>
                      <input type="date" value={form.preferredLoadingDate} onChange={handleChange("preferredLoadingDate")} />
                    </div>
                    <div>
                      <label>Preferred Arrival Date</label>
                      <input type="date" value={form.preferredArrivalDate} onChange={handleChange("preferredArrivalDate")} />
                    </div>
                  </div>
                </section>

                <section className="card-section">
                  <h3>Cover Message</h3>
                  <textarea value={form.message} onChange={handleChange("message")} placeholder="Write a brief message about your cargo and requirements" />
                </section>

                <section className="card-section">
                  <h3>Attachments</h3>
                  <input type="file" />
                </section>

                <section className="card-section">
                  <h3>Contact Information</h3>
                  <label>Name *</label>
                  <input value={form.contactName} onChange={handleChange("contactName")} />
                  <label>Email *</label>
                  <input value={form.contactEmail} onChange={handleChange("contactEmail")} type="email" />
                  <label>Phone</label>
                  <input value={form.contactPhone} onChange={handleChange("contactPhone")} />
                </section>

                <div className="form-actions">
                  <button type="button" className="view-btn" onClick={() => navigate(`/ships/${ship.id}`)}>Back to ship</button>
                  <button type="submit" className="apply-btn full" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
                </div>
              </form>
            ) : (
              <div className="submitted-card">
                <h3>Application Submitted</h3>
                <p>Your application <strong>{submitted.id}</strong> was submitted and is now <strong>{submitted.status}</strong>.</p>
                <p>We sent a confirmation to <strong>{submitted.form.contactEmail}</strong>. You can view all applications in your dashboard.</p>
                <div className="form-actions">
                  <button className="view-btn" onClick={() => navigate(`/ships/${ship.id}`)}>Back to ship</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="detail-right">
          <div className="sticky-card">
            <div className="owner">
              <div className="avatar-small">{ship.ownerCompany.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
              <div>
                <div className="owner-name">{ship.ownerCompany}</div>
                <div className="owner-meta">{ship.verified ? 'Verified operator' : 'Unverified'}</div>
              </div>
            </div>

            <div className="ship-summary">
              <h4>{ship.name}</h4>
              <div className="imo">IMO: {ship.imo}</div>
              <div className="detail-sub">{ship.type} • {ship.startPort} → {ship.endPort}</div>
              <div className="ship-meta">Capacity: {ship.capacityTons.toLocaleString()} t • ETA {Math.floor(ship.etaHours/24)}d</div>
            </div>

            <div style={{marginTop:12}}>
              <strong>Contact</strong>
              <div className="owner-meta">Owner: {ship.ownerCompany}</div>
              <div className="owner-meta">Email: contact@{ship.ownerCompany.split(' ').join('').toLowerCase()}.com</div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
