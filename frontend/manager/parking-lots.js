const API = "http://localhost:5000/api";

async function loadParkingLots() {
  try {
    const token = localStorage.getItem("sp_token");

    const res = await fetch(`${API}/manager/parking-lots`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Không tải được danh sách bãi");

    const data = await res.json();
    const tbody = document.getElementById("parkingTable");

    tbody.innerHTML = "";

    data.forEach((p) => {
      const usedSpots = p.total_spots - p.available_spots;
      const ratio = usedSpots / p.total_spots;

      let statusClass = "active";
      let statusText = "Hoạt động";

      if (ratio > 0.9) {
        statusClass = "full";
        statusText = "Gần đầy";
      } else if (ratio > 0.7) {
        statusClass = "warning";
        statusText = "Sắp đầy";
      }

      tbody.innerHTML += `
        <tr>
          <td>${p.name}</td>
          <td>${p.total_spots}</td>
          <td>${p.available_spots}</td>
          <td class="status ${statusClass}">● ${statusText}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
    alert("Lỗi tải danh sách bãi đỗ");
  }
}

loadParkingLots();
