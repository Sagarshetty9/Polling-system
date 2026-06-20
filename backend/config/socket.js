import { Server } from 'socket.io';

let io;

export const initIO = (server) => {
  const allowedOrigins = [
    'https://polling-system-phi-seven.vercel.app',
    'https://polling-system-phi-seven.vercel.app/'
  ];

  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow local development or if origin matches our approved list / env variable
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin === process.env.FRONTEND_URL) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS on Socket'));
        }
      },
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true
    },
    // Adding this stabilizes the connection handshake over proxies like Render's
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