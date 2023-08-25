const { User, VehicleRegistration } = require("../models");

const getAllRegistrations = async (req, res) => {
  try {
    const vehicleRegistrations = await VehicleRegistration.find();
    res.status(200).json(vehicleRegistrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getRegistrationById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleRegistration = await VehicleRegistration.findById(id);
    if (!vehicleRegistration) {
      return res
        .status(404)
        .json({ message: "Vehicle registration not found" });
    }
    res.status(200).json(vehicleRegistration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createRegistration = async (req, res) => {
  const {
    user_id,
    license_number,
    blood_group,
    license_issue_date,
    license_expire_date,
    license_front_url,
    license_back_url,
    vehicle_number,
    chassis_number,
    body_number,
    reg_date,
    reg_front_url,
    reg_back_url,
    reg_approved,
    vehicle_insurance_url,
    insurance_approved,
    vehicle_revenue_license_url,
    revenue_license_approved,
    vehicle_numberplate_url,
  } = req.body;

  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newVehicleRegistration = new VehicleRegistration({
      user_id,
      license_number,
      blood_group,
      license_issue_date,
      license_expire_date,
      license_front_url,
      license_back_url,
      vehicle_number,
      chassis_number,
      body_number,
      reg_date,
      reg_front_url,
      reg_back_url,
      reg_approved,
      vehicle_insurance_url,
      insurance_approved,
      vehicle_revenue_license_url,
      revenue_license_approved,
      vehicle_numberplate_url,
    });

    const savedVehicleRegistration = await newVehicleRegistration.save();
    res.status(200).json(savedVehicleRegistration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateRegistration = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleRegistration = await VehicleRegistration.findById(id);
    if (!vehicleRegistration) {
      return res
        .status(404)
        .json({ message: "Vehicle registration not found" });
    }

    Object.assign(vehicleRegistration, req.body);

    const updatedVehicleRegistration = await vehicleRegistration.save();
    res.status(200).json(updatedVehicleRegistration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const approveOrRejectRegistration = async (req, res) => {
  const { id } = req.params;
  const { reg_approved, insurance_approved } = req.body;

  try {
    const vehicleRegistration = await VehicleRegistration.findById(id);
    if (!vehicleRegistration) {
      return res
        .status(404)
        .json({ message: "Vehicle registration not found" });
    }

    vehicleRegistration.reg_approved = reg_approved;
    vehicleRegistration.insurance_approved = insurance_approved;

    const updatedRegistration = await vehicleRegistration.save();

    const newVehicle = new Vehicle({
      registration: updatedRegistration._id,
      owner: updatedRegistration.user_id,
    });

    const savedVehicle = await newVehicle.save();

    res
      .status(200)
      .json({ registration: updatedRegistration, vehicle: savedVehicle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteRegistration = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleRegistration = await VehicleRegistration.findById(id);
    if (!vehicleRegistration) {
      return res
        .status(404)
        .json({ message: "Vehicle registration not found" });
    }

    await vehicleRegistration.remove();
    res
      .status(200)
      .json({ message: "Vehicle registration deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  approveOrRejectRegistration,
  deleteRegistration,
};
