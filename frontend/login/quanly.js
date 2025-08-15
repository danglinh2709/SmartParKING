// function updateTime() {
//   const now = new Date();
//   const formattedTime = now.toLocaleString("vi-VN", {
//     timeZone: "Asia/Ho_Chi_Minh",
//   });
//   document.getElementById(
//     "current-time"
//   ).innerText = `⏰ Thời gian hiện tại: ${formattedTime}`;
// }

// // Cập nhật thời gian ngay khi tải trang
// updateTime();

// // Cập nhật mỗi giây
// setInterval(updateTime, 1000);

// document.addEventListener("DOMContentLoaded", function () {
//   let currentLane = "vao";
//   let step = 0;
//   let capturedImages = { truoc: null, sau: null };

//   const video = document.getElementById("webcam");
//   const canvas = document.getElementById("snapshot");
//   const context = canvas.getContext("2d");
//   const captureButton = document.getElementById("capture");
//   const switchLaneButton = document.getElementById("switch-lane");

//   const bienSoEl = document.getElementById("bienSo");
//   const thoiGianVaoEl = document.getElementById("thoiGianVao");
//   const thoiGianRaEl = document.getElementById("thoiGianRa");
//   const soTienEl = document.getElementById("soTien");

//   const imgBienso = {
//     vao: {
//       truoc: document.getElementById("bienso_truoc_vao"),
//       sau: document.getElementById("bienso_sau_vao"),
//     },
//     ra: {
//       truoc: document.getElementById("bienso_truoc_ra"),
//       sau: document.getElementById("bienso_sau_ra"),
//     },
//   };

//   let vehicleCounts = {
//     car: { available: 300, parked: 0 },
//     motorbike: { available: 250, parked: 0 },
//     bike: { available: 100, parked: 0 },
//   };

//   function updateVehicleCount() {
//     document.getElementById("car-count").textContent =
//       vehicleCounts.car.available;
//     document.getElementById("motorbike-count").textContent =
//       vehicleCounts.motorbike.available;
//     document.getElementById("bike-count").textContent =
//       vehicleCounts.bike.available;

//     document.getElementById("car-count-exit").textContent =
//       vehicleCounts.car.parked;
//     document.getElementById("motorbike-count-exit").textContent =
//       vehicleCounts.motorbike.parked;
//     document.getElementById("bike-count-exit").textContent =
//       vehicleCounts.bike.parked;
//   }

//   function vehicleEnter(type) {
//     if (vehicleCounts[type].available > 0) {
//       vehicleCounts[type].available--;
//       vehicleCounts[type].parked++;
//       updateVehicleCount();
//       alert(`🚗 Xe ${type} đã vào.`);
//     } else {
//       alert(`❌ Bãi đã đầy, không còn chỗ cho xe ${type}.`);
//     }
//   }

//   function vehicleExit(type) {
//     if (vehicleCounts[type].parked > 0) {
//       vehicleCounts[type].available++;
//       vehicleCounts[type].parked--;
//       updateVehicleCount();
//       alert(`🚗 Xe ${type} đã rời khỏi.`);
//     } else {
//       alert(`❌ Không có xe ${type} trong bãi.`);
//     }
//   }

//   function switchLane() {
//     currentLane = currentLane === "vao" ? "ra" : "vao";
//     capturedImages = { truoc: null, sau: null };
//     alert(`🔄 Đã chuyển sang làn xe ${currentLane === "vao" ? "vào" : "ra"}!`);
//   }

//   async function startWebcam() {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       video.srcObject = stream;
//     } catch (error) {
//       console.error("Lỗi webcam:", error);
//     }
//   }

//   function saveImage(imageData, fileName) {
//     const link = document.createElement("a");
//     link.href = imageData;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }

//   function getCurrentTime() {
//     return new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
//   }

//   captureButton.addEventListener("click", async () => {
//     const targetWidth = 640;
//     const targetHeight = video.videoHeight * (targetWidth / video.videoWidth);
//     canvas.width = targetWidth;
//     canvas.height = targetHeight;

//     // Resize ảnh và giảm chất lượng xuống 0.6
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const imageData = canvas.toDataURL("image/jpeg", 0.6);

//     // Hiển thị ảnh
//     imgBienso[currentLane].truoc.src = imageData;
//     imgBienso[currentLane].sau.src = imageData;

//     const licensePlate = prompt("Nhập biển số xe:");
//     if (!licensePlate) return alert("❌ Chưa nhập biển số!");

//     const API_URL = "http://localhost:5000/api/parking";

