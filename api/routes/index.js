const router = require("express").Router();

const UserRouter = require("./user.routes");
const GroupRouter = require("./group.routes");
const FavouriteRouter = require("./favouriteRoute.routes");

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

module.exports = router;
