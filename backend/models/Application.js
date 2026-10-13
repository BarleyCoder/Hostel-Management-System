const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
      {
            student: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: [true, "Student is required"]
            },

            hostel: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Hostel",
                  required: [true, "Hostel is required"]
            },

            preferredRoomType: {
                  type: String,
                  enum: ["single", "double", "triple", "quadruple"],
                  default: "quadruple"
            },

            academicSession: {
                  type: String,
                  required: [true, "Academic session is required"],
                  trim: true
            },

            reason: {
                  type: String,
                  trim: true,
                  maxlength: 500
            },

            status: {
                  type: String,
                  enum: ["pending", "approved", "rejected", "cancelled"],
                  default: "pending"
            },

            adminComment: {
                  type: String,
                  trim: true,
                  maxlength: 500
            },

            reviewedBy: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User"
            },

            reviewedAt: {
                  type: Date
            }
      },
      {
            timestamps: true
      }
);

// A student should not submit multiple applications
// for the same hostel during the same academic session.
applicationSchema.index(
      {
            student: 1,
            hostel: 1,
            academicSession: 1
      },
      {
            unique: true
      }
);

const Application = mongoose.model(
      "Application",
      applicationSchema
);

module.exports = Application;