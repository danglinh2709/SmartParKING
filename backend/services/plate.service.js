const axios = require("axios");

exports.recognizePlate = async (base64) => {
  try {
    const res = await axios.post(
      "http://127.0.0.1:6000/ocr",
      { image: base64 },
      { timeout: 30000 }
    );
    return res.data.text || "";
  } catch (err) {
    console.error("❌ OCR Flask error:", err.message);
    return "";
  }
};
