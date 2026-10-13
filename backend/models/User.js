const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },

    matricNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },

    phoneNumber: {
      type: String,
      trim: true
    },

    department: {
      type: String,
      trim: true
    },

    faculty: {
      type: String,
      trim: true
    },

    level: {
      type: String,
      enum: ["ND1", "ND2", "HND1", "HND2"],
      trim: true
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      lowercase: true
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

const User = mongoose.model("User", userSchema);

module.exports = User;