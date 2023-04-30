const router = require("express").Router();

const { UserController } = require("../controllers");

router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/resend-email", UserController.resendVerificationEmail);
router.post("/resend-otp", UserController.resendPhoneOTP);
router.get("/verify/:id/:token", UserController.verifyEmail);

module.exports = router;
