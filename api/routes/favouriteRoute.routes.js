const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { FavouriteRouteController } = require("../controllers");

router.get("/:user_id", FavouriteRouteController.getRoutes);
router.post("/:user_id", FavouriteRouteController.createRoute);
router.delete("/:id", FavouriteRouteController.deleteRoute);

module.exports = router;
