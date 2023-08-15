const router = require("express").Router();

const { UserController } = require("../controllers");

router.get("/:id", UserController.getRegistrationDetails);
router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.put("/register/:id", UserController.updateRegistration);
router.put("/register/startover/:id", UserController.startOver);
router.post("/resend-email", UserController.resendVerificationEmail);
router.post("/resend-otp", UserController.resendPhoneOTP);
router.get("/verify/:id/:token", UserController.verifyEmail);

module.exports = router;
