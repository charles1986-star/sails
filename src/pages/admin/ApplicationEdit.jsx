import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import { updateApplication } from "../../redux/slices/applicationSlice";
import { useDispatch } from "react-redux";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function ApplicationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [app, setApp] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    loadApp();
  }, [id]);

  const loadApp = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_URL}/applications/${id}`, { headers });
      setApp(res.data.data);
      setAdminMessage(res.data.data?.admin_message || "");
    } catch (err) {
      console.error(err);
      setNotice({ message: 'Failed to load application', type: 'error' });
    }
    setLoading(false);
  };

  const handleUpdate = async (newStatus) => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.put(`${API_URL}/applications/${id}`, { status: newStatus, admin_message: adminMessage }, { headers });
      const updated = res?.data?.data || { ...app, status: newStatus, admin_message: adminMessage };
      dispatch(updateApplication(updated));
      setNotice({ message: 'Application updated', type: 'success' });
      setTimeout(() => navigate('/admin/applications'), 600);
    } catch (err) {
      console.error(err);
      setNotice({ message: err.response?.data?.msg || 'Failed to update', type: 'error' });
    }
    setLoading(false);
  };

  if (!app) return <div className="admin-page"><div className="admin-container"><p>Loading...</p></div></div>;

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Application {app.id}</h1>
        </div>

        <div className="admin-form">
          <div className="form-grid">
            <div>
              <strong>Ship:</strong>
              <p>{app.ship_name || app.shipName}</p>
            </div>
            <div>
              <strong>Applicant:</strong>
              <p>{app.contact_name || app.form?.contactName}</p>
            </div>
            <div>
              <strong>Email:</strong>
              <p>{app.contact_email || app.form?.contactEmail}</p>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Admin Message</label>
            <textarea value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} rows={4}></textarea>
          </div>

          <div className="form-buttons">
            {app.status === 'pending' && (
              <>
                <button className="btn-accept" onClick={() => handleUpdate('accepted')} disabled={loading}>Accept</button>
                <button className="btn-reject" onClick={() => handleUpdate('rejected')} disabled={loading}>Reject</button>
              </>
            )}
            <button className="btn-cancel" onClick={() => navigate('/admin/applications')} disabled={loading}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
