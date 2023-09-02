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
    $or: [
      { created_by: id },
      { members: { $in: [id] } },
      { requests: { $in: [id] } },
    ],
  })
    .populate("created_by", "id_ first_name last_name")
    .populate("members", "_id first_name last_name")
    .populate("requests", "_id first_name last_name")
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
      members: [user_id],
    });

    await group.save();
    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const sendGroupRequest = async (req, res) => {
  const { name, user_id } = req.params;

  if (!name || !user_id) {
    return res.status(400).send({ msg: "Content not found" });
  }

  try {
    const group = await Group.findOne({ name });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (group.members.includes(user_id)) {
      return res
        .status(400)
        .json({ message: "User is already a member of the group" });
    }

    if (group.requests.includes(user_id)) {
      return res
        .status(400)
        .json({ message: "User has already sent a request" });
    }

    group.requests.push(user_id);
    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const acceptGroupRequest = async (req, res) => {
  const { group_id, user_id } = req.params;

  if (!group_id || !user_id) {
    return res.status(400).send({ msg: "Content not found" });
  }

  try {
    const group = await Group.findById(group_id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRequestIndex = group.requests.indexOf(user_id);

    if (userRequestIndex === -1) {
      return res.status(404).json({ message: "User request not found" });
    }

    if (!group.members.includes(user_id)) {
      group.members.push(user_id);
    }

    group.requests.splice(userRequestIndex, 1);

    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const rejectGroupRequest = async (req, res) => {
  const { group_id, user_id } = req.params;

  if (!group_id || !user_id) {
    return res.status(400).send({ msg: "Content not found" });
  }

  try {
    const group = await Group.findById(group_id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRequestIndex = group.requests.indexOf(user_id);

    if (userRequestIndex === -1) {
      return res.status(404).json({ message: "User request not found" });
    }

    group.requests.splice(userRequestIndex, 1);

    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const removeGroupMember = async (req, res) => {
  const { group_id, user_id } = req.params;

  if (!group_id || !user_id) {
    return res.status(400).send({ msg: "Content not found" });
  }

  try {
    const group = await Group.findById(group_id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRequestIndex = group.members.indexOf(user_id);

    if (userRequestIndex === -1) {
      return res.status(404).json({ message: "User request not found" });
    }

    group.members.splice(userRequestIndex, 1);

    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateImage = async (req, res) => {
  const { group_id } = req.params;

  if (!group_id) {
    return res.status(400).send({ msg: "Content not found" });
  }

  try {
    const group = await Group.findById(group_id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.img_url = req.body.img_url;
    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const leaveGroup = async (req, res) => {
  const { group_id, user_id } = req.params;

  if (!group_id || !user_id) {
    return res.status(400).send({ msg: "Content not found" });
  }

  try {
    const group = await Group.findById(group_id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!group.members.includes(user_id)) {
      return res.status(404).json({ message: "Not a member" });
    }

    const updatedMembers = group.members.filter(
      (memberId) => memberId.toString() !== user_id
    );
    group.members = updatedMembers;
    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getGroup,
  getUserGroups,
  createGroup,
  sendGroupRequest,
  acceptGroupRequest,
  rejectGroupRequest,
  removeGroupMember,
  leaveGroup,
  updateImage,
  deleteGroup,
};
