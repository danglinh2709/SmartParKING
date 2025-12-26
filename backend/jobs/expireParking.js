module.exports = async function expireParking(io, pool) {
  try {
    const rs = await pool.request().query(`
      DELETE FROM ParkingReservation
      OUTPUT deleted.parking_lot_id
      WHERE end_time <= DATEADD(MINUTE, -1, GETDATE())
        AND status IN ('PAID','PARKING')
    `);

    if (!rs.recordset.length) return;

    // Gom theo parking_lot_id
    const counter = {};
    for (const r of rs.recordset) {
      counter[r.parking_lot_id] = (counter[r.parking_lot_id] || 0) + 1;
    }

    // Update chính xác
    for (const lotId in counter) {
      await pool.request().input("id", lotId).input("n", counter[lotId]).query(`
          UPDATE ParkingLot
          SET available_spots = available_spots + @n
          WHERE id = @id
        `);
    }

    io?.emit("spot-freed", rs.recordset);
    console.log("🟢 Đã giải phóng & cập nhật bãi xe");
  } catch (err) {
    console.error("❌ expireParking error:", err);
  }
};
