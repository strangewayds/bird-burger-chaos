# 🍔 BIRD BURGER — NEXT SESSION HANDOFF

_Last worked: 2026-07-18. Read this first, then start at "DO THIS FIRST"._

## What this is

**Bird Burger ($BRGR)** — "The Worst Restaurant on the Blockchain." A meme-coin
joke-restaurant site for Robinhood Chain, plus **Kitchen Chaos**, a browser game
at `/game` with a weekly play-to-earn leaderboard.

- **LIVE: https://birdburger.meme**
- Repo here: `C:\Users\stran\bird-burger-chaos`
- Owner: Anthony (non-technical — plain English, show him links + screenshots)

## DO THIS FIRST (in order)

1. **Ask Anthony the three open questions** (they've been pending — nobody has
   answered them yet, and two of them block a loud launch):
   - **Sound check**: nobody has ever heard the game's audio. Claude wrote the
     fryer sizzle / bells / crowd murmur deaf. Is it good or annoying?
   - **$BRGR contract address + X/Telegram links** → these go in
     `src/lib/bird-burger-config.ts` (currently "COMING SOON" / empty). Until
     then the BUY button and socials are dead ends.
   - **Did he beat a shift?** Balance is autopilot-verified but no human score
     exists yet.
2. **If he says "just keep working"** → see BACKLOG below.

## How to run / deploy

```powershell
# dev server (dies at turn end unless launched detached — use WMI Win32_Process.Create)
cd C:\Users\stran\bird-burger-chaos ; npm run dev      # → http://localhost:8080

# deploy (BOTH steps required)
$env:NITRO_PRESET="vercel"          # REQUIRED — Lovable config defaults to Cloudflare
npm run build
vercel deploy --prebuilt --prod --yes
vercel alias set <new-deploy-url> birdburger.meme      # domain is alias-pinned, does NOT auto-follow
```

⚠️ **Always re-run `vercel alias set` after deploying** or birdburger.meme keeps
serving the old build. Get the newest URL from `vercel ls bird-burger`.

## Testing tricks (worth knowing)

- `/game?autostart` — skips the start screen (for headless screenshots).
- `/game?fstest` — forces mobile fullscreen takeover mode.
- `node tools/playtest.mjs` — **autopilot playtester**. Drives a real browser
  through a whole shift following the guidance banner; reports WIN/EVICTED/
  SHUTDOWN + JS errors. This caught a game-loop crash screenshots couldn't see.
  See `tools/README.md`. Run it after any gameplay change.
- Screenshots: headless Chrome works, but framer-motion fades render black
  unless you use `?autostart` and real (not virtual) time.

## State of things

**Done and verified:**
- Site live, all assets self-hosted (Lovable only exported image *pointers* —
  the real PNGs were downloaded into `src/assets`, nothing depends on Lovable).
- Game has a real goal: earn **$2,000 rent** in a 3-minute shift. Win = rent
  paid (graded on time left). Lose = EVICTED (clock out) or SHUT DOWN (chaos
  meter maxes → 8s health-inspector countdown).
- Point-and-click controls (click a station → bird runs there and uses it),
  first-order tutorial with spotlight, guidance arrow + banner, station badges.
- Mobile: auto-fullscreen on phones, portrait shows a "rotate" prompt,
  `touch-action: none` (without it every tap also scrolled the page — that was
  the "it's broken on phone" bug).
- **$BRGR Payroll leaderboard** — weekly, top 3 earn $BRGR back-pay at launch.
  Tested end-to-end. See `PAYROLL-RUNBOOK.md` (Anthony's Monday routine) and
  `SEASON0-LEDGER.md` (running winners list).
- Balance tuned by repeated autopilot runs: bot wins in 51–104s of 180s.

**Known / accepted:**
- The `origin` remote (github.com/strangewayds/...) is **stale** — the family
  account can't push there. `backup` (github.com/strangewayfamily802/...) is
  the real, current repo. Push there after every session. To sync `origin`,
  Anthony adds `strangewayfamily802` as a collaborator; Claude can accept the
  invite via `gh api` and push.
- In fullscreen the kitchen art stretches slightly to fill the screen shape.
- Leaderboard payouts are **manual on purpose** — never automate token sends
  from a game score.

## BACKLOG (nothing here is blocking)

- Prominent "PLAY" entry point in the mobile nav menu (desktop has one).
- Sound mix pass once Anthony reports how it actually sounds.
- Wire the real contract → BUY button, socials → footer/nav, then the site is
  launch-complete.
- Optional: per-employee art variants (perks exist, sprite is tinted only).
- Optional: seasonal reset tooling if Season 0 runs long.

## Machine note

7.7 GB RAM, chronically tight. Arm the RAM watchdog at session start (pattern in
Claude's memory: `feedback-ram-monitoring-job`). Builds + headless Chrome spike
hard. **Never touch anything in Anthony's terminals** — trim with
`EmptyWorkingSet`, never kill his processes.
