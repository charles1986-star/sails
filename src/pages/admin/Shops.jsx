import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthHeader } from "../../utils/auth";
import Notice from "../../components/Notice";
import axios from "axios";
import Pagination from "../../components/Pagination";
import "../../styles/admin.css";

const API_URL = "http://localhost:5000/api/admin";

export default function Shops() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadShops();
  }, [user, navigate]);

  const loadShops = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/shops`, { headers });
      setShops(response.data.data);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to load shops",
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
      await axios.delete(`${API_URL}/shops/${id}`, { headers });
      setNotice({ message: "Shop deleted successfully!", type: "success" });
      setTimeout(() => loadShops(), 800);
    } catch (error) {
      setNotice({
        message: error.response?.data?.msg || "Failed to delete",
        type: "error",
      });
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(shops.length / itemsPerPage);
  const paginated = shops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-page">
      <Notice
        message={notice.message}
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <div className="admin-container">
        <div className="admin-header-row">
          <h1>Shops</h1>
          <div>
            <button className="btn-primary" onClick={() => navigate('/admin/shops/new')}>Add Shop</button>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>CATEGORY</th>
                <th>OWNER</th>
                <th>IMAGE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No shops found</td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category || "-"}</td>
                    <td>{item.owner_id || "-"}</td>
                    <td>
                      {item.image_url ? (
                        <img src={`http://localhost:5000${item.image_url}`} alt={item.name} style={{ maxWidth: "50px", height: "auto" }} />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{item.status}</td>
                    <td>
                      <button className="btn-edit" onClick={() => navigate(`/admin/shops/${item.id}/edit`)} disabled={loading}>Edit</button>
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
