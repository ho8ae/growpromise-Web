# 빌드 단계
FROM node:18-alpine as build
WORKDIR /app

# package.json 복사 (캐시 최적화)
COPY front/package*.json ./
RUN npm install

# 소스 코드 복사
COPY front/ ./

# 빌드
RUN NODE_OPTIONS="--max_old_space_size=4096" npm run build

# 실행 단계
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# nginx 설정
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]