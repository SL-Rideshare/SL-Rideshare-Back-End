const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  description: String,
  label: String,
  longitude: Number,
  latitude: Number,
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
