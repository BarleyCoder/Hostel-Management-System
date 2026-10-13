const express = require("express");

const {
      createAllocation,
      getAllAllocations,
      getMyAllocation,
      getAllocationById,
      cancelAllocation
} = require("../controllers/allocationController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Student
router.get(
      "/my",
      protect,
      getMyAllocation
);

// Admin
router.post(
      "/",
      protect,
      adminOnly,
      createAllocation
);

router.get(
      "/",
      protect,
      adminOnly,
      getAllAllocations
);

// Shared
router.get(
      "/:id",
      protect,
      getAllocationById
);

// Admin
router.put(
      "/:id/cancel",
      protect,
      adminOnly,
      cancelAllocation
);

module.exports = router;