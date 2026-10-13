const express = require("express");

const {
      createHostel,
      getHostels,
      getHostelById,
      updateHostel,
      deleteHostel
} = require("../controllers/hostelController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Publicly accessible to authenticated users
router.get("/", protect, getHostels);
router.get("/:id", protect, getHostelById);

// Admin only
router.post("/", protect, adminOnly, createHostel);
router.put("/:id", protect, adminOnly, updateHostel);
router.delete("/:id", protect, adminOnly, deleteHostel);

module.exports = router;