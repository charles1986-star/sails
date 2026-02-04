import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Articles() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadArticles();
  }, [user, navigate]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/articles`, { headers });
      setArticles(response.data.data);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to load articles",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setNotice({
        message: "Title and content are required",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeader();
      if (editingId) {
        await axios.put(`${API_URL}/articles/${editingId}`, formData, {
          headers,
        });
        setNotice({ message: "Article updated successfully!", type: "success" });
      } else {
        await axios.post(`${API_URL}/articles`, formData, { headers });
        setNotice({ message: "Article created successfully!", type: "success" });
      }
      setFormData({});
      setEditingId(null);
      setTimeout(() => loadArticles(), 1000);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to save article",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.delete(`${API_URL}/articles/${id}`, { headers });
      setNotice({ message: "Article deleted successfully!", type: "success" });
      setTimeout(() => loadArticles(), 1000);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to delete",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setFormData({});
    setEditingId(null);
  };

  return (
    <div className="admin-page">
      <Notice
        message={notice.message}
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <div className="admin-container">
        <h1>Manage Articles</h1>

        <div className="admin-form">
          <h3>{editingId ? "Edit Article" : "Add New Article"}</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category || ""}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              disabled={loading}
            />
            <textarea
              placeholder="Content"
              value={formData.content || ""}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              disabled={loading}
              rows="6"
              required
            ></textarea>
            <select
              value={formData.status || ""}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              disabled={loading}
            >
              <option value="">Select Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TITLE</th>
                <th>AUTHOR</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>VIEWS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No articles found
                  </td>
                </tr>
              ) : (
                articles.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.username || "-"}</td>
                    <td>{item.category || "-"}</td>
                    <td>{item.status}</td>
                    <td>{item.views}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(item)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
