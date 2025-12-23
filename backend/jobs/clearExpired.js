const poolPromise = require("../models/db");

module.exports = async function clearExpired(io) {
  try {
    const pool = await poolPromise;
    const expired = await pool.request().query(`
      UPDATE ParkingReservation
      SET status = 'EXPIRED'
      OUTPUT inserted.parking_lot_id, inserted.spot_number
      WHERE status = 'PENDING'
        AND expired_at < GETDATE()
    `);

    if (expired.recordset.length > 0) {
      console.log("🧹 Pending expired:", expired.recordset);

      expired.recordset.forEach((r) => {
        io.emit("spot-expired", {
          parking_lot_id: r.parking_lot_id,
          spot_number: r.spot_number,
        });
      });
    }
  } catch (err) {
    console.error("❌ clearExpired error:", err);
  }
};
