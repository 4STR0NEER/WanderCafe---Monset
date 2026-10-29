import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Runs the Vercel functions in api/ under `npm run dev`, so checkout works locally without the Vercel CLI.
// Handlers are Web-standard (`export async function GET/POST(request)` returning a Response), the same
// shape Vercel runs, so this just turns Node's req into a Request and the Response back.
const devApi = {
  name: "dev-api",
  configureServer(server) {
    server.middlewares.use("/api", async (req, res) => {
      try {
        const name = req.url.split("?")[0].replace(/^\//, "");
        if (!/^[a-z-]+$/.test(name)) throw Object.assign(new Error("not found"), { status: 404 });
        const mod = await server.ssrLoadModule(`/api/${name}.js`).catch(() => {
          throw Object.assign(new Error("not found"), { status: 404 });
        });
        const handler = mod[req.method];
        if (!handler) throw Object.assign(new Error("method"), { status: 405 });
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const request = new Request(`http://${req.headers.host}/api${req.url}`, {
          method: req.method,
          headers: req.headers,
          body: chunks.length && !["GET", "HEAD"].includes(req.method) ? Buffer.concat(chunks) : undefined,
        });
        const response = await handler(request);
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (e) {
        if (!e.status) console.error(e);
        res.statusCode = e.status || 500;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ error: e.status === 404 ? "Not found" : e.status === 405 ? "Method not allowed" : "Server error" }));
      }
    });
  },
};

export default defineConfig(({ mode }) => {
  // server-only secrets (no VITE_ prefix) from .env.local, for the dev API above
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return {
    plugins: [react(), tailwindcss(), devApi],
    // "@/..." is the import style Kokonut, Skiper and Vengeance components expect
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  };
});
