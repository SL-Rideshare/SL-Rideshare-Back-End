const { Transaction } = require("../models");

const getTransactions = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const transactions = await Transaction.find({ user: user_id }).populate({
      path: "payment",
    });
    res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTransactions,
};
