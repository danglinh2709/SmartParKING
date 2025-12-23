const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const auth = require("../middlewares/auth");

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

  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("ticket", ticket)
    .input("parking_lot_id", parking_lot_id).query(`
      SELECT *
      FROM ParkingReservation
      WHERE ticket_code = @ticket
        AND parking_lot_id = @parking_lot_id
        AND status = 'PAID'
        AND used = 0
    `);

  if (!result.recordset.length) {
    return res
      .status(400)
      .json({ msg: "Vé không hợp lệ hoặc đã được sử dụng" });
  }

  res.json(result.recordset[0]);
});

/* ================== XE VÀO BÃI ================== */
router.post("/vehicle-entry", auth, async (req, res) => {
  const { reservation_id, image_base64 } = req.body;

  const pool = await poolPromise;

  // kiểm tra vé
  const check = await pool.request().input("id", reservation_id).query(`
      SELECT *
      FROM ParkingReservation
      WHERE id=@id AND status='PAID'
    `);

  if (!check.recordset.length) {
    return res.status(400).json({ msg: "Vé không hợp lệ" });
  }

  // cập nhật vé → đang sử dụng
  await pool.request().input("id", reservation_id).input("image", image_base64)
    .query(`
      UPDATE ParkingReservation
      SET status='IN_USE',
          entry_time=GETDATE(),
          entry_image=@image
      WHERE id=@id
    `);

  res.json({ msg: "Xe đã vào bãi" });
});

module.exports = router;
