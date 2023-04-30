const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        service: process.env.EMAIL_SERVICE,
        port: 587,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: text,
      });

      resolve({ data: "Email sent sucessfully." });
    } catch (error) {
      reject({ data: "Email failed to send", err: error });
    }
  });
};

module.exports = sendEmail;
