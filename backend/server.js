const http = require("http");
require("dotenv").config();

const app = require("./app");

// ===== SOCKET =====
const { Server } = require("socket.io");
const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
//   },
// });

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
});

// ===== JOBS =====
const clearExpired = require("./jobs/clearExpired");
const notifyExpire = require("./jobs/notifyExpire");

setInterval(() => {
  clearExpired(io);
}, 60 * 1000);

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});
setInterval(async () => {
  const pool = await poolPromise;
  notifyExpire(io, pool);
}, 60000); // mỗi 1 phút

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
