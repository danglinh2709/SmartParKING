const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const auth = require("../middlewares/auth");

// ================== THANH TOÁN ==================
router.post("/", auth, async (req, res) => {
  const { ticket, hours } = req.body;

  if (!ticket || !hours) {
    return res.status(400).json({ msg: "Thiếu ticket hoặc thời gian gửi xe" });
  }

  try {
    const pool = await poolPromise;

    // 1️⃣ Check vé hợp lệ (chỉ cho PENDING)
    const check = await pool.request().input("ticket", ticket).query(`
        SELECT id
        FROM ParkingReservation
        WHERE ticket = @ticket
          AND status = 'PENDING'
      `);

    if (!check.recordset.length) {
      return res
        .status(400)
        .json({ msg: "Vé không hợp lệ hoặc đã thanh toán" });
    }

    // 2️⃣ Chuyển sang PARKING + set thời gian hết hạn
    await pool.request().input("ticket", ticket).input("hours", hours).query(`
        UPDATE ParkingReservation
        SET status = 'PARKING',
            parking_expired_at = DATEADD(HOUR, @hours, GETDATE())
        WHERE ticket = @ticket
      `);

    res.json({ msg: "Thanh toán thành công" });
  } catch (err) {
    console.error("❌ PAYMENT ERROR:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
