/**
 * ===================================================
 * scroll-animation.js — Hiệu ứng cuộn điện ảnh (Cinematic Scroll)
 * ===================================================
 * Mô tả: Tạo hiệu ứng chuyển cảnh mượt mà giữa các section
 *         khi người dùng cuộn trang (scroll-driven animation).
 *         Sử dụng GSAP ScrollTrigger để pin container và điều
 *         khiển timeline theo vị trí cuộn.
 * Phụ thuộc: GSAP 3.12.5 + ScrollTrigger plugin (CDN)
 * Sử dụng bởi: index.html — Phần cinematic-container
 * ===================================================
 */

document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger);

  // ─────────────────────────────────────────────────
  // 1. TIMELINE ĐIỆN ẢNH (Chuyển cảnh Scene 1 → Scene 2)
  // ─────────────────────────────────────────────────
  // Tạo Timeline gắn liền với thẻ #cinematic-container
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#cinematic-container",
      start: "top top",      
      end: "+=200%",         // Giữ container (pin) trong suốt khoảng cuộn gấp 2x màn hình
      pin: true,
      scrub: 1               // Nối tiếp hiệu ứng mượt mà theo cuộn chuột
    }
  });

  // PHẦN 1: Chuyển cảnh — Hiệu ứng "Lao vào" (Dive In)
  tl.to(".scene-1", {
    scale: 5,                  // Phóng to gấp 5 lần
    opacity: 0,                // Mờ dần
    filter: "blur(20px)",      // Làm nhòe
    duration: 1.2,
    ease: "power3.in"          // Tăng tốc mạnh ở cuối
  })

  // Bắn chớp sáng màu tím để che giấu sự chuyển đổi
  .to(".flash-overlay", {
    opacity: 1,
    duration: 0.3
  }, "-=0.3") // Chồng lấp 0.3s với hiệu ứng trước

  // PHẦN 2: Lộ diện cảnh mới (Reveal Scene 2)
  .set(".scene-1", { visibility: "hidden" })  // Ẩn Scene 1
  .set(".scene-2", { visibility: "visible" }) // Hiện Scene 2

  // Khối AI trung tâm — zoom ngược từ xa lại gần
  .fromTo(".scene-2", 
    { scale: 0.5, opacity: 0 }, 
    { scale: 1, opacity: 1, duration: 1, ease: "power2.out" }
  )

  // Tắt chớp sáng
  .to(".flash-overlay", { opacity: 0, duration: 0.5 }, "<") // "<" = chạy đồng thời

  // PHẦN 3: Các bảng tính năng Pop-up hiện lên
  .fromTo(".panel", 
    { y: 100, opacity: 0, scale: 0.8 }, 
    { 
      y: 0, 
      opacity: 1, 
      scale: 1, 
      duration: 1, 
      stagger: 0.15,         // Lệch thời gian giữa các panel
      ease: "back.out(1.2)"  // Hiệu ứng bật nảy nhẹ
    }, 
    "-=0.5" // Bắt đầu sớm hơn 0.5s
  );

  // ─────────────────────────────────────────────────
  // 1.5. HIỆU ỨNG LẮNG ĐỌNG — Panel trôi nổi (Floating)
  // ─────────────────────────────────────────────────
  // Sau khi user cuộn xong chuỗi timeline, mới thả cho panel bay lên xuống
  let isFloating = false;
  ScrollTrigger.create({
    trigger: "#cinematic-container",
    start: "top top",
    end: "+=200%",
    onLeave: () => {
       if(!isFloating) {
          gsap.to(".panel", {
            y: -15,               // Bay lên 15px
            duration: 2, 
            yoyo: true,           // Lặp qua lại (lên/xuống)
            repeat: -1,           // Lặp vô hạn
            ease: "sine.inOut",   // Chuyển động mượt mà
            stagger: 0.2          // Lệch pha giữa các panel
          });
          isFloating = true;
       }
    }
  });

  // ─────────────────────────────────────────────────
  // 2. HIỆU ỨNG TRỒI LÊN — Terminal Showcase
  // ─────────────────────────────────────────────────
  gsap.from(".showcase-mockup-wrapper", {
    opacity: 0,
    y: 100,
    scale: 0.95,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".product-showcase",
      start: "top 80%" // Kích hoạt khi đỉnh section cách đáy viewport 20%
    }
  });

  // ─────────────────────────────────────────────────
  // 3. HIỆU ỨNG CÒN LẠI — Bảng giá (Pricing Cards)
  // ─────────────────────────────────────────────────
  gsap.from(".pricing-card", {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.15,           // Hiện lần lượt từng card
    ease: "back.out(1.7)",   // Nảy nhẹ khi dừng
    scrollTrigger: {
      trigger: ".pricing-grid",
      start: "top 80%",
    }
  });

  // (Video Background đã chuyển sang chế độ AutoPlay Loop ở index.html)
});
