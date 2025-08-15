const sql = require("mssql");
require("dotenv").config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false, // tắt SSL
    trustServerCertificate: true, // tin certificate không tin cậy
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("✅ Connected to SQL Server via SQL Authentication");
    return pool;
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // thoát app nếu connect fail
  });

module.exports = poolPromise;
