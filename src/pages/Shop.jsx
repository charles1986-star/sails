import { useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/Sidebar";
import products from "../data/products";
import "../styles/shop.css";

export default function Shop({ onBuyNow, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [levelFilter, setLevelFilter] = useState(null);

  const PAGE_SIZE = 6;

  const filteredProducts = useMemo(() => {
    let list = products.slice();
    if (selectedCategory) list = list.filter((p) => p.category === selectedCategory);
    if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
    if (levelFilter) list = list.filter((p) => p.priceLevel === levelFilter);
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sort === "price_asc") list.sort((a,b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a,b) => b.price - a.price);
    return list;
  }, [selectedCategory, search, sort, priceRange, levelFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagedProducts = filteredProducts.slice(start, start + PAGE_SIZE);

  function handleSearch(q) { setSearch(q); setPage(1); }
  function handleSort(s) { setSort(s); }
  function handleClear() { setSelectedCategory(null); setSearch(""); setSort('popular'); setPriceRange([0,1000]); setLevelFilter(null); }

  return (
    <div className="shop-container">
      <h1 className="shop-title">Shop Services</h1>

      <div className="shop-main">
        <Sidebar onCategorySelect={setSelectedCategory} onSearch={handleSearch} onSort={handleSort} selectedCategory={selectedCategory} onClearFilters={handleClear} />

        <div className="product-grid-wrap">
          <div className="filters-row">
            <div className="filter-item">
              <label>Price range</label>
              <div>
                <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} />
                —
                <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} />
              </div>
            </div>

            <div className="filter-item">
              <label>Price level</label>
              <select value={levelFilter || ""} onChange={(e) => setLevelFilter(e.target.value || null)}>
                <option value="">All</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Advanced">Advanced</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </div>

          <div className="product-grid">
            {pagedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onBuyNow={() => onBuyNow(p)}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          <div className="pagination-wrapper">
            <div className="pagination shop-pagination">
              <button
                className="page-btn"
                onClick={() => setPage((s) => Math.max(1, s - 1))}
                disabled={page === 1}
              >
                ‹ Prev
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
                className="page-btn"
                onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
                disabled={page === totalPages}
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
