import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import gamesData from "../data/games";
import "../styles/games.css";

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const game = gamesData.find((g) => String(g.id) === String(id));
  const [players, setPlayers] = useState(game ? game.players : 0);

  if (!game) return <div style={{ padding: 24 }}>Game not found</div>;

  const createRoom = () => {
    setPlayers((p) => p + 1);
    alert("Room created — this is a demo placeholder.");
  };

  const joinRoom = () => {
    setPlayers((p) => p + 1);
    alert("Joined room — demo.");
    navigate(`/games/${id}`);
  };

  return (
    <div className="game-detail page-container">
      <div className="detail-header">
        <img src={game.image} alt={game.title} className="detail-image" />
        <div className="detail-meta">
          <h1>{game.title}</h1>
          <div className="detail-company">{game.company} • {game.contact}</div>
          <div className="detail-price">{game.price}</div>
          <div className="detail-players">Players: {players}</div>
          <div className="detail-actions">
            <button className="btn-secondary" onClick={createRoom}>Create Room</button>
            <button className="btn-primary" onClick={joinRoom}>Join Room</button>
          </div>
        </div>
      </div>

      <div className="detail-body">
        <h3>About</h3>
        <p>{game.description}</p>

        <h3>How to Play (Demo)</h3>
        <p>This page includes a placeholder room system. Implement real-time rooms with WebSockets or WebRTC.</p>
      </div>
    </div>
  );
}
