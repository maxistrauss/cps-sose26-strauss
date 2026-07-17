import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            "/nodered": {
                target: "http://192.168.8.110:1880",
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/nodered/, ""); },
                configure: function (proxy) {
                    proxy.on("error", function (_err, _req, res) {
                        res.writeHead(502, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "Pi nicht erreichbar (Proxy-Fehler)" }));
                    });
                },
            },
        },
    },
});
