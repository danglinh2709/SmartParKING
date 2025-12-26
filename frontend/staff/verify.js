document.addEventListener("DOMContentLoaded", () => {
  /* ========= GUARD ========= */
  const token = localStorage.getItem("sp_token");
  const lotId = localStorage.getItem("managed_parking_lot");
  const lotName = localStorage.getItem("managed_parking_name");

  if (!token || !lotId) {
    alert("Không có quyền truy cập");
    location.href = "../login/dangnhap.html";
    return;
  }

  document.getElementById("parkingName").textContent = "Bãi: " + lotName;

  /* ========= CONFIG ========= */
  const API = "http://localhost:5000/api";
  const parkingLotId = Number(lotId);
  let currentReservation = null;

  /* ========= DOM ========= */
  const ticketInput = document.getElementById("ticketInput");
  // const ticketPreview = document.getElementById("ticketPreview");
  const ticketInfo = document.getElementById("ticketInfo");
  const verifyBtn = document.getElementById("verifyBtn");
  const qrBtn = document.getElementById("qrBtn");
  const confirmBtn = document.getElementById("confirmBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  /* ========= CAMERA ========= */
  const video = document.getElementById("cam");
  const canvas = document.getElementById("snapshot");
  const ctx = canvas.getContext("2d");

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((s) => (video.srcObject = s))
    .catch(() => alert("Không mở được camera"));

  /* ========= VERIFY ========= */
  verifyBtn.onclick = verifyTicket;

  async function verifyTicket() {
    const ticket = ticketInput.value.trim();

    if (!ticket) {
      ticketInfo.innerHTML = `
        <div class="ticket-status error">
          ❌ Vui lòng nhập hoặc quét mã vé
        </div>
      `;
      confirmBtn.disabled = true;
      return;
    }

    ticketInfo.innerHTML = `
      <div class="ticket-status pending">⏳ Đang kiểm tra vé...</div>
    `;
    confirmBtn.disabled = true;

    try {
      const res = await fetch(`${API}/staff/verify-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticket,
          parking_lot_id: parkingLotId,
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      currentReservation = data;
      confirmBtn.disabled = false;
      confirmBtn.style.pointerEvents = "auto";
      confirmBtn.style.opacity = "1";

      /* ===== HIỂN THỊ ĐẦY ĐỦ THÔNG TIN SAU VERIFY ===== */
      ticketInfo.innerHTML = `
        <div class="ticket-status success">
           Vé hợp lệ – có thể cho xe vào
        </div>

        <div class="ticket-grid">
          <div class="ticket-label">🎟 Mã vé</div>
          <div class="ticket-value">${data.ticket}</div>

          <div class="ticket-label">🏢 Bãi xe</div>
          <div class="ticket-value">${data.parking_name}</div>

          <div class="ticket-label">📍 Vị trí</div>
          <div class="ticket-value">Ô ${data.spot_number}</div>

          <div class="ticket-label">🕒 Thời gian vào</div>
          <div class="ticket-value">
            ${new Date(data.start_time).toLocaleString("vi-VN")}
          </div>

          <div class="ticket-label">⏰ Hiệu lực đến</div>
          <div class="ticket-value">
            ${new Date(data.end_time).toLocaleString("vi-VN")}
          </div>
        </div>
      `;
    } catch {
      currentReservation = null;
      confirmBtn.disabled = true;

      ticketInfo.innerHTML = `
        <div class="ticket-status error">
          Vé không hợp lệ hoặc ngoài thời gian gửi
        </div>
      `;
    }
  }

  /* ========= CHECK-IN ========= */
  confirmBtn.onclick = async () => {
    if (!currentReservation) {
      alert("Chưa có vé hợp lệ");
      return;
    }

    confirmBtn.disabled = true;

    const res = await fetch(`${API}/check-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ticket_code: currentReservation.ticket,
        parking_lot_id: parkingLotId,
      }),
    });

    if (!res.ok) {
      alert("Không cho xe vào được");
      confirmBtn.disabled = false;
      return;
    }

    alert("✅ Xe đã vào bãi");
    location.reload();
  };

  /* ========= LOGOUT ========= */
  logoutBtn.onclick = () => {
    localStorage.clear();
    location.href = "../login/dangnhap.html";
  };

  /* ========= QR SCAN ========= */
  let scanning = false;
  qrBtn.onclick = () => {
    if (scanning) return;
    scanning = true;

    ticketInfo.innerHTML = `
    <div class="ticket-status pending">
      📷 Đang quét QR…
    </div>
  `;

    const timer = setInterval(() => {
      if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, canvas.width, canvas.height);

      if (code) {
        clearInterval(timer);
        scanning = false;

        // ✅ chỉ lấy mã vé
        const match = code.data.match(/TICKET-[A-Za-z0-9]+/);
        if (!match) {
          ticketInfo.innerHTML = `
          <div class="ticket-status error">
            ❌ QR không chứa mã vé hợp lệ
          </div>
        `;
          return;
        }

        // 👉 set input
        ticketInput.value = match[0];

        // 👉 TỰ VERIFY – KHÔNG CẦN ẤN NÚT
        verifyTicket();
      }
    }, 300);
  };
});

const camFront = document.getElementById("camFront");
const camBack = document.getElementById("camBack");

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  camFront.srcObject = stream;
  camBack.srcObject = stream;
});
