const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");

// CHO XE RA BÃI
router.post("/check-out", async (req, res) => {
  const { ticket } = req.body;

  try {
    const pool = await poolPromise;

    // 1. Tìm session đang gửi
    const sessionResult = await pool
      .request()
      .input("ticket", ticket)
      .query(`
        SELECT *
        FROM ParkingSession
        WHERE ticket = @ticket
          AND status = 'IN'
      `);

    if (sessionResult.recordset.length === 0) {
      return res.status(400).json({ msg: "Không tìm thấy xe trong bãi" });
    }

    const session = sessionResult.recordset[0];

    // 2. Tính tiền
    const timeIn = new Date(session.time_in);
    const timeOut = new Date();
    const hours = Math.ceil((timeOut - timeIn) / (1000 * 60 * 60));
    const fee = hours * 5000;

    // 3. Cập nhật session
    await pool
      .request()
      .input("ticket", ticket)
      .input("fee", fee)
      .query(`
        UPDATE ParkingSession
        SET time_out = GETDATE(),
            status = 'OUT',
            fee = @fee
        WHERE ticket = @ticket
          AND status = 'IN'
      `);

    res.json({
      msg: "Cho xe ra bãi thành công",
      fee,
    });
  } catch (err) {
    console.error("CHECK-OUT ERROR:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
