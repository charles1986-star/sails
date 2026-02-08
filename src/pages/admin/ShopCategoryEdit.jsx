import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import axios from "axios";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api";

export default function ShopCategoryEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    description: "",
    image_url: "",
    status: "active"
  });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!user) return; // wait for auth initialization
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    loadCategory();
    loadCategories();
  }, [id, user, navigate]);

  const loadCategory = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/shop-categories/${id}`, { headers: getAuthHeader() });
      if (res?.data?.data) {
        setFormData(res.data.data);
      }
    } catch (err) {
      setNotice({ message: "Failed to load category", type: "error" });
    }
  };

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/shop-categories/admin/all`, { headers: getAuthHeader() });
      if (res?.data?.data) {
        setCategories(res.data.data.filter(cat => cat.id !== parseInt(id)));
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setNotice({ message: "Category name is required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        description: formData.description || null,
        image_url: formData.image_url || null,
        status: formData.status
      };

      await axios.put(`${API_URL}/admin/shop-categories/${id}`, payload, { headers: getAuthHeader() });
      setNotice({ message: "Category updated successfully!", type: "success" });
      setTimeout(() => navigate("/admin/shop-categories"), 1500);
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to update category", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="admin-container">
      {notice && <Notice message={notice.message} type={notice.type} onClose={() => setNotice(null)} />}
      
      <div className="admin-header">
        <h1>Edit Shop Category</h1>
        <button className="btn-secondary" onClick={() => navigate("/admin/shop-categories")}>
          ← Back
        </button>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Electronics, Clothing, Home"
            required
          />
        </div>

        <div className="form-group">
          <label>Parent Category (Optional)</label>
          <select
            name="parent_id"
            value={formData.parent_id || ""}
            onChange={handleChange}
          >
            <option value="">No parent (root category)</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Category description..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url || ""}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Updating..." : "Update Category"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/shop-categories")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
