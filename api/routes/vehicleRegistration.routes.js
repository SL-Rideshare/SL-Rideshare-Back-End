const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { VehicleRegistrationController } = require("../controllers");

router.get("/", verifyToken, VehicleRegistrationController.getAllRegistrations);
router.get(
  "/:id",
  verifyToken,
  VehicleRegistrationController.getRegistrationById
);
router.delete(
  "/:id",
  verifyToken,
  VehicleRegistrationController.deleteRegistration
);
router.put(
  "/:id",
  verifyToken,
  VehicleRegistrationController.updateRegistration
);
router.put(
  "/update-registration/:id",
  verifyToken,
  VehicleRegistrationController.approveOrRejectRegistration
);
router.post("/", verifyToken, VehicleRegistrationController.createRegistration);

module.exports = router;
