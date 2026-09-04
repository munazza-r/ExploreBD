import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/qr/",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5175,
    proxy: {
      "/api": "http://127.0.0.1:5053",
    },
  },
});
