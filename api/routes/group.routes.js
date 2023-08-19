const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { GroupController } = require("../controllers");

router.get("/:name", verifyToken, GroupController.getGroup);
router.get("/user/:id", verifyToken, GroupController.getUserGroups);
router.post("/", verifyToken, GroupController.createGroup);

module.exports = router;
