const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { DriveRequestController } = require("../controllers");

router.get(
  "/passenger/:user_id",
  verifyToken,
  DriveRequestController.getPassengerRequests
);
router.get(
  "/driver/:user_id",
  verifyToken,
  DriveRequestController.getDriverRequests
);
router.post("/", verifyToken, DriveRequestController.createRequest);
router.put(
  "/status/:id",
  verifyToken,
  DriveRequestController.acceptOrRejectRequest
);
router.put(
  "/startscan/:id",
  verifyToken,
  DriveRequestController.startScanRequest
);
router.put("/endscan/:id", verifyToken, DriveRequestController.endScanRequest);
router.put("/cancel/:id", verifyToken, DriveRequestController.cancelRequest);
router.delete("/:id", verifyToken, DriveRequestController.deleteRequest);

module.exports = router;
