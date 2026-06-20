import { Server } from "socket.io";

let io;

export const initIO = (server) => {
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");

  const allowedOrigins = [
    frontendUrl,
    "https://polling-system-phi-seven.vercel.app",
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed`));
        }
      },
      credentials: true,
    },
  });

  // ✅ ROOM JOIN + DEBUG
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_team", (teamId) => {
      socket.join(teamId);
      console.log(`Socket ${socket.id} joined team ${teamId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};