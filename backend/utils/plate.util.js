function normalizePlate(plate) {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

module.exports = { normalizePlate };
