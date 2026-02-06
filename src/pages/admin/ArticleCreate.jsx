import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function ArticleCreate() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", category: "", status: "draft" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setNotice({ message: 'Title and content required', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.post(`${API_URL}/articles`, formData, { headers });
      setNotice({ message: 'Article created', type: 'success' });
      setTimeout(() => navigate('/admin/articles'), 600);
    } catch (err) {
      console.error(err);
      setNotice({ message: err.response?.data?.msg || 'Failed to create', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row"><h1>Add Article</h1></div>
        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input placeholder="Title" value={formData.title} onChange={(e)=>setFormData({...formData, title:e.target.value})} required />
            <input placeholder="Category" value={formData.category} onChange={(e)=>setFormData({...formData, category:e.target.value})} />
            <textarea placeholder="Content" value={formData.content} onChange={(e)=>setFormData({...formData, content:e.target.value})} rows={8} required />
            <select value={formData.status} onChange={(e)=>setFormData({...formData, status:e.target.value})}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading? 'Saving...':'Create'}</button>
              <button type="button" onClick={() => navigate('/admin/articles')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
