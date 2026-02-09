import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api";

export default function ShopCreate() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    shop_category_id: "",
    description: "",
    sku: "",
    brand: "",
    model_number: "",
    color: "",
    material: "",
    price: "",
    status: "active"
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/shop-categories`);
      if (res?.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

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
      fd.append("contact_name", formData.contact_name || "");
      fd.append("shop_category_id", formData.shop_category_id || "");
      fd.append("sku", formData.sku || "");
      fd.append("brand", formData.brand || "");
      fd.append("model_number", formData.model_number || "");
      fd.append("color", formData.color || "");
      fd.append("material", formData.material || "");
      fd.append("price", formData.price || "");
      fd.append("status", formData.status || "active");
      if (imageFile) fd.append("image", imageFile);

      await axios.post(`${API_URL}/admin/shops`, fd, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
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
        <h1>Create Shop Product</h1>
        <button onClick={() => navigate('/admin/shops')}>← Back</button>
      </div>

      <div className="admin-form">
        <form onSubmit={handleSubmit}>
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.shop_category_id}
                onChange={(e) => setFormData({ ...formData, shop_category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <h3>Product Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>SKU / Product ID</label>
              <input
                placeholder="SKU / Product ID"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Brand / Manufacturer</label>
              <input
                placeholder="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Model Number / Series</label>
              <input
                placeholder="Model Number"
                value={formData.model_number}
                onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                placeholder="Color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Material</label>
              <input
                placeholder="Material"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                placeholder="Price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <h3>Other Information</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Owner ID</label>
              <input
                placeholder="Owner ID"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              {imageFile && (
                <div className="image-preview">
                  <img src={URL.createObjectURL(imageFile)} alt="preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Product"}</button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin/shops')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  );
}
