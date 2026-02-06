import { useState } from "react";

export default function ArticleCategoryTree({
  categories,
  selected,
  onSelect,
  level = 0
}) {
  const [open, setOpen] = useState({});

  return (
    <ul className={`category-level level-${level}`}>
      {categories.map((cat) => {
        const isOpen = open[cat.id];
        const isActive = selected === cat.id;

        return (
          <li key={cat.id}>
            <div
              className={`category-item ${isActive ? "active" : ""}`}
              style={{ paddingLeft: `${level * 16}px` }}
            >
              {cat.children && (
                <button
                  className="expand-btn"
                  onClick={() =>
                    setOpen((s) => ({ ...s, [cat.id]: !isOpen }))
                  }
                >
                  {isOpen ? "▾" : "▸"}
                </button>
              )}

              <button
                className="category-btn"
                onClick={() => onSelect(cat.id)}
              >
                {cat.label}
              </button>
            </div>

            {isOpen && cat.children && (
              <ArticleCategoryTree
                categories={cat.children}
                selected={selected}
                onSelect={onSelect}
                level={level + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
