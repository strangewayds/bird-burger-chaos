// Screenshot helper: node shot.mjs <url> <outfile> [waitMs]
import puppeteer from "puppeteer-core";
const [, , url, out, waitMs = "3500"] = process.argv;
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--window-size=1440,900", "--mute-audio"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
page.on("pageerror", (e) => errors.push((e.stack || String(e)).slice(0, 250)));
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, Number(waitMs)));
await page.screenshot({ path: out });
if (errors.length) console.log("PAGE ERRORS:", errors.slice(0, 4));
else console.log("no page errors");
await browser.close();
