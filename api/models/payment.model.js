const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ["LIVE", "HIRE", "SCHEDULE"],
    default: "SCHEDULE",
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
    required: false,
  },
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  payment_mode: {
    type: String,
    enum: ["CASH", "WALLET"],
    default: "WALLET",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("payment", paymentSchema);

module.exports = Payment;
