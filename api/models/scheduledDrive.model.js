const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
    index: { type: "2dsphere", sparse: true },
  },
  description: String,
});

const scheduledDriveSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vehicle",
    required: false,
  },
  private: {
    type: Boolean,
    required: true,
    default: false,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "group",
    required: false,
  },
  goods_is_paid: {
    type: Boolean,
    required: false,
    default: false,
  },
  goods_is_kilo: {
    type: Boolean,
    required: false,
    default: false,
  },
  goods_availability: {
    type: Number,
    required: false,
    default: false,
  },
  goods_fee_first_five: {
    type: Number,
    required: false,
    default: false,
  },
  goods_fee_additional: {
    type: Number,
    required: false,
    default: false,
  },
  passengers_is_paid: {
    type: Boolean,
    required: false,
    default: false,
  },
  passengers_availability: {
    type: Number,
    required: false,
    default: false,
  },
  passengers_fee: {
    type: Number,
    required: false,
    default: false,
  },
  passengers_fee_additional: {
    type: Number,
    required: false,
    default: false,
  },
  start_date: {
    type: Date,
    required: true,
  },
  cancelled: {
    type: Boolean,
    default: false,
  },
  cancellation_reason: {
    type: String,
    default: "",
    required: false,
  },
  stop_new_requests: {
    type: Boolean,
    default: false,
  },
  points: [pointSchema],
});

const ScheduledDrive = mongoose.model("scheduledDrive", scheduledDriveSchema);

module.exports = ScheduledDrive;
