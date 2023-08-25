const crypto = require("crypto");

const { User, DriveRequest, ScheduledDrive } = require("../models");

const getPassengerRequests = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const passengerRequests = await DriveRequest.find({ from: user_id })
      .populate({
        path: "schedule",
      })
      .exec();
    res.status(200).json(passengerRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getDriverRequests = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const driverRequests = await DriveRequest.find()
      .populate({
        path: "schedule",
        match: { created_by: user_id },
        select: "_id created_by",
      })
      .exec();

    const filteredDriverRequests = driverRequests.filter(
      (request) => request.schedule !== null
    );

    res.status(200).json(filteredDriverRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createRequest = async (req, res) => {
  const {
    schedule,
    from,
    goods_is_kilo,
    goods_availability,
    goods_receiver_ref_code,
    passengers_availability,
    cost,
  } = req.body;

  try {
    const existingRequest = await DriveRequest.findOne({ schedule });
    const scheduleDrive = await ScheduledDrive.findById(schedule);

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A request for this drive already exists" });
    }

    if (scheduleDrive.cancelled) {
      return res
        .status(400)
        .json({ message: "Cannot request since drive is cancelled" });
    }

    if (scheduleDrive.stop_new_requests) {
      return res.status(400).json({
        message: "Cannot request since driver is not accepting new requests",
      });
    }

    if (
      (goods_availability || passengers_availability) &&
      !goods_availability &&
      !passengers_availability
    ) {
      return res.status(400).json({
        message: "Either goods or passengers availability should be provided",
      });
    }

    if (
      goods_availability &&
      !goods_receiver_ref_code &&
      !passengers_availability
    ) {
      return res.status(400).json({
        message: "Goods availability requires goods_receiver_ref_code",
      });
    }

    if (goods_receiver_ref_code) {
      const receiverUser = await User.findOne({
        ref_code: goods_receiver_ref_code,
      });
      if (!receiverUser) {
        return res
          .status(400)
          .json({ message: "Invalid goods_receiver_ref_code" });
      }
    }

    const start_code = crypto.randomInt(100000, 999999);
    const end_code = crypto.randomInt(100000, 999999);

    const newRequest = new DriveRequest({
      schedule,
      from,
      start_code,
      end_code,
      goods_is_kilo,
      goods_availability,
      goods_receiver_ref_code,
      passengers_availability,
      cost,
    });

    const savedRequest = await newRequest.save();
    res.status(200).json(savedRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const acceptOrRejectRequest = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const driveRequest = await DriveRequest.findById(id);

    if (!driveRequest) {
      return res.status(404).json({ message: "Drive request not found" });
    }

    if (
      driveRequest.status === "ACCEPTED" ||
      driveRequest.status === "REJECTED" ||
      driveRequest.status === "CANCELLED"
    ) {
      return res.status(404).json({
        message: "Drive request already accepted, rejected or cancelled",
      });
    }

    driveRequest.status = status;
    await driveRequest.save();

    res.status(200).json(driveRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const startScanRequest = async (req, res) => {
  const id = req.params.id;

  const { user_id, start_code } = req.body;

  try {
    const driveRequest = await DriveRequest.findById(id);

    if (!driveRequest) {
      return res.status(404).json({ message: "Drive request not found" });
    }

    if (driveRequest.start_code !== start_code) {
      return res.status(400).json({ message: "Invalid start code" });
    }

    if (driveRequest.from.toString() !== user_id) {
      return res
        .status(400)
        .json({ message: "Unauthorized to start scan for this request" });
    }

    if (driveRequest.status !== "ACCEPTED") {
      return res.status(400).json({ message: "Request is not accepted" });
    }

    driveRequest.start_scanned = true;
    await driveRequest.save();

    res.status(200).json(driveRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const endScanRequest = async (req, res) => {
  const id = req.params.id;

  const { user_id, goods_receiver_ref_code, end_code, cost } = req.body;

  try {
    const driveRequest = await DriveRequest.findById(id);

    if (!driveRequest) {
      return res.status(404).json({ message: "Drive request not found" });
    }

    if (driveRequest.end_code !== end_code) {
      return res.status(400).json({ message: "Invalid end code" });
    }

    if (!driveRequest.start_scanned) {
      return res
        .status(400)
        .json({ message: "Request was not scanned at the start" });
    }

    if (goods_receiver_ref_code) {
      const receiverUser = await User.findOne({
        ref_code: goods_receiver_ref_code,
      });

      if (!receiverUser) {
        return res
          .status(400)
          .json({ message: "Invalid goods_receiver_ref_code" });
      }

      if (receiverUser._id.toString() !== user_id) {
        return res
          .status(400)
          .json({ message: "Unauthorized to end scan for this request" });
      }
    } else {
      if (driveRequest.from.toString() !== user_id) {
        return res
          .status(400)
          .json({ message: "Unauthorized to end scan for this request" });
      }
    }

    if (driveRequest.status !== "ACCEPTED") {
      return res.status(400).json({ message: "Request is not accepted" });
    }

    driveRequest.end_scanned = true;
    driveRequest.cost = cost;
    await driveRequest.save();

    res.status(200).json(driveRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const cancelRequest = async (req, res) => {
  const id = req.params.id;

  const { cancellation_reason } = req.body;

  try {
    const driveRequest = await DriveRequest.findById(id);

    if (!driveRequest) {
      return res.status(404).json({ message: "Drive request not found" });
    }

    driveRequest.cancellation_reason = cancellation_reason;
    driveRequest.status = "CANCELLED";
    await driveRequest.save();

    res.status(200).json(driveRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteRequest = async (req, res) => {
  const id = req.params.id;

  try {
    const driveRequest = await DriveRequest.findById(id);

    if (!driveRequest) {
      return res.status(404).json({ message: "Drive request not found" });
    }

    if (driveRequest.status === "ACCEPTED") {
      return res
        .status(400)
        .json({ message: "Cannot delete an accepted drive request" });
    }

    await driveRequest.remove();
    res.status(200).json({ message: "Drive request deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPassengerRequests,
  getDriverRequests,
  createRequest,
  acceptOrRejectRequest,
  startScanRequest,
  endScanRequest,
  cancelRequest,
  deleteRequest,
};
