const express = require("express");
const router = express.Router();
const sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const poolPromise = require("../models/db");
require("dotenv").config();
const sendVerifyMail = require("../utils/sendMail");

// REGISTER
// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const pool = await poolPromise;

    // 1️⃣ Check email tồn tại
    const check = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT 1 FROM Users WHERE Email=@email");

    if (check.recordset.length) {
      return res.status(400).json({ msg: "Email đã tồn tại" });
    }

    // 2️⃣ Hash mật khẩu
    const hash = await bcrypt.hash(password, 10);

    // 3️⃣ Tạo OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // 4️⃣ Lưu user (CHƯA xác thực)
    await pool
      .request()
      .input("fullName", sql.NVarChar, fullName)
      .input("email", sql.NVarChar, email)
      .input("phone", sql.NVarChar, phone)
      .input("password", sql.NVarChar, hash)
      .input("role", sql.NVarChar, role)
      .input("otp", sql.VarChar, otp)
      .input("expiredAt", sql.DateTime, expiredAt).query(`
        INSERT INTO Users
        (FullName, Email, Phone, PasswordHash, Role, EmailVerified, EmailOTP, EmailOTPExpiredAt)
        VALUES
        (@fullName, @email, @phone, @password, @role, 0, @otp, @expiredAt)
      `);

    // 5️⃣ Gửi email
    await sendVerifyMail(email, otp);

    res.json({
      msg: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});
// VERIFY EMAIL
router.post("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .input("otp", sql.VarChar, otp).query(`
        SELECT UserID, EmailOTPExpiredAt
        FROM Users
        WHERE Email=@email AND EmailOTP=@otp
      `);

    if (!result.recordset.length) {
      return res.status(400).json({ msg: "Mã xác thực không đúng" });
    }

    if (new Date(result.recordset[0].EmailOTPExpiredAt) < new Date()) {
      return res.status(400).json({ msg: "Mã đã hết hạn" });
    }

    await pool.request().input("email", sql.NVarChar, email).query(`
        UPDATE Users
        SET EmailVerified=1, EmailOTP=NULL, EmailOTPExpiredAt=NULL
        WHERE Email=@email
      `);

    res.json({ msg: "Xác thực email thành công" });
  } catch (err) {
    res.status(500).json({ msg: "Lỗi server" });
  }
});
// RESEND OTP
router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body;
    const pool = await poolPromise;

    const user = await pool.request().input("email", sql.NVarChar, email)
      .query(`
        SELECT EmailVerified
        FROM Users
        WHERE Email=@email
      `);

    if (!user.recordset.length) {
      return res.status(400).json({ msg: "Email không tồn tại" });
    }

    if (user.recordset[0].EmailVerified) {
      return res.status(400).json({ msg: "Email đã được xác thực" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool
      .request()
      .input("email", sql.NVarChar, email)
      .input("otp", sql.VarChar, otp)
      .input("expiredAt", sql.DateTime, expiredAt).query(`
        UPDATE Users
        SET EmailOTP=@otp,
            EmailOTPExpiredAt=@expiredAt
        WHERE Email=@email
      `);

    await sendVerifyMail(email, otp);

    res.json({ msg: "Đã gửi lại mã xác thực" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const pool = await poolPromise;

    const result = await pool.request().input("id", sql.NVarChar, loginId)
      .query(`
        SELECT TOP 1 *
        FROM Users
        WHERE Email=@id OR Phone=@id
      `);

    if (!result.recordset.length) {
      return res.status(401).json({ msg: "Sai tài khoản hoặc mật khẩu" });
    }

    const user = result.recordset[0];
    const ok = await bcrypt.compare(password, user.PasswordHash);

    if (!ok) {
      return res.status(401).json({ msg: "Sai tài khoản hoặc mật khẩu" });
    }

    const token = jwt.sign(
      { id: user.UserID, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      role: user.Role,
      fullName: user.FullName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
});
module.exports = router;
