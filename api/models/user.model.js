const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    default: "",
    required: true,
  },
  last_name: {
    type: String,
    default: "",
    required: true,
  },
  nic: {
    type: String,
    default: "",
    minLength: 9,
    maxLength: 12,
    required: true,
  },
  captured_nic: {
    type: String,
    default: "",
    required: false,
  },
  nic_location: {
    type: String,
    default: "",
    required: false,
  },
  dob: {
    type: String,
    default: "",
    required: true,
  },
  display_img: {
    type: String,
    default: "",
    required: false,
  },
  username: {
    type: String,
    minLength: 6,
    maxLength: 24,
    required: false,
  },
  email: {
    type: String,
    default: "",
    required: false,
  },
  contact_number: {
    type: String,
    default: "",
    required: false,
  },
  device_token: {
    type: String,
    default: "",
    minLength: 16,
    maxLength: 16,
    required: true,
  },
  address: {
    type: String,
    default: "",
    required: false,
  },
  postal_code: {
    type: Number,
    default: "",
    required: false,
  },
  password: {
    type: String,
    minLength: 6,
    required: false,
  },
  occupation: {
    type: String,
    default: "",
    required: false,
  },
  description: {
    type: String,
    default: "",
    required: false,
  },
  diseases_and_disabilities: {
    type: String,
    default: "",
    required: false,
  },
  ref_by: {
    type: Number,
    default: "",
    required: false,
  },
  ref_code: {
    type: Number,
    default: "",
    required: false,
  },
  recommended: {
    type: Boolean,
    default: false,
    required: false,
  },
  under_review: {
    type: Boolean,
    default: false,
    required: false,
  },
  email_verified: {
    type: Boolean,
    default: false,
    required: false,
  },
  phone_verified: {
    type: Boolean,
    default: false,
    required: false,
  },
  reg_state: {
    type: String,
    enum: [
      "INIT",
      "PENDING_NIC_VERIFICATION",
      "PENDING_DATA",
      "PENDING_EMAIL_VERIFICATION",
      "PENDING_PHONE_VERIFICATION",
      "PENDING_REF",
      "END",
    ],
    default: "INIT",
    required: false,
  },
  level: {
    type: Number,
    default: 1,
  },
  credit_balance: {
    type: Number,
    default: 100,
  },
});

module.exports = User = mongoose.model("user", userSchema);
