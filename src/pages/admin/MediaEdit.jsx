import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function MediaEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState({ 
    title: "", 
    media_type: "image", 
    category_id: "", 
    description: "", 
    status: "active" 
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadCategories();
    loadMedia();
  }, [user, id, navigate]);

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`, { headers: getAuthHeader() });
      setCategories(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadMedia = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_URL}/media/${id}`, { headers });
      setFormData(res.data.data || {});
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to load media", type: "error" });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const fd = new FormData();
      if (file) {
        fd.append("file", file);
      }
      fd.append("title", formData.title);
      fd.append("media_type", formData.media_type);
      fd.append("category_id", formData.category_id || "");
      fd.append("description", formData.description);
      fd.append("status", formData.status);

      await axios.put(`${API_URL}/media/${id}`, fd, { headers });
      setNotice({ message: "Media updated successfully", type: "success" });
      setTimeout(() => navigate('/admin/media'), 800);
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to update media", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Edit Media</h1>
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input 
              placeholder="Title" 
              value={formData.title || ""} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              required 
            />
            <select 
              value={formData.media_type || "image"} 
              onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="image/*,video/*,audio/*"
            />
            <select 
              value={formData.category_id || ""} 
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Select Category (Optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <textarea 
              placeholder="Description" 
              value={formData.description || ""} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            />
            <select 
              value={formData.status || "active"} 
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Update"}</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/media')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
