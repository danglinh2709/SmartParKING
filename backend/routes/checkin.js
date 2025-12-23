const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");

// CHO XE VÀO BÃI
router.post("/check-in", async (req, res) => {
  const { ticket, parking_lot_id, spot_number, vehicle_plate } = req.body;

  try {
    const pool = await poolPromise;

    // 1. Kiểm tra vé
    const ticketResult = await pool.request().input("ticket", ticket).query(`
        SELECT *
        FROM ParkingReservation
        WHERE ticket = @ticket
      `);

    if (ticketResult.recordset.length === 0) {
      return res.status(400).json({ msg: "Vé không tồn tại" });
    }

    const reservation = ticketResult.recordset[0];

    if (reservation.status !== "PAID") {
      return res.status(400).json({ msg: "Vé chưa thanh toán" });
    }

    if (reservation.used === 1) {
      return res.status(400).json({ msg: "Vé đã được sử dụng" });
    }

    // 2. Tạo session
    await pool
      .request()
      .input("ticket", ticket)
      .input("parking_lot_id", parking_lot_id)
      .input("spot_number", spot_number)
      .input("vehicle_plate", vehicle_plate || null).query(`
        INSERT INTO ParkingSession (
          ticket, parking_lot_id, spot_number,
          vehicle_plate, time_in, status
        )
        VALUES (
          @ticket, @parking_lot_id, @spot_number,
          @vehicle_plate, GETDATE(), 'IN'
        )
      `);

    // 3. Đánh dấu vé đã dùng
    await pool.request().input("ticket", ticket).query(`
        UPDATE ParkingReservation
        SET used = 1
        WHERE ticket = @ticket
      `);

    res.json({ msg: "Cho xe vào bãi thành công" });
  } catch (err) {
    console.error("CHECK-IN ERROR:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
