// backend/jobs/expireParking.js
const poolPromise = require("../models/db");

module.exports = async function expireParking(io) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, parking_lot_id, spot_number
      FROM ParkingReservation
      WHERE status = 'PAID'
        AND expired_at < GETDATE()
    `);

    for (const r of result.recordset) {
      await pool.request().input("id", r.id).query(`
          UPDATE ParkingReservation
          SET status = 'EXPIRED'
          WHERE id = @id
        `);

      io.emit("spot-expired", {
        parking_lot_id: r.parking_lot_id,
        spot_number: r.spot_number,
      });
    }
  } catch (err) {
    console.error("❌ expireParking error:", err);
  }
};
