const META_PIXEL_ID = "1095959689843566";

// Khởi tạo Meta Pixel Base Code
!function(f,b,e,v,n,t,s){
  if(f.fbq)return;
  n=f.fbq=function(){
    n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
  };
  if(!f._fbq)f._fbq=n;
  n.push=n;
  n.loaded=!0;
  n.version="2.0";
  n.queue=[];
  t=b.createElement(e);
  t.async=!0;
  t.src=v;
  s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s);
}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");

fbq("init", META_PIXEL_ID);
// Tự động gửi PageView cho bất kỳ trang nào nhúng script.js
fbq("track", "PageView");

// Hàm chuẩn hóa gửi sự kiện về Facebook
function track(eventName, params = {}) {
  console.log("[META]", eventName, params);
  if (typeof fbq === "function") {
    fbq("track", eventName, params);
  }
}

/* ================= COURSE PAGE ================= */
if (location.pathname.endsWith("course.html")) {
  const params = new URLSearchParams(location.search);
  const course = params.get("course") || "performance-101";

  const data = {
    "marketing-101": ["Marketing Fundamentals", 499000],
    "performance-101": ["Performance Marketing 101", 699000],
    "analytics-101": ["Marketing Analytics 101", 599000]
  }[course] || ["Performance Marketing 101", 699000];

  const title = document.getElementById("courseTitle");
  const price = document.getElementById("coursePrice");

  if (title) title.textContent = data[0];
  if (price) price.textContent = data[1].toLocaleString("vi-VN") + "đ";

  // Bắn sự kiện ViewContent khi xem chi tiết khóa học
  track("ViewContent", {
    content_name: data[0],
    content_ids: [course],
    content_type: "product",
    value: data[1],
    currency: "VND"
  });

  const addToCartBtn = document.getElementById("addToCartBtn");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      localStorage.setItem("selectedCourse", course);
      localStorage.setItem("selectedPrice", data[1]);

      // Bắn sự kiện AddToCart
      track("AddToCart", {
        content_name: data[0],
        content_ids: [course],
        content_type: "product",
        value: data[1],
        currency: "VND"
      });

      alert("Đã thêm khóa học " + data[0] + " vào giỏ hàng!");
    });
  }
}

/* ================= CHECKOUT PAGE ================= */
if (location.pathname.endsWith("checkout.html")) {
  const select = document.getElementById("courseSelect");

  if (select) {
    // Tự chọn khóa học nếu khách đã chọn từ trang course trước đó
    const preSelected = localStorage.getItem("selectedCourse");
    if (preSelected && select.querySelector(`option[value="${preSelected}"]`)) {
      select.value = preSelected;
    }

    const updateTotal = () => {
      const price = Number(select.selectedOptions[0].dataset.price);
      const total = document.getElementById("total");
      if (total) {
        total.textContent = price.toLocaleString("vi-VN") + "đ";
      }
    };

    updateTotal();
    select.addEventListener("change", updateTotal);

    // Bắn sự kiện InitiateCheckout khi vào trang thanh toán
    track("InitiateCheckout", {
      content_ids: [select.value],
      content_type: "product",
      value: Number(select.selectedOptions[0].dataset.price),
      currency: "VND"
    });

    const checkoutForm = document.getElementById("checkoutForm");

    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const option = select.selectedOptions[0];
        const price = Number(option.dataset.price);
        const course = option.value;

        // Bắn sự kiện Purchase khi hoàn tất đăng ký
        track("Purchase", {
          content_ids: [course],
          content_type: "product",
          value: price,
          currency: "VND"
        });

        localStorage.setItem("lastPurchase", JSON.stringify({
          course: course,
          price: price,
          orderId: "LH-" + Date.now()
        }));

        setTimeout(() => {
          window.location.href = "success.html";
        }, 800);
      });
    }
  }
}

/* ================= SUCCESS PAGE ================= */
if (location.pathname.endsWith("success.html")) {
  const order = JSON.parse(localStorage.getItem("lastPurchase") || "{}");
  const orderId = document.getElementById("orderId");

  if (orderId && order.orderId) {
    orderId.textContent = order.orderId;
  }
}
