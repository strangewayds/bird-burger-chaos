# tools/ — testing helpers

- **playtest.mjs** — autopilot playtester (below).
- **shot.mjs** — one-off screenshot: `node tools/shot.mjs <url> <out.png> [waitMs]`.
  Run from the repo root (needs the repo's puppeteer-core).
- **tutorial-drive.mjs** — drives the interactive TRAINING SHIFT end-to-end
  against localhost:8080 (welcome card → both lessons → graduation) and saves
  two screenshots: `node tools/tutorial-drive.mjs <lesson1.png> <grad.png>`.
  Run it after any change to the tutorial or the guidance system.

# tools/playtest.mjs — autopilot playtester

Drives a real browser through a full Kitchen Chaos shift by following the
in-game guidance banner ("👉 GRAB A BUN FROM THE FRIDGE" → clicks the fridge).
Reports WIN / EVICTED / SHUTDOWN, elapsed time, click count, and any JS errors.

**Run it from the repo root** (needs `puppeteer-core` from devDependencies):

```
node tools/playtest.mjs
```

Point it at localhost by editing the `page.goto` URL to
`http://localhost:8080/game?autostart` while a dev server is running.

## What it's for

- **Regression testing**: it caught a game-loop crash (spill spawner) that no
  screenshot could see, plus hydration errors.
- **Balance tuning**: since the DAY progression system, the game is endless
  survival — a good bot run never "wins", it clears day after day until the
  harness's 220s cap stops it, reported as `SURVIVED to DAY N (harness cap)`.
  That is a PASS as long as there are no page errors. Target: bot reaches
  Day 4–6 inside the cap. EVICTED on Day 1–2 means too hard; sailing past
  Day 6 means too easy. Levers: the delivery `timeBonus` multiplier in
  `tryDeliverAtPickup` and the per-day escalation in `roundConfig`.

The bot never multitasks (it does one guidance step at a time), so a thinking
human should beat its times.
