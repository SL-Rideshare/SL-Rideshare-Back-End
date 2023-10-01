const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { ScheduleDriveController } = require("../controllers");

router.get("/:user_id", verifyToken, ScheduleDriveController.getDrives);
router.post("/search", verifyToken, ScheduleDriveController.searchDrives);
router.post(
  "/:user_id",
  verifyToken,
  ScheduleDriveController.createScheduleDrive
);
router.put("/cancel/:id", verifyToken, ScheduleDriveController.cancelDrive);
router.put("/stop/:id", verifyToken, ScheduleDriveController.stopNewRequests);
router.delete("/:id", verifyToken, ScheduleDriveController.deleteDrive);

module.exports = router;
