import {Server} from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const SOCKET_ORIGIN = process.env.FRONTEND_URL?.replace(/\/+$/, "") ;
let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: SOCKET_ORIGIN,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_poll_room', (teamId) => {
      if (teamId) socket.join(teamId.toString());
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  return io;
}

export const getIO = () => {
  if (!io) throw new Error('Socket not initialized!');
  return io;
};