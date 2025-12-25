module.exports = async function expireParking(io, pool) {
  // console.log("⏳ expireParking job tick");
  try {
    const expired = await pool.request().query(`
      SELECT ticket, parking_lot_id, spot_number
      FROM ParkingReservation
      WHERE status = 'PARKING'
        AND parking_expired_at < GETDATE()
    `);

    if (!expired.recordset.length) return;

    await pool.request().query(`
      UPDATE ParkingReservation
      SET status = 'EXPIRED'
      WHERE status = 'PARKING'
        AND parking_expired_at < GETDATE()
    `);

    if (io) {
      io.emit("spot-freed", expired.recordset);
    }

    console.log("🚗 Hết giờ đỗ, giải phóng:", expired.recordset);
  } catch (err) {
    console.error("❌ expireParking job error:", err);
  }
};
