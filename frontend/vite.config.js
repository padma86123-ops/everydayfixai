import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // When the React app calls /api/..., Vite forwards it to Node.
      // That way the frontend never needs a secret key.
      "/api": "http://localhost:5000"
    }
  }
});
