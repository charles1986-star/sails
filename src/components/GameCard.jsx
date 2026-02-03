import { Link } from "react-router-dom";

export default function GameCard({ game }) {
  return (
    <article className="game-card">
      {/* ---------- Media ---------- */}
      <div className="game-card-media">
        {game.image ? (
          <img src={game.image} alt={game.title} />
        ) : (
          <div className="game-card-placeholder">🎮</div>
        )}

        <span className="game-card-category">{game.category}</span>
      </div>

      {/* ---------- Content ---------- */}
      <div className="game-card-body">
        <h3 className="game-card-title">{game.title}</h3>

        <p className="game-card-desc">
          {game.description?.length > 120
            ? game.description.slice(0, 120) + "…"
            : game.description}
        </p>

        {/* ---------- Meta ---------- */}
        <div className="game-card-meta">
          <div>
            <div className="meta-label">Studio</div>
            <div className="meta-value">{game.company}</div>
          </div>

          <div>
            <div className="meta-label">Players</div>
            <div className="meta-value">{game.players}</div>
          </div>

          <div>
            <div className="meta-label">Price</div>
            <div className="meta-value price">{game.price}</div>
          </div>
        </div>
      </div>

      {/* ---------- Action ---------- */}
      <footer className="game-card-footer">
        <Link to={`/games/${game.id}`} className="btn-primary full">
          View Game
        </Link>
      </footer>
    </article>
  );
}
