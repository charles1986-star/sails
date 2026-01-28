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

export default function GameSidebar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");

  const filtered = useMemo(() => {
    if (!query) return defaultCategories;
    return defaultCategories.filter((c) => c.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  function pick(cat) {
    setActive(cat);
    onSelect && onSelect(cat === "All" ? null : cat);
  }

  return (
    <aside className="game-sidebar">
      <div className="sidebar-inner">
        <input
          className="cat-search"
          placeholder="Search categories"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="chips">
          {filtered.map((c) => (
            <button
              key={c}
              className={`chip ${active === c ? "active" : ""}`}
              onClick={() => pick(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="filters">
          <div className="filter-head">Sort</div>
          <button className="small-chip">Popular</button>
          <button className="small-chip">Newest</button>
          <button className="small-chip">Most Players</button>
        </div>
      </div>
    </aside>
  );
}
