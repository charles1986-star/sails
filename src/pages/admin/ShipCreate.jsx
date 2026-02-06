import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import "../../styles/admin.css";
import { useDispatch } from "react-redux";
import { addShip } from "../../redux/slices/shipSlice";

const API_URL = "http://localhost:5000/api/admin";

export default function ShipCreate() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    imo: "",
    type: "",
    capacity_tons: "",
    current_port: "",
    next_port: "",
    ship_owner: "",
    description: "",
    last_maintenance_date: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.imo) {
      setNotice({ message: "Name and IMO are required", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const fd = new FormData();
      Object.keys(formData).forEach((k) => formData[k] && fd.append(k, formData[k]));
      if (imageFile) fd.append("image", imageFile);
      const res = await axios.post(`${API_URL}/ships`, fd, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
      const created = res?.data?.data;
      if (created) dispatch(addShip(created));
      setNotice({ message: "Ship created", type: "success" });
      setTimeout(() => navigate('/admin/ships'), 600);
    } catch (err) {
      console.error(err);
      setNotice({ message: err.response?.data?.msg || 'Failed to create ship', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Add Ship</h1>
        </div>

        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input name="name" placeholder="Ship Name *" value={formData.name} onChange={handleInputChange} required />
              <input name="imo" placeholder="IMO Number *" value={formData.imo} onChange={handleInputChange} required />
              <input name="type" placeholder="Ship Type" value={formData.type} onChange={handleInputChange} />
              <input name="capacity_tons" placeholder="Capacity (tons)" value={formData.capacity_tons} onChange={handleInputChange} />
              <input name="current_port" placeholder="Current Port" value={formData.current_port} onChange={handleInputChange} />
              <input name="next_port" placeholder="Next Port" value={formData.next_port} onChange={handleInputChange} />
              <input name="ship_owner" placeholder="Ship Owner" value={formData.ship_owner} onChange={handleInputChange} />
              <input type="date" name="last_maintenance_date" value={formData.last_maintenance_date} onChange={handleInputChange} />
            </div>
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} rows="4"></textarea>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Ship'}</button>
              <button type="button" onClick={() => navigate('/admin/ships')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
