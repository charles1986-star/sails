import React, { useState } from "react";

// Example nested categories structure
const categories = [
  {
    name: "Books",
    children: [
      { name: "Guides", children: [{ name: "Beginner" }, { name: "Advanced" }] },
      { name: "Practical" },
      { name: "Explainer" },
    ],
  },
  {
    name: "Media",
    children: [
      { name: "Video" },
      { name: "Audio" },
      { name: "Interactive" },
    ],
  },
];

export default function LibrarySidebar({ selectedCategory, onSelectCategory }) {
  const [openCategories, setOpenCategories] = useState({});

  const toggleCategory = (name) => {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const renderCategories = (cats, level = 0) => {
    return (
      <ul className={`category-level-${level}`}>
        {cats.map((cat) => (
          <li key={cat.name}>
            <div
              className={`category-item ${
                selectedCategory === cat.name ? "active" : ""
              }`}
              onClick={() => onSelectCategory(cat.name)}
            >
              {cat.children && (
                <span
                  className={`arrow ${openCategories[cat.name] ? "down" : "right"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(cat.name);
                  }}
                >
                  ▶
                </span>
              )}
              <span className="category-name">{cat.name}</span>
            </div>
            {cat.children && openCategories[cat.name] && renderCategories(cat.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return <aside className="library-sidebar">{renderCategories(categories)}</aside>;
}
