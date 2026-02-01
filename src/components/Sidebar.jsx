import { useState, useMemo } from "react";
import "../styles/sidebar.css";
import products from "../data/products";

/**
 * Build multi-level category tree from flat products
 * product.categoryPath example:
 * ["Design", "UI / UX", "Web Design"]
 */



function buildCategoryTree(items) {
  const root = {};

  items.forEach((p) => {
    if (!Array.isArray(p.categoryPath)) return;

    let current = root;
    p.categoryPath.forEach((level) => {
      if (!current[level]) {
        current[level] = { name: level, children: {} };
      }
      current = current[level].children;
    });
  });

  const toArray = (obj) =>
    Object.values(obj).map((n) => ({
      name: n.name,
      children: toArray(n.children),
    }));

  return toArray(root);
}

/**
 * Recursive category renderer
 */
function CategoryItem({ node, level = 0, selected, onSelect }) {
  const [open, setOpen] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`cat-item level-${level}`}>
      <div
        className={`cat-row ${selected === node.name ? "active" : ""}`}
        onClick={() => onSelect(node.name)}
      >
        {hasChildren && (
          <span
            className={`caret ${open ? "open" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            ▸
          </span>
        )}
        <span className="cat-name">{node.name}</span>
      </div>

      {hasChildren && open && (
        <div className="cat-children">
          {node.children.map((child) => (
            <CategoryItem
              key={child.name}
              node={child}
              level={level + 1}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  onCategorySelect,
  onSearch,
  onSort,
  selectedCategory,
  onClearFilters,
}) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => buildCategoryTree(products),
    []
  );

  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      {/* Header */}
      <div className="sidebar-header">
        <h4>Filters</h4>
        <button
          className="toggle-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle sidebar"
        >
          {open ? "⟨" : "⟩"}
        </button>
      </div>

      {open && (
        <>
          {/* Search */}
          <input
            className="search-input"
            placeholder="Search services"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
          />

          {/* Categories */}
          <div className="sidebar-section">
            <div
              className={`cat-row ${!selectedCategory ? "active" : ""}`}
              onClick={() => onCategorySelect?.(null)}
            >
              All categories
            </div>

            {categories.map((cat) => (
              <CategoryItem
                key={cat.name}
                node={cat}
                selected={selectedCategory}
                onSelect={onCategorySelect}
              />
            ))}
          </div>

          {/* Sort */}
          <div className="sidebar-section sort">
            <label>Sort by</label>
            <select onChange={(e) => onSort?.(e.target.value)}>
              <option value="popular">Most relevant</option>
              <option value="price_asc">Price (low → high)</option>
              <option value="price_desc">Price (high → low)</option>
            </select>

            <button
              className="clear-link"
              onClick={() => onClearFilters?.()}
            >
              Clear filters
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
