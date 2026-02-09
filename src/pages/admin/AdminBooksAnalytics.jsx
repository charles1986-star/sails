import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getAuthHeader } from '../../utils/auth';
import Notice from '../../components/Notice';
import '../../styles/admin.css';

const API_URL = 'http://localhost:5000/api/admin';

export default function AdminBooksAnalytics() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [series, setSeries] = useState(null);
  const [notice, setNotice] = useState({ message: '', type: '' });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadStats();
    loadSeries();
  }, [user, navigate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${API_URL}/books/stats`, { headers });
      setStats(res.data.data || null);
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || 'Failed to load stats', type: 'error' });
    }
    setLoading(false);
  };

  const loadSeries = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const now = new Date();
      const start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0,10);
      const end = now.toISOString().slice(0,10);
      const res = await axios.get(`${API_URL}/books/stats/timeseries`, { headers, params: { start, end } });
      setSeries(res.data.data || []);
    } catch (err) {
      setNotice({ message: err.response?.data?.msg || 'Failed to load timeseries', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <Notice message={notice.message} type={notice.type} onClose={() => setNotice({ message: '', type: '' })} />
      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Books Analytics</h1>
        </div>

        {!stats ? (
          <p>Loading metrics...</p>
        ) : (
          <div className="analytics-grid">
            <div className="card">
              <h3>Total Books</h3>
              <p>{stats.total_books}</p>
            </div>
            <div className="card">
              <h3>Total Downloads</h3>
              <p>{stats.total_downloads}</p>
            </div>
            <div className="card">
              <h3>Total Purchases</h3>
              <p>{stats.total_purchases}</p>
            </div>
            <div className="card">
              <h3>Revenue</h3>
              <p>${parseFloat(stats.revenue || 0).toFixed(2)}</p>
            </div>

            <div className="card full">
              <h3>Top Downloads</h3>
              <ol>
                {stats.popular?.map((b) => (
                  <li key={b.id}>{b.title} — {b.download_count}</li>
                ))}
              </ol>
            </div>

            <div className="card full">
              <h3>Top Categories</h3>
              <ol>
                {stats.topCats?.map((c, idx) => (
                  <li key={idx}>Category {c.category_id} — {c.cnt}</li>
                ))}
              </ol>
            </div>

            <div className="card full">
              <h3>Downloads / Purchases (last 14 days)</h3>
              {series ? (
                <SimpleLineChart data={series} />
              ) : (
                <p>Loading chart...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SimpleLineChart({ data }) {
  // data: [{day:'2026-02-01', downloads, purchases, revenue}, ...]
  const width = 700; const height = 200; const pad = 30;
  const days = data.map(d => d.day);
  const maxY = Math.max(...data.map(d => Math.max(d.downloads || 0, d.purchases || 0)), 1);
  const x = (i) => pad + (i * (width - pad * 2) / Math.max(1, data.length - 1));
  const y = (v) => height - pad - (v * (height - pad * 2) / maxY);

  const downloadsPath = data.map((d, i) => `${i===0? 'M':'L'} ${x(i)} ${y(d.downloads||0)}`).join(' ');
  const purchasesPath = data.map((d, i) => `${i===0? 'M':'L'} ${x(i)} ${y(d.purchases||0)}`).join(' ');

  return (
    <svg width={width} height={height} style={{ border: '1px solid #eee', background: '#fff' }}>
      <g>
        <path d={downloadsPath} stroke="#007bff" strokeWidth={2} fill="none" />
        <path d={purchasesPath} stroke="#28a745" strokeWidth={2} fill="none" />
      </g>
      <g>
        {data.map((d,i) => (
          <g key={d.day}>
            <text x={x(i)} y={height - 4} fontSize={10} textAnchor="middle">{d.day.slice(5)}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
