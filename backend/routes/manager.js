const express = require("express");
const router = express.Router();
const poolPromise = require("../models/db");
const auth = require("../middlewares/auth");

router.get("/dashboard", auth, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ msg: "Không có quyền" });
    }

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM ParkingLot) AS totalParkingLots,
        (SELECT COUNT(*) FROM Users WHERE role = 'staff') AS totalStaff,
        (SELECT COUNT(*) FROM ContactMessage WHERE is_read = 0) AS unreadMessages
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

//
router.get("/parking-lots", auth, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ msg: "Không có quyền" });
    }

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        id,
        name,
        total_spots,
        available_spots,
        image_url,
        lat,
        lng
      FROM ParkingLot
      ORDER BY name
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("PARKING LOT ERROR:", err);
    res.status(500).json({ msg: "Lỗi server parking-lots" });
  }
});
// NHÂN VIÊN
router.get("/staff", auth, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ msg: "Không có quyền" });
    }

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        u.UserID       AS id,
        u.FullName     AS full_name,
        u.Email        AS email,
        p.name         AS parking_name,
        pls.is_active
      FROM Users u
      LEFT JOIN ParkingLotStaff pls 
        ON u.UserID = pls.user_id AND pls.is_active = 1
      LEFT JOIN ParkingLot p 
        ON pls.parking_lot_id = p.id
      WHERE u.Role = 'staff'
      ORDER BY u.FullName
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("STAFF API ERROR:", err);
    res.status(500).json({ msg: "Lỗi server staff" });
  }
});

// LẤY DANH SÁCH TIN NHẮN
router.get("/contact-messages", auth, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ msg: "Không có quyền" });
    }

    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        id,
        name,
        email,
        subject,
        message,
        is_read,
        created_at
      FROM ContactMessage
      ORDER BY created_at DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server contact-messages" });
  }
});

// XEM CHI TIẾT + ĐÁNH DẤU ĐÃ ĐỌC
router.get("/contact-messages/:id", auth, async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;

    const result = await pool.request().input("id", id).query(`
      UPDATE ContactMessage
      SET is_read = 1
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi đọc tin nhắn" });
  }
});
//
router.get("/parking-stats", auth, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ msg: "Không có quyền" });
    }

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        name,
        total_spots,
        available_spots,
        (total_spots - available_spots) AS used_spots
      FROM ParkingLot
      ORDER BY name
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("PARKING STATS ERROR:", err);
    res.status(500).json({ msg: "Lỗi server parking-stats" });
  }
});

// PHÂN CÔNG NHÂN VIÊN VÀO BÃI ĐỖ
router.post("/assign-staff", auth, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ msg: "Không có quyền" });
    }

    const { user_id, parking_lot_id } = req.body;

    if (!user_id || !parking_lot_id) {
      return res.status(400).json({ msg: "Thiếu dữ liệu" });
    }

    const pool = await poolPromise;

    // 1️⃣ Huỷ phân công cũ (nếu có)
    await pool.request().input("user_id", user_id).query(`
        UPDATE ParkingLotStaff
        SET is_active = 0
        WHERE user_id = @user_id AND is_active = 1
      `);

    // 2️⃣ Tạo access code
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 3️⃣ Thêm phân công mới
    await pool
      .request()
      .input("user_id", user_id)
      .input("parking_lot_id", parking_lot_id)
      .input("access_code", accessCode).query(`
        INSERT INTO ParkingLotStaff (user_id, parking_lot_id, access_code, is_active)
        VALUES (@user_id, @parking_lot_id, @access_code, 1)
      `);

    res.json({
      msg: "Phân công thành công",
      accessCode,
    });
  } catch (err) {
    console.error("ASSIGN STAFF ERROR:", err);
    res.status(500).json({ msg: "Lỗi server assign-staff" });
  }
});

router.get("/assignments", auth, async (req, res) => {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT
      pls.id,
      u.FullName AS full_name,
      p.name AS parking_name,
      pls.access_code,
      pls.created_at
    FROM ParkingLotStaff pls
    JOIN Users u ON pls.user_id = u.UserID
    JOIN ParkingLot p ON pls.parking_lot_id = p.id
    WHERE pls.is_active = 1
    ORDER BY pls.created_at DESC
  `);

  res.json(result.recordset);
});

// SỬA PHÂN CÔNG
router.put("/assignments/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ msg: "Không có quyền" });
    }

    const { id } = req.params;
    const { parking_lot_id } = req.body;

    if (!parking_lot_id) {
      return res.status(400).json({ msg: "Thiếu bãi đỗ" });
    }

    const pool = await poolPromise;

    await pool.request().input("id", id).input("parking_lot_id", parking_lot_id)
      .query(`
        UPDATE ParkingLotStaff
        SET parking_lot_id = @parking_lot_id
        WHERE id = @id
      `);

    res.json({ msg: "Cập nhật phân công thành công" });
  } catch (err) {
    console.error("UPDATE ASSIGNMENT ERROR:", err);
    res.status(500).json({ msg: "Lỗi server update assignment" });
  }
});
// HUỶ PHÂN CÔNG
router.delete("/assignments/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ msg: "Không có quyền" });
    }

    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request().input("id", id).query(`
        UPDATE ParkingLotStaff
        SET is_active = 0
        WHERE id = @id
      `);

    res.json({ msg: "Huỷ phân công thành công" });
  } catch (err) {
    console.error("DELETE ASSIGNMENT ERROR:", err);
    res.status(500).json({ msg: "Lỗi server huỷ phân công" });
  }
});

module.exports = router;
