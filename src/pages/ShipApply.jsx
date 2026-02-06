import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import shipsData from "../data/ships";
import axios from "axios";
import { addApplication } from "../redux/slices/applicationSlice";
import { getAuthHeader } from "../utils/auth";
import Notice from "../components/Notice";
import SuccessModal from "../components/SuccessModal";
import "../styles/shipsearch.css";


const API_URL = "http://localhost:5000/api/admin";

export default function ShipApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const shipsFromStore = useSelector((state) => state.ships.ships);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [ship, setShip] = useState(null);
  const [shipLoading, setShipLoading] = useState(true);
  
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
  const [notice, setNotice] = useState(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editId = params.get("edit");

  // Load ship from API or store
  useEffect(() => {
    const loadShip = async () => {
      try {
        if (shipsFromStore && shipsFromStore.length > 0) {
          const foundShip = shipsFromStore.find((s) => s.id === parseInt(id));
          if (foundShip) {
            setShip(foundShip);
            setShipLoading(false);
            return;
          }
        }
        
        const res = await axios.get(`${API_URL}/ships/${id}`);
        if (res?.data?.data) {
          setShip(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load ship:", err);
        const localShip = shipsData.find((s) => s.id === id);
        if (localShip) {
          setShip(localShip);
        }
      } finally {
        setShipLoading(false);
      }
    };

    loadShip();
  }, [id, shipsFromStore]);

  useEffect(() => {
    if (!editId) return;
    const list = JSON.parse(localStorage.getItem("applications") || "[]");
    const app = list.find(a => a.id === editId);
    if (app) {
      setForm(app.form || {});
    }
  }, [editId]);

  if (shipLoading) {
    return (
      <div className="apply-page">
        <div className="container">
          <div className="no-results">Loading ship details...</div>
        </div>
      </div>
    );
  }

  if (!ship) return <div className="no-results">Ship not found.</div>;

  const handleChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation
    if (!form.cargoType || form.cargoType.trim() === '') {
      setNotice({ type: "error", msg: "Please select a cargo type." });
      return;
    }
    
    if (!form.weight || isNaN(form.weight) || parseFloat(form.weight) <= 0) {
      setNotice({ type: "error", msg: "Please enter a valid weight/volume (must be positive number)." });
      return;
    }

    if (!form.contactName || form.contactName.trim().length < 2) {
      setNotice({ type: "error", msg: "Please enter a valid name (at least 2 characters)." });
      return;
    }

    if (!form.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      setNotice({ type: "error", msg: "Please enter a valid email address." });
      return;
    }

    if (form.contactPhone && form.contactPhone.trim().length > 0) {
      if (!/^[\d\s\-\+\(\)]{7,}$/.test(form.contactPhone)) {
        setNotice({ type: "error", msg: "Please enter a valid phone number." });
        return;
      }
    }

    if (!user || !user.id) {
      setNotice({ type: "error", msg: "You must be logged in to apply." });
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ship_id: ship.id,
        cargo_type: form.cargoType,
        cargo_weight: form.weight,
        weight_unit: form.weightUnit,
        preferred_loading_date: form.preferredLoadingDate || null,
        preferred_arrival_date: form.preferredArrivalDate || null,
        contact_name: form.contactName.trim(),
        contact_email: form.contactEmail.trim(),
        contact_phone: form.contactPhone?.trim() || null,
        message: form.message?.trim() || null,
      };
      
      const res = await axios.post(`${API_URL}/applications`, payload, { headers: getAuthHeader() });
      
      if (res?.data?.data || res?.data?.msg) {
        setSubmitted({
          id: res.data.data?.id || `app_${Date.now()}`,
          status: 'pending'
        });
        dispatch(addApplication(res.data.data));
        setNotice({ type: "success", msg: "Application submitted successfully!" });
        // Redirect after showing success
        setTimeout(() => navigate('/applications'), 2500);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.msg || "Failed to submit application";
      setNotice({ type: "error", msg: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="apply-page">
      {notice && <Notice type={notice.type} msg={notice.msg} />}
      <SuccessModal 
        isOpen={!!submitted} 
        onClose={() => setSubmitted(null)}
        data={submitted}
      />
      <div className="container detail-grid">
        <div className="detail-left">
          <div className="detail-card card-shadow">
            <div className="detail-header">
              <div>
                <h1>Apply to {ship.name}</h1>
                <div className="imo">IMO: {ship.imo}</div>
                <div className="detail-sub">{ship.type} • {ship.current_port || 'Port'} → {ship.next_port || 'Port'}</div>
              </div>
              <div className="detail-meta">
                <button className="back-link" onClick={() => navigate(-1)}>← Back</button>
              </div>
            </div>

            {!submitted ? (
              <form className="apply-form" onSubmit={handleSubmit}>
                {/* Cargo Details */}
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
                    <div className="half-input">
                      <label>Weight / Volume *</label>
                      <input type="number" value={form.weight} onChange={handleChange("weight")} placeholder="e.g. 12000" />
                    </div>
                    <div className="half-input">
                      <label>Unit</label>
                      <select value={form.weightUnit} onChange={handleChange("weightUnit")}>
                        <option value="t">t (tons)</option>
                        <option value="kg">kg</option>
                        <option value="m3">m³</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="half-input">
                      <label>Preferred Loading Date</label>
                      <input type="date" value={form.preferredLoadingDate} onChange={handleChange("preferredLoadingDate")} />
                    </div>
                    <div className="half-input">
                      <label>Preferred Arrival Date</label>
                      <input type="date" value={form.preferredArrivalDate} onChange={handleChange("preferredArrivalDate")} />
                    </div>
                  </div>
                </section>

                {/* Cover Message */}
                <section className="card-section">
                  <h3>Cover Message</h3>
                  <textarea value={form.message} onChange={handleChange("message")} placeholder="Briefly explain your cargo and requirements" />
                </section>

                {/* Attachments */}
                <section className="card-section">
                  <h3>Attachments</h3>
                  <input type="file" />
                </section>

                {/* Contact Information */}
                <section className="card-section">
                  <h3>Contact Information</h3>
                  <label>Name *</label>
                  <input value={form.contactName} onChange={handleChange("contactName")} />
                  <label>Email *</label>
                  <input value={form.contactEmail} onChange={handleChange("contactEmail")} type="email" />
                  <label>Phone</label>
                  <input value={form.contactPhone} onChange={handleChange("contactPhone")} />
                </section>

                {/* Form Actions */}
                <div className="form-actions">
                  <button type="button" className="view-btn fixed-width" onClick={() => navigate(`/ships/${ship.id}`)}>Back to ship</button>
                  <button type="submit" className="apply-btn fixed-width" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
                </div>
              </form>
            ) : (
              <div className="submitted-card">
                <h3>Application Submitted</h3>
                <p>Your application <strong>{submitted.id}</strong> is now <strong>{submitted.status}</strong>.</p>
                <p>We sent a confirmation to <strong>{submitted.form.contactEmail}</strong>.</p>
                <div className="form-actions">
                  <button className="view-btn fixed-width" onClick={() => navigate(`/ships/${ship.id}`)}>Back to ship</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky right sidebar */}
        <aside className="detail-right">
          <div className="sticky-card card-shadow">
            <div className="owner">
              <div className="avatar-small">{(ship.ship_owner || ship.ownerCompany || 'SHIP').substring(0, 2).toUpperCase()}</div>
              <div>
                <div className="owner-name">{ship.ship_owner || ship.ownerCompany || 'Ship Owner'}</div>
              </div>
            </div>

            <div className="ship-summary">
              <h4>{ship.name}</h4>
              <div className="imo">IMO: {ship.imo}</div>
              <div className="detail-sub">{ship.type} • {ship.current_port || 'Port'} → {ship.next_port || 'Port'}</div>
              <div className="ship-meta">Capacity: {(ship.capacity_tons || ship.capacityTons)?.toLocaleString()} t</div>
            </div>

            <div style={{marginTop:12}}>
              <strong>Contact</strong>
              <div className="owner-meta">Owner: {ship.ship_owner || ship.ownerCompany || 'Ship Owner'}</div>
              <div className="owner-meta">Email: contact@shipowner.com</div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
