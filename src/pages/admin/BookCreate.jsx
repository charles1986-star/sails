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
      if (formData.cover_image) formPayload.append('cover_image', formData.cover_image);
      if (formData.main_file) formPayload.append('main_file', formData.main_file);
      if (formData.preview_file) formPayload.append('preview_file', formData.preview_file);
      if (formData.thumbnail) formPayload.append('thumbnail', formData.thumbnail);

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
              placeholder="Subtitle (optional)" 
              value={formData.subtitle} 
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} 
            />
            <input 
              placeholder="Author" 
              value={formData.author} 
              onChange={(e) => setFormData({ ...formData, author: e.target.value })} 
              required 
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={formData.is_free} onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })} /> Free
              </label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="Price" 
                value={formData.price} 
                onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                disabled={formData.is_free}
              />
              <input type="number" placeholder="Score cost" value={formData.score_cost} onChange={(e) => setFormData({ ...formData, score_cost: e.target.value })} />
              <input type="number" step="0.01" placeholder="Discount price" value={formData.discount_price} onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })} />
            </div>
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
            <input placeholder="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.files?.[0] || null })}
                placeholder="Upload cover image or PDF"
              />
              <input type="file" accept=".pdf,.epub,video/*,audio/*" onChange={(e) => setFormData({ ...formData, main_file: e.target.files?.[0] || null })} />
              <input type="file" accept="image/*,.pdf" onChange={(e) => setFormData({ ...formData, preview_file: e.target.files?.[0] || null })} />
              <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })} />
            </div>
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
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
