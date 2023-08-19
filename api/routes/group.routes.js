const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { GroupController } = require("../controllers");

router.get("/:name", verifyToken, GroupController.getGroup);
router.get("/user/:id", verifyToken, GroupController.getUserGroups);
router.post("/", verifyToken, GroupController.createGroup);
router.put(
  "/request/:group_id/:user_id",
  verifyToken,
  GroupController.sendGroupRequest
);
router.put(
  "/accept/:group_id/:user_id",
  verifyToken,
  GroupController.acceptGroupRequest
);
router.put(
  "/leave/:group_id/:user_id",
  verifyToken,
  GroupController.leaveGroup
);
router.delete("/:id", verifyToken, GroupController.deleteGroup);

module.exports = router;
