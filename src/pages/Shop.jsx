import { useState } from "react";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/Sidebar";
import "../styles/shop.css";

const products = [
  { id: 1, title: "Website Design", price: "$120", category: "Web Development", image: "/images/product-1.svg" },
  { id: 2, title: "Mobile App UI", price: "$80", category: "Mobile Development", image: "/images/product-2.svg" },
  { id: 3, title: "SEO Optimization", price: "$90", category: "SEO", image: "/images/product-3.svg" },
  { id: 4, title: "Brand Logo Design", price: "$45", category: "Logo Design", image: "/images/product-4.svg" },
  { id: 5, title: "Social Media Marketing", price: "$75", category: "Social Media", image: "/images/product-5.svg" },
  { id: 6, title: "E-commerce Setup", price: "$300", category: "Web Development", image: "/images/product-6.svg" },
  { id: 7, title: "React Frontend", price: "$220", category: "Web Development", image: "/images/product-7.svg" },
  { id: 8, title: "iOS App Prototype", price: "$180", category: "Mobile Development", image: "/images/product-8.svg" },
  { id: 9, title: "Content Writing Pack", price: "$60", category: "Writing & Translation", image: "/images/product-9.svg" },
  { id: 10, title: "Logo & Brand Kit", price: "$150", category: "Design & Creative", image: "/images/product-10.svg" },
  { id: 11, title: "Product Photography", price: "$95", category: "Design & Creative", image: "/images/product-11.svg" },
  { id: 12, title: "Marketing Strategy Session", price: "$200", category: "Marketing", image: "/images/product-12.svg" },
];

export default function Shop({ onBuyNow }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 6;

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagedProducts = filteredProducts.slice(start, start + PAGE_SIZE);

  return (
    <div className="shop-container">
      <h1 className="shop-title">Shop Services</h1>

      <div className="shop-main">
        <Sidebar onCategorySelect={setSelectedCategory} />

        <div className="product-grid">
          {pagedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onBuyNow={() => onBuyNow(p)}
            />
          ))}
        </div>
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
  );
}
