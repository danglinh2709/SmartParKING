/* ====================== GUARD ====================== */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("sp_token");

    if (!token) {
      alert("Vui lòng đăng nhập trước!");
      location.href = "dangnhap.html";
    }
  });
})();

/* ====================== UTIL ====================== */
const API = "http://localhost:5000/api/parking";
const PARKING_LOT_ID_DEFAULT = 11; // <— chỉnh id bãi của bạn

const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));
function nowVN() {
  return new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}
function fmtVN(d) {
  try {
    return new Date(d).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch {
    return "---";
  }
}
function toast(msg, ok = true) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  t.style.borderColor = ok ? "#0ea66a" : "#ef4444";
  t.style.background = ok ? "#052e24" : "#3f1f1f";
  clearTimeout(t._h);
  t._h = setTimeout(() => (t.style.display = "none"), 3000);
}

/* ====================== HEADER TIME ====================== */
function renderTime() {
  $("#current-time").textContent = "⏰ Thời gian hiện tại: " + nowVN();
}
renderTime();
setInterval(renderTime, 1000);

/* ====================== EMPLOYEE NAME ====================== */
(function () {
  try {
    const p = JSON.parse(localStorage.getItem("sp_profile") || "{}");
    if (p?.name) $("#employee-name").textContent = p.name;
  } catch {}
})();

/* ====================== LOGOUT ====================== */
$("#logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("sp_token");
  sessionStorage.removeItem("sp_token");
  localStorage.removeItem("sp_profile");
  alert("👋 Bạn đã đăng xuất!");
  location.href = "dangnhap.html";
});

/* ====================== WEBCAM ====================== */
const video = $("#webcam"),
  canvas = $("#snapshot"),
  ctx = canvas.getContext("2d");
async function startCam() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = s;
  } catch (e) {
    console.error(e);
    alert("Không truy cập được webcam.");
  }
}
startCam();

/* ====================== UI STATE ====================== */
let currentLane = "vao";
const laneLabel = $("#laneLabel");
const img = {
  vao: { truoc: $("#bienso_truoc_vao"), sau: $("#bienso_sau_vao") },
  ra: { truoc: $("#bienso_truoc_ra"), sau: $("#bienso_sau_ra") },
};
const bienSoEl = $("#bienSo"),
  vaoEl = $("#thoiGianVao"),
  raEl = $("#thoiGianRa"),
  tienEl = $("#soTien");

// đếm demo
const counts = {
  car: { available: 300, parked: 0 },
  motorbike: { available: 250, parked: 0 },
  bike: { available: 100, parked: 0 },
};
function renderCounts() {
  $("#car-count").textContent = counts.car.available;
  $("#motorbike-count").textContent = counts.motorbike.available;
  $("#bike-count").textContent = counts.bike.available;
  $("#car-count-exit").textContent = counts.car.parked;
  $("#motorbike-count-exit").textContent = counts.motorbike.parked;
  $("#bike-count-exit").textContent = counts.bike.parked;
}
renderCounts();

// nhớ giờ vào gần nhất theo biển số (phòng khi API /out không trả entry_time)
const lastEntryByPlate = new Map();

$("#switch-lane").addEventListener("click", () => {
  currentLane = currentLane === "vao" ? "ra" : "vao";
  laneLabel.textContent =
    "Làn hiện tại: " + (currentLane === "vao" ? "VÀO" : "RA");
  toast("Đã chuyển sang làn " + (currentLane === "vao" ? "VÀO" : "RA"));
});

/* ====================== CAPTURE & SEND ====================== */
$("#capture").addEventListener("click", async (e) => {
  const btn = e.currentTarget;

  const plate = prompt("Nhập biển số xe:");
  if (!plate || !plate.trim()) return alert("❌ Chưa nhập biển số!");

  // chụp & nén ảnh
  const w = 640,
    h = video.videoHeight * (w / (video.videoWidth || w));
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(video, 0, 0, w, h);
  const dataURL = canvas.toDataURL("image/jpeg", 0.6);

  // hiển thị demo ảnh
  img[currentLane].truoc.src = dataURL;
  img[currentLane].sau.src = dataURL;

  const body =
    currentLane === "vao"
      ? {
          licensePlate: plate.trim(),
          parkingLotId: PARKING_LOT_ID_DEFAULT, // ✔ bãi đang chọn
          imageUrlEntry: dataURL, // ✔ ảnh base64
        }
      : {
          licensePlate: plate.trim(),
          imageUrlExit: dataURL, // ✔ ảnh base64
        };

  btn.disabled = true;
  try {
    const res = await fetch(API + (currentLane === "vao" ? "/in" : "/out"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast("❌ " + (data?.error || `${res.status} ${res.statusText}`), false);
      return;
    }

    // server có thể trả: { ok, message, fee, exit_time, record? }
    const record = data.record || null;

    // cập nhật sidebar
    if (currentLane === "vao") {
      const entryTime = record?.entry_time || new Date().toISOString();
      bienSoEl.textContent = record?.license_plate || plate.trim();
      vaoEl.textContent = fmtVN(entryTime);
      raEl.textContent = "---";
      tienEl.textContent = "---";

      // lưu lại để dùng khi xe ra
      lastEntryByPlate.set(
        (record?.license_plate || plate.trim()).toUpperCase(),
        entryTime
      );

      // demo đếm
      counts.car.available = Math.max(0, counts.car.available - 1);
      counts.car.parked += 1;
      renderCounts();

      toast("✅ Xe đã vào bãi");
    } else {
      const key = (record?.license_plate || plate.trim()).toUpperCase();
      const entryTimeKnown = record?.entry_time || lastEntryByPlate.get(key);

      if (entryTimeKnown) vaoEl.textContent = fmtVN(entryTimeKnown);
      bienSoEl.textContent = record?.license_plate || plate.trim();
      raEl.textContent = fmtVN(
        data.exit_time || record?.exit_time || new Date().toISOString()
      );
      const fee = data?.fee ?? record?.parking_fee ?? 0;
      tienEl.textContent = fee.toLocaleString("vi-VN") + " đ";

      // clear cache
      lastEntryByPlate.delete(key);

      // demo đếm
      counts.car.available += 1;
      counts.car.parked = Math.max(0, counts.car.parked - 1);
      renderCounts();

      toast("✅ Xe đã rời bãi");
    }
  } catch (err) {
    console.error(err);
    toast("❌ Lỗi gửi dữ liệu đến backend", false);
  } finally {
    btn.disabled = false;
  }
});
