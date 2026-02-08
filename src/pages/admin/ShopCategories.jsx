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

  // FIX 1: Separate auth check from data loading
  useEffect(() => {
    if (!user) return; // wait until auth is initialized
    if (user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]); // Only run when user or navigate changes

  // FIX 2: Load categories only once on mount (when user is admin)
  useEffect(() => {
    if (user && user.role === "admin") {
      loadCategories();
    }
  }, []); // Empty dependency array = run once on mount

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

  const nestedTree = (cats, parent = null) => {
    return cats
      .filter(c => c.parent_id === parent)
      .map(c => ({ ...c, children: nestedTree(cats, c.id) }));
  };

  const nested = nestedTree(categories);

  const TreeNode = ({ node }) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="tree-node">
        <div className="tree-row">
          {node.children.length > 0 && (
            <button className={`caret ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>{open ? '▾' : '▸'}</button>
          )}
          <strong style={{ marginLeft: 8 }}>{node.name}</strong>
          <span style={{ marginLeft: 12 }} className={`status-badge ${node.status}`}>{node.status}</span>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-small" onClick={() => navigate(`/admin/shop-categories/edit/${node.id}`)}>Edit</button>
            <button className="btn-small btn-danger" onClick={() => handleDelete(node.id)}>Delete</button>
          </div>
        </div>
        {open && node.children.length > 0 && (
          <div className="tree-children" style={{ marginLeft: 20 }}>
            {node.children.map((ch) => (
              <TreeNode key={ch.id} node={ch} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-container">
      {notice && <Notice message={notice.message} type={notice.type} onClose={() => setNotice(null)} />}

      <div className="admin-header">
        <h1>Shop Categories (Tree)</h1>
        <button className="btn-primary" onClick={() => navigate("/admin/shop-categories/create")}>+ New Category</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="admin-tree">
          {nested.length === 0 ? <div className="no-data">No categories found</div> : nested.map((n) => <TreeNode key={n.id} node={n} />)}
        </div>
      )}
    </div>
  );
}
