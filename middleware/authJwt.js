const jwt = require("jsonwebtoken");
const config = require("../config/auth.js");
const { User } = require("../api/models");

verifyToken = (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(403).send({ data: "Token wasn't found." });
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ data: "Not authorized to access endpoint." });
    }
    req.user_id = decoded.id;

    const user = await User.findById(req.user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    next();
  });
};

const authJwt = {
  verifyToken,
};

module.exports = authJwt;
