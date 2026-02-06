import { NavLink, Outlet } from "react-router-dom";
import "../styles/admin.css";

export default function AdminLayout() {
  const sections = [
    { name: "Dashboard", to: "/admin/dashboard" },
    { name: "Applications", to: "/admin/applications" },
    { name: "Transactions", to: "/admin/transactions" },
    { name: "Books", to: "/admin/books" },
    { name: "Media", to: "/admin/media" },
    { name: "Articles", to: "/admin/articles" },
    { name: "Shops", to: "/admin/shops" },
    { name: "Ships", to: "/admin/ships" },
    { name: "Games", to: "/admin/games" },
  ];

  return (
    <div className="admin-page admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">Admin</div>
        <nav className="admin-sidebar-nav">
          {sections.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
            >
              {s.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
