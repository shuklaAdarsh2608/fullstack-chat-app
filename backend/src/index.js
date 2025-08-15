import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// ✅ Middleware for large payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Prevent duplicate POST requests
const preventDuplicateRequests = new Set();
app.use((req, res, next) => {
  if (req.method === "POST" && req.originalUrl.includes("/messages")) {
    const hash = `${req.ip}-${JSON.stringify(req.body)}`;
    if (preventDuplicateRequests.has(hash)) {
      return res.status(429).json({ error: "Duplicate request detected" });
    }
    preventDuplicateRequests.add(hash);
    setTimeout(() => preventDuplicateRequests.delete(hash), 2000);
  }
  next();
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  // Serve static files
  app.use(express.static(frontendPath));

  // Fallback for SPA routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ✅ Start server
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  connectDB();
});
