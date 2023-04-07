const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
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
    required: true,
  },

  dob: {
    type: Date,
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
    default: "",
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

  imei: {
    type: String,
    default: "",
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
    default: "",
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

  ref_name: {
    type: String,
    default: "",
    required: false,
  },

  ref_id: {
    type: String,
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
    default: true,
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
    required: true,
  },
  email_confirmation_code: {
    type: Number,
    unique: true,
  },
  email_confirmation_code_timestamp: {
    type: Date,
  },
  phone_confirmation_code: {
    type: Number,
    unique: true,
  },
  phone_confirmation_code_timestamp: {
    type: Date,
  },
});

module.exports = User = mongoose.model("users", UserSchema);
