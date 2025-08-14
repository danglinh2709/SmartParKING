// thanh cuộn
// let lastScroll = window.scrollY;   vị trí cuối cùng khi ng dùng cuộn trang
// const navbar = document.getElementById("navbar");

// window.addEventListener("scroll", () => {
//   const currentScroll = window.scrollY;
// -> vị trí cuộn hiên tại của trang web
//   if (currentScroll > lastScroll && currentScroll > 50) {   ấn thanh cuộn
//     navbar.classList.add("hide-navbar");
//   } else {  nếu thanh cuộn htai nhỏ hơn thanh cuộn cuối (nghĩa là đang cuộn lên), hoặc < 50px thì xoá
// hide-narbav là ẩn thanh cuộn đi, nếu áp dụng else thì phải xoá thanh cuộn để hiển thị lại thanh cuộn lên
//     navbar.classList.remove("hide-navbar");
//   }

//   lastScroll = currentScroll;

/*Giải thích theo cách cực đơn giản:
Khi một lần cuộn xảy ra (scroll event), trình duyệt sẽ lấy ra vị trí hiện tại của cuộn (ví dụ: bạn cuộn xuống 100px).
Sau khi xử lý xong (ẩn/hiện navbar tùy hướng cuộn), chúng ta lưu lại giá trị 100px đó.
Giá trị đó được gán vào lastScroll để lần sau cuộn tiếp, mình có cái để so sánh.
⮕ Mục tiêu: mỗi lần cuộn phải nhớ vị trí mới nhất, chứ không để nó giữ giá trị cũ.
*/
// });

let lastScroll = window.scrollX;
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  if (currentScroll > lastScroll && currentScroll > 50) {
    navbar.classList.add("hide-navbar");
  } else {
    navbar.classList.remove("hide-navbar");
  }
  lastScroll = currentScroll;
});

// js cho chạy hiệu ứng khi cuộn xuống
// document.addEventListener("DOMContentLoaded", () => {
//   const observer = new IntersectionObserver(
//     (entries, obs) => {
//       entries.forEach((entry) => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add("active");
//           obs.unobserve(entry.target); // chỉ chạy một lần
//         }
//       });
//     },
//     { threshold: 0.1 }
//   );

//   document
//     .querySelectorAll(
//       ".footer-column, .skew-animate, .anh,.gioithieu,.a,.slide-in-left, .slide-in-right, .slide-in-up "
//     )
//     .forEach((el) => {
//       observer.observe(el);
//     });
// });

// đơn giản hoá
window.addEventListener("scroll", function () {
  document
    .querySelectorAll(
      ".footer-column, .skew-animate, .anh, .gioithieu, .a, .slide-in-left, .slide-in-right, .slide-in-up"
    )
    .forEach(function (item) {
      if (item.getBoundingClientRect().top < window.innerHeight) {
        //kiểm tra xem phần tử có đang hiển thị trong cửa sổ trình duyệt hay không
        item.classList.add("active");
      }
    });
});

// function (item) là hàm callback, đc truyền vào forEach để thực thiện với từng phần tử trong mảng
// item.getBoundingClientRect().top: đo kc từ đỉnh cửa sổ trình duyệt đến đỉnh phần tử
// window.innerHeight: đo chiều cao của cửa số trình duyệt
