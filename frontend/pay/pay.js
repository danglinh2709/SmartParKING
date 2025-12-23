const API = "http://localhost:5000/api";
let baidoDangHienThi = [];
let cancelMode = false;

let selectedLotId = null;
let selectedSpotNumber = null;
const countdownTimers = {};
/* ================= KIỂM TRA ĐĂNG NHẬP ================= */
function isLoggedIn() {
  const token = localStorage.getItem("sp_token");
  if (!token || token === "undefined" || token === "null") return false;
  return true;
}

/* ================= LOAD TRANG ================= */
window.onload = async () => {
  const modal = document.getElementById("thongbaovitri");
  if (modal) modal.style.display = "flex";

  try {
    const res = await fetch(`${API}/parking-lots`);
    baidoDangHienThi = await res.json();
    renderParkingList(baidoDangHienThi);
  } catch {
    alert("Không tải được dữ liệu bãi đỗ");
  }
};

/* ================= MODAL VỊ TRÍ ================= */
function yeucautruycapvitri() {
  document.getElementById("thongbaovitri").style.display = "none";
  document.getElementById("searchBar").style.display = "block";
}

/* ================= DANH SÁCH BÃI ================= */
function renderParkingList(list) {
  const container = document.getElementById("parkingList");
  container.innerHTML = "";
  container.style.display = "flex";

  if (!list || list.length === 0) {
    container.innerHTML = "<p>Không có bãi đỗ</p>";
    return;
  }

  list.forEach((lot) => {
    const card = document.createElement("div");
    card.className = "parking-card";

    card.innerHTML = `
  <img src="http://localhost:5000${lot.image_url}" />
  <p class="lot-name"><b>${lot.name}</b></p>
  <p class="total-slot">Tổng chỗ: ${lot.total_spots}</p>
`;

    card.onclick = () => showSpots(lot.id, lot.total_spots);
    container.appendChild(card);
  });
}

/* ================= TÌM KIẾM ================= */
function filterParking(value) {
  const keyword = value.toLowerCase().trim();
  if (!keyword) return renderParkingList(baidoDangHienThi);

  renderParkingList(
    baidoDangHienThi.filter((b) => b.name.toLowerCase().includes(keyword))
  );
}

/* ================= HIỂN THỊ CHỖ ================= */
async function showSpots(parkingLotId, totalSpots) {
  cancelMode = false;

  selectedLotId = parkingLotId;

  Object.values(countdownTimers).forEach(clearInterval);
  for (const k in countdownTimers) delete countdownTimers[k];

  document.getElementById("parkingList").style.display = "none";
  document.getElementById("searchBar").style.display = "none";
  document.getElementById("legend").style.display = "flex";
  document.getElementById("parkingHeader").style.display = "block";

  const lot = baidoDangHienThi.find((b) => b.id === parkingLotId);
  document.getElementById("lotName").textContent = lot.name;

  const res = await fetch(`${API}/parking-lots/${parkingLotId}/spot-status`);
  const data = await res.json();

  const spotMap = {};
  let paid = 0,
    pending = 0;

  data.forEach((s) => {
    spotMap[s.spot_number] = {
      status: s.status,
      expired_at: s.expired_at,
    };

    if (s.status === "PAID") paid++;
    if (s.status === "PENDING") pending++;
  });

  document.getElementById("totalSpots").textContent = totalSpots;
  document.getElementById("usedSpots").textContent = paid;
  document.getElementById("freeSpots").textContent =
    totalSpots - paid - pending;

  const zoneA = document.getElementById("zoneA");
  const zoneB = document.getElementById("zoneB");
  zoneA.innerHTML = "";
  zoneB.innerHTML = "";

  const half = Math.ceil(totalSpots / 2);

  for (let i = 1; i <= totalSpots; i++) {
    const spot = document.createElement("div");
    spot.className = "spot";
    spot.textContent = i;
    spot.dataset.spotNumber = i;
    spot.dataset.lotId = parkingLotId;
    if (spotMap[i]?.status === "PAID") {
      spot.classList.add("occupied");
      spot.onclick = () => cancelMode && confirmCancel(parkingLotId, i, "PAID");
    } else if (spotMap[i]?.status === "PENDING") {
      spot.classList.add("free", "pending");

      spot.onclick = () => {
        if (!isLoggedIn()) {
          alert("🔒 Vui lòng đăng nhập để tiếp tục thanh toán");
          window.location.href = "/frontend/login/dangnhap.html";
          return;
        }

        if (cancelMode) {
          confirmCancel(parkingLotId, i, "PENDING");
        } else {
          continuePayment(parkingLotId, i);
        }
      };
    } else {
      spot.classList.add("free");
      spot.onclick = () => {
        if (!isLoggedIn()) {
          alert("🔒 Vui lòng đăng nhập để đặt chỗ");
          window.location.href = "/frontend/login/dangnhap.html";
          return;
        }

        openReserveForm(parkingLotId, i);
      };
    }

    (i <= half ? zoneA : zoneB).appendChild(spot);
    // ===== START COUNTDOWN KHI RENDER Ô =====
    // ===== START COUNTDOWN KHI RENDER Ô =====
    const spotInfo = spotMap[i];

    if (spotInfo && spotInfo.expired_at && spotInfo.status === "PENDING") {
      startCountdown(i, spotInfo.expired_at);
    }
  }
}
function openReserveForm(lotId, spotNumber) {
  selectedLotId = lotId;
  selectedSpotNumber = spotNumber;

  // reset form
  document.getElementById("plateInput").value = "";
  document.getElementById("phoneInput").value = "";
  document.getElementById("startTimeInput").value = "";
  document.getElementById("endTimeInput").value = "";
  document.getElementById("totalPrice").textContent = "0";

  document.getElementById("reserveFormModal").style.display = "flex";
}

