const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const auth = require("../middlewares/auth");
const { recognizePlateFromImage } = require("../services/plate.service");
const { normalizePlate } = require("../utils/plate.util");
const { saveBase64Image } = require("../utils/image.util");

/* ================== LẤY BÃI STAFF QUẢN LÝ ================== */
router.get("/parking-lots", auth, async (req, res) => {
  if (req.user.role !== "staff") {
    return res.status(403).json({ msg: "Không có quyền" });
  }

  const pool = await poolPromise;
  const result = await pool.request().input("user_id", req.user.id).query(`
      SELECT pl.id, pl.name, pl.total_spots, pl.image_url
      FROM ParkingLot pl
      JOIN ParkingLotStaff pls ON pls.parking_lot_id = pl.id
      WHERE pls.user_id = @user_id AND pls.is_active = 1
    `);

  res.json(result.recordset);
});

/* ================== VERIFY ACCESS CODE ================== */
router.post("/verify-access", auth, async (req, res) => {
  const { parking_lot_id, access_code } = req.body;

  const pool = await poolPromise;
  const check = await pool
    .request()
    .input("user_id", req.user.id)
    .input("parking_lot_id", parking_lot_id)
    .input("access_code", access_code).query(`
      SELECT 1 FROM ParkingLotStaff
      WHERE user_id=@user_id
        AND parking_lot_id=@parking_lot_id
        AND access_code=@access_code
        AND is_active=1
    `);

  if (!check.recordset.length) {
    return res.status(403).json({ msg: "Mã quản lý không đúng" });
  }

  res.json({ msg: "OK" });
});

/* ================== VERIFY TICKET ================== */
router.post("/verify-ticket", auth, async (req, res) => {
  const { ticket, parking_lot_id } = req.body;

  if (!ticket || !parking_lot_id) {
    return res.status(400).json({ msg: "Thiếu dữ liệu" });
  }

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("ticket", ticket)
    .input("parking_lot_id", parking_lot_id).query(`
      SELECT 
        pr.ticket,
        pr.license_plate,   
        pr.spot_number,
        pr.start_time,
        pr.end_time,
        pl.name AS parking_name
      FROM ParkingReservation pr
      JOIN ParkingLot pl ON pl.id = pr.parking_lot_id
      WHERE pr.ticket = @ticket
        AND pr.parking_lot_id = @parking_lot_id
        AND pr.status = 'PAID'
        AND (pr.used = 0 OR pr.used IS NULL)
        AND DATEADD(HOUR,7,GETUTCDATE())
            BETWEEN pr.start_time AND pr.end_time
    `);

  if (!result.recordset.length) {
    return res.status(400).json({
      msg: "Vé không hợp lệ hoặc ngoài thời gian gửi",
    });
  }

  res.json(result.recordset[0]);
});

module.exports = router;
