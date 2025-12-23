const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const auth = require("../middlewares/auth");

router.post("/", auth, async (req, res) => {
  const { ticket } = req.body;
  if (!ticket) {
    return res.status(400).json({ msg: "Thiếu ticket" });
  }

  try {
    const pool = await poolPromise;

    // 1️⃣ Check vé còn hợp lệ để thanh toán
    const check = await pool.request().input("ticket", ticket).query(`
      SELECT id
      FROM ParkingReservation
      WHERE ticket = @ticket
AND status = 'PENDING'
AND hold_expired_at > GETDATE()

    `);

    if (!check.recordset.length) {
      return res.status(400).json({
        msg: "Vé không hợp lệ hoặc đã hết hạn",
      });
    }

    // 2️⃣ Update sang PAID
    await pool.request().input("ticket", ticket).query(`
      UPDATE ParkingReservation
      SET status = 'PAID',
          expired_at = NULL
      WHERE ticket = @ticket
    `);

    res.json({ msg: "Thanh toán thành công" });
  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
