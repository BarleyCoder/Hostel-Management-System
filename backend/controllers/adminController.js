const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async (req, res) => {
      try {
            const {
                  fullName,
                  email,
                  password
            } = req.body;

            if (!fullName || !email || !password) {
                  return res.status(400).json({
                        success: false,
                        message: "Full name, email and password are required"
                  });
            }

            if (password.length < 6) {
                  return res.status(400).json({
                        success: false,
                        message: "Password must be at least 6 characters"
                  });
            }

            const existingAdmin = await User.findOne({
                  email: email.toLowerCase()
            });

            if (existingAdmin) {
                  return res.status(409).json({
                        success: false,
                        message: "A user with this email already exists"
                  });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const admin = await User.create({
                  fullName,
                  email: email.toLowerCase(),
                  password: hashedPassword,
                  role: "admin"
            });

            res.status(201).json({
                  success: true,
                  message: "Admin account created successfully",
                  user: {
                        id: admin._id,
                        fullName: admin.fullName,
                        email: admin.email,
                        role: admin.role
                  }
            });
      } catch (error) {
            console.error("Create admin error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while creating admin"
            });
      }
};

module.exports = {
      createAdmin
};