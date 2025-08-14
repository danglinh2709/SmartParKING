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
  let step = 0;
  let capturedImages = { truoc: null, sau: null };

  const video = document.getElementById("webcam");
  const canvas = document.getElementById("snapshot");
  const context = canvas.getContext("2d");
  const captureButton = document.getElementById("capture");
  const switchLaneButton = document.getElementById("switch-lane");

  const bienSoEl = document.getElementById("bienSo");
  const thoiGianVaoEl = document.getElementById("thoiGianVao");
  const thoiGianRaEl = document.getElementById("thoiGianRa");
  const soTienEl = document.getElementById("soTien");

  const imgBienso = {
    vao: {
      truoc: document.getElementById("bienso_truoc_vao"),
      sau: document.getElementById("bienso_sau_vao"),
    },
    ra: {
      truoc: document.getElementById("bienso_truoc_ra"),
      sau: document.getElementById("bienso_sau_ra"),
    },
  };

  let vehicleCounts = {
    car: { available: 300, parked: 0 },
    motorbike: { available: 250, parked: 0 },
    bike: { available: 100, parked: 0 },
  };

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

  function vehicleEnter(type) {
    if (vehicleCounts[type].available > 0) {
      vehicleCounts[type].available--;
      vehicleCounts[type].parked++;
      updateVehicleCount();
      alert(`🚗 Xe ${type} đã vào.`);
    } else {
      alert(`❌ Bãi đã đầy, không còn chỗ cho xe ${type}.`);
    }
  }

  function vehicleExit(type) {
    if (vehicleCounts[type].parked > 0) {
      vehicleCounts[type].available++;
      vehicleCounts[type].parked--;
      updateVehicleCount();
      alert(`🚗 Xe ${type} đã rời khỏi.`);
    } else {
      alert(`❌ Không có xe ${type} trong bãi.`);
    }
  }

  function switchLane() {
    currentLane = currentLane === "vao" ? "ra" : "vao";
    capturedImages = { truoc: null, sau: null };
    alert(`🔄 Đã chuyển sang làn xe ${currentLane === "vao" ? "vào" : "ra"}!`);
  }

  async function startWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
    } catch (error) {
      console.error("Lỗi webcam:", error);
    }
  }

  function saveImage(imageData, fileName) {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getCurrentTime() {
    return new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  }

  captureButton.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 1.0);

    // Gán cùng một ảnh cho cả biển số trước và sau (giả lập chụp cùng lúc)
    imgBienso[currentLane]["truoc"].src = imageData;
    imgBienso[currentLane]["sau"].src = imageData;

    // Lưu 2 ảnh (có thể đổi tên nếu bạn có ảnh riêng biệt sau này)
    saveImage(imageData, `bienso_truoc_${currentLane}.jpg`);
    saveImage(imageData, `bienso_sau_${currentLane}.jpg`);

    // Giả lập biển số và cập nhật giao diện
    bienSoEl.textContent = "08386";
    if (currentLane === "vao") {
      thoiGianVaoEl.textContent = getCurrentTime();
      thoiGianRaEl.textContent = "---";
      soTienEl.textContent = "---";
      vehicleEnter("car");
    } else {
      thoiGianRaEl.textContent = getCurrentTime();
      soTienEl.textContent = "30.000 VND";
      vehicleExit("car");
    }
  });

  switchLaneButton.addEventListener("click", switchLane);

  startWebcam();
  updateVehicleCount();
});
