import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage } from "../controllers/message.controllers.js";

const router = express.Router();

// Get all users for sidebar
router.get("/users", protectRoute, getUsersForSidebar);

// Get messages for a specific user by ID
router.get("/chat/:id", protectRoute, getMessages);

// Send a message to a specific user by ID
router.post("/chat/:id", protectRoute, sendMessage);

export default router;
