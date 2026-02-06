import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function ArticleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!id) return;
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_URL}/articles/${id}`, { headers });
      setFormData(res.data.data || {});
    } catch (err) {
      console.error(err);
      setNotice({ message: 'Failed to load article', type: 'error' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.put(`${API_URL}/articles/${id}`, formData, { headers });
      setNotice({ message: 'Article updated', type: 'success' });
      setTimeout(() => navigate('/admin/articles'), 600);
    } catch (err) {
      console.error(err);
      setNotice({ message: err.response?.data?.msg || 'Failed to update', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "" })} />
      <div className="admin-container">
        <div className="admin-header-row"><h1>Edit Article</h1></div>
        <div className="admin-form">
          <form onSubmit={handleSubmit}>
            <input placeholder="Title" value={formData.title||''} onChange={(e)=>setFormData({...formData, title:e.target.value})} required />
            <input placeholder="Category" value={formData.category||''} onChange={(e)=>setFormData({...formData, category:e.target.value})} />
            <textarea placeholder="Content" value={formData.content||''} onChange={(e)=>setFormData({...formData, content:e.target.value})} rows={8} required />
            <select value={formData.status||'draft'} onChange={(e)=>setFormData({...formData, status:e.target.value})}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <div className="form-buttons">
              <button type="submit" disabled={loading}>{loading? 'Saving...':'Update'}</button>
              <button type="button" onClick={() => navigate('/admin/articles')} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
