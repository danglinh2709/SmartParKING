// backend/jobs/notifyExpire.js
module.exports = async (io, pool) => {
  try {
    const result = await pool.request().query(`
      SELECT parking_lot_id, spot_number, expired_at
      FROM ParkingReservation
      WHERE status = 'PAID'
        AND expired_at > GETDATE()
        AND expired_at <= DATEADD(SECOND, 30, GETDATE())
    `);

    result.recordset.forEach((r) => {
      io.emit("expire-warning", {
        parking_lot_id: r.parking_lot_id,
        spot_number: r.spot_number,
        expired_at: r.expired_at,
      });
    });
  } catch (err) {
    console.error("❌ notifyExpire error:", err);
  }
};
