import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeader } from '../../utils/auth';
import Notice from '../../components/Notice';
import '../../styles/admin.css';

const API_URL = 'http://localhost:5000/api/admin';

const entityTypes = {
  'books': 'Books',
  'media': 'Media',
  'articles': 'Articles',
  'games': 'Games'
};

export default function EntityCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [entityType, setEntityType] = useState('books');

  useEffect(() => {
    loadCategories();
  }, [entityType]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/${entityType}-categories`, { headers: getAuthHeader() });
      setCategories(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', msg: `Failed to load ${entityType} categories` });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`${API_URL}/${entityType}-categories/${id}`, { headers: getAuthHeader() });
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
        <div>
          <h1>Categories Management</h1>
          <div style={{ marginBottom: '20px' }}>
            <label>Select Entity: </label>
            <select 
              value={entityType} 
              onChange={(e) => setEntityType(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              {Object.entries(entityTypes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-primary" onClick={() => navigate(`/admin/${entityType}-categories/create`)}>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>No categories found</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td><strong>{cat.name}</strong></td>
                  <td>{cat.description || '-'}</td>
                  <td>
                    <span className={`status-badge status-${cat.status}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="admin-btn edit"
                      onClick={() => navigate(`/admin/${entityType}-categories/${cat.id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="admin-btn delete"
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
