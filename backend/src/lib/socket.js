import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Send online users list to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for incoming messages from a client
  socket.on("sendMessage", (message) => {
    const receiverSocketId = getReceiverSocketId(message.receiverId);

    if (receiverSocketId) {
      // Send to the receiver
      io.to(receiverSocketId).emit("newMessage", message);
    }

    // Optionally, send back to the sender for confirmation
    io.to(socket.id).emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
