import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { getAuthHeader } from '../../utils/auth';
import { addCategory } from '../../redux/slices/categoriesSlice';
import Notice from '../../components/Notice';
import '../../styles/admin.css';

const API_URL = 'http://localhost:5000/api/admin';

export default function CategoryCreate() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { categories } = useSelector((state) => state.categories);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

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

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        status: formData.status,
      };

      const res = await axios.post(`${API_URL}/categories`, payload, { headers: getAuthHeader() });
      setNotice({ type: 'success', msg: 'Category created successfully!' });
      
      setTimeout(() => navigate('/admin/categories'), 1500);
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', msg: err.response?.data?.msg || 'Failed to create category' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="admin-container">Access denied</div>;
  }

  return (
    <div className="admin-container">
      {notice && <Notice type={notice.type} msg={notice.msg} />}
      
      <div className="admin-header">
        <h1>Create Category</h1>
        <button className="btn-secondary" onClick={() => navigate('/admin/categories')}>
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
            placeholder="e.g., Design, Development"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Parent Category (Optional)</label>
          <select
            name="parent_id"
            value={formData.parent_id}
            onChange={handleChange}
          >
            <option value="">None (Top-level)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/admin/categories')}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
