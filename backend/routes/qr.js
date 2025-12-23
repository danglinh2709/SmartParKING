const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const auth = require("../middlewares/auth");

router.post("/verify", auth, async (req, res) => {
  const { ticket } = req.body;
  if (!ticket) return res.status(400).json({ msg: "Thiếu ticket" });

  const pool = await poolPromise;

  const r = await pool.request().input("ticket", ticket).query(`
    SELECT id, hold_expired_at
    FROM ParkingReservation
    WHERE ticket = @ticket
      AND status = 'PENDING'
      AND hold_expired_at > GETDATE()
  `);

  if (!r.recordset.length) {
    return res.status(400).json({ msg: "Vé không hợp lệ hoặc đã hết hạn" });
  }

  res.json({ ok: true });
});

module.exports = router;
