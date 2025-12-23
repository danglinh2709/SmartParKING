document.addEventListener("DOMContentLoaded", async () => {
  const API = "http://localhost:5000/api/tickets";

  /* ====== LẤY MÃ VÉ TỪ FORM TRƯỚC ====== */
  const ticket = localStorage.getItem("parking_ticket");

  if (!ticket) {
    alert("❌ Không tìm thấy mã vé");
    location.href = "/frontend/trangchu/index.html";
    return;
  }

  try {
    /* ====== GỌI API LẤY THÔNG TIN VÉ ====== */
    const res = await fetch(`${API}/${ticket}`);

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "❌ Vé không hợp lệ");
      location.href = "/frontend/trangchu/index.html";
      return;
    }

    /* ====== ĐỔ DỮ LIỆU RA HTML ====== */
    document.getElementById("ticketCode").textContent = data.ticket;
    document.getElementById("parkingName").textContent = data.parking_name;
    document.getElementById("spotNumber").textContent = data.spot_number;
    document.getElementById("startTime").textContent = formatTime(
      data.start_time
    );
    document.getElementById("endTime").textContent = formatTime(
      data.expired_at
    );

    /* ====== TẠO QR ====== */
    const qrText = `
Mã vé: ${data.ticket}
Bãi xe: ${data.parking_name}
Vị trí: ${data.spot_number}
Vào: ${formatTime(data.start_time)}
Hết hạn: ${formatTime(data.expired_at)}
    `;

    document.getElementById(
      "qrTicket"
    ).src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      qrText
    )}`;
  } catch (err) {
    console.error(err);
    alert("❌ Không kết nối được server");
  }
});

/* ====== FORMAT THỜI GIAN ====== */
function formatTime(time) {
  const d = new Date(time);
  return d.toLocaleString("vi-VN");
}

/* ====== LƯU VÉ ====== */
function saveTicket() {
  if (!ticketLoaded) {
    alert("⏳ Vé đang tải, vui lòng chờ 1–2 giây");
    return;
  }

  const ticket = document.getElementById("ticket-card");

  html2canvas(ticket, { scale: 2 }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "ve_gui_xe.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

/* ====== TẢI QR ====== */
function downloadQR() {
  const qr = document.getElementById("qrTicket");

  if (!qr.src) {
    alert("❌ QR chưa sẵn sàng");
    return;
  }

  const link = document.createElement("a");
  link.href = qr.src;
  link.download = "qr_ve_gui_xe.png";
  link.click();
}

/* ====== TRANG CHỦ ====== */
function goHome() {
  window.location.href = "/frontend/trangchu/index.html";
}
