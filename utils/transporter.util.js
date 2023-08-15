const sgMail = require("@sendgrid/mail");

const sendEmail = async (email, subject, text) => {
  return new Promise(async (resolve, reject) => {
    try {
      sgMail.setApiKey(
        "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"
      );
      const msg = {
        to: email,
        from: "chamodnugekotuwa@gmail.com",
        subject: subject,
        text: text,
      };
      sgMail
        .send(msg)
        .then(() => {
          resolve({ data: "Email sent sucessfully." });
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      reject({ data: "Email failed to send", err: error });
    }
  });
};

module.exports = sendEmail;
