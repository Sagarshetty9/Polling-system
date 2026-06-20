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

  // 🔥 ADD THIS PART
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};