const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

module.exports = async function sendVerifyMail(to, otp) {
  await transporter.sendMail({
    from: `"Smart Parking" <${process.env.MAIL_USER}>`,
    to,
    subject: "Xác thực tài khoản Smart Parking",
    html: `
      <h2>Chào mừng bạn đến Smart Parking</h2>
      <p>Mã xác thực của bạn là:</p>
      <h1 style="letter-spacing:6px">${otp}</h1>
      <p>Mã có hiệu lực trong 10 phút.</p>
    `,
  });
};
