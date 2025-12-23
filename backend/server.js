const http = require("http");
require("dotenv").config();

const app = require("./app");
const poolPromise = require("./models/db"); // ✅ BẮT BUỘC

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
// const clearExpired = require("./jobs/clearExpired");
// const notifyExpire = require("./jobs/notifyExpire");
// const expireParking = require("./jobs/expireParking");

// setInterval(() => expireParking(io), 60 * 1000);
// setInterval(() => clearExpired(io), 60 * 1000);
// setInterval(async () => {
//   const pool = await poolPromise;
//   await notifyExpire(io, pool);
// }, 60 * 1000);
const handlePendingExpire = require("./jobs/handlePendingExpire");

setInterval(async () => {
  try {
    await handlePendingExpire(io);
  } catch (err) {
    console.error("Expire job error:", err);
  }
}, 1000); // 🔥 1 GIÂY

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
