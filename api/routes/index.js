const router = require("express").Router();

const UserRouter = require("./user.routes");

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.use("/user", UserRouter);

module.exports = router;
