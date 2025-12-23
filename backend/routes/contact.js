const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  const { firstName, lastName, email, phone, subject, message } = req.body;

  if (!firstName || !email || !message) {
    return res.status(400).json({ msg: "Thiếu thông tin bắt buộc" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "danglinhloveu@gmail.com", // 🔐 Gmail tạo App Password
        pass: "ylyz dqjg avdd vezf", // 🔐 App Password
      },
    });

    const mailOptions = {
      from: `"Smart Parking Contact" <danglinhloveu@gmail.com>`, // ✅ BẮT BUỘC
      to: "danglinhloveu@gmail.com", // 📩 EMAIL NHẬN
      replyTo: email, // ✅ EMAIL NGƯỜI GỬI (BẤT KỲ)
      subject: `[CONTACT] ${subject || "No Subject"}`,
      html: `
        <h3>📩 Thông tin liên hệ mới</h3>
        <p><b>Họ tên:</b> ${firstName} ${lastName || ""}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>SĐT:</b> ${phone || "Không có"}</p>
        <p><b>Nội dung:</b></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: "Gửi email thành công" });
  } catch (err) {
    console.error("❌ Send mail error:", err);
    res.status(500).json({ msg: "Không gửi được email" });
  }
});

module.exports = router;
