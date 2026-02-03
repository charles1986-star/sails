import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import gamesData from "../data/games";
import "../styles/games.css";
import TicTacToe from "../components/TicTacToe";
import { getWallet } from "../utils/walletUtils";

/* ---------------- MOCK DATA ---------------- */

const mockRooms = (gameId) =>
  Array.from({ length: 4 }).map((_, i) => ({
    id: `room_${gameId}_${i + 1}`,
    players: Math.floor(Math.random() * 3) + 1,
    maxPlayers: 4,
    stakes: 50 * (i + 1),
  }));

const mockLeaderboard = [
  { name: "AlphaWolf", score: 1240 },
  { name: "PixelKing", score: 1120 },
  { name: "GameQueen", score: 980 },
  { name: "RookieX", score: 870 },
];

const mockTopPlayers = [
  { name: "AlphaWolf", wins: 124 },
  { name: "PixelKing", wins: 98 },
  { name: "GameQueen", wins: 87 },
];

/* ---------------- PAGE ---------------- */

export default function GameDetail() {
  const { id } = useParams();
  const game = gamesData.find((g) => String(g.id) === String(id));

  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [stats, setStats] = useState({ online: 0, matches: 0 });

  const wallet = getWallet();
  const username = wallet.userId || "Guest";
  const score = wallet.score || 0;

  useEffect(() => {
    if (game) {
      setRooms(mockRooms(game.id));
      setStats({
        online: Math.floor(Math.random() * 12) + 5,
        matches: Math.floor(Math.random() * 2000) + 500,
      });
    }
  }, [game]);

  if (!game) return <div className="page-container">Game not found</div>;

  function createRoom() {
    if (score < 50) return alert("Minimum 50 points required.");
    const newRoom = {
      id: `room_${Date.now().toString().slice(-5)}`,
      players: 1,
      maxPlayers: 4,
      stakes: 50,
    };
    setRooms([newRoom, ...rooms]);
    setRoomId(newRoom.id);
  }

  function joinRoom(room) {
    if (score < room.stakes) {
      return alert(`You need ${room.stakes} points to join.`);
    }
    setRoomId(room.id);
  }

  return (
    <div className="game-detail-layout page-container">
      {/* ================= MAIN ================= */}
      <main className="game-main">
        <div className="detail-header">
          <img src={game.image} alt={game.title} className="detail-image" />
          <div className="detail-meta">
            <h1>{game.title}</h1>
            <div className="muted">{game.company}</div>
            <div className="price">{game.price}</div>

            <div className="quick-stats">
              <span>🟢 Online: {stats.online}</span>
              <span>🎮 Matches: {stats.matches}</span>
              <span>🏆 Your score: {score}</span>
            </div>

            <button className="btn-primary" onClick={createRoom}>
              Create Room
            </button>
          </div>
        </div>

        <section className="detail-section">
          <h3>About the game</h3>
          <p>{game.description}</p>
        </section>

        <section className="detail-section">
          <h3>Active Rooms</h3>

          {rooms.length === 0 && <p>No active rooms.</p>}

          <div className="rooms-grid">
            {rooms.map((r) => (
              <div key={r.id} className="room-card">
                <div className="room-id">{r.id}</div>
                <div className="room-meta">
                  {r.players}/{r.maxPlayers} players
                </div>
                <div className="room-stake">Stake: {r.stakes} pts</div>
                <button className="btn-secondary" onClick={() => joinRoom(r)}>
                  Join Room
                </button>
              </div>
            ))}
          </div>
        </section>

        {roomId && (
          <section className="detail-section">
            <h3>Playing Room: {roomId}</h3>
            <TicTacToe roomId={roomId} usernameProp={username} />
          </section>
        )}
      </main>

      {/* ================= SIDEBAR ================= */}
      <aside className="game-sidebar-right">
        <div className="sidebar-card">
          <h4>🏆 Leaderboard</h4>
          {mockLeaderboard.map((p, i) => (
            <div key={i} className="leader-row">
              <span>{i + 1}. {p.name}</span>
              <strong>{p.score}</strong>
            </div>
          ))}
        </div>

        <div className="sidebar-card">
          <h4>🔥 Top Players</h4>
          {mockTopPlayers.map((p, i) => (
            <div key={i} className="top-player">
              <span>{p.name}</span>
              <span>{p.wins} wins</span>
            </div>
          ))}
        </div>

        <div className="sidebar-card">
          <h4>⭐ Recommended Rooms</h4>
          {rooms.slice(0, 2).map((r) => (
            <button
              key={r.id}
              className="recommended-room"
              onClick={() => joinRoom(r)}
            >
              {r.id} • {r.stakes} pts
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
