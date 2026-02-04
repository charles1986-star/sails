import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../utils/auth";
import Notice from "../components/Notice";
import axios from "axios";
import "../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Admin() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("transactions");
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  // State for each resource
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [media, setMedia] = useState([]);
  const [articles, setArticles] = useState([]);
  const [shops, setShops] = useState([]);

  // Form states
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Check authorization
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      let endpoint = "";

      if (activeTab === "transactions") endpoint = "/transactions";
      else if (activeTab === "books") endpoint = "/books";
      else if (activeTab === "media") endpoint = "/media";
      else if (activeTab === "articles") endpoint = "/articles";
      else if (activeTab === "shops") endpoint = "/shops";

      const response = await axios.get(`${API_URL}${endpoint}`, { headers });
      
      if (activeTab === "transactions") setTransactions(response.data.data);
      else if (activeTab === "books") setBooks(response.data.data);
      else if (activeTab === "media") setMedia(response.data.data);
      else if (activeTab === "articles") setArticles(response.data.data);
      else if (activeTab === "shops") setShops(response.data.data);
    } catch (error) {
      setNotice({ 
        message: error.response?.data?.msg || "Failed to load data", 
        type: "error" 
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!validateForm()) return;

    setLoading(true);
    try {
      const headers = getAuthHeader();
      let endpoint = "";

      if (activeTab === "transactions") endpoint = "/transactions";
      else if (activeTab === "books") endpoint = "/books";
      else if (activeTab === "media") endpoint = "/media";
      else if (activeTab === "articles") endpoint = "/articles";
      else if (activeTab === "shops") endpoint = "/shops";

      if (editingId) {
        await axios.put(`${API_URL}${endpoint}/${editingId}`, formData, { headers });
        setNotice({ message: "Record updated successfully!", type: "success" });
      } else {
        await axios.post(`${API_URL}${endpoint}`, formData, { headers });
        setNotice({ message: "Record created successfully!", type: "success" });
      }

      setFormData({});
      setEditingId(null);
      setTimeout(() => loadData(), 1000);
    } catch (error) {
      setNotice({ 
        message: error.response?.data?.msg || "Failed to save record", 
        type: "error" 
      });
    }
    setLoading(false);
  };

  const validateForm = () => {
    if (activeTab === "transactions") {
      if (!formData.user_id || !formData.amount || !formData.type) {
        setNotice({ message: "User ID, amount, and type are required", type: "error" });
        return false;
      }
      if (isNaN(formData.amount) || formData.amount <= 0) {
        setNotice({ message: "Amount must be a positive number", type: "error" });
        return false;
      }
    } else if (activeTab === "books") {
      if (!formData.title || !formData.author || !formData.price) {
        setNotice({ message: "Title, author, and price are required", type: "error" });
        return false;
      }
      if (isNaN(formData.price) || formData.price <= 0) {
        setNotice({ message: "Price must be a positive number", type: "error" });
        return false;
      }
    } else if (activeTab === "media") {
      if (!formData.title || !formData.media_type) {
        setNotice({ message: "Title and media type are required", type: "error" });
        return false;
      }
    } else if (activeTab === "articles") {
      if (!formData.title || !formData.content) {
        setNotice({ message: "Title and content are required", type: "error" });
        return false;
      }
    } else if (activeTab === "shops") {
      if (!formData.name) {
        setNotice({ message: "Shop name is required", type: "error" });
        return false;
      }
    }
    return true;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    setLoading(true);
    try {
      const headers = getAuthHeader();
      let endpoint = "";

      if (activeTab === "transactions") endpoint = "/transactions";
      else if (activeTab === "books") endpoint = "/books";
      else if (activeTab === "media") endpoint = "/media";
      else if (activeTab === "articles") endpoint = "/articles";
      else if (activeTab === "shops") endpoint = "/shops";

      await axios.delete(`${API_URL}${endpoint}/${id}`, { headers });
      setNotice({ message: "Record deleted successfully!", type: "success" });
      setTimeout(() => loadData(), 1000);
    } catch (error) {
      setNotice({ 
        message: error.response?.data?.msg || "Failed to delete record", 
        type: "error" 
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

  const renderForm = () => {
    return (
      <div className="admin-form">
        <h3>{editingId ? "Edit Record" : "Add New Record"}</h3>
        <form onSubmit={handleSubmit}>
          {activeTab === "transactions" && (
            <>
              <input
                type="number"
                placeholder="User ID"
                value={formData.user_id || ""}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                disabled={loading}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={loading}
              />
              <select
                value={formData.type || ""}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Type</option>
                <option value="purchase">Purchase</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
              </select>
              <input
                type="text"
                placeholder="Description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              />
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </>
          )}

          {activeTab === "books" && (
            <>
              <input
                type="text"
                placeholder="Title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Author"
                value={formData.author || ""}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                disabled={loading}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={loading}
              />
              <textarea
                placeholder="Description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              ></textarea>
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </>
          )}

          {activeTab === "media" && (
            <>
              <input
                type="text"
                placeholder="Title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
              />
              <select
                value={formData.media_type || ""}
                onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Media Type</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
              </select>
              <input
                type="text"
                placeholder="File URL"
                value={formData.file_url || ""}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={loading}
              />
              <textarea
                placeholder="Description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              ></textarea>
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </>
          )}

          {activeTab === "articles" && (
            <>
              <input
                type="text"
                placeholder="Title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={loading}
              />
              <textarea
                placeholder="Content"
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                disabled={loading}
                rows="6"
              ></textarea>
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </>
          )}

          {activeTab === "shops" && (
            <>
              <input
                type="text"
                placeholder="Shop Name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
              <input
                type="number"
                placeholder="Owner ID"
                value={formData.owner_id || ""}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={loading}
              />
              <textarea
                placeholder="Description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              ></textarea>
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </>
          )}

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
    );
  };

  const renderTable = () => {
    let data = [];
    let columns = [];

    if (activeTab === "transactions") {
      data = transactions;
      columns = ["id", "username", "amount", "type", "status", "created_at"];
    } else if (activeTab === "books") {
      data = books;
      columns = ["id", "title", "author", "price", "category", "status"];
    } else if (activeTab === "media") {
      data = media;
      columns = ["id", "title", "media_type", "category", "status"];
    } else if (activeTab === "articles") {
      data = articles;
      columns = ["id", "title", "username", "category", "status", "views"];
    } else if (activeTab === "shops") {
      data = shops;
      columns = ["id", "name", "username", "category", "status"];
    }

    return (
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col.replace(/_/g, " ").toUpperCase()}</th>
              ))}
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center">
                  No records found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id}>
                  {columns.map((col) => (
                    <td key={col}>
                      {item[col] ? String(item[col]).substring(0, 50) : "-"}
                    </td>
                  ))}
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
    );
  };

  return (
    <div className="admin-page">
      <Notice
        message={notice.message}
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <p className="admin-subtitle">Welcome, {user?.username}!</p>

        <div className="admin-tabs">
          {["transactions", "books", "media", "articles", "shops"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
              disabled={loading}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {renderForm()}
        {renderTable()}
      </div>
    </div>
  );
}
