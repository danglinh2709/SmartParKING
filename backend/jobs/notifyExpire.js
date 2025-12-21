module.exports = async (io, pool) => {
  try {
    const result = await pool.request().query(`
      SELECT ticket
      FROM ParkingReservation
      WHERE status = 'PAID'
      AND DATEDIFF(minute, GETDATE(), expired_at) BETWEEN 0 AND 10
    `);

    result.recordset.forEach((r) => {
      io.emit("expire-warning", r.ticket);
    });
  } catch (err) {
    console.error("❌ Lỗi notifyExpire:", err);
  }
};
