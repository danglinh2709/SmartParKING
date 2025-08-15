const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const parkingRoutes = require("./routes/parking.js");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve ảnh

app.use("/api/parking", parkingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
