#!/bin/bash
# Dọn dẹp file rác Nginx
rm -f /etc/nginx/conf.d/fintop*
rm -f /etc/nginx/sites-available/fintopdata.vn
rm -f /etc/nginx/sites-enabled/fintopdata.vn

# Tạo cấu hình Nginx kép cho cả Frontend (fintopdata.vn) và Backend (api.fintopdata.vn)
cat << 'EOF' > /etc/nginx/sites-available/fintopdata.vn
# 1. Server Block cho Frontend Web chính
server {
    listen 80;
    server_name fintopdata.vn www.fintopdata.vn;

    root /var/www/fintop;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. Server Block riêng cho Backend API (api.fintopdata.vn)
server {
    listen 80;
    server_name api.fintopdata.vn;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/fintopdata.vn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
echo "=========================================="
echo "=== NGINX ĐÃ CẤU HÌNH API.FINTOPDATA.VN! ==="
echo "=========================================="
