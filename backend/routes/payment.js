const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const auth = require("../middlewares/auth");

// ================== THANH TOÁN ==================
router.post("/", auth, async (req, res) => {
  const { ticket } = req.body;

  if (!ticket) {
    return res.status(400).json({ msg: "Thiếu ticket" });
  }

  try {
    const pool = await poolPromise;

    const check = await pool.request().input("ticket", ticket).query(`
        SELECT * FROM ParkingReservation
        WHERE ticket = @ticket AND status = 'PENDING'
      `);

    if (!check.recordset.length) {
      return res
        .status(400)
        .json({ msg: "Vé không hợp lệ hoặc đã thanh toán" });
    }

    await pool.request().input("ticket", ticket).query(`
        UPDATE ParkingReservation
        SET status = 'PAID'
        WHERE ticket = @ticket
      `);

    res.json({ msg: "Thanh toán thành công" });
  } catch (err) {
    console.error("❌ PAYMENT ERROR:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
