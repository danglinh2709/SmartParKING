document.addEventListener("DOMContentLoaded", async () => {
  const ticket = localStorage.getItem("parking_ticket");
  if (!ticket) {
    alert("Không tìm thấy vé");
    return (location.href = "/frontend/trangchu/index.html");
  }

  const res = await fetch("http://localhost:5000/api/qr/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket }),
  });

  const result = await res.json();
  if (!res.ok) {
    alert(result.msg);
    return;
  }

  const d = result.data;

  document.getElementById("ticketCode").textContent = d.ticket;
  document.getElementById("spotNumber").textContent = d.spot_number;
  document.getElementById("startTime").textContent = new Date(
    d.start_time
  ).toLocaleString("vi-VN");
  document.getElementById("endTime").textContent = new Date(
    d.end_time
  ).toLocaleString("vi-VN");

  document.getElementById("qrTicket").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
    encodeURIComponent(d.ticket);
});

/* ===== SAVE ===== */
function saveTicket() {
  const actions = document.querySelector(".ticket-actions");
  actions.style.display = "none";

  html2canvas(document.getElementById("ticket-card"), { scale: 2 }).then(
    (canvas) => {
      const a = document.createElement("a");
      a.download = `ticket_${Date.now()}.png`;
      a.href = canvas.toDataURL();
      a.click();
      actions.style.display = "flex";
    }
  );
}

function goHome() {
  location.href = "/frontend/trangchu/index.html";
}
