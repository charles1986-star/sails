import { useState, useEffect } from "react";
import ScoreUnlock from "../components/ScoreUnlock";
import { isContentUnlocked } from "../utils/walletUtils";
import "../styles/library.css";

const IMAGES = [
  "/images/book.svg",
  "/images/media.svg",
  "/images/product-1.svg",
  "/images/product-2.svg",
  "/images/product-3.svg",
  "/images/product-4.svg",
  "/images/product-5.svg",
  "/images/product-6.svg",
  "/images/product-7.svg",
  "/images/product-8.svg",
  "/images/product-9.svg",
  "/images/product-10.svg",
  "/images/product-11.svg",
  "/images/product-12.svg",
];

function generateItems(kind, count) {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${kind}-${i + 1}`,
    title: `${kind === "books" ? "Guide" : "Media"} ${i + 1} — ${kind === "books" ? "Practical" : "Explainer"}`,
    author: `${kind === "books" ? "Author" : "Producer"} ${i + 1}`,
    image: IMAGES[i % IMAGES.length],
    isPaid: true,
    scoreRequired: kind === "books" ? 25 : 40,
  }));
}

const books = generateItems("books", 28);
const medias = generateItems("media", 22);

export default function Library() {
  const [tab, setTab] = useState("books");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [sort, setSort] = useState("relevance");
  const [unlockedItems, setUnlockedItems] = useState(new Set());
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

  // Listen for wallet updates
  useEffect(() => {
    const handleWalletUpdate = () => {
      const items = tab === "books" ? books : medias;
      const unlocked = new Set();
      items.forEach((item) => {
        if (isContentUnlocked(item.id)) {
          unlocked.add(item.id);
        }
      });
      setUnlockedItems(unlocked);
    };

    window.addEventListener("walletUpdated", handleWalletUpdate);
    return () => window.removeEventListener("walletUpdated", handleWalletUpdate);
  }, [tab]);

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
  useEffect(() => setPage(1), [q, tab]);

  const current = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="library-page">
      <div className="container">
        <header className="library-header">
          <h1>Library</h1>
          <p className="lead">Books, guides and media about sail transport — curated resources.</p>
        </header>

        <div className="library-controls">
          <div className="tabs-pill">
            <button
              className={`pill ${tab === "books" ? "active" : ""}`}
              onClick={() => setTab("books")}
            >
              Books <span className="count">{books.length}</span>
            </button>

            <button
              className={`pill ${tab === "media" ? "active" : ""}`}
              onClick={() => setTab("media")}
            >
              Media <span className="count">{medias.length}</span>
            </button>
          </div>

          <div className="library-controls-right">
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
                  onClick={() => {
                    setViewMode("grid");
                    setPage(1);
                  }}
                  title="Grid view"
                >
                  ▦
                </button>
                <button
                  className={viewMode === "list" ? "active" : ""}
                  onClick={() => {
                    setViewMode("list");
                    setPage(1);
                  }}
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
        </div>

        {current.length === 0 ? (
          <div className="empty">No results found.</div>
        ) : viewMode === "grid" ? (
          <div className="library-grid">
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
        ) : (
          <div className="library-list">
            {current.map((it) => (
              <div key={it.id} className="library-row">
                <div className="row-thumb">
                  <img src={it.image} alt={it.title} />
                </div>
                <div className="row-main">
                  <h3>{it.title}</h3>
                  <div className="muted">{it.author}</div>
                  <p className="product-desc">Short description or excerpt...</p>
                </div>
                <div className="row-actions">
                  {unlockedItems.has(it.id) ? (
                    <>
                      <button className="btn-secondary">Preview</button>
                      <button className="btn-primary">Open</button>
                    </>
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
        )}

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
  );
}
