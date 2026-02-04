import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Shops() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadShops();
  }, [user, navigate]);

  const loadShops = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/shops`, { headers });
      setShops(response.data.data);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to load shops",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setNotice({ message: "Shop name is required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeader();
      const formDataMultipart = new FormData();
      formDataMultipart.append("name", formData.name);
      formDataMultipart.append("description", formData.description || "");
      formDataMultipart.append("owner_id", formData.owner_id || "");
      formDataMultipart.append("category", formData.category || "");
      formDataMultipart.append("status", formData.status || "active");
      if (imageFile) {
        formDataMultipart.append("image", imageFile);
      }

      if (editingId) {
        await axios.put(`${API_URL}/shops/${editingId}`, formDataMultipart, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });
        setNotice({ message: "Shop updated successfully!", type: "success" });
      } else {
        await axios.post(`${API_URL}/shops`, formDataMultipart, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });
        setNotice({ message: "Shop created successfully!", type: "success" });
      }
      setFormData({});
      setImageFile(null);
      setEditingId(null);
      setTimeout(() => loadShops(), 1000);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to save shop",
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
      await axios.delete(`${API_URL}/shops/${id}`, { headers });
      setNotice({ message: "Shop deleted successfully!", type: "success" });
      setTimeout(() => loadShops(), 1000);
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
        <h1>Manage Shops</h1>

        <div className="admin-form">
          <h3>{editingId ? "Edit Shop" : "Add New Shop"}</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Shop Name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              required
            />
            <input
              type="number"
              placeholder="Owner ID"
              value={formData.owner_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, owner_id: e.target.value })
              }
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category || ""}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              disabled={loading}
            />
            <textarea
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
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
            <select
              value={formData.status || ""}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              disabled={loading}
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
                <th>CATEGORY</th>
                <th>OWNER</th>
                <th>IMAGE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {shops.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No shops found
                  </td>
                </tr>
              ) : (
                shops.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category || "-"}</td>
                    <td>{item.owner_id || "-"}</td>
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
