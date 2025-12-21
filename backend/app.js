const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "public/images")));

// ===== ROUTES =====
app.use("/api/auth", require("./routes/auth"));
app.use("/api/parking", require("./routes/parking"));
app.use("/api/parking-lots", require("./routes/parkingLot"));
app.use("/api/reservations", require("./routes/reservation"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/qr", require("./routes/qr"));

module.exports = app;
