import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/admin.css";

export default function AdminLayout() {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});

  const sections = [
    { name: "Dashboard", to: "/admin/dashboard" },
    { name: "Applications", to: "/admin/applications" },
    { name: "Transactions", to: "/admin/transactions" },
    {
      name: "Books",
      to: "/admin/books",
      submenu: [
        { name: "Books List", to: "/admin/books" },
        { name: "Categories", to: "/admin/books-categories" },
      ],
    },
    {
      name: "Media",
      to: "/admin/media",
      submenu: [
        { name: "Media List", to: "/admin/media" },
        { name: "Categories", to: "/admin/media-categories" },
      ],
    },
    {
      name: "Articles",
      to: "/admin/articles",
      submenu: [
        { name: "Articles List", to: "/admin/articles" },
        { name: "Categories", to: "/admin/articles-categories" },
      ],
    },
    {
      name: "Shops",
      to: "/admin/shops",
      submenu: [
        { name: "Shops List", to: "/admin/shops" },
        { name: "Categories", to: "/admin/shop-categories" },
      ],
    },
    { name: "Ships", to: "/admin/ships" },
    {
      name: "Games",
      to: "/admin/games",
      submenu: [
        { name: "Games List", to: "/admin/games" },
        { name: "Categories", to: "/admin/games-categories" },
      ],
    },
  ];

  const toggleSubmenu = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const isSubmenuActive = (section) => {
    if (!section.submenu) return false;
    return section.submenu.some((item) => location.pathname === item.to);
  };

  return (
    <div className="admin-page admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">Admin</div>
        <nav className="admin-sidebar-nav">
          {sections.map((s, idx) => {
            const isActive = location.pathname === s.to || (s.submenu && isSubmenuActive(s));
            const isExpanded = expandedSections[idx];

            return (
              <div key={s.to} className="admin-menu-item">
                {s.submenu ? (
                  <>
                    <button
                      className={`admin-link admin-submenu-toggle ${isActive ? "active" : ""}`}
                      onClick={() => toggleSubmenu(idx)}
                    >
                      <span>{s.name}</span>
                      <span className={`chevron ${isExpanded ? "expanded" : ""}`}>▼</span>
                    </button>
                    {isExpanded && (
                      <div className="admin-submenu">
                        {s.submenu.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              isActive ? "admin-submenu-link active" : "admin-submenu-link"
                            }
                          >
                            {item.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={s.to}
                    className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
                  >
                    {s.name}
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
