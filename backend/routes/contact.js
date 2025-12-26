const express = require("express");
const router = express.Router();
const sql = require("mssql");
const poolPromise = require("../models/db");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  const { firstName, lastName, email, phone, subject, message } = req.body;

  if (!firstName || !email || !message) {
    return res.status(400).json({ msg: "Thiếu thông tin bắt buộc" });
  }

  const fullName = `${firstName} ${lastName || ""}`.trim();

  try {
    const pool = await poolPromise;

    /* ===== 1️⃣ LƯU VÀO DATABASE ===== */
    await pool
      .request()
      .input("name", sql.NVarChar, fullName)
      .input("email", sql.NVarChar, email)
      .input("phone", sql.NVarChar, phone || null)
      .input("subject", sql.NVarChar, subject || null)
      .input("message", sql.NVarChar, message).query(`
        INSERT INTO ContactMessage
        (name, email, phone, subject, message)
        VALUES
        (@name, @email, @phone, @subject, @message)
      `);

    /* ===== 2️⃣ GỬI EMAIL THÔNG BÁO (GIỮ NGUYÊN) ===== */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Smart Parking Contact" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `[CONTACT] ${subject || "No Subject"}`,
      html: `
        <h3>📩 Liên hệ mới</h3>
        <p><b>Họ tên:</b> ${fullName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>SĐT:</b> ${phone || "Không có"}</p>
        <hr/>
        <p>${message}</p>
      `,
    });

    res.json({ msg: "Gửi liên hệ thành công" });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
