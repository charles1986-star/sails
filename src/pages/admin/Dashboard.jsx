import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getCurrentUser } from "../../utils/auth";
import "../../styles/admin.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      console.warn("Access denied: User is not an admin");
      navigate("/");
      return;
    }
  }, [user, navigate]);

  const adminSections = [
    { name: "Transactions", path: "/admin/transactions", icon: "💳" },
    { name: "Books", path: "/admin/books", icon: "📚" },
    { name: "Media", path: "/admin/media", icon: "🎬" },
    { name: "Articles", path: "/admin/articles", icon: "📰" },
    { name: "Shops", path: "/admin/shops", icon: "🏪" },
    { name: "Ships", path: "/admin/ships", icon: "⛵" },
    { name: "Games", path: "/admin/games", icon: "🎮" },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.username || "Admin"}!</p>
      </div>

      <div className="admin-grid">
        {adminSections.map((section) => (
          <div
            key={section.path}
            className="admin-card"
            onClick={() => navigate(section.path)}
          >
            <div className="admin-icon">{section.icon}</div>
            <h3>{section.name}</h3>
            <p>Manage {section.name.toLowerCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
