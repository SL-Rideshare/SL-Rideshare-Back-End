const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  name: String,
  longitude: Number,
  latitude: Number,
});

const favouriteRouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  starting_destination: pointSchema,
  ending_destination: pointSchema,
  points_between: [pointSchema],
});

const FavouriteRoute = mongoose.model("favouriteRoute", favouriteRouteSchema);

module.exports = FavouriteRoute;
