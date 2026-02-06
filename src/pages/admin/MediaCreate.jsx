import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function MediaCreate() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState({ title: "", media_type: "image", category: "", description: "", status: "active" });
  const [file, setFile] = useState(null);

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.media_type) {
      setNotice({ message: "Title and media type required", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const headers = getAuthHeader();
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        await axios.post(`${API_URL}/media`, fd, { headers });
      } else {
        await axios.post(`${API_URL}/media`, formData, { headers: { ...headers, "Content-Type": "application/json" } });
      }
      setNotice({ message: "Media created", type: "success" });
      setTimeout(() => navigate('/admin/media'), 800);
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
          <h1>Create Media</h1>
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <select value={formData.media_type} onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <input placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Create"}</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/media')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
