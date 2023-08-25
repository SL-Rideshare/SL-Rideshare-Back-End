const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { VehicleController } = require("../controllers");

router.get("/:user_id", verifyToken, VehicleController.getAllVehiclesByUserId);
router.get("/:id", verifyToken, VehicleController.getVehicleById);
router.put("/:id", verifyToken, VehicleController.updateVehicle);
router.delete("/:id", verifyToken, VehicleController.deleteVehicle);

module.exports = router;