function closeReserveForm() {
  document.getElementById("reserveFormModal").style.display = "none";
}

// tiếp tục thanh toán
function continuePayment(parkingLotId, spotNumber) {
  if (!isLoggedIn()) {
    alert("🔒 Vui lòng đăng nhập để tiếp tục thanh toán");
    window.location.href = "/frontend/login/dangnhap.html";
    return;
  }

  localStorage.setItem("parking_lot_id", parkingLotId);
  localStorage.setItem("spot_number", spotNumber);

  window.location.href = "../pay/tra.html";
}

/* ================= ĐẶT CHỖ ================= */
async function confirmReserveInfo() {
  if (!isLoggedIn()) {
    alert("🔒 Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    localStorage.removeItem("sp_token");
    window.location.href = "/frontend/login/dangnhap.html";
    return;
  }

  const plate = document.getElementById("plateInput").value.trim();
  const phone = document.getElementById("phoneInput").value.trim();
  const startTime = document.getElementById("startTimeInput").value;
  const endTime = document.getElementById("endTimeInput").value;

  if (!plate || !phone || !startTime || !endTime) {
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  const hours = Math.ceil(
    (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)
  );

  const res = await fetch(`${API}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("sp_token")}`,
    },
    body: JSON.stringify({
      parking_lot_id: selectedLotId,
      spot_number: selectedSpotNumber,
      plate,
      phone,
      start_time: startTime,
      end_time: endTime,
      hours,
    }),
  });

  if (res.status === 401) {
    alert(" Bạn cần đăng nhập trước khi đặt chỗ");
    localStorage.removeItem("sp_token");
    window.location.href = "/frontend/login/dangnhap.html";
    return;
  }

  const data = await res.json();

  if (!res.ok) {
    alert(data.msg || "Đặt chỗ thất bại");
    return;
  }

  localStorage.setItem("parking_ticket", data.ticket);

  closeReserveForm();
  document.getElementById("paymentModal").style.display = "flex";
}

/* ================= THANH TOÁN ================= */
function proceedToPayment() {
  document.getElementById("paymentModal").style.display = "none";
  window.location.href = "tra.html";
}

/* ================= HUỶ CHẾ ĐỘ ================= */
function enableCancelMode() {
  cancelMode = true;
  showToast("🟡 Chọn ô đã đặt để huỷ");
  highlightCancelableSpots();
}

function highlightCancelableSpots() {
  document.querySelectorAll(".spot").forEach((s) => {
    if (s.classList.contains("pending") || s.classList.contains("occupied")) {
      s.classList.add("cancelable");
    }
  });
}

function confirmCancel(lotId, spotNumber, status) {
  const msg =
    status === "PAID"
      ? "⚠ Chỗ đã thanh toán. Bạn chắc chắn muốn huỷ?"
      : "Bạn có chắc muốn huỷ chỗ này?";

  if (!confirm(msg)) return;
  cancelReservation(lotId, spotNumber);
}

