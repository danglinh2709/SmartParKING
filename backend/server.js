const http = require("http");
require("dotenv").config();

const app = require("./app");
const poolPromise = require("./models/db");

// ===== CREATE SERVER =====
const server = http.createServer(app);

// ===== SOCKET.IO =====
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(`[SOCKET] + ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`[SOCKET] - ${socket.id} (${reason})`);
  });
});

// ===== JOBS =====
const clearExpired = require("./jobs/clearExpired");
const notifyExpire = require("./jobs/notifyExpire");
const expireParking = require("./jobs/expireParking");

// ================== SCHEDULER ==================
(async function startJobs() {
  console.log("⏰ Parking jobs scheduler started");

  // 🔁 1 phút: xoá vé giữ chỗ (PENDING) hết hạn
  setInterval(async () => {
    try {
      await clearExpired(io);
    } catch (err) {
      console.error("❌ clearExpired error:", err);
    }
  }, 60 * 1000);

  // 🔔 30 giây: thông báo sắp hết giờ đỗ
  setInterval(async () => {
    try {
      await notifyExpire(io);
    } catch (err) {
      console.error("❌ notifyExpire error:", err);
    }
  }, 30 * 1000);

  // ⛔ 1 phút: giải phóng chỗ khi hết giờ đỗ
  setInterval(async () => {
    try {
      const pool = await poolPromise;
      await expireParking(io, pool);
    } catch (err) {
      console.error("❌ expireParking error:", err);
    }
  }, 60 * 1000);
})();

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
