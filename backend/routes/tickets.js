const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");

/* ================== XÁC THỰC VÉ ================== */
router.post("/verify", async (req, res) => {
  const { ticket } = req.body;

  if (!ticket) {
    return res.status(400).json({ msg: "Thiếu ticket" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request().input("ticket", ticket).query(`
  SELECT status, parking_expired_at
  FROM ParkingReservation
  WHERE ticket = @ticket
`);

    const { status, parking_expired_at } = result.recordset[0];

    if (status === "PENDING") {
      return res.status(400).json({ msg: "❌ Vé chưa thanh toán" });
    }

    if (
      status === "EXPIRED" ||
      (parking_expired_at && new Date(parking_expired_at) < new Date())
    ) {
      return res.status(400).json({ msg: "❌ Vé đã hết hạn" });
    }

    res.json({ msg: "✅ Vé hợp lệ", status });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

/* ================== LẤY THÔNG TIN VÉ ================== */
router.get("/:ticket", async (req, res) => {
  const { ticket } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request().input("ticket", ticket).query(`
      SELECT 
        pr.ticket,
        pr.spot_number,
        pr.created_at,
        pr.parking_expired_at AS expired_at,
        pr.status,
        pl.name AS parking_name
      FROM ParkingReservation pr
      JOIN ParkingLot pl ON pr.parking_lot_id = pl.id
      WHERE pr.ticket = @ticket
        AND pr.status IN ('PARKING', 'PAID', 'EXPIRED')
    `);

    if (!result.recordset.length) {
      return res.status(404).json({ msg: "Không tìm thấy thông tin vé" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ GET TICKET ERROR:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

module.exports = router;
