const router = require("express").Router();

const UserRouter = require("./user.routes");
const GroupRouter = require("./group.routes");
const FavouriteRouter = require("./favouriteRoute.routes");
const DriveRequestRouter = require("./driveRequest.routes");
const ScheduleDriveRouter = require("./scheduleDrive.routes");
const PaymentRouter = require("./payment.routes");
const TransactionRouter = require("./transaction.routes");
const VehicleRegistrationRouter = require("./vehicleRegistration.routes");
const VehicleRouter = require("./vehicle.routes");

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.use("/user", UserRouter);
router.use("/group", GroupRouter);
router.use("/favroutes", FavouriteRouter);
router.use("/drivereq", DriveRequestRouter);
router.use("/scheduledrive", ScheduleDriveRouter);
router.use("/payments", PaymentRouter);
router.use("/transactions", TransactionRouter);
router.use("/vehiclereg", VehicleRegistrationRouter);
router.use("/vehicle", VehicleRouter);

module.exports = router;
