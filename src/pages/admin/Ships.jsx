import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import { setShips, setLoading as setShipsLoading } from "../../redux/slices/shipSlice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Ships() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { ships, loading: shipsLoading } = useSelector((state) => state.ships);

  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    imo: "",
    type: "",
    capacity_tons: "",
    current_port: "",
    next_port: "",
    ship_owner: "",
    description: "",
    last_maintenance_date: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.imo || !formData.type || !formData.capacity_tons) {
      setNotice({
        message: "Required fields: name, IMO, type, capacity",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeader();
      const formDataMultipart = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataMultipart.append(key, formData[key]);
        }
      });

      if (imageFile) {
        formDataMultipart.append("image", imageFile);
      }

      if (editingId) {
        await axios.put(`${API_URL}/ships/${editingId}`, formDataMultipart, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });
        setNotice({ message: "Ship updated successfully!", type: "success" });
      } else {
        await axios.post(`${API_URL}/ships`, formDataMultipart, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });
        setNotice({ message: "Ship created successfully!", type: "success" });
      }

      resetForm();
      setTimeout(() => loadShips(), 1000);
    } catch (error) {
      console.error("Error saving ship:", error);
      setNotice({
        message: error.response?.data?.msg || "Failed to save ship",
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
      setTimeout(() => loadShips(), 1000);
    } catch (error) {
      console.error("Error deleting ship:", error);
      setNotice({
        message: error.response?.data?.msg || "Failed to delete",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleEdit = (ship) => {
    setEditingId(ship.id);
    setFormData({
      name: ship.name,
      imo: ship.imo,
      type: ship.type,
      capacity_tons: ship.capacity_tons,
      current_port: ship.current_port || "",
      next_port: ship.next_port || "",
      ship_owner: ship.ship_owner || "",
      description: ship.description || "",
      last_maintenance_date: ship.last_maintenance_date || "",
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      imo: "",
      type: "",
      capacity_tons: "",
      current_port: "",
      next_port: "",
      ship_owner: "",
      description: "",
      last_maintenance_date: "",
    });
    setImageFile(null);
    setEditingId(null);
    setCurrentPage(1);
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
        <h1>Manage Ships</h1>

        {/* Form */}
        <div className="admin-form">
          <h3>{editingId ? "Edit Ship" : "Add New Ship"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input
                type="text"
                name="name"
                placeholder="Ship Name *"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <input
                type="text"
                name="imo"
                placeholder="IMO Number *"
                value={formData.imo}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <input
                type="text"
                name="type"
                placeholder="Ship Type *"
                value={formData.type}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <input
                type="number"
                name="capacity_tons"
                placeholder="Capacity (tons) *"
                value={formData.capacity_tons}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <input
                type="text"
                name="current_port"
                placeholder="Current Port"
                value={formData.current_port}
                onChange={handleInputChange}
                disabled={loading}
              />
              <input
                type="text"
                name="next_port"
                placeholder="Next Port"
                value={formData.next_port}
                onChange={handleInputChange}
                disabled={loading}
              />
              <input
                type="text"
                name="ship_owner"
                placeholder="Ship Owner"
                value={formData.ship_owner}
                onChange={handleInputChange}
                disabled={loading}
              />
              <input
                type="date"
                name="last_maintenance_date"
                placeholder="Last Maintenance Date"
                value={formData.last_maintenance_date}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows="4"
            ></textarea>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              disabled={loading}
            />
            {editingId && formData.image_url && !imageFile && (
              <p className="file-info">Current image: {formData.image_url}</p>
            )}
            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Ship" : "Add Ship"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} disabled={loading}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
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
                        onClick={() => handleEdit(ship)}
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
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
