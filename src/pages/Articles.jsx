import { useState, useMemo } from "react";
import articlesData from "../data/articles";
import TopAuthors from "../components/TopAuthors";
import MyArticlesSidebar from "../components/MyArticlesSidebar";
import ArticleCard from "../components/ArticleCard";
import { Link } from "react-router-dom";
import "../styles/articles.css";

import articleCategories from "../data/articleCategories";

// Helper: Get all category IDs (including nested children)
function getAllCategoryIds(categories) {
  let ids = [];
  categories.forEach(cat => {
    ids.push(cat.id);
    if (cat.children) {
      ids = ids.concat(getAllCategoryIds(cat.children));
    }
  });
  return ids;
}

export default function Articles() {
  const [filter, setFilter] = useState(null);
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const PAGE_SIZE = 8;

  // Smart filtering with category support
  const filtered = useMemo(() => {
    let list = articlesData.filter((a) =>
      `${a.title} ${a.author} ${a.content}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (filter) list = list.filter((a) => a.status === filter);

    // Category filtering - include parent and all children
    if (selectedCategory) {
      const allowedCategories = getAllCategoryIds(articleCategories);
      if (allowedCategories.includes(selectedCategory)) {
        // For now, filter by exact category (you can enhance this to use article.category field)
        list = list.filter((a) => a.category === selectedCategory);
      }
    }

    // Smart sorting
    if (sort === "views") list.sort((a, b) => b.views - a.views);
    if (sort === "comments") list.sort((a, b) => b.comments - a.comments);
    if (sort === "recommendations") list.sort((a, b) => (b.recommends || 0) - (a.recommends || 0));
    if (sort === "latest")
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [filter, sort, search, selectedCategory]);

  // Smart pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  // Reset to page 1 when filters change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to articles
    document.querySelector('.articles-main')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="articles-page">
      {/* ---------- HEADER ---------- */}
      <div className="articles-header">
        <div>
          <h1>Articles</h1>
          <p className="subtitle">
            Discover insights, tutorials, and community knowledge
          </p>
        </div>

        <Link to="/articles/new" className="btn-primary create-article-btn">
          + Create Article
        </Link>
      </div>

      {/* ---------- TOP AUTHORS ---------- */}
      <TopAuthors />
      
      <div className="breadcrumbs">
        <span 
          className={!selectedCategory ? "active" : ""}
          onClick={() => setSelectedCategory(null)}
          style={{ cursor: 'pointer' }}
        >
          All Articles
        </span>
        {selectedCategory && (
          <>
            <span className="sep">›</span>
            <span className="current">{selectedCategory}</span>
          </>
        )}
      </div>

      <div className="articles-layout">
        {/* ---------- SIDEBAR ---------- */}
        <MyArticlesSidebar
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* ---------- MAIN ---------- */}
        <main className="articles-main">
          {/* Toolbar */}
          <div className="articles-toolbar">
            <input
              className="search-input"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="views">Most Views</option>
              <option value="comments">Most Comments</option>
              <option value="recommendations">Most Recommended</option>
            </select>
          </div>

          {/* Results count */}
          <div className="results-info">
            <span>
              {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
            </span>
            {paged.length > 0 && (
              <span className="pagination-info">
                — Showing {start + 1} to {Math.min(start + PAGE_SIZE, filtered.length)}
              </span>
            )}
          </div>

          {/* Articles */}
          <div className="articles-list">
            {paged.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.753 2 16.253s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z" />
                </svg>
                <p>No articles found. Try adjusting your search or filters.</p>
                <button 
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory(null);
                    setFilter(null);
                  }}
                  className="btn-reset-filters"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              paged.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))
            )}
          </div>

          {/* Smart Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="page-nav-btn"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>

              <div className="pagination">
                {totalPages <= 7 ? (
                  // Show all pages if 7 or fewer
                  Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`page-btn ${page === i + 1 ? "active" : ""}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))
                ) : (
                  // Smart pagination: Show first, last, and pages around current
                  <>
                    {/* First page */}
                    <button
                      className={`page-btn ${page === 1 ? "active" : ""}`}
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>

                    {/* Ellipsis */}
                    {page > 3 && <span className="page-ellipsis">...</span>}

                    {/* Pages around current */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const pageNum = Math.max(2, page - 2) + i;
                      if (pageNum >= totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          className={`page-btn ${page === pageNum ? "active" : ""}`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Ellipsis */}
                    {page < totalPages - 2 && <span className="page-ellipsis">...</span>}

                    {/* Last page */}
                    {totalPages > 1 && (
                      <button
                        className={`page-btn ${page === totalPages ? "active" : ""}`}
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    )}
                  </>
                )}
              </div>

              <button
                className="page-nav-btn"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}

          {/* Page info */}
          {totalPages > 1 && (
            <div className="page-info">
              Page {page} of {totalPages}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
