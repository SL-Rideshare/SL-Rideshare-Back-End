const { FavouriteRoute } = require("../models");

const getRoutes = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const routes = await FavouriteRoute.find({ user_id });
    res.status(200).json(routes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createRoute = async (req, res) => {
  const user_id = req.params.user_id;

  const { name, starting_destination, ending_destination, points_between } =
    req.body;

  if (
    !name ||
    !starting_destination ||
    !ending_destination ||
    !points_between
  ) {
    return res.status(400).json({ message: "Incomplete route data" });
  }

  try {
    const existingRoute = await FavouriteRoute.findOne({ user_id, name });

    if (existingRoute) {
      return res.status(400).json({
        message: "A route with the same name already exists for this user",
      });
    }

    const newRoute = new FavouriteRoute({
      user_id,
      name,
      starting_destination,
      ending_destination,
      points_between,
    });

    const savedRoute = await newRoute.save();
    res.status(201).json(savedRoute);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteRoute = async (req, res) => {
  try {
    const route = await FavouriteRoute.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }
    res.json(route);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getRoutes,
  createRoute,
  deleteRoute,
};
