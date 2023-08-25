const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { PaymentController } = require("../controllers");

router.post(
  "/scheduleDrive",
  verifyToken,
  PaymentController.scheduleDrivePayment
);

module.exports = router;
