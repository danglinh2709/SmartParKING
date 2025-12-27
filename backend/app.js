const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "public/images")));

// ===== ROUTES =====
app.use("/api/auth", require("./routes/auth"));
app.use("/api/parking", require("./routes/parking"));
app.use("/api/parking-lots", require("./routes/parkingLot"));
app.use("/api/reservations", require("./routes/reservation"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/staff", require("./routes/staff"));

app.use("/api/tickets", require("./routes/tickets"));

app.use("/api/manager", require("./routes/manager"));
app.use("/api/check-in", require("./routes/checkin"));

module.exports = app;
