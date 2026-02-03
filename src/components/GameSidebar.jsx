import { useState, useMemo } from "react";
import "../styles/games.css";

const defaultCategories = [
  "All",
  "Action",
  "Strategy",
  "Racing",
  "Puzzle",
  "Casual",
  "Multiplayer",
];

export default function GameSidebar({ onSelect, selected }) {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!query) return defaultCategories;
    return defaultCategories.filter((c) =>
      c.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const handleSelect = (cat) => {
    onSelect?.(cat === "All" ? null : cat);
  };

  return (
    <aside className="game-sidebar">
      <div className="sidebar-card">
        <h3 className="sidebar-title">Categories</h3>

        <input
          type="text"
          className="sidebar-search"
          placeholder="Search categories"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <ul className="category-list">
          {filteredCategories.map((cat) => {
            const isActive =
              (cat === "All" && !selected) || selected === cat;

            return (
              <li key={cat}>
                <button
                  className={`category-item ${isActive ? "active" : ""}`}
                  onClick={() => handleSelect(cat)}
                >
                  <span className="category-name">{cat}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
