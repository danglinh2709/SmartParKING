document.addEventListener("DOMContentLoaded", () => {
  const ticket = localStorage.getItem("parking_ticket");
  const lotId = localStorage.getItem("parking_lot_id");
  const spot = localStorage.getItem("spot_number");

  if (!ticket || !lotId || !spot) {
    alert("Không tìm thấy thông tin vé");
    window.location.href = "/frontend/trangchu/index.html";
    return;
  }

  // ===== GÁN DỮ LIỆU =====
  document.getElementById("ticketCode").textContent = ticket;
  document.getElementById("spotNumber").textContent = spot;
  document.getElementById("parkingName").textContent =
    "Bãi xe Trường Chinh - Hà Nội";

  const start = new Date();
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // +3 giờ

  document.getElementById("startTime").textContent =
    start.toLocaleString("vi-VN");
  document.getElementById("endTime").textContent = end.toLocaleString("vi-VN");

  // ===== QR CODE =====
  const qrData = JSON.stringify({
    ticket,
    lotId,
    spot,
    type: "SMART_PARKING",
  });

  document.getElementById("qrTicket").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
    encodeURIComponent(qrData);
});

/* ====== LƯU VÉ (CHỈ CHỤP VÉ) ====== */
function saveTicket() {
  const actions = document.querySelector(".ticket-actions");
  actions.style.display = "none";

  const ticket = document.getElementById("ticket-card");

  html2canvas(ticket, {
    scale: 2,
    useCORS: true,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = `ticket_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    actions.style.display = "flex";
  });
}

/* ====== TẢI RIÊNG QR ====== */
function downloadQR() {
  const qr = document.getElementById("qrTicket");
  const link = document.createElement("a");
  link.href = qr.src;
  link.download = "qr_ticket.png";
  link.click();
}

/* ====== TRANG CHỦ ====== */
function goHome() {
  window.location.href = "/frontend/trangchu/index.html";
}
