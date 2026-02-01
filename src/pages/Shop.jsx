import { useState, useMemo, useEffect } from "react";
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
  const [levelFilter, setLevelFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const PAGE_SIZE = 6;

  

  /** -----------------------------
   * FILTER + SORT (Upwork order)
   * ----------------------------- */
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (levelFilter) {
      list = list.filter((p) => p.priceLevel === levelFilter);
    }

    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price);

    return list;
  }, [search, selectedCategory, levelFilter, priceRange, sort]);

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
    setPriceRange([0, 1000]);
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
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onView={(item) => setSelectedProduct(item)}
              />
            ))}
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
