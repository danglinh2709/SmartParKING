function normalizePlate(text) {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/O/g, "0")
    .replace(/I/g, "1")
    .replace(/S/g, "5")
    .replace(/B/g, "8");
}

module.exports = {
  normalizePlate,
};
