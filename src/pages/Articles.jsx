import { useState } from "react";
import articlesData from "../data/articles";
import TopAuthors from "../components/TopAuthors";
import MyArticlesSidebar from "../components/MyArticlesSidebar";
import ArticleCard from "../components/ArticleCard";
import { Link } from "react-router-dom";
import "../styles/articles.css";

export default function Articles() {
  const [filter, setFilter] = useState(null);
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 5;

  let filtered = articlesData.filter((a) =>
    `${a.title} ${a.author} ${a.content}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (filter) {
    filtered = filtered.filter((a) => a.status === filter);
  }

  if (sort === "views") filtered.sort((a, b) => b.views - a.views);
  if (sort === "comments") filtered.sort((a, b) => b.comments - a.comments);
  if (sort === "latest")
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const start = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="articles-page">
      <h1>Articles</h1>
      <div style={{ margin: "12px 0" }}>
        <Link to="/articles/new" className="btn-primary create-article-btn">
          Create Article
        </Link>
      </div>
      <TopAuthors />

      <div className="content">
        <MyArticlesSidebar active={filter} onSelect={setFilter} />

        <main>
          <div className="toolbar">
            <input
              placeholder="Search by title, author, content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select onChange={(e) => setSort(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="views">Most Views</option>
              <option value="comments">Most Comments</option>
            </select>
          </div>

          {paged.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}

          <div className="pagination">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={page === i + 1 ? "active" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
