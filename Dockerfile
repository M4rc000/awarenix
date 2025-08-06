# 1. Build React + Tailwind
FROM node:18-alpine AS builder
WORKDIR /app

# 2. Terima build args dari docker-compose
ARG VITE_API_URL
ARG VITE_API_URL_UNAUTHORIZED
ARG VITE_BASE_URL

# 3. Set environment untuk Vite
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_URL_UNAUTHORIZED=${VITE_API_URL_UNAUTHORIZED}
ENV VITE_BASE_URL=${VITE_BASE_URL}

# 4. Install deps & build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 5. Serve via Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
