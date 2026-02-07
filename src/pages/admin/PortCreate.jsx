import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function PortCreate() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    description: "",
    status: "active",
  });

  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setNotice({ message: "Port name is required", type: "error" });
      return false;
    }
    if (!formData.country.trim()) {
      setNotice({ message: "Country is required", type: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.post(`${API_URL}/ports`, formData, { headers });
      setNotice({ message: "Port created successfully!", type: "success" });
      setTimeout(() => navigate("/admin/ports"), 1000);
    } catch (error) {
      console.error("Error creating port:", error);
      setNotice({
        message: error.response?.data?.msg || "Failed to create port",
        type: "error",
      });
    }
    setLoading(false);
  };

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="admin-page">
      <Notice
        message={notice.message}
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Create New Port</h1>
          <button onClick={() => navigate("/admin/ports")} className="btn-secondary">
            Back to Ports
          </button>
        </div>

        <div className="admin-form-container">
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Port Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Port of Singapore"
                required
                className="form-input"
              />
              <small>Enter the official port name</small>
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="e.g., Singapore"
                required
                className="form-input"
              />
              <small>Country where the port is located</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide additional details about the port..."
                rows="5"
                className="form-input"
              />
              <small>Optional: Add port details, facilities, or special notes</small>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <small>Set the port availability status</small>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Port"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/ports")}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
