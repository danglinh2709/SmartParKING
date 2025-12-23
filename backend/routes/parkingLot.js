const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const authMiddleware = require("../middlewares/auth");
//GET /api/parking-lots/staff
router.get("/staff", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const pool = await poolPromise;
    const result = await pool.request().input("userId", userId).query(`
        SELECT pl.id, pl.name, pl.total_spots, pl.image_url
        FROM ParkingLot pl
        JOIN ParkingLotStaff pls ON pls.parking_lot_id = pl.id
        WHERE pls.user_id = @userId AND pls.is_active = 1
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ msg: "Lỗi server" });
  }
});

// GET /api/parking-lots
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
          id,
          name,
          total_spots,
          available_spots,
          image_url,
          lat,
          lng
        FROM ParkingLot

    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

// GET /api/parking-lots/:id/spot-status
router.get("/:id/spot-status", async (req, res) => {
  const pool = await poolPromise;

  const result = await pool.request().input("parking_lot_id", req.params.id)
    .query(`
      SELECT
  spot_number,
  status,
  expired_at
FROM ParkingReservation
WHERE parking_lot_id = @parking_lot_id
  AND status IN ('PENDING','PAID')

    `);

  res.json(result.recordset);
});

module.exports = router;
