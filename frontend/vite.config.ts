import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,json}"],
      },
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "PEDEX Coin",
        short_name: "PEDEX",
        start_url: "/login",
        icons: [
          {
            src: "./src/assets/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./src/assets/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        description: "Trade and manage your cryptocurrency with PEDEX Coin.",
      },
    }),
  ],

  server: {
    proxy: {
      "/api": {
        target: "https://pedex.duckdns.org/",
        // target: ["https://pedex.duckdns.org/", "https://102.210.146.148/"],
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
