import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Transactions() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadTransactions();
  }, [user, navigate]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/transactions`, { headers });
      setTransactions(response.data.data);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to load transactions",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.amount || !formData.type) {
      setNotice({
        message: "User ID, amount, and type are required",
        type: "error",
      });
      return;
    }
    if (isNaN(formData.amount) || formData.amount <= 0) {
      setNotice({
        message: "Amount must be a positive number",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeader();
      if (editingId) {
        await axios.put(`${API_URL}/transactions/${editingId}`, formData, {
          headers,
        });
        setNotice({ message: "Transaction updated successfully!", type: "success" });
      } else {
        await axios.post(`${API_URL}/transactions`, formData, { headers });
        setNotice({ message: "Transaction created successfully!", type: "success" });
      }
      setFormData({});
      setEditingId(null);
      setTimeout(() => loadTransactions(), 1000);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to save transaction",
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
      await axios.delete(`${API_URL}/transactions/${id}`, { headers });
      setNotice({ message: "Transaction deleted successfully!", type: "success" });
      setTimeout(() => loadTransactions(), 1000);
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
        <h1>Manage Transactions</h1>

        <div className="admin-form">
          <h3>{editingId ? "Edit Transaction" : "Add New Transaction"}</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              placeholder="User ID"
              value={formData.user_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, user_id: e.target.value })
              }
              disabled={loading}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              disabled={loading}
              required
            />
            <select
              value={formData.type || ""}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              disabled={loading}
              required
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
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading}
            />
            <select
              value={formData.status || ""}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              disabled={loading}
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
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
                <th>USER</th>
                <th>AMOUNT</th>
                <th>TYPE</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.username || "-"}</td>
                    <td>${item.amount?.toFixed(2)}</td>
                    <td>{item.type}</td>
                    <td>{item.status}</td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
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
