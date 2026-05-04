/**
 * ===================================================
 * counter.js — Hiệu ứng đếm số (Number Counter)
 * ===================================================
 * Mô tả: Tạo hiệu ứng đếm tăng dần cho các thống kê
 *         (ví dụ: "1,200+ Cổ phiếu", "50+ Chuyên gia")
 *         khi phần tử xuất hiện trong viewport.
 * Phụ thuộc: Không có (Vanilla JS)
 * Sử dụng bởi: index.html — Phần thống kê (stats section)
 * ===================================================
 */

/**
 * Hàm tạo hiệu ứng đếm số tăng dần
 * @param {HTMLElement} el - Phần tử HTML chứa số
 * @param {number} target - Giá trị đích cần đếm tới
 * @param {number} duration - Thời gian hiệu ứng (ms), mặc định 2000ms
 */
function animateCounter(el, target, duration = 2000) {
  const start = 0;
  const step = target / (duration / 16); // Tính bước nhảy mỗi frame (~60fps)
  let current = start;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { 
        current = target; 
        clearInterval(timer); // Dừng khi đạt giá trị đích
    }
    // Hiển thị số với dấu phân cách hàng nghìn + hậu tố (nếu có)
    el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || '');
  }, 16); // 16ms ≈ 60fps
}

/**
 * Khởi tạo: Theo dõi các phần tử có class 'stat-number'
 * Khi phần tử hiện trong viewport (50%), bắt đầu đếm số
 */
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll('.stat-number');
  
  // Sử dụng IntersectionObserver để phát hiện phần tử trong viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetValue = parseInt(el.dataset.target, 10);
        // Đảm bảo chỉ chạy hiệu ứng 1 lần
        if(!el.classList.contains('animated')) {
            animateCounter(el, targetValue);
            el.classList.add('animated');
        }
      }
    });
  }, { threshold: 0.5 }); // Kích hoạt khi 50% phần tử hiện trong viewport

  counters.forEach(counter => observer.observe(counter));
});
