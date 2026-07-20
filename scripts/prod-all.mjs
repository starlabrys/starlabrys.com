/**
 * Start Advisor API (loopback) + production static server with /api proxy.
 * Usage: node scripts/prod-all.mjs
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";

function run(command, args, name, color) {
  const child = spawn(command, args, {
    cwd: root,
    shell: isWin,
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  const tag = (buf, stream) => {
    const text = buf.toString();
    for (const line of text.split(/\r?\n/)) {
      if (!line) continue;
      stream.write(`${color}[${name}]\x1b[0m ${line}\n`);
    }
  };

  child.stdout?.on("data", (d) => tag(d, process.stdout));
  child.stderr?.on("data", (d) => tag(d, process.stderr));
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    console.error(`[${name}] exited (code=${code}, signal=${signal})`);
    shutdown(code ?? 1);
  });
  return child;
}

let shuttingDown = false;
const children = [];

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    try {
      if (isWin) spawn("taskkill", ["/pid", String(c.pid), "/f", "/t"], { shell: true });
      else c.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("Starting Advisor API on loopback → http://127.0.0.1:30001");
console.log("Starting site + /api proxy     → http://0.0.0.0:30000");
console.log("Press Ctrl+C to stop both.\n");

children.push(
  run(
    "uv",
    [
      "run",
      "--directory",
      "advisor",
      "uvicorn",
      "app.main:app",
      "--host",
      "127.0.0.1",
      "--port",
      "30001",
    ],
    "advisor",
    "\x1b[36m",
  ),
);
children.push(run(process.execPath, ["scripts/prod-server.mjs"], "web", "\x1b[32m"));
