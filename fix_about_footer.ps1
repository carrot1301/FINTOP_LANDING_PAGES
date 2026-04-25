# Fix encoding issues by reading as bytes and writing proper UTF-8
$file = "f:\FT\index.html"

# Read as raw bytes to get the actual content
$bytes = [IO.File]::ReadAllBytes($file)

# Check for BOM and decode accordingly
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    $content = [Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
} else {
    $content = [Text.Encoding]::UTF8.GetString($bytes)
}

# Fix the double-encoded Vietnamese in footer section
# The footer was written with wrong encoding, let's fix it by replacing
# the bad footer with correct one

$footerStart = $content.IndexOf('<footer')
$footerEnd = $content.IndexOf('</footer>') + '</footer>'.Length

$beforeFooter = $content.Substring(0, $footerStart)
$afterFooter = $content.Substring($footerEnd)

$correctFooter = @"
<footer style="position: relative; z-index: 10; background: #07070D;">
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
                    <p>Hotline: <a href="tel:0862348886" style="color: #c084fc;">086.234.8886</a></p>
                    <p>Email: <a href="mailto:DVKH@fintopdata.vn" style="color: #c084fc;">DVKH@fintopdata.vn</a></p>
                    <p>Địa chỉ: 65 Ô Chợ Dừa, Đống Đa, Hà Nội</p>
                </div>
            </div>
            <div style="text-align: center;">
                <h4 style="color: #fff; margin-bottom: 1rem; font-size: 0.95rem;">Tải ứng dụng</h4>
                <div style="display: flex; flex-direction: column; gap: 0.8rem; align-items: center;">
                    <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 16px; color: #fff; font-size: 0.85rem; transition: all 0.3s ease; text-decoration: none;">
                        App Store
                    </a>
                    <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 16px; color: #fff; font-size: 0.85rem; transition: all 0.3s ease; text-decoration: none;">
                        Google Play
                    </a>
                    <div style="margin-top: 0.5rem; background: #fff; border-radius: 8px; padding: 8px; display: inline-block;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&amp;data=https://zalo.me/fintopdata" alt="QR Zalo" width="80" height="80" style="display: block;">
                    </div>
                    <span style="font-size: 0.8rem; color: #94A3B8;">Zalo FinTop</span>
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
    </footer>
"@

$newContent = $beforeFooter + $correctFooter + $afterFooter

# Also fix the about description - remove color highlights
$newContent = $newContent.Replace('<strong style="color: #c084fc;">Công Ty TNHH Đầu Tư &amp; Phát Triển FINTOP</strong>', 'Công Ty TNHH Đầu Tư &amp; Phát Triển FINTOP')
$newContent = $newContent.Replace('<em>Fintech &amp; Data</em>', 'Fintech &amp; Data')
$newContent = $newContent.Replace('<strong style="color: #38bdf8;">Công nghệ Tài chính</strong>,', 'Công nghệ Tài chính,')
$newContent = $newContent.Replace('<strong style="color: #f59e0b;">"Mô hình tiên tiến" (Model)</strong>', '"Mô hình tiên tiến" (Model)')
$newContent = $newContent.Replace('<strong style="color: #34d399;">"Công nghệ AI"</strong>', '"Công nghệ AI"')
$newContent = $newContent.Replace('<strong style="color: #c084fc;">Tài chính &amp; Đầu tư</strong>', 'Tài chính &amp; Đầu tư')

# Write with proper UTF-8 encoding (no BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[IO.File]::WriteAllText($file, $newContent, $utf8NoBom)
Write-Host "Done! Fixed footer and simplified about text."
