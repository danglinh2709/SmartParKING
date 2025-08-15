const express = require("express");
const router = express.Router();
const sql = require("mssql");

// ⚙️ Cấu hình SQL Server
const dbConfig = {
  user: "smartparking_user",
  password: "123456",
  server: "localhost",
  database: "SmartParkingDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// 🚗 Lấy danh sách xe đang trong bãi
router.get("/", async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query("SELECT * FROM VehicleEntry");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi thêm xe vào bãi" });
  }
});

// 🚘 Thêm xe mới (khi xe vào bãi)
router.post("/in", async (req, res) => {
  try {
    console.log("Body nhận được:", req.body);

    const { licensePlate, parkingLotId, imageUrlEntry } = req.body;
    if (!licensePlate || !parkingLotId) {
      return res
        .status(400)
        .json({ error: "licensePlate và parkingLotId không được để trống" });
    }

    let pool = await sql.connect(dbConfig);

    // Kiểm tra bãi đỗ có tồn tại và còn chỗ trống không
    const lotCheck = await pool
      .request()
      .input("parkingLotId", sql.Int, parkingLotId)
      .query("SELECT * FROM ParkingLot WHERE id = @parkingLotId");

    if (lotCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Bãi đỗ xe không tồn tại" });
    }
    const parkingLot = lotCheck.recordset[0];
    if (parkingLot.available_spots <= 0) {
      return res.status(400).json({ error: "Bãi đỗ xe đã đầy" });
    }

    // Thêm xe vào VehicleEntry
    await pool
      .request()
      .input("license_plate", sql.NVarChar, licensePlate)
      .input("parking_lot_id", sql.Int, parkingLotId)
      .input("image_url_entry", sql.NVarChar, imageUrlEntry || null).query(`
        INSERT INTO VehicleEntry (license_plate, parking_lot_id, entry_time, parking_lot_status, image_url_entry)
        VALUES (@license_plate, @parking_lot_id, GETDATE(), 'occupied', @image_url_entry)
      `);

    // Cập nhật số chỗ trống
    await pool.request().input("parkingLotId", sql.Int, parkingLotId).query(`
        UPDATE ParkingLot
        SET available_spots = available_spots - 1
        WHERE id = @parkingLotId
      `);

    res.json({ message: "Xe đã vào bãi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi thêm xe vào bãi" });
  }
});

router.post("/out", async (req, res) => {
  try {
    const { licensePlate, imageUrlExit } = req.body;
    if (!licensePlate)
      return res
        .status(400)
        .json({ error: "licensePlate không được để trống" });

    let pool = await sql.connect(dbConfig);

    const vehicleCheck = await pool
      .request()
      .input("license_plate", sql.NVarChar, licensePlate)
      .query(
        "SELECT * FROM VehicleEntry WHERE license_plate = @license_plate AND exit_time IS NULL"
      );
    if (vehicleCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Xe không tồn tại hoặc đã ra bãi" });
    }

    const vehicle = vehicleCheck.recordset[0];
    const parkingLotId = vehicle.parking_lot_id;

    await pool
      .request()
      .input("id", sql.Int, vehicle.id)
      .input("exit_time", sql.DateTime, new Date())
      .input("parking_lot_status", sql.NVarChar, "available")
      .input("image_url_exit", sql.NVarChar, imageUrlExit || null).query(`
        UPDATE VehicleEntry
        SET exit_time = @exit_time,
            parking_lot_status = @parking_lot_status,
            image_url_exit = @image_url_exit
        WHERE id = @id
      `);

    // Cập nhật số chỗ trống
    await pool.request().input("parkingLotId", sql.Int, parkingLotId).query(`
        UPDATE ParkingLot
        SET available_spots = available_spots + 1
        WHERE id = @parkingLotId
    `);

    res.json({ message: "Xe đã rời bãi", fee: 0 }); // bạn có thể tính phí sau
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật xe ra bãi" });
  }
});

module.exports = router;
