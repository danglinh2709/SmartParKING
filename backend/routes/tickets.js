const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");

/* ================== XÁC THỰC VÉ ================== */
router.post("/verify", async (req, res) => {
  const { ticket, license_plate } = req.body;

  if (!ticket) {
    return res.status(400).json({ msg: "Thiếu ticket" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request().input("ticket", ticket).query(`
        SELECT status, parking_expired_at, license_plate
        FROM ParkingReservation
        WHERE ticket = @ticket
      `);

    // ✅ CHECK TỒN TẠI
    if (!result.recordset.length) {
      return res.status(404).json({ msg: "❌ Vé không tồn tại" });
    }

    const {
      status,
      parking_expired_at,
      license_plate: dbPlate,
    } = result.recordset[0];

    // ✅ CHECK THANH TOÁN
    if (status === "PENDING") {
      return res.status(400).json({ msg: "❌ Vé chưa thanh toán" });
    }

    // ✅ CHECK HẾT HẠN
    if (
      status === "EXPIRED" ||
      (parking_expired_at && new Date(parking_expired_at) < new Date())
    ) {
      return res.status(400).json({ msg: "❌ Vé đã hết hạn" });
    }

    // ✅ CHECK ĐÚNG XE
    if (license_plate && license_plate !== dbPlate) {
      return res.status(400).json({
        msg: "❌ Biển số xe không khớp với vé",
      });
    }

    res.json({
      msg: "✅ Vé hợp lệ",
      status,
    });
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
     pr.license_plate, 
    CONVERT(varchar, pr.start_time, 126) AS start_time,
  CONVERT(varchar, pr.end_time, 126)   AS end_time,
      
    pr.status,
    pl.name AS parking_name
  FROM ParkingReservation pr
  JOIN ParkingLot pl ON pr.parking_lot_id = pl.id
  WHERE pr.ticket = @ticket
    AND pr.status IN ('PENDING', 'PAID', 'PARKING', 'EXPIRED')
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
