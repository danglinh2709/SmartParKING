const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const auth = require("../middlewares/auth");
const { recognizePlate } = require("../services/plate.service");
const { normalizePlate } = require("../utils/plate.util");
const { saveBase64Image } = require("../utils/image.util");

router.post("/", auth, async (req, res) => {
  const { ticket_code, parking_lot_id, image_front, image_back } = req.body;

  if (!image_front || !image_back) {
    return res.status(400).json({ msg: "Thiếu ảnh biển số" });
  }

  try {
    const pool = await poolPromise;

    /* 1️⃣ Lấy vé */
    const ticketRes = await pool
  .request()
  .input("ticket", ticket_code)
  .query(`
    SELECT ticket, license_plate, spot_number
    FROM ParkingReservation
    WHERE ticket=@ticket AND used=0
  `);


    if (!ticketRes.recordset.length) {
      return res.status(400).json({ msg: "Vé không hợp lệ" });
    }

const {
  license_plate,
  spot_number,
} = ticketRes.recordset[0];

const plateInTicket = normalizePlate(license_plate);

    /* 2️⃣ OCR */
    const [rawFront, rawBack] = await Promise.all([
      recognizePlate(image_front),
      recognizePlate(image_back),
    ]);

    const plateFront = normalizePlate(rawFront);
    const plateBack = normalizePlate(rawBack);

    /* 3️⃣ So khớp */
    const match =
      plateFront.includes(plateInTicket) ||
      plateInTicket.includes(plateFront) ||
      plateBack.includes(plateInTicket) ||
      plateInTicket.includes(plateBack);

    if (!match) {
      return res.status(400).json({
        msg: `Biển số không khớp (OCR: ${plateFront || plateBack})`,
      });
    }

    /* 4️⃣ Lưu ảnh */
    const today = new Date().toISOString().slice(0, 10);
    const frontPath = saveBase64Image(
      image_front,
      `parking/${today}`,
      `${ticket_code}_front`
    );
    const backPath = saveBase64Image(
      image_back,
      `parking/${today}`,
      `${ticket_code}_back`
    );

    /* 5️⃣ Tạo session */
    await pool
  .request()
  .input("ticket", ticket_code)
  .input("lot", parking_lot_id)
  .input("spot", spot_number) 
  .input("plate", plateInTicket)
  .input("front", frontPath)
  .input("back", backPath)
  .query(`
    INSERT INTO ParkingSession
    (
      ticket,
      parking_lot_id,
      spot_number,
      license_plate,
      checkin_time,
      plate_front_image,
      plate_back_image,
      status
    )
    VALUES
    (
      @ticket,
      @lot,
      @spot, 
      @plate,
      GETDATE(),     
      @front,
      @back,
      'IN'
    )
  `);


    /* 6️⃣ Đánh dấu vé */
    await pool
      .request()
      .input("ticket", ticket_code)
      .query(`UPDATE ParkingReservation SET used=1 WHERE ticket=@ticket`);

    res.json({
      msg: "Cho xe vào bãi thành công",
      plate: plateInTicket,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "OCR hoặc lưu ảnh thất bại" });
  }
});

module.exports = router;
