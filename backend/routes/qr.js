const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");

router.post("/verify", async (req, res) => {
  const { ticket } = req.body;

  if (!ticket) {
    return res.status(400).json({ msg: "Thiếu ticket" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request().input("ticket", ticket).query(`
        SELECT status, expired_at
        FROM ParkingReservation
        WHERE ticket = @ticket
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ msg: "❌ Vé không tồn tại" });
    }

    const { status, expired_at } = result.recordset[0];

    if (status === "PAID") {
      return res.status(400).json({ msg: "❌ Vé đã thanh toán (QR hết hạn)" });
    }

    if (new Date(expired_at) < new Date()) {
      return res.status(400).json({ msg: "❌ Vé đã hết hạn" });
    }

    res.json({
      msg: "✅ Vé hợp lệ",
      status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
