const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

// In-memory rooms storage
const rooms = {}; // { roomId: { players: [{id,socketId,username}], board, turn, status } }

function createEmptyBoard() {
  return Array(9).fill(null);
}

function checkWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(Boolean)) return 'tie';
  return null;
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('room:create', ({ roomId, username }) => {
    if (!roomId) roomId = `room_${Math.random().toString(36).slice(2,9)}`;
    rooms[roomId] = {
      players: [{ id: socket.id, socketId: socket.id, username, symbol: 'X' }],
      board: createEmptyBoard(),
      turn: 'X',
      status: 'waiting'
    };
    socket.join(roomId);
    socket.emit('room:created', { roomId, room: rooms[roomId] });
    io.to(roomId).emit('room:update', rooms[roomId]);
  });

  socket.on('room:join', ({ roomId, username }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit('room:error', { message: 'Room not found' });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('room:error', { message: 'Room full' });
      return;
    }
    const player = { id: socket.id, socketId: socket.id, username, symbol: 'O' };
    room.players.push(player);
    room.status = 'playing';
    socket.join(roomId);
    io.to(roomId).emit('room:joined', { roomId, room });
    io.to(roomId).emit('room:update', room);
  });

  socket.on('game:move', ({ roomId, index, symbol }) => {
    const room = rooms[roomId];
    if (!room || room.status !== 'playing') return;
    if (room.turn !== symbol) return;
    if (room.board[index]) return;
    room.board[index] = symbol;
    room.turn = symbol === 'X' ? 'O' : 'X';
    const winner = checkWinner(room.board);
    if (winner) {
      room.status = 'ended';
      io.to(roomId).emit('game:ended', { roomId, winner, board: room.board });
      // after end, keep room for a while then delete
      setTimeout(() => { delete rooms[roomId]; io.to(roomId).emit('room:closed'); }, 30_000);
    } else {
      io.to(roomId).emit('game:update', { roomId, board: room.board, turn: room.turn });
    }
  });

  socket.on('disconnecting', () => {
    const joined = Array.from(socket.rooms).filter(r => r !== socket.id);
    for (const roomId of joined) {
      const room = rooms[roomId];
      if (!room) continue;
      room.players = room.players.filter(p => p.socketId !== socket.id);
      room.status = 'waiting';
      io.to(roomId).emit('room:update', room);
      // if everyone left, delete
      if (room.players.length === 0) delete rooms[roomId];
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});
