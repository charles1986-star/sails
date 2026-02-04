import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import { setApplications, updateApplication as updateAppInRedux } from "../../redux/slices/applicationSlice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Applications() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { applications } = useSelector((state) => state.applications);

  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user || user.role !== "admin") {
      console.warn("Access denied: User is not admin");
      navigate("/");
      return;
    }
    loadApplications();
  }, [user, navigate]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/applications`, { headers });
      dispatch(setApplications(response.data.data));
      setNotice({ message: "Applications loaded", type: "success" });
    } catch (error) {
      console.error("Error loading applications:", error);
      setNotice({
        message: error.response?.data?.msg || "Failed to load applications",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.put(
        `${API_URL}/applications/${appId}`,
        {
          status: newStatus,
          admin_message: adminMessage,
        },
        { headers }
      );

      setNotice({
        message: `Application ${newStatus} successfully!`,
        type: "success",
      });

      setAdminMessage("");
      setSelectedApp(null);
      loadApplications();
    } catch (error) {
      console.error("Error updating application:", error);
      setNotice({
        message: error.response?.data?.msg || "Failed to update application",
        type: "error",
      });
    }
    setLoading(false);
  };

  // Filter applications
  const filteredApps =
    statusFilter === "all"
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  // Paginate
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ff9800";
      case "accepted":
        return "#4caf50";
      case "rejected":
        return "#f44336";
      default:
        return "#999";
    }
  };

  return (
    <div className="admin-page">
      <Notice
        message={notice.message}
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <div className="admin-container">
        <h1>Ship Applications Management</h1>

        {/* Filters */}
        <div className="filter-section">
          <label>Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Applications ({applications.length})</option>
            <option value="pending">
              Pending (
              {applications.filter((a) => a.status === "pending").length})
            </option>
            <option value="accepted">
              Accepted (
              {applications.filter((a) => a.status === "accepted").length})
            </option>
            <option value="rejected">
              Rejected (
              {applications.filter((a) => a.status === "rejected").length})
            </option>
          </select>
        </div>

        {/* Selected Application Details */}
        {selectedApp && (
          <div className="app-details-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Application Details</h2>
                <button
                  className="close-btn"
                  onClick={() => setSelectedApp(null)}
                  disabled={loading}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {/* Ship Info */}
                <div className="detail-section">
                  <h3>Ship Information</h3>
                  <div className="detail-grid">
                    <div>
                      <strong>Ship Name:</strong>
                      <p>{selectedApp.ship_name}</p>
                    </div>
                    <div>
                      <strong>IMO:</strong>
                      <p>{selectedApp.imo}</p>
                    </div>
                  </div>
                  {selectedApp.image_url && (
                    <div style={{ margin: "15px 0" }}>
                      <img
                        src={`http://localhost:5000${selectedApp.image_url}`}
                        alt={selectedApp.ship_name}
                        style={{
                          maxWidth: "200px",
                          height: "auto",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Applicant Info */}
                <div className="detail-section">
                  <h3>Applicant Information</h3>
                  <div className="detail-grid">
                    <div>
                      <strong>Name:</strong>
                      <p>{selectedApp.contact_name}</p>
                    </div>
                    <div>
                      <strong>Email:</strong>
                      <p>{selectedApp.contact_email}</p>
                    </div>
                    <div>
                      <strong>Phone:</strong>
                      <p>{selectedApp.contact_phone || "-"}</p>
                    </div>
                    <div>
                      <strong>Username:</strong>
                      <p>{selectedApp.username}</p>
                    </div>
                  </div>
                </div>

                {/* Cargo Info */}
                <div className="detail-section">
                  <h3>Cargo Information</h3>
                  <div className="detail-grid">
                    <div>
                      <strong>Type:</strong>
                      <p>{selectedApp.cargo_type}</p>
                    </div>
                    <div>
                      <strong>Weight:</strong>
                      <p>
                        {selectedApp.cargo_weight} {selectedApp.weight_unit}
                      </p>
                    </div>
                    <div>
                      <strong>Loading Date:</strong>
                      <p>{selectedApp.preferred_loading_date || "-"}</p>
                    </div>
                    <div>
                      <strong>Arrival Date:</strong>
                      <p>{selectedApp.preferred_arrival_date || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedApp.message && (
                  <div className="detail-section">
                    <h3>Applicant Message</h3>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {selectedApp.message}
                    </p>
                  </div>
                )}

                {/* Admin Message */}
                <div className="detail-section">
                  <h3>Admin Message</h3>
                  <textarea
                    placeholder="Write your message to the applicant..."
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    disabled={loading}
                    rows="4"
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  {selectedApp.status === "pending" && (
                    <>
                      <button
                        className="btn-accept"
                        onClick={() =>
                          handleUpdateStatus(selectedApp.id, "accepted")
                        }
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "✓ Accept"}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() =>
                          handleUpdateStatus(selectedApp.id, "rejected")
                        }
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "✕ Reject"}
                      </button>
                    </>
                  )}
                  <button
                    className="btn-cancel"
                    onClick={() => setSelectedApp(null)}
                    disabled={loading}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applications Table */}
        <div className="admin-table-container">
          <h3>
            Applications ({filteredApps.length} / {applications.length})
          </h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>APPLICANT</th>
                <th>SHIP</th>
                <th>CARGO TYPE</th>
                <th>WEIGHT</th>
                <th>STATUS</th>
                <th>APPLIED ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No applications found
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td>{app.contact_name}</td>
                    <td>{app.ship_name}</td>
                    <td>{app.cargo_type}</td>
                    <td>
                      {app.cargo_weight} {app.weight_unit}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(app.status),
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => {
                          setSelectedApp(app);
                          setAdminMessage(app.admin_message || "");
                        }}
                        disabled={loading}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .filter-section {
          background: #f5f5f5;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 8px;
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .filter-section label {
          font-weight: 600;
          color: #333;
        }

        .filter-section select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }

        .app-details-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
          position: sticky;
          top: 0;
          background: white;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: #f0f0f0;
          border-radius: 4px;
        }

        .modal-body {
          padding: 20px;
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-section h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
          font-size: 16px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .detail-grid div {
          background: #f9f9f9;
          padding: 12px;
          border-radius: 6px;
        }

        .detail-grid strong {
          display: block;
          color: #666;
          font-size: 12px;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .detail-grid p {
          margin: 0;
          color: #333;
          font-weight: 500;
        }

        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          flex-wrap: wrap;
        }

        .action-buttons button {
          flex: 1;
          min-width: 120px;
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-accept {
          background: #4caf50;
          color: white;
        }

        .btn-accept:hover:not(:disabled) {
          background: #45a049;
        }

        .btn-reject {
          background: #f44336;
          color: white;
        }

        .btn-reject:hover:not(:disabled) {
          background: #da190b;
        }

        .btn-cancel {
          background: #999;
          color: white;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #777;
        }

        .btn-view {
          background: #2196f3;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .btn-view:hover:not(:disabled) {
          background: #0b7dda;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .text-center {
          text-align: center;
          color: #999;
          padding: 20px !important;
        }
      `}</style>
    </div>
  );
}
