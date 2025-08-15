const tatcabaido = [
  {
    name: "Bãi xe Trường Chinh - Hà Nội",
    image: "/smart parking/ảnh/bai7.png",
  },
  {
    name: "Bãi xe Lê Duẩn - Hà Nội",
    image: "/smart parking/ảnh/bai2.jpg",
  },
  {
    name: "Bãi xe Láng Hạ - Hà Nội",
    image: "/smart parking/ảnh/automated.webp",
  },
  {
    name: "Bãi xe Nguyễn Văn Cừ - TP.HCM",
    image: "/smart parking/ảnh/2.jpg",
  },
  {
    name: "Bãi xe Lê Lợi - Huế",
    image: "/smart parking/ảnh/12.jpg",
  },
  {
    name: "Bãi xe Bạch Đằng - Đà Nẵng",
    image: "/smart parking/ảnh/bai1.jpg",
  },
  {
    name: "Bãi xe biển - Đà Nẵng",
    image: "/smart parking/ảnh/5.jpg",
  },
  {
    name: "Bãi xe Hà Đông - Hà Nội",
    image: "/smart parking/ảnh/bai2.jpg",
  },
  {
    name: "Bãi xe Nguyễn Văn Linh - Đà Nẵng",
    image: "/smart parking/ảnh/bai3.jpg",
  },
  {
    name: "Bãi xe CMT8 - TP.HCM",
    image: "/smart parking/ảnh/bai4.jpg",
  },
  {
    name: "Bãi xe Nguyễn Tất Thành - Cần Thơ",
    image: "/smart parking/ảnh/bai5.jpg",
  },
  {
    name: "Bãi xe Phạm Văn Đồng - Nha Trang",
    image: "/smart parking/ảnh/bai6.jpg",
  },
  {
    name: "Bãi xe Lý Thường Kiệt - TP.HCM",
    image: "/smart parking/ảnh/bai7.jpg",
  },
  {
    name: "Bãi xe Trường Chinh - Hà Nội",
    image: "/smart parking/ảnh/bai7.png",
  },
  {
    name: "Bãi xe Hùng Vương - Huế",
    image: "/smart parking/ảnh/bai8.jpg",
  },
  {
    name: "Bãi xe Xô Viết Nghệ Tĩnh - TP.HCM",
    image: "/smart parking/ảnh/bai9.jpg",
  },
  {
    name: "Bãi xe Hàm Nghi - TP.HCM",
    image: "/smart parking/ảnh/bai10.jpg",
  },
  {
    name: "Bãi xe Nguyễn Trãi - TP.HCM",
    image: "/smart parking/ảnh/bai15.jpg",
  },
  {
    name: "Bãi xe Phan Đăng Lưu - TP.HCM",
    image: "/smart parking/ảnh/bai11.jpg",
  },
  {
    name: "Bãi xe Trần Hưng Đạo - Hà Nội",
    image: "/smart parking/ảnh/bai12.jpg",
  },
  {
    name: "Bãi xe Võ Văn Kiệt - Đà Nẵng",
    image: "/smart parking/ảnh/bai13.jpg",
  },
  {
    name: "Bãi xe Nam Kỳ Khởi Nghĩa - TP.HCM",
    image: "/smart parking/ảnh/bai14.jpg",
  },
  {
    name: "Bãi xe Nguyễn Trãi - TP.HCM",
    image: "/smart parking/ảnh/bai15.jpg",
  },
  {
    name: "Bãi xe Lạc Long Quân - Hà Nội",
    image: "/smart parking/ảnh/bai16.jpg",
  },
];

window.onload = () => {
  document.getElementById("locationPrompt").style.display = "flex";
};

function yeucautruycapvitri(granted) {
  document.getElementById("thongbaovitri").style.display = "none"; // ẩn khung thông báo đi sau khi chọn đồng ý/từ chối truy cập
  document.getElementById("searchBar").style.display = "block"; // sau đó, hiển thị thanh tìm kiếm
  const container = document.getElementById("parkingList");
  container.style.display = "flex"; // đặt kiểu hiển thị của container(bãi đỗ xe) thành flex, theo dạng flexbox linh hoạt
  //   container.innerHTML = "";

  const cacbaido_dchienthi = granted ? tatcabaido.slice(0, 3) : tatcabaido;

  // lot: bãi đỗ
  cacbaido_dchienthi.forEach((lot) => {
    const card = document.createElement("div"); // tạo 1 thẻ div
    card.className = "parking-card"; // gán lớp css parking-card cho thẻ div
    //    thêm nội dung vào trong thẻ html
    card.innerHTML = `
        <img src="${lot.image}" alt="${lot.name}" style="width:100%; height:180px; object-fit:cover; border-radius:10px 10px 0 0;"/>
        <p style="padding:10px; font-weight:bold; text-align:center;">${lot.name}</p>
      `;

    card.onclick = () => showSpots(); // khi click vào thẻ card (div-đại diện cho từng bãi đỗ) thì hàm showSpots sẽ đc gọi: dùng để hiển thị thông tinchi tiết về bãi đỗ
    container.appendChild(card); //Thêm phần tử card (thẻ div vừa tạo) vào trong container (danh sách các bãi đậu xe). Lúc này, card sẽ xuất hiện trong trang web dưới dạng một phần tử con của container.
  });
}

// function filterParking(value) {
//   const container = document.getElementById("parkingList");
//   //   parkingList(chứa danh sách các thẻ bãi đậu xe).
//   const cards = container.querySelectorAll(".parking-card");
//   //Lấy tất cả các phần tử con có class "parking-card" trong container (mỗi thẻ là 1 bãi đậu xe).

//   cards.forEach((card) => {
//     //card: bãi đậu

//     // Kiểm tra xem văn bản trong thẻ (card) có chứa chuỗi tìm kiếm value (không phân biệt hoa thường) không.
//     const match = card.textContent.toLowerCase().includes(value.toLowerCase());
//     card.style.display = match ? "block" : "none";
//   });
// }

function showSpots() {
  document.getElementById("parkingList").style.display = "none";
  document.getElementById("searchBar").style.display = "none"; // Ẩn thanh tìm kiếm
  document.getElementById("legend").style.display = "flex"; // Hiện chú thích 2 ô đỏ xanh

  const container = document.getElementById("spotView");
  container.style.display = "grid"; //
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(50px, 1fr))";
  container.style.gap = "10px";
  //   container.innerHTML = "";

  for (let i = 0; i < 315; i++) {
    const spot = document.createElement("div");
    spot.className = "spot";
    if (Math.random() < 0.45) spot.classList.add("occupied"); // 0# chỗ bị chiếm

    spot.onclick = function () {
      if (spot.classList.contains("occupied")) return;
      container
        .querySelectorAll(".selected")
        .forEach((s) => s.classList.remove("selected"));
      spot.classList.add("selected");

      setTimeout(() => alert("Bạn đã chọn chỗ thành công"), 100); // sau 100ms thì hiển thị thông báo
      setTimeout(() => {
        // sau 300s thì hiển thị khung thanh toán
        document.getElementById("paymentModal").style.display = "flex";
      }, 300);
    };

    // spot: ô (chỗ đậu xe)

    container.appendChild(spot);
  }
}

function proceedToPayment() {
  window.location.href = "tra.html";
}
