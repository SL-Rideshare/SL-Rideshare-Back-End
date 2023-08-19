const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vehicleRegistration",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  earnings: {
    type: Number,
    required: false,
  },
  trips: {
    type: Number,
    required: false,
  },
  rating: {
    type: Number,
    required: false,
  },
});

const Vehicle = mongoose.model("vehicle", vehicleSchema);

module.exports = Vehicle;
