const mongoose = require("mongoose");

const driveRequestSchema = new mongoose.Schema({
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "scheduledDrive",
    required: true,
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["ACCEPTED", "REJECTED", "PENDING", "CANCELLED"],
    default: "PENDING",
    required: false,
  },
  cancellation_reason: {
    type: String,
    default: "",
    required: false,
  },
  start_code: {
    type: Number,
    required: true,
  },
  start_scanned: {
    type: Boolean,
    default: false,
  },
  end_code: {
    type: Number,
    required: true,
  },
  end_scanned: {
    type: Boolean,
    default: false,
  },
  goods_is_kilo: {
    type: Boolean,
    required: true,
  },
  goods_availability: {
    type: Number,
    required: false,
  },
  goods_receiver_ref_code: {
    type: Number,
    required: false,
  },
  passengers_availability: {
    type: Number,
    required: false,
  },
  cost: {
    type: Number,
    required: false,
  },
  completed_at: {
    type: Date,
    required: false,
  },
});

const DriveRequest = mongoose.model("driveRequest", driveRequestSchema);

module.exports = DriveRequest;
