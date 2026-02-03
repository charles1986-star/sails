import { useState, useEffect } from "react";
import LibrarySidebar from "../components/LibrarySidebar";
import ScoreUnlock from "../components/ScoreUnlock";
import { isContentUnlocked } from "../utils/walletUtils";
import "../styles/library.css";

const IMAGES = [
  "/images/book.svg",
  "/images/media.svg",
  "/images/product-1.svg",
];

function generateItems(kind, count) {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${kind}-${i + 1}`,
    title: `${kind === "books" ? "Guide" : "Media"} ${i + 1}`,
    author: `${kind === "books" ? "Author" : "Producer"} ${i + 1}`,
    category: kind === "books" ? "Guides" : "Video", // simple category for demo
    image: IMAGES[i % IMAGES.length],
  }));
}

const books = generateItems("books", 12);
const medias = generateItems("media", 10);

export default function Library() {
  const [tab, setTab] = useState("books");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sort, setSort] = useState("relevance");
  const [unlockedItems, setUnlockedItems] = useState(new Set());
  const [page, setPage] = useState(1); // Initialize page state here
  const pageSize = 6;

  // Load unlocked items on mount
  useEffect(() => {
    const items = tab === "books" ? books : medias;
    const unlocked = new Set();
    items.forEach((item) => {
      if (isContentUnlocked(item.id)) {
        unlocked.add(item.id);
      }
    });
    setUnlockedItems(unlocked);
  }, [tab]);

  // Filter items by selected category
  const items = tab === "books" ? books : medias;

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(q.toLowerCase()) ||
      i.author.toLowerCase().includes(q.toLowerCase())
  );

  const sorted = [...filtered];
  if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "author") sorted.sort((a, b) => a.author.localeCompare(b.author));

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Update page state when searching or changing the tab
  useEffect(() => setPage(1), [q, tab]);

  const current = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="library-page">
      <div className="container library-container">
        <header className="library-header">
          <h1>Library</h1>
          <p className="lead">
            Books, guides and media about sail transport — curated resources.
          </p>
        </header>

        <div className="library-main">
          {/* Sidebar with category selection */}
          <LibrarySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Main Content Area */}
          <div className="library-content">
            {/* Search and Sorting Controls */}
            <div className="library-controls">
              <div className="library-search">
                <input
                  placeholder={`Search ${tab} by title or author...`}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div className="view-sort-controls">
                <div className="view-toggle">
                  <button
                    className={viewMode === "grid" ? "active" : ""}
                    onClick={() => setViewMode("grid")}
                    title="Grid view"
                  >
                    ▦
                  </button>
                  <button
                    className={viewMode === "list" ? "active" : ""}
                    onClick={() => setViewMode("list")}
                    title="List view"
                  >
                    ≡
                  </button>
                </div>

                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="title">Title: A → Z</option>
                  <option value="author">Author: A → Z</option>
                </select>
              </div>
            </div>

            {/* Display Grid/List of Items */}
            <div className={`library-${viewMode}`}>
              {current.map((it) => (
                <div key={it.id} className="library-card">
                  <div className="card-media">
                    <img src={it.image} alt={it.title} />
                    {it.isPaid && !unlockedItems.has(it.id) && (
                      <div className="card-badge">Premium</div>
                    )}
                    {unlockedItems.has(it.id) && (
                      <div className="card-badge unlocked">✓ Unlocked</div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3>{it.title}</h3>
                    <div className="muted">{it.author}</div>
                    {unlockedItems.has(it.id) ? (
                      <div className="card-actions">
                        <button className="btn-secondary">Preview</button>
                        <button className="btn-primary">Open</button>
                      </div>
                    ) : (
                      <ScoreUnlock
                        contentId={it.id}
                        contentType={tab === "books" ? "book" : "media"}
                        amount={it.scoreRequired}
                        title={it.title}
                        onUnlock={() => {
                          const newUnlocked = new Set(unlockedItems);
                          newUnlocked.add(it.id);
                          setUnlockedItems(newUnlocked);
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`page-number ${page === i + 1 ? "active" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
