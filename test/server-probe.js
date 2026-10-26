import http from "node:http";
import { spawn } from "node:child_process";

const child = spawn(process.execPath, ["./node_modules/vite/bin/vite.js", "preview", "--port", "4173"], {
  stdio: "inherit"
});

setTimeout(() => {
  http.get("http://localhost:4173", (res) => {
    console.log(`Server responded with HTTP Status: ${res.statusCode}`);
    let data = "";
    res.on("data", (chunk) => data += chunk);
    res.on("end", () => {
      console.log(`Received ${data.length} bytes of HTML.`);
      console.log(`Title tag verified: ${data.includes("<title>TNEA Companion 2026")}`);
      child.kill("SIGTERM");
      process.exit(0);
    });
  }).on("error", (err) => {
    console.error("HTTP request failed:", err);
    child.kill("SIGTERM");
    process.exit(1);
  });
}, 2500);
