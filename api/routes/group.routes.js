const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { GroupController } = require("../controllers");

router.get("/:name", verifyToken, GroupController.getGroup);
router.get("/user/:id", verifyToken, GroupController.getUserGroups);
router.post("/", verifyToken, GroupController.createGroup);
router.put(
  "/request/:name/:user_id",
  verifyToken,
  GroupController.sendGroupRequest
);
router.put(
  "/accept/:group_id/:user_id",
  verifyToken,
  GroupController.acceptGroupRequest
);
router.put(
  "/reject/:group_id/:user_id",
  verifyToken,
  GroupController.rejectGroupRequest
);
router.put(
  "/remove/:group_id/:user_id",
  verifyToken,
  GroupController.removeGroupMember
);
router.put(
  "/leave/:group_id/:user_id",
  verifyToken,
  GroupController.leaveGroup
);
router.put("/image/:group_id", verifyToken, GroupController.updateImage);
router.delete("/:id", verifyToken, GroupController.deleteGroup);

module.exports = router;
