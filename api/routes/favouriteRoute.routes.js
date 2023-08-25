const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { FavouriteRouteController } = require("../controllers");

router.get("/:user_id", verifyToken, FavouriteRouteController.getRoutes);
router.post("/:user_id", verifyToken, FavouriteRouteController.createRoute);
router.delete("/:id", verifyToken, FavouriteRouteController.deleteRoute);

module.exports = router;
