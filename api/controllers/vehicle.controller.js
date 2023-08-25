const { User, Vehicle } = require("../models");

const getAllVehiclesByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    const vehicles = await Vehicle.find({ owner: user_id }).populate(
      "registration"
    );
    res.status(200).json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getVehicleById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicle = await Vehicle.findById(id).populate("registration");
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateVehicle = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    Object.assign(vehicle, req.body);

    const updatedVehicle = await vehicle.save();
    res.status(200).json(updatedVehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteVehicle = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    await vehicle.remove();
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllVehiclesByUserId,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
