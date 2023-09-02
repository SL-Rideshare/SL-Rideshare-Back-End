const mongoose = require("mongoose");

let groupSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
    required: true,
  },
  img_url: {
    type: String,
    default: "",
    required: false,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
  ],
  requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
  ],
});

module.exports = Group = mongoose.model("group", groupSchema);
