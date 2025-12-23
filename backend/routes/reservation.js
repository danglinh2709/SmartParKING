const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const { v4: uuidv4 } = require("uuid");
const auth = require("../middlewares/auth");

/* ================== ĐẶT CHỖ ================== */
router.post("/", auth, async (req, res) => {
  const { parking_lot_id, spot_number, start_time, end_time } = req.body;

  if (!parking_lot_id || !spot_number || !start_time || !end_time) {
    return res.status(400).json({ msg: "Thiếu dữ liệu đặt chỗ" });
  }

  try {
    const pool = await poolPromise;
    const ticket = "TICKET-" + uuidv4().slice(0, 8);
    const HOLD_MINUTES = 10;

    await pool
      .request()
      .input("ticket", ticket)
      .input("parking_lot_id", parking_lot_id)
      .input("spot_number", spot_number)
      .input("start_time", new Date(start_time))
      .input("end_time", new Date(end_time))
      .input("hold_expired_at", new Date(Date.now() + HOLD_MINUTES * 60000))
      .query(`
        INSERT INTO ParkingReservation (
        ticket, parking_lot_id, spot_number,
        start_time, end_time,
        hold_expired_at,
        status
      )
      VALUES (
        @ticket, @parking_lot_id, @spot_number,
        @start_time, @end_time,
        @hold_expired_at,
        'PENDING'
      )
      `);

    res.json({ ticket, hold_minutes: HOLD_MINUTES });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

/* ================== HẾT HẠN ================== */
router.post("/expire", async (req, res) => {
  const { ticket } = req.body;
  if (!ticket) return res.json({ msg: "OK" });

  const pool = await poolPromise;
  await pool.request().input("ticket", ticket).query(`
    UPDATE ParkingReservation
SET status = 'EXPIRED'
WHERE status = 'PENDING'
AND hold_expired_at < GETDATE();

  `);

  res.json({ msg: "Expired nếu còn pending" });
});

/* ================== HUỶ ================== */
router.post("/cancel", async (req, res) => {
  const { parking_lot_id, spot_number } = req.body;
  if (!parking_lot_id || !spot_number)
    return res.status(400).json({ msg: "Thiếu dữ liệu" });

  try {
    const pool = await poolPromise;

    const r = await pool
      .request()
      .input("parking_lot_id", parking_lot_id)
      .input("spot_number", spot_number).query(`
        SELECT status FROM ParkingReservation
        WHERE parking_lot_id = @parking_lot_id
          AND spot_number = @spot_number
      `);

    if (!r.recordset.length)
      return res.status(404).json({ msg: "Không tìm thấy chỗ" });

    if (!["PENDING", "PAID"].includes(r.recordset[0].status))
      return res.status(400).json({ msg: "Không thể huỷ" });

    await pool
      .request()
      .input("parking_lot_id", parking_lot_id)
      .input("spot_number", spot_number).query(`
        DELETE FROM ParkingReservation
        WHERE parking_lot_id = @parking_lot_id
          AND spot_number = @spot_number
      `);

    res.json({ msg: "Huỷ thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
