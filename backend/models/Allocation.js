const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
      {
            student: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: [true, "Student is required"],
                  unique: true,
            },

            application: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Application",
                  required: [true, "Application is required"],
                  unique: true,
            },

            hostel: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Hostel",
                  required: [true, "Hostel is required"],
            },

            room: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Room",
                  required: [true, "Room is required"],
            },

            bedNumber: {
                  type: Number,
                  required: [true, "Bed number is required"],
                  min: 1,
            },

            academicSession: {
                  type: String,
                  required: [true, "Academic session is required"],
                  trim: true,
            },

            status: {
                  type: String,
                  enum: ["active", "cancelled"],
                  default: "active",
            },

            allocatedBy: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: [true, "Allocator is required"],
            },

            allocatedAt: {
                  type: Date,
                  default: Date.now,
            },
      },
      {
            timestamps: true,
      },
);

// A room cannot have the same bed allocated twice
allocationSchema.index(
      {
            room: 1,
            bedNumber: 1,
            status: 1,
      },
      {
            unique: true,
            partialFilterExpression: {
                  status: "active",
            },
      },
);

const Allocation = mongoose.model("Allocation", allocationSchema);

module.exports = Allocation;
