const express = require("express");

const {
      createRoom,
      getRooms,
      getRoomsByHostel,
      getRoomById,
      updateRoom,
      deleteRoom
} = require("../controllers/roomController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Authenticated users
router.get("/", protect, getRooms);
router.get("/hostel/:hostelId", protect, getRoomsByHostel);
router.get("/:id", protect, getRoomById);

// Admin only
router.post("/", protect, adminOnly, createRoom);
router.put("/:id", protect, adminOnly, updateRoom);
router.delete("/:id", protect, adminOnly, deleteRoom);

module.exports = router;