// $BRGR HOLDER PERKS — hold the token, cook with an edge. Fully wired; it arms
// itself the moment a real contract address is dropped into bird-burger-config.ts.
import { BB_CONFIG, activeNetwork } from "./bird-burger-config";

export type HolderTier = {
  min: number; // whole $BRGR required
  key: string;
  label: string;
  emoji: string;
  tips: number; // tip multiplier applied to every delivery
  timeBonus: number; // extra seconds added to each day's clock
  startBuffer: number; // $ credited toward Day-1 rent at the start of a run
  blurb: string;
};

// Highest tier first — resolveTier returns the first one the balance clears.
export const HOLDER_TIERS: HolderTier[] = [
  { min: 1_000_000, key: "whale", label: "FRANCHISE OWNER", emoji: "🐋", tips: 1.25, timeBonus: 15, startBuffer: 250, blurb: "+25% tips · +15s every day · $250 head start" },
  { min: 250_000, key: "lead", label: "SHIFT SUPERVISOR", emoji: "🔥", tips: 1.15, timeBonus: 8, startBuffer: 0, blurb: "+15% tips · +8s every day" },
  { min: 50_000, key: "cook", label: "LINE COOK", emoji: "🍔", tips: 1.08, timeBonus: 0, startBuffer: 0, blurb: "+8% tips on every order" },
];

// Is a real contract address configured yet? (Perks are dormant until then.)
export const contractLive = () => /^0x[a-fA-F0-9]{40}$/.test(BB_CONFIG.token.contract);

// Read a wallet's $BRGR balance via a raw eth_call (balanceOf) — no web3 lib needed.
export async function getBrgrBalance(address: string): Promise<number> {
  if (!contractLive() || !/^0x[a-fA-F0-9]{40}$/.test(address)) return 0;
  const data = "0x70a08231" + address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  try {
    const res = await fetch(activeNetwork().rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: BB_CONFIG.token.contract, data }, "latest"] }),
    });
    const j = await res.json();
    if (!j?.result || j.result === "0x") return 0;
    const raw = BigInt(j.result);
    return Number(raw / 10n ** 18n); // whole tokens (assumes 18 decimals)
  } catch {
    return 0;
  }
}

export function resolveTier(balance: number): HolderTier | null {
  return HOLDER_TIERS.find((t) => balance >= t.min) ?? null;
}
