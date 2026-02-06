import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import shipsData from "../data/ships";
import "../styles/shipsearch.css";

function statusColor(status) {
  if (!status) return "gray";
  const s = status.toLowerCase();
  if (s === "pending") return "#94a3b8"; // gray
  if (s === "viewed") return "#0b74de"; // blue
  if (s === "shortlisted") return "#f59e0b"; // amber
  if (s === "approved") return "#10b981"; // green
  if (s === "rejected") return "#ef4444"; // red
  if (s === "withdrawn") return "#6b7280"; // neutral
  return "#94a3b8";
}

export default function Applications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("applications") || "[]");
    setApps(list);
  }, []);

  const refresh = () => setApps(JSON.parse(localStorage.getItem("applications") || "[]"));

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (filter && a.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        const ship = shipsData.find((s) => s.id === a.shipId) || {};
        return (a.shipName + " " + (ship.startPort||"") + " " + (ship.endPort||"") + " " + a.shipId).toLowerCase().includes(q);
      }
      return true;
    });
  }, [apps, filter, query]);

  const openView = (app) => setSelected(app);

  const withdraw = (appId) => {
    const list = JSON.parse(localStorage.getItem("applications") || "[]");
    const next = list.map((a) => a.id === appId ? { ...a, status: "Withdrawn" } : a);
    localStorage.setItem("applications", JSON.stringify(next));
    refresh();
  };

  const edit = (appId) => {
    navigate(`/ships/${apps.find(a=>a.id===appId).shipId}/apply?edit=${appId}`);
  };

  return (
    <div className="applications-page">
      <div className="container">
        <div className="apps-head">
          <h2>Your Applications</h2>
          <div className="apps-controls">
            <input placeholder="Search ship or route" value={query} onChange={(e)=>setQuery(e.target.value)} />
            <select value={filter} onChange={(e)=>setFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Viewed">Viewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        <div className="apps-table">
          <div className="apps-row apps-header">
            <div>Ship</div>
            <div>Route</div>
            <div>Owner</div>
            <div>Status</div>
            <div>Date</div>
            <div>Actions</div>
          </div>

          {filtered.map((a) => {
            const ship = shipsData.find(s => s.id === a.shipId) || {};
            return (
              <div className="apps-row" key={a.id}>
                <div className="ship-name">{a.shipName} <div className="sub">{ship.imo ? ship.imo : ship.type}</div></div>
                <div>{(ship.startPort||"") + " → " + (ship.endPort||"")}</div>
                <div>{ship.ownerCompany || a.form?.owner || '—'}</div>
                <div><span className="status-pill" style={{background: statusColor(a.status)}}>{a.status}</span></div>
                <div>{new Date(a.createdAt).toLocaleDateString()}</div>
                <div className="row-actions">
                  <button className="view-btn" onClick={()=>openView(a)}>View</button>
                  {a.status === 'Pending' && <button className="view-btn" onClick={()=>edit(a.id)}>Edit</button>}
                  {a.status === 'Pending' && <button className="apply-btn" onClick={()=>withdraw(a.id)}>Withdraw</button>}
                </div>
              </div>
            );
          })}

          {!filtered.length && <div className="no-results">No applications found.</div>}
        </div>

        {selected && (
          <div className="modal-back" onClick={()=>setSelected(null)}>
            <div className="modal" onClick={(e)=>e.stopPropagation()}>
              <h3>Application {selected.id}</h3>
              <p><strong>Ship:</strong> {selected.shipName}</p>
              <p><strong>Status:</strong> {selected.status}</p>
              <p><strong>Submitted:</strong> {new Date(selected.createdAt)?.toLocaleString()?? 0}</p>
              <h4>Message</h4>
              <p>{selected.form.message || '—'}</p>
              <div className="form-actions">
                <button className="view-btn" onClick={()=>{ setSelected(null); navigate(`/ships/${selected.shipId}`); }}>Open Ship</button>
                {selected.status === 'Pending' && <button className="apply-btn" onClick={()=>{ withdraw(selected.id); setSelected(null); }}>Withdraw</button>}
                <button className="view-btn" onClick={()=>setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
