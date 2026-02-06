import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function ShopEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState({ name: "", owner_id: "", category: "", description: "", status: "active" });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadShop();
  }, [user, id, navigate]);

  const loadShop = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_URL}/shops/${id}`, { headers });
      setFormData(res.data.data || {});
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to load", type: "error" });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description || "");
      fd.append("owner_id", formData.owner_id || "");
      fd.append("category", formData.category || "");
      fd.append("status", formData.status || "active");
      if (imageFile) fd.append("image", imageFile);

      await axios.put(`${API_URL}/shops/${id}`, fd, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
      setNotice({ message: "Shop updated", type: "success" });
      setTimeout(() => navigate('/admin/shops'), 800);
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to update", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Edit Shop</h1>
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input placeholder="Shop Name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <input placeholder="Owner ID" value={formData.owner_id || ""} onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })} />
            <input placeholder="Category" value={formData.category || ""} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            <textarea placeholder="Description" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            <select value={formData.status || "active"} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Update"}</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/shops')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
