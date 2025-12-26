// MOCK AI – sau này thay bằng OCR thật
async function recognizePlateFromImage(imageBase64) {
  // demo trả biển số cứng
  return {
    plate: "30A12345",
    confidence: 0.92,
  };
}

module.exports = { recognizePlateFromImage };
