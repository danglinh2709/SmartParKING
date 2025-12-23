async function expireParking() {
  const ticket = localStorage.getItem("parking_ticket");

  if (!ticket) {
    console.warn("Không có ticket trong localStorage");
    return;
  }

  try {
    const res = await fetch(`${API}/reservations/expire`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("sp_token")}`,
      },
      body: JSON.stringify({ ticket }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg);
      return;
    }

    showToast("⛔ Hết giờ đỗ – chỗ đã được giải phóng");
    localStorage.removeItem("parking_ticket");
  } catch (err) {
    console.error(err);
  }
}
