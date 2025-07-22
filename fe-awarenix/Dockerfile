# Tahap 1: Build aplikasi React
# Menggunakan Node.js 20 sebagai base image untuk build
FROM node:20-alpine AS build

# Menetapkan direktori kerja di dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json untuk menginstal dependensi
# Ini memungkinkan Docker untuk meng-cache layer ini jika dependensi tidak berubah
COPY package*.json ./

# Menginstal dependensi proyek
# Menggunakan --force atau --legacy-peer-deps jika ada masalah peer dependency
RUN npm install

# Menyalin seluruh kode aplikasi React
COPY . .

# Membangun aplikasi React untuk produksi
# Pastikan VITE_API_URL sudah disetel di docker-compose.yml
# Vite akan mengganti import.meta.env.VITE_API_URL dengan nilai ini saat build
RUN npm run build

# Tahap 2: Menyajikan aplikasi menggunakan Nginx
# Menggunakan Nginx sebagai server web yang ringan
FROM nginx:alpine

# Menyalin file konfigurasi Nginx kustom (opsional, tapi disarankan)
# Jika Anda tidak memiliki nginx.conf kustom, Nginx akan menggunakan default-nya
# Namun, untuk aplikasi SPA (Single Page Application), konfigurasi ini penting
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Menyalin hasil build dari tahap sebelumnya ke direktori serve Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mengekspos port 80, yang akan dipetakan ke port host oleh docker-compose
EXPOSE 80

# Perintah untuk memulai Nginx saat container dijalankan
CMD ["nginx", "-g", "daemon off;"]