async function cancelReservation(parkingLotId, spotNumber) {
  try {
    const res = await fetch(`${API}/reservations/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parking_lot_id: parkingLotId,
        spot_number: spotNumber,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.msg);

    showToast("✅ Huỷ đặt chỗ thành công");
    showSpots(parkingLotId, document.getElementById("totalSpots").textContent);
  } catch {
    alert("Lỗi khi huỷ");
  }
}

// ================ GPS ====================
function xuLyQuyenViTri(granted) {
  document.getElementById("thongbaovitri").style.display = "none";
  document.getElementById("searchBar").style.display = "block";

  if (!granted) {
    renderParkingList(baidoDangHienThi);
    return;
  }

  if (!navigator.geolocation) {
    alert("Trình duyệt không hỗ trợ định vị");
    renderParkingList(baidoDangHienThi);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      let nearestLot = null;
      let minDistance = Infinity;

      baidoDangHienThi.forEach((lot) => {
        if (lot.lat == null || lot.lng == null) return;

        const lat = parseFloat(lot.lat);
        const lng = parseFloat(lot.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const d = tinhKhoangCach(userLat, userLng, lat, lng);

        if (d < minDistance) {
          minDistance = d;
          nearestLot = lot;
        }
      });

      if (!nearestLot) {
        alert("Không tìm được bãi đỗ gần bạn");
        renderParkingList(baidoDangHienThi);
        return;
      }

      renderParkingList([nearestLot]);

      showToast(
        `📍 Bãi đỗ gần nhất: ${nearestLot.name} (~${minDistance.toFixed(2)} km)`
      );
    },
    () => {
      alert("Không thể truy cập vị trí");
      renderParkingList(baidoDangHienThi);
    }
  );
}

// Hàm tính khoảng cách giữa hai tọa độ (theo km)
function tinhKhoangCach(lat1, lon1, lat2, lon2) {
  if (!lat2 || !lon2) return Infinity;

  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
/* ===== GIÁ THEO GIỜ ===== */
const PRICE_PER_HOUR = 10000;

function calculatePrice() {
  const startInput = document.getElementById("startTimeInput");
  const endInput = document.getElementById("endTimeInput");
  const priceEl = document.getElementById("totalPrice");

  if (!startInput.value || !endInput.value) {
    priceEl.textContent = "0";
    return;
  }

  const start = new Date(startInput.value);
  const end = new Date(endInput.value);

  if (end <= start) {
    priceEl.textContent = "0";
    return;
  }

  const diffMs = end - start;
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));

  const total = hours * PRICE_PER_HOUR;
  priceEl.textContent = total.toLocaleString("vi-VN");
}

/* ================= TOAST ================= */
function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

/* ================= SOCKET ================= */
const socket = io("http://localhost:5000");
socket.on("spot-expired", (data) => {
  if (Number(data.parking_lot_id) !== Number(selectedLotId)) return;

  const spotEl = document.querySelector(
    `.spot[data-spot-number="${data.spot_number}"]`
  );

  if (!spotEl || !spotEl.classList.contains("pending")) return;

  showToast(`⛔ Chỗ ${data.spot_number} đã hết giờ`);
  stopCountdownAndFreeSpot(data.spot_number);
});

socket.on("expire-warning", (data) => {
  if (Number(data.parking_lot_id) !== Number(selectedLotId)) return;

  showToast(`⚠️ Chỗ ${data.spot_number} sắp hết hạn`);

  startCountdown(data.spot_number, data.expired_at);
});

function startCountdown(spotNumber, expiredAt) {
  if (countdownTimers[spotNumber]) return;

  const spotEl = document.querySelector(
    `.spot[data-spot-number="${spotNumber}"]`
  );
  if (!spotEl) return;
  if (!spotEl.classList.contains("pending")) return;

  const oldLabel = spotEl.querySelector(".countdown");
  if (oldLabel) oldLabel.remove();

  const label = document.createElement("div");
  label.className = "countdown";
  spotEl.appendChild(label);

  let warned60 = false;
  let warned30 = false;
  let warned10 = false;

  countdownTimers[spotNumber] = setInterval(() => {
    const remain = Math.floor((new Date(expiredAt) - new Date()) / 1000);

    if (remain <= 0) {
      clearInterval(countdownTimers[spotNumber]);
      delete countdownTimers[spotNumber];
      label.remove();

      spotEl.className = "spot free";
      return;
    }

    label.textContent = remain + "s";

    // ===== RESET MÀU =====
    spotEl.classList.remove("level-60", "level-30", "level-10");

    // ===== 60 GIÂY =====
    if (remain <= 60 && remain > 30) {
      spotEl.classList.add("level-60");
      if (!warned60) {
        playSound("warningSound");
        warned60 = true;
      }
    }

    // ===== 30 GIÂY =====
    if (remain <= 30 && remain > 10) {
      spotEl.classList.add("level-30");
      if (!warned30) {
        playSound("warningSound");
        warned30 = true;
      }
    }

    // ===== 10 GIÂY =====
    if (remain <= 10) {
      spotEl.classList.add("level-10");
      if (!warned10) {
        playSound("dangerSound");
        warned10 = true;
      }
    }
  }, 1000);
}

function stopCountdownAndFreeSpot(spotNumber) {
  if (countdownTimers[spotNumber]) {
    clearInterval(countdownTimers[spotNumber]);
    delete countdownTimers[spotNumber];
  }

  const spotEl = document.querySelector(
    `.spot[data-spot-number="${spotNumber}"]`
  );

  if (!spotEl) return;

  spotEl.classList.remove("occupied", "pending", "danger", "pending-expire");

  const label = spotEl.querySelector(".countdown");
  if (label) label.remove();

  spotEl.classList.add("free");
}
// sound
function playSound(id) {
  const sound = document.getElementById(id);
  if (!sound) return;

  sound.currentTime = 0;
  sound.play().catch(() => {});
}
