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

    // 1️⃣ Lấy vé + bãi đỗ
    const result = await pool.request().input("ticket", ticket).query(`
        SELECT parking_lot_id
        FROM ParkingReservation
        WHERE ticket = @ticket
          AND status = 'PENDING'
      `);

    if (!result.recordset.length) {
      return res.status(400).json({
        msg: "Vé không hợp lệ hoặc đã thanh toán",
      });
    }

    const parkingLotId = result.recordset[0].parking_lot_id;

    // 2️⃣ Đổi vé sang PAID
    await pool.request().input("ticket", ticket).query(`
        UPDATE ParkingReservation
        SET status = 'PAID'
        WHERE ticket = @ticket
      `);

    // 3️⃣ 🔥 TRỪ CHỖ NGAY KHI THANH TOÁN
    await pool.request().input("id", parkingLotId).query(`
        UPDATE ParkingLot
        SET available_spots = available_spots - 1
        WHERE id = @id
          AND available_spots > 0
      `);

    res.json({ msg: "Thanh toán thành công" });
  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
