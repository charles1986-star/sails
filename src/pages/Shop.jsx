import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "../styles/shop.css";

const API_URL = "http://localhost:5000/api";
const API_BASE = "http://localhost:5000";

export default function Shop({ onAddToCart }) {
  const navigate = useNavigate(); // Add this

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 6;

  useEffect(() => {
    const loadData = async () => {
      try {
        const catRes = await axios.get(`${API_URL}/shop-categories`);
        setCategories(catRes?.data?.data || []);

        const shopsRes = await axios.get(`${API_URL}/shops`);
        if (shopsRes?.data?.data) {
          setShops(shopsRes.data.data.filter((s) => s.status === "active"));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = shops.filter((s) => s.status === "active");

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagedProducts = filteredProducts.slice(start, start + PAGE_SIZE);

  const handleProductClick = (product) => {
    navigate(`/shops/${product.id}`);
  };

  return (
    <div className="shop-container">
      <h1 className="shop-title">Browse Services</h1>

      <div className="shop-main">
        <Sidebar
          onCategorySelect={(c) => setSelectedCategory(c)}
          onSearch={(q) => setSearch(q)}
          selectedCategory={selectedCategory}
          categories={categories}
        />

        <div className="product-grid-wrap">
          <div className="results-header">
            <div className="results-count">{filteredProducts.length} services found</div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <div className="product-grid">
            {pagedProducts.length > 0 ? (
              pagedProducts.map((p) => (
                <div
                  key={p.id}
                  className="product-card-item"
                  onClick={() => handleProductClick(p)}
                >
                  <div className="product-image">
                    {p.image_url ? (
                      <img src={API_BASE + p.image_url} alt={p.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    {p.brand && <p><strong>Brand:</strong> {p.brand}</p>}
                    <div className="product-footer">
                      <span className="price">${p.price || 0}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart?.(p);
                        }}
                        className="add-btn"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">No products found</div>
            )}
          </div>

          {/* Pagination code here (same as before) */}
        </div>
      </div>
    </div>
  );
}
