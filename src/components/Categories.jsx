import React from "react";
import "../styles/categories.css";

const categories = [
  "Development & IT",
  "Design & Creative",
  "Sales & Marketing",
  "Writing & Translation",
  "Admin & Support",
  "Finance & Accounting",
];

export default function Categories() {
  return (
    <section className="categories">
      <div className="landing-container">
        <h2>Browse talent by category</h2>

        <div className="category-grid">
          {categories.map((cat) => (
            <div className="category-card" key={cat}>
              {cat}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
