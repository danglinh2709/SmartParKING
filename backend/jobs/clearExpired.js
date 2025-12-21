const poolPromise = require("../models/db");

module.exports = async function clearExpired(io) {
  try {
    const pool = await poolPromise;

    const expired = await pool.request().query(`
      DELETE FROM ParkingReservation
      OUTPUT deleted.parking_lot_id, deleted.spot_number
      WHERE status = 'PENDING'
      AND expired_at < GETDATE()
    `);

    if (expired.recordset.length > 0) {
      console.log("🧹 Hết hạn, giải phóng:", expired.recordset);

      // 🔔 BẮN SOCKET REALTIME
      if (io) {
        io.emit("spot-freed", expired.recordset);
      }
    }
  } catch (err) {
    console.error("❌ clearExpired error:", err);
  }
};
