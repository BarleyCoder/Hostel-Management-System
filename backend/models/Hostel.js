const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
      {
            name: {
                  type: String,
                  required: [true, "Hostel name is required"],
                  trim: true,
                  unique: true
            },

            description: {
                  type: String,
                  trim: true
            },

            location: {
                  type: String,
                  required: [true, "Hostel location is required"],
                  trim: true
            },

            gender: {
                  type: String,
                  enum: ["male", "female"],
                  required: [true, "Hostel gender is required"]
            },

            totalRooms: {
                  type: Number,
                  required: [true, "Total rooms is required"],
                  min: 1
            },

            availableRooms: {
                  type: Number,
                  min: 0
            },

            status: {
                  type: String,
                  enum: ["available", "full", "maintenance"],
                  default: "available"
            },

            isActive: {
                  type: Boolean,
                  default: true
            }
      },
      {
            timestamps: true
      }
);

const Hostel = mongoose.model("Hostel", hostelSchema);

module.exports = Hostel;