/**
 * Production static server + same-origin /api proxy to Advisor.
 * Usage: node scripts/prod-server.mjs
 *
 * Serves ./out on PORT (default 30000).
 * Proxies /api/* → http://127.0.0.1:ADVISOR_PORT/* (default 30001).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
const port = Number(process.env.PORT || 30000);
const advisorPort = Number(process.env.ADVISOR_PORT || 30001);
const advisorOrigin = `http://127.0.0.1:${advisorPort}`;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "accept-encoding",
]);

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function safeResolve(...parts) {
  const full = path.resolve(outDir, ...parts);
  const rootWithSep = outDir.endsWith(path.sep) ? outDir : outDir + path.sep;
  if (full !== outDir && !full.startsWith(rootWithSep)) return null;
  return full;
}

function candidatesFor(pathname) {
  const raw = decodeURIComponent(pathname.split("?")[0] || "/");
  const trimmed = raw.replace(/\\/g, "/");
  const noSlash = trimmed.replace(/\/+$/, "") || "";
  const rel = noSlash.replace(/^\/+/, "");

  const list = [];
  if (!rel) {
    list.push("index.html");
  } else {
    list.push(`${rel}.html`);
    list.push(path.join(rel, "index.html"));
    list.push(rel);
  }
  return list;
}

function findStaticFile(pathname) {
  for (const rel of candidatesFor(pathname)) {
    const full = safeResolve(rel);
    if (full && fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function proxyApi(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const upstreamPath = url.pathname.replace(/^\/api/, "") || "/";
  const target = new URL(`${upstreamPath}${url.search}`, advisorOrigin);

  let body = Buffer.alloc(0);
  try {
    body = await readRequestBody(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    send(res, 400, `Bad request body: ${message}`, {
      "content-type": "text/plain; charset=utf-8",
    });
    return;
  }

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null || HOP_BY_HOP.has(key.toLowerCase())) continue;
    headers[key] = Array.isArray(value) ? value.join(", ") : value;
  }
  if (!headers["content-type"] && body.length > 0) {
    headers["content-type"] = "application/json; charset=utf-8";
  }
  headers["content-length"] = String(body.length);

  try {
    const upstream = await fetch(target, {
      method: req.method || "GET",
      headers,
      body: ["GET", "HEAD"].includes(req.method || "GET") ? undefined : body,
    });
    const buf = Buffer.from(await upstream.arrayBuffer());
    const outHeaders = {};
    upstream.headers.forEach((value, key) => {
      if (HOP_BY_HOP.has(key.toLowerCase())) return;
      outHeaders[key] = value;
    });
    if (!outHeaders["content-type"]?.includes("charset") && outHeaders["content-type"]?.includes("json")) {
      outHeaders["content-type"] = "application/json; charset=utf-8";
    }
    send(res, upstream.status, buf, outHeaders);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[api-proxy] ${req.method} ${target.href} failed: ${message}`);
    send(res, 502, `Advisor proxy error: ${message}`, {
      "content-type": "text/plain; charset=utf-8",
    });
  }
}

function serveStatic(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const filePath = findStaticFile(url.pathname);

  if (!filePath) {
    const fallback = safeResolve("404.html");
    if (fallback && fs.existsSync(fallback)) {
      send(res, 404, fs.readFileSync(fallback), {
        "content-type": "text/html; charset=utf-8",
      });
      return;
    }
    send(res, 404, "Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  send(res, 200, fs.readFileSync(filePath), {
    "content-type": MIME[ext] || "application/octet-stream",
  });
}

const server = http.createServer((req, res) => {
  if ((req.url || "").startsWith("/api/") || (req.url || "") === "/api") {
    void proxyApi(req, res);
    return;
  }
  serveStatic(req, res);
});

if (!fs.existsSync(outDir)) {
  console.error(`Missing ${outDir}. Run npm run build first.`);
  process.exit(1);
}

server.listen(port, "0.0.0.0", () => {
  console.log(`Static site + /api proxy on http://0.0.0.0:${port}`);
  console.log(`Proxying /api → ${advisorOrigin}`);
});
