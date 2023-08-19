const { User, Group } = require("../models");

const getGroup = async (req, res) => {
  const name = req.params.name;

  if (!name) {
    return res.status(400).send({ msg: "Content not found" });
  }

  Group.findOne({ name })
    .populate("created_by", "first_name last_name")
    .populate("members", "first_name last_name")
    .populate("requests", "first_name last_name")
    .exec((err, group) => {
      if (err) {
        return res.status(400).send({ msg: err });
      }

      if (!group) {
        return res.status(404).send({ data: "Group not found." });
      }

      return res.status(200).send(group);
    });
};

const getUserGroups = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).send({ msg: "Content not found" });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  Group.find({
    $or: [{ created_by: id }, { members: { $in: [id] } }],
  })
    .populate("created_by", "first_name last_name")
    .populate("members", "first_name last_name")
    .populate("requests", "first_name last_name")
    .exec((err, groups) => {
      if (err) {
        return res.status(400).send({ msg: err });
      }

      if (!groups || groups.length === 0) {
        return res.status(404).send({ data: "No groups found." });
      }

      return res.status(200).send(groups);
    });
};

const createGroup = async (req, res) => {
  const { name, user_id } = req.body;

  if (!name || !user_id) {
    return res.status(400).send({ msg: "Content not found" });
  }

  try {
    const groupFound = await Group.findOne({ name });

    if (groupFound) {
      return res.status(404).json({ message: "Group name already exists" });
    }

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const group = new Group({
      name,
      created_by: user_id,
    });

    await group.save();
    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getGroup,
  getUserGroups,
  createGroup,
};
