const Allocation = require("../models/Allocation");
const Application = require("../models/Application");
const Room = require("../models/Room");
const Hostel = require("../models/Hostel");
const User = require("../models/User");


// Allocate a student to a room and bed
const createAllocation = async (req, res) => {
      try {
            const {
                  applicationId,
                  roomId,
                  bedNumber
            } = req.body;

            if (!applicationId || !roomId || !bedNumber) {
                  return res.status(400).json({
                        success: false,
                        message: "Application, room and bed number are required"
                  });
            }

            // Get application
            const application = await Application.findById(applicationId);

            if (!application) {
                  return res.status(404).json({
                        success: false,
                        message: "Application not found"
                  });
            }

            // Only approved applications can be allocated
            if (application.status !== "approved") {
                  return res.status(400).json({
                        success: false,
                        message: "Only approved applications can be allocated"
                  });
            }

            // Check if student already has an active allocation
            const existingAllocation = await Allocation.findOne({
                  student: application.student,
                  status: "active"
            });

            if (existingAllocation) {
                  return res.status(409).json({
                        success: false,
                        message: "This student already has an active room allocation"
                  });
            }

            // Get room
            const room = await Room.findById(roomId);

            if (!room) {
                  return res.status(404).json({
                        success: false,
                        message: "Room not found"
                  });
            }

            // Make sure room belongs to the selected hostel
            if (
                  room.hostel.toString() !==
                  application.hostel.toString()
            ) {
                  return res.status(400).json({
                        success: false,
                        message: "Selected room does not belong to the student's hostel"
                  });
            }

            // Check room status
            if (room.status === "maintenance") {
                  return res.status(400).json({
                        success: false,
                        message: "This room is currently under maintenance"
                  });
            }

            if (room.occupiedSpaces >= room.capacity) {
                  return res.status(400).json({
                        success: false,
                        message: "This room is already full"
                  });
            }

            // Validate bed number
            if (
                  !Number.isInteger(Number(bedNumber)) ||
                  Number(bedNumber) < 1 ||
                  Number(bedNumber) > room.capacity
            ) {
                  return res.status(400).json({
                        success: false,
                        message: `Bed number must be between 1 and ${room.capacity}`
                  });
            }

            // Check if selected bed is already occupied
            const occupiedBed = await Allocation.findOne({
                  room: roomId,
                  bedNumber: Number(bedNumber),
                  status: "active"
            });

            if (occupiedBed) {
                  return res.status(409).json({
                        success: false,
                        message: "This bed is already occupied"
                  });
            }

            // Get student
            const student = await User.findById(application.student);

            if (!student) {
                  return res.status(404).json({
                        success: false,
                        message: "Student not found"
                  });
            }

            // Create allocation
            const allocation = await Allocation.create({
                  student: application.student,
                  application: application._id,
                  hostel: application.hostel,
                  room: room._id,
                  bedNumber: Number(bedNumber),
                  academicSession: application.academicSession,
                  allocatedBy: req.user.userId
            });

            // Update room occupancy
            room.occupiedSpaces += 1;

            if (room.occupiedSpaces >= room.capacity) {
                  room.status = "full";
            } else {
                  room.status = "available";
            }

            await room.save();

            // Update hostel available rooms if room just became full
            if (room.occupiedSpaces === room.capacity) {
                  const hostel = await Hostel.findById(room.hostel);

                  if (hostel && hostel.availableRooms > 0) {
                        hostel.availableRooms -= 1;
                        await hostel.save();
                  }
            }

            const populatedAllocation = await Allocation.findById(
                  allocation._id
            )
                  .populate(
                        "student",
                        "fullName email matricNumber phoneNumber"
                  )
                  .populate(
                        "hostel",
                        "name location gender"
                  )
                  .populate(
                        "room",
                        "roomNumber floor capacity occupiedSpaces status"
                  )
                  .populate(
                        "allocatedBy",
                        "fullName email"
                  );

            res.status(201).json({
                  success: true,
                  message: "Room and bed allocated successfully",
                  allocation: populatedAllocation
            });

      } catch (error) {
            console.error("Create allocation error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while creating allocation"
            });
      }
};


