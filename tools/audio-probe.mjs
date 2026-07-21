// Proves the game actually PRODUCES sound: taps every node that connects to
// the AudioContext destination with an AnalyserNode and measures signal energy.
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--window-size=1440,900", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.evaluateOnNewDocument(() => {
  window.__audio = { ctxs: [], analysers: [] };
  const OrigConnect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (...args) {
    try {
      if (args[0] instanceof AudioDestinationNode) {
        const ctx = this.context;
        if (!window.__audio.ctxs.includes(ctx)) window.__audio.ctxs.push(ctx);
        const an = ctx.createAnalyser();
        an.fftSize = 2048;
        OrigConnect.call(this, an); // tap in parallel with the destination
        window.__audio.analysers.push(an);
      }
    } catch {}
    return OrigConnect.apply(this, args);
  };
});
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await page.goto("https://birdburger.meme/game?autostart", { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForSelector("canvas", { timeout: 30000 });
await new Promise((r) => setTimeout(r, 1500));
// click the canvas (gesture) a few times like a player would
const rect = await page.evaluate(() => {
  const c = document.querySelector("canvas").getBoundingClientRect();
  return { x: c.left + c.width * 0.5, y: c.top + c.height * 0.6 };
});
await page.mouse.click(rect.x, rect.y);
await new Promise((r) => setTimeout(r, 500));
await page.mouse.click(rect.x, rect.y);
await new Promise((r) => setTimeout(r, 3000));
const report = await page.evaluate(() => {
  const a = window.__audio;
  const energies = a.analysers.map((an) => {
    const buf = new Float32Array(an.fftSize);
    an.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return Math.sqrt(sum / buf.length); // RMS
  });
  return {
    contexts: a.ctxs.map((c) => ({ state: c.state, time: c.currentTime })),
    taps: a.analysers.length,
    rms: energies,
  };
});
// sample again a second later to catch quiet moments
await new Promise((r) => setTimeout(r, 1200));
const report2 = await page.evaluate(() => {
  const energies = window.__audio.analysers.map((an) => {
    const buf = new Float32Array(an.fftSize);
    an.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return Math.sqrt(sum / buf.length);
  });
  return { rms: energies, time: window.__audio.ctxs.map((c) => c.currentTime) };
});
console.log(JSON.stringify({ report, report2, errors }, null, 1));
await browser.close();
