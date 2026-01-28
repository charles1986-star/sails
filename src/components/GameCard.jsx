import { Link } from "react-router-dom";

export default function GameCard({ game, onCreateRoom, onJoinRoom, onView }) {
  return (
    <div className="product-card game-card">
      <div className="product-media">
        <div className="product-image">
          {game.image ? <img src={game.image} alt={game.title} /> : <div className="placeholder">🎮</div>}
        </div>
        <div className="product-badge">{game.category}</div>
      </div>

      <div className="product-body">
        <h3 className="product-title">{game.title}</h3>
        <p className="product-desc">{game.description}</p>
        <div className="meta-row">
          <div className="meta-left">
            <div className="company">{game.company}</div>
            <div className="contact">{game.contact}</div>
          </div>
          <div className="meta-right">
            <div className="players">Players: <strong>{game.players}</strong></div>
            <div className="price">{game.price}</div>
          </div>
        </div>

        <div className="product-footer">
          <div className="actions">
            <Link to={`/games/${game.id}`} className="btn-secondary" onClick={onView}>View</Link>
            <button className="btn-secondary" onClick={() => onCreateRoom && onCreateRoom(game)}>Create Room</button>
            <button className="btn-primary" onClick={() => onJoinRoom && onJoinRoom(game)}>Join Room</button>
          </div>
        </div>
      </div>
    </div>
  );
}
