const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (userId, role) => {
      return jwt.sign(
            { userId, role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
      );
};
// Register student
const register = async (req, res) => {
      try {
            const {
                  fullName,
                  email,
                  password,
                  matricNumber,
                  phoneNumber,
                  department,
                  faculty,
                  level,
                  gender
            } = req.body;

            // Check required fields
            if (!fullName || !email || !password) {
                  return res.status(400).json({
                        success: false,
                        message: "Full name, email and password are required"
                  });
            }

            // Check if email already exists
            const existingEmail = await User.findOne({
                  email: email.toLowerCase()
            });

            if (existingEmail) {
                  return res.status(409).json({
                        success: false,
                        message: "Email is already registered"
                  });
            }

            // Check matric number if provided
            if (matricNumber) {
                  const existingMatric = await User.findOne({ matricNumber });

                  if (existingMatric) {
                        return res.status(409).json({
                              success: false,
                              message: "Matric number is already registered"
                        });
                  }
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create student
            const user = await User.create({
                  fullName,
                  email: email.toLowerCase(),
                  password: hashedPassword,
                  role: "student",
                  matricNumber,
                  phoneNumber,
                  department,
                  faculty,
                  level,
                  gender
            });

            // Generate token
            const token = generateToken(user._id, user.role);

            res.status(201).json({
                  success: true,
                  message: "Student registration successful",
                  token,
                  user: {
                        id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        role: user.role,
                        matricNumber: user.matricNumber
                  }
            });
      } catch (error) {
            console.error("Registration error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error during registration"
            });
      }
};


// Login
const login = async (req, res) => {
      try {
            const { email, password } = req.body;

            if (!email || !password) {
                  return res.status(400).json({
                        success: false,
                        message: "Email and password are required"
                  });
            }

            // Find user
            const user = await User.findOne({
                  email: email.toLowerCase()
            });

            if (!user) {
                  return res.status(401).json({
                        success: false,
                        message: "Invalid email or password"
                  });
            }

            // Check account status
            if (!user.isActive) {
                  return res.status(403).json({
                        success: false,
                        message: "Your account has been deactivated"
                  });
            }

            // Compare password
            const passwordMatch = await bcrypt.compare(
                  password,
                  user.password
            );

            if (!passwordMatch) {
                  return res.status(401).json({
                        success: false,
                        message: "Invalid email or password"
                  });
            }

            // Generate token
            const token = generateToken(user._id, user.role);

            res.status(200).json({
                  success: true,
                  message: "Login successful",
                  token,
                  user: {
                        id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        role: user.role,
                        matricNumber: user.matricNumber
                  }
            });
      } catch (error) {
            console.error("Login error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error during login"
            });
      }
};


// Get current user
const getMe = async (req, res) => {
      try {
            const user = await User.findById(req.user.userId).select("-password");

            if (!user) {
                  return res.status(404).json({
                        success: false,
                        message: "User not found"
                  });
            }

            res.status(200).json({
                  success: true,
                  user
            });
      } catch (error) {
            console.error("Get user error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error"
            });
      }
};

module.exports = {
      register,
      login,
      getMe
};