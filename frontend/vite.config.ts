import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
interface RequestObject {
  request: Request;
}
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,json}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }: RequestObject) => request.destination === "document",
            handler: "NetworkFirst",
          },
          {
            urlPattern: ({ request }: RequestObject) => request.destination === "script",
            handler: "CacheFirst",
          },
        ],
      },
      mode: 'development',
      manifest: {
        name: "PEDEX Coin",
        short_name: "PEDEX",
        start_url: "/login",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        description: "Trade your cryptocurrency with PEDEX Coin.",
      },
    }),
  ],

  server: {
    proxy: {
      "/api": {
        target: "https://pedex.duckdns.org/",
        // target: ["https://pedex.duckdns.org/", "https://PEDEX.DUCKDNS.ORG/"],
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
