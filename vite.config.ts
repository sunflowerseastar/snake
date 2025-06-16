// https://vitejs.dev/config/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  test: {
    // prevent 'window is undefined' when running tests
    environment: "jsdom",
  },
  plugins: [react()],
});
