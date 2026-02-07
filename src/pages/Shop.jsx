import { useState, useMemo, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/Sidebar";
import products from "../data/products";
import axios from "axios";
import "../styles/shop.css";

const API_URL = "http://localhost:5000/api";

export default function Shop({ onBuyNow, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [levelFilter, setLevelFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 6;

  // Load categories and shops from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load shop categories
        const catRes = await axios.get(`${API_URL}/shop-categories`);
        setCategories(catRes?.data?.data || []);

        // Load shops (products)
        const shopsRes = await axios.get(`${API_URL}/shops`);
        if (shopsRes?.data?.data) {
          setShops(shopsRes.data.data.filter(s => s.status === 'active'));
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /** Build tree structure for categories */
  const buildCategoryTree = (cats, parentId = null, depth = 0) => {
    return cats
      .filter(c => c.parent_id === parentId && c.status === 'active')
      .map(cat => ({
        ...cat,
        depth,
        children: buildCategoryTree(cats, cat.id, depth + 1)
      }));
  };

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  /** Flatten tree for filtering */
  const flattenTree = (tree) => {
    let flat = [];
    const flatten = (nodes) => {
      nodes.forEach(node => {
        flat.push(node);
        if (node.children?.length) flatten(node.children);
      });
    };
    flatten(tree);
    return flat;
  };

  const flatCategories = useMemo(() => flattenTree(categoryTree), [categoryTree]);

  /** Filter + Sort */
  const filteredProducts = useMemo(() => {
    let list = shops.filter(s => s.status === 'active');

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      list = list.filter((p) => p.shop_category_id === selectedCategory);
    }

    list = list.filter(
      (p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]
    );

    if (sort === "price_asc") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price_desc") list.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === "popular") list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return list;
  }, [search, selectedCategory, priceRange, sort, shops]);

  /** -----------------------------
   * Pagination safety
   * ----------------------------- */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const start = (page - 1) * PAGE_SIZE;
  const pagedProducts = filteredProducts.slice(start, start + PAGE_SIZE);

  /** -----------------------------
   * Handlers
   * ----------------------------- */
  const resetPage = () => setPage(1);

  function handleSearch(q) {
    setSearch(q);
    resetPage();
  }

  function handleClear() {
    setSelectedCategory(null);
    setSearch("");
    setSort("popular");
    setPriceRange([0, 10000]);
    setLevelFilter("");
    resetPage();
  }

  return (
    <div className="shop-container">
      <h1 className="shop-title">Browse Services</h1>

      <div className="shop-main">
        <Sidebar
          onCategorySelect={(c) => {
            setSelectedCategory(c);
            resetPage();
          }}
          onSearch={handleSearch}
          selectedCategory={selectedCategory}
          onClearFilters={handleClear}
          categories={categoryTree}
        />

        <div className="product-grid-wrap">
          {/* ---------- Results Header ---------- */}
          <div className="results-header">
            <div className="results-count">
              {filteredProducts.length} services found
            </div>

            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* ---------- Filters Card ---------- */}
          <div className="filters-card">
            <div className="filter-item">
              <label>Price range</label>

              <div className="price-range">
                <div className="price-box">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value || 0), priceRange[1]])
                    }
                  />
                </div>

                <span className="dash">–</span>

                <div className="price-box">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value || 0)])
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Products ---------- */}
          <div className="product-grid">
            {pagedProducts.length > 0 ? (
              pagedProducts.map((p) => (
                <div key={p.id} className="product-card-item">
                  <div className="product-image">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} />
                    ) : (
                      <div style={{ background: "#f0f0f0", width: "100%", height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>No Image</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    {p.sku && <p><strong>SKU:</strong> {p.sku}</p>}
                    {p.brand && <p><strong>Brand:</strong> {p.brand}</p>}
                    {p.model_number && <p><strong>Model:</strong> {p.model_number}</p>}
                    {p.color && <p><strong>Color:</strong> {p.color}</p>}
                    {p.material && <p><strong>Material:</strong> {p.material}</p>}
                    {p.description && <p className="description">{p.description.substring(0, 100)}...</p>}
                    <div className="product-footer">
                      <span className="price">${p.price || 0}</span>
                      <button onClick={() => onAddToCart?.(p)} className="add-btn">Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#999" }}>
                No products found
              </div>
            )}
          </div>

          {/* ---------- Pagination ---------- */}
          <div className="pagination-wrap">
            <div className="pagination upwork-pagination">
              <button
                className="page-arrow"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`page-num ${page === i + 1 ? "active" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="page-arrow"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
