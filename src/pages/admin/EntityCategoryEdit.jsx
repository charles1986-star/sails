import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeader } from '../../utils/auth';
import Notice from '../../components/Notice';
import '../../styles/admin.css';

const API_BASE = 'http://localhost:5000/api/admin';

export default function EntityCategoryEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const pathParts = location.pathname.split('/');
  const entityType = pathParts[2];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    loadCategory();
  }, [id, entityType]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/${entityType}/${id}`, { headers: getAuthHeader() });
      setFormData(res.data.data);
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', msg: 'Failed to load category' });
      setTimeout(() => navigate(`/admin/${entityType}`), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setNotice({ type: 'error', msg: 'Category name is required' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        status: formData.status,
      };

      await axios.put(`${API_BASE}/${entityType}/${id}`, payload, { headers: getAuthHeader() });
      setNotice({ type: 'success', msg: 'Category updated successfully!' });
      
      setTimeout(() => navigate(`/admin/${entityType}`), 1500);
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', msg: err.response?.data?.msg || 'Failed to update category' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="admin-container"><p>Loading...</p></div>;

  return (
    <div className="admin-container">
      {notice && <Notice type={notice.type} msg={notice.msg} />}
      
      <div className="admin-header">
        <h1>Edit Category</h1>
        <button className="btn-secondary" onClick={() => navigate(`/admin/${entityType}`)}>
          ← Back to Categories
        </button>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Action, Adventure"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Optional description"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Category'}
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => navigate(`/admin/${entityType}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
