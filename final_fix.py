import sys

file_path = "f:\\FT\\index.html"

# Correct Professional Testimonials
testimonials_html = """
            <div class="testimonial-card testimonial-cyan">
                <div class="testimonial-quote">
                    <span class="quote-mark">&ldquo;</span>
                    FinTop là đơn vị uy tín chuyên cung cấp dữ liệu, kiến thức thực tế, chiến lược đầu tư và các báo cáo phân tích kịp thời, vô cùng hữu dụng cho nhà đầu tư và cả các chuyên gia về chứng khoán. Với chiến lược và cách làm chuyên nghiệp, đặc biệt Đội ngũ FinTop với nhiều năm kinh nghiệm trên thị trường sẽ giúp nhà đầu tư tối ưu hiệu quả và đạt được lợi nhuận tốt nhất trong quá trình giao dịch. Với sự hỗ trợ từ FinTop nhà đầu tư sẽ thông thái, chủ động với việc đầu tư và kỷ luật với chiến lược giao dịch đã đề ra.
                    <span class="quote-mark">&rdquo;</span>
                </div>
                <div class="testimonial-author">
                    <img src="assets/images/anh_Long.png" alt="Anh Lê Văn Long" class="testimonial-avatar">
                    <div>
                        <h4 class="testimonial-name">Anh Lê Văn Long</h4>
                        <p class="testimonial-role">Giám đốc Tư vấn đầu tư — Công ty Cổ phần Chứng khoán VPS</p>
                    </div>
                </div>
            </div>

            <div class="testimonial-card testimonial-pink">
                <div class="testimonial-quote">
                    <span class="quote-mark">&ldquo;</span>
                    FINTOP là nơi tập hợp tinh hoa của đội ngũ chuyên gia trẻ, năng động, có kinh nghiệm thực chiến trên thị trường chứng khoán, vừa có kiến thức chuyên sâu về phân tích cơ bản và vừa có độ nhạy bén trong phân tích kỹ thuật. Đây là một trang web uy tín, đáng tin cậy, giúp cung cấp các phân tích và cập nhật thị trường, chọn lọc cổ phiếu. Ngoài ra, đội ngũ chuyên gia của FINTOP cũng thường xuyên cung cấp các phân tích chiến lược đầu tư hay có các báo cáo phân tích ngành và phân tích doanh nghiệp, giúp cho nhà đầu tư có căn cứ để đưa ra các quyết định đầu tư sáng suốt. Nếu nhà đầu tư chưa có nhiều kiến thức, kinh nghiệm, hoặc không có nhiều thời gian để tìm hiểu và nghiên cứu về chứng khoán thì FINTOP chính là người đồng hành tuyệt vời của nhà đầu tư.
                    <span class="quote-mark">&rdquo;</span>
                </div>
                <div class="testimonial-author">
                    <img src="assets/images/chi_Helena.png" alt="Chị Helena Hạnh Đặng" class="testimonial-avatar">
                    <div>
                        <h4 class="testimonial-name">Chị Helena Hạnh Đặng</h4>
                        <p class="testimonial-role">Chuyên gia Đào tạo Tài chính cá nhân — Khách hàng đối tác</p>
                    </div>
                </div>
            </div>

            <div class="testimonial-card testimonial-green">
                <div class="testimonial-quote">
                    <span class="quote-mark">&ldquo;</span>
                    FinTop là một đội ngũ chuyên nghiệp, không ngừng nghiên cứu, học hỏi, cầu thị và luôn luôn lắng nghe khách hàng, đối tác. Những báo cáo phân tích, đánh giá của Team mang lại nhiều hữu ích cho mình là một người công tác trong lĩnh vực Tài chính với các báo cáo phân tích ngành, dữ liệu kinh tế vĩ mô, phân tích đánh giá doanh nghiệp. Đặc biệt có phần tra cứu xu hướng cổ phiếu rất hay bên cạnh chia sẻ cẩm nang, phương pháp đầu tư để mọi người cùng tìm hiểu. Chúc FinTop Team sẽ tiếp tục phát huy và luôn có những báo cáo phân tích chất lượng nhất đến khách hàng.
                    <span class="quote-mark">&rdquo;</span>
                </div>
                <div class="testimonial-author">
                    <img src="assets/images/chi_Lich.png" alt="Chị Trần Thị Hồng Lịch" class="testimonial-avatar">
                    <div>
                        <h4 class="testimonial-name">Chị Trần Thị Hồng Lịch</h4>
                        <p class="testimonial-role">Nhà Đầu Tư — Khách Hàng Đối Tác FinTop</p>
                    </div>
                </div>
            </div>
"""