//     try {
//       const url = currentLane === "vao" ? "/in" : "/out";
//       const res = await fetch(API_URL + url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           licensePlate,
//           parkingLotId: 1, // chỉ dùng khi xe vào
//           imageUrlEntry: currentLane === "vao" ? imageData : undefined,
//           imageUrlExit: currentLane === "ra" ? imageData : undefined,
//         }),
//       });

//       if (!res.ok) throw new Error(await res.text());
//       const data = await res.json();

//       if (currentLane === "vao") {
//         alert("✅ Xe đã vào bãi");
//         thoiGianVaoEl.textContent = getCurrentTime();
//         thoiGianRaEl.textContent = "---";
//         soTienEl.textContent = "---";
//       } else {
//         alert("✅ Xe đã rời bãi");
//         thoiGianRaEl.textContent = getCurrentTime();
//         soTienEl.textContent = Math.max(0, data.fee || 0);
//       }

//       bienSoEl.textContent = licensePlate;
//     } catch (err) {
//       console.error(err);
//       alert("Lỗi gửi dữ liệu");
//     }
//   });

//   switchLaneButton.addEventListener("click", switchLane);

//   startWebcam();
//   updateVehicleCount();
// });

function updateTime() {
  const now = new Date();
  const formattedTime = now.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  document.getElementById(
    "current-time"
  ).innerText = `⏰ Thời gian hiện tại: ${formattedTime}`;
}

// Cập nhật thời gian ngay khi tải trang
updateTime();
// Cập nhật mỗi giây
setInterval(updateTime, 1000);

document.addEventListener("DOMContentLoaded", function () {
  let currentLane = "vao";
  let vehicleCounts = {
    car: { available: 300, parked: 0 },
    motorbike: { available: 250, parked: 0 },
    bike: { available: 100, parked: 0 },
  };

  const video = document.getElementById("webcam");
  const canvas = document.getElementById("snapshot");
  const context = canvas.getContext("2d");
  const captureButton = document.getElementById("capture");
  const switchLaneButton = document.getElementById("switch-lane");

  const bienSoEl = document.getElementById("bienSo");
  const thoiGianVaoEl = document.getElementById("thoiGianVao");
  const thoiGianRaEl = document.getElementById("thoiGianRa");
  const soTienEl = document.getElementById("soTien");

  function updateVehicleCount() {
    document.getElementById("car-count").textContent =
      vehicleCounts.car.available;
    document.getElementById("motorbike-count").textContent =
      vehicleCounts.motorbike.available;
    document.getElementById("bike-count").textContent =
      vehicleCounts.bike.available;

    document.getElementById("car-count-exit").textContent =
      vehicleCounts.car.parked;
    document.getElementById("motorbike-count-exit").textContent =
      vehicleCounts.motorbike.parked;
    document.getElementById("bike-count-exit").textContent =
      vehicleCounts.bike.parked;
  }

  function getCurrentTime() {
    return new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  }

  function switchLane() {
    currentLane = currentLane === "vao" ? "ra" : "vao";
    alert(`🔄 Đã chuyển sang làn xe ${currentLane.toUpperCase()}!`);
  }

  async function startWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
    } catch (error) {
      console.error("Lỗi webcam:", error);
    }
  }

  captureButton.addEventListener("click", async () => {
    const licensePlate = prompt("Nhập biển số xe:");
    if (!licensePlate || licensePlate.trim() === "")
      return alert("❌ Chưa nhập biển số!");

    const API_URL = "http://localhost:5000/api/parking";
    const bodyData =
      currentLane === "vao"
        ? {
            licensePlate: licensePlate.trim(),
            parkingLotId: 2,
            imageUrlEntry: "dummy.jpg",
          }
        : { licensePlate: licensePlate.trim(), imageUrlExit: "dummy.jpg" };

    try {
      const res = await fetch(
        API_URL + (currentLane === "vao" ? "/in" : "/out"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        }
      );

      // Cố gắng parse JSON, nếu fail thì fallback null
      let data = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        const msg =
          data?.error || `Backend trả về lỗi ${res.status} ${res.statusText}`;
        alert("❌ " + msg);
        return;
      }

      // Thành công
      alert(currentLane === "vao" ? "✅ Xe đã vào bãi" : "✅ Xe đã rời bãi");
    } catch (err) {
      console.error("Fetch error:", err);
      alert("❌ Lỗi gửi dữ liệu đến backend!");
    }
  });

  switchLaneButton.addEventListener("click", switchLane);

  startWebcam();
  updateVehicleCount();
});
