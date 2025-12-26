const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const { v4: uuidv4 } = require("uuid");
const auth = require("../middlewares/auth");

// ================== ĐẶT CHỖ ==================
router.post("/", auth, async (req, res) => {
  const { parking_lot_id, spot_number, start_time, end_time, hours } = req.body;

  const hoursNum = parseInt(hours, 10);

  if (
    !parking_lot_id ||
    !spot_number ||
    !start_time ||
    !end_time ||
    !Number.isInteger(hoursNum) ||
    hoursNum <= 0
  ) {
    return res.status(400).json({ msg: "Dữ liệu đặt chỗ không hợp lệ" });
  }

  try {
    const pool = await poolPromise;

    // XÓA VÉ HẾT HẠN
    await pool.request().query(`
  DELETE FROM ParkingReservation
  WHERE status = 'PENDING'
    AND expired_at < GETDATE()
`);

    const check = await pool
      .request()
      .input("parking_lot_id", parking_lot_id)
      .input("spot_number", spot_number).query(`
    SELECT 1
    FROM ParkingReservation
    WHERE parking_lot_id = @parking_lot_id
      AND spot_number = @spot_number
      AND status IN ('PENDING','PAID','PARKING')
  `);

    if (check.recordset.length) {
      return res.status(400).json({ msg: "Chỗ đã được đặt" });
    }

    const ticket = "TICKET-" + uuidv4().slice(0, 8);
    const startTimeSQL = start_time.replace("T", " ");
    const endTimeSQL = end_time.replace("T", " ");
    await pool
      .request()
      .input("ticket", ticket)
      .input("parking_lot_id", parking_lot_id)
      .input("spot_number", spot_number)
      .input("start_time", startTimeSQL)
      .input("end_time", endTimeSQL)
      .input("hours", hoursNum).query(`
    INSERT INTO ParkingReservation
    (ticket, parking_lot_id, spot_number,
     start_time, end_time, hours,
     status, expired_at)
    VALUES
    (@ticket, @parking_lot_id, @spot_number,
     @start_time, @end_time, @hours,
     'PENDING', DATEADD(MINUTE, 10, GETDATE()))
  `);
    await pool.request().input("id", parking_lot_id).query(`
    UPDATE ParkingLot
    SET available_spots = available_spots - 1
    WHERE id = @id
  `);

    req.app.get("io")?.emit("spot-updated", {
      parking_lot_id,
      spot_number,
      status: "PENDING",
    });

    res.json({ ticket, expires_in: 600 });
  } catch (err) {
    console.error("reservation error:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

// HUỶ ĐẶT CHỖ SAU KHI THANH TOÁN
router.post("/cancel", auth, async (req, res) => {
  const { parking_lot_id, spot_number } = req.body;

  if (!parking_lot_id || !spot_number) {
    return res.status(400).json({ msg: "Thiếu dữ liệu" });
  }

  try {
    const pool = await poolPromise;

    // Chỉ cho huỷ PENDING hoặc PAID
    const check = await pool
      .request()
      .input("parking_lot_id", parking_lot_id)
      .input("spot_number", spot_number).query(`
        SELECT status 
        FROM ParkingReservation
        WHERE parking_lot_id = @parking_lot_id
          AND spot_number = @spot_number
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({ msg: "Không tìm thấy chỗ" });
    }

    const status = check.recordset[0].status;

    if (!["PENDING", "PAID"].includes(status)) {
      return res.status(400).json({ msg: "Không thể huỷ chỗ này" });
    }

    // Xoá đặt chỗ
    await pool
      .request()
      .input("parking_lot_id", parking_lot_id)
      .input("spot_number", spot_number).query(`
        DELETE FROM ParkingReservation
        WHERE parking_lot_id = @parking_lot_id
          AND spot_number = @spot_number
      `);
    await pool.request().input("id", parking_lot_id).query(`
    UPDATE ParkingLot
    SET available_spots = available_spots + 1
    WHERE id = @id
  `);

    // realtime
    const io = req.app.get("io");
    if (io) io.emit("spot-freed");

    res.json({ msg: "Huỷ đặt chỗ thành công" });
  } catch (err) {
    console.error("Lỗi huỷ đặt chỗ:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