# Correct Expanded Footer
footer_html = """<footer style="position: relative; z-index: 10; background: #07070D;">
        <div class="footer-grid" style="grid-template-columns: 1.2fr 1fr 1fr 1fr; gap: 2rem;">
            <div>
                <h2 class="logo">FinTop DATA</h2>
                <p style="margin-top: 1rem;">Nơi hội tụ Data - Chuyên gia - Công nghệ &amp; AI.</p>
            </div>
            <div>
                <h4 style="color: #fff; margin-bottom: 1rem; font-size: 0.95rem;">Sản phẩm</h4>
                <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                    <a href="hoi-vien/index.html">Hội Viên</a>
                    <a href="fintop-data/index.html">FinTop Data</a>
                    <a href="chuyen-gia/index.html">Chuyên Gia</a>
                    <a href="fintop-ai/index.html">FinTop AI</a>
                    <a href="stock-data/index.html">Stock Data</a>
                    <a href="huong-dan/index.html">Hướng Dẫn</a>
                </div>
            </div>
            <div>
                <h4 style="color: #fff; margin-bottom: 1rem; font-size: 0.95rem;">Liên hệ</h4>
                <div style="display: flex; flex-direction: column; gap: 0.6rem; color: #94A3B8;">
                    <p style="display: flex; align-items: center; gap: 6px;"><img src="assets/images/icons8-phone-color-hand-drawn-favicons/web/icons8-phone-color-hand-drawn-32.png" alt="Phone" width="20" height="20" style="vertical-align: middle;"> Hotline: <a href="tel:0862348886" style="color: #c084fc;">086.234.8886</a></p>
                    <p style="display: flex; align-items: center; gap: 6px;">📧 Email: <a href="mailto:DVKH@fintopdata.vn" style="color: #c084fc;">DVKH@fintopdata.vn</a></p>
                    <p style="display: flex; align-items: center; gap: 6px;">📍 65 Ô Chợ Dừa, Đống Đa, Hà Nội</p>
                </div>
            </div>
            <div style="text-align: center;">
                <h4 style="color: #fff; margin-bottom: 1rem; font-size: 0.95rem;">Tải ứng dụng</h4>
                <div style="display: flex; flex-direction: column; gap: 0.8rem; align-items: center;">
                    <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 16px; color: #fff; font-size: 0.85rem; transition: all 0.3s ease; text-decoration: none;">
                        <img src="assets/images/icons8-app-store-color-favicons/web/icons8-app-store-color-32.png" alt="App Store" width="20" height="20"> App Store
                    </a>
                    <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 16px; color: #fff; font-size: 0.85rem; transition: all 0.3s ease; text-decoration: none;">
                        <img src="assets/images/icons8-google-play-windows-11-color-favicons/web/icons8-google-play-windows-11-color-32.png" alt="Google Play" width="20" height="20"> Google Play
                    </a>
                    <div style="margin-top: 0.5rem; background: #fff; border-radius: 8px; padding: 8px; display: inline-block;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&amp;data=https://zalo.me/fintopdata" alt="QR Zalo" width="80" height="80" style="display: block;">
                    </div>
                    <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 0.8rem; color: #94A3B8;"><img src="assets/images/icons8-zalo-color-hand-drawn-favicons/web/icons8-zalo-color-hand-drawn-32.png" alt="Zalo" width="18" height="18"> Zalo FinTop</span>
                </div>
            </div>
        </div>
        <div style="max-width: 1200px; margin: 2rem auto 0; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <p>© 2026 FinTop DATA. All rights reserved.</p>
        </div>
        <div class="footer-disclaimer">
            <strong>Miễn trừ trách nhiệm:</strong> Dữ liệu chỉ mang tính chất tham khảo, không phải khuyến nghị đầu tư.
            Người dùng chịu hoàn toàn trách nhiệm trước các quyết định giao dịch của mình.
        </div>
    </footer>"""

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 1. Restore Testimonials
    t_start = content.find('<div class="testimonial-grid">') + len('<div class="testimonial-grid">')
    t_end = content.find('</section>', t_start)
    if t_start != -1 and t_end != -1:
        # Find the last </div> before the section end
        t_real_end = content.rfind('</div>', t_start, t_end) + len('</div>')
        content = content[:t_start] + testimonials_html + content[t_real_end:]

    # 2. Restore Footer
    f_start = content.find('<footer')
    f_end = content.find('</footer>') + len('</footer>')
    if f_start != -1 and f_end != -1:
        content = content[:f_start] + footer_html + content[f_end:]

    # 3. Fix Pricing Grid Alignment
    content = content.replace('text-align: left;', 'text-align: left;\\n            align-items: stretch;')
    
    # 4. Fix Pricing Features flex
    content = content.replace('margin-bottom: auto;', 'flex: 1 1 auto;\\n            margin-bottom: 1.5rem;')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Final cleanup and fix complete.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
