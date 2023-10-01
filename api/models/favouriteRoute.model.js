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

const favouriteRouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  points: [pointSchema],
});

const FavouriteRoute = mongoose.model("favouriteRoute", favouriteRouteSchema);

module.exports = FavouriteRoute;
