import React, { useState } from "react";
import "../styles/shop.css";

const categories = [
  {
    name: "Development & IT",
    icon: "💻",
    children: ["Web Development", "Mobile Development", "Data Science"],
  },
  {
    name: "Design & Creative",
    icon: "🎨",
    children: ["Logo Design", "UI/UX Design", "Graphic Design"],
  },
  {
    name: "Writing & Translation",
    icon: "✍️",
    children: ["Content Writing", "Translation"],
  },
  {
    name: "Marketing",
    icon: "📈",
    children: ["SEO", "Social Media", "Email Marketing"],
  },
];

export default function ShopCategories({ onSelect }) {
  const [active, setActive] = useState(null);

  const handlePick = (name) => {
    setActive(name);
    onSelect && onSelect(name === "All" ? null : name);
  };

  return (
    <section className="shop-categories">
      <div className="container cat-inner">
        <div className="cat-row">
          <button
            className={`cat-chip ${active === null ? "active" : ""}`}
            onClick={() => handlePick("All")}
          >
            All
          </button>

          {categories.map((c) => (
            <div className="cat-group" key={c.name}>
              <div className="cat-card">
                <div className="cat-icon">{c.icon}</div>
                <div className="cat-info">
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-sub">{c.children.slice(0,2).join(" • ")}</div>
                </div>
                <div className="cat-actions">
                  <button
                    className="cat-chip small"
                    onClick={() => handlePick(c.name)}
                  >
                    {c.name}
                  </button>
                </div>
              </div>

              <div className="cat-subchips">
                {c.children.map((s) => (
                  <button
                    key={s}
                    className={`cat-chip ${active === s ? "active" : ""}`}
                    onClick={() => handlePick(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
