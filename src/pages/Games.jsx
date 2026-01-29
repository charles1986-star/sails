import { useState } from "react";
import gamesData from "../data/games";
import GameCard from "../components/GameCard";
import GameSidebar from "../components/GameSidebar";
import "../styles/shop.css";
import "../styles/games.css";

export default function Games() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 6;

  const filtered = selectedCategory
    ? gamesData.filter((g) => g.category === selectedCategory)
    : gamesData;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const handleCreate = (game) => {
    // navigate to game detail room list for room creation
    window.location.href = `/games/${game.id}`;
  };

  const handleJoin = (game) => {
    // navigate to game detail to join existing rooms
    window.location.href = `/games/${game.id}`;
  };

  return (
    <div className="shop-container">
      <h1 className="shop-title">Games</h1>

      <div className="shop-main">
        <GameSidebar onSelect={setSelectedCategory} />

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
      </div>

      <div className="pagination-wrapper">
        <div className="pagination shop-pagination">
          <button className="page-btn" onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page === 1}>‹ Prev</button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} className={`page-num ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="page-btn" onClick={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page === totalPages}>Next ›</button>
        </div>
      </div>
    </div>
  );
}
