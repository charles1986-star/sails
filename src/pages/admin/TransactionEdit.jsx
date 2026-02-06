import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function TransactionEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState({ user_id: "", amount: "", type: "purchase", description: "", status: "pending" });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadTransaction();
  }, [user, id, navigate]);

  const loadTransaction = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_URL}/transactions/${id}`, { headers });
      setFormData(res.data.data || {});
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to load", type: "error" });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.put(`${API_URL}/transactions/${id}`, formData, { headers });
      setNotice({ message: "Transaction updated", type: "success" });
      setTimeout(() => navigate('/admin/transactions'), 800);
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || "Failed to update", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Edit Transaction</h1>
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input placeholder="User ID" value={formData.user_id || ""} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} required />
            <input type="number" step="0.01" placeholder="Amount" value={formData.amount || ""} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
            <select value={formData.type || "purchase"} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <option value="purchase">Purchase</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
            </select>
            <input placeholder="Description" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <select value={formData.status || "pending"} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Update"}</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/transactions')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
