import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import "../../styles/admin.css";
import { useDispatch } from "react-redux";
import { updateShip } from "../../redux/slices/shipSlice";

const API_URL = "http://localhost:5000/api/admin";

export default function ShipEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [ports, setPorts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    imo: "",
    type: "",
    capacity_tons: "",
    start_port_id: "",
    end_port_id: "",
    ship_owner: "",
    description: "",
    last_maintenance_date: "",
    status: "active",
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!id) return;
    loadPorts();
    loadShip();
  }, [id]);

  const loadPorts = async () => {
    try {
      const response = await axios.get(`${API_URL}/ports-list`);
      setPorts(response.data.data);
    } catch (error) {
      console.error("Error loading ports:", error);
    }
  };

  const loadShip = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_URL}/ships/${id}`, { headers });
      setFormData(res.data.data || {});
    } catch (err) {
      console.error(err);
      setNotice({ message: 'Failed to load ship', type: 'error' });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const fd = new FormData();
      Object.keys(formData).forEach((k) => formData[k] && fd.append(k, formData[k]));
      if (imageFile) fd.append('image', imageFile);
      const res = await axios.put(`${API_URL}/ships/${id}`, fd, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      const updated = res?.data?.data;
      if (updated) dispatch(updateShip(updated));
      setNotice({ message: 'Ship updated successfully!', type: 'success' });
      setTimeout(() => navigate('/admin/ships'), 600);
    } catch (err) {
      console.error(err);
      setNotice({ message: err.response?.data?.msg || 'Failed to update ship', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Edit Ship</h1>
          <button onClick={() => navigate('/admin/ships')} className="btn-secondary">Back to Ships</button>
        </div>

        <div className="admin-form-container">
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label htmlFor="name">Ship Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter ship name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
                <small>Official name of the ship</small>
              </div>

              <div className="form-group">
                <label htmlFor="imo">IMO Number *</label>
                <input
                  type="text"
                  id="imo"
                  name="imo"
                  placeholder="Enter IMO number"
                  value={formData.imo || ''}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  maxLength="7"
                />
                <small>International Maritime Organization number</small>
              </div>

              <div className="form-group">
                <label htmlFor="type">Ship Type</label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  placeholder="e.g., Container Ship, Tanker, Bulk Carrier"
                  value={formData.type || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <small>Classification of the ship</small>
              </div>

              <div className="form-group">
                <label htmlFor="capacity_tons">Capacity (tons)</label>
                <input
                  type="number"
                  id="capacity_tons"
                  name="capacity_tons"
                  placeholder="Enter cargo capacity"
                  value={formData.capacity_tons || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <small>Maximum cargo capacity in tons</small>
              </div>
            </div>

            <div className="form-section">
              <h3>Port Information</h3>
              <div className="form-group">
                <label htmlFor="start_port_id">Start Port *</label>
                <select
                  id="start_port_id"
                  name="start_port_id"
                  value={formData.start_port_id || ''}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">-- Select Start Port --</option>
                  {ports.map((port) => (
                    <option key={port.id} value={port.id}>
                      {port.name} ({port.country})
                    </option>
                  ))}
                </select>
                <small>Port where the ship journey starts</small>
              </div>

              <div className="form-group">
                <label htmlFor="end_port_id">End Port *</label>
                <select
                  id="end_port_id"
                  name="end_port_id"
                  value={formData.end_port_id || ''}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">-- Select End Port --</option>
                  {ports.map((port) => (
                    <option key={port.id} value={port.id}>
                      {port.name} ({port.country})
                    </option>
                  ))}
                </select>
                <small>Port where the ship journey ends</small>
              </div>
            </div>

            <div className="form-section">
              <h3>Additional Details</h3>
              <div className="form-group">
                <label htmlFor="ship_owner">Ship Owner</label>
                <input
                  type="text"
                  id="ship_owner"
                  name="ship_owner"
                  placeholder="Enter owner name"
                  value={formData.ship_owner || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <small>Name of the ship owner or company</small>
              </div>

              <div className="form-group">
                <label htmlFor="last_maintenance_date">Last Maintenance Date</label>
                <input
                  type="date"
                  id="last_maintenance_date"
                  name="last_maintenance_date"
                  value={formData.last_maintenance_date || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <small>Date of last maintenance</small>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'active'}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
                <small>Current status of the ship</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter ship details, specifications, or notes..."
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows="5"
                  className="form-input"
                />
                <small>Additional information about the ship</small>
              </div>

              <div className="form-group">
                <label htmlFor="image">Ship Image</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="form-input"
                />
                <small>Upload a ship image (PNG, JPG, etc.)</small>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Ship'}
              </button>
              <button type="button" onClick={() => navigate('/admin/ships')} className="btn-secondary" disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
