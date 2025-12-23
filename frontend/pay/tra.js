document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:5000/api";
  const TOTAL_TIME = 600; // 10 phút

  /* ===== LOGIN CHECK ===== */
  const token = localStorage.getItem("sp_token");
  if (!token) {
    alert("🔒 Vui lòng đăng nhập để thanh toán");
    location.href = "/frontend/login/dangnhap.html";
    return;
  }

  const ticket = localStorage.getItem("parking_ticket");
  if (!ticket) {
    alert("❌ Không có vé hợp lệ");
    location.href = "/frontend/trangchu/index.html";
    return;
  }

  const countdownEl = document.getElementById("countdown");
  const qrImg = document.getElementById("qrTicket");

  /* ===== COUNTDOWN THANH TOÁN ===== */
  const startKey = `payment_start_${ticket}`;
  let startTime = localStorage.getItem(startKey);

  if (!startTime) {
    startTime = Date.now();
    localStorage.setItem(startKey, startTime);
  } else {
    startTime = Number(startTime);
  }

  const timer = setInterval(async () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remain = TOTAL_TIME - elapsed;

    if (remain <= 0) {
      clearInterval(timer);
      alert("⛔ Hết thời gian thanh toán – vui lòng đặt lại");

      localStorage.removeItem(startKey);
      localStorage.removeItem("parking_ticket");

      location.href = "/frontend/trangchu/index.html";
      return;
    }

    const m = Math.floor(remain / 60);
    const s = remain % 60;
    countdownEl.textContent = `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }, 1000);

  /* ===== QR CHỈ CHỨA TICKET ===== */
  qrImg.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
    encodeURIComponent(ticket);

  /* ===== PAY ===== */
  window.payNow = async () => {
    const res = await fetch(`${API}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ticket }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "❌ Thanh toán thất bại");
      return;
    }

    alert("✅ Thanh toán thành công");

    clearInterval(timer);
    localStorage.removeItem(startKey);
    // ❌ KHÔNG XOÁ parking_ticket

    location.href = "/frontend/ticket/ticket.html";
  };
});
