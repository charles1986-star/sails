import { useState, useMemo } from "react";
import "../styles/sidebar.css";
import products from "../data/products";

// derive categories from products
function buildCategoryTree(items) {
  const map = {};
  items.forEach((p) => {
    if (!map[p.category]) map[p.category] = { name: p.category, children: [] };
    // we don't have deeper taxonomy in demo; keep category only
  });
  return Object.values(map);
}

export default function Sidebar({ onCategorySelect, onSearch, onSort, selectedCategory, onClearFilters }) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const categories = useMemo(() => buildCategoryTree(products), []);

  function handleSearch(e) {
    const v = e.target.value;
    setQuery(v);
    onSearch && onSearch(v);
  }

  return (
    <div className={`sidebar ${open ? "open" : "closed"}`}>
      <div className="sidebar-top">
        <button className="toggle-btn" onClick={() => setOpen(!open)}>
          {open ? "⏪" : "⏩"}
        </button>
        <input className="category-search" placeholder="Search services" value={query} onChange={handleSearch} />
      </div>

      {open && (
        <div className="category-block">
          <div className="chips">
            <button className={`chip ${!selectedCategory ? 'active' : ''}`} onClick={() => onCategorySelect && onCategorySelect(null)}>All</button>
            {categories.map((c) => (
              <button key={c.name} className={`chip ${selectedCategory === c.name ? 'active' : ''}`} onClick={() => onCategorySelect && onCategorySelect(c.name)}>{c.name}</button>
            ))}
          </div>

          <div className="sort-row">
            <label>Sort:</label>
            <select onChange={(e) => onSort && onSort(e.target.value)}>
              <option value="popular">Popular</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            <button className="clear-filters" onClick={() => onClearFilters && onClearFilters()}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
