import React, { useState, useEffect } from "react";
import "../styles/shop.css";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function NestedCategory({ node, onSelect, active }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="cat-node">
      <div className={`cat-row ${active === node.id || active === node.name ? 'active' : ''}`}>
        {node.children && node.children.length > 0 && (
          <button className={`caret ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>{open ? '▾' : '▸'}</button>
        )}
        <button className="cat-chip" onClick={() => onSelect(node.id || node.name)}>{node.name}</button>
      </div>
      {open && node.children && node.children.length > 0 && (
        <div className="cat-children" style={{ marginLeft: 16 }}>
          {node.children.map((c) => (
            <NestedCategory key={c.id || c.name} node={c} onSelect={onSelect} active={active} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopCategories({ onSelect, categories: propCategories }) {
  const [active, setActive] = useState(null);
  const [categories, setCategories] = useState(propCategories || []);

  useEffect(() => {
    if (propCategories && propCategories.length) {
      setCategories(propCategories);
      return;
    }

    // fetch from API if not provided
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/shop-categories`);
        setCategories(res?.data?.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    load();
  }, [propCategories]);

  const handlePick = (idOrName) => {
    setActive(idOrName);
    onSelect && onSelect(idOrName === 'All' ? null : idOrName);
  };

  const buildNested = (cats, parent = null) => {
    return cats
      .filter(c => c.parent_id === parent)
      .map(c => ({ ...c, children: buildNested(cats, c.id) }));
  };

  const nested = buildNested(categories);

  return (
    <section className="shop-categories">
      <div className="container cat-inner">
        <div className="cat-row">
          <button className={`cat-chip ${active === null ? "active" : ""}`} onClick={() => handlePick("All")}>All</button>

          {nested.map((c) => (
            <div key={c.id} className="cat-group">
              <div className="cat-card">
                <div className="cat-info">
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-sub">{(c.children || []).slice(0,2).map(ch => ch.name || ch).join(" • ")}</div>
                </div>
                <div className="cat-actions">
                  <button className="cat-chip small" onClick={() => handlePick(c.id)}>{c.name}</button>
                </div>
              </div>

              <div className="cat-subchips">
                {(c.children || []).map((s) => (
                  <button key={s.id || s.name} className={`cat-chip ${active === s.id || active === s.name ? "active" : ""}`} onClick={() => handlePick(s.id || s.name)}>{s.name || s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
