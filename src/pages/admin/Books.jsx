import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Books() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadBooks();
  }, [user, navigate]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/books`, { headers });
      setBooks(response.data.data);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to load books",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.price) {
      setNotice({
        message: "Title, author, and price are required",
        type: "error",
      });
      return;
    }
    if (isNaN(formData.price) || formData.price <= 0) {
      setNotice({ message: "Price must be a positive number", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeader();
      if (editingId) {
        await axios.put(`${API_URL}/books/${editingId}`, formData, { headers });
        setNotice({ message: "Book updated successfully!", type: "success" });
      } else {
        await axios.post(`${API_URL}/books`, formData, { headers });
        setNotice({ message: "Book created successfully!", type: "success" });
      }
      setFormData({});
      setEditingId(null);
      setTimeout(() => loadBooks(), 1000);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to save book",
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
      await axios.delete(`${API_URL}/books/${id}`, { headers });
      setNotice({ message: "Book deleted successfully!", type: "success" });
      setTimeout(() => loadBooks(), 1000);
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
        <h1>Manage Books</h1>

        <div className="admin-form">
          <h3>{editingId ? "Edit Book" : "Add New Book"}</h3>
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
              placeholder="Author"
              value={formData.author || ""}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              disabled={loading}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading}
            ></textarea>
            <select
              value={formData.status || ""}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              disabled={loading}
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No books found
                  </td>
                </tr>
              ) : (
                books.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.author}</td>
                    <td>${item.price?.toFixed(2)}</td>
                    <td>{item.category || "-"}</td>
                    <td>{item.status}</td>
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
