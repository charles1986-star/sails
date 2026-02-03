import { useEffect, useState } from "react";
import gamesData from "../data/games";
import GameCard from "../components/GameCard";
import GameSidebar from "../components/GameSidebar";
import "../styles/shop.css";
import "../styles/games.css";
import "../styles/gameDetail.css";

export default function Games() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 6;

  // reset pagination when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const filteredGames = selectedCategory
    ? gamesData.filter((g) => g.category === selectedCategory)
    : gamesData;

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredGames.slice(start, start + PAGE_SIZE);

  const handleCreate = (game) => {
    window.location.href = `/games/${game.id}`;
  };

  const handleJoin = (game) => {
    window.location.href = `/games/${game.id}`;
  };

  return (
    <div className="shop-container">
      {/* Header */}
      <div className="shop-header">
        <h1 className="shop-title">Games Marketplace</h1>
        <p className="shop-subtitle">
          Discover games, create rooms, or join ongoing matches
        </p>
      </div>

      <div className="shop-main">
        {/* Sidebar */}
        <aside className="shop-sidebar">
          <GameSidebar
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </aside>

        {/* Content */}
        <section className="shop-content">
          {pageItems.length === 0 ? (
            <div className="empty-state">
              <h3>No games found</h3>
              <p>Try selecting a different category.</p>
            </div>
          ) : (
            <div className="product-grid">
              {pageItems.map((g) => (
                <GameCard
                  key={g.id}
                  game={g}
                  onCreateRoom={handleCreate}
                  onJoinRoom={handleJoin}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <div className="pagination shop-pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
