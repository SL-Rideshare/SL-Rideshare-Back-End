var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var moment = require("moment");
var crypto = require("crypto");

const sendEmail = require("../../utils/transporter.util");

const User = require("../models/user.model");
const Token = require("../models/token.model");

const Nexmo = require("nexmo");

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API,
  apiSecret: process.env.NEXMO_SECRET,
});

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
  const userFound = await getUserById(user.id);

  if (userFound) {
    switch (states.indexOf(userFound.reg_state)) {
      case 0:
        return res
          .status(500)
          .send({ data: "Conflict found in database, contact admin." });
      case 1:
        if (!user.captured_nic) {
          return res
            .status(400)
            .send({ data: "Couldn't identify NIC number." });
        } else if (userFound.nic !== user.captured_nic) {
          return res.status(400).send({ data: "NIC numbers didn't match." });
        } else {
          User.findOneAndUpdate(user.id, {
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
        }
        break;
      case 2:
        let usernameFound =
          user.username && (await getUserByKey({ username: user.username }));
        let emailFound =
          user.email && (await getUserByKey({ email: user.email }));
        let phoneNumberFound =
          user.contact_number &&
          (await getUserByKey({ contact_number: user.contact_number }));
        if (user.first_name && user.last_name && user.nic && user.dob) {
          if (
            !user.username ||
            user.username.length < 6 ||
            !user.username.match(/^[a-zA-Z0-9]+$/)
          ) {
            return res
              .status(400)
              .send({ data: "A valid username is required." });
          } else if (usernameFound) {
            return res.status(400).send({ data: "Username already in use." });
          } else if (
            !user.email ||
            !user.email.match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
          ) {
            return res.status(400).send({ data: "A valid email is required." });
          } else if (emailFound) {
            return res.status(400).send({ data: "Email already in use." });
          } else if (
            !user.contact_number ||
            user.contact_number.length !== 10
          ) {
            return res
              .status(400)
              .send({ data: "A valid phone number is required." });
          } else if (phoneNumberFound) {
            return res
              .status(400)
              .send({ data: "Phone number already in use." });
          } else if (!user.postal_code || user.postal_code.length !== 5) {
            return res
              .status(400)
              .send({ data: "A valid postal code is required." });
          } else if (
            !user.password ||
            !user.password.match(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
            )
          ) {
            return res
              .status(400)
              .send({ data: "A valid password is required." });
          } else if (!user.confirm_password) {
            return res
              .status(400)
              .send({ data: "Password confirmation is required." });
          } else if (user.password !== user.confirm_password) {
            return res.status(400).send({ data: "Passwords don't match." });
          } else {
            User.findOneAndUpdate(user.id, {
              ...user,
              dob: moment(user.dob, "DD/MM/YYYY").toDate(),
              password: bcrypt.hashSync(req.body.password, 8),
              confirm_password: null,
            })
              .then(() => {
                Token.create({
                  user_id: user.id,
                  token: crypto.randomBytes(32).toString("hex"),
                  created_at: moment().toDate(),
                })
                  .then(async (token) => {
                    const message = `${process.env.BASE_URL}/user/verify/${user.id}/${token.token}`;
                    await sendEmail(user.email, "Verify Email", message)
                      .then(() => {
                        User.findOneAndUpdate(user.id, {
                          reg_state: "PENDING_EMAIL_VERIFICATION",
                        })
                          .then(() => {
                            return res.status(200).send({
                              data: "Email verification link sent to your email.",
                            });
                          })
                          .catch((err) => {
                            return res.status(400).send({
                              data: "Unable to update user.",
                              err: err,
                            });
                          });
                      })
                      .catch(async (err) => {
                        await Token.findOneAndDelete({ _id: token._id });

                        return res.status(400).send({
                          data: "Couldn't send verification email",
                          err: err,
                        });
                      });
                  })
                  .catch((err) => {
                    return res.status(400).send({
                      data: "Couldn't create token.",
                      err: err,
                    });
                  });
              })
              .catch((err) => {
                return res
                  .status(400)
                  .send({ data: "Unable to update user.", err: err });
              });
          }
        } else {
          return res
            .status(400)
            .send({ data: "Missing previous data key values." });
        }
        break;
      case 3:
        if (userFound.email_verified) {
          const otp = crypto.randomInt(100000, 999999);
          Token.create({
            user_id: user._id,
            token: otp,
          })
            .then(async (token) => {
              nexmo.message.sendSms(
                process.env.NEXMO_VIRTUAL_NUMBER,
                user.contact_number,
                `Your OTP is ${otp}`,
                async (err, responseData) => {
                  if (err) {
                    await Token.findOneAndDelete({ _id: token._id });

                    return res
                      .status(400)
                      .send({ data: "Unable to send OTP", err: err });
                  } else {
                    return res.status(200).send({
                      data: "OTP sent to your phone number.",
                      response: responseData,
                    });
                  }
                }
              );
            })
            .catch((err) => {
              return res
                .status(400)
                .send({ data: "Unable to create token.", err: err });
            });
        } else {
          User.findOneAndUpdate(user.id, {
            email_verified: false,
            reg_state: "PENDING_EMAIL_VERIFICATION",
          })
            .then(() => {
              return res.status(400).send({ data: "Email not verified." });
            })
            .catch((err) => {
              return res
                .status(400)
                .send({ data: "Unable to update user.", err: err });
            });
        }
        break;
      case 4:
        var { id, otp } = user;

        verifyPhoneNumber(id, otp)
          .then((res) => {
            if (res.code === 200) {
              return res
                .status(200)
                .send({ data: "Phone verified successfully." });
            } else {
              return res
                .status(400)
                .send({ data: "An error occured when verifiying." });
            }
          })
          .catch((err) => {
            return res.status(400).send({ data: err.data, err: err.err });
          });

        break;
      case 5:
        var { id, refName, refId } = user;

        if (!refName) {
          return res
            .status(400)
            .send({ data: "A valid referee name is required." });
        } else if (!refId) {
          return res
            .status(400)
            .send({ data: "A valid referee id is required." });
        }

        // TODO: Check for valid ref_id here
        else {
          User.findOneAndUpdate(id, {
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
    let imeiFound = user.imei && (await getUserByKey({ imei: user.imei }));

    if (!user.first_name || !/^[A-Za-z]*$/i.test(user.first_name)) {
      return res.status(400).send({ data: "A valid first name is required." });
    } else if (!user.last_name || !/^[A-Za-z]*$/i.test(user.last_name)) {
      return res.status(400).send({ data: "A valid last name is required." });
    } else if (!user.nic || user.nic.length < 9 || user.nic.length > 12) {
      return res.status(400).send({ data: "A valid NIC format is required." });
    } else if (!validNicFormat(user.nic)) {
      return res.status(400).send({
        data: "A valid NIC format is required (You must be within ages 18 and 80 as well)",
      });
    } else if (!user.dob || !moment(user.dob, "DD/MM/YYYY", true).isValid()) {
      return res
        .status(400)
        .send({ data: "A valid date of birth is required." });
    } else if (moment().diff(moment(user.dob, "DD/MM/YYYY"), "years") < 18) {
      return res
        .status(400)
        .send({ data: "You must be at least 18 years of age." });
    } else if (
      !moment(
        getDobFromNic(user.nic, user.nic.length === 12),
        "DD/MM/YYYY"
      ).isSame(moment(user.dob, "DD/MM/YYYY"))
    ) {
      return res.status(400).send({
        data: "Date of birth in NIC doesn't match with the provided one.",
      });
    } else if (!user.imei || user.imei.length !== 15) {
      return res.status(400).send({ data: "A valid IMEI is required." });
    } else if (imeiFound) {
      return res.status(400).send({ data: "IMEI already in use." });
    } else {
      User.create({
        ...user,
        dob: moment(user.dob, "DD/MM/YYYY").toDate(),
        reg_state: "PENDING_NIC_VERIFICATION",
      })
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

const verifyEmail = async (req, res) => {
  getUserById({ _id: req.body.id })
    .then(async (user) => {
      await Token.findOne({
        user_id: user._id,
        token: req.params.token,
      })
        .then(async (token) => {
          if (token) {
            User.findOneAndUpdate(user._id, {
              email_verified: true,
              reg_state: "PENDING_PHONE_VERIFICATION",
            }).then(async () => {
              await Token.findByIdAndRemove(token._id)
                .then(() => {
                  return res
                    .status(200)
                    .send({ data: "Email verified successfully." });
                })
                .catch((err) => {
                  return res
                    .status(400)
                    .send({ data: "Unable to update user.", err: err });
                });
            });
          } else {
            return res.status(400).send({
              data: "Verification link is invalid or expired.",
              err: err,
            });
          }
        })
        .catch((err) => {
          return res.status(400).send({
            data: "Verification link is invalid or expired.",
            err: err,
          });
        });
    })
    .catch((err) => {
      return res.status(400).send({ data: "User wasn't found.", err: err });
    });
};

const resendVerificationEmail = async (req, res) => {
  getUserById({ _id: req.params.id })
    .then(async (user) => {
      const token = await Token.findOne({ user_id: user._id });

      const allowResend =
        moment().diff(moment(token.created_at), "minutes") < 2;

      if (token) {
        await Token.findByIdAndRemove(token._id);
      }

      if (allowResend) {
        Token.create({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        })
          .then(async (token) => {
            const message = `${process.env.BASE_URL}/user/verify/${user._id}/${token.token}`;
            await sendEmail(user.email, "Verify Email", message);
            return res.status(200).send({
              data: "Email verification link sent to your email.",
            });
          })
          .catch((err) => {
            return res
              .status(400)
              .send({ data: "Unable to create token.", err: err });
          });
      } else {
        return res.status(400).send({
          data: "Please wait at least 2 minutes before trying again.",
        });
      }
    })
    .catch((err) => {
      return res.status(400).send({ data: "User wasn't found.", err: err });
    });
};

const verifyPhoneNumber = (id, otp) => {
  return new Promise(async (resolve, reject) => {
    await getUserById({ _id: id })
      .then(async (user) => {
        await Token.findOne({
          user_id: user._id,
          token: otp,
        })
          .then(async (token) => {
            if (token) {
              if (moment().diff(moment(token.created_at), "minutes") < 15) {
                User.findOneAndUpdate(user._id, {
                  phone_verified: true,
                  reg_state: "PENDING_REF",
                }).then(async () => {
                  await Token.findByIdAndRemove(token._id)
                    .then(() => {
                      resolve({
                        code: 200,
                        data: "Phone verified successfully.",
                      });
                    })
                    .catch((err) => {
                      reject({ data: "Unable to update user.", err: err });
                    });
                });
              } else {
                reject({ data: "OTP is expired, try again." });
              }
            } else {
              reject({ data: "OTP is incorrect." });
            }
          })
          .catch((err) => {
            reject({
              data: "Verification link is invalid or expired.",
              err: err,
            });
          });
      })
      .catch((err) => {
        reject({
          data: "User wasn't found.",
          err: err,
        });
      });
  });
};

const resendPhoneOTP = async (req, res) => {
  getUserById({ _id: req.body.id })
    .then(async (user) => {
      const token = await Token.findOne({ user_id: user._id });

      const allowResend =
        moment().diff(moment(token.created_at), "minutes") < 2;

      if (token) {
        await Token.findByIdAndRemove(token._id);
      }

      if (allowResend) {
        const otp = crypto.randomInt(100000, 999999);

        Token.create({
          user_id: user._id,
          token: otp,
        })
          .then(async () => {
            nexmo.message.sendSms(
              process.env.NEXMO_VIRTUAL_NUMBER,
              user.contact_number,
              `Your OTP is ${otp}`,
              (err, responseData) => {
                if (err) {
                  return res
                    .status(400)
                    .send({ data: "Unable to send OTP", err: err });
                } else {
                  return res.status(200).send({
                    data: "OTP sent to your phone number.",
                    response: responseData,
                  });
                }
              }
            );
          })
          .catch((err) => {
            return res
              .status(400)
              .send({ data: "Unable to create token.", err: err });
          });
      } else {
        return res.status(400).send({
          data: "Please wait at least 2 minutes before trying again.",
        });
      }
    })
    .catch((err) => {
      return res.status(400).send({ data: "Couldn't fetch user.", err: err });
    });
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

const getUserById = async (id) => {
  return new Promise((resolve, reject) =>
    User.findById(id)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      })
  );
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

const validNicFormat = (nic) => {
  /** TODO */

  // if (nic.length === 10) {
  //   return /^([5-9]\d|10\d|11\d|12\d)(0(0[1-9]|[1-9]\d)|[1-2]\d{2}|3[0-5]\d|366|50[1-9]|8[0-6][1-6])\d{4}[Vv]$/.test(
  //     nic
  //   );
  // } else if (nic.length === 12) {
  //   return /^(19[5-9]\d|20\d[0-5])(0(0[1-9]|[1-9]\d)|[5-7]\d{2}|8[0-6][1-6])0\d{4}$/.test(
  //     nic
  //   );
  // }

  return true;
};

module.exports = {
  login,
  register,
  verifyEmail,
  resendVerificationEmail,
  resendPhoneOTP,
};
