const express = require("express");
const router = express.Router();
const sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const poolPromise = require("../models/db");
require("dotenv").config();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const pool = await poolPromise;

    const check = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT 1 FROM Users WHERE Email=@email");

    if (check.recordset.length) {
      return res.status(400).json({ msg: "Email đã tồn tại" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("fullName", sql.NVarChar, fullName)
      .input("email", sql.NVarChar, email)
      .input("phone", sql.NVarChar, phone)
      .input("password", sql.NVarChar, hash)
      .input("role", sql.NVarChar, role).query(`
        INSERT INTO Users (FullName, Email, Phone, PasswordHash, Role)
        VALUES (@fullName, @email, @phone, @password, @role)
      `);

    res.json({ msg: "Đăng ký thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
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
