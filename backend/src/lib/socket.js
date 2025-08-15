// Socket.IO logic

export const userSocketMap = {}; // { userId: socketId }

export function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // Send online users list to everyone
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Listen for incoming messages
    socket.on("sendMessage", (message) => {
      const receiverSocketId = userSocketMap[message.receiverId];
      if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", message);

      // Send back to sender for confirmation
      io.to(socket.id).emit("newMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
}
