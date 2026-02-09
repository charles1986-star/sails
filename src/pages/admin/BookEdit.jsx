import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function BookEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState({ 
    title: "", 
    subtitle: "",
    author: "", 
    price: "", 
    category_id: "", 
    description: "", 
    tags: "",
    is_free: false,
    score_cost: 0,
    discount_price: "",
    access_level: 'public',
    max_downloads: 0,
    expire_days_after_purchase: 0,
    cover_image: null,
    main_file: null,
    preview_file: null,
    thumbnail: null,
    status: "draft" 
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadCategories();
    loadBook();
  }, [user, id, navigate]);

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`, { headers: getAuthHeader() });
      setCategories(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadBook = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_URL}/books/${id}`, { headers });
      const d = res.data.data || {};
      setFormData({
        title: d.title || '',
        subtitle: d.subtitle || '',
        author: d.author || '',
        price: d.price || '',
        category_id: d.category_id || '',
        description: d.description || '',
        tags: d.tags || '',
        is_free: !!d.is_free,
        score_cost: d.score_cost || 0,
        discount_price: d.discount_price || '',
        access_level: d.access_level || 'public',
        max_downloads: d.max_downloads || 0,
        expire_days_after_purchase: d.expire_days_after_purchase || 0,
        cover_image: d.cover_image || null,
        main_file: d.file_url || null,
        preview_file: d.preview_url || null,
        thumbnail: d.thumbnail_url || null,
        status: d.status || 'draft'
      });
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to load book", type: "error" });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('subtitle', formData.subtitle);
      formPayload.append('author_name', formData.author);
      formPayload.append('price', formData.price || 0);
      formPayload.append('category_id', formData.category_id || '');
      formPayload.append('description', formData.description);
      formPayload.append('tags', formData.tags);
      formPayload.append('is_free', formData.is_free ? 'true' : 'false');
      formPayload.append('score_cost', formData.score_cost || 0);
      formPayload.append('discount_price', formData.discount_price || '');
      formPayload.append('access_level', formData.access_level || 'public');
      formPayload.append('max_downloads', formData.max_downloads || 0);
      formPayload.append('expire_days_after_purchase', formData.expire_days_after_purchase || 0);
      formPayload.append('status', formData.status);
      if (formData.cover_image && typeof formData.cover_image !== 'string') formPayload.append('cover_image', formData.cover_image);
      if (formData.main_file && typeof formData.main_file !== 'string') formPayload.append('main_file', formData.main_file);
      if (formData.preview_file && typeof formData.preview_file !== 'string') formPayload.append('preview_file', formData.preview_file);
      if (formData.thumbnail && typeof formData.thumbnail !== 'string') formPayload.append('thumbnail', formData.thumbnail);

      const headers = getAuthHeader();
      await axios.put(`${API_URL}/books/${id}`, formPayload, { headers });
      setNotice({ message: "Book updated successfully", type: "success" });
      setTimeout(() => navigate("/admin/books"), 800);
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to update book", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Edit Book</h1>
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input 
              placeholder="Title" 
              value={formData.title || ""} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              required 
            />
            <input 
              placeholder="Author" 
              value={formData.author || ""} 
              onChange={(e) => setFormData({ ...formData, author: e.target.value })} 
              required 
            />
            <input 
              type="number" 
              step="0.01" 
              placeholder="Price" 
              value={formData.price || ""} 
              onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
              required 
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
            <input 
              type="file" 
              accept="image/*,.pdf" 
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.files?.[0] || null })}
              placeholder="Upload cover image or PDF"
            />
            {formData.cover_image && typeof formData.cover_image === 'string' && (
              <p>Current image: {formData.cover_image}</p>
            )}
            <select 
              value={formData.status || "active"} 
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Update"}</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/books')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
