const mongoose = require("mongoose");

const vehicleRegistrationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false,
  },
  license_number: {
    type: String,
    required: true,
  },
  blood_group: {
    type: String,
    required: true,
  },
  license_issue_date: {
    type: String,
    required: true,
  },
  license_expire_date: {
    type: String,
    required: true,
  },
  license_front_url: {
    type: String,
    required: false,
  },
  license_back_url: {
    type: String,
    required: false,
  },
  vehicle_number: {
    type: String,
    required: true,
  },
  chassis_number: {
    type: String,
    required: true,
  },
  body_number: {
    type: String,
    required: true,
  },
  reg_date: {
    type: String,
    required: true,
  },
  reg_front_url: {
    type: String,
    required: false,
  },
  reg_back_url: {
    type: String,
    required: false,
  },
  reg_approved: {
    type: Boolean,
    required: false,
    default: false,
  },
  vehicle_insurance_url: {
    type: String,
    required: false,
  },
  insurance_approved: {
    type: Boolean,
    required: false,
    default: false,
  },
  vehicle_revenue_license_url: {
    type: String,
    required: false,
  },
  revenue_license_approved: {
    type: Boolean,
    required: false,
    default: false,
  },
  vehicle_numberplate_url: {
    type: String,
    required: false,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const VehicleRegistration = mongoose.model(
  "vehicleRegistration",
  vehicleRegistrationSchema
);

module.exports = VehicleRegistration;
