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
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!id) return;
    loadShip();
  }, [id]);

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

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
      setNotice({ message: 'Ship updated', type: 'success' });
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
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input name="name" placeholder="Ship Name *" value={formData.name || ''} onChange={handleInputChange} required />
              <input name="imo" placeholder="IMO Number *" value={formData.imo || ''} onChange={handleInputChange} required />
              <input name="type" placeholder="Ship Type" value={formData.type || ''} onChange={handleInputChange} />
              <input name="capacity_tons" placeholder="Capacity (tons)" value={formData.capacity_tons || ''} onChange={handleInputChange} />
              <input name="current_port" placeholder="Current Port" value={formData.current_port || ''} onChange={handleInputChange} />
              <input name="next_port" placeholder="Next Port" value={formData.next_port || ''} onChange={handleInputChange} />
              <input name="ship_owner" placeholder="Ship Owner" value={formData.ship_owner || ''} onChange={handleInputChange} />
              <input type="date" name="last_maintenance_date" value={formData.last_maintenance_date || ''} onChange={handleInputChange} />
            </div>
            <textarea name="description" placeholder="Description" value={formData.description || ''} onChange={handleInputChange} rows="4"></textarea>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update Ship'}</button>
              <button type="button" onClick={() => navigate('/admin/ships')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
