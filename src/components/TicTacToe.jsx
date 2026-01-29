import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Avatar from "./Avatar";
import { getWallet, deductScore, purchaseScore } from "../utils/walletUtils";

const SERVER_URL = process.env.REACT_APP_GAME_SERVER || "http://localhost:4000";

export default function TicTacToe({ roomId: initialRoomId, usernameProp }) {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const stake = 5; // points consumed per player when starting a match

  const username = usernameProp || getWallet().userId || 'Guest';

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    s.on('room:created', (data) => { setRoom(data.room); setBoard(data.room.board); });
    s.on('room:joined', (data) => { setRoom(data.room); setBoard(data.room.board); });
    s.on('room:update', (r) => { setRoom(r); setBoard(r.board || Array(9).fill(null)); setTurn(r.turn); setStatus(r.status); });
    s.on('game:update', ({ board, turn }) => { setBoard(board); setTurn(turn); });
    s.on('game:ended', ({ winner, board }) => {
      setBoard(board);
      if (winner === 'tie') setMessage('Tie');
      else setMessage(winner === symbol ? 'You won!' : 'You lost');
      setStatus('ended');
      handleAward(winner);
    });
    s.on('room:error', (e) => setMessage(e.message));

    return () => { s.disconnect(); };
  }, [symbol]);

  async function handleConsumeStake(roomId) {
    const res = deductScore(roomId, 'game', stake);
    if (!res.success) {
      setMessage(res.message);
      return false;
    }
    // notify navbar wallet update
    window.dispatchEvent(new Event('walletUpdated'));
    return true;
  }

  function handleCreate() {
    if (!socket) return;
    const id = initialRoomId || `room_${Math.random().toString(36).slice(2,8)}`;
    // consume stake for creator
    if (!handleConsumeStake(id)) return;
    socket.emit('room:create', { roomId: id, username });
    setSymbol('X');
    setStatus('waiting');
  }

  async function handleJoin() {
    if (!socket || !initialRoomId) return setMessage('No room id');
    // consume stake for joiner
    const ok = await handleConsumeStake(initialRoomId);
    if (!ok) return;
    socket.emit('room:join', { roomId: initialRoomId, username });
    setSymbol('O');
    setStatus('playing');
  }

  function sendMove(index) {
    if (!socket || !room || status !== 'playing') return;
    if (symbol !== turn) return setMessage('Not your turn');
    if (board[index]) return;
    socket.emit('game:move', { roomId: roomIdValue(), index, symbol });
  }

  function roomIdValue() { return (room && room.roomId) || initialRoomId; }

  function handleAward(winnerSymbol) {
    // if this client is winner, award combined stakes
    if (winnerSymbol === symbol) {
      const award = stake * (room?.players?.length || 2);
      purchaseScore(award, 'game_win');
      window.dispatchEvent(new Event('walletUpdated'));
    }
  }

  return (
    <div className="tic-tac-toe">
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <Avatar name={username} />
        <div>
          <div style={{ fontWeight:700 }}>{username}</div>
          <div style={{ color:'#567a56' }}>{room ? `Room: ${room.roomId || initialRoomId}` : 'Not in room'}</div>
        </div>
      </div>

      <div style={{ marginTop:12 }}>
        {!room && (
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn-primary" onClick={handleCreate}>Create Room (stake {stake})</button>
            <button className="btn-secondary" onClick={handleJoin}>Join Room</button>
          </div>
        )}
      </div>

      <div className="board" style={{ display:'grid', gridTemplateColumns:'repeat(3,80px)', gap:8, marginTop:16 }}>
        {board.map((c, i) => (
          <div key={i} onClick={() => sendMove(i)} style={{ width:80, height:80, borderRadius:10, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, cursor: 'pointer', border:'1px solid #e7efe7' }}>
            {c}
          </div>
        ))}
      </div>

      {message && <div style={{ marginTop:12 }}>{message}</div>}
    </div>
  );
}
