import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import { setApplications } from "../../redux/slices/applicationSlice";
import axios from "axios";
import Pagination from "../../components/Pagination";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api";

export default function Applications() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const { applications = [] } = useSelector((state) => state.applications);

  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);

      const headers = getAuthHeader();
      const res = await axios.get(
        `${API_URL}/ships/applications?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`,
        { headers }
      );

      dispatch(setApplications(res.data.data || []));

      setNotice({ message: "Applications loaded", type: "success" });
    } catch (err) {
      setNotice({
        message: err.response?.data?.msg || "Failed to load applications",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredApps = useMemo(() => {
    if (statusFilter === "all") return applications;
    return applications.filter((a) => a.status === statusFilter);
  }, [applications, statusFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= HELPERS ================= */
  const getStatusColor = (status) => {
    if (status === "accepted") return "#4caf50";
    if (status === "rejected") return "#f44336";
    if (status === "pending") return "#ff9800";
    return "#999";
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <Notice
        message={notice.message}
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <div className="admin-container">
        <h1>Ship Applications</h1>

        {/* Filter */}
        <div className="filter-section">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All ({applications.length})</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Applicant</th>
                <th>Ship</th>
                <th>Cargo</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Date</th>
                <th />
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
                    <td>{app.contact_name || app.form?.contactName}</td>
                    <td>{app.ship_name || app.shipName}</td>
                    <td>{app.cargo_type || app.form?.cargoType}</td>
                    <td>
                      {app.cargo_weight || app.form?.weight}{" "}
                      {app.weight_unit || app.form?.weightUnit}
                    </td>

                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(app.status),
                        }}
                      >
                        {app.status?.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        app.created_at || app.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        className="btn-view"
                        onClick={() =>
                          navigate(`/admin/applications/${app.id}/edit`)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
