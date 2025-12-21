const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");

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
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("parking_lot_id", req.params.id)
      .query(`
        SELECT spot_number, status
        FROM ParkingReservation
        WHERE parking_lot_id = @parking_lot_id
        AND status IN ('PENDING','PAID')
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
