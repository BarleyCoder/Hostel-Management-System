const Application = require("../models/Application");
const Hostel = require("../models/Hostel");
const User = require("../models/User");

// Student submits an application
const createApplication = async (req, res) => {
      try {
            const {
                  hostel,
                  preferredRoomType,
                  academicSession,
                  reason
            } = req.body;

            const studentId = req.user.userId;

            if (!hostel || !academicSession) {
                  return res.status(400).json({
                        success: false,
                        message: "Hostel and academic session are required"
                  });
            }

            // Get student
            const student = await User.findById(studentId);

            if (!student) {
                  return res.status(404).json({
                        success: false,
                        message: "Student not found"
                  });
            }

            if (student.role !== "student") {
                  return res.status(403).json({
                        success: false,
                        message: "Only students can submit hostel applications"
                  });
            }

            // Get hostel
            const selectedHostel = await Hostel.findById(hostel);

            if (!selectedHostel) {
                  return res.status(404).json({
                        success: false,
                        message: "Hostel not found"
                  });
            }

            if (!selectedHostel.isActive) {
                  return res.status(400).json({
                        success: false,
                        message: "This hostel is currently inactive"
                  });
            }

            // Check gender compatibility
            if (
                  student.gender &&
                  selectedHostel.gender !== student.gender
            ) {
                  return res.status(400).json({
                        success: false,
                        message: "You cannot apply for this hostel"
                  });
            }

            // Check if student already has an active application
            const existingApplication = await Application.findOne({
                  student: studentId,
                  academicSession,
                  status: {
                        $in: ["pending", "approved"]
                  }
            });

            if (existingApplication) {
                  return res.status(409).json({
                        success: false,
                        message: "You already have an active hostel application for this session"
                  });
            }

            // Create application
            const application = await Application.create({
                  student: studentId,
                  hostel,
                  preferredRoomType,
                  academicSession,
                  reason
            });

            const populatedApplication = await Application.findById(
                  application._id
            )
                  .populate("student", "fullName email matricNumber")
                  .populate("hostel", "name location gender");

            res.status(201).json({
                  success: true,
                  message: "Hostel application submitted successfully",
                  application: populatedApplication
            });
      } catch (error) {
            console.error("Create application error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while submitting application"
            });
      }
};


// Student views their applications
const getMyApplications = async (req, res) => {
      try {
            const applications = await Application.find({
                  student: req.user.userId
            })
                  .populate("hostel", "name location gender")
                  .sort({ createdAt: -1 });

            res.status(200).json({
                  success: true,
                  count: applications.length,
                  applications
            });
      } catch (error) {
            console.error("Get my applications error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching applications"
            });
      }
};


// Admin views all applications
const getAllApplications = async (req, res) => {
      try {
            const applications = await Application.find()
                  .populate("student", "fullName email matricNumber phoneNumber")
                  .populate("hostel", "name location gender")
                  .populate("reviewedBy", "fullName email")
                  .sort({ createdAt: -1 });

            res.status(200).json({
                  success: true,
                  count: applications.length,
                  applications
            });
      } catch (error) {
            console.error("Get all applications error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching applications"
            });
      }
};


// Get one application
const getApplicationById = async (req, res) => {
      try {
            const application = await Application.findById(
                  req.params.id
            )
                  .populate("student", "fullName email matricNumber phoneNumber")
                  .populate("hostel", "name location gender")
                  .populate("reviewedBy", "fullName email");

            if (!application) {
                  return res.status(404).json({
                        success: false,
                        message: "Application not found"
                  });
            }

            // Student can only view their own application
            if (
                  req.user.role === "student" &&
                  application.student._id.toString() !== req.user.userId
            ) {
                  return res.status(403).json({
                        success: false,
                        message: "You are not authorized to view this application"
                  });
            }

            res.status(200).json({
                  success: true,
                  application
            });
      } catch (error) {
            console.error("Get application error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching application"
            });
      }
};


// Admin approves or rejects an application
const reviewApplication = async (req, res) => {
      try {
            const { status, adminComment } = req.body;

            if (!["approved", "rejected"].includes(status)) {
                  return res.status(400).json({
                        success: false,
                        message: "Status must be approved or rejected"
                  });
            }

            const application = await Application.findById(
                  req.params.id
            );

            if (!application) {
                  return res.status(404).json({
                        success: false,
                        message: "Application not found"
                  });
            }

            if (application.status !== "pending") {
                  return res.status(400).json({
                        success: false,
                        message: "Only pending applications can be reviewed"
                  });
            }

            application.status = status;
            application.adminComment = adminComment || "";
            application.reviewedBy = req.user.userId;
            application.reviewedAt = new Date();

            await application.save();

            const updatedApplication = await Application.findById(
                  application._id
            )
                  .populate("student", "fullName email matricNumber")
                  .populate("hostel", "name location gender")
                  .populate("reviewedBy", "fullName email");

            res.status(200).json({
                  success: true,
                  message: `Application ${status} successfully`,
                  application: updatedApplication
            });
      } catch (error) {
            console.error("Review application error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while reviewing application"
            });
      }
};


// Student cancels an application
const cancelApplication = async (req, res) => {
      try {
            const application = await Application.findById(
                  req.params.id
            );

            if (!application) {
                  return res.status(404).json({
                        success: false,
                        message: "Application not found"
                  });
            }

            if (
                  application.student.toString() !== req.user.userId
            ) {
                  return res.status(403).json({
                        success: false,
                        message: "You can only cancel your own application"
                  });
            }

            if (application.status !== "pending") {
                  return res.status(400).json({
                        success: false,
                        message: "Only pending applications can be cancelled"
                  });
            }

            application.status = "cancelled";

            await application.save();

            res.status(200).json({
                  success: true,
                  message: "Application cancelled successfully",
                  application
            });
      } catch (error) {
            console.error("Cancel application error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while cancelling application"
            });
      }
};


module.exports = {
      createApplication,
      getMyApplications,
      getAllApplications,
      getApplicationById,
      reviewApplication,
      cancelApplication
};