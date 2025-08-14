// hiển thị thông báo khi ấn vào send message

// DOMContentLoaded  ở đây có vai trò đảm bảorằng form đã tồn tạitrên trang r mới gán sự kiện submit
// document.addEventListener("DOMContentLoaded", function () {
//   const form = document.querySelector("form");

//   form.addEventListener("submit", function () {
//     alert(
//       "Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể."
//     );

//     // Reset lại form
//     form.reset();
//   });
// });

// cách dễ hiểu hơn (nhưng
// 1. hoặc là đặt scr ở cuối
// 2. nếu đặt đầu phải thêm defer : <head>  <script src="script.js" defer></script> </head>
// 3. dùng DOMContentLoaded

const form = document.querySelector("form");
form.addEventListener("submit", function () {
  alert(
    "Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể."
  );
  form.reset();
});