// Get all allocations
const getAllAllocations = async (req, res) => {
      try {
            const allocations = await Allocation.find()
                  .populate(
                        "student",
                        "fullName email matricNumber phoneNumber"
                  )
                  .populate(
                        "hostel",
                        "name location gender"
                  )
                  .populate(
                        "room",
                        "roomNumber floor capacity occupiedSpaces status"
                  )
                  .populate(
                        "allocatedBy",
                        "fullName email"
                  )
                  .sort({ createdAt: -1 });

            res.status(200).json({
                  success: true,
                  count: allocations.length,
                  allocations
            });

      } catch (error) {
            console.error("Get allocations error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching allocations"
            });
      }
};


// Student views their own allocation
const getMyAllocation = async (req, res) => {
      try {
            const allocation = await Allocation.findOne({
                  student: req.user.userId,
                  status: "active"
            })
                  .populate(
                        "hostel",
                        "name location gender"
                  )
                  .populate(
                        "room",
                        "roomNumber floor capacity occupiedSpaces status"
                  );

            if (!allocation) {
                  return res.status(404).json({
                        success: false,
                        message: "No active room allocation found"
                  });
            }

            res.status(200).json({
                  success: true,
                  allocation
            });

      } catch (error) {
            console.error("Get my allocation error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching your allocation"
            });
      }
};


// Get allocation by ID
const getAllocationById = async (req, res) => {
      try {
            const allocation = await Allocation.findById(req.params.id)
                  .populate(
                        "student",
                        "fullName email matricNumber phoneNumber"
                  )
                  .populate(
                        "hostel",
                        "name location gender"
                  )
                  .populate(
                        "room",
                        "roomNumber floor capacity occupiedSpaces status"
                  )
                  .populate(
                        "allocatedBy",
                        "fullName email"
                  );

            if (!allocation) {
                  return res.status(404).json({
                        success: false,
                        message: "Allocation not found"
                  });
            }

            // Students can only see their own allocation
            if (
                  req.user.role === "student" &&
                  allocation.student._id.toString() !== req.user.userId
            ) {
                  return res.status(403).json({
                        success: false,
                        message: "You are not authorized to view this allocation"
                  });
            }

            res.status(200).json({
                  success: true,
                  allocation
            });

      } catch (error) {
            console.error("Get allocation error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching allocation"
            });
      }
};


// Cancel allocation
const cancelAllocation = async (req, res) => {
      try {
            const allocation = await Allocation.findById(
                  req.params.id
            );

            if (!allocation) {
                  return res.status(404).json({
                        success: false,
                        message: "Allocation not found"
                  });
            }

            if (allocation.status === "cancelled") {
                  return res.status(400).json({
                        success: false,
                        message: "Allocation is already cancelled"
                  });
            }

            allocation.status = "cancelled";

            await allocation.save();

            // Reduce room occupancy
            const room = await Room.findById(allocation.room);

            if (room && room.occupiedSpaces > 0) {
                  room.occupiedSpaces -= 1;

                  if (room.status !== "maintenance") {
                        room.status = "available";
                  }

                  await room.save();

                  // Increase hostel available rooms if room was previously full
                  if (room.occupiedSpaces === room.capacity - 1) {
                        const hostel = await Hostel.findById(room.hostel);

                        if (hostel) {
                              hostel.availableRooms =
                                    (hostel.availableRooms || 0) + 1;

                              await hostel.save();
                        }
                  }
            }

            res.status(200).json({
                  success: true,
                  message: "Allocation cancelled successfully",
                  allocation
            });

      } catch (error) {
            console.error("Cancel allocation error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while cancelling allocation"
            });
      }
};


module.exports = {
      createAllocation,
      getAllAllocations,
      getMyAllocation,
      getAllocationById,
      cancelAllocation
};