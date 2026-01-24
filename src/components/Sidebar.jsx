import { useState } from "react";
import "../styles/sidebar.css";

// Sample tree categories
const categories = [
  {
    name: "Development & IT",
    icon: "💻",
    children: [
      { name: "Web Development" },
      { name: "Mobile Development" },
      { name: "Data Science" },
    ],
  },
  {
    name: "Design & Creative",
    icon: "🎨",
    children: [
      { name: "Logo Design" },
      { name: "UI/UX Design" },
      { name: "Graphic Design" },
    ],
  },
  {
    name: "Writing & Translation",
    icon: "✍️",
    children: [
      { name: "Content Writing" },
      { name: "Translation" },
    ],
  },
  {
    name: "Marketing",
    icon: "📈",
    children: [
      { name: "SEO" },
      { name: "Social Media" },
      { name: "Email Marketing" },
    ],
  },
];

export default function Sidebar({ onCategorySelect }) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (name) => {
    setExpanded({ ...expanded, [name]: !expanded[name] });
  };

  return (
    <div className={`sidebar ${open ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={() => setOpen(!open)}>
        {open ? "⏪" : "⏩"}
      </button>

      {open && (
        <ul className="category-list">
          {categories.map((c) => (
            <li key={c.name}>
              <div
                className="category-item"
                onClick={() => toggleExpand(c.name)}
              >
                <span className="cat-icon">{c.icon}</span>
                {c.name}
                {c.children && (
                  <span className="expand-icon">
                    {expanded[c.name] ? "▼" : "▶"}
                  </span>
                )}
              </div>

              {c.children && expanded[c.name] && (
                <ul className="subcategory-list">
                  {c.children.map((sub) => (
                    <li
                      key={sub.name}
                      className="subcategory-item"
                      onClick={() => onCategorySelect && onCategorySelect(sub.name)}
                    >
                      {sub.name}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
