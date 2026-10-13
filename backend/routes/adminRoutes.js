const express = require("express");

const {
      createAdmin
} = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/create", protect, adminOnly, createAdmin);

module.exports = router;