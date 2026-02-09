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

  // Build tree structure from flat list
  const buildTree = (list) => {
    const map = {};
    list.forEach(i => { map[i.id] = { ...i, children: [] }; });
    const roots = [];
    list.forEach(i => {
      if (i.parent_id) {
        if (map[i.parent_id]) map[i.parent_id].children.push(map[i.id]);
        else roots.push(map[i.id]);
      } else roots.push(map[i.id]);
    });
    // sort by display_order
    const sortRec = (arr) => {
      arr.sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
      arr.forEach(c => sortRec(c.children));
    };
    sortRec(roots);
    return roots;
  };

  const [tree, setTree] = useState([]);

  useEffect(() => {
    setTree(buildTree(categories));
  }, [categories]);

  // Drag and drop handlers for tree
  const dragItem = { current: null };

  const onDragStart = (e, node) => {
    dragItem.current = node;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDropNode = (e, targetNode) => {
    e.preventDefault();
    const source = dragItem.current;
    if (!source || source.id === targetNode.id) return;

    // Remove source from tree
    const removeNode = (arr, id) => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === id) { arr.splice(i,1); return true; }
        if (removeNode(arr[i].children, id)) return true;
      }
      return false;
    };

    const clone = JSON.parse(JSON.stringify(tree));
    removeNode(clone, source.id);
    // Add source as child of target
    const findNode = (arr, id) => {
      for (const n of arr) { if (n.id === id) return n; const r = findNode(n.children, id); if (r) return r; }
      return null;
    };
    const tgt = findNode(clone, targetNode.id);
    if (tgt) tgt.children.push({ ...source, children: source.children || [] });
    setTree(clone);
  };

  const allowDrop = (e) => { e.preventDefault(); };

  const flattenForSave = (arr, parent = null) => {
    const res = [];
    arr.forEach((n, idx) => {
      res.push({ id: n.id, parent_id: parent, display_order: idx });
      if (n.children && n.children.length) res.push(...flattenForSave(n.children, n.id));
    });
    return res;
  };

  const saveOrder = async () => {
    try {
      const payload = flattenForSave(tree);
      await axios.post(`${API_URL}/books-categories/reorder`, payload, { headers: getAuthHeader() });
      setNotice({ type: 'success', msg: 'Order saved' });
      loadCategories();
    } catch (err) {
      setNotice({ type: 'error', msg: err.response?.data?.msg || 'Failed to save order' });
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
        {entityType === 'books' ? (
          <div>
            <div style={{ marginBottom: 12 }}>
              <button className="btn-primary" onClick={saveOrder}>Save Order</button>
            </div>
            <div>
              {tree.length === 0 ? <p>No categories</p> : (
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {tree.map(node => (
                    <CategoryNode key={node.id} node={node} onDragStart={onDragStart} onDropNode={onDropNode} allowDrop={allowDrop} navigate={navigate} handleDelete={handleDelete} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

function CategoryNode({ node, onDragStart, onDropNode, allowDrop, navigate, handleDelete }) {
  return (
    <li style={{ marginBottom: 8 }}>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, node)}
        onDragOver={allowDrop}
        onDrop={(e) => onDropNode(e, node)}
        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <strong>{node.name}</strong>
          <div style={{ fontSize: 12, color: '#666' }}>{node.description}</div>
        </div>
        <div>
          <button className="admin-btn edit" onClick={() => navigate(`/admin/books-categories/${node.id}`)}>Edit</button>
          <button className="admin-btn delete" onClick={() => handleDelete(node.id)}>Delete</button>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <ul style={{ listStyle: 'none', paddingLeft: 16, marginTop: 8 }}>
          {node.children.map(c => (
            <CategoryNode key={c.id} node={c} onDragStart={onDragStart} onDropNode={onDropNode} allowDrop={allowDrop} navigate={navigate} handleDelete={handleDelete} />
          ))}
        </ul>
      )}
    </li>
  );
}
