import { Server } from 'socket.io';

let io;

export const initIO = (server) => {
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');
  const allowedOrigins = [
    frontendUrl,
    'https://polling-system-phi-seven.vercel.app'
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`));
        }
      },
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true
    },
    allowEIO3: true
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initIO(server) first.');
  }
  return io;
};