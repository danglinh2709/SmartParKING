const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(express.text({ type: ["text/plain"], limit: "25mb" }));

//ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/parking", require("./routes/parking"));

// TEST API
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

module.exports = app;
