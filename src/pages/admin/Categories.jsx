import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { getAuthHeader } from '../../utils/auth';
import { setCategories } from '../../redux/slices/categoriesSlice';
import Notice from '../../components/Notice';
import '../../styles/admin.css';

const API_URL = 'http://localhost:5000/api/admin';

export default function AdminCategories() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { categories } = useSelector((state) => state.categories);
  
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/categories`, { headers: getAuthHeader() });
      dispatch(setCategories(res?.data?.data || []));
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', msg: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`${API_URL}/categories/${id}`, { headers: getAuthHeader() });
      setNotice({ type: 'success', msg: 'Category deleted successfully' });
      loadCategories();
    } catch (err) {
      setNotice({ type: 'error', msg: err.response?.data?.msg || 'Delete failed' });
    }
  };

  if (loading) return <div className="admin-container"><p>Loading...</p></div>;

  return (
    <div className="admin-container">
      {notice && <Notice type={notice.type} msg={notice.msg} />}
      
      <div className="admin-header">
        <h1>Categories Management</h1>
        <button className="btn-primary" onClick={() => navigate('/admin/categories/create')}>
          + Create Category
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Parent Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No categories found</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td><strong>{cat.name}</strong></td>
                  <td>{cat.description?.substring(0, 50) || '-'}</td>
                  <td>
                    <span className={`status-badge status-${cat.status}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td>{cat.parent_id ? `ID: ${cat.parent_id}` : '-'}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => navigate(`/admin/categories/edit/${cat.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
