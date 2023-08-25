const { User, DriveRequest, ScheduledDrive, Payment } = require("../models");

const FLAT_HIRE_FEE = 20;
const FIRST_FIVEHUNDRED_FEE = 0;
const SECOND_FIVEHUNDRED_FEE = 10;
const AFTER_SECONDFIVEHUNDRED_FEE = 20;

const scheduleDrivePayment = async (req, res) => {
  const { schedule, drive_request, cost, payee, payer, mode } = req.body;

  try {
    if (!schedule || !drive_request || !cost || !payee || !payer) {
      return res.status(404).json({ message: "Required content not found" });
    }

    const payeeUser = await User.findById(payee);
    const payerUser = await User.findById(payer);

    if (!payeeUser || !payerUser) {
      return res.status(404).json({ message: "Payee/payer not found" });
    }

    const scheduleDrive = await ScheduledDrive.findById(schedule);

    if (!scheduleDrive) {
      return res.status(404).json({ message: "Schedule drive not found" });
    }

    const driveRequest = await DriveRequest.findById(drive_request);

    if (!driveRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (driveRequest.schedule.toString() !== schedule) {
      return res.status(404).json({ message: "Schedule ids doesn't match" });
    }

    if (driveRequest.cost !== cost) {
      return res.status(404).json({ message: "Request costs doesn't match" });
    }

    if (driveRequest.from.toString() !== payer) {
      return res
        .status(404)
        .json({ message: "Payer and requested user ids don't match" });
    }

    if (scheduleDrive.created_by.toString() !== payee) {
      return res.status(404).json({
        message: "Payee and drive scheduled user ids don't match",
      });
    }

    let payeePayment, payerPayment;

    if (mode === "CASH") {
      payeeUser.credit_balance -= cost * (FLAT_HIRE_FEE / 100);

      const payeeDebitTransaction = new Transaction({
        description: "Fees",
        type: "DEBIT",
        amount: cost * (FLAT_HIRE_FEE / 100),
        user: payee._id,
      });

      await payeeDebitTransaction.save();
    } else if (mode === "WALLET") {
      const amount = cost - cost * (FLAT_HIRE_FEE / 100);

      payeeUser.credit_balance += amount;

      const payeeDebitTransaction = new Transaction({
        description: "Fees",
        type: "DEBIT",
        amount: cost * (FLAT_HIRE_FEE / 100),
        user: payee,
      });

      await payeeDebitTransaction.save();

      const payment = new Payment({
        mode: "SCHEDULE",
        amount,
        payee,
        payer,
        payment_mode: mode,
      });

      payeePayment = await payment.save();

      const payeeCreditTransaction = new Transaction({
        payeePayment,
        description: `Credit on schedule drive from: ${payerUser.ref_code}`,
        type: "CREDIT",
        amount: amount,
        user: payee,
      });

      await payeeCreditTransaction.save();
    }

    if (mode === "WALLET") {
      if (payerUser.credit_balance < cost) {
        let remaining_cost = cost - payerUser.credit_balance;
        let fees = 0;

        if (remaining_cost <= 500) {
          fees = (remaining_cost * FIRST_FIVEHUNDRED_FEE) / 100;
          remaining_cost += fees;
        } else {
          if (remaining_cost <= 1000) {
            fees = ((remaining_cost - 500) * SECOND_FIVEHUNDRED_FEE) / 100;
            remaining_cost +=
              ((remaining_cost - 500) * SECOND_FIVEHUNDRED_FEE) / 100;
          } else {
            fees =
              (500 * SECOND_FIVEHUNDRED_FEE) / 100 +
              ((remaining_cost - 1000) * AFTER_SECONDFIVEHUNDRED_FEE) / 100;
            remaining_cost +=
              (500 * SECOND_FIVEHUNDRED_FEE) / 100 +
              ((remaining_cost - 1000) * AFTER_SECONDFIVEHUNDRED_FEE) / 100;
          }
        }

        payerUser.credit_balance -= remaining_cost;
      }

      payerUser.credit_balance -= cost;

      const payment = new Payment({
        mode: "SCHEDULE",
        amount,
        payee,
        payer,
        payment_mode: mode,
      });

      payerPayment = await payment.save();

      const payeeDebitTransactionFees = new Transaction({
        payerPayment,
        description: "Fees",
        type: "DEBIT",
        amount: fees,
        user: payer,
      });

      await payeeDebitTransactionFees.save();

      const payeeDebitTransaction = new Transaction({
        payerPayment,
        description: `Debit on schedule drive to: ${payeeUser.ref_code}`,
        type: "DEBIT",
        amount: remaining_cost,
        user: payer,
      });

      await payeeDebitTransaction.save();
    }

    await payerUser.save();
    await payeeUser.save();

    res.status(200).json(payeePayment, payerPayment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  scheduleDrivePayment,
};
