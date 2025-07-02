import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  // base: '/',
  build: {
    // Pastikan output directory adalah 'dist'
    outDir: 'dist',
    // Anda juga bisa menambahkan konfigurasi rollupOptions.output.manualChunks di sini
    // untuk optimasi code splitting lebih lanjut jika diperlukan.
    // Contoh:
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       vendor: ['react', 'react-dom', 'react-router-dom'],
    //       // Tambahkan chunk lain sesuai kebutuhan
    //     },
    //   },
    // },
    // chunkSizeWarningLimit: 1000, // Opsional: Tingkatkan batas peringatan
  },
});
