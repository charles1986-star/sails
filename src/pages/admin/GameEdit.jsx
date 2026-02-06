import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function GameEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState({ title: "", category: "", price: "", description: "", status: "active" });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadGame();
  }, [user, id, navigate]);

  const loadGame = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_URL}/games/${id}`, { headers });
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
      await axios.put(`${API_URL}/games/${id}`, formData, { headers });
      setNotice({ message: "Game updated", type: "success" });
      setTimeout(() => navigate('/admin/games'), 800);
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
          <h1>Edit Game</h1>
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input placeholder="Title" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <input placeholder="Category" value={formData.category || ""} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            <input type="number" step="0.01" placeholder="Price" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            <textarea placeholder="Description" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <select value={formData.status || "active"} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Update"}</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/games')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
