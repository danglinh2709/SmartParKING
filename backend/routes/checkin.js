const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const auth = require("../middlewares/auth");

router.post("/", auth, async (req, res) => {
  const { ticket_code, parking_lot_id, plate_front } = req.body;

  try {
    const pool = await poolPromise;

    // 1. Kiểm tra xe đang trong bãi chưa
    const exists = await pool.request().input("plate", plate_front).query(`
        SELECT 1 FROM ParkingSession
        WHERE plate_front=@plate AND status='IN'
      `);

    if (exists.recordset.length)
      return res.status(400).json({ msg: "Xe đã trong bãi" });

    // 2. Tạo session
    await pool
      .request()
      .input("ticket", ticket_code)
      .input("lot", parking_lot_id)
      .input("plate", plate_front).query(`
        INSERT INTO ParkingSession
        (ticket_code, parking_lot_id, plate_front, source, status)
        VALUES (@ticket, @lot, @plate, 'PREBOOK', 'IN')
      `);

    // 3. Đánh dấu vé
    await pool.request().input("ticket", ticket_code).query(`
        UPDATE ParkingReservation
        SET used = 1
        WHERE ticket=@ticket
      `);

    res.json({ msg: "Cho xe vào bãi thành công" });
  } catch {
    res.status(500).json({ msg: "Không cho xe vào được" });
  }
});

module.exports = router;
