# $BRGR Payroll — Weekly Runbook (for Anthony)

The Kitchen Chaos leaderboard resets every **Monday** (ISO weeks, automatic).
Nothing pays out automatically — **you** send tokens by hand. That's the safety.

## Every Monday (2 minutes)

1. Ask Claude: **"pull last week's payroll winners"** — Claude reads the week's
   data file from Vercel Blob and gives you the top 3 names, scores, and FULL
   wallet addresses (the public site only ever shows masked wallets).
2. **Smell-test the top 3 before paying:**
   - No "rent paid" badge but a huge score → suspicious.
   - Scores bunched right at the cap (3,400–3,500) → suspicious.
   - Name that submitted seconds apart repeatedly → suspicious.
   - When in doubt: skip them, promote #4. "The manager's decision is final"
     is printed in the rules for exactly this reason.
3. When $BRGR is live: send 1,000,000 / 500,000 / 250,000 $BRGR from the
   treasury to the three wallets. Until launch, just save the weekly winners
   (Claude can keep a running SEASON-0 ledger file in the repo).
4. Rent-payers ("rent paid" badge) go on the **Worker's Airdrop** list —
   Claude can compile all unique qualifying wallets across Season 0 whenever
   you're ready to snapshot.

## Safety rules already built in (don't undo these)

- Manual payouts only — never automate token sends from game scores.
- Server rejects impossible scores (>3,500, win/score mismatches).
- 1 submission per minute per player.
- Public responses mask wallets; full addresses only in private storage reads.
- All copy avoids dollar values / gambling language: free to play, no purchase
  necessary, allocations may change, no promised value.

## Tuning

- Prize amounts + all wording: `src/lib/leaderboard.ts` → `PAYROLL` constant.
- Score ceiling (raise if game scoring changes): `submitScore` validator.
