
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5002;

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
}));

// Middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const hostelRoutes = require("./routes/hostelRoutes");
const roomRoutes = require("./routes/roomRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const allocationRoutes = require("./routes/allocationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/allocations", allocationRoutes);

// Test route
app.get("/", (req, res) => {
      res.json({
            success: true,
            message: "Hostel Management System API is running"
      });
});

app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}✅`);
});