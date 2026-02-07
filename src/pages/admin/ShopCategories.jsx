import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import axios from "axios";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api";

export default function AdminShopCategories() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [categories, setCategories] = useState([]);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check authorization
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/shop-categories/admin/all`, { headers: getAuthHeader() });
      if (res?.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      setNotice({ 
        message: err.response?.data?.msg || "Failed to load categories", 
        type: "error" 
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API_URL}/admin/shop-categories/${id}`, { headers: getAuthHeader() });
      setNotice({ message: "Category deleted!", type: "success" });
      loadCategories();
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to delete", type: "error" });
    }
  };

  // Build hierarchical display
  const getCategoryDisplay = (cat) => {
    if (!cat.parent_id) return cat.name;
    const parent = categories.find(c => c.id === cat.parent_id);
    return `${parent?.name || "—"} → ${cat.name}`;
  };

  return (
    <div className="admin-container">
      {notice && <Notice message={notice.message} type={notice.type} onClose={() => setNotice(null)} />}
      
      <div className="admin-header">
        <h1>Shop Categories</h1>
        <button className="btn-primary" onClick={() => navigate("/admin/shop-categories/create")}>
          + New Category
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Parent</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{categories.find(c => c.id === cat.parent_id)?.name || "—"}</td>
                  <td><span className={`status-badge ${cat.status}`}>{cat.status}</span></td>
                  <td>{new Date(cat.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button className="btn-small" onClick={() => navigate(`/admin/shop-categories/edit/${cat.id}`)}>
                      Edit
                    </button>
                    <button className="btn-small btn-danger" onClick={() => handleDelete(cat.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <div className="no-data">No categories found</div>}
        </div>
      )}
    </div>
  );
}
