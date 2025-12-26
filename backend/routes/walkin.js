const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const auth = require("../middlewares/auth");

router.post("/", auth, async (req, res) => {
  const { parking_lot_id, plate_front } = req.body;

  const ticket = "ONSITE-" + Date.now();

  const pool = await poolPromise;

  await pool
    .request()
    .input("ticket", ticket)
    .input("lot", parking_lot_id)
    .input("plate", plate_front).query(`
      INSERT INTO ParkingSession
      (ticket_code, parking_lot_id, plate_front, source, status)
      VALUES (@ticket, @lot, @plate, 'ONSITE', 'IN')
    `);

  res.json({ ticket });
});

module.exports = router;
