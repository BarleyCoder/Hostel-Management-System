const Hostel = require("../models/Hostel");

// Create a new hostel
const createHostel = async (req, res) => {
      try {
            const {
                  name,
                  description,
                  location,
                  gender,
                  totalRooms
            } = req.body;

            if (!name || !location || !gender || !totalRooms) {
                  return res.status(400).json({
                        success: false,
                        message: "Name, location, gender and total rooms are required"
                  });
            }

            const existingHostel = await Hostel.findOne({ name });

            if (existingHostel) {
                  return res.status(409).json({
                        success: false,
                        message: "A hostel with this name already exists"
                  });
            }

            const hostel = await Hostel.create({
                  name,
                  description,
                  location,
                  gender,
                  totalRooms,
                  availableRooms: totalRooms
            });

            res.status(201).json({
                  success: true,
                  message: "Hostel created successfully",
                  hostel
            });
      } catch (error) {
            console.error("Create hostel error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while creating hostel"
            });
      }
};


// Get all hostels
const getHostels = async (req, res) => {
      try {
            const hostels = await Hostel.find().sort({ createdAt: -1 });

            res.status(200).json({
                  success: true,
                  count: hostels.length,
                  hostels
            });
      } catch (error) {
            console.error("Get hostels error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching hostels"
            });
      }
};


// Get one hostel
const getHostelById = async (req, res) => {
      try {
            const hostel = await Hostel.findById(req.params.id);

            if (!hostel) {
                  return res.status(404).json({
                        success: false,
                        message: "Hostel not found"
                  });
            }

            res.status(200).json({
                  success: true,
                  hostel
            });
      } catch (error) {
            console.error("Get hostel error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while fetching hostel"
            });
      }
};


// Update hostel
const updateHostel = async (req, res) => {
      try {
            const hostel = await Hostel.findById(req.params.id);

            if (!hostel) {
                  return res.status(404).json({
                        success: false,
                        message: "Hostel not found"
                  });
            }

            const {
                  name,
                  description,
                  location,
                  gender,
                  totalRooms,
                  status,
                  isActive
            } = req.body;

            hostel.name = name ?? hostel.name;
            hostel.description = description ?? hostel.description;
            hostel.location = location ?? hostel.location;
            hostel.gender = gender ?? hostel.gender;
            hostel.totalRooms = totalRooms ?? hostel.totalRooms;
            hostel.status = status ?? hostel.status;
            hostel.isActive = isActive ?? hostel.isActive;

            await hostel.save();

            res.status(200).json({
                  success: true,
                  message: "Hostel updated successfully",
                  hostel
            });
      } catch (error) {
            console.error("Update hostel error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while updating hostel"
            });
      }
};


// Delete hostel
const deleteHostel = async (req, res) => {
      try {
            const hostel = await Hostel.findById(req.params.id);

            if (!hostel) {
                  return res.status(404).json({
                        success: false,
                        message: "Hostel not found"
                  });
            }

            await hostel.deleteOne();

            res.status(200).json({
                  success: true,
                  message: "Hostel deleted successfully"
            });
      } catch (error) {
            console.error("Delete hostel error:", error);

            res.status(500).json({
                  success: false,
                  message: "Server error while deleting hostel"
            });
      }
};


module.exports = {
      createHostel,
      getHostels,
      getHostelById,
      updateHostel,
      deleteHostel
};