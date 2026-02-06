import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function BookCreate() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState({ 
    title: "", 
    author: "", 
    price: "", 
    category_id: "", 
    description: "", 
    cover_image: null,
    status: "active" 
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`, { headers: getAuthHeader() });
      setCategories(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('author', formData.author);
      formPayload.append('price', formData.price);
      formPayload.append('category_id', formData.category_id || '');
      formPayload.append('description', formData.description);
      formPayload.append('status', formData.status);
      if (formData.cover_image) {
        formPayload.append('cover_image', formData.cover_image);
      }

      const headers = getAuthHeader();
      await axios.post(`${API_URL}/books`, formPayload, { headers });
      setNotice({ message: "Book created successfully", type: "success" });
      setTimeout(() => navigate("/admin/books"), 800);
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to create book", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Create Book</h1>
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input 
              placeholder="Title" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              required 
            />
            <input 
              placeholder="Author" 
              value={formData.author} 
              onChange={(e) => setFormData({ ...formData, author: e.target.value })} 
              required 
            />
            <input 
              type="number" 
              step="0.01" 
              placeholder="Price" 
              value={formData.price} 
              onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
              required 
            />
            <select 
              value={formData.category_id} 
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Select Category (Optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <textarea 
              placeholder="Description" 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            />
            <input 
              type="file" 
              accept="image/*,.pdf" 
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.files?.[0] || null })}
              placeholder="Upload cover image or PDF"
            />
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Create"}</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/books')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
