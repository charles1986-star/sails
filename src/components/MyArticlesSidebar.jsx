import articleCategories from "../data/articleCategories";
import ArticleCategoryTree from "../components/ArticleCategoryTree";

export default function MyArticlesSidebar({ selectedCategory, onSelect }) {
  return (
    <aside className="articles-sidebar">
      <h3 className="sidebar-title">Categories</h3>

      <button
        className={`sidebar-item ${!selectedCategory ? "active" : ""}`}
        onClick={() => onSelect(null)}
      >
        All Articles
      </button>

      <ArticleCategoryTree 
        categories={articleCategories} 
        selected={selectedCategory}
        onSelect={onSelect}
      />
    </aside>
  );
}
