import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import Pagination from "../../components/Pagination";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Media() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadMedia();
  }, [user, navigate]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/media`, { headers });
      setMedia(response.data.data);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to load media",
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
      await axios.delete(`${API_URL}/media/${id}`, { headers });
      setNotice({ message: "Media deleted successfully!", type: "success" });
      setTimeout(() => loadMedia(), 800);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to delete",
        type: "error",
      });
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(media.length / itemsPerPage);
  const paginated = media.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-page">
      <Notice
        message={notice.message}
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Media</h1>
          <div>
            <button className="btn-primary" onClick={() => navigate('/admin/media/new')}>Add Media</button>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TITLE</th>
                <th>TYPE</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No media found</td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.media_type}</td>
                    <td>{item.category || "-"}</td>
                    <td>{item.status}</td>
                    <td>
                      <button className="btn-edit" onClick={() => navigate(`/admin/media/${item.id}/edit`)} disabled={loading}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id)} disabled={loading}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination page={currentPage} totalPages={totalPages} onChange={(p) => setCurrentPage(p)} />
        </div>
      </div>
    </div>
  );
}
