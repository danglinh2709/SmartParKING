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

// const form = document.querySelector("form");
// form.addEventListener("submit", function () {
//   alert(
//     "Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể."
//   );
//   form.reset();
// });
const form = document.querySelector("form");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = {
    firstName: document.getElementById("first-name").value,
    lastName: document.getElementById("last-name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
  };

  try {
    const res = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.msg || "Gửi thất bại");
      return;
    }

    alert("✅ Tin nhắn đã được gửi thành công!");
    form.reset();
  } catch (err) {
    alert("❌ Không thể gửi email");
    console.error(err);
  }
});
