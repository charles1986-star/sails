import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import Pagination from "../../components/Pagination";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Books() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [freeFilter, setFreeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadBooks();
  }, [user, navigate]);

  useEffect(() => {
    // reload when filters or page change
    loadBooks();
  }, [currentPage]);

  const loadBooks = async (page = currentPage) => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const params = {
        q: query || undefined,
        category_id: categoryId || undefined,
        free: freeFilter || undefined,
        status: statusFilter || undefined,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      };
      const response = await axios.get(`${API_URL}/books`, { headers, params });
      setBooks(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to load books",
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.delete(`${API_URL}/books/${id}`, { headers });
      setNotice({ message: "Book archived successfully!", type: "success" });
      setTimeout(() => loadBooks(), 800);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to archive",
        type: "error",
      });
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="admin-page">
      <Notice
        message={notice.message}
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Books</h1>
          <div>
            <button className="btn-primary" onClick={() => navigate('/admin/books/new')}>Add Book</button>
            <button className="btn-secondary" onClick={() => navigate('/admin/books/analytics')}>Analytics</button>
          </div>
        </div>

        <div className="admin-filters">
          <input placeholder="Search title or author" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={freeFilter} onChange={(e) => setFreeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="true">Free</option>
            <option value="false">Paid</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Any status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={() => { setCurrentPage(1); loadBooks(1); }}>Apply</button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TITLE</th>
                <th>AUTHOR</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No books found</td>
                </tr>
              ) : (
                books.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.author}</td>
                    <td>{item.is_free ? 'Free' : item.price ? `$${parseFloat(item.price).toFixed(2)}` : '-'}</td>
                    <td>{item.category || "-"}</td>
                    <td>{item.status}</td>
                    <td>
                      <button className="btn-edit" onClick={() => navigate(`/admin/books/${item.id}/edit`)} disabled={loading}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id)} disabled={loading}>Archive</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination page={currentPage} totalPages={totalPages} onChange={(p) => { setCurrentPage(p); loadBooks(p); }} />
        </div>
      </div>
    </div>
  );
}
