const poolPromise = require("../models/db");

module.exports = async function handlePendingExpire(io) {
  const pool = await poolPromise;

  // 1️⃣ WARNING 30s
  const warning = await pool.request().query(`
    SELECT parking_lot_id, spot_number, expired_at
    FROM ParkingReservation
    WHERE status = 'PENDING'
      AND DATEDIFF(SECOND, GETDATE(), expired_at) BETWEEN 1 AND 30
  `);

  warning.recordset.forEach((r) => {
    io.emit("expire-warning", {
      parking_lot_id: r.parking_lot_id,
      spot_number: r.spot_number,
      expired_at: r.expired_at,
    });
  });

  // 2️⃣ EXPIRE
  const expired = await pool.request().query(`
    UPDATE ParkingReservation
    SET status = 'EXPIRED'
    OUTPUT deleted.parking_lot_id, deleted.spot_number
    WHERE status = 'PENDING'
      AND expired_at <= GETDATE()
  `);

  expired.recordset.forEach((r) => {
    io.emit("spot-expired", {
      parking_lot_id: r.parking_lot_id,
      spot_number: r.spot_number,
    });
  });
};
