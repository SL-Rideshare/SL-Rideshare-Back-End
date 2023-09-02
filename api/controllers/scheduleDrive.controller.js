const { ScheduledDrive, DriveRequest, User } = require("../models");

const searchDrives = async (req, res) => {
  try {
    const {
      private,
      group_id,
      goods_is_kilo,
      goods_is_paid,
      goods_availability,
      goods_receiver_ref_code,
      passengers_is_paid,
      passengers_availability,
    } = req.body;

    let query = {
      cancelled: false,
      stop_new_requests: false,
    };

    if (private) {
      if (!group_id) {
        return res
          .status(400)
          .json({ message: "If private, group id must be provided" });
      }
      query.group = group_id;
    }

    if (goods_is_paid !== undefined) {
      if (
        goods_is_paid &&
        !goods_receiver_ref_code &&
        !passengers_availability
      ) {
        return res.status(400).json({
          message: "Goods is paid, goods_receiver_ref_code is missing",
        });
      }

      if (goods_is_paid && !passengers_availability) {
        const receiverUser = await User.findOne({
          ref_code: goods_receiver_ref_code,
        });
        if (!receiverUser) {
          return res
            .status(400)
            .json({ message: "Invalid goods_receiver_ref_code" });
        }
      }
    }

    query.$and = [
      {
        $or: [
          {
            $and: [
              { goods_is_paid: goods_is_paid },
              { goods_availability: { $gte: goods_availability || 0 } },
              { group: group_id },
            ],
          },
          { goods_is_paid: { $exists: false } },
        ],
      },
      {
        $or: [
          {
            $and: [
              { passengers_is_paid: passengers_is_paid },
              {
                passengers_availability: {
                  $gte: passengers_availability || 0,
                },
              },
              { group: group_id },
            ],
          },
          { passengers_is_paid: { $exists: false } },
        ],
      },
    ];

    const scheduledDrives = await ScheduledDrive.find(query);
    res.status(200).json(scheduledDrives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getDrives = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const scheduledDrives = await ScheduledDrive.find({ created_by: user_id });
    res.status(200).json(scheduledDrives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createScheduleDrive = async (req, res) => {
  const {
    user_id,
    private,
    group,
    goods_is_paid,
    goods_is_kilo,
    goods_availability,
    goods_fee_first_five,
    goods_fee_additional,
    passengers_is_paid,
    passengers_availability,
    passengers_fee,
    passengers_fee_additional,
    start_date,
    points,
  } = req.body;

  try {
    if (private && !group) {
      return res
        .status(400)
        .json({ message: "If private, group id must be provided" });
    }

    if (goods_is_paid) {
      if (
        !goods_is_kilo ||
        !goods_availability ||
        !goods_fee_first_five ||
        !goods_fee_additional
      ) {
        return res
          .status(400)
          .json({ message: "Goods payment details are required" });
      }
    } else if (!goods_availability) {
      return res
        .status(400)
        .json({ message: "Goods availability is required" });
    }

    if (passengers_is_paid) {
      if (
        !passengers_availability ||
        !passengers_fee ||
        !passengers_fee_additional
      ) {
        return res
          .status(400)
          .json({ message: "Passengers payment details are required" });
      }
    } else if (!passengers_availability) {
      return res
        .status(400)
        .json({ message: "Passengers availability is required" });
    }

    const newScheduledDrive = new ScheduledDrive({
      created_by: user_id,
      private,
      group,
      goods_is_paid,
      goods_is_kilo,
      goods_availability,
      goods_fee_first_five,
      goods_fee_additional,
      passengers_is_paid,
      passengers_availability,
      passengers_fee,
      passengers_fee_additional,
      start_date,
      points,
    });

    const savedScheduledDrive = await newScheduledDrive.save();
    res.status(200).json(savedScheduledDrive);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const cancelDrive = async (req, res) => {
  const id = req.params.id;

  const { cancellation_reason } = req.body;

  try {
    const scheduledDrive = await ScheduledDrive.findById(id);

    if (!scheduledDrive) {
      return res.status(404).json({ message: "Scheduled drive not found" });
    }

    scheduledDrive.cancellation_reason = cancellation_reason;
    scheduledDrive.cancelled = true;
    await scheduledDrive.save();

    res.status(200).json(scheduledDrive);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const stopNewRequests = async (req, res) => {
  const id = req.params.id;

  const { stop } = req.body;

  try {
    const scheduledDrive = await ScheduledDrive.findById(id);

    if (!scheduledDrive) {
      return res.status(404).json({ message: "Scheduled drive not found" });
    }

    scheduledDrive.stop_new_requests = stop;
    await scheduledDrive.save();

    res.status(200).json(scheduledDrive);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteDrive = async (req, res) => {
  const id = req.params.id;

  try {
    const relatedDriveRequests = await DriveRequest.find({ schedule: id });

    if (relatedDriveRequests.length > 0) {
      return res.status(400).json({
        message: "Cannot delete a scheduled drive with requests",
      });
    }

    const scheduledDrive = await ScheduledDrive.findById(id);

    if (!scheduledDrive) {
      return res.status(404).json({ message: "Scheduled drive not found" });
    }

    await scheduledDrive.remove();

    res.status(200).json({ message: "Scheduled drive deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  searchDrives,
  getDrives,
  stopNewRequests,
  createScheduleDrive,
  cancelDrive,
  deleteDrive,
};
