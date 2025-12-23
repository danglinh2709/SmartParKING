/* ========= GUARD ========= */
(function () {
  const token = localStorage.getItem("sp_token");
  const lotId = localStorage.getItem("managed_parking_lot");
  const lotName = localStorage.getItem("managed_parking_name");

  if (!token || !lotId) {
    alert("Không có quyền truy cập");
    location.href = "../login/dangnhap.html";
  }

  document.getElementById("parkingName").textContent = "Bãi: " + lotName;
})();

const API = "http://localhost:5000/api";
const token = localStorage.getItem("sp_token");
const parkingLotId = Number(localStorage.getItem("managed_parking_lot"));

let currentReservation = null;

/* ========= CAMERA ========= */
const video = document.getElementById("cam");
const canvas = document.getElementById("snapshot");
const ctx = canvas.getContext("2d");

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((s) => (video.srcObject = s))
  .catch(() => alert("Không mở được camera"));

function captureImage() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.7);
}

/* ========= VERIFY TICKET ========= */
async function verifyTicket() {
  const ticket = ticketInput.value.trim();
  if (!ticket) return alert("Nhập mã vé");

  const res = await fetch(`${API}/staff/verify-ticket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ticket, parking_lot_id: parkingLotId }),
  });

  const data = await res.json();
  if (!res.ok) {
    ticketInfo.innerHTML = `<span class="badge red">${data.msg}</span>`;
    return;
  }

  currentReservation = data;

  ticketInfo.innerHTML = `
    <b>Vé hợp lệ</b><br/>
    Mã vé: ${data.ticket}<br/>
    Ô đỗ: ${data.spot_number}<br/>
    Biển số: ${data.license_plate || "Chưa có"}<br/>
    Hết hạn: ${new Date(data.expired_at).toLocaleString("vi-VN")}
  `;
}

/* ========= CONFIRM ENTRY ========= */
async function confirmEntry() {
  if (!currentReservation) {
    alert("Chưa xác nhận vé");
    return;
  }

  const res = await fetch(`${API}/check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ticket_code: currentReservation.ticket_code,
      parking_lot_id: parkingLotId,
      spot_number: currentReservation.spot_number,
    }),
  });

  const data = await res.json();
  if (!res.ok) return alert(data.msg);

  alert("✅ Xe đã vào bãi");
  location.reload();
}

/* ========= LOGOUT ========= */
logoutBtn.onclick = () => {
  localStorage.clear();
  location.href = "../login/dangnhap.html";
};

// check in
async function checkIn() {
  const ticket = document.getElementById("ticketInput").value;

  const res = await fetch("/api/check-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ticket_code: ticket,
      parking_lot_id: 1,
      spot_number: 15,
    }),
  });

  const data = await res.json();
  alert(data.msg);
}
