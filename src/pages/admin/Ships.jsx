import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import { setShips } from "../../redux/slices/shipSlice";
import axios from "axios";
import Pagination from "../../components/Pagination";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Ships() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { ships } = useSelector((state) => state.ships);

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
    loadShips();
  }, [user, navigate]);

  const loadShips = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/ships`, { headers });
      dispatch(setShips(response.data.data));
      setNotice({ message: "Ships loaded", type: "success" });
    } catch (error) {
      console.error("Error loading ships:", error);
      setNotice({
        message: error.response?.data?.msg || "Failed to load ships",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ship?")) return;
    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.delete(`${API_URL}/ships/${id}`, { headers });
      setNotice({ message: "Ship deleted successfully!", type: "success" });
      setTimeout(() => loadShips(), 500);
    } catch (error) {
      console.error("Error deleting ship:", error);
      setNotice({
        message: error.response?.data?.msg || "Failed to delete",
        type: "error",
      });
    }
    setLoading(false);
  };

  // Pagination
  const totalPages = Math.ceil(ships.length / itemsPerPage);
  const paginatedShips = ships.slice(
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
          <h1>Ships</h1>
          <div>
            <button onClick={() => navigate('/admin/ships/new')} className="btn-primary">Add Ship</button>
          </div>
        </div>

        <div className="admin-table-container">
          <h3>Ships List ({ships.length})</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>IMO</th>
                <th>NAME</th>
                <th>TYPE</th>
                <th>CAPACITY</th>
                <th>PORTS</th>
                <th>IMAGE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedShips.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No ships found
                  </td>
                </tr>
              ) : (
                paginatedShips.map((ship) => (
                  <tr key={ship.id}>
                    <td>{ship.imo}</td>
                    <td>{ship.name}</td>
                    <td>{ship.type}</td>
                    <td>{ship.capacity_tons} tons</td>
                    <td>{ship.current_port || "-"} → {ship.next_port || "-"}</td>
                    <td>
                      {ship.image_url ? (
                        <img
                          src={`http://localhost:5000${ship.image_url}`}
                          alt={ship.name}
                          style={{ maxWidth: "50px", height: "auto", borderRadius: "4px" }}
                          title={ship.name}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${ship.status}`}>
                        {ship.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/admin/ships/${ship.id}/edit`)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(ship.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination page={currentPage} totalPages={totalPages} onChange={(p) => setCurrentPage(p)} />
        </div>
      </div>
    </div>
  );
}
