// Autonomous playtest: follows the in-game guidance banner and tries to make rent.
import puppeteer from "puppeteer-core";

// Station rects (normalized) — mirror of STATIONS in game.tsx
const STATIONS = {
  fridge: { x: 0.095, y: 0.385, w: 0.070, h: 0.210 },
  raw_patty: { x: 0.057, y: 0.801, w: 0.077, h: 0.098 },
  cutting: { x: 0.210, y: 0.644, w: 0.091, h: 0.112 },
  cheese: { x: 0.287, y: 0.244, w: 0.077, h: 0.112 },
  grill: { x: 0.481, y: 0.307, w: 0.098, h: 0.126 },
  fryer: { x: 0.647, y: 0.347, w: 0.077, h: 0.126 },
  drink: { x: 0.835, y: 0.580, w: 0.070, h: 0.140 },
  sauce: { x: 0.471, y: 0.741, w: 0.098, h: 0.098 },
  pickup: { x: 0.921, y: 0.310, w: 0.049, h: 0.140 },
  extinguisher: { x: 0.725, y: 0.605, w: 0.040, h: 0.070 },
  mop: { x: 0.795, y: 0.850, w: 0.045, h: 0.070 },
};

function stationFor(text) {
  const t = text.toUpperCase();
  if (t.includes("FRIDGE") || t.includes("BUN")) return "fridge";
  if (t.includes("RAW PATTY")) return "raw_patty";
  if (t.includes("GRILL") || t.includes("PATTY")) return "grill";
  if (t.includes("LETTUCE") || t.includes("CHOP")) return "cutting";
  if (t.includes("CHEESE")) return "cheese";
  if (t.includes("SAUCE")) return "sauce";
  if (t.includes("FRYER") || t.includes("FRIES") || t.includes("NUGGET")) return "fryer";
  if (t.includes("SHAKE") || t.includes("DRINK")) return "drink";
  if (t.includes("PICK UP") || t.includes("DELIVER")) return "pickup";
  if (t.includes("EXTINGUISHER")) return "extinguisher";
  if (t.includes("SPRAY")) return "grill"; // fire is at grill or fryer; try grill first
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
page.on("pageerror", (e) => errors.push((e.stack || String(e)).slice(0, 300)));
await page.goto("https://birdburger.meme/game?autostart", { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForSelector("canvas", { timeout: 30000 });
await new Promise((r) => setTimeout(r, 2500));

const start = Date.now();
let lastText = "";
let lastStation = "";
let sprayFlip = false;
let clicks = 0;

async function bannerText() {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll("div")];
    const el = els.find((d) => d.textContent?.startsWith("👉") && d.children.length === 0);
    return el ? el.textContent : "";
  });
}
async function pageHas(s) {
  return page.evaluate((needle) => document.body.innerText.includes(needle), s);
}

let outcome = "timeout";
while (Date.now() - start < 220_000) {
  if (await pageHas("YOU WIN")) { outcome = "WIN"; break; }
  if (await pageHas("EVICTED")) { outcome = "EVICTED"; break; }
  if (await pageHas("SHUT DOWN")) { outcome = "SHUTDOWN"; break; }
  const text = (await bannerText()) || "";
  if (text !== lastText) { console.log(`[${Math.round((Date.now() - start) / 1000)}s] ${text}`); lastText = text; }
  if (/WAIT|DON'T LET IT BURN|COOKING|FRYING —/.test(text.toUpperCase()) && !/READY|DONE/.test(text.toUpperCase())) {
    await new Promise((r) => setTimeout(r, 350));
    continue;
  }
  let st = stationFor(text);
  if (text.toUpperCase().includes("SPRAY")) { st = sprayFlip ? "fryer" : "grill"; sprayFlip = !sprayFlip; }
  if (st) {
    const rect = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      const r = c.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    });
    const s = STATIONS[st];
    const x = rect.left + (s.x + s.w / 2) * rect.width;
    const y = rect.top + (s.y + s.h / 2) * rect.height;
    if (st !== lastStation || clicks % 3 === 0) await page.mouse.click(x, y);
    lastStation = st;
    clicks++;
  }
  await new Promise((r) => setTimeout(r, 650));
}

const secs = Math.round((Date.now() - start) / 1000);
const summary = await page.evaluate(() => document.body.innerText.slice(0, 1200));
console.log("=== OUTCOME:", outcome, "in", secs, "s, clicks:", clicks, "===");
console.log(summary.split("\n").filter((l) => /Rent Earned|Orders|grade|WIN|EVICTED|SHUT|Final|seconds to spare|RENT PAID|\$/.test(l)).slice(0, 14).join(" | "));
if (errors.length) console.log("PAGE ERRORS:", errors.slice(0, 5));
await page.screenshot({ path: "C:/Users/stran/AppData/Local/Temp/claude/C--Users-stran/79920252-7ac4-44b6-869d-bd4785598357/scratchpad/playtest-end.png" });
await browser.close();
