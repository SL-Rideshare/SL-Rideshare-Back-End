const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "payment",
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["DEBIT", "CREDIT"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const Transaction = mongoose.model("transaction", transactionSchema);

module.exports = Transaction;
