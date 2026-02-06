import { useParams } from "react-router-dom";
import { useState } from "react";
import gamesData from "../data/games";
import "../styles/games.css";
import TicTacToe from "../components/TicTacToe";
import { getWallet } from "../utils/walletUtils";

export default function GameDetail() {
  const { id } = useParams();
  const game = gamesData.find((g) => String(g.id) === String(id));
  const [roomId, setRoomId] = useState(null);

  if (!game) return <div style={{ padding: 24 }}>Game not found</div>;

  function handleCreateRoom() {
    const id = `room_${Math.random().toString(36).slice(2,8)}`;
    setRoomId(id);
  }

  function handleJoinRoom() {
    // user will be asked to supply room id in the page URL or input — we use current game id as demo
    setRoomId(`room_${id}`);
  }

  const username = getWallet().userId || 'Guest';

  return (
    <div className="game-detail page-container">
      <div className="detail-header">
        <img src={game.image} alt={game.title} className="detail-image" />
        <div className="detail-meta">
          <h1>{game.title}</h1>
          <div className="detail-company">{game.company} • {game.contact}</div>
          <div className="detail-price">{game.price}</div>
          <div className="detail-players">Players: {game.players}</div>
          <div className="detail-actions">
            <button className="btn-secondary" onClick={handleCreateRoom}>Create Room</button>
            <button className="btn-primary" onClick={handleJoinRoom}>Join Room</button>
          </div>
        </div>
      </div>

      <div className="detail-body">
        <h3>About</h3>
        <p>{game.description}</p>

        <h3>Play Tic Tac Toe (Online)</h3>
        <p>Creating or joining a room consumes a small stake. Winner takes stakes.</p>

        {roomId ? (
          <div style={{ marginTop: 12 }}>
            <TicTacToe roomId={roomId} usernameProp={username} />
          </div>
        ) : (
          <p style={{ color: '#6b7a67' }}>Create a room or join an existing room to start playing.</p>
        )}
      </div>
    </div>
  );
}
