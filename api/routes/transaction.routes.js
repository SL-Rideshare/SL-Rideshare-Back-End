const router = require("express").Router();

const { verifyToken } = require("../../middleware/authJwt");

const { TransactionController } = require("../controllers");

router.post("/:user_id", verifyToken, TransactionController.getTransactions);

module.exports = router;
