# 빌드 단계
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Vite 캐시 완전 제거
RUN rm -rf node_modules/.vite
RUN rm -rf .vite
RUN rm -rf dist

# CSS 강제 재생성으로 빌드
RUN NODE_OPTIONS="--max_old_space_size=4096" npm run build -- --force

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    # CSS 캐시 방지
    location ~* \.(css|js)$ { \
        expires -1; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]