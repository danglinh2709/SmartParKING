const API = "http://localhost:5000/api";

async function loadStaff() {
  try {
    const token = localStorage.getItem("sp_token");
    if (!token) {
      location.href = "../login.html";
      return;
    }

    const res = await fetch(`${API}/manager/staff`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Không tải được danh sách nhân viên");

    const data = await res.json();
    const tbody = document.getElementById("staffTable");

    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4">Chưa có nhân viên</td>
        </tr>
      `;
      return;
    }

    data.forEach((s) => {
      tbody.innerHTML += `
    <tr>
      <td>${s.full_name}</td>
      <td>${s.email}</td>
      <td>${s.parking_name || "Chưa phân công"}</td>
      <td class="status active">🟢 Hoạt động</td>
    </tr>
  `;
    });
  } catch (err) {
    console.error("STAFF JS ERROR:", err);
    alert("Lỗi tải danh sách nhân viên");
  }
}
async function loadAssignments() {
  try {
    const token = localStorage.getItem("sp_token");

    const res = await fetch(`${API}/manager/assignments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Không tải được danh sách phân công");

    const data = await res.json();
    const tbody = document.getElementById("assignmentTable");

    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">Chưa có phân công nào</td>
        </tr>
      `;
      return;
    }

    data.forEach((a) => {
      tbody.innerHTML += `
        <tr data-id="${a.id}">
          <td>${a.full_name}</td>
          <td>
            <span class="parking-text">${a.parking_name}</span>
          </td>
          <td><span class="badge">${a.access_code}</span></td>
          <td>${new Date(a.created_at).toLocaleString("vi-VN")}</td>
          <td>
            <button class="edit-btn" onclick="editAssignment(${
              a.id
            })">✏️ Sửa</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("LOAD ASSIGNMENTS ERROR:", err);
  }
}
function editAssignment(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const parkingCell = row.querySelector(".parking-text");
  const oldValue = parkingCell.textContent;

  let select = `<select class="edit-select">`;
  parkingData.forEach((p) => {
    select += `<option value="${p.id}">${p.name}</option>`;
  });
  select += `</select>`;

  parkingCell.innerHTML = select;

  const btn = row.querySelector(".edit-btn");
  btn.textContent = "💾 Lưu";
  btn.onclick = () => saveAssignment(id, row);
}
async function saveAssignment(id, row) {
  const select = row.querySelector(".edit-select");
  const newParkingId = select.value;

  const token = localStorage.getItem("sp_token");

  const res = await fetch(`${API}/manager/assignments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      parking_lot_id: newParkingId,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.msg || "Cập nhật thất bại");
    return;
  }

  alert("✅ Cập nhật phân công thành công");
  loadAssignments();
}

loadStaff();
