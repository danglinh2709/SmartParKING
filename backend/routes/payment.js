const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");

router.post("/", async (req, res) => {
  const { ticket } = req.body;

  if (!ticket) {
    return res.status(400).json({ msg: "Thiếu ticket" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request().input("ticket", ticket).query(`
        UPDATE ParkingReservation
        SET status='PAID'
        WHERE ticket=@ticket
        AND status='PENDING'
        AND expired_at > GETDATE()
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(400).json({ msg: "Vé không hợp lệ hoặc đã hết hạn" });
    }

    // ✅ LẤY IO ĐÚNG CÁCH
    const io = req.app.get("io");

    if (io) {
      io.emit("spot-updated", {
        ticket,
        status: "PAID",
      });
    }

    res.json({ msg: "Thanh toán thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
