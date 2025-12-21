document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:5000/api";
  const TOTAL_TIME = 600; // 10 phút

  const ticket = localStorage.getItem("parking_ticket");
  if (!ticket) {
    alert("❌ Không có vé hợp lệ");
    window.location.href = "/frontend/trangchu/index.html";
    return;
  }

  const countdownEl = document.getElementById("countdown");
  const qrImg = document.getElementById("qrTicket");

  /* ================= TIMER ================= */
  const startKey = `payment_start_time_${ticket}`;
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
      alert("⛔ Hết thời gian thanh toán – vé bị huỷ");

      try {
        await fetch(`${API}/reservations/expire`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticket }),
        });
      } catch {}

      localStorage.removeItem(startKey);
      localStorage.removeItem("parking_ticket");

      window.location.href = "/frontend/trangchu/index.html";
      return;
    }

    const m = Math.floor(remain / 60);
    const s = remain % 60;
    countdownEl.textContent = `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }, 1000);

  /* ================= QR ================= */
  if (qrImg) {
    qrImg.src =
      "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
      encodeURIComponent(ticket);
  }

  /* ================= PAY ================= */
  window.payNow = async function () {
    try {
      const res = await fetch(`${API}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || "❌ Thanh toán thất bại");
        return;
      }

      alert("✅ Thanh toán thành công");

      window.location.href = "/frontend/ticket/ticket.html";
    } catch (err) {
      alert("❌ Lỗi server");
    }
  };
});

const socket = io("http://localhost:5000");

socket.on("expire-warning", (ticket) => {
  const myTicket = localStorage.getItem("parking_ticket");

  if (ticket === myTicket) {
    alert("⏰ Vé gửi xe sắp hết hạn! Bạn nên gia hạn.");
  }
});
