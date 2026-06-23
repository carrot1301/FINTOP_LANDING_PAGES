UPDATE subscription_plans 
SET features = 'Tra cứu cổ phiếu;Phân tích cơ bản;FinTop AI phân tích;Tool & dữ liệu cơ bản'
WHERE name = 'STANDARD';

UPDATE subscription_plans 
SET features = 'Bộ lọc cổ phiếu chuyên nghiệp;Nghiên cứu & phân tích chuyên sâu;Tool & dữ liệu nâng cao;PRO Data và PRO Analysis'
WHERE name = 'SILVER' OR name = 'Gói Hội viên Bạc (Silver)';

UPDATE subscription_plans 
SET features = 'Full đặc quyền PRO;Kết nối chuyên gia;Phân tích chuyên gia;Liên kết tài khoản chứng khoán'
WHERE name = 'GOLD' OR name = 'Gói Hội viên Vàng (Gold)' OR name = 'Gold Monthly';

UPDATE subscription_plans 
SET features = 'Full đặc quyền PRO;Full đặc quyền V.I.P;Cố vấn 1-1 chuyên gia;Hỗ trợ chiến lược danh mục'
WHERE name = 'DIAMOND' OR name = 'Gói Hội viên Kim Cương (Diamond)';
