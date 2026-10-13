const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
      {
            hostel: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Hostel",
                  required: [true, "Hostel is required"],
            },

            roomNumber: {
                  type: String,
                  required: [true, "Room number is required"],
                  trim: true,
            },

            floor: {
                  type: String,
                  trim: true,
            },

            capacity: {
                  type: Number,
                  required: [true, "Room capacity is required"],
                  min: 1,
            },

            occupiedSpaces: {
                  type: Number,
                  default: 0,
                  min: 0,
            },

            status: {
                  type: String,
                  enum: ["available", "full", "maintenance"],
                  default: "available",
            },

            isActive: {
                  type: Boolean,
                  default: true,
            },
      },
      {
            timestamps: true,
      },
);

// Prevent duplicate room numbers inside the same hostel
roomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
