import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../utils/auth";
import axios from "axios";
import Notice from "../components/Notice";
import "../styles/shipsearch.css";

const API_URL = "http://localhost:5000/api";

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
  const user = useSelector((state) => state.auth.user);
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadApplications = async () => {
      try {
        const res = await axios.get(`${API_URL}/ships/my-applications`, {
          headers: getAuthHeader(),
        });
        if (res?.data?.data && Array.isArray(res.data.data)) {
          setApps(res.data.data);
        } else {
          setApps([]);
        }
      } catch (err) {
        console.error("Failed to load applications:", err);
        setNotice({
          type: "error",
          msg: err.response?.data?.msg || "Failed to load applications",
        });
        setApps([]);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user, navigate]);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (filter && a.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        const shipName = a.ship_name || a.shipName || "";
        const startPort = a.start_port || a.startPort || "";
        const endPort = a.end_port || a.endPort || "";
        const searchStr = `${shipName} ${startPort} ${endPort} ${a.ship_id || a.shipId}`.toLowerCase();
        return searchStr.includes(q);
      }
      return true;
    });
  }, [apps, filter, query]);

  const openView = (app) => setSelected(app);

  const withdraw = async (appId) => {
    try {
      const res = await axios.put(
        `${API_URL}/ships/applications/${appId}`,
        { status: "withdrawn" },
        { headers: getAuthHeader() }
      );
      if (res?.data) {
        setNotice({ type: "success", msg: "Application withdrawn" });
        setApps((prev) =>
          prev.map((a) =>
            a.id === appId ? { ...a, status: "withdrawn" } : a
          )
        );
        setSelected(null);
      }
    } catch (err) {
      setNotice({
        type: "error",
        msg: err.response?.data?.msg || "Failed to withdraw",
      });
    }
  };

  const edit = (appId) => {
    const app = apps.find((a) => a.id === appId);
    if (app) {
      navigate(`/ships/${app.ship_id || app.shipId}/apply?edit=${appId}`);
    }
  };

  return (
    <div className="applications-page">
      {notice && (
        <Notice
          message={notice.msg}
          type={notice.type}
          onClose={() => setNotice(null)}
        />
      )}
      <div className="container">
        {loading ? (
          <div className="no-results">Loading applications...</div>
        ) : (
          <div>
            <div className="apps-head">
              <h2>Your Applications</h2>
              <div className="apps-controls">
                <input
                  placeholder="Search ship or route"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="apps-table">
              <div className="apps-row apps-header">
                <div>Ship</div>
                <div>Cargo</div>
                <div>Contact</div>
                <div>Status</div>
                <div>Date</div>
                <div>Actions</div>
              </div>

              {filtered.map((a) => (
                <div className="apps-row" key={a.id}>
                  <div className="ship-name">{a.ship_name || a.shipName || "Ship"}</div>
                  <div>{a.cargo_type || a.cargoType || "—"}</div>
                  <div>{a.contact_name || a.contactName || "—"}</div>
                  <div>
                    <span
                      className="status-pill"
                      style={{ background: statusColor(a.status) }}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div>
                    {new Date(a.created_at || a.createdAt).toLocaleDateString()}
                  </div>
                  <div className="row-actions">
                    <button className="view-btn" onClick={() => openView(a)}>
                      View
                    </button>
                    {a.status === "pending" && (
                      <button
                        className="apply-btn"
                        onClick={() => withdraw(a.id)}
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {!loading && !filtered.length && (
                <div className="no-results">No applications found.</div>
              )}
            </div>

            {selected && (
              <div
                className="modal-back"
                onClick={() => setSelected(null)}
              >
                <div
                  className="modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3>Application #{selected.id}</h3>
                  <p>
                    <strong>Ship:</strong> {selected.ship_name || selected.shipName}
                  </p>
                  <p>
                    <strong>Cargo:</strong> {selected.cargo_type || selected.cargoType}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selected.contact_name || selected.contactName}
                  </p>
                  <p>
                    <strong>Status:</strong> {selected.status}
                  </p>
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {new Date(selected.created_at || selected.createdAt).toLocaleString()}
                  </p>
                  <h4>Message</h4>
                  <p>{selected.form?.message || "—"}</p>
                  <div className="form-actions">
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelected(null);
                        navigate(`/ships/${selected.shipId}`);
                      }}
                    >
                      Open Ship
                    </button>
                    {selected.status === "pending" && (
                      <button
                        className="apply-btn"
                        onClick={() => {
                          withdraw(selected.id);
                          setSelected(null);
                        }}
                      >
                        Withdraw
                      </button>
                    )}
                    <button
                      className="view-btn"
                      onClick={() => setSelected(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
