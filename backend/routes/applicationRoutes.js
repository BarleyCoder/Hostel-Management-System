const express = require("express");

const {
      createApplication,
      getMyApplications,
      getAllApplications,
      getApplicationById,
      reviewApplication,
      cancelApplication
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Student routes
router.post("/", protect, createApplication);

router.get(
      "/my",
      protect,
      getMyApplications
);

router.put(
      "/:id/cancel",
      protect,
      cancelApplication
);

// Admin routes
router.get(
      "/",
      protect,
      adminOnly,
      getAllApplications
);

router.put(
      "/:id/review",
      protect,
      adminOnly,
      reviewApplication
);

// Shared route
router.get(
      "/:id",
      protect,
      getApplicationById
);

module.exports = router;