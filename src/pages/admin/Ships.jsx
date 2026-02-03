import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Ships() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [ships, setShips] = useState([]);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
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
      setShips(response.data.data);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to load ships",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setNotice({ message: "Ship name is required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeader();
      const formDataMultipart = new FormData();
      formDataMultipart.append("name", formData.name);
      formDataMultipart.append("description", formData.description || "");
      formDataMultipart.append("specifications", formData.specifications || "");
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
      setFormData({});
      setImageFile(null);
      setEditingId(null);
      setTimeout(() => loadShips(), 1000);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to save ship",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.delete(`${API_URL}/ships/${id}`, { headers });
      setNotice({ message: "Ship deleted successfully!", type: "success" });
      setTimeout(() => loadShips(), 1000);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to delete",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setFormData({});
    setImageFile(null);
    setEditingId(null);
  };

  return (
    <div className="admin-page">
      <Notice
        message={notice.message}
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <div className="admin-container">
        <h1>Manage Ships</h1>

        <div className="admin-form">
          <h3>{editingId ? "Edit Ship" : "Add New Ship"}</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ship Name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading}
            ></textarea>
            <textarea
              placeholder="Specifications (JSON format)"
              value={formData.specifications || ""}
              onChange={(e) =>
                setFormData({ ...formData, specifications: e.target.value })
              }
              disabled={loading}
            ></textarea>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              disabled={loading}
            />
            {formData.image_url && !imageFile && (
              <p className="file-info">Current: {formData.image_url}</p>
            )}
            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>IMAGE</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {ships.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No ships found
                  </td>
                </tr>
              ) : (
                ships.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>
                      {item.image_url ? (
                        <img
                          src={`http://localhost:5000${item.image_url}`}
                          alt={item.name}
                          style={{ maxWidth: "50px", height: "auto" }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{item.status}</td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(item)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item.id)}
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
        </div>
      </div>
    </div>
  );
}
