// Prints cv/cv.html to public/Tasneem-El-Dweik-CV.pdf with a local Edge/Chrome (headless).
// Run: npm run cv
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const browsers = [
  process.env.CV_BROWSER,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);
const browser = browsers.find((b) => existsSync(b));
if (!browser) throw new Error("No Edge/Chrome found — set CV_BROWSER to its path.");

const src = pathToFileURL(resolve("cv/cv.html")).href;
const out = resolve("public/Tasneem-El-Dweik-CV.pdf");
execFileSync(browser, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${out}`, src], { stdio: "inherit" });
console.log("CV →", out);
