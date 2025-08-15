// const express = require("express");
// const parkingRouter = require("./routes/parking");

// const app = express();

// // ⚙️ Middleware
// app.use(express.json({ limit: "10mb" })); // tăng giới hạn JSON lên 10MB
// app.use(express.urlencoded({ limit: "10mb", extended: true })); // form data lớn
// app.use(require("cors")()); // nếu cần gọi từ frontend khác cổng

// // Routes
// app.use("/parking", parkingRouter);

// // ✅ Khởi động server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚗 Smart Parking server is running on http://localhost:${PORT}`);
// });

// const express = require("express");
// const cors = require("cors");
// const parkingRoutes = require("./routes/parking");

// const app = express();
// const PORT = 5000; // chắc chắn trùng với frontend fetch

// // Bật CORS
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/api/parking", parkingRoutes);

// app.listen(PORT, () => {
//   console.log(`Server đang chạy trên http://localhost:${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors()); // cho phép frontend localhost gửi request
// app.use(express.json());

app.use(express.json({ limit: "50mb" }));

// import routes
const parkingRouter = require("./routes/parking");
app.use("/api/parking", parkingRouter);

app.listen(5000, () =>
  console.log("Server đang chạy trên http://localhost:5000")
);
