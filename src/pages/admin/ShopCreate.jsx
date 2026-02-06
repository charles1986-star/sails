import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function ShopCreate() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState({ name: "", owner_id: "", category: "", description: "", status: "active" });
  const [imageFile, setImageFile] = useState(null);

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setNotice({ message: "Shop name is required", type: "error" });
      return;
    }
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

      await axios.post(`${API_URL}/shops`, fd, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
      setNotice({ message: "Shop created", type: "success" });
      setTimeout(() => navigate('/admin/shops'), 800);
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to create", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Create Shop</h1>
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input placeholder="Shop Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <input placeholder="Owner ID" value={formData.owner_id} onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })} />
            <input placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Create"}</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/shops')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
