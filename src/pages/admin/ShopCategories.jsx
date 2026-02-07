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

  // Build tree structure with depth
  const buildTreeData = (cats) => {
    const tree = [];
    const buildNode = (parentId, depth = 0) => {
      const children = cats.filter(c => c.parent_id === parentId);
      children.forEach(child => {
        tree.push({ ...child, depth });
        buildNode(child.id, depth + 1);
      });
    };
    buildNode(null);
    return tree;
  };

  const treeData = buildTreeData(categories);

  return (
    <div className="admin-container">
      {notice && <Notice message={notice.message} type={notice.type} onClose={() => setNotice(null)} />}
      
      <div className="admin-header">
        <h1>Shop Categories (Tree Structure)</h1>
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
                <th>Category Name</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {treeData.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ paddingLeft: `${cat.depth * 30 + 16}px` }}>
                    {cat.depth > 0 && <span style={{ color: "#999" }}>{"└─ "}</span>}
                    <strong>{cat.name}</strong>
                  </td>
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
          {treeData.length === 0 && <div className="no-data">No categories found</div>}
        </div>
      )}
    </div>
  );
}
