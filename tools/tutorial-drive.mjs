// Drives the interactive TRAINING SHIFT end-to-end: welcome card → lesson 1
// (Nothing Burger) → lesson 2 (McRug Pull) → graduation into Day 1.
import puppeteer from "puppeteer-core";

const STATIONS = {
  fridge: { x: 0.095, y: 0.385, w: 0.070, h: 0.210 },
  raw_patty: { x: 0.057, y: 0.801, w: 0.077, h: 0.098 },
  grill: { x: 0.481, y: 0.307, w: 0.098, h: 0.126 },
  sauce: { x: 0.471, y: 0.741, w: 0.098, h: 0.098 },
  pickup: { x: 0.921, y: 0.310, w: 0.049, h: 0.140 },
};
function stationFor(text) {
  const t = text.toUpperCase();
  if (t.includes("FRIDGE") || t.includes("BUN")) return "fridge";
  if (t.includes("RAW PATTY")) return "raw_patty";
  if (t.includes("GRILL") || t.includes("PATTY")) return "grill";
  if (t.includes("SAUCE")) return "sauce";
  if (t.includes("PICK UP") || t.includes("DELIVER")) return "pickup";
  return null;
}

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--window-size=1440,900", "--mute-audio"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
page.on("pageerror", (e) => errors.push((e.stack || String(e)).slice(0, 250)));
await page.goto("http://localhost:8080/game?tutorial", { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForSelector("canvas", { timeout: 30000 });
await new Promise((r) => setTimeout(r, 2000));

// Click START TRAINING on the welcome card
const clicked = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Start training"));
  if (btn) { btn.click(); return true; }
  return false;
});
console.log("welcome card start clicked:", clicked);
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: process.argv[2] || "tutorial-lesson1.png" });

const start = Date.now();
let lastText = "";
let shotLesson2 = false;
while (Date.now() - start < 120_000) {
  const state = await page.evaluate(() => ({
    banner: (() => {
      const els = [...document.querySelectorAll("div")];
      const el = els.find((d) => d.textContent?.startsWith("👉") && d.children.length === 0);
      return el ? el.textContent : "";
    })(),
    body: document.body.innerText,
  }));
  if (state.body.includes("YOU'RE HIRED")) {
    console.log(`[${Math.round((Date.now() - start) / 1000)}s] 🎓 GRADUATED — Day 1 banner up`);
    await page.screenshot({ path: process.argv[3] || "tutorial-grad.png" });
    break;
  }
  const lesson2 = state.body.includes("LESSON 2/2");
  if (lesson2 && !shotLesson2) {
    shotLesson2 = true;
    console.log(`[${Math.round((Date.now() - start) / 1000)}s] lesson 2 active`);
  }
  const text = state.banner || "";
  if (text !== lastText) { console.log(`[${Math.round((Date.now() - start) / 1000)}s] ${text}`); lastText = text; }
  if (/COOKING|DON'T LET IT BURN|FRYING —/.test(text.toUpperCase()) && !/READY|DONE/.test(text.toUpperCase())) {
    await new Promise((r) => setTimeout(r, 350));
    continue;
  }
  const st = stationFor(text);
  if (st) {
    const rect = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      const r = c.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    });
    const s = STATIONS[st];
    await page.mouse.click(rect.left + (s.x + s.w / 2) * rect.width, rect.top + (s.y + s.h / 2) * rect.height);
  }
  await new Promise((r) => setTimeout(r, 650));
}
if (errors.length) console.log("PAGE ERRORS:", errors.slice(0, 4));
else console.log("no page errors");
await browser.close();
