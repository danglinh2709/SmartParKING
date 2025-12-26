const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  // 1️⃣ Bắt buộc có Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Vui lòng đăng nhập" });
  }

  // 2️⃣ Lấy token
  const token = authHeader.split(" ")[1];

  // ❌ CHẶN token rác
  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ msg: "Token không hợp lệ" });
  }

  try {
    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ❌ Token không có user id → không hợp lệ
    if (!decoded || !decoded.id) {
      return res.status(401).json({ msg: "Token không hợp lệ" });
    }

    // 4️⃣ Gán user cho request
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      msg: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};
