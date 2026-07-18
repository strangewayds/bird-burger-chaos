// ── $BRGR PAYROLL — weekly Kitchen Chaos leaderboard ──
// Season 0: scores accrue now, tokens pay out when $BRGR launches.
// Storage: one JSON blob per ISO week in Vercel Blob.

import { createServerFn } from "@tanstack/react-start";
import { list, put } from "@vercel/blob";

export const PAYROLL = {
  season: "SEASON 0 — BACK-PAY ERA",
  // Token amounts only. Never a dollar figure. Adjust freely before launch.
  prizes: [
    { place: "1st", amount: "1,000,000 $BRGR", title: "EMPLOYEE OF THE WEEK" },
    { place: "2nd", amount: "500,000 $BRGR", title: "SHIFT SUPERVISOR" },
    { place: "3rd", amount: "250,000 $BRGR", title: "LEAST FIRED" },
  ],
  workerAirdrop: "Pay the $2,000 rent in any shift this week to qualify for the Worker's Airdrop.",
  disclaimers: [
    "Payroll is paid in $BRGR when the token launches. $BRGR has no promised value and this is not financial advice. This is a joke restaurant.",
    "Add your wallet so payroll knows where to send your back-pay. HR does not exist.",
    "Free to play. No purchase necessary. Allocations may change before launch. Impossible scores get audited and fired — the manager's decision is final.",
  ],
} as const;

export type LbEntry = {
  n: string; // display name
  w: string; // wallet (may be "")
  s: number; // best score this week
  won: boolean; // paid rent at least once
  t: number; // last update ts
};

type WeekFile = { week: string; entries: LbEntry[] };

export function weekKey(d = new Date()): string {
  // ISO week number
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const blobPath = (week: string) => `payroll/${week}.json`;

async function readWeek(week: string): Promise<WeekFile> {
  try {
    const { blobs } = await list({ prefix: blobPath(week), limit: 1 });
    if (!blobs.length) return { week, entries: [] };
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return { week, entries: [] };
    return (await res.json()) as WeekFile;
  } catch {
    return { week, entries: [] };
  }
}

async function writeWeek(file: WeekFile): Promise<void> {
  await put(blobPath(file.week), JSON.stringify(file), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

const cleanName = (raw: unknown): string =>
  String(raw ?? "")
    .replace(/[^\w \-.]/g, "")
    .trim()
    .slice(0, 16);

const cleanWallet = (raw: unknown): string => {
  const w = String(raw ?? "").trim();
  return /^0x[a-fA-F0-9]{40}$/.test(w) ? w : "";
};

// Public responses never contain full wallets — masked for display, full
// addresses live only in the blob for payout day.
const maskWallet = (w: string) => (w ? `${w.slice(0, 6)}…${w.slice(-4)}` : "");
const publicEntries = (entries: LbEntry[]) => entries.map((e) => ({ ...e, w: maskWallet(e.w) }));

export const submitScore = createServerFn({ method: "POST" })
  .validator((data: { name: string; wallet?: string; score: number; won: boolean }) => {
    const name = cleanName(data.name);
    const score = Math.floor(Number(data.score));
    const won = Boolean(data.won);
    if (name.length < 2) throw new Error("Name too short");
    // Hard plausibility ceiling — a win ends the game shortly after $2,000,
    // so anything wildly above that is a doctored shift.
    if (!Number.isFinite(score) || score < 50 || score > 3500) throw new Error("The manager reviewed the tape. Denied.");
    // Logical consistency: winning ends the shift AT $2,000+ — you can't have one without the other.
    if (won && score < 2000) throw new Error("The manager reviewed the tape. Denied.");
    if (!won && score >= 2000) throw new Error("The manager reviewed the tape. Denied.");
    return { name, wallet: cleanWallet(data.wallet), score, won };
  })
  .handler(async ({ data }) => {
    const week = weekKey();
    const file = await readWeek(week);
    const id = (data.name + "|" + data.wallet).toLowerCase();
    const existing = file.entries.find((e) => (e.n + "|" + e.w).toLowerCase() === id);
    // Cooldown: one filing per minute per employee — payroll is not a slot machine
    if (existing && Date.now() - existing.t < 60_000 && data.score <= existing.s) {
      throw new Error("Payroll already has your paperwork. Try again in a minute.");
    }
    if (existing) {
      existing.s = Math.max(existing.s, data.score);
      existing.won = existing.won || data.won;
      existing.t = Date.now();
    } else {
      file.entries.push({ n: data.name, w: data.wallet, s: data.score, won: data.won, t: Date.now() });
    }
    file.entries.sort((a, b) => b.s - a.s);
    file.entries = file.entries.slice(0, 200);
    await writeWeek(file);
    const rank = file.entries.findIndex((e) => (e.n + "|" + e.w).toLowerCase() === id) + 1;
    return { week, rank, total: file.entries.length, top: publicEntries(file.entries.slice(0, 10)) };
  });

export const getLeaderboard = createServerFn({ method: "GET" }).handler(async () => {
  const week = weekKey();
  const file = await readWeek(week);
  return { week, top: publicEntries(file.entries.slice(0, 10)), total: file.entries.length };
});
