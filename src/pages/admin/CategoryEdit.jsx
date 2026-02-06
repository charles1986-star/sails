import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { getAuthHeader } from '../../utils/auth';
import { updateCategory } from '../../redux/slices/categoriesSlice';
import Notice from '../../components/Notice';
import '../../styles/admin.css';

const API_URL = 'http://localhost:5000/api/admin';

export default function CategoryEdit() {
  const { id } = useParams();
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

  useEffect(() => {
    if (!id) return;
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/categories/${id}`, { headers: getAuthHeader() });
      const cat = res?.data?.data;
      if (cat) {
        setFormData({
          name: cat.name || '',
          description: cat.description || '',
          parent_id: cat.parent_id || '',
          status: cat.status || 'active',
        });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', msg: 'Failed to load category' });
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

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        status: formData.status,
      };

      const res = await axios.put(`${API_URL}/categories/${id}`, payload, { headers: getAuthHeader() });
      
      dispatch(updateCategory({ id: parseInt(id), ...payload }));
      setNotice({ type: 'success', msg: 'Category updated successfully!' });
      
      setTimeout(() => navigate('/admin/categories'), 1500);
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', msg: err.response?.data?.msg || 'Failed to update category' });
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
        <h1>Edit Category</h1>
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
            {categories
              .filter((cat) => cat.id !== parseInt(id))
              .map((cat) => (
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
            {loading ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
