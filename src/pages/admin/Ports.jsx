import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import { setPorts } from "../../redux/slices/portsSlice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Ports() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { ports } = useSelector((state) => state.ports);

  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user || user.role !== "admin") {
      console.warn("Access denied: User is not admin");
      navigate("/");
      return;
    }
    loadPorts();
  }, [user, navigate]);

  const loadPorts = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/ports`, { headers });
      dispatch(setPorts(response.data.data));
      setNotice({ message: "Ports loaded", type: "success" });
    } catch (error) {
      console.error("Error loading ports:", error);
      setNotice({
        message: error.response?.data?.msg || "Failed to load ports",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this port?")) return;
    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.delete(`${API_URL}/ports/${id}`, { headers });
      setNotice({ message: "Port deleted successfully!", type: "success" });
      setTimeout(() => loadPorts(), 500);
    } catch (error) {
      console.error("Error deleting port:", error);
      setNotice({
        message: error.response?.data?.msg || "Failed to delete",
        type: "error",
      });
    }
    setLoading(false);
  };

  // Pagination
  const totalPages = Math.ceil(ports.length / itemsPerPage);
  const paginatedPorts = ports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-page">
      <Notice
        message={notice.message}
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Port Management</h1>
          <div>
            <button onClick={() => navigate('/admin/ports/new')} className="btn-primary">Add Port</button>
          </div>
        </div>

        <div className="admin-table-container">
          <h3>Ports List ({ports.length})</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Country</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPorts.length > 0 ? (
                paginatedPorts.map((port) => (
                  <tr key={port.id}>
                    <td>{port.id}</td>
                    <td>{port.name}</td>
                    <td>{port.country}</td>
                    <td>{port.description ? port.description.substring(0, 50) + '...' : '-'}</td>
                    <td>
                      <span className={`status-badge status-${port.status}`}>
                        {port.status}
                      </span>
                    </td>
                    <td>{new Date(port.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/admin/ports/${port.id}/edit`)}
                        className="btn-small btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(port.id)}
                        className="btn-small btn-delete"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No ports found</td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
