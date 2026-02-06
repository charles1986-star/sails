import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function GameCreate() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState({ title: "", category: "", price: "", description: "", status: "active" });

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setNotice({ message: "Game title is required", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.post(`${API_URL}/games`, formData, { headers });
      setNotice({ message: "Game created", type: "success" });
      setTimeout(() => navigate('/admin/games'), 800);
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
          <h1>Create Game</h1>
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <input placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            <input type="number" step="0.01" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Create"}</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/games')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
