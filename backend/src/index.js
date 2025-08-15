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

const PORT = process.env.PORT;
const __dirname = path.resolve();

// ✅ Allow large payloads for base64 images/videos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Prevent duplicate requests by adding a middleware that ignores repeated sends
const preventDuplicateRequests = new Set();
app.use((req, res, next) => {
  if (req.method === "POST" && req.originalUrl.includes("/messages")) {
    const hash = `${req.ip}-${JSON.stringify(req.body)}`;
    if (preventDuplicateRequests.has(hash)) {
      return res.status(429).json({ error: "Duplicate request detected" });
    }
    preventDuplicateRequests.add(hash);
    setTimeout(() => preventDuplicateRequests.delete(hash), 2000); // 2 sec window
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
