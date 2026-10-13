const Room = require("../models/Room");
const Hostel = require("../models/Hostel");

// Create a room
const createRoom = async (req, res) => {
      try {
            const {
                  hostel,
                  roomNumber,
                  floor,
                  capacity
            } = req.body;

            if (!hostel || !roomNumber || !capacity) {
                  return res.status(400).json({
                        success: false,
                        message: "Hostel, room number and capacity are required"
                  });
            }

            // Check that hostel exists
            const existingHostel = await Hostel.findById(hostel);

            if (!existingHostel) {
                  return res.status(404).json({
                        success: false,
                        message: "Hostel not found"
                  });
            }

            // Check duplicate room
            const existingRoom = await Room.findOne({
                  hostel,
                  roomNumber
            });

            if (existingRoom) {
                  return res.status(409).json({
                        success: false,
                        message: "This room already exists in the selected hostel"
                  });
            }

            const room = await Room.create({
                  hostel,
                  roomNumber,
                  floor,
                  capacity,
                  occupiedSpaces: 0,
                  status: "available"
            });

            // Update hostel room count
            existingHostel.availableRooms =
                  (existingHostel.availableRooms || 0) + 1;

            await existingHostel.save();

            res.status(201).json({
                  success: true,
                  message: "Room created successfully",
                  room
            });
      } catch (error) {
            console.error("Create room error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while creating room"
            });
      }
};


// Get all rooms
const getRooms = async (req, res) => {
      try {
            const rooms = await Room.find()
                  .populate("hostel", "name location gender")
                  .sort({ createdAt: -1 });

            res.status(200).json({
                  success: true,
                  count: rooms.length,
                  rooms
            });
      } catch (error) {
            console.error("Get rooms error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching rooms"
            });
      }
};


// Get rooms for a specific hostel
const getRoomsByHostel = async (req, res) => {
      try {
            const rooms = await Room.find({
                  hostel: req.params.hostelId
            }).sort({ roomNumber: 1 });

            res.status(200).json({
                  success: true,
                  count: rooms.length,
                  rooms
            });
      } catch (error) {
            console.error("Get hostel rooms error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching hostel rooms"
            });
      }
};


// Get one room
const getRoomById = async (req, res) => {
      try {
            const room = await Room.findById(req.params.id)
                  .populate("hostel", "name location gender");

            if (!room) {
                  return res.status(404).json({
                        success: false,
                        message: "Room not found"
                  });
            }

            res.status(200).json({
                  success: true,
                  room
            });
      } catch (error) {
            console.error("Get room error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching room"
            });
      }
};


// Update room
const updateRoom = async (req, res) => {
      try {
            const room = await Room.findById(req.params.id);

            if (!room) {
                  return res.status(404).json({
                        success: false,
                        message: "Room not found"
                  });
            }

            const {
                  roomNumber,
                  floor,
                  capacity,
                  status,
                  isActive
            } = req.body;

            if (capacity !== undefined && capacity < room.occupiedSpaces) {
                  return res.status(400).json({
                        success: false,
                        message: "Capacity cannot be less than occupied spaces"
                  });
            }

            room.roomNumber = roomNumber ?? room.roomNumber;
            room.floor = floor ?? room.floor;
            room.capacity = capacity ?? room.capacity;
            room.status = status ?? room.status;
            room.isActive = isActive ?? room.isActive;

            if (room.occupiedSpaces >= room.capacity) {
                  room.status = "full";
            } else if (room.status === "full") {
                  room.status = "available";
            }

            await room.save();

            res.status(200).json({
                  success: true,
                  message: "Room updated successfully",
                  room
            });
      } catch (error) {
            console.error("Update room error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while updating room"
            });
      }
};


// Delete room
const deleteRoom = async (req, res) => {
      try {
            const room = await Room.findById(req.params.id);

            if (!room) {
                  return res.status(404).json({
                        success: false,
                        message: "Room not found"
                  });
            }

            // Don't delete an occupied room
            if (room.occupiedSpaces > 0) {
                  return res.status(400).json({
                        success: false,
                        message: "Cannot delete a room with occupied spaces"
                  });
            }

            const hostel = await Hostel.findById(room.hostel);

            await room.deleteOne();

            if (hostel && hostel.availableRooms > 0) {
                  hostel.availableRooms -= 1;
                  await hostel.save();
            }

            res.status(200).json({
                  success: true,
                  message: "Room deleted successfully"
            });
      } catch (error) {
            console.error("Delete room error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while deleting room"
            });
      }
};


module.exports = {
      createRoom,
      getRooms,
      getRoomsByHostel,
      getRoomById,
      updateRoom,
      deleteRoom
};