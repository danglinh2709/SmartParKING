module.exports = async function expireParking(io, pool) {
  try {
    const result = await pool.request().query(`
      SELECT ticket, parking_lot_id, spot_number
      FROM ParkingReservation
      WHERE status = 'PAID'
        AND end_time <= GETDATE()
    `);

    for (const r of result.recordset) {
      await pool.request().input("ticket", r.ticket).query(`
          UPDATE ParkingReservation
          SET status = 'EXPIRED'
          WHERE ticket = @ticket
        `);

      io.emit("spot-freed", {
        parking_lot_id: r.parking_lot_id,
        spot_number: r.spot_number,
      });
    }
  } catch (err) {
    console.error("expireParking job error:", err);
  }
};
