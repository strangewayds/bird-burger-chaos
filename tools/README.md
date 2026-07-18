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
- **Balance tuning**: outcomes across runs tell you if rent is reachable.
  Target: bot wins in roughly 50–130s of the 180s shift. Wins under ~40s mean
  it's too easy (shift ends before the chaos starts); repeated evictions mean
  it's too hard. The lever is the delivery `timeBonus` multiplier in
  `tryDeliverAtPickup` (currently 2.6) and the fire/chaos rates.

The bot never multitasks (it does one guidance step at a time), so a thinking
human should beat its times.
