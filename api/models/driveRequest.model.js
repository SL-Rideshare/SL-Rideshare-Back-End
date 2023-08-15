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
  code: {
    type: Number,
    required: true,
  },
  scanned: {
    type: Boolean,
    default: false,
  },
  goods_availability: {
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
