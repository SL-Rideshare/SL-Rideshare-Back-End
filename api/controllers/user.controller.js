var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var moment = require("moment");

const User = require("../models/user.model");

const login = async (req, res) => {
  const { username, password } = req.body;

  User.findOne({
    username: username,
  }).exec((err, user) => {
    if (err) {
      return res.status(500).send({ data: err });
    }

    if (!user) {
      return res.status(404).send({ data: "User not found." });
    }

    var passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        access_token: null,
        data: "Invalid credentials.",
      });
    }

    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400,
    });

    return res.status(200).send({ ...user, access_token: token });
  });
};

const register = async (req, res) => {
  const states = [
    "INIT",
    "PENDING_NIC_VERIFICATION",
    "PENDING_DATA",
    "PENDING_EMAIL_VERIFICATION",
    "PENDING_PHONE_VERIFICATION",
    "PENDING_REF",
    "END",
  ];

  const user = req.body;
  const userFound = await getUserByKey({ _id: user.id });

  if (userFound) {
    switch (states.indexOf(userFound.reg_state)) {
      case 0:
        return res
          .status(500)
          .send({ data: "Conflict found in database, contact admin." });
      case 1:
        if (!user.nic) {
          return res
            .status(204)
            .send({ data: "Couldn't identify NIC number." });
        } else {
          getUserByKey({ nic: user.nic })
            .then((user) => {
              User.findByIdAndUpdate(user.id, {
                reg_state: "PENDING_DATA",
              })
                .then(() => {
                  return res
                    .status(200)
                    .send({ data: "NIC successfully verified." });
                })
                .catch((err) => {
                  return res
                    .status(400)
                    .send({ data: "Unable to update user.", err: err });
                });
            })
            .then((res) => {
              return res.status(404).send({
                data: "Captured NIC number doesn't match with the one you provided.",
              });
            });
        }
        break;
      case 2:
        let usernameFound = user.username
          ? await getUserByKey({ username: user.username })
          : false;

        let emailFound = user.email
          ? await getUserByKey({ email: user.email })
          : false;

        if (user.first_name && user.last_name && user.nic && user.dob) {
          if (!user.username || user.username.length < 6) {
            return res
              .status(204)
              .send({ data: "A valid username is required." });
          } else if (usernameFound) {
            return res.status(204).send({ data: "Username already in use." });
          } else if (
            !user.email ||
            !user.email.match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
          ) {
            return res.status(204).send({ data: "A valid email is required." });
          } else if (emailFound) {
            return res.status(204).send({ data: "Email already in use." });
          } else if (!user.phoneNumber || user.phoneNumber < 9) {
            return res
              .status(204)
              .send({ data: "A valid phone number is required." });
          } else if (!user.postalCode || user.postalCode < 6) {
            return res
              .status(204)
              .send({ data: "A valid postal code is required." });
          } else if (!user.password || user.password.length < 6) {
            return res
              .status(204)
              .send({ data: "A valid password is required." });
          } else if (!user.confirmPassword) {
            return res
              .status(204)
              .send({ data: "Password confirmation is required." });
          } else if (user.password !== user.confirmPassword) {
            return res.status(204).send({ data: "Passwords don't match." });
          } else {
            let token = Math.floor(100000 + Math.random() * 900000);

            user = {
              ...user,
              password: bcrypt.hashSync(req.body.password, 8),
              confirmPassword: null,
              email_confirmation_code: token,
              email_confirmation_code_timestamp:
                moment().format("DD/MM/YYYY HH:mm"),
              reg_state: "PENDING_EMAIL_VERIFICATION",
            };

            User.findByIdAndUpdate(user.id, {
              ...user,
            })
              .then((user) => {
                return res.status(200).send({ data: user });
              })
              .catch((err) => {
                return res
                  .status(400)
                  .send({ data: "Unable to update user.", err: err });
              });
          }
        } else {
          return res
            .status(204)
            .send({ data: "Missing previous data key values." });
        }
        break;
      case 3:
        var { code, id } = user;

        getUserByKey({ email_confirmation_code: code, _id: id })
          .then((user) => {
            if (
              moment().diff(
                moment(
                  user.email_confirmation_code_timestamp,
                  "DD/MM/YYYY HH:mm"
                ),
                "minutes"
              ) > 30
            ) {
              return res
                .status(400)
                .send({ data: "Confirmation code expired." });
            } else {
              var token = Math.floor(1000 + Math.random() * 9000);

              User.findByIdAndUpdate(id, {
                reg_state: "PENDING_PHONE_VERIFICATION",
                phone_confirmation_code: token,
                phone_confirmation_code_timestamp:
                  moment().format("DD/MM/YYYY HH:mm"),
              })
                .then(() => {
                  return res
                    .status(200)
                    .send({ data: "Email successfully verified." });
                })
                .catch((err) => {
                  return res
                    .status(400)
                    .send({ data: "Unable to update user.", err: err });
                });
            }
          })
          .catch((err) => {
            return res
              .status(400)
              .send({ data: "Invalid verification code.", err: err });
          });
        break;
      case 4:
        var { code, id } = user;

        getUserByKey({ phone_confirmation_code: code, _id: id })
          .then((user) => {
            if (
              moment().diff(
                moment(
                  user.phone_confirmation_code_timestamp,
                  "DD/MM/YYYY HH:mm"
                ),
                "minutes"
              ) > 30
            ) {
              return res
                .status(400)
                .send({ data: "Confirmation code expired." });
            } else {
              User.findByIdAndUpdate(id, {
                reg_state: "PENDING_REF",
              })
                .then(() => {
                  return res
                    .status(200)
                    .send({ data: "Phone number successfully verified." });
                })
                .catch((err) => {
                  return res
                    .status(400)
                    .send({ data: "Unable to update user.", err: err });
                });
            }
          })
          .catch((err) => {
            return res
              .status(400)
              .send({ data: "Invalid verification code.", err: err });
          });
        break;
      case 5:
        var { id, refName, refId } = user;

        if (!refName) {
          return res
            .status(204)
            .send({ data: "A valid referee name is required." });
        } else if (!refId) {
          return res
            .status(204)
            .send({ data: "A valid referee id is required." });
        }
        // TODO: Check for valid ref_id here
        else {
          User.findByIdAndUpdate(id, {
            reg_state: "END",
            ref_name: refName,
            ref_id: refId,
            recommended: false,
            under_review: true,
          })
            .then(() => {
              return res.status(200).send({ data: "Succesfully registered." });
            })
            .catch((err) => {
              return res
                .status(400)
                .send({ data: "Unable to update user.", err: err });
            });
        }
        break;
      case 6:
        return res.status(500).send({ data: "Already registered." });
      default:
        return res.status(500).send({ data: "Invalid register state found." });
    }
  } else {
    if (!user.firstName || !/[a-z]/i.test(user.firstName)) {
      return res.status(204).send({ data: "A valid first name is required." });
    } else if (!user.lastName || !/[a-z]/i.test(user.lastName)) {
      return res.status(204).send({ data: "A valid last name is required." });
    } else if (!user.nic || user.nic.length < 9) {
      return res.status(204).send({ data: "A valid NIC is required." });
    } else if (!user.dob) {
      return res.status(204).send({ data: "Date of birth is required." });
    } else if (moment().diff(moment(user.dob, "DD/MM/YYYY"), "years") < 16) {
      return res
        .status(204)
        .send({ data: "You must be at least 16 years of age." });
    } else if (getDobFromNic(user.nic, user.nic.length === 12)) {
      return res.status(204).send({
        data: "Date of birth in NIC doesn't match with the provided one.",
      });
    } else if (!user.imei || user.imei.length < 15) {
      return res.status(204).send({ data: "A valid IMEI is required." });
    } else {
      User.create({ ...user, reg_state: "PENDING_NIC_VERIFICATION" })
        .then((user) => {
          return res.status(200).send({ data: user });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ data: "Unable to create user.", err: err });
        });
    }
  }
};

const getUserByKey = async (key) => {
  await User.findOne(key)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

const getDobFromNic = (nic, isNewId) => {
  var year,
    days = "";

  if (isNewId) {
    year = nic.substring(0, 4);
    days = parseInt(nic.substring(4, 7));
  } else {
    year = "19" + nic.substring(0, 2);
    days = parseInt(nic.substring(2, 5));
  }

  return moment()
    .year(year)
    .dayOfYear(moment([parseInt(year)]).isLeapYear() ? days : days - 1)
    .format("DD/MM/YYYY");
};

module.exports = {
  login,
  register,
};
