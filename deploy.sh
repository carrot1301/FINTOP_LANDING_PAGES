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
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '123';"
sudo -u postgres createdb fintop 2>/dev/null || true

# 3. Tạo cấu hình Nginx kép cho Frontend (fintopdata.vn) và Backend (api.fintopdata.vn)
cat << 'EOF' > /etc/nginx/sites-available/fintopdata.vn
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

# 4. Cấu hình .env & Khởi tạo Schema Database Prisma
cd /var/www/fintop/fintop-backend
if [ ! -f .env ]; then
    cp .env.example .env
fi
sed -i 's|FRONTEND_URL=.*|FRONTEND_URL="https://fintopdata.vn"|' .env
sed -i 's|NODE_ENV=.*|NODE_ENV="production"|' .env
grep -q "CORS_ORIGIN" .env || echo 'CORS_ORIGIN="*"' >> .env

npx prisma db push
npm run seed 2>/dev/null || true

pm2 restart fintop-backend --update-env || pm2 start dist/src/main.js --name "fintop-backend"
pm2 save

echo "=========================================="
echo "=== DATABASE VÀ BACKEND ĐÃ KÍCH HOẠT THÀNH CÔNG! ==="
echo "=========================================="
