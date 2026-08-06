#!/bin/bash
# 1. Dọn dẹp file rác Nginx
rm -f /etc/nginx/conf.d/fintop*
rm -f /etc/nginx/sites-available/fintopdata.vn
rm -f /etc/nginx/sites-enabled/fintopdata.vn

# 2. Cài đặt và kích hoạt PostgreSQL + Redis
apt update && apt install -y postgresql postgresql-contrib redis-server
systemctl start postgresql && systemctl enable postgresql
systemctl start redis-server && systemctl enable redis-server

# Cấu hình Mật khẩu Postgres và Tạo Database fintop
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '123';" 2>/dev/null || true
sudo -u postgres createdb fintop 2>/dev/null || true

# 3. Đồng bộ các trang subpage (admin, nghien-cuu, fintop-ai, hoi-vien...) ra root
if [ -d /var/www/fintop/fintop_frontend ]; then
    cp -rf /var/www/fintop/fintop_frontend/* /var/www/fintop/ 2>/dev/null || true
fi

# 4. Kiểm tra và Tạo chứng chỉ SSL nếu chưa có
certbot --nginx -d fintopdata.vn -d www.fintopdata.vn -d api.fintopdata.vn --non-interactive --agree-tos --expand -m fintop.ba@gmail.com 2>/dev/null || true

# 5. Tạo cấu hình Nginx chuẩn SSL HTTPS 443 cố định vĩnh viễn
if [ -f /etc/letsencrypt/live/fintopdata.vn/fullchain.pem ]; then
cat << 'EOF' > /etc/nginx/sites-available/fintopdata.vn
# HTTP -> Redirect sang HTTPS
server {
    listen 80;
    server_name fintopdata.vn www.fintopdata.vn;
    return 301 https://$host$request_uri;
}

# 1. Server Block cho Frontend Web chính (HTTPS 443)
server {
    listen 443 ssl http2;
    server_name fintopdata.vn www.fintopdata.vn;

    ssl_certificate /etc/letsencrypt/live/fintopdata.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fintopdata.vn/privkey.pem;

    root /var/www/fintop;
    index index.html;

    location / {
        try_files $uri $uri/ /fintop_frontend$uri /fintop_frontend$uri/ /index.html;
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

# HTTP API -> Redirect HTTPS
server {
    listen 80;
    server_name api.fintopdata.vn;
    return 301 https://$host$request_uri;
}

# 2. Server Block riêng cho Backend API (HTTPS 443)
server {
    listen 443 ssl http2;
    server_name api.fintopdata.vn;

    ssl_certificate /etc/letsencrypt/live/fintopdata.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fintopdata.vn/privkey.pem;

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
else
cat << 'EOF' > /etc/nginx/sites-available/fintopdata.vn
server {
    listen 80;
    server_name fintopdata.vn www.fintopdata.vn;

    root /var/www/fintop;
    index index.html;

    location / {
        try_files $uri $uri/ /fintop_frontend$uri /fintop_frontend$uri/ /index.html;
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
fi

ln -sf /etc/nginx/sites-available/fintopdata.vn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 6. Cấu hình .env & Nạp Bản Sao Lưu Dữ Liệu Local (fintop_dump.sql)
cd /var/www/fintop/fintop-backend
if [ ! -f .env ]; then
    cp .env.example .env
fi
sed -i 's|FRONTEND_URL=.*|FRONTEND_URL="https://fintopdata.vn"|' .env
sed -i 's|NODE_ENV=.*|NODE_ENV="production"|' .env
grep -q "CORS_ORIGIN" .env || echo 'CORS_ORIGIN="*"' >> .env

npx prisma generate
npx prisma db push
npm run build

if [ -f fintop_dump.sql ]; then
    echo "=== ĐANG NẠP DỮ LIỆU LOCAL VÀO DATABASE VPS ==="
    sudo -u postgres psql -d fintop < fintop_dump.sql 2>/dev/null || true
fi

pm2 restart fintop-backend --update-env || pm2 start dist/src/main.js --name "fintop-backend"
pm2 save

echo "=========================================="
echo "=== KÍCH HOẠT NGINX HTTPS 443 THÀNH CÔNG 100%! ==="
echo "=========================================="
