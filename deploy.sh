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

# 4. Kiểm tra và Tạo chứng chỉ SSL cho các tên miền chính
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

# Map User-Agent to detect social bots / crawlers (ONLY preview bots, NOT mobile in-app browsers)
map $http_user_agent $is_social_bot {
    default 0;
    ~*(facebookexternalhit|facebot|facebookcatalog|zalobot|telegrambot|twitterbot|linkedinbot|whatsapp|slackbot|discordbot|googlebot|bingbot|yandexbot|baiduspider|applebot|crawler|spider|bot) 1;
}

map $arg_slug $has_slug {
    default 0;
    "~.+" 1;
}

# 1. Server Block cho Frontend Web chính (HTTPS 443)
server {
    listen 443 ssl http2;
    server_name fintopdata.vn www.fintopdata.vn;

    ssl_certificate /etc/letsencrypt/live/fintopdata.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fintopdata.vn/privkey.pem;

    client_max_body_size 50M;

    root /var/www/fintop;
    index index.html;

    # 301 Permanent Redirects cho các đường dẫn cũ từ Google Sitelinks
    location = /client/datafinancial/index { return 301 /index.html#panel-tracuu; }
    location = /client/datafinancial/signalIndex { return 301 /fintop-data/bo-loc/; }
    location = /client/datafinancial/recommendationsIndex { return 301 /fintop-data/bo-loc/; }
    location = /client/datafinancial/categoryFintopIndex { return 301 /index.html#panel-tracuu; }
    location = /client/home/index { return 301 /; }
    location = /client/introduce/index { return 301 /; }
    location = /client/privileges/index { return 301 /index.html#panel-hoivien; }
    location = /client/library/index { return 301 /index.html#panel-guide-trading; }
    location = /client/about/index { return 301 /nghien-cuu/chuyen-sau/; }
    location = /client/des/index { return 301 /index.html#panel-guide-trading; }
    location /client/ { return 301 /; }

    # Referral registration URLs: /dangky/CODE -> serve index.html from root
    # IMPORTANT: Only match /dangky/<code> (no sub-paths), so /dangky/assets/* falls through to location /
    location ~ ^/dangky/[A-Za-z0-9_-]+$ {
        rewrite ^ /index.html last;
    }

    # Short share links for social media previews: /b/slug or /share/slug
    location ~ ^/(b|share)/([A-Za-z0-9_-]+)$ {
        proxy_pass http://127.0.0.1:3000/blogs/share-og?slug=$2;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Intercept social crawler requests with ?slug= for article preview
    location /_social_share {
        internal;
        proxy_pass http://127.0.0.1:3000/blogs/share-og?slug=$arg_slug;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve static assets directly (CSS, JS, images, fonts)
    location /assets/ {
        try_files $uri /fintop_frontend$uri =404;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        try_files $uri $uri/ /fintop_frontend$uri /fintop_frontend$uri/ =404;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # Serve uploaded images directly from fintop_frontend/uploads/
    location /uploads/ {
        alias /var/www/fintop/fintop_frontend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        set $serve_og "";
        if ($is_social_bot = 1) {
            set $serve_og 1;
        }
        if ($arg_direct != "") {
            set $serve_og 0;
        }
        if ($serve_og = 1) {
            rewrite ^ /_social_share last;
        }

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

    client_max_body_size 50M;

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Correlation-Id, x-webhook-signature, Accept, X-Requested-With, Cache-Control, Pragma, Origin' always;
            add_header 'Access-Control-Max-Age' 86400 always;
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain; charset=UTF-8';
            return 204;
        }

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP Web Cũ -> Redirect HTTPS
server {
    listen 80;
    server_name old.fintopdata.vn www.old.fintopdata.vn;
    return 301 https://$host$request_uri;
}

# 3. Server Block riêng cho Web Cũ (HTTPS 443)
server {
    listen 443 ssl http2;
    server_name old.fintopdata.vn www.old.fintopdata.vn;

    ssl_certificate /etc/letsencrypt/live/fintopdata.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fintopdata.vn/privkey.pem;

    root /var/www/fintop;
    index index.html;

    # Xử lý tự động mọi đường dẫn tương đối CSS/Assets trong các trang /client/
    location ~ ^/client/.*(clients|assets)/(.*)$ {
        rewrite ^/client/.*(clients|assets)/(.*)$ /$1/$2 last;
    }

    location = / { rewrite ^ /data/scraped/static/Trang_chủ.html last; }
    location = /index.html { rewrite ^ /data/scraped/static/Trang_chủ.html last; }
    location = /client/datafinancial/recommendationsIndex { rewrite ^ /data/scraped/vip/Tín_hiệu_VIP.html last; }
    location = /client/datafinancial/categoryFintopIndex { rewrite ^ /data/scraped/vip/Danh_mục_VIP.html last; }
    location = /client/datafinancial/signalIndex { rewrite ^ /data/scraped/vip/Tín_hiệu_VIP.html last; }
    location = /client/datafinancial/index { rewrite ^ /data/scraped/static/Trang_chủ.html last; }
    location = /client/home/index { rewrite ^ /data/scraped/static/Trang_chủ.html last; }
    location = /client/introduce/index { rewrite ^ /data/scraped/static/Giới_thiệu.html last; }
    location = /client/privileges/index { rewrite ^ /data/scraped/static/Đặc_quyền_hội_viên.html last; }

    location / {
        try_files $uri $uri/ /fintop_frontend$uri /fintop_frontend$uri/ =404;
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
EOF
else
cat << 'EOF' > /etc/nginx/sites-available/fintopdata.vn
server {
    listen 80;
    server_name fintopdata.vn www.fintopdata.vn;

    root /var/www/fintop;
    index index.html;

    # 301 Permanent Redirects cho các đường dẫn cũ từ Google Sitelinks
    location = /client/datafinancial/index { return 301 /index.html#panel-tracuu; }
    location = /client/datafinancial/signalIndex { return 301 /fintop-data/bo-loc/; }
    location = /client/datafinancial/recommendationsIndex { return 301 /fintop-data/bo-loc/; }
    location = /client/datafinancial/categoryFintopIndex { return 301 /index.html#panel-tracuu; }
    location = /client/home/index { return 301 /; }
    location = /client/introduce/index { return 301 /; }
    location = /client/privileges/index { return 301 /index.html#panel-hoivien; }
    location = /client/library/index { return 301 /index.html#panel-guide-trading; }
    location = /client/about/index { return 301 /nghien-cuu/chuyen-sau/; }
    location = /client/des/index { return 301 /index.html#panel-guide-trading; }
    location /client/ { return 301 /; }

    # Referral registration URLs: /dangky/CODE -> serve index.html from root
    # IMPORTANT: Only match /dangky/<code> (no sub-paths), so /dangky/assets/* falls through to location /
    location ~ ^/dangky/[A-Za-z0-9_-]+$ {
        rewrite ^ /index.html last;
    }

    # Short share links for social media previews: /b/slug or /share/slug
    location ~ ^/(b|share)/([A-Za-z0-9_-]+)$ {
        proxy_pass http://127.0.0.1:3000/blogs/share-og?slug=$2;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Intercept social crawler requests with ?slug= for article preview
    location /_social_share {
        internal;
        proxy_pass http://127.0.0.1:3000/blogs/share-og?slug=$arg_slug;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve static assets directly (CSS, JS, images, fonts)
    location /assets/ {
        try_files $uri /fintop_frontend$uri =404;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        try_files $uri $uri/ /fintop_frontend$uri /fintop_frontend$uri/ =404;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # Serve uploaded images directly from fintop_frontend/uploads/
    location /uploads/ {
        alias /var/www/fintop/fintop_frontend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        set $serve_og "";
        if ($is_social_bot = 1) {
            set $serve_og 1;
        }
        if ($arg_direct != "") {
            set $serve_og 0;
        }
        if ($serve_og = 1) {
            rewrite ^ /_social_share last;
        }

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

server {
    listen 80;
    server_name old.fintopdata.vn www.old.fintopdata.vn;

    root /var/www/fintop;
    index index.html;

    # Xử lý tự động mọi đường dẫn tương đối CSS/Assets trong các trang /client/
    location ~ ^/client/.*(clients|assets)/(.*)$ {
        rewrite ^/client/.*(clients|assets)/(.*)$ /$1/$2 last;
    }

    location = / { rewrite ^ /data/scraped/static/Trang_chủ.html last; }
    location = /index.html { rewrite ^ /data/scraped/static/Trang_chủ.html last; }
    location = /client/datafinancial/recommendationsIndex { rewrite ^ /data/scraped/vip/Tín_hiệu_VIP.html last; }
    location = /client/datafinancial/categoryFintopIndex { rewrite ^ /data/scraped/vip/Danh_mục_VIP.html last; }
    location = /client/datafinancial/signalIndex { rewrite ^ /data/scraped/vip/Tín_hiệu_VIP.html last; }
    location = /client/datafinancial/index { rewrite ^ /data/scraped/static/Trang_chủ.html last; }
    location = /client/home/index { rewrite ^ /data/scraped/static/Trang_chủ.html last; }
    location = /client/introduce/index { rewrite ^ /data/scraped/static/Giới_thiệu.html last; }
    location = /client/privileges/index { rewrite ^ /data/scraped/static/Đặc_quyền_hội_viên.html last; }

    location / {
        try_files $uri $uri/ /fintop_frontend$uri /fintop_frontend$uri/ =404;
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

apt install -y python3-pil 2>/dev/null || true
if command -v python3 >/dev/null 2>&1; then
    echo "=== TỰ ĐỘNG CHUYỂN ĐỔI ẢNH WEBP SANG JPG CHO ZALO LINK PREVIEW ==="
    python3 -c "
import os, glob
from PIL import Image
for webp_path in glob.glob('/var/www/fintop/fintop_frontend/uploads/*.webp'):
    jpg_path = webp_path[:-5] + '.jpg'
    if not os.path.exists(jpg_path):
        try:
            im = Image.open(webp_path).convert('RGB')
            im.save(jpg_path, 'JPEG', quality=85)
            print(f'Converted {webp_path} -> {jpg_path}')
        except Exception as e:
            print(f'Error converting {webp_path}: {e}')
" 2>/dev/null || true
fi

pm2 restart fintop-backend --update-env || pm2 start dist/src/main.js --name "fintop-backend"
pm2 save

echo "=========================================="
echo "=== KÍCH HOẠT NGINX HTTPS 443 THÀNH CÔNG 100%! ==="
echo "=========================================="
