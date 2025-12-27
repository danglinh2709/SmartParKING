document.addEventListener("DOMContentLoaded", async () => {
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
  const ticketInfo = document.getElementById("ticketInfo");
  const verifyBtn = document.getElementById("verifyBtn");
  const qrBtn = document.getElementById("qrBtn");
  const confirmBtn = document.getElementById("confirmBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  /* ========= CAMERAS ========= */
  const camQR = document.getElementById("camQR");
  const camFront = document.getElementById("camFront");
  const camBack = document.getElementById("camBack");

  const qrCanvas = document.getElementById("qrCanvas");
  const qrCtx = qrCanvas.getContext("2d");

  const canvasFront = document.getElementById("canvasFront");
  const ctxFront = canvasFront.getContext("2d");

  const canvasBack = document.getElementById("canvasBack");
  const ctxBack = canvasBack.getContext("2d");

  /* ========= OPEN MULTI CAMERAS ========= */
  async function openCamera(videoEl, deviceId) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
    });
    videoEl.srcObject = stream;
  }

  async function openAllCameras() {
    await navigator.mediaDevices.getUserMedia({ video: true });

    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter((d) => d.kind === "videoinput");

    if (!cams.length) {
      alert("Không tìm thấy camera");
      return;
    }

    await openCamera(camQR, cams[0].deviceId); // QR
    if (cams[1]) await openCamera(camFront, cams[1].deviceId); // trước
    if (cams[2]) await openCamera(camBack, cams[2].deviceId); // sau
  }
  async function openQRCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camQR.srcObject = stream;
  }

  await openQRCamera();
  async function openPlateCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter((d) => d.kind === "videoinput");

    if (cams.length < 1) throw new Error("Không có camera");

    // hiện video
    camFront.style.display = "block";
    camBack.style.display = "block";

    // cam trước
    if (cams[1]) {
      camFront.srcObject = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: cams[1].deviceId } },
      });
    } else {
      camFront.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
    }

    // cam sau
    if (cams[2]) {
      camBack.srcObject = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: cams[2].deviceId } },
      });
    } else {
      camBack.srcObject = camFront.srcObject;
    }

    // đợi camera sẵn sàng
    await new Promise((r) => setTimeout(r, 800));
  }

  /* ========= VERIFY TICKET ========= */
  verifyBtn.onclick = async () => {
    const ticket = ticketInput.value.trim();
    if (!ticket) {
      ticketInfo.innerHTML = `<div class="ticket-status error">❌ Vui lòng nhập hoặc quét mã vé</div>`;
      confirmBtn.disabled = true;
      return;
    }

    ticketInfo.innerHTML = `<div class="ticket-status pending">⏳ Đang kiểm tra vé...</div>`;
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);

      currentReservation = data;
      confirmBtn.disabled = false;

      ticketInfo.innerHTML = `
        <div class="ticket-status success"> Vé hợp lệ</div>
        <div class="ticket-grid">
          <div class="ticket-label">🎟 Mã vé</div><div>${data.ticket}</div>
          <div class="ticket-label">🚗 Biển số</div><div>${
            data.license_plate
          }</div>
          <div class="ticket-label">🏢 Bãi xe</div><div>${
            data.parking_name
          }</div>
          <div class="ticket-label">📍 Vị trí</div><div>Ô ${
            data.spot_number
          }</div>
          <div class="ticket-label">🕒 Bắt đầu</div>
          <div>${new Date(data.start_time).toLocaleString("vi-VN")}</div>
          <div class="ticket-label">⏰ Hết hạn</div>
          <div>${new Date(data.end_time).toLocaleString("vi-VN")}</div>
        </div>
      `;
    } catch (e) {
      confirmBtn.disabled = true;
      ticketInfo.innerHTML = `<div class="ticket-status error">❌ ${e.message}</div>`;
    }
  };

  /* ========= CHECK-IN ========= */
  // confirmBtn.onclick = async () => {
  //   if (!currentReservation) return;

  //   const imgFront = capture(camFront, canvasFront, ctxFront);
  //   const imgBack = capture(camBack, canvasBack, ctxBack);

  //   confirmBtn.disabled = true;

  //   try {
  //     const res = await fetch(`${API}/check-in`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         ticket_code: currentReservation.ticket,
  //         parking_lot_id: parkingLotId,
  //         image_front: imgFront,
  //         image_back: imgBack,
  //       }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.msg);

  //     alert("🚗 Xe đã vào bãi");
  //     location.reload();
  //   } catch (e) {
  //     alert(e.message);
  //     confirmBtn.disabled = false;
  //   }
  // };
  confirmBtn.onclick = async () => {
    if (!currentReservation) return;

    confirmBtn.disabled = true;

    try {
      await openPlateCameras();

      if (!camFront.videoWidth || !camBack.videoWidth) {
        throw new Error("Camera chưa sẵn sàng");
      }

      const imgFront = capture(camFront, canvasFront, ctxFront);
      const imgBack = capture(camBack, canvasBack, ctxBack);

      const res = await fetch(`${API}/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticket_code: currentReservation.ticket,
          parking_lot_id: parkingLotId,
          image_front: imgFront,
          image_back: imgBack,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);

      alert("🚗 Xe đã vào bãi");
      location.reload();
    } catch (e) {
      alert(e.message);
      confirmBtn.disabled = false;
    }
  };

  function capture(video, canvas, ctx) {
    if (!video.videoWidth) throw new Error("Camera chưa sẵn sàng");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9);
  }

  /* ========= QR SCAN ========= */
  qrBtn.onclick = () => {
    const timer = setInterval(() => {
      if (camQR.readyState !== camQR.HAVE_ENOUGH_DATA) return;

      qrCanvas.width = camQR.videoWidth;
      qrCanvas.height = camQR.videoHeight;
      qrCtx.drawImage(camQR, 0, 0);

      const img = qrCtx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
      const code = jsQR(img.data, qrCanvas.width, qrCanvas.height);

      if (code) {
        clearInterval(timer);
        const match = code.data.match(/TICKET-[A-Za-z0-9]+/);
        if (match) {
          ticketInput.value = match[0];
          verifyBtn.click();
        }
      }
    }, 300);
  };

  logoutBtn.onclick = () => {
    localStorage.clear();
    location.href = "../login/dangnhap.html";
  };
});
