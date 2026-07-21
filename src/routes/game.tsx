import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Trophy, Zap, ArrowLeft, Play, Users, HelpCircle, Volume2, VolumeX, Vibrate, VibrateOff } from "lucide-react";
import kitchenBg from "@/assets/game-kitchen.jpg";
import mascotHero from "@/assets/bird-mascot.png";
import birdGame from "@/assets/bird-game.png";
import birdFrycook from "@/assets/bird-frycook.png";
import birdDave from "@/assets/bird-dave.png";
import birdPete from "@/assets/bird-pete.png";
import birdGary from "@/assets/bird-gary.png";
import hazardPigeon from "@/assets/hazard-pigeon.png";
import hazardGrease from "@/assets/hazard-grease.png";
import hazardFire from "@/assets/hazard-fire.png";
import { submitScore, getLeaderboard, PAYROLL, type LbEntry } from "@/lib/leaderboard";
import { HOLDER_TIERS, getBrgrBalance, resolveTier, contractLive, type HolderTier } from "@/lib/holder-perks";
import imgMcrug from "@/assets/menu-mcrug.png";
import imgFries from "@/assets/menu-liquidity-fries.png";
import imgShake from "@/assets/menu-pump-shake.png";
import imgChud from "@/assets/menu-chudburger.png";
import imgNuggets from "@/assets/menu-diamond-nuggets.png";
import imgCombo from "@/assets/menu-exit-combo.png";
import imgKids from "@/assets/menu-paper-hands.png";
import imgNothing from "@/assets/menu-nothing-burger.png";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Bird Burger: Kitchen Chaos — Play the Game" },
      { name: "description", content: "Survive as many days as you can — the rent climbs, the kitchen gets deadlier, and the top 3 birds each week earn $BRGR. Play Bird Burger: Kitchen Chaos free in your browser — no wallet needed." },
      { property: "og:title", content: "Bird Burger: Kitchen Chaos — Play free, earn $BRGR" },
      { property: "og:description", content: "Survive as many days as you can. The top 3 birds each week earn $BRGR back-pay. Free to play, no wallet needed." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Bird Burger" },
      { property: "og:url", content: "https://birdburger.meme/game" },
      { property: "og:image", content: "https://birdburger.meme/game-og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Bird Burger: Kitchen Chaos — Play free, earn $BRGR" },
      { name: "twitter:description", content: "Survive as many days as you can. Top 3 birds a week earn $BRGR. Free to play." },
      { name: "twitter:image", content: "https://birdburger.meme/game-og.png" },
    ],
  }),
  component: GamePage,
});

/* ─────────────────────────  TYPES & CONSTANTS  ───────────────────────── */

type Ing = "bun" | "patty_raw" | "patty_cooked" | "lettuce_raw" | "lettuce_chopped" | "cheese" | "sauce" | "fries" | "shake" | "nugget";

const ING_META: Record<Ing, { color: string; label: string; emoji: string }> = {
  bun: { color: "#FACC15", label: "Bun", emoji: "🍞" },
  patty_raw: { color: "#B24545", label: "Raw Patty", emoji: "🥩" },
  patty_cooked: { color: "#7C3A1F", label: "Cooked Patty", emoji: "🍖" },
  lettuce_raw: { color: "#3DA34D", label: "Lettuce Head", emoji: "🥬" },
  lettuce_chopped: { color: "#65D65C", label: "Chopped Lettuce", emoji: "🥗" },
  cheese: { color: "#F5C518", label: "Cheese", emoji: "🧀" },
  sauce: { color: "#EC4899", label: "Sauce", emoji: "🧂" },
  fries: { color: "#FFD24A", label: "Fries", emoji: "🍟" },
  shake: { color: "#F8B4D9", label: "Shake", emoji: "🥤" },
  nugget: { color: "#22D3EE", label: "Nuggets", emoji: "🍗" },
};

// Crafted mini-icons for ingredients — no emoji slop on the tickets
function IngIcon({ kind, className }: { kind: Ing; className?: string }) {
  const p: Record<Ing, React.ReactNode> = {
    bun: (
      <>
        <path d="M3 11a9 5.5 0 0 1 18 0v1H3z" fill="#E8A33D" stroke="#7C4A12" strokeWidth="1.4" />
        <rect x="3" y="14" width="18" height="5" rx="2" fill="#D98F2B" stroke="#7C4A12" strokeWidth="1.4" />
        <circle cx="9" cy="8.5" r="0.9" fill="#FDE9C8" /><circle cx="13.5" cy="7.5" r="0.9" fill="#FDE9C8" /><circle cx="16.5" cy="9.5" r="0.9" fill="#FDE9C8" />
      </>
    ),
    patty_raw: (
      <>
        <ellipse cx="12" cy="12" rx="9" ry="6" fill="#E76A6A" stroke="#8F2F2F" strokeWidth="1.4" />
        <circle cx="9" cy="11" r="1.1" fill="#C94F4F" /><circle cx="14.5" cy="13.5" r="1.3" fill="#C94F4F" /><circle cx="15.5" cy="10" r="0.9" fill="#F2A0A0" />
      </>
    ),
    patty_cooked: (
      <>
        <ellipse cx="12" cy="12" rx="9" ry="6" fill="#8A5A2B" stroke="#4A2E12" strokeWidth="1.4" />
        <path d="M5.5 11h13M6.5 13.5h11" stroke="#5E3A17" strokeWidth="1.3" strokeLinecap="round" />
      </>
    ),
    lettuce_raw: (
      <>
        <circle cx="12" cy="12" r="8" fill="#5BBE58" stroke="#2C6E2A" strokeWidth="1.4" />
        <path d="M12 4.5c-2 2.5-2 12.5 0 15M7 6.5c1.5 3.5 1.5 8.5 0 11M17 6.5c-1.5 3.5-1.5 8.5 0 11" stroke="#2C6E2A" strokeWidth="1.1" fill="none" />
      </>
    ),
    lettuce_chopped: (
      <>
        <path d="M4 15c2-3 5-3 7-1s5 2 9-1c-1 4-4 6-8 6s-7-2-8-4z" fill="#6FD26C" stroke="#2C6E2A" strokeWidth="1.4" />
        <path d="M7 9l2 3M12 7l1 4M16 9l-1 3" stroke="#3E9A3B" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
    cheese: (
      <>
        <path d="M3 16l18-7v9H3z" fill="#F5C518" stroke="#9C7508" strokeWidth="1.4" />
        <circle cx="9" cy="14.5" r="1.2" fill="#D9A90D" /><circle cx="14" cy="15.5" r="0.9" fill="#D9A90D" /><circle cx="17.5" cy="13" r="1" fill="#D9A90D" />
      </>
    ),
    sauce: (
      <>
        <rect x="9" y="3" width="6" height="3" rx="1" fill="#9C1C1C" />
        <path d="M8 8c0-1.2 1-2 2-2h4c1 0 2 .8 2 2v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" fill="#E23A3A" stroke="#8F1F1F" strokeWidth="1.4" />
        <rect x="9.5" y="10" width="5" height="5" rx="1" fill="#FFF" opacity="0.85" />
      </>
    ),
    fries: (
      <>
        <path d="M8 4l1 6M12 3v7M16 4l-1 6" stroke="#F5C842" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M6 9h12l-1.5 11h-9z" fill="#E23A3A" stroke="#8F1F1F" strokeWidth="1.4" />
        <path d="M6.8 12.5h10.4" stroke="#FFF" strokeWidth="1.2" opacity="0.6" />
      </>
    ),
    shake: (
      <>
        <path d="M7 8h10l-1.5 12h-7z" fill="#F8B4D9" stroke="#9C4A75" strokeWidth="1.4" />
        <path d="M6 8a6 3.5 0 0 1 12 0z" fill="#FDE9F3" stroke="#9C4A75" strokeWidth="1.4" />
        <path d="M13 6l2-4" stroke="#E23A3A" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    nugget: (
      <>
        <path d="M6 13c-1-3 1-6 4-6 1-2 5-2 6 0 3 0 5 3 3 6 1 3-2 5-5 4-2 2-6 1-6-1-2 0-3-2-2-3z" fill="#E8B04B" stroke="#8A6016" strokeWidth="1.4" />
        <circle cx="10" cy="11" r="0.8" fill="#C58F2E" /><circle cx="14" cy="13" r="0.9" fill="#C58F2E" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{p[kind]}</svg>
  );
}

// Same icon art as raw SVG markup, so the game canvas can draw the REAL item the
// bird is carrying (a bun, a shake, fries…) instead of an anonymous colored blob.
const ING_SVG: Record<Ing, string> = {
  bun: '<path d="M3 11a9 5.5 0 0 1 18 0v1H3z" fill="#E8A33D" stroke="#7C4A12" stroke-width="1.4"/><rect x="3" y="14" width="18" height="5" rx="2" fill="#D98F2B" stroke="#7C4A12" stroke-width="1.4"/><circle cx="9" cy="8.5" r="0.9" fill="#FDE9C8"/><circle cx="13.5" cy="7.5" r="0.9" fill="#FDE9C8"/><circle cx="16.5" cy="9.5" r="0.9" fill="#FDE9C8"/>',
  patty_raw: '<ellipse cx="12" cy="12" rx="9" ry="6" fill="#E76A6A" stroke="#8F2F2F" stroke-width="1.4"/><circle cx="9" cy="11" r="1.1" fill="#C94F4F"/><circle cx="14.5" cy="13.5" r="1.3" fill="#C94F4F"/><circle cx="15.5" cy="10" r="0.9" fill="#F2A0A0"/>',
  patty_cooked: '<ellipse cx="12" cy="12" rx="9" ry="6" fill="#8A5A2B" stroke="#4A2E12" stroke-width="1.4"/><path d="M5.5 11h13M6.5 13.5h11" stroke="#5E3A17" stroke-width="1.3" stroke-linecap="round"/>',
  lettuce_raw: '<circle cx="12" cy="12" r="8" fill="#5BBE58" stroke="#2C6E2A" stroke-width="1.4"/><path d="M12 4.5c-2 2.5-2 12.5 0 15M7 6.5c1.5 3.5 1.5 8.5 0 11M17 6.5c-1.5 3.5-1.5 8.5 0 11" stroke="#2C6E2A" stroke-width="1.1" fill="none"/>',
  lettuce_chopped: '<path d="M4 15c2-3 5-3 7-1s5 2 9-1c-1 4-4 6-8 6s-7-2-8-4z" fill="#6FD26C" stroke="#2C6E2A" stroke-width="1.4"/><path d="M7 9l2 3M12 7l1 4M16 9l-1 3" stroke="#3E9A3B" stroke-width="1.6" stroke-linecap="round"/>',
  cheese: '<path d="M3 16l18-7v9H3z" fill="#F5C518" stroke="#9C7508" stroke-width="1.4"/><circle cx="9" cy="14.5" r="1.2" fill="#D9A90D"/><circle cx="14" cy="15.5" r="0.9" fill="#D9A90D"/><circle cx="17.5" cy="13" r="1" fill="#D9A90D"/>',
  sauce: '<rect x="9" y="3" width="6" height="3" rx="1" fill="#9C1C1C"/><path d="M8 8c0-1.2 1-2 2-2h4c1 0 2 .8 2 2v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" fill="#E23A3A" stroke="#8F1F1F" stroke-width="1.4"/><rect x="9.5" y="10" width="5" height="5" rx="1" fill="#FFF" opacity="0.85"/>',
  fries: '<path d="M8 4l1 6M12 3v7M16 4l-1 6" stroke="#F5C842" stroke-width="2.4" stroke-linecap="round"/><path d="M6 9h12l-1.5 11h-9z" fill="#E23A3A" stroke="#8F1F1F" stroke-width="1.4"/><path d="M6.8 12.5h10.4" stroke="#FFF" stroke-width="1.2" opacity="0.6"/>',
  shake: '<path d="M7 8h10l-1.5 12h-7z" fill="#F8B4D9" stroke="#9C4A75" stroke-width="1.4"/><path d="M6 8a6 3.5 0 0 1 12 0z" fill="#FDE9F3" stroke="#9C4A75" stroke-width="1.4"/><path d="M13 6l2-4" stroke="#E23A3A" stroke-width="2" stroke-linecap="round"/>',
  nugget: '<path d="M6 13c-1-3 1-6 4-6 1-2 5-2 6 0 3 0 5 3 3 6 1 3-2 5-5 4-2 2-6 1-6-1-2 0-3-2-2-3z" fill="#E8B04B" stroke="#8A6016" stroke-width="1.4"/><circle cx="10" cy="11" r="0.8" fill="#C58F2E"/><circle cx="14" cy="13" r="0.9" fill="#C58F2E"/>',
};

// What each station hands you — floated above it in-game so you never guess
const STATION_YIELDS: { id: string; items: Ing[] }[] = [
  { id: "fridge", items: ["bun"] },
  { id: "raw_patty", items: ["patty_raw"] },
  { id: "cutting", items: ["lettuce_chopped"] },
  { id: "cheese", items: ["cheese"] },
  { id: "sauce", items: ["sauce"] },
  { id: "grill", items: ["patty_cooked"] },
  { id: "fryer", items: ["fries", "nugget"] },
  { id: "drink", items: ["shake"] },
];

type StationKind = "fridge" | "cutting" | "raw_patty" | "cheese" | "sauce" | "grill" | "fryer" | "drink" | "assembly" | "pickup" | "extinguisher" | "mop";

type Station = {
  id: string;
  kind: StationKind;
  x: number; // normalized 0..1
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
};

// Positions calibrated to game-kitchen.jpg (1920x1080)
const STATIONS: Station[] = [
  { id: "fridge", kind: "fridge", x: 0.095, y: 0.385, w: 0.070, h: 0.210, label: "FRIDGE", color: "#00C805" },
  { id: "raw_patty", kind: "raw_patty", x: 0.057, y: 0.801, w: 0.077, h: 0.098, label: "PATTIES", color: "#EF4444" },
  { id: "cutting", kind: "cutting", x: 0.210, y: 0.644, w: 0.091, h: 0.112, label: "CHOP", color: "#22D3EE" },
  { id: "cheese", kind: "cheese", x: 0.287, y: 0.244, w: 0.077, h: 0.112, label: "CHEESE", color: "#FACC15" },
  { id: "grill", kind: "grill", x: 0.481, y: 0.307, w: 0.098, h: 0.126, label: "GRILL", color: "#EF4444" },
  { id: "fryer", kind: "fryer", x: 0.647, y: 0.347, w: 0.077, h: 0.126, label: "FRYER", color: "#F97316" },
  { id: "drink", kind: "drink", x: 0.835, y: 0.580, w: 0.070, h: 0.140, label: "DRINKS", color: "#22D3EE" },
  { id: "sauce", kind: "sauce", x: 0.471, y: 0.741, w: 0.098, h: 0.098, label: "SAUCE", color: "#EC4899" },
  { id: "assembly", kind: "assembly", x: 0.383, y: 0.872, w: 0.105, h: 0.056, label: "ASSEMBLY", color: "#7C3AED" },
  { id: "pickup", kind: "pickup", x: 0.921, y: 0.310, w: 0.049, h: 0.140, label: "PICK UP", color: "#EC4899" },
  { id: "extinguisher", kind: "extinguisher", x: 0.725, y: 0.605, w: 0.040, h: 0.070, label: "🧯 FIRE EXT.", color: "#EF4444" },
  { id: "mop", kind: "mop", x: 0.795, y: 0.850, w: 0.045, h: 0.070, label: "🪣 MOP", color: "#22D3EE" },
];

/* ─────────────────────────  ORDER RECIPES  ───────────────────────── */

type OrderTemplate = { name: string; items: Ing[]; time: number; score: number; emoji: string; img: string };

const ORDER_POOL: OrderTemplate[] = [
  { name: "McRug Pull", items: ["bun", "patty_cooked", "sauce"], time: 65, score: 220, emoji: "🍔", img: imgMcrug },
  { name: "Liquidity Fries", items: ["fries", "sauce"], time: 55, score: 160, emoji: "🍟", img: imgFries },
  { name: "Pump & Shake", items: ["shake"], time: 45, score: 120, emoji: "🥤", img: imgShake },
  { name: "Chudburger Deluxe", items: ["bun", "patty_cooked", "patty_cooked", "cheese", "sauce"], time: 95, score: 380, emoji: "🍔", img: imgChud },
  { name: "Diamond Hands Nuggets", items: ["nugget", "sauce"], time: 60, score: 200, emoji: "🍗", img: imgNuggets },
  { name: "Exit Liquidity Combo", items: ["bun", "patty_cooked", "cheese", "fries", "shake"], time: 110, score: 460, emoji: "🥡", img: imgCombo },
  { name: "Paper Hands Kids Meal", items: ["bun", "patty_cooked", "lettuce_chopped"], time: 70, score: 240, emoji: "🥪", img: imgKids },
  { name: "Nothing Burger", items: ["bun"], time: 35, score: 90, emoji: "🍞", img: imgNothing },
];

type Order = { id: number; template: OrderTemplate; remaining: number; };

/* ─────────────────────────  GAME STATE  ───────────────────────── */

type Phase = "start" | "playing" | "results";

type Fire = { x: number; y: number; stationId: string; life: number; danger: number; dangerMax: number; sprayT: number };
type Pigeon = { x: number; y: number; vx: number; vy: number; hp: number };
type Spill = { x: number; y: number; r: number; life: number; cleanT: number; hue: number; wob: number };
type FloatText = { x: number; y: number; text: string; color: string; life: number };
type FallingSign = {
  x: number;
  y: number;
  phase: "warn" | "falling" | "landed";
  t: number;
  landT: number;
  text: string;
  color: string;
  spin: number;
  spinSpd: number;
};

// Perks: speed = movement, cook = grill/fryer speed, tips = order payout, calm = chaos cooldown rate.
// Each employee is real hand-drawn art now (img), not a color-tinted Larry.
const EMPLOYEES = [
  { id: "larry", name: "Larry", tint: "#C4A9F5", desc: "Tired. Always tired.", perk: "Perfectly average at everything", speed: 1, cook: 1, tips: 1, calm: 1, img: birdGame },
  { id: "frycook", name: "FryCook420", tint: "#22D3EE", desc: "Wears shades indoors.", perk: "Cooks 35% faster", speed: 0.95, cook: 1.35, tips: 1, calm: 1, img: birdFrycook },
  { id: "diamond", name: "Diamond Dave", tint: "#FACC15", desc: "Never sells.", perk: "+25% tips on every order", speed: 0.9, cook: 1, tips: 1.25, calm: 1, img: birdDave },
  { id: "pete", name: "Paper Hands Pete", tint: "#EC4899", desc: "Drops everything.", perk: "Fastest bird alive (+25% speed)", speed: 1.25, cook: 1, tips: 0.9, calm: 1, img: birdPete },
  { id: "gary", name: "Manager Gary", tint: "#00C805", desc: "Reluctantly here.", perk: "Chaos cools down 2× faster", speed: 1, cook: 1, tips: 1, calm: 2.2, img: birdGary },
];

// THE GAME: survive as many DAYS as you can. Each day you must earn that day's
// rent before the clock runs out. Every day the rent climbs, orders get bigger,
// and more of the kitchen tries to kill you. Score is cumulative across days.
type RoundCfg = {
  day: number; quota: number; time: number; maxItems: number; spawnMul: number;
  grease: boolean; pigeons: boolean; fires: boolean; bananas: boolean; disasters: boolean;
};
function roundConfig(r: number): RoundCfg {
  return {
    day: r,
    quota: 550 + (r - 1) * 450,                          // 550, 1000, 1450, 1900…
    time: r <= 1 ? 105 : Math.max(70, 100 - (r - 2) * 6), // day 1 generous, then tighter
    maxItems: r <= 1 ? 2 : r <= 3 ? 3 : r <= 5 ? 4 : 5,   // orders get more complex
    spawnMul: 1 + (r - 1) * 0.13,                         // hazards come faster
    grease: r >= 2,
    pigeons: r >= 2,
    fires: r >= 3,
    bananas: r >= 3,
    disasters: r >= 4,
  };
}
const RENT_QUOTA = roundConfig(1).quota; // day-1 rent, referenced on the start screen

type Outcome = "cleared" | "evicted" | "shutdown";

/* ─────────────────────────  COMPONENT  ───────────────────────── */

function GamePage() {
  // ?autostart skips the start screen (used for automated visual testing).
  // Applied post-mount so SSR and client hydrate identically.
  const [phase, setPhase] = useState<Phase>("start");
  useEffect(() => {
    if (window.location.search.includes("tutorial")) { setTraining(true); setPhase("playing"); }
    else if (window.location.search.includes("autostart")) setPhase("playing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [employee, setEmployee] = useState(EMPLOYEES[0]);
  const [showHelp, setShowHelp] = useState(false);
  const [muted, setMuted] = useState(false);
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);
  const haptics = useHaptics();
  // $BRGR holder perks — resolved from the connected wallet's balance
  const [holderTier, setHolderTier] = useState<HolderTier | null>(null);
  const [holderWallet, setHolderWallet] = useState<string>("");
  // First-ever shift = interactive TRAINING SHIFT inside the real kitchen
  // (Gary walks you through two orders — no clock, no hazards). Replayable via
  // How to Play or /game?tutorial. ?autostart skips it so headless tests see the real game.
  const [training, setTraining] = useState(false);
  const startShift = () => {
    setTraining(typeof window !== "undefined" && !window.localStorage.getItem("bb_tut_v2"));
    setPhase("playing");
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Phone landscape: every pixel goes to the kitchen — no site header */}
      <div className={phase === "playing" ? "max-lg:landscape:hidden" : ""}>
        <TopBar muted={muted} setMuted={setMuted} haptics={haptics} />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {phase === "start" && (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StartScreen
              employee={employee}
              setEmployee={setEmployee}
              onStart={startShift}
              onHelp={() => setShowHelp(true)}
              holderTier={holderTier}
              holderWallet={holderWallet}
              onHolder={(tier, wallet) => { setHolderTier(tier); setHolderWallet(wallet); }}
            />
          </motion.div>
        )}
        {phase === "playing" && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameScreen
              employee={employee}
              muted={muted}
              haptics={haptics}
              holderTier={holderTier}
              training={training}
              onTrainingDone={() => {
                try { window.localStorage.setItem("bb_tut_v2", "1"); } catch {}
                setTraining(false);
              }}
              onEnd={(stats) => { setFinalStats(stats); setPhase("results"); }}
              onQuit={() => setPhase("start")}
            />
          </motion.div>
        )}
        {phase === "results" && finalStats && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultsScreen
              stats={finalStats}
              onReplay={() => setPhase("playing")}
              onQuit={() => setPhase("start")}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {showHelp && (
        <HowToPlay
          onClose={() => setShowHelp(false)}
          onReplayTraining={() => {
            setShowHelp(false);
            setTraining(true);
            setPhase("playing");
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────  TOP BAR  ───────────────────────── */

function TopBar({ muted, setMuted, haptics }: { muted: boolean; setMuted: (v: boolean) => void; haptics: Haptics }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#7C3AED]/50 bg-[#09090B]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-2 px-4 py-2.5">
        <Link to="/" className="inline-flex items-center gap-2 rounded border border-[#7C3AED]/40 bg-[#2E1065]/60 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#C4A9F5] hover:bg-[#7C3AED]/30">
          <ArrowLeft className="h-4 w-4" /> Restaurant
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <img src="/favicon.png" alt="" width={28} height={28} className="h-7 w-7 rounded shadow-[0_0_16px_#7C3AED]" />
          <div className="truncate font-black uppercase tracking-widest text-[#FACC15] [font-family:'Bungee','Impact',sans-serif]">
            Bird Burger: <span className="text-[#EC4899]">Kitchen Chaos</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => haptics.setEnabled(!haptics.enabled)}
            className={`grid h-9 w-9 place-items-center rounded border bg-[#2E1065]/60 hover:bg-[#7C3AED]/30 ${haptics.canVibrate ? "border-[#7C3AED]/40 text-[#C4A9F5]" : "border-white/10 text-white/20"}`}
            aria-label={haptics.enabled ? "Disable haptics" : "Enable haptics"}
            disabled={!haptics.canVibrate}
            title={haptics.canVibrate ? (haptics.enabled ? "Vibration on" : "Vibration off") : "No vibration on this device"}
          >
            {haptics.enabled && haptics.canVibrate ? <Vibrate className="h-4 w-4" /> : <VibrateOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMuted(!muted)}
            className="grid h-9 w-9 place-items-center rounded border border-[#7C3AED]/40 bg-[#2E1065]/60 text-[#C4A9F5] hover:bg-[#7C3AED]/30"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────  START SCREEN  ───────────────────────── */

/* The old 3-step intro modal is gone — first-time players now get an
   interactive TRAINING SHIFT inside the real kitchen (see GameScreen). */

function HolderPerks({ tier, wallet, onHolder }: { tier: HolderTier | null; wallet: string; onHolder: (t: HolderTier | null, w: string) => void }) {
  const live = contractLive();
  const [busy, setBusy] = useState(false);
  const [bal, setBal] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const connect = async () => {
    setErr(""); setBusy(true);
    try {
      const eth = (window as unknown as { ethereum?: { request: (a: { method: string }) => Promise<string[]> } }).ethereum;
      if (!eth?.request) { setErr("No wallet found. Install MetaMask or Rabby, then reload."); setBusy(false); return; }
      const accts = await eth.request({ method: "eth_requestAccounts" });
      const addr = accts[0];
      const balance = await getBrgrBalance(addr);
      setBal(balance);
      onHolder(resolveTier(balance), addr);
    } catch {
      setErr("Couldn't read your wallet. Try again.");
    } finally { setBusy(false); }
  };
  return (
    <div className="mt-5 max-w-md rounded-lg border-2 border-[#22D3EE]/50 bg-[#09090B]/70 p-4">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#22D3EE]">🐋 $BRGR Holder Perks</div>
      {tier ? (
        <div className="rounded-lg border-2 border-[#00C805]/60 bg-[#00C805]/10 p-3">
          <div className="text-sm font-black text-[#00C805]">{tier.emoji} {tier.label} — PERKS ACTIVE</div>
          <div className="mt-1 text-xs text-white/85">{tier.blurb}</div>
          <div className="mt-1 text-[9px] uppercase tracking-wider text-white/40">
            {wallet.slice(0, 6)}…{wallet.slice(-4)}{bal != null ? ` · ${bal.toLocaleString()} $BRGR` : ""}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {[...HOLDER_TIERS].reverse().map((t) => (
              <div key={t.key} className="flex items-center justify-between gap-2 rounded bg-white/5 px-2 py-1 text-[10px]">
                <span className="shrink-0 font-black text-white">{t.emoji} {t.min.toLocaleString()}+ $BRGR</span>
                <span className="text-right text-[#FACC15]">{t.blurb}</span>
              </div>
            ))}
          </div>
          {live ? (
            <button onClick={connect} disabled={busy} className="mt-3 w-full rounded-lg border-2 border-[#22D3EE] bg-[#22D3EE]/15 py-2 text-xs font-black uppercase tracking-widest text-[#22D3EE] hover:bg-[#22D3EE]/30 disabled:opacity-50">
              {busy ? "Checking your bag…" : bal != null ? `You hold ${bal.toLocaleString()} — grab more to unlock` : "Connect Wallet to Check"}
            </button>
          ) : (
            <div className="mt-3 rounded-lg border border-[#FACC15]/40 bg-[#FACC15]/10 px-3 py-2 text-center text-[11px] font-black uppercase tracking-wider text-[#FACC15]">
              🔒 Perks go live when $BRGR launches
            </div>
          )}
          {err && <div className="mt-2 text-xs font-bold text-[#EF4444]">{err}</div>}
          <div className="mt-2 text-[8px] uppercase leading-relaxed tracking-wider text-white/40">Small in-game boosts for holders. $BRGR has no promised value. Not financial advice.</div>
        </>
      )}
    </div>
  );
}

function StartScreen({ employee, setEmployee, onStart, onHelp, holderTier, holderWallet, onHolder }: {
  employee: typeof EMPLOYEES[number];
  setEmployee: (e: typeof EMPLOYEES[number]) => void;
  onStart: () => void;
  onHelp: () => void;
  holderTier: HolderTier | null;
  holderWallet: string;
  onHolder: (tier: HolderTier | null, wallet: string) => void;
}) {
  const [showEmp, setShowEmp] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => { setIsTouch("ontouchstart" in window); }, []);
  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url(${kitchenBg})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(6px)" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/80 via-[#2E1065]/60 to-[#09090B]" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 py-16 md:grid-cols-2">
        <div>
          <div className="mb-3 inline-block rounded-full border border-[#EC4899]/60 bg-[#EC4899]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#EC4899]">
            Round 1 • Rated E for Everyone Fired
          </div>
          <h1 className="[font-family:'Bungee','Impact',sans-serif] text-5xl leading-[0.9] tracking-tight text-[#7C3AED] drop-shadow-[0_0_28px_rgba(124,58,237,0.6)] md:text-7xl">
            BIRD<br/>BURGER:
          </h1>
          <h2 className="mt-1 [font-family:'Bungee','Impact',sans-serif] text-3xl text-[#EC4899] drop-shadow-[0_0_20px_rgba(236,72,153,0.5)] md:text-5xl">
            KITCHEN CHAOS
          </h2>
          <p className="mt-4 max-w-md text-lg font-bold uppercase tracking-wider text-[#FACC15]/90">
            "The worst shift on the blockchain."
          </p>
          <div className="mt-3 max-w-md rounded-lg border-2 border-[#FACC15]/60 bg-[#09090B]/60 p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FACC15]">📋 Your Mission</div>
            <p className="mt-1 text-sm text-white/85">
              Survive as many <b className="text-[#7C3AED]">DAYS</b> as you can. Each day, make that day's <b className="text-[#00C805]">rent</b> before the clock runs out to reach the next day.
            </p>
            <p className="mt-1.5 text-xs text-white/60">
              Every day the <b className="text-[#FACC15]">rent climbs</b>, orders get <b className="text-[#FACC15]">bigger</b>, and more of the kitchen turns on you — <b className="text-[#EF4444]">grease, then fires, then pigeons and bananas</b>. Miss rent or let the CHAOS meter max out and you're done. How long can you last?
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
            <button onClick={onStart} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg border-4 border-[#FACC15] bg-[#FACC15] px-6 py-4 text-lg font-black uppercase tracking-widest text-[#09090B] shadow-[0_6px_0_#B08807,0_0_28px_rgba(250,204,21,0.5)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5">
              <Play className="h-5 w-5" /> Start Shift
            </button>
            <button onClick={() => setShowEmp(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#22D3EE] bg-[#22D3EE]/10 px-3 py-3 text-xs font-black uppercase tracking-widest text-[#22D3EE] hover:bg-[#22D3EE]/25">
              <Users className="h-4 w-4" /> Choose Employee
            </button>
            <button onClick={onHelp} className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#EC4899] bg-[#EC4899]/10 px-3 py-3 text-xs font-black uppercase tracking-widest text-[#EC4899] hover:bg-[#EC4899]/25">
              <HelpCircle className="h-4 w-4" /> How to Play
            </button>
          </div>
          <div className="mt-4 text-[10px] uppercase tracking-widest text-white/50">
            Now serving: <span className="text-[#FACC15]">{employee.name}</span> — {employee.desc}
          </div>
          {isTouch && (
            <button
              onClick={() => setShowInstall(true)}
              className="mt-4 flex w-full max-w-md items-center gap-3 rounded-lg border-2 border-[#22D3EE]/60 bg-[#22D3EE]/10 p-3 text-left hover:bg-[#22D3EE]/20 sm:max-w-md"
            >
              <span className="text-2xl">📲</span>
              <span>
                <span className="block text-xs font-black uppercase tracking-wider text-[#22D3EE]">Playing on a phone?</span>
                <span className="block text-[11px] text-white/70">Add Bird Burger to your Home Screen for true fullscreen — <u>tap here to see how</u></span>
              </span>
            </button>
          )}
          {showInstall && (
            <div className="fixed inset-0 z-[120] grid place-items-center bg-black/85 p-5" onClick={() => setShowInstall(false)}>
              <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border-2 border-[#22D3EE] bg-[#2E1065] p-5">
                <div className="text-center [font-family:'Bungee','Impact',sans-serif] text-lg text-[#22D3EE]">📲 PLAY FULLSCREEN</div>
                <p className="mt-1 text-center text-xs text-white/70">Add the game to your home screen — it opens like a real app, no browser bar.</p>
                <div className="mt-3 rounded-lg bg-black/40 p-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#FACC15]"> iPhone (Safari)</div>
                  <ol className="mt-1 space-y-1 text-xs text-white/80">
                    <li>1. Tap the <b>Share</b> button <span className="text-white/50">(square with ↑, bottom of Safari)</span></li>
                    <li>2. Scroll down, tap <b className="text-[#22D3EE]">Add to Home Screen</b></li>
                    <li>3. Tap <b>Add</b> — then open Bird Burger from your home screen</li>
                  </ol>
                </div>
                <div className="mt-2 rounded-lg bg-black/40 p-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#00C805]">🤖 Android (Chrome)</div>
                  <ol className="mt-1 space-y-1 text-xs text-white/80">
                    <li>1. Tap the <b>⋮ menu</b> (top right)</li>
                    <li>2. Tap <b className="text-[#00C805]">Add to Home screen</b> → <b>Install</b></li>
                  </ol>
                </div>
                <button onClick={() => setShowInstall(false)} className="mt-4 w-full rounded-lg border-2 border-[#22D3EE] bg-[#22D3EE]/20 py-2 text-xs font-black uppercase tracking-widest text-[#22D3EE]">Got it</button>
              </div>
            </div>
          )}
          <HolderPerks tier={holderTier} wallet={holderWallet} onHolder={onHolder} />
          <PayrollPanel />
        </div>
        <div className="relative mx-auto">
          <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-72 w-72 rounded-full bg-[#7C3AED]/40 blur-3xl" />
          <motion.img
            src={mascotHero}
            alt="Larry the Bird Burger mascot"
            width={520}
            height={520}
            className="mx-auto h-auto w-[300px] md:w-[480px]"
            animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
      {showEmp && <EmployeePicker current={employee.id} onPick={(e) => { setEmployee(e); setShowEmp(false); }} onClose={() => setShowEmp(false)} />}
    </div>
  );
}

function EmployeePicker({ current, onPick, onClose }: { current: string; onPick: (e: typeof EMPLOYEES[number]) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-xl border-2 border-[#7C3AED] bg-[#2E1065] p-6 shadow-[0_0_60px_rgba(124,58,237,0.6)]">
        <h3 className="mb-4 [font-family:'Bungee','Impact',sans-serif] text-2xl text-[#FACC15]">CHOOSE YOUR EMPLOYEE</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EMPLOYEES.map((e) => (
            <button
              key={e.id}
              onClick={() => onPick(e)}
              className={`flex flex-col items-center rounded-lg border-2 p-3 transition-all ${current === e.id ? "border-[#FACC15] bg-[#FACC15]/10 shadow-[0_0_20px_rgba(250,204,21,0.5)]" : "border-[#7C3AED]/40 bg-[#09090B]/40 hover:border-[#EC4899]"}`}
            >
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2" style={{ borderColor: e.tint, background: `radial-gradient(${e.tint}44, #09090B 75%)` }}>
                <img src={e.img} alt="" width={64} height={64} className="h-14 w-14 rounded-full object-cover" />
              </div>
              <div className="mt-2 text-xs font-black uppercase tracking-widest text-white">{e.name}</div>
              <div className="mt-1 text-[9px] uppercase tracking-widest text-white/60">{e.desc}</div>
              <div className="mt-1.5 rounded border border-[#22D3EE]/40 bg-[#22D3EE]/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#22D3EE]">{e.perk}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded border-2 border-[#EC4899] bg-[#EC4899]/20 py-2 text-xs font-black uppercase tracking-widest text-[#EC4899] hover:bg-[#EC4899]/40">Close</button>
      </div>
    </div>
  );
}

function hueFor(hex: string): number {
  // rough hue rotation for varying mascot color
  const map: Record<string, number> = { "#C4A9F5": 0, "#22D3EE": 130, "#FACC15": 60, "#EC4899": 300, "#00C805": 100 };
  return map[hex] ?? 0;
}

function HowToPlay({ onClose, onReplayTraining }: { onClose: () => void; onReplayTraining?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-xl border-2 border-[#EC4899] bg-[#2E1065] p-6">
        <h3 className="mb-3 [font-family:'Bungee','Impact',sans-serif] text-2xl text-[#EC4899]">HOW TO PLAY</h3>
        <div className="mb-3 space-y-2">
          <div className="flex items-start gap-2.5 rounded-lg bg-[#FACC15]/10 p-2.5 text-sm text-white/85">
            <span className="text-xl">🎯</span>
            <span><b className="text-[#FACC15]">Read the order</b> — the ticket at the top shows what to make.</span>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg bg-[#FACC15]/10 p-2.5 text-sm text-white/85">
            <span className="text-xl">👆</span>
            <span><b className="text-[#FACC15]">Tap what glows</b> — the kitchen lights up your next step. Tap it; the bird runs over and does the work.</span>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg bg-[#FACC15]/10 p-2.5 text-sm text-white/85">
            <span className="text-xl">💰</span>
            <span><b className="text-[#FACC15]">Deliver at PICK UP</b> — earn each day's rent before the clock runs out. Every day gets harder.</span>
          </div>
        </div>
        <div className="mb-3 rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 p-2.5 text-xs text-white/75">
          <b className="text-[#EF4444]">WATCH OUT:</b> burned food, failed orders and fires raise CHAOS — max it out and the health inspector shuts you down. Tap grease to mop it, grab the 🧯 for fires, and keep cooking.
        </div>
        <ul className="space-y-1.5 text-xs text-white/60">
          <li><b className="text-white/80">Keyboard:</b> WASD move · SPACE use · Q drop · SHIFT dash</li>
          <li><b className="text-white/80">Employees</b> have different perks — pick one that fits your style.</li>
        </ul>
        <button onClick={onClose} className="mt-4 w-full rounded border-2 border-[#FACC15] bg-[#FACC15]/20 py-2 text-xs font-black uppercase tracking-widest text-[#FACC15] hover:bg-[#FACC15]/40">Got it</button>
        {onReplayTraining && (
          <button onClick={onReplayTraining} className="mt-2 w-full rounded border border-[#22D3EE]/50 bg-[#22D3EE]/10 py-2 text-[10px] font-black uppercase tracking-widest text-[#22D3EE] hover:bg-[#22D3EE]/25">
            🎓 Replay the training shift
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────  GAME SCREEN  ───────────────────────── */

type GameStats = {
  score: number;
  best: number;
  ordersCompleted: number;
  ordersFailed: number;
  foodBurned: number;
  fires: number;
  pigeonsChased: number;
  dropped: number;
  birdBucks: number;
  grade: string;
  gradeSub: string;
  outcome: Outcome;
  timeLeft: number;
  daysSurvived: number;
};

/* ─────────────────────────  GAME SFX (synth)  ─────────────────────────
   Punchy, low-cost impact sounds via WebAudio. Master gain is hard-clamped
   and each shot is rate-limited so rapid hops/booms can't stack into clipping. */
function useGameSfx(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const compRef = useRef<DynamicsCompressorNode | null>(null);
  const lastRef = useRef<Record<string, number>>({});

  const ensure = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AC) return null;
      const ctx: AudioContext = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.4;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 26;
      comp.ratio.value = 5;
      comp.attack.value = 0.004;
      comp.release.value = 0.2;
      // gentle high shelf cut so nothing gets harsh/piercing
      const tone = ctx.createBiquadFilter();
      tone.type = "highshelf";
      tone.frequency.value = 3800;
      tone.gain.value = -6;
      master.connect(comp).connect(tone).connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      compRef.current = comp;
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume().catch(() => {});
    return ctxRef.current;
  }, []);

  useEffect(() => {
    if (masterRef.current) masterRef.current.gain.value = muted ? 0 : 0.4;
  }, [muted]);

  useEffect(() => () => { try { ctxRef.current?.close(); } catch {} }, []);

  const rateOk = (key: string, minGap: number) => {
    const now = performance.now();
    const last = lastRef.current[key] || 0;
    if (now - last < minGap) return false;
    lastRef.current[key] = now;
    return true;
  };

  // Footstep — a soft, dull "tap" (filtered noise), NOT a tonal blip. This plays
  // on every step so it has to be gentle and non-repetitive or it grates fast.
  const hop = useCallback((intensity = 1) => {
    if (muted) return;
    const ctx = ensure(); if (!ctx || !masterRef.current) return;
    if (!rateOk("hop", 105)) return; // fewer steps make sound
    const t = ctx.currentTime;
    const bufLen = Math.floor(ctx.sampleRate * 0.045);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2.2);
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 380 + Math.random() * 130; // varied so repeats don't fatigue
    bp.Q.value = 0.6;
    const g = ctx.createGain();
    const peak = Math.min(0.07, 0.05 * intensity);
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.05);
    noise.connect(bp).connect(g).connect(masterRef.current);
    noise.start(t); noise.stop(t + 0.05);
  }, [muted, ensure]);

  // Landing — just a soft low cushion under the footstep. Quiet; no noise burst.
  const land = useCallback((intensity = 1) => {
    if (muted) return;
    const ctx = ensure(); if (!ctx || !masterRef.current) return;
    if (!rateOk("land", 95)) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
    const g = ctx.createGain();
    const peak = Math.min(0.11, 0.07 * intensity);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0006, t + 0.11);
    osc.connect(g).connect(masterRef.current);
    osc.start(t); osc.stop(t + 0.13);
  }, [muted, ensure]);

  const boom = useCallback((intensity = 1) => {
    if (muted) return;
    const ctx = ensure(); if (!ctx || !masterRef.current) return;
    if (!rateOk("boom", 120)) return;
    const t = ctx.currentTime;
    const bufLen = Math.floor(ctx.sampleRate * 0.55);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      const env = Math.pow(1 - i / bufLen, 1.6);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(2200, t);
    lp.frequency.exponentialRampToValueAtTime(300, t + 0.5);
    const ng = ctx.createGain();
    const peak = Math.min(0.5, 0.36 * intensity);
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime(peak, t + 0.008);
    ng.gain.exponentialRampToValueAtTime(0.0008, t + 0.6);
    noise.connect(lp).connect(ng).connect(masterRef.current);
    const sub = ctx.createOscillator(); sub.type = "sine";
    sub.frequency.setValueAtTime(120, t);
    sub.frequency.exponentialRampToValueAtTime(35, t + 0.35);
    const sg = ctx.createGain();
    const subPeak = Math.min(0.55, 0.38 * intensity);
    sg.gain.setValueAtTime(0, t);
    sg.gain.linearRampToValueAtTime(subPeak, t + 0.01);
    sg.gain.exponentialRampToValueAtTime(0.0008, t + 0.45);
    sub.connect(sg).connect(masterRef.current);
    noise.start(t); noise.stop(t + 0.6);
    sub.start(t); sub.stop(t + 0.5);
  }, [muted, ensure]);

  // Filtered-noise whoosh, used for dash start / mid-air pass. Volume-capped for comfort.
  const whoosh = useCallback((variant: "start" | "mid", intensity = 1) => {
    if (muted) return;
    const ctx = ensure(); if (!ctx || !masterRef.current) return;
    if (!rateOk(`whoosh_${variant}`, variant === "start" ? 220 : 120)) return;
    const t = ctx.currentTime;
    const dur = variant === "start" ? 0.22 : 0.16;
    const bufLen = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    // shaped noise: quick attack, soft tail
    for (let i = 0; i < bufLen; i++) {
      const k = i / bufLen;
      const env = variant === "start"
        ? Math.pow(Math.sin(Math.PI * k), 0.9)               // swell + fall
        : Math.pow(1 - k, 1.4) * Math.min(1, k * 8);          // fast in, gentle out
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource(); src.buffer = buf;
    // bandpass sweep: high → low sells a directional whoosh
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    const f0 = variant === "start" ? 2200 : 1600;
    const f1 = variant === "start" ? 500 : 700;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    bp.Q.value = 0.9;
    const g = ctx.createGain();
    // hard-cap peak so dashes never spike above comfortable level
    const peak = Math.min(variant === "start" ? 0.24 : 0.18, (variant === "start" ? 0.20 : 0.14) * intensity);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0006, t + dur);
    src.connect(bp).connect(g).connect(masterRef.current);
    src.start(t); src.stop(t + dur + 0.02);
    // subtle pitch-drop tonal ghost on start — adds "snap"
    if (variant === "start") {
      const osc = ctx.createOscillator(); osc.type = "sawtooth";
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.14);
      const og = ctx.createGain();
      const opeak = Math.min(0.10, 0.07 * intensity);
      og.gain.setValueAtTime(0, t);
      og.gain.linearRampToValueAtTime(opeak, t + 0.006);
      og.gain.exponentialRampToValueAtTime(0.0006, t + 0.16);
      osc.connect(og).connect(masterRef.current);
      osc.start(t); osc.stop(t + 0.18);
    }
  }, [muted, ensure]);

  // Punchier impact for dash landing — sub thump + filtered crack, still capped.
  const dashLand = useCallback((intensity = 1) => {
    if (muted) return;
    const ctx = ensure(); if (!ctx || !masterRef.current) return;
    if (!rateOk("dashLand", 90)) return;
    const t = ctx.currentTime;
    // sub thump
    const sub = ctx.createOscillator(); sub.type = "sine";
    sub.frequency.setValueAtTime(160, t);
    sub.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    const sg = ctx.createGain();
    const speak = Math.min(0.36, 0.26 * intensity);
    sg.gain.setValueAtTime(0, t);
    sg.gain.linearRampToValueAtTime(speak, t + 0.005);
    sg.gain.exponentialRampToValueAtTime(0.0008, t + 0.22);
    sub.connect(sg).connect(masterRef.current);
    // noise crack
    const bufLen = Math.floor(ctx.sampleRate * 0.12);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.8);
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 700;
    const ng = ctx.createGain();
    const npeak = Math.min(0.22, 0.16 * intensity);
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime(npeak, t + 0.004);
    ng.gain.exponentialRampToValueAtTime(0.0008, t + 0.14);
    noise.connect(hp).connect(ng).connect(masterRef.current);
    sub.start(t); sub.stop(t + 0.24);
    noise.start(t); noise.stop(t + 0.14);
  }, [muted, ensure]);

  // Wet mop swish — short filtered noise, pitch rises with combo for satisfying feedback.
  const mop = useCallback((intensity = 1, pitch = 1) => {
    if (muted) return;
    const ctx = ensure(); if (!ctx || !masterRef.current) return;
    if (!rateOk("mop", 70)) return;
    const t = ctx.currentTime;
    const bufLen = Math.floor(ctx.sampleRate * 0.14);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      const k = i / bufLen;
      data[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * k), 0.9);
    }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.setValueAtTime(1400 * pitch, t);
    bp.frequency.exponentialRampToValueAtTime(3200 * pitch, t + 0.13);
    bp.Q.value = 1.6;
    const g = ctx.createGain();
    const peak = Math.min(0.22, 0.16 * intensity);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0006, t + 0.14);
    src.connect(bp).connect(g).connect(masterRef.current);
    src.start(t); src.stop(t + 0.16);
  }, [muted, ensure]);

  // Chime + pop on spill fully cleaned. Combo raises pitch for a rising cash-register feel.
  const mopDone = useCallback((combo = 1) => {
    if (muted) return;
    const ctx = ensure(); if (!ctx || !masterRef.current) return;
    if (!rateOk("mopDone", 40)) return;
    const t = ctx.currentTime;
    const base = 660 * Math.pow(1.12, Math.min(8, combo - 1)); // rises per combo step
    // two-note sparkle
    [0, 0.06].forEach((delay, idx) => {
      const osc = ctx.createOscillator(); osc.type = "triangle";
      const f = base * (idx === 0 ? 1 : 1.5);
      osc.frequency.setValueAtTime(f, t + delay);
      const g = ctx.createGain();
      const peak = 0.22;
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(peak, t + delay + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0006, t + delay + 0.22);
      osc.connect(g).connect(masterRef.current!);
      osc.start(t + delay); osc.stop(t + delay + 0.25);
    });
    // wet pop
    const pop = ctx.createOscillator(); pop.type = "sine";
    pop.frequency.setValueAtTime(280, t);
    pop.frequency.exponentialRampToValueAtTime(90, t + 0.09);
    const pg = ctx.createGain();
    pg.gain.setValueAtTime(0, t);
    pg.gain.linearRampToValueAtTime(0.24, t + 0.004);
    pg.gain.exponentialRampToValueAtTime(0.0006, t + 0.12);
    pop.connect(pg).connect(masterRef.current);
    pop.start(t); pop.stop(t + 0.14);
  }, [muted, ensure]);

  // Restaurant ambience: fryer sizzle + low room rumble + occasional service bell.
  const ambStartedRef = useRef(false);
  const startAmbience = useCallback(() => {
    if (ambStartedRef.current) return;
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    ambStartedRef.current = true;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    g.connect(masterRef.current);
    // shared noise buffer
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    // fryer sizzle (bandpassed noise, gently wobbling) — lower & warmer, less hiss
    const sizzle = ctx.createBufferSource(); sizzle.buffer = buf; sizzle.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3200; bp.Q.value = 0.7;
    const sg = ctx.createGain(); sg.gain.value = 0.035;
    sizzle.connect(bp); bp.connect(sg); sg.connect(g); sizzle.start();
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.23;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.02;
    lfo.connect(lfoG); lfoG.connect(sg.gain); lfo.start();
    // room rumble (lowpassed slow noise — fridge hum / vent)
    const rumble = ctx.createBufferSource(); rumble.buffer = buf; rumble.loop = true; rumble.playbackRate.value = 0.4;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 200;
    const rg = ctx.createGain(); rg.gain.value = 0.07;
    rumble.connect(lp); lp.connect(rg); rg.connect(g); rumble.start();
    // background crowd murmur (slow-breathing midband noise — sounds like distant customers)
    const murmur = ctx.createBufferSource(); murmur.buffer = buf; murmur.loop = true; murmur.playbackRate.value = 0.22;
    const mbp = ctx.createBiquadFilter(); mbp.type = "bandpass"; mbp.frequency.value = 420; mbp.Q.value = 1.4;
    const mg = ctx.createGain(); mg.gain.value = 0.045;
    murmur.connect(mbp); mbp.connect(mg); mg.connect(g); murmur.start();
    const mlfo = ctx.createOscillator(); mlfo.frequency.value = 0.13;
    const mlfoG = ctx.createGain(); mlfoG.gain.value = 0.025;
    mlfo.connect(mlfoG); mlfoG.connect(mg.gain); mlfo.start();
    // occasional counter bell
    const ding = () => {
      const c = ctxRef.current;
      if (!c || c.state === "closed") return;
      const t = c.currentTime;
      const dg = c.createGain();
      dg.gain.setValueAtTime(0.0001, t);
      dg.gain.exponentialRampToValueAtTime(0.09, t + 0.012);
      dg.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
      dg.connect(g);
      for (const f of [1870, 2350]) {
        const o = c.createOscillator(); o.type = "sine"; o.frequency.value = f;
        o.connect(dg); o.start(t); o.stop(t + 1.4);
      }
      window.setTimeout(ding, 12000 + Math.random() * 22000);
    };
    window.setTimeout(ding, 7000);
  }, [ensure]);

  // Door chime — a customer walked in (two-tone bing-bong)
  const doorBell = useCallback(() => {
    if (muted) return;
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running" || !masterRef.current) return;
    if (!rateOk("door", 900)) return;
    const t = ctx.currentTime;
    const dg = ctx.createGain();
    dg.gain.setValueAtTime(0.0001, t);
    dg.gain.exponentialRampToValueAtTime(0.14, t + 0.015);
    dg.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    dg.connect(masterRef.current);
    const o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = 659; // E5
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = 523; // C5
    o1.connect(dg); o2.connect(dg);
    o1.start(t); o1.stop(t + 0.35);
    o2.start(t + 0.28); o2.stop(t + 1.1);
  }, [muted]);

  // Service bell — DING DING, a customer is losing patience
  const orderBell = useCallback(() => {
    if (muted) return;
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running" || !masterRef.current) return;
    if (!rateOk("orderbell", 700)) return;
    const t0 = ctx.currentTime;
    for (const dt0 of [0, 0.18]) {
      const dg = ctx.createGain();
      dg.gain.setValueAtTime(0.0001, t0 + dt0);
      dg.gain.exponentialRampToValueAtTime(0.13, t0 + dt0 + 0.008);
      dg.gain.exponentialRampToValueAtTime(0.0001, t0 + dt0 + 0.6);
      dg.connect(masterRef.current);
      for (const f of [2093, 2637]) {
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
        o.connect(dg); o.start(t0 + dt0); o.stop(t0 + dt0 + 0.65);
      }
    }
  }, [muted]);

  // Extinguisher hiss — burst of high-passed noise
  const hiss = useCallback(() => {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    if (!rateOk("hiss", 250)) return;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.6);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2600;
    const hg = ctx.createGain();
    hg.gain.setValueAtTime(0.22, t);
    hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    src.connect(hp); hp.connect(hg); hg.connect(masterRef.current);
    src.start(t);
  }, [muted, ensure]);

  // Cha-ching — money in the register
  const kaching = useCallback(() => {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    if (!rateOk("kaching", 300)) return;
    const t = ctx.currentTime;
    for (const [f, d0, dur] of [[1318.5, 0, 0.12], [1760, 0.09, 0.35]] as const) {
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t + d0);
      g2.gain.exponentialRampToValueAtTime(0.14, t + d0 + 0.008);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + d0 + dur);
      g2.connect(masterRef.current);
      const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      o.connect(g2); o.start(t + d0); o.stop(t + d0 + dur + 0.05);
    }
  }, [muted, ensure]);

  // Cartoon slip — descending whistle
  const slip = useCallback(() => {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    if (!rateOk("slip", 500)) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "triangle";
    o.frequency.setValueAtTime(1100, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.35);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.12, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    o.connect(g2); g2.connect(masterRef.current);
    o.start(t); o.stop(t + 0.4);
  }, [muted, ensure]);

  // Victory fanfare — rising major arpeggio + coin sparkle (day complete, graduation)
  const fanfare = useCallback(() => {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    if (!rateOk("fanfare", 1500)) return;
    const t = ctx.currentTime;
    const notes: [number, number][] = [[523.25, 0], [659.25, 0.11], [783.99, 0.22], [1046.5, 0.33]]; // C5 E5 G5 C6
    for (const [f, d0] of notes) {
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t + d0);
      g2.gain.exponentialRampToValueAtTime(0.13, t + d0 + 0.012);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + d0 + 0.5);
      g2.connect(masterRef.current);
      const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 2;
      const g3 = ctx.createGain(); g3.gain.value = 0.35;
      o2.connect(g3); g3.connect(g2); o.connect(g2);
      o.start(t + d0); o.stop(t + d0 + 0.55);
      o2.start(t + d0); o2.stop(t + d0 + 0.55);
    }
    // final chord shimmer
    const g4 = ctx.createGain();
    g4.gain.setValueAtTime(0.0001, t + 0.44);
    g4.gain.exponentialRampToValueAtTime(0.09, t + 0.47);
    g4.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
    g4.connect(masterRef.current);
    for (const f of [1046.5, 1318.5, 1568]) {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      o.connect(g4); o.start(t + 0.44); o.stop(t + 1.3);
    }
  }, [muted, ensure]);

  // Sad trombone — womp womp womp woooomp (evicted)
  const sadTrombone = useCallback(() => {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    if (!rateOk("sadbone", 2000)) return;
    const t = ctx.currentTime;
    const seq: [number, number, number][] = [[233.08, 0, 0.28], [220, 0.32, 0.28], [207.65, 0.64, 0.28], [196, 0.96, 0.9]]; // Bb3 A3 Ab3 G3
    for (const [f, d0, dur] of seq) {
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t + d0);
      g2.gain.exponentialRampToValueAtTime(0.16, t + d0 + 0.03);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + d0 + dur);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 4;
      g2.connect(lp); lp.connect(masterRef.current);
      const o = ctx.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(f, t + d0);
      if (dur > 0.5) o.frequency.linearRampToValueAtTime(f * 0.94, t + d0 + dur); // last note droops
      const vib = ctx.createOscillator(); vib.frequency.value = 5.5;
      const vg = ctx.createGain(); vg.gain.value = dur > 0.5 ? 7 : 3;
      vib.connect(vg); vg.connect(o.frequency);
      o.connect(g2); o.start(t + d0); o.stop(t + d0 + dur + 0.05);
      vib.start(t + d0); vib.stop(t + d0 + dur + 0.05);
    }
  }, [muted, ensure]);

  // Health-inspector klaxon hit + low boom (shut down)
  const alarmSting = useCallback(() => {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    if (!rateOk("alarmsting", 2000)) return;
    const t = ctx.currentTime;
    for (const d0 of [0, 0.42]) {
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t + d0);
      g2.gain.exponentialRampToValueAtTime(0.15, t + d0 + 0.02);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + d0 + 0.38);
      g2.connect(masterRef.current);
      const o = ctx.createOscillator(); o.type = "square";
      o.frequency.setValueAtTime(880, t + d0);
      o.frequency.linearRampToValueAtTime(620, t + d0 + 0.36);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
      o.connect(lp); lp.connect(g2);
      o.start(t + d0); o.stop(t + d0 + 0.4);
    }
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.0001, t + 0.8);
    bg.gain.exponentialRampToValueAtTime(0.3, t + 0.84);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    bg.connect(masterRef.current);
    const bo = ctx.createOscillator(); bo.type = "sine";
    bo.frequency.setValueAtTime(110, t + 0.8);
    bo.frequency.exponentialRampToValueAtTime(38, t + 1.7);
    bo.connect(bg); bo.start(t + 0.8); bo.stop(t + 1.85);
  }, [muted, ensure]);

  // Pigeon coo — soft warbling two-note coo, pitch varies per call
  const coo = useCallback((scared = false) => {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    if (!rateOk("coo", 600)) return;
    const t = ctx.currentTime;
    const base = (scared ? 520 : 380) + Math.random() * 60;
    for (const [d0, dur, fMul] of [[0, 0.22, 1], [0.26, 0.3, 0.88]] as const) {
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t + d0);
      g2.gain.exponentialRampToValueAtTime(scared ? 0.1 : 0.07, t + d0 + 0.04);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + d0 + dur);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1300;
      g2.connect(lp); lp.connect(masterRef.current);
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = base * fMul;
      const vib = ctx.createOscillator(); vib.frequency.value = scared ? 22 : 12;
      const vg = ctx.createGain(); vg.gain.value = base * 0.08;
      vib.connect(vg); vg.connect(o.frequency);
      o.connect(g2); o.start(t + d0); o.stop(t + d0 + dur + 0.05);
      vib.start(t + d0); vib.stop(t + d0 + dur + 0.05);
    }
  }, [muted, ensure]);

  // Two-note lesson chime (training progress)
  const chime = useCallback(() => {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    if (!rateOk("chime", 800)) return;
    const t = ctx.currentTime;
    for (const [f, d0] of [[880, 0], [1318.5, 0.14]] as const) {
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t + d0);
      g2.gain.exponentialRampToValueAtTime(0.12, t + d0 + 0.01);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + d0 + 0.7);
      g2.connect(masterRef.current);
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      o.connect(g2); o.start(t + d0); o.stop(t + d0 + 0.75);
    }
  }, [muted, ensure]);

  return { hop, land, boom, whoosh, dashLand, mop, mopDone, ensure, startAmbience, doorBell, orderBell, hiss, slip, kaching, fanfare, sadTrombone, alarmSting, coo, chime };

}

/* ─────────────────────────  HAPTICS  ───────────────────────── */
function useHaptics() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("bb_haptics");
    if (saved != null) return saved === "1";
    return "ontouchstart" in window;
  });
  const canVibrate = useMemo(() => typeof navigator !== "undefined" && "vibrate" in navigator, []);
  const rateRef = useRef<Record<string, number>>({});

  const setAndSave = useCallback((v: boolean) => {
    setEnabled(v);
    if (typeof window !== "undefined") window.localStorage.setItem("bb_haptics", v ? "1" : "0");
  }, []);

  const pulse = useCallback((pattern: number | number[], key: string, minGap = 30) => {
    if (!enabled || !canVibrate) return;
    const now = performance.now();
    if (now - (rateRef.current[key] || 0) < minGap) return;
    rateRef.current[key] = now;
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore unsupported patterns
    }
  }, [enabled, canVibrate]);

  return {
    enabled,
    setEnabled: setAndSave,
    canVibrate,
    hop: useCallback(() => pulse([10], "hop", 55), [pulse]),
    land: useCallback(() => pulse([14], "land", 45), [pulse]),
    dashLand: useCallback(() => pulse([8, 6, 18], "dashLand", 90), [pulse]),
    boom: useCallback(() => pulse([16, 22, 48], "boom", 120), [pulse]),
  };
}

type Haptics = ReturnType<typeof useHaptics>;

function GameScreen({ employee, muted, haptics, holderTier, training, onTrainingDone, onEnd, onQuit }: {
  employee: typeof EMPLOYEES[number];
  muted: boolean;
  haptics: Haptics;
  holderTier: HolderTier | null;
  training: boolean;
  onTrainingDone: () => void;
  onEnd: (s: GameStats) => void;
  onQuit: () => void;
}) {
  const holderTips = holderTier?.tips ?? 1;
  const holderTimeBonus = holderTier?.timeBonus ?? 0;
  // TRAINING SHIFT — first-timers play two scripted orders with Gary coaching:
  // no clock, no hazards, spotlight on every step. Graduates into a fresh Day 1.
  const trainingRef = useRef(training);
  const trainStepRef = useRef(0);          // 0 = Nothing Burger, 1 = McRug Pull
  const [trainStep, setTrainStep] = useState(0);
  const [trainUi, setTrainUi] = useState(training);       // trainer bubble + HUD swaps
  const [trainWelcome, setTrainWelcome] = useState(training); // one welcome card, then hands-on
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const mascotImgRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);
  const spriteAspectRef = useRef(1); // sprite height / width after perch crop
  // Rasterized ingredient icons so the bird carries the ACTUAL item, drawn on canvas
  const ingImgRef = useRef<Partial<Record<Ing, HTMLImageElement>>>({});
  // Hand-drawn hazard sprites (Higgsfield, mascot-style): pigeon / grease / fire
  const hazardImgRef = useRef<{ pigeon?: HTMLImageElement; grease?: HTMLImageElement; fire?: HTMLImageElement }>({});
  const sfx = useGameSfx(muted);
  const sfxRef = useRef(sfx);
  useEffect(() => { sfxRef.current = sfx; }, [sfx]);
  const hapticsRef = useRef(haptics);
  useEffect(() => { hapticsRef.current = haptics; }, [haptics]);
  // Resume AudioContext on first user gesture (autoplay policy)
  useEffect(() => {
    const kick = () => { sfxRef.current.ensure(); sfxRef.current.startAmbience(); };
    window.addEventListener("pointerdown", kick, { once: true });
    window.addEventListener("keydown", kick, { once: true });
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
    };
  }, []);

  // Persistent refs (game loop reads/writes)
  const keysRef = useRef<Record<string, boolean>>({});
  const playerRef = useRef({ x: 0.4, y: 0.55, vx: 0, vy: 0, dashCd: 0, slipT: 0, face: 1, faceVel: 0, dirAvg: 1, moveT: 0, hopPhase: 0, landT: 0, hopIdx: -1, idleT: 0, lean: 0, leanDir: 0 });
  // Ring buffer of recent horizontal input for weighted-average facing (kills jitter on quick flips)
  const dirHistoryRef = useRef<{ dx: number; w: number }[]>([]);
  // Turning-estimation state: last smoothed dir + its rate of change for predictive lookahead
  const turnEstRef = useRef({ prevDirAvg: 0, dirVel: 0, predicted: 0, lastFaceSign: 1 });
  const carryRef = useRef<Ing[]>([]);
  // Point-and-click: where the bird is running to. interact=true uses the station on
  // arrival; mop=true cleans the grease under the bird on arrival (works while carrying).
  const targetRef = useRef<{ x: number; y: number; interact: boolean; mop?: boolean } | null>(null);
  const interactFnRef = useRef<() => void>(() => {});
  const mopFnRef = useRef<() => void>(() => {});
  // Slapstick props: bananas on the floor, explosion shockwave + flying debris, extinguisher foam
  const bananasRef = useRef<{ x: number; y: number; wob: number }[]>([]);
  const shockRef = useRef<{ x: number; y: number; start: number } | null>(null);
  const debrisRef = useRef<{ x: number; y: number; vx: number; vy: number; glyph: string; rot: number; vr: number; start: number; color?: string }[]>([]);
  const streakRef = useRef(0); // consecutive clean deliveries = tip multiplier
  const ordersRef = useRef<Order[]>([]);
  const orderIdRef = useRef(1);
  const orderBagRef = useRef<OrderTemplate[]>([]); // shuffle-bag so the whole menu cycles
  const firesRef = useRef<Fire[]>([]);
  const pigeonsRef = useRef<Pigeon[]>([]);
  const spillsRef = useRef<Spill[]>([]);
  // Cleaning combo — chain mops within a window for score multiplier.
  const cleanComboRef = useRef({ count: 0, expires: 0 });
  const [cleanCombo, setCleanCombo] = useState(0);
  const floatsRef = useRef<FloatText[]>([]);
  const hasExtinguisherRef = useRef(false);
  const mopRef = useRef({ has: false, charges: 0, max: 5, nextSwing: 0 });
  const [_mopTick, setMopTick] = useState(0);
  const grillRef = useRef({ progress: 0, item: null as Ing | null });
  const fryerRef = useRef({ progress: 0, item: null as Ing | null });
  const minimapRef = useRef<HTMLDivElement | null>(null);
  const shakeRef = useRef(0); // seconds remaining
  const explosionRef = useRef(0); // 0..1 flash intensity remaining
  const viceRef = useRef({ smokeCd: 0, drinkCd: 0, buzz: 0 });
  // Vice acting: he really raises the cig / pulls the flask for a couple seconds
  const viceAnimRef = useRef<{ type: null | "smoke" | "flask"; t: number; max: number }>({ type: null, t: 0, max: 1 });
  // Kitchen disasters
  const alarmRef = useRef({ life: 0, strobe: 0 }); // life > 0 = smoke alarm blaring
  const flareRef = useRef({ x: 0, y: 0, r: 0, life: 0, max: 0 }); // fryer flare-up radial burst
  const signsRef = useRef<FallingSign[]>([]);
  const [_disasterTick, setDisasterTick] = useState(0);
  const [_viceTick, setViceTick] = useState(0);
  // Movement particles: pixel dust puffs + impact flashes at feet
  type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string; kind: "dust" | "flash" };
  const particlesRef = useRef<Particle[]>([]);
  const lastHopSinRef = useRef(0);
  type Trail = { x: number; y: number; face: number; hopY: number; t: number };
  const trailRef = useRef<Trail[]>([]);
  const lastDrawTimeRef = useRef<number>(0);
  // Perf mode — caps particles + throttles flashes when the kitchen gets busy.
  // Phones default to LEAN (fewer particles) so the game stays smooth on weaker devices.
  const isPhone = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse) and (max-width: 1023px)").matches;
  const perfRef = useRef({
    mode: (typeof localStorage !== "undefined" && (localStorage.getItem("bb_perf") as any)) || (isPhone ? "low" : "auto"), // "auto" | "low" | "high"
    fps: 60,
    scale: 1, // 0..1 — effective particle budget
    active: false, // true when auto-reducer engaged
  });
  const [perfMode, setPerfMode] = useState<"auto" | "low" | "high">(perfRef.current.mode);
  const [perfActive, setPerfActive] = useState(false);
  const [perfFps, setPerfFps] = useState(60);

  // Motion sensitivity — reduces shake, flash, and squash/stretch for accessibility
  const motionRef = useRef({
    mode: (typeof localStorage !== "undefined" && (localStorage.getItem("bb_motion") as any)) || "full", // "full" | "reduced"
    scale: 1, // motion multiplier applied at render time (1 full, 0.25 reduced)
  });
  motionRef.current.scale = motionRef.current.mode === "reduced" ? 0.25 : 1;
  const [motionMode, setMotionMode] = useState<"full" | "reduced">(motionRef.current.mode);

  // React-visible stats
  const [timeLeft, setTimeLeft] = useState(180);
  const [score, setScore] = useState(0);
  const [chaos, setChaos] = useState(0);
  const [_tick, setTick] = useState(0); // force render for orders/carry
  const statsRef = useRef({
    ordersCompleted: 0,
    ordersFailed: 0,
    foodBurned: 0,
    fires: 0,
    pigeonsChased: 0,
    dropped: 0,
  });
  const scoreRef = useRef(0);
  const chaosRef = useRef(0);
  const timeRef = useRef(roundConfig(1).time);
  const inspectorRef = useRef(-1); // >=0 while the shutdown countdown is running
  const [inspectorT, setInspectorT] = useState(-1);
  // Day/round progression
  const roundRef = useRef(1);
  const cfgRef = useRef<RoundCfg>(roundConfig(1));
  const roundStartScoreRef = useRef(0);          // score at the start of this day
  const [round, setRound] = useState(1);
  const [dayEarned, setDayEarned] = useState(0); // $ earned toward this day's rent (for HUD)
  const dayBannerRef = useRef<{ text: string; sub: string; until: number } | null>(null);
  const [dayBannerTick, setDayBannerTick] = useState(0);
  // Phones: the shift STARTS in takeover mode — no button hunting, the game just fills the screen.
  // Set after mount (not in the initializer) so SSR and first client render match — no hydration mismatch.
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse) and (max-width: 1023px)").matches || window.location.search.includes("fstest")) {
      setIsFs(true);
    }
  }, []);

  // While the game owns the screen, the page must not scroll or rubber-band underneath it
  useEffect(() => {
    if (!isFs) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overscrollBehavior = "";
    };
  }, [isFs]);

  const best = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(window.localStorage.getItem("bb_kc_best") || "0", 10);
  }, []);

  // Load images
  useEffect(() => {
    const bg = new Image();
    bg.src = kitchenBg;
    bg.onload = () => { bgImgRef.current = bg; };
    const m = new Image();
    m.src = employee.img; // each employee has their own hand-drawn sprite now
    m.onload = () => {
      // Sprites come on a solid cream background. Knock it out with a flood-fill
      // from the edges (preserves the cream BIRD BURGER hat), then trim to the bird.
      const scale = 480 / (m.naturalWidth || 1024);
      const w = Math.round((m.naturalWidth || 1024) * scale);
      const h = Math.round((m.naturalHeight || 1024) * scale);
      const work = document.createElement("canvas");
      work.width = w; work.height = h;
      const wc = work.getContext("2d", { willReadFrequently: true });
      if (!wc) { mascotImgRef.current = m; return; }
      wc.drawImage(m, 0, 0, w, h);
      try {
        const id = wc.getImageData(0, 0, w, h);
        const d = id.data;
        const br = d[0], bgc = d[1], bb = d[2]; // background sampled from a corner
        const T = 46 * 46;
        const nearBg = (p: number) => {
          const dr = d[p] - br, dg = d[p + 1] - bgc, db = d[p + 2] - bb;
          return dr * dr + dg * dg + db * db < T;
        };
        const seen = new Uint8Array(w * h);
        const stack: number[] = [];
        const visit = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= w || y >= h) return;
          const p = y * w + x;
          if (seen[p]) return;
          seen[p] = 1;
          if (nearBg(p * 4)) { d[p * 4 + 3] = 0; stack.push(p); }
        };
        for (let x = 0; x < w; x++) { visit(x, 0); visit(x, h - 1); }
        for (let y = 0; y < h; y++) { visit(0, y); visit(w - 1, y); }
        while (stack.length) {
          const p = stack.pop()!;
          const x = p % w, y = (p / w) | 0;
          visit(x + 1, y); visit(x - 1, y); visit(x, y + 1); visit(x, y - 1);
        }
        // Second pass: cream can get trapped between the legs where the edge-flood
        // can't reach. Clear leftover light background in the lower body only. The
        // hat and white eyes live up top (guarded); the lower body is purple/orange,
        // both far from cream, so we can key out anything light down here aggressively.
        const guard = Math.round(h * 0.52);
        const lightBg = (p: number) => {
          const dr = d[p] - br, dg = d[p + 1] - bgc, db = d[p + 2] - bb;
          return dr * dr + dg * dg + db * db < 90 * 90; // wide net, safe below the guard
        };
        for (let y = guard; y < h; y++) for (let x = 0; x < w; x++) {
          const p4 = (y * w + x) * 4;
          if (d[p4 + 3] !== 0 && lightBg(p4)) d[p4 + 3] = 0;
        }
        wc.putImageData(id, 0, 0);
        // trim to the bird's bounding box
        let minX = w, minY = h, maxX = 0, maxY = 0;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          if (d[(y * w + x) * 4 + 3] > 16) {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
          }
        }
        if (maxX <= minX || maxY <= minY) { minX = 0; minY = 0; maxX = w - 1; maxY = h - 1; }
        const bw = maxX - minX + 1, bh = maxY - minY + 1;
        const W2 = 256;
        const H2 = Math.round((bh / bw) * W2);
        const c = document.createElement("canvas");
        c.width = W2; c.height = H2;
        const cc = c.getContext("2d");
        if (!cc) { mascotImgRef.current = work; return; }
        cc.drawImage(work, minX, minY, bw, bh, 0, 0, W2, H2);
        // No tint pass — each employee's art carries its own colors now
        spriteAspectRef.current = H2 / W2;
        mascotImgRef.current = c;
      } catch {
        // getImageData can throw if the asset is treated as cross-origin; fall back
        spriteAspectRef.current = h / w;
        mascotImgRef.current = m;
      }
    };
    // Hazard sprites (already transparent PNGs — no knockout needed)
    ([["pigeon", hazardPigeon], ["grease", hazardGrease], ["fire", hazardFire]] as const).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => { hazardImgRef.current[key] = img; };
    });
    // Rasterize each ingredient icon from its SVG for canvas drawing
    (Object.keys(ING_SVG) as Ing[]).forEach((k) => {
      const img = new Image();
      img.src = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${ING_SVG[k]}</svg>`)}`;
      img.onload = () => { ingImgRef.current[k] = img; };
    });
  }, []);

  // Seed orders
  useEffect(() => {
    ordersRef.current = [];
    if (trainingRef.current) {
      // Training: one scripted order at a time, no clock, no mission banner —
      // the welcome card and Gary's bubble do the talking.
      spawnNamed("Nothing Burger");
      timeRef.current = roundConfig(1).time;
      setTick((t) => t + 1);
      return;
    }
    for (let i = 0; i < 3; i++) spawnOrder(true);
    // $BRGR holder perks: extra time on Day 1 + a starting buffer toward rent
    timeRef.current = roundConfig(1).time + holderTimeBonus;
    if (holderTier?.startBuffer) {
      scoreRef.current = holderTier.startBuffer;
      setScore(scoreRef.current);
      setDayEarned(scoreRef.current);
    }
    // State the mission the moment play begins
    dayBannerRef.current = {
      text: "DAY 1",
      sub: `MISSION: earn $${roundConfig(1).quota.toLocaleString()} rent before the clock runs out.`,
      until: performance.now() + 3200,
    };
    setDayBannerTick((n) => n + 1);
    setTick((t) => t + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Spawn one specific menu item — used by the training script.
  function spawnNamed(name: string) {
    const t = ORDER_POOL.find((tpl) => tpl.name === name);
    if (!t) return;
    ordersRef.current.push({ id: orderIdRef.current++, template: t, remaining: t.time });
    sfxRef.current.doorBell();
  }

  // Training over (finished or skipped) → wipe the slate and start a real Day 1.
  function graduate(celebrate: boolean) {
    trainingRef.current = false;
    setTrainUi(false);
    setTrainWelcome(false);
    onTrainingDone();
    statsRef.current = { ordersCompleted: 0, ordersFailed: 0, foodBurned: 0, fires: 0, pigeonsChased: 0, dropped: 0 };
    scoreRef.current = holderTier?.startBuffer ?? 0;
    roundRef.current = 1;
    cfgRef.current = roundConfig(1);
    roundStartScoreRef.current = scoreRef.current;
    timeRef.current = roundConfig(1).time + holderTimeBonus;
    chaosRef.current = 0;
    inspectorRef.current = -1;
    streakRef.current = 0;
    carryRef.current = [];
    grillRef.current = { progress: 0, item: null };
    fryerRef.current = { progress: 0, item: null };
    ordersRef.current = [];
    orderBagRef.current = [];
    for (let i = 0; i < 3; i++) spawnOrder(true);
    setScore(scoreRef.current);
    setRound(1);
    setDayEarned(Math.max(0, scoreRef.current));
    dayBannerRef.current = celebrate
      ? { text: "🎓 YOU'RE HIRED!", sub: `DAY 1 — earn $${roundConfig(1).quota.toLocaleString()} rent before the clock runs out. Good luck.`, until: performance.now() + 3600 }
      : { text: "DAY 1", sub: `MISSION: earn $${roundConfig(1).quota.toLocaleString()} rent before the clock runs out.`, until: performance.now() + 3200 };
    setDayBannerTick((n) => n + 1);
    if (celebrate) {
      sfxRef.current.fanfare();
      const pu = STATIONS.find((s) => s.id === "pickup")!;
      for (let ci = 0; ci < 14; ci++) {
        const a = Math.PI * (0.8 + Math.random() * 1.4);
        const sp = 0.09 + Math.random() * 0.18;
        debrisRef.current.push({
          x: pu.x + pu.w / 2, y: pu.y + pu.h / 2,
          vx: Math.cos(a) * sp, vy: -Math.abs(Math.sin(a)) * sp - 0.08,
          glyph: "$", rot: 0, vr: (Math.random() - 0.5) * 6,
          start: performance.now(), color: "#00C805",
        });
      }
    }
    setTick((t) => t + 1);
  }

  function spawnOrder(silent = false) {
    // Shuffle-bag: deal every eligible menu item once before any repeats, so a run
    // rolls through the WHOLE menu instead of hammering the same order. The bag is
    // filtered to the day's complexity and refilled (reshuffled) when it empties.
    const maxItems = cfgRef.current.maxItems;
    let idx = orderBagRef.current.findIndex((t) => t.items.length <= maxItems);
    if (idx === -1) {
      const eligible = ORDER_POOL.filter((t) => t.items.length <= maxItems);
      for (let i = eligible.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
      }
      orderBagRef.current = eligible;
      idx = 0;
    }
    const t = orderBagRef.current.splice(idx, 1)[0];
    ordersRef.current.push({ id: orderIdRef.current++, template: t, remaining: t.time });
    if (!silent) sfxRef.current.doorBell(); // a customer just walked in
  }

  // Advance to the next Day — bigger rent, harder kitchen. Celebrate + reset the clock.
  function advanceRound() {
    const completedDay = roundRef.current;
    const bonus = 100 + completedDay * 40; // completion tip
    scoreRef.current += bonus;
    const next = completedDay + 1;
    roundRef.current = next;
    cfgRef.current = roundConfig(next);
    roundStartScoreRef.current = scoreRef.current;
    timeRef.current = cfgRef.current.time + holderTimeBonus;
    inspectorRef.current = -1;
    chaosRef.current = Math.max(0, chaosRef.current - 1.5); // breather into the new day
    setRound(next);
    setDayEarned(0);
    setScore(scoreRef.current);
    dayBannerRef.current = {
      text: `DAY ${completedDay} DONE!`,
      sub: `NEW MISSION — Day ${next}: earn $${cfgRef.current.quota.toLocaleString()} rent.`,
      until: performance.now() + 3000,
    };
    setDayBannerTick((n) => n + 1);
    sfxRef.current.fanfare();
    // quick coin burst at the pickup window
    const pu = STATIONS.find((s) => s.id === "pickup")!;
    for (let ci = 0; ci < 10; ci++) {
      const a = Math.PI * (0.85 + Math.random() * 1.3);
      const sp = 0.09 + Math.random() * 0.16;
      debrisRef.current.push({
        x: pu.x + pu.w / 2, y: pu.y + pu.h / 2,
        vx: Math.cos(a) * sp, vy: -Math.abs(Math.sin(a)) * sp - 0.08,
        glyph: "$", rot: 0, vr: (Math.random() - 0.5) * 6,
        start: performance.now(), color: "#00C805",
      });
    }
    // fresh orders sized to the new day; reshuffle so newly-unlocked menu items appear
    orderBagRef.current = [];
    ordersRef.current = [];
    for (let i = 0; i < 3; i++) spawnOrder(true);
    setTick((t) => t + 1);
  }

  // Explosion cinematics: shockwave ring + food shrapnel raining across the kitchen
  function cinematicBoom(x: number, y: number) {
    shockRef.current = { x, y, start: performance.now() };
    const glyphs = ["🍟", "🍔", "🔩", "🔥", "🥓", "🧀"];
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.12 + Math.random() * 0.35;
      debrisRef.current.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: -Math.abs(Math.sin(a)) * sp - 0.18,
        glyph: glyphs[i % glyphs.length],
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 12,
        start: performance.now(),
      });
    }
  }

  // Extinguisher foam: a satisfying cloud of white puffs over the fire
  function foamBurst(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.03 + Math.random() * 0.08;
      debrisRef.current.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: -Math.random() * 0.08,
        glyph: Math.random() < 0.5 ? "💨" : "☁️",
        rot: 0, vr: 0,
        start: performance.now(),
      });
    }
  }

  // Input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if (["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase()) || k === " ") e.preventDefault();
      if (k === " " || k === "e") interact();
      if (k === "q") dropCarry();
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch controls (mobile)
  const touchRef = useRef<{ dx: number; dy: number } | null>(null);
  const [showTouch, setShowTouch] = useState(false);
  const [hudOpen, setHudOpen] = useState(false);
  useEffect(() => {
    setShowTouch("ontouchstart" in window);
  }, []);

  function nearestStation(): Station | null {
    const p = playerRef.current;
    let best: { s: Station; d: number } | null = null;
    for (const s of STATIONS) {
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;
      const d = Math.hypot(p.x - cx, p.y - cy);
      const range = Math.max(s.w, s.h) * 0.85 + 0.025;
      if (d < range && (!best || d < best.d)) best = { s, d };
    }
    return best?.s ?? null;
  }

  function pushFloat(text: string, color: string) {
    floatsRef.current.push({ x: playerRef.current.x, y: playerRef.current.y - 0.03, text, color, life: 1 });
  }

  // ── GUIDANCE: what does the CURRENT (first) order still need, and where do you get it? ──
  function guidance(): { stationId: string; text: string } | null {
    // FIRES trump everything — the kitchen burning down is priority one
    const fire = firesRef.current[0];
    if (fire) {
      if (!hasExtinguisherRef.current) return { stationId: "extinguisher", text: "🔥 FIRE! GRAB THE EXTINGUISHER!" };
      return { stationId: fire.stationId, text: "🧯 CLICK THE FIRE TO SPRAY IT!" };
    }
    const o = ordersRef.current[0];
    if (!o) return null;
    const pool = [...carryRef.current];
    const need: Ing[] = [];
    for (const it of o.template.items) {
      const i = pool.indexOf(it);
      if (i >= 0) pool.splice(i, 1);
      else need.push(it);
    }
    if (need.length === 0) return { stationId: "pickup", text: "ORDER READY — DELIVER AT PICK UP!" };
    const next = need[0];
    switch (next) {
      case "bun": return { stationId: "fridge", text: "GRAB A BUN FROM THE FRIDGE" };
      case "patty_cooked": {
        if (grillRef.current.item === "patty_cooked") return { stationId: "grill", text: "PATTY DONE — GRAB IT OFF THE GRILL!" };
        if (grillRef.current.item === "patty_raw") return { stationId: "grill", text: "PATTY COOKING — DON'T LET IT BURN" };
        if (carryRef.current.includes("patty_raw")) return { stationId: "grill", text: "PUT THE PATTY ON THE GRILL" };
        return { stationId: "raw_patty", text: "GRAB A RAW PATTY" };
      }
      case "lettuce_chopped": {
        if (carryRef.current.includes("lettuce_raw")) return { stationId: "cutting", text: "CHOP THE LETTUCE (PRESS E AGAIN)" };
        return { stationId: "cutting", text: "GET LETTUCE AT THE CHOP BOARD" };
      }
      case "cheese": return { stationId: "cheese", text: "GRAB CHEESE" };
      case "sauce": return { stationId: "sauce", text: "GRAB SAUCE" };
      case "fries": {
        if (fryerRef.current.item === "fries") return { stationId: "fryer", text: fryerRef.current.progress >= 1 ? "FRIES DONE — GRAB THEM!" : "FRIES FRYING — WAIT FOR IT" };
        return { stationId: "fryer", text: "START THE FRYER FOR FRIES" };
      }
      case "nugget": {
        if (fryerRef.current.item === "nugget") return { stationId: "fryer", text: fryerRef.current.progress >= 1 ? "NUGGETS DONE — GRAB THEM!" : "NUGGETS FRYING — WAIT FOR IT" };
        return { stationId: "fryer", text: "START THE FRYER FOR NUGGETS" };
      }
      case "shake": return { stationId: "drink", text: "POUR A SHAKE AT DRINKS" };
      default: return null;
    }
  }

  function tryDeliverAtPickup() {
    const carry = carryRef.current;
    if (carry.length === 0) { pushFloat("EMPTY!", "#EF4444"); return; }
    // find matching order (any order whose sorted items match sorted carry)
    const key = [...carry].sort().join("|");
    const idx = ordersRef.current.findIndex((o) => [...o.template.items].sort().join("|") === key);
    if (idx === -1) {
      pushFloat("WRONG ORDER", "#EF4444");
      chaosRef.current = Math.min(6, chaosRef.current + 0.5);
      setChaos(chaosRef.current);
      statsRef.current.dropped++;
      streakRef.current = 0;
      carryRef.current = [];
      return;
    }
    const order = ordersRef.current[idx];
    streakRef.current++;
    const streakMult = 1 + Math.min(0.5, (streakRef.current - 1) * 0.1);
    // Speed pays: fresh orders are worth more, so hustling makes rent.
    // Tuned by autopilot playtests — 2 was a coin-flip loss, 3.5 ended shifts in 33s.
    const timeBonus = Math.max(0, Math.floor(order.remaining * 2.6));
    const gain = Math.round((order.template.score + timeBonus) * employee.tips * streakMult * holderTips);
    scoreRef.current += gain;
    setScore(scoreRef.current);
    statsRef.current.ordersCompleted++;
    sfxRef.current.kaching();
    // cash burst at the pickup window
    const pu = STATIONS.find((s) => s.id === "pickup")!;
    for (let ci = 0; ci < 8; ci++) {
      const a = Math.PI * (0.9 + Math.random() * 1.2);
      const sp = 0.08 + Math.random() * 0.14;
      debrisRef.current.push({
        x: pu.x + pu.w / 2, y: pu.y + pu.h / 2,
        vx: Math.cos(a) * sp, vy: -Math.abs(Math.sin(a)) * sp - 0.06,
        glyph: "$", rot: 0, vr: (Math.random() - 0.5) * 6,
        start: performance.now(), color: "#00C805",
      });
    }
    pushFloat(`+$${gain}`, "#00C805");
    if (streakRef.current >= 2) pushFloat(`STREAK ×${streakRef.current} — TIPS +${Math.round((streakMult - 1) * 100)}%`, "#FACC15");
    ordersRef.current.splice(idx, 1);
    carryRef.current = [];
    // Training script: order 1 done → serve up the McRug Pull lesson;
    // order 2 done → graduate into the real Day 1.
    if (trainingRef.current) {
      if (trainStepRef.current === 0) {
        trainStepRef.current = 1;
        setTrainStep(1);
        sfxRef.current.chime();
        pushFloat("LESSON 1 DONE!", "#22D3EE");
        setTimeout(() => { spawnNamed("McRug Pull"); setTick((t) => t + 1); }, 700);
      } else {
        graduate(true);
      }
      setTick((t) => t + 1);
      return;
    }
    // spawn a new one
    setTimeout(() => { spawnOrder(); setTick((t) => t + 1); }, 400);
    setTick((t) => t + 1);
  }

  // Mop the grease under the bird — ONE tap fully cleans it, and it works even
  // while carrying food (you shouldn't have to drop your order to wipe the floor).
  function mopHere() {
    const p = playerRef.current;
    const spillHit = spillsRef.current.find((sp) => Math.hypot(p.x - sp.x, p.y - sp.y) < sp.r + 0.06);
    if (!spillHit) return;
    const cap = perfRef.current.scale;
    setMopTick((t) => t + 1);
    const now = performance.now();
    const combo = cleanComboRef.current;
    if (now < combo.expires) combo.count += 1; else combo.count = 1;
    combo.expires = now + 3200;
    setCleanCombo(combo.count);
    const multi = 1 + (combo.count - 1) * 0.5;
    const gained = Math.round(40 * multi);
    // satisfying splash burst
    const burst = Math.round(20 * cap);
    for (let i = 0; i < burst; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.4 + Math.random() * 0.9;
      particlesRef.current.push({
        x: spillHit.x, y: spillHit.y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.55 - 0.25,
        life: 0, max: 0.5 + Math.random() * 0.25, size: 3 + Math.random() * 3,
        color: `hsl(${spillHit.hue}, 65%, ${28 + Math.random() * 20}%)`, kind: "dust",
      });
    }
    particlesRef.current.push({
      x: spillHit.x, y: spillHit.y, vx: 0, vy: 0,
      life: 0, max: 0.32, size: spillHit.r * 260,
      color: combo.count >= 3 ? "#FACC15" : "#22D3EE", kind: "flash",
    });
    spillsRef.current = spillsRef.current.filter((sp) => sp !== spillHit);
    scoreRef.current += gained;
    setScore(scoreRef.current);
    chaosRef.current = Math.max(0, chaosRef.current - 0.4 - combo.count * 0.06);
    sfxRef.current.mop(0.9, 1);
    sfxRef.current.mopDone(combo.count);
    pushFloat(combo.count >= 2 ? `x${combo.count} COMBO  +${gained}` : `+ MOPPED  +${gained}`, combo.count >= 3 ? "#FACC15" : "#22D3EE");
    setTick((t) => t + 1);
  }

  function interact() {
    // Station use is the priority. (Grease is cleaned by tapping the puddle → mopHere.)
    const s = nearestStation();
    if (!s) { mopHere(); return; } // Space with no station nearby → mop any grease underfoot
    const carry = carryRef.current;
    switch (s.kind) {
      case "fridge": {
        if (carry.length >= 4) return pushFloat("HANDS FULL", "#EF4444");
        carry.push("bun");
        pushFloat("+ BUN", "#FACC15");
        break;
      }
      case "raw_patty": {
        if (carry.length >= 4) return pushFloat("HANDS FULL", "#EF4444");
        carry.push("patty_raw");
        pushFloat("+ RAW PATTY", "#B24545");
        break;
      }
      case "cheese": {
        if (carry.length >= 4) return pushFloat("HANDS FULL", "#EF4444");
        carry.push("cheese");
        pushFloat("+ CHEESE", "#F5C518");
        break;
      }
      case "sauce": {
        if (carry.length >= 4) return pushFloat("HANDS FULL", "#EF4444");
        carry.push("sauce");
        pushFloat("+ SAUCE", "#EC4899");
        break;
      }
      case "drink": {
        if (carry.length >= 4) return pushFloat("HANDS FULL", "#EF4444");
        carry.push("shake");
        pushFloat("+ SHAKE", "#F8B4D9");
        break;
      }
      case "cutting": {
        const i = carry.indexOf("lettuce_raw");
        if (i !== -1) {
          carry[i] = "lettuce_chopped";
          pushFloat("CHOPPED!", "#65D65C");
        } else {
          if (carry.length >= 4) return pushFloat("HANDS FULL", "#EF4444");
          carry.push("lettuce_raw");
          pushFloat("+ LETTUCE", "#3DA34D");
        }
        break;
      }
      case "grill": {
        // extinguish grill fire first if one's burning
        const grillFire = firesRef.current.find((fi) => fi.stationId === s.id);
        if (grillFire) {
          if (hasExtinguisherRef.current) {
            firesRef.current = firesRef.current.filter((fi) => fi !== grillFire);
            hasExtinguisherRef.current = false;
            sfxRef.current.hiss();
            foamBurst(grillFire.x, grillFire.y);
            pushFloat("PUT OUT!", "#22D3EE");
            scoreRef.current += 80;
            setScore(scoreRef.current);
            chaosRef.current = Math.max(0, chaosRef.current - 1);
            setChaos(chaosRef.current);
          } else {
            pushFloat("GET EXTINGUISHER!", "#EF4444");
          }
          break;
        }
        const g = grillRef.current;
        if (g.item === null) {
          const i = carry.indexOf("patty_raw");
          if (i !== -1) {
            carry.splice(i, 1);
            g.item = "patty_raw";
            g.progress = 0;
            pushFloat("COOKING…", "#F97316");
          } else {
            pushFloat("NEED PATTY", "#EF4444");
          }
        } else if (g.item === "patty_cooked") {
          if (carry.length >= 4) return pushFloat("HANDS FULL", "#EF4444");
          carry.push("patty_cooked");
          g.item = null;
          g.progress = 0;
          pushFloat("+ COOKED PATTY", "#FFD24A");
        } else if (g.item === "patty_raw") {
          pushFloat(`COOKING — ${Math.ceil((1 - g.progress) * 5)}s`, "#F97316");
        }
        break;
      }
      case "fryer": {
        const f = fryerRef.current;
        // extinguish if fire here first
        const fireHere = firesRef.current.find((fi) => fi.stationId === s.id);
        if (fireHere) {
          if (hasExtinguisherRef.current) {
            firesRef.current = firesRef.current.filter((fi) => fi !== fireHere);
            hasExtinguisherRef.current = false;
            sfxRef.current.hiss();
            foamBurst(fireHere.x, fireHere.y);
            pushFloat("PUT OUT!", "#22D3EE");
            scoreRef.current += 80;
            setScore(scoreRef.current);
            chaosRef.current = Math.max(0, chaosRef.current - 1);
            setChaos(chaosRef.current);
          } else {
            pushFloat("GET EXTINGUISHER!", "#EF4444");
          }
          break;
        }
        if (f.item === null) {
          // Fry what the orders actually need — nuggets if an order wants them and we don't have one
          const needNugget = ordersRef.current.some((o) => o.template.items.includes("nugget")) && !carry.includes("nugget");
          f.item = needNugget ? ("nugget" as Ing) : "fries";
          f.progress = 0;
          pushFloat(needNugget ? "FRYING NUGGETS…" : "FRYING…", "#FACC15");
        } else if (f.progress >= 1) {
          if (carry.length >= 4) return pushFloat("HANDS FULL", "#EF4444");
          const got = f.item === "nugget" ? "nugget" : "fries";
          carry.push(got as Ing);
          f.item = null;
          f.progress = 0;
          pushFloat(got === "nugget" ? "+ NUGGETS" : "+ FRIES", "#FFD24A");
        } else {
          pushFloat(`STILL FRYING — ${Math.ceil((1 - f.progress) * 4)}s`, "#FACC15");
        }
        break;
      }
      case "assembly": {
        pushFloat("ASSEMBLED", "#7C3AED");
        break;
      }
      case "pickup": {
        tryDeliverAtPickup();
        break;
      }
      case "extinguisher": {
        hasExtinguisherRef.current = true;
        pushFloat("EXTINGUISHER!", "#EF4444");
        break;
      }
      case "mop": {
        const mop = mopRef.current;
        if (!mop.has) {
          mop.has = true;
          mop.charges = mop.max;
          pushFloat("MOP BUCKET!", "#22D3EE");
        } else if (mop.charges < mop.max) {
          mop.charges = mop.max;
          pushFloat("REFILLED", "#22D3EE");
        } else {
          pushFloat("BUCKET FULL", "#22D3EE");
        }
        setMopTick((t) => t + 1);
        break;
      }
    }
    setTick((t) => t + 1);
  }

  function dropCarry() {
    if (carryRef.current.length === 0) return;
    carryRef.current = [];
    statsRef.current.dropped++;
    pushFloat("DROPPED", "#EF4444");
    setTick((t) => t + 1);
  }

  // Main loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let fireCd = 8;
    let pigeonCd = 15;
    let spillCd = 6;
    let disasterCd = 18 + Math.random() * 8;
    let bananaCd = 12;
    let orderTickAcc = 0;
    let uiTickAcc = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // FPS tracking + perf-mode scale
      {
        const instFps = dt > 0 ? 1 / dt : 60;
        const pr = perfRef.current;
        pr.fps = pr.fps * 0.92 + instFps * 0.08;
        let targetScale = 1;
        if (pr.mode === "low") targetScale = 0.35;
        else if (pr.mode === "high") targetScale = 1;
        else {
          // auto: react to fps AND on-screen busy-ness
          const busy = firesRef.current.length + signsRef.current.length + spillsRef.current.length * 0.5 + pigeonsRef.current.length + (explosionRef.current > 0.1 ? 3 : 0);
          if (pr.fps < 30 || busy > 10) targetScale = 0.25;
          else if (pr.fps < 45 || busy > 6) targetScale = 0.5;
          else if (pr.fps < 55 || busy > 4) targetScale = 0.75;
          else targetScale = 1;
        }
        pr.scale += (targetScale - pr.scale) * Math.min(1, dt * 3);
        const wasActive = pr.active;
        pr.active = pr.scale < 0.9;
        // cap live particle count
        const cap = Math.max(24, Math.floor(220 * pr.scale));
        if (particlesRef.current.length > cap) {
          particlesRef.current.splice(0, particlesRef.current.length - cap);
        }
        if (pr.active !== wasActive) setPerfActive(pr.active);
      }


      // Movement
      const p = playerRef.current;
      let dx = 0, dy = 0;
      const k = keysRef.current;
      if (k["w"] || k["arrowup"]) dy -= 1;
      if (k["s"] || k["arrowdown"]) dy += 1;
      if (k["a"] || k["arrowleft"]) dx -= 1;
      if (k["d"] || k["arrowright"]) dx += 1;
      if (touchRef.current) { dx += touchRef.current.dx; dy += touchRef.current.dy; }
      // Point-and-click: run toward the clicked spot unless keys/joystick take over
      let autoRun = false;
      if (dx !== 0 || dy !== 0) {
        targetRef.current = null;
      } else if (targetRef.current) {
        const tgt = targetRef.current;
        const ddx = tgt.x - p.x, ddy = tgt.y - p.y;
        if (Math.hypot(ddx, ddy) > 0.014) {
          dx = ddx; dy = ddy; autoRun = true;
        } else {
          targetRef.current = null;
          if (tgt.mop) mopFnRef.current();
          else if (tgt.interact) interactFnRef.current();
        }
      }
      const mag = Math.hypot(dx, dy);
      if (mag > 0) { dx /= mag; dy /= mag; }
      const dashing = (k["shift"] || false) && p.dashCd <= 0 && mag > 0;
      // Click-running is brisk — nobody likes watching a bird stroll
      const speed = (dashing ? 0.55 : autoRun ? 0.42 : 0.28) * employee.speed;
      if (dashing) { p.dashCd = 1.2; sfxRef.current.whoosh("start", 1); }
      p.dashCd = Math.max(0, p.dashCd - dt);
      // slip if in grease
      if (p.slipT > 0) { p.slipT -= dt; }
      p.vx = dx * speed; p.vy = dy * speed;
      p.x = clamp(p.x + dx * speed * dt, 0.02, 0.98);
      p.y = clamp(p.y + dy * speed * dt, 0.10, 0.96);
      // Grease spills: overlapping puddle → boost slipT (drunk-like slide)
      for (const sp of spillsRef.current) {
        if (Math.hypot(p.x - sp.x, p.y - sp.y) < sp.r) {
          if (p.slipT < 0.1) sfxRef.current.slip();
          p.slipT = Math.max(p.slipT, dashing ? 0.9 : 0.55);
          // small perpendicular nudge for a "banana peel" feel
          const nudge = (dashing ? 0.05 : 0.025) * dt * 60 * 0.016;
          p.x = clamp(p.x + (-dy) * nudge, 0.02, 0.98);
          p.y = clamp(p.y + (dx) * nudge, 0.10, 0.96);
          break;
        }
      }
      // Facing: weighted-average of recent horizontal input, driven by a critically-damped spring
      // to eliminate jitter on rapid direction changes (angular-velocity smoothing).
      {
        const hist = dirHistoryRef.current;
        // Push current sample; weight scales with input magnitude so idle frames don't dilute intent
        hist.push({ dx, w: Math.min(1, Math.abs(dx) * 4 + 0.05) });
        // Keep ~180ms window (assuming ~60fps → ~11 samples). Trim by time via dt accumulator would be ideal;
        // a fixed cap works reliably enough for smoothing purposes.
        if (hist.length > 12) hist.shift();
        // Exponentially-weighted average (newer samples weigh more)
        let sum = 0, wsum = 0;
        for (let i = 0; i < hist.length; i++) {
          const recency = Math.pow(0.82, hist.length - 1 - i); // most recent = 1
          const w = hist[i].w * recency;
          sum += hist[i].dx * w;
          wsum += w;
        }
        const dirAvgRaw = wsum > 0 ? sum / wsum : (p.face >= 0 ? 1 : -1);
        // Deadband: below threshold, hold last facing to prevent zero-crossing jitter
        const active = Math.abs(dirAvgRaw) > 0.06;
        p.dirAvg = active ? dirAvgRaw : p.dirAvg;

        // ---- Turning estimation (predictive lookahead) ----
        // Estimate d(dirAvg)/dt with a low-pass filter, then project ~110ms ahead so the
        // face target flips slightly BEFORE the smoothed input actually crosses zero.
        const te = turnEstRef.current;
        const rawVel = dt > 0 ? (p.dirAvg - te.prevDirAvg) / dt : 0;
        // EMA on angular-input velocity to keep the estimate stable (α ≈ 0.35)
        te.dirVel = te.dirVel * 0.65 + rawVel * 0.35;
        te.prevDirAvg = p.dirAvg;
        // Lookahead grows when input is accelerating; capped so it can't overshoot into noise.
        // Longer lookahead when NOT dashing (float feels planned); shorter on dash (already snappy).
        const lookahead = (p.dashCd > 0.6 ? 0.06 : 0.12); // seconds
        const predRaw = p.dirAvg + te.dirVel * lookahead;
        te.predicted = Math.max(-1.5, Math.min(1.5, predRaw));

        // Face target uses the *predicted* direction when a flip is imminent, else the smoothed dir.
        // "Imminent" = predicted sign differs from current face sign AND |predicted| clears deadband.
        const predSign = te.predicted > 0.06 ? 1 : te.predicted < -0.06 ? -1 : 0;
        const smoothSign = p.dirAvg > 0 ? 1 : -1;
        const willFlip = predSign !== 0 && predSign !== Math.sign(p.face) && Math.abs(te.dirVel) > 0.35;
        const faceTarget = !active
          ? (p.face >= 0 ? 1 : -1)
          : willFlip
            ? predSign
            : smoothSign;

        // Dash-vs-normal blend: fresh dash window feels punchier and more committed;
        // normal hops feel floaty with a longer anticipation read.
        const recentDash = p.dashCd > 0.6; // ~first half of dashCd = "still dashing"
        const dashMix = Math.max(0, Math.min(1, (p.dashCd - 0.6) / 0.6)); // 1 fresh → 0 stale

        // Anticipation lean triggers on target flip (uses smoothed target, not raw input)
        if (Math.sign(faceTarget) !== 0 && Math.sign(faceTarget) !== Math.sign(p.face) && Math.sign(p.leanDir) !== Math.sign(faceTarget)) {
          p.leanDir = Math.sign(faceTarget);
          // Dash flips commit fast & hard (short, sharp); normal flips read as a longer lean
          p.lean = recentDash ? 1.35 : 1.0;
        }
        // Dash lean burns off faster (crisp), normal lean lingers (readable)
        p.lean = Math.max(0, p.lean - dt * (recentDash ? 5.8 : 3.4));

        // Critically-damped spring: dash = snappy + slight underdamp for a whip crack;
        // normal = fully critical for smooth, jitter-free glide.
        const omega = recentDash ? (11 + 6 * dashMix) : 8.5; // 11..17 dash, 8.5 normal
        const zeta = recentDash ? (0.78 + 0.22 * (1 - dashMix)) : 1.0; // 0.78→1.0 dash, 1.0 normal
        const err = faceTarget - p.face;
        const accel = omega * omega * err - 2 * zeta * omega * p.faceVel;
        // Clamp dt for spring stability on frame hitches
        const sdt = Math.min(dt, 1 / 30);
        p.faceVel += accel * sdt;
        p.face += p.faceVel * sdt;
        // Micro-damp tiny residual velocity to eliminate sub-pixel jitter when settled
        if (Math.abs(err) < 0.002 && Math.abs(p.faceVel) < 0.05) {
          p.face = faceTarget;
          p.faceVel = 0;
        }

        // ---- Turnaround dust burst ----
        // Emit a one-shot spray when the sprite's face sign actually flips (i.e., the
        // rotation crossed zero). Fires OPPOSITE the new direction so it reads as pushed-off dust.
        const nowSign = p.face > 0.15 ? 1 : p.face < -0.15 ? -1 : 0;
        if (nowSign !== 0 && nowSign !== te.lastFaceSign) {
          const away = -nowSign; // spray behind the bird
          const fx = p.x;
          const fy = p.y + 0.03;
          const scale2 = perfRef.current.scale;
          const wasDash = p.dashCd > 0.5;
          const count = Math.max(2, Math.round((wasDash ? 12 : 7) * scale2));
          for (let i = 0; i < count; i++) {
            const spread = (Math.random() - 0.5) * 0.7; // narrow horizontal fan
            const ang = spread; // ~horizontal
            const spd = 0.08 + Math.random() * (wasDash ? 0.14 : 0.09);
            particlesRef.current.push({
              x: fx + away * 0.006 + (Math.random() - 0.5) * 0.006,
              y: fy + (Math.random() - 0.5) * 0.004,
              vx: away * (Math.cos(ang) * spd) + p.vx * -0.12,
              vy: -Math.abs(Math.sin(ang)) * spd * 0.4 - 0.02 - Math.random() * 0.015,
              life: 0,
              max: 0.32 + Math.random() * 0.22,
              size: 2 + Math.floor(Math.random() * 3),
              color: Math.random() < 0.35 ? "#FACC15" : (Math.random() < 0.5 ? "#E7D9B8" : "#B8A98A"),
              kind: "dust",
            });
          }
          // Small crisp pixel-flash at the pivot point (skipped under perf pressure or reduced motion)
          if (motionRef.current.mode !== "reduced" && (scale2 > 0.55 || Math.random() < scale2)) {
            particlesRef.current.push({
              x: fx, y: fy, vx: 0, vy: 0, life: 0,
              max: 0.14,
              size: (wasDash ? 18 : 12) * (0.7 + 0.3 * scale2),
              color: "#FFF6C2", kind: "flash",
            });
          }
          te.lastFaceSign = nowSign;
        } else if (nowSign !== 0) {
          te.lastFaceSign = nowSign;
        }
      }
      // Hop animation: advance phase only while moving; faster when dashing
      const prevSin = lastHopSinRef.current;
      if (mag > 0) {
        p.moveT += dt;
        p.hopPhase += dt * (dashing ? 11 : 7);
      } else {
        p.moveT = Math.max(0, p.moveT - dt * 2);
        // ease phase back to 0 (feet down) when idle
        const target = Math.round(p.hopPhase / Math.PI) * Math.PI;
        p.hopPhase += (target - p.hopPhase) * Math.min(1, dt * 8);
      }
      const curSin = Math.sin(p.hopPhase);
      // Takeoff detection: sin crossed from ~0 upward while moving
      if (mag > 0 && prevSin <= 0.05 && curSin > 0.05) {
        sfxRef.current.hop(dashing ? 1.15 : 0.9);
        // Mid-dash whoosh on each hop takeoff while dashing (rate-limited inside the hook)
        if (p.dashCd > 0.6) sfxRef.current.whoosh("mid", 0.9);
      }
      // Landing detection: sin crossed from positive to non-positive while moving
      if (mag > 0 && prevSin > 0.05 && curSin <= 0) {
        const fx = p.x;
        const fy = p.y + 0.03; // at feet (normalized)
        const scale = perfRef.current.scale;
        const baseCount = dashing ? 10 : 6;
        const count = Math.max(1, Math.round(baseCount * scale));
        for (let i = 0; i < count; i++) {
          const ang = Math.PI + (Math.random() - 0.5) * Math.PI * 0.9;
          const spd = 0.05 + Math.random() * (dashing ? 0.11 : 0.07);
          particlesRef.current.push({
            x: fx + (Math.random() - 0.5) * 0.008,
            y: fy + (Math.random() - 0.5) * 0.004,
            vx: Math.cos(ang) * spd + p.face * -0.02,
            vy: -Math.abs(Math.sin(ang)) * spd * 0.5 - 0.03,
            life: 0,
            max: 0.35 + Math.random() * 0.25,
            size: 2 + Math.floor(Math.random() * 3),
            color: Math.random() < 0.25 ? "#FACC15" : (Math.random() < 0.5 ? "#E7D9B8" : "#B8A98A"),
            kind: "dust",
          });
        }
        // Flash: skip probabilistically when perf-mode is reducing effects, or entirely under reduced motion
        if (motionRef.current.mode !== "reduced" && (scale > 0.55 || Math.random() < scale)) {
          particlesRef.current.push({ x: fx, y: fy, vx: 0, vy: 0, life: 0, max: 0.18, size: (dashing ? 22 : 16) * (0.7 + 0.3 * scale), color: "#FFF6C2", kind: "flash" });
        }
        p.landT = dashing ? 0.16 : 0.13;
        sfxRef.current.land(dashing ? 1.2 : 0.85);
        // Extra punch on a dash landing — layered on top of the regular land thump
        if (p.dashCd > 0.5) sfxRef.current.dashLand(1);
      }
      lastHopSinRef.current = curSin;
      p.landT = Math.max(0, p.landT - dt);
      if (mag <= 0) p.idleT += dt; else p.idleT = 0;

      // Grill cooking
      const g = grillRef.current;
      if (g.item === "patty_raw") {
        g.progress += (dt * employee.cook) / 5;
        if (g.progress >= 1) {
          g.item = "patty_cooked";
          floatsRef.current.push({ x: 0.53, y: 0.26, text: "🔔 PATTY READY!", color: "#FACC15", life: 1.6 });
        }
      } else if (g.item === "patty_cooked") {
        g.progress += dt / 14;
        if (g.progress >= 2) {
          g.item = null; g.progress = 0;
          statsRef.current.foodBurned++;
          chaosRef.current = Math.min(6, chaosRef.current + 0.5);
          chaosRef.current = chaosRef.current;
        }
      }
      // Fryer cooking
      const f = fryerRef.current;
      if (f.item) {
        const beforeF = f.progress;
        // Cooks in 4s, then a generous 12s grab window before it burns
        f.progress += f.progress < 1 ? (dt * employee.cook) / 4 : dt / 12;
        if (beforeF < 1 && f.progress >= 1) {
          floatsRef.current.push({ x: 0.685, y: 0.3, text: f.item === "nugget" ? "🔔 NUGGETS READY!" : "🔔 FRIES READY!", color: "#FACC15", life: 1.6 });
        }
        if (f.progress > 2) {
          f.item = null; f.progress = 0;
          statsRef.current.foodBurned++;
          chaosRef.current = Math.min(6, chaosRef.current + 0.5);
          floatsRef.current.push({ x: 0.685, y: 0.3, text: "BURNED!", color: "#EF4444", life: 1.4 });
        }
      }

      // Fires + mishaps
      // Tutorial grace: no fires/disasters/spills/pigeons during the training
      // shift or until the first real order is done
      const inTutorial = trainingRef.current || statsRef.current.ordersCompleted < 1;

      // Bananas: they spawn, you slip, everyone laughs
      bananaCd -= dt;
      if (bananaCd <= 0 && bananasRef.current.length < 2 && !inTutorial && cfgRef.current.bananas) {
        bananaCd = (14 + Math.random() * 12) / cfgRef.current.spawnMul;
        bananasRef.current.push({ x: 0.25 + Math.random() * 0.55, y: 0.55 + Math.random() * 0.35, wob: Math.random() * Math.PI * 2 });
      }
      for (let bi = bananasRef.current.length - 1; bi >= 0; bi--) {
        const bn = bananasRef.current[bi];
        if (Math.hypot(p.x - bn.x, p.y - bn.y) < 0.028) {
          bananasRef.current.splice(bi, 1);
          p.slipT = Math.max(p.slipT, 1.0);
          sfxRef.current.slip();
          shakeRef.current = Math.max(shakeRef.current, 0.18);
          floatsRef.current.push({ x: bn.x, y: bn.y - 0.05, text: "🍌 SLIPPED!", color: "#FACC15", life: 1.3 });
          if (carryRef.current.length > 0) {
            carryRef.current.pop();
            statsRef.current.dropped++;
            floatsRef.current.push({ x: bn.x, y: bn.y - 0.09, text: "DROPPED IT!", color: "#EF4444", life: 1.2 });
          }
        }
      }

      fireCd -= dt;
      if (fireCd <= 0 && !inTutorial && cfgRef.current.fires) {
        // random chance of fire at grill or fryer; small chance of GRILL EXPLOSION
        const explode = Math.random() < 0.28;
        const target = explode ? "grill" : (Math.random() < 0.5 ? "grill" : "fryer");
        const st = STATIONS.find((s) => s.id === target)!;
        if (!firesRef.current.some((fi) => fi.stationId === target)) {
          const dangerMax = explode ? 3.5 : (target === "grill" ? 5.5 : 7);
          firesRef.current.push({ x: st.x + st.w/2, y: st.y + st.h/2, stationId: target, life: 12, danger: dangerMax, dangerMax, sprayT: 0 });
          statsRef.current.fires++;
          chaosRef.current = Math.min(6, chaosRef.current + (explode ? 1.5 : 1));
          if (explode) {
            // knockback player away from station center, screen shake, flash
            const px = playerRef.current.x, py = playerRef.current.y;
            const dxk = px - (st.x + st.w/2);
            const dyk = py - (st.y + st.h/2);
            const dk = Math.hypot(dxk, dyk) || 1;
            const dist = Math.min(0.22, 0.25 / (dk + 0.4));
            playerRef.current.x = clamp(px + (dxk/dk) * dist, 0.02, 0.98);
            playerRef.current.y = clamp(py + (dyk/dk) * dist, 0.10, 0.96);
            playerRef.current.slipT = 0.6;
            shakeRef.current = 0.55;
            explosionRef.current = 1;
            cinematicBoom(st.x + st.w / 2, st.y + st.h / 2);
            sfxRef.current.boom(1.1);
            floatsRef.current.push({ x: st.x + st.w/2, y: st.y - 0.02, text: "💥 BOOM!", color: "#FACC15", life: 1.2 });
            floatsRef.current.push({ x: playerRef.current.x, y: playerRef.current.y - 0.04, text: "OSHA WHO?", color: "#EF4444", life: 1.2 });
          }
        }
        fireCd = ((explode ? 26 : 20) + Math.random() * 14) / cfgRef.current.spawnMul;
        // Explosions also splatter grease
        if (explode) {
          for (let i = 0; i < 3; i++) {
            const ang = Math.random() * Math.PI * 2;
            const rad = 0.05 + Math.random() * 0.09;
            spillsRef.current.push({
              x: clamp(st.x + st.w/2 + Math.cos(ang) * rad, 0.05, 0.95),
              y: clamp(st.y + st.h/2 + Math.sin(ang) * rad, 0.12, 0.94),
              r: 0.035 + Math.random() * 0.02,
              life: 18 + Math.random() * 8,
              cleanT: 0,
              hue: Math.random() < 0.5 ? 42 : 30,
              wob: Math.random() * Math.PI * 2,
            });
          }
        }
      }
      // Grease spills: random splatters near cook stations.
      // Chaos scales with the player's current mop combo — higher skill, messier kitchen.
      spillCd -= dt;
      const comboN = cleanComboRef.current.count;
      const chaosMul = 1 + Math.min(comboN, 8) * 0.35; // up to ~3.8x at combo 8
      const spillCap = Math.min(14, 6 + Math.floor(comboN * 0.9));
      if (spillCd <= 0 && spillsRef.current.length < spillCap && !inTutorial && cfgRef.current.grease) {
        const spawnCount = 1 + (comboN >= 3 ? 1 : 0) + (comboN >= 6 ? 1 : 0);
        for (let i = 0; i < spawnCount; i++) {
          // Roll the target ONCE — rolling inside the callback made find() miss
          // entirely ~17% of the time, crashing the game loop mid-shift.
          const spillTarget = Math.random() < 0.5 ? "grill" : "fryer";
          const near = Math.random() < 0.7
            ? STATIONS.find((s) => s.id === spillTarget)!
            : STATIONS[Math.floor(Math.random() * STATIONS.length)];
          const ang = Math.random() * Math.PI * 2;
          const rad = 0.05 + Math.random() * 0.1;
          const sizeMul = 1 + Math.min(comboN, 8) * 0.08;
          spillsRef.current.push({
            x: clamp(near.x + near.w/2 + Math.cos(ang) * rad, 0.05, 0.95),
            y: clamp(near.y + near.h/2 + Math.sin(ang) * rad, 0.14, 0.94),
            r: (0.03 + Math.random() * 0.025) * sizeMul,
            life: 22 + Math.random() * 10,
            cleanT: 0,
            hue: Math.random() < 0.5 ? 42 : 30,
            wob: Math.random() * Math.PI * 2,
          });
        }
        // Cooldown shortens as combo climbs — kitchen keeps up with your pace.
        spillCd = (7 + Math.random() * 8) / chaosMul;
      }
      // spill decay: shrink slowly + expire (slower cleanT decay so player retains progress)
      spillsRef.current.forEach((sp) => { sp.life -= dt; sp.cleanT = Math.max(0, sp.cleanT - dt * 0.1); });
      // Combo timeout — expire chain if idle
      {
        const combo = cleanComboRef.current;
        if (combo.count > 0 && performance.now() > combo.expires) {
          combo.count = 0;
          setCleanCombo(0);
        }
      }

      spillsRef.current = spillsRef.current.filter((sp) => sp.life > 0);

      // ─── KITCHEN DISASTERS ───
      disasterCd -= dt;
      if (disasterCd <= 0 && !inTutorial && cfgRef.current.disasters) {
        const roll = Math.random();
        if (roll < 0.4) {
          // SMOKE ALARM
          alarmRef.current.life = 4.5 + Math.random() * 2;
          chaosRef.current = Math.min(6, chaosRef.current + 0.8);
          shakeRef.current = Math.max(shakeRef.current, 0.25);
          floatsRef.current.push({ x: 0.5, y: 0.18, text: "🚨 SMOKE ALARM!", color: "#EF4444", life: 1.4 });
          setDisasterTick((t) => t + 1);
        } else if (roll < 0.72) {
          // FRYER FLARE-UP
          const fs = STATIONS.find((s) => s.id === "fryer")!;
          flareRef.current = { x: fs.x + fs.w / 2, y: fs.y + fs.h / 2, r: 0, life: 3.2, max: 3.2 };
          chaosRef.current = Math.min(6, chaosRef.current + 1.2);
          shakeRef.current = Math.max(shakeRef.current, 0.4);
          explosionRef.current = Math.max(explosionRef.current, 0.8);
          sfxRef.current.boom(0.85);
          statsRef.current.fires++;
          floatsRef.current.push({ x: fs.x + fs.w / 2, y: fs.y - 0.03, text: "🔥 FLARE-UP!", color: "#F97316", life: 1.4 });
          // splash grease around fryer
          for (let i = 0; i < 4; i++) {
            const ang = Math.random() * Math.PI * 2;
            const rad = 0.06 + Math.random() * 0.08;
            spillsRef.current.push({
              x: clamp(fs.x + fs.w / 2 + Math.cos(ang) * rad, 0.05, 0.95),
              y: clamp(fs.y + fs.h / 2 + Math.sin(ang) * rad, 0.14, 0.94),
              r: 0.032 + Math.random() * 0.02,
              life: 16 + Math.random() * 6,
              cleanT: 0,
              hue: 32,
              wob: Math.random() * Math.PI * 2,
            });
          }
        } else {
          // FALLING SIGNAGE
          const signs = [
            { text: "☠ HEALTH INSPECTOR", color: "#EF4444" },
            { text: "★ EMPLOYEE OF THE MONTH", color: "#FACC15" },
            { text: "$BRGR TO THE MOON", color: "#7C3AED" },
            { text: "NOW HIRING (DESPERATELY)", color: "#22D3EE" },
            { text: "⚠ CEILING TILES", color: "#F97316" },
          ];
          const pick = signs[Math.floor(Math.random() * signs.length)];
          const sx = 0.18 + Math.random() * 0.6;
          const sy = 0.32 + Math.random() * 0.5;
          signsRef.current.push({
            x: sx, y: sy, phase: "warn", t: 0, landT: 0,
            text: pick.text, color: pick.color,
            spin: (Math.random() - 0.5) * 0.6,
            spinSpd: (Math.random() - 0.5) * 6,
          });
          floatsRef.current.push({ x: sx, y: sy - 0.08, text: "⚠ LOOK OUT!", color: "#FACC15", life: 1 });
        }
        disasterCd = (14 + Math.random() * 12) / cfgRef.current.spawnMul;
      }

      // Smoke alarm tick
      if (alarmRef.current.life > 0) {
        alarmRef.current.life -= dt;
        alarmRef.current.strobe += dt * 8;
        // slow chaos bleed while it blares
        chaosRef.current = Math.min(6, chaosRef.current + dt * 0.15);
        if (alarmRef.current.life <= 0) {
          alarmRef.current.life = 0;
          setDisasterTick((t) => t + 1);
        }
      }

      // Fryer flare-up tick — expanding heat ring, pushes/slips player
      if (flareRef.current.life > 0) {
        const fl = flareRef.current;
        fl.life -= dt;
        const t = 1 - fl.life / fl.max;
        // ring expands then holds
        fl.r = 0.02 + Math.min(1, t * 2.2) * 0.12;
        const pl = playerRef.current;
        const dx = pl.x - fl.x, dy = pl.y - fl.y;
        const d = Math.hypot(dx, dy);
        if (d < fl.r + 0.02 && d > 0.0001) {
          pl.slipT = Math.max(pl.slipT, 0.5);
          const push = 0.6 * dt;
          pl.x = clamp(pl.x + (dx / d) * push, 0.02, 0.98);
          pl.y = clamp(pl.y + (dy / d) * push, 0.10, 0.96);
        }
      }

      // Falling signage tick
      for (const sg of signsRef.current) {
        sg.t += dt;
        if (sg.phase === "warn") {
          if (sg.t >= 1.1) { sg.phase = "falling"; sg.t = 0; }
        } else if (sg.phase === "falling") {
          sg.spin += sg.spinSpd * dt;
          if (sg.t >= 0.55) {
            sg.phase = "landed";
            sg.landT = 4 + Math.random() * 2;
            shakeRef.current = Math.max(shakeRef.current, 0.35);
            floatsRef.current.push({ x: sg.x, y: sg.y - 0.02, text: "CRASH!", color: sg.color, life: 1 });
            // knock player if too close on impact
            const pl = playerRef.current;
            const dx = pl.x - sg.x, dy = pl.y - sg.y;
            const d = Math.hypot(dx, dy);
            if (d < 0.09 && d > 0.0001) {
              const push = 0.14;
              pl.x = clamp(pl.x + (dx / d) * push, 0.02, 0.98);
              pl.y = clamp(pl.y + (dy / d) * push, 0.10, 0.96);
              pl.slipT = Math.max(pl.slipT, 0.7);
              // drop one carried item
              if (carryRef.current.length > 0) {
                const dropped = carryRef.current.pop()!;
                pushFloat(`− ${dropped.replace(/_/g, " ").toUpperCase()}`, "#EF4444");
                chaosRef.current = Math.min(6, chaosRef.current + 0.3);
              }
            }
          }
        } else if (sg.phase === "landed") {
          sg.landT -= dt;
          // landed sign blocks the player: push them out gently
          const pl = playerRef.current;
          const dx = pl.x - sg.x, dy = pl.y - sg.y;
          const d = Math.hypot(dx, dy);
          const R = 0.055;
          if (d < R && d > 0.0001) {
            const push = (R - d) * 4 * dt + 0.008;
            pl.x = clamp(pl.x + (dx / d) * push, 0.02, 0.98);
            pl.y = clamp(pl.y + (dy / d) * push, 0.10, 0.96);
          }
        }
      }
      signsRef.current = signsRef.current.filter((sg) => !(sg.phase === "landed" && sg.landT <= 0));

      // shake / flash decay
      shakeRef.current = Math.max(0, shakeRef.current - dt);
      explosionRef.current = Math.max(0, explosionRef.current - dt * 1.6);
      // vice cooldowns
      viceRef.current.smokeCd = Math.max(0, viceRef.current.smokeCd - dt);
      viceRef.current.drinkCd = Math.max(0, viceRef.current.drinkCd - dt);
      viceRef.current.buzz = Math.max(0, viceRef.current.buzz - dt);
      // fade minimap when player is near it (bottom-left)
      if (minimapRef.current) {
        const px = playerRef.current.x, py = playerRef.current.y;
        // minimap approx region 0..0.15 x, 0.75..1 y
        const nx = Math.max(0, Math.min(1, (0.18 - px) / 0.10));
        const ny = Math.max(0, Math.min(1, (py - 0.72) / 0.10));
        const near = Math.min(nx, ny);
        const op = 1 - near * 0.85;
        minimapRef.current.style.opacity = op.toFixed(3);
        minimapRef.current.style.pointerEvents = near > 0.5 ? "none" : "auto";
      }
      // fire life + danger + spray mechanic
      {
        const k = keysRef.current;
        const spraying = hasExtinguisherRef.current && (k[" "] || k["e"] || k["f"]);
        firesRef.current.forEach((fi) => {
          fi.life -= dt;
          const d = Math.hypot(playerRef.current.x - fi.x, playerRef.current.y - fi.y);
          const inRange = d < 0.14;
          if (spraying && inRange) {
            fi.sprayT = Math.min(1, fi.sprayT + dt * 3);
            fi.life -= dt * 6;
            fi.danger = Math.min(fi.dangerMax, fi.danger + dt * 2); // resets timer
            // spray particles
            if (Math.random() < 0.85 * perfRef.current.scale) {
              const ang = Math.atan2(fi.y - playerRef.current.y, fi.x - playerRef.current.x) + (Math.random() - 0.5) * 0.5;
              particlesRef.current.push({
                type: "dust",
                x: playerRef.current.x + Math.cos(ang) * 0.02,
                y: playerRef.current.y + Math.sin(ang) * 0.02 - 0.01,
                vx: Math.cos(ang) * 0.25 + (Math.random() - 0.5) * 0.05,
                vy: Math.sin(ang) * 0.25 + (Math.random() - 0.5) * 0.05,
                life: 0.45, max: 0.45, size: 3 + Math.random() * 3, hue: 190,
              } as any);
            }
          } else {
            fi.sprayT = Math.max(0, fi.sprayT - dt * 2);
            fi.danger -= dt;
          }
        });
        // extinguished fires
        firesRef.current = firesRef.current.filter((fi) => {
          if (fi.life <= 0) {
            // put out cleanly (either by spray or expiring)
            if (spraying) {
              scoreRef.current += 80;
              chaosRef.current = Math.max(0, chaosRef.current - 1);
              hasExtinguisherRef.current = false;
              sfxRef.current.hiss();
              foamBurst(fi.x, fi.y);
              floatsRef.current.push({ x: fi.x, y: fi.y - 0.03, text: "PUT OUT! +80", color: "#22D3EE", life: 1.2 });
            } else {
              chaosRef.current = Math.min(6, chaosRef.current + 1);
            }
            return false;
          }
          // danger timer explosion
          if (fi.danger <= 0) {
            const px = playerRef.current.x, py = playerRef.current.y;
            const dxk = px - fi.x, dyk = py - fi.y;
            const dk = Math.hypot(dxk, dyk) || 1;
            if (dk < 0.28) {
              const dist = Math.min(0.22, 0.24 / (dk + 0.4));
              playerRef.current.x = clamp(px + (dxk/dk) * dist, 0.02, 0.98);
              playerRef.current.y = clamp(py + (dyk/dk) * dist, 0.10, 0.96);
              playerRef.current.slipT = 0.6;
            }
            shakeRef.current = Math.max(shakeRef.current, 0.5);
            explosionRef.current = 1;
            cinematicBoom(fi.x, fi.y);
            sfxRef.current.boom(1.25);
            chaosRef.current = Math.min(6, chaosRef.current + 1.5);
            floatsRef.current.push({ x: fi.x, y: fi.y - 0.04, text: "💥 KABOOM!", color: "#EF4444", life: 1.3 });
            return false;
          }
          return true;
        });
      }

      // Pigeons
      pigeonCd -= dt;
      if (pigeonCd <= 0 && !inTutorial && cfgRef.current.pigeons) {
        pigeonsRef.current.push({ x: -0.05, y: 0.5 + (Math.random() - 0.5) * 0.4, vx: 0.08 + Math.random()*0.05, vy: (Math.random() - 0.5) * 0.05, hp: 1 });
        pigeonCd = (12 + Math.random() * 10) / cfgRef.current.spawnMul;
        sfxRef.current.coo();
      }
      pigeonsRef.current.forEach((pg) => {
        pg.x += pg.vx * dt;
        pg.y += pg.vy * dt;
        // if player near, scare
        const d = Math.hypot(p.x - pg.x, p.y - pg.y);
        if (d < 0.05) {
          pg.hp = 0;
          statsRef.current.pigeonsChased++;
          scoreRef.current += 30;
          sfxRef.current.coo(true);
          floatsRef.current.push({ x: pg.x, y: pg.y - 0.02, text: "SHOO!", color: "#22D3EE", life: 1 });
        }
      });
      pigeonsRef.current = pigeonsRef.current.filter((pg) => pg.hp > 0 && pg.x < 1.1);

      // Orders countdown (frozen during training — no pressure while learning)
      if (!trainingRef.current) orderTickAcc += dt;
      if (orderTickAcc > 1) {
        orderTickAcc = 0;
        ordersRef.current.forEach((o) => {
          o.remaining -= 1;
          if (o.remaining === 14) sfxRef.current.orderBell(); // DING DING — customer losing it
        });
        const failed = ordersRef.current.filter((o) => o.remaining <= 0);
        if (failed.length) {
          statsRef.current.ordersFailed += failed.length;
          streakRef.current = 0;
          chaosRef.current = Math.min(6, chaosRef.current + failed.length);
          ordersRef.current = ordersRef.current.filter((o) => o.remaining > 0);
          failed.forEach(() => spawnOrder());
        }
      }

      // Floats
      floatsRef.current.forEach((fl) => { fl.life -= dt; fl.y -= dt * 0.05; });
      floatsRef.current = floatsRef.current.filter((fl) => fl.life > 0);

      // Chaos slowly cools off (Gary cools it faster) so a bad stretch is recoverable
      chaosRef.current = Math.max(0, chaosRef.current - dt * 0.085 * employee.calm);
      if (viceAnimRef.current.t > 0) viceAnimRef.current.t -= dt;

      // HEALTH INSPECTOR: chaos pegged at max starts a 5s shutdown countdown
      // (never during training — mistakes are free in class)
      if (trainingRef.current) chaosRef.current = Math.min(chaosRef.current, 3);
      if (!trainingRef.current && chaosRef.current >= 5.75) {
        if (inspectorRef.current < 0) inspectorRef.current = 8;
        inspectorRef.current -= dt;
        if (inspectorRef.current <= 0) {
          cancelAnimationFrame(raf);
          finishGame("shutdown");
          return;
        }
      } else if (inspectorRef.current >= 0 && chaosRef.current < 5.2) {
        inspectorRef.current = -1; // crisis averted
      }

      // DAY COMPLETE: made this day's rent → advance to the next, harder day
      const earnedThisDay = scoreRef.current - roundStartScoreRef.current;
      if (!trainingRef.current && earnedThisDay >= cfgRef.current.quota) {
        advanceRound();
      }

      // Timer — run out before making the day's rent = game over (evicted).
      // The clock does not tick during the training shift.
      if (!trainingRef.current) {
        timeRef.current -= dt;
        if (timeRef.current <= 0) {
          cancelAnimationFrame(raf);
          finishGame("evicted");
          return;
        }
      }

      // React state sync every ~0.25s
      uiTickAcc += dt;
      if (uiTickAcc > 0.2) {
        uiTickAcc = 0;
        setTimeLeft(Math.max(0, Math.ceil(timeRef.current)));
        setScore(scoreRef.current);
        setChaos(chaosRef.current);
        setInspectorT(inspectorRef.current);
        setDayEarned(Math.max(0, scoreRef.current - roundStartScoreRef.current));
        setTick((t) => t + 1);
        setPerfFps(Math.round(perfRef.current.fps));
      }

      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finishGame(outcome: Outcome) {
    if (outcome === "evicted") sfxRef.current.sadTrombone();
    else if (outcome === "shutdown") sfxRef.current.alarmSting();
    const s = statsRef.current;
    const total = scoreRef.current;
    const daysSurvived = roundRef.current - 1; // fully completed days
    const newBest = Math.max(best, total);
    if (typeof window !== "undefined") window.localStorage.setItem("bb_kc_best", String(newBest));
    const secLeft = Math.max(0, Math.ceil(timeRef.current));
    const grade = gradeForDays(daysSurvived, total);
    const bucks = Math.floor(total / 10) + s.ordersCompleted * 5 + daysSurvived * 60;
    // Award bird bucks in main site's ledger
    if (typeof window !== "undefined") {
      const prev = parseInt(window.localStorage.getItem("bb_bucks") || "0", 10);
      window.localStorage.setItem("bb_bucks", String(prev + bucks));
    }
    onEnd({
      score: total,
      best: newBest,
      ordersCompleted: s.ordersCompleted,
      ordersFailed: s.ordersFailed,
      foodBurned: s.foodBurned,
      fires: s.fires,
      pigeonsChased: s.pigeonsChased,
      dropped: s.dropped,
      birdBucks: bucks,
      grade: grade.letter,
      gradeSub: grade.sub,
      outcome,
      timeLeft: secLeft,
      daysSurvived,
    });
  }

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    // Screen shake + drunk-cam wobble (scaled by motion sensitivity)
    const M = motionRef.current.scale;
    const shakeAmt = shakeRef.current * M;
    const buzz = viceRef.current.buzz;
    const t = performance.now() / 1000;
    const sx = (shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt * 24 : 0) + (buzz > 0 ? Math.sin(t * 1.7) * 6 * Math.min(1, buzz) * M : 0);
    const sy = (shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt * 24 : 0) + (buzz > 0 ? Math.cos(t * 1.3) * 4 * Math.min(1, buzz) * M : 0);
    ctx.save();
    ctx.translate(sx, sy);

    // Background
    const bg = bgImgRef.current;
    if (bg) {
      ctx.drawImage(bg, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#150724";
      ctx.fillRect(0, 0, W, H);
    }
    // vignette
    const grd = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*0.7);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Station highlight ring — ONLY on the station you're close enough to use (no dashed-circle clutter)
    const near = nearestStation();
    if (near) {
      const s = near;
      const cx = (s.x + s.w/2) * W;
      const cy = (s.y + s.h/2) * H;
      const r = Math.max(s.w, s.h) * W * 0.55;
      ctx.save();
      ctx.strokeStyle = "#FACC15";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#FACC15";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Grill progress
    const gs = STATIONS.find((s) => s.id === "grill")!;
    const g = grillRef.current;
    if (g.item) drawProgress(ctx, (gs.x + gs.w/2)*W, (gs.y - 0.02)*H, Math.min(1, g.progress), g.item === "patty_cooked" && g.progress > 1 ? "#EF4444" : "#F97316");
    const fs = STATIONS.find((s) => s.id === "fryer")!;
    const fr = fryerRef.current;
    if (fr.item) drawProgress(ctx, (fs.x + fs.w/2)*W, (fs.y - 0.02)*H, Math.min(1, fr.progress), fr.progress > 1 ? "#EF4444" : "#FACC15");

    // Grease spills (draw beneath fires/pigeons but above floor)
    for (const sp of spillsRef.current) {
      const cx = sp.x * W, cy = sp.y * H;
      // shrink visibly as it's mopped (radius drops with cleanT)
      const shrink = 1 - sp.cleanT * 0.55;
      const rx = sp.r * W * 1.15 * shrink;
      const ry = sp.r * H * 0.75 * shrink;
      // stronger, nonlinear fade so it clearly disappears near completion
      const fade = Math.min(1, sp.life / 4) * Math.pow(1 - sp.cleanT, 1.6);
      ctx.save();
      const greaseSprite = hazardImgRef.current.grease;
      if (greaseSprite) {
        // hand-drawn glossy splat, squashed to floor perspective, wobble-rotated
        ctx.globalAlpha = 0.92 * fade;
        ctx.translate(cx, cy);
        ctx.rotate(Math.sin(sp.wob) * 0.5);
        ctx.drawImage(greaseSprite, -rx * 1.25, -ry * 1.45, rx * 2.5, ry * 2.9);
        ctx.rotate(-Math.sin(sp.wob) * 0.5);
        ctx.translate(-cx, -cy);
      } else {
        // sprite still loading — procedural puddle as a fallback
        ctx.globalAlpha = 0.72 * fade;
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(rx, ry));
        grad.addColorStop(0, `hsl(${sp.hue}, 55%, 18%)`);
        grad.addColorStop(0.7, `hsl(${sp.hue}, 45%, 10%)`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.55 * fade;
        ctx.fillStyle = `hsl(${sp.hue}, 95%, 68%)`;
        const gx = cx - rx * 0.35 + Math.sin(performance.now() / 700 + sp.wob) * 2;
        const gy = cy - ry * 0.35;
        ctx.beginPath();
        ctx.ellipse(gx, gy, rx * 0.32, ry * 0.18, -0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // cleaning progress ring — thicker + pulsing as it approaches full
      if (sp.cleanT > 0.01) {
        const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 90);
        ctx.globalAlpha = 0.85 + 0.15 * sp.cleanT;
        ctx.strokeStyle = sp.cleanT > 0.75 ? "#FACC15" : "#22D3EE";
        ctx.lineWidth = 3 + sp.cleanT * 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(rx, ry) + 4 + sp.cleanT * 3, -Math.PI / 2, -Math.PI / 2 + sp.cleanT * Math.PI * 2);
        ctx.stroke();
        // soft glow behind ring as it fills
        if (sp.cleanT > 0.5) {
          ctx.globalAlpha = 0.25 * (sp.cleanT - 0.5) * 2 * pulse;
          ctx.fillStyle = sp.cleanT > 0.75 ? "#FACC15" : "#22D3EE";
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx * 1.25, ry * 1.25, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // warning label
      ctx.globalAlpha = 0.85 * fade;
      ctx.fillStyle = "#FACC15";
      ctx.font = "bold 9px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("⚠ GREASE", cx, cy + ry + 12);
      ctx.restore();
    }

    // Fires
    for (const fi of firesRef.current) {
      const cx = fi.x * W, cy = fi.y * H;
      // danger ring — pulses faster + turns redder as timer drops
      const dpct = Math.max(0, Math.min(1, fi.danger / fi.dangerMax));
      const pulseRate = 3 + (1 - dpct) * 12;
      const ringPulse = 0.5 + 0.5 * Math.sin(performance.now() / 1000 * pulseRate);
      ctx.save();
      ctx.lineWidth = 3 + (1 - dpct) * 3;
      ctx.strokeStyle = `rgba(239,68,68,${0.35 + 0.5 * ringPulse * (1 - dpct)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 26 + (1 - dpct) * 6, 0, Math.PI * 2);
      ctx.stroke();
      // danger arc (remaining time)
      ctx.lineWidth = 3;
      ctx.strokeStyle = dpct > 0.5 ? "#FACC15" : dpct > 0.25 ? "#F97316" : "#EF4444";
      ctx.beginPath();
      ctx.arc(cx, cy, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * dpct);
      ctx.stroke();
      ctx.restore();
      // flames — layered flickering tongues with glow, hot core and rising embers
      {
        const now = performance.now() / 1000;
        const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 58);
        glow.addColorStop(0, "rgba(255,160,40,0.45)");
        glow.addColorStop(0.5, "rgba(255,90,20,0.18)");
        glow.addColorStop(1, "rgba(255,60,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(cx - 58, cy - 58, 116, 116);
        const fireSprite = hazardImgRef.current.fire;
        if (fireSprite) {
          // hand-drawn flame, kept alive with flicker (stretch), sway and a
          // second faint back-flame half a beat behind
          const stretch = 1 + Math.sin(now * 11) * 0.06 + Math.sin(now * 23.7) * 0.035;
          const sway = Math.sin(now * 6.3) * 0.055;
          const fw = 46;
          const fh = fw * (fireSprite.height / fireSprite.width);
          ctx.save();
          ctx.translate(cx, cy + 8);
          ctx.rotate(-sway * 0.7);
          ctx.globalAlpha = 0.5;
          ctx.scale(1.18, 1.18 * (2 - stretch));
          ctx.drawImage(fireSprite, -fw / 2, -fh, fw, fh);
          ctx.restore();
          ctx.save();
          ctx.translate(cx, cy + 8);
          ctx.rotate(sway);
          ctx.scale(1, stretch);
          ctx.drawImage(fireSprite, -fw / 2, -fh, fw, fh);
          ctx.restore();
        } else {
          // sprite still loading — procedural tongues as a fallback
          const layers = [
            { c: "#DC2626", s: 1.0 },
            { c: "#F97316", s: 0.72 },
            { c: "#FACC15", s: 0.45 },
          ];
          for (let ti2 = 0; ti2 < 3; ti2++) {
            const ox = (ti2 - 1) * 11;
            const phase = now * (5 + ti2 * 1.7) + ti2 * 2.1;
            const hgt = 32 + Math.sin(phase) * 6 + Math.sin(phase * 2.3) * 3;
            const wob = Math.sin(phase * 1.4) * 5;
            for (const L of layers) {
              const hh = hgt * L.s;
              const ww = 10 * L.s + (ti2 === 1 ? 3 : 0);
              ctx.save();
              ctx.fillStyle = L.c;
              ctx.beginPath();
              ctx.moveTo(cx + ox - ww, cy + 6);
              ctx.quadraticCurveTo(cx + ox - ww, cy - hh * 0.45, cx + ox + wob * L.s, cy - hh);
              ctx.quadraticCurveTo(cx + ox + ww, cy - hh * 0.45, cx + ox + ww, cy + 6);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
          }
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = "#FEF3C7";
          ctx.beginPath();
          ctx.ellipse(cx, cy + 1, 7 + Math.sin(now * 9) * 1.5, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        for (let ei = 0; ei < 4; ei++) {
          const ek = (now * 0.8 + ei * 0.27) % 1;
          ctx.save();
          ctx.globalAlpha = (1 - ek) * 0.8;
          ctx.fillStyle = ei % 2 ? "#FACC15" : "#FB923C";
          ctx.beginPath();
          ctx.arc(cx + Math.sin((now + ei * 2) * 4) * 12, cy - 8 - ek * 44, 1.6 + (1 - ek) * 1.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${fi.danger.toFixed(1)}s`, cx, cy + 34);
      // spray cone from player
      if (fi.sprayT > 0.05) {
        const px = playerRef.current.x * W, py = playerRef.current.y * H;
        const ang = Math.atan2(cy - py, cx - px);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(ang);
        const len = Math.hypot(cx - px, cy - py);
        const grad = ctx.createLinearGradient(0, 0, len, 0);
        grad.addColorStop(0, `rgba(226,232,240,${0.75 * fi.sprayT})`);
        grad.addColorStop(1, "rgba(226,232,240,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(len, -len * 0.18);
        ctx.lineTo(len, len * 0.18);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // Fryer flare-up ring (expanding radial burst)
    if (flareRef.current.life > 0) {
      const fl = flareRef.current;
      const cx = fl.x * W, cy = fl.y * H;
      const rr = fl.r * Math.min(W, H) * 1.8;
      const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 90);
      ctx.save();
      const g = ctx.createRadialGradient(cx, cy, rr * 0.15, cx, cy, rr);
      g.addColorStop(0, `rgba(255,240,140,${0.75 * pulse})`);
      g.addColorStop(0.35, `rgba(249,115,22,${0.55 * pulse})`);
      g.addColorStop(0.8, `rgba(239,68,68,${0.25 * pulse})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.fill();
      // hot licks
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 8; i++) {
        const a = (performance.now() / 200 + i) % (Math.PI * 2);
        const rx = cx + Math.cos(a) * rr * 0.55;
        const ry = cy + Math.sin(a) * rr * 0.55;
        ctx.fillStyle = i % 2 ? "#FACC15" : "#F97316";
        ctx.beginPath();
        ctx.arc(rx, ry, 6 + (i % 3) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = "#FACC15";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("🔥 FRYER FLARE-UP", cx, cy - rr - 6);
    }

    // Falling signage
    for (const sg of signsRef.current) {
      const cx = sg.x * W, cy = sg.y * H;
      if (sg.phase === "warn") {
        // pulsing ground-shadow target
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 90);
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.35 * pulse;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 46, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FACC15";
        ctx.lineWidth = 2 + pulse * 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      } else if (sg.phase === "falling") {
        const t = sg.t / 0.55;
        // ground shadow still
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 46 * (0.6 + t * 0.4), 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // sign falling from top
        const yOff = -260 * (1 - t) * (1 - t);
        ctx.save();
        ctx.translate(cx, cy + yOff);
        ctx.rotate(sg.spin);
        const tw = 12 + sg.text.length * 7;
        ctx.fillStyle = "#09090B";
        ctx.strokeStyle = sg.color;
        ctx.lineWidth = 3;
        ctx.fillRect(-tw / 2, -14, tw, 28);
        ctx.strokeRect(-tw / 2, -14, tw, 28);
        ctx.fillStyle = sg.color;
        ctx.font = "bold 12px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sg.text, 0, 0);
        ctx.textBaseline = "alphabetic";
        ctx.restore();
      } else {
        // landed — sits and blocks the tile
        const alpha = Math.min(1, sg.landT / 1.2);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.rotate(sg.spin + Math.sin(performance.now() / 400) * 0.03);
        const tw = 12 + sg.text.length * 7;
        // splat crack under sign
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.beginPath();
        ctx.ellipse(0, 12, tw * 0.7, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#09090B";
        ctx.strokeStyle = sg.color;
        ctx.lineWidth = 3;
        ctx.fillRect(-tw / 2, -14, tw, 28);
        ctx.strokeRect(-tw / 2, -14, tw, 28);
        // broken corner
        ctx.strokeStyle = "#FACC15";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-tw / 2 + 4, -10);
        ctx.lineTo(-tw / 2 + 10, -2);
        ctx.lineTo(-tw / 2 + 4, 4);
        ctx.stroke();
        ctx.fillStyle = sg.color;
        ctx.font = "bold 12px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sg.text, 0, 0);
        ctx.textBaseline = "alphabetic";
        ctx.restore();
      }
    }

    // Pigeons — hand-drawn sprite with a flap-bob and a bank into the turn
    for (const pg of pigeonsRef.current) {
      const cx = pg.x * W, cy = pg.y * H;
      const sprite = hazardImgRef.current.pigeon;
      if (sprite) {
        const t2 = performance.now() / 1000;
        const flap = Math.sin(t2 * 9 + pg.x * 40);
        const pw = Math.max(38, Math.min(64, W * 0.038));
        const ph = pw * (sprite.height / sprite.width);
        ctx.save();
        ctx.translate(cx, cy + flap * 3);
        ctx.rotate(pg.vy * 2 + flap * 0.07); // bank with vertical drift + wing beat
        if (pg.vx < 0) ctx.scale(-1, 1);      // sprite faces right by default
        ctx.scale(1, 1 + flap * 0.06);        // subtle wing-beat squash
        ctx.drawImage(sprite, -pw / 2, -ph / 2, pw, ph);
        ctx.restore();
      } else {
        // sprite still loading — old blob as a fallback
        ctx.fillStyle = "#6b6b6b";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 10, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#FACC15";
        ctx.beginPath();
        ctx.moveTo(cx+12, cy);
        ctx.lineTo(cx+22, cy-2);
        ctx.lineTo(cx+12, cy+3);
        ctx.fill();
      }
    }

    // Movement particles (pixel dust + impact flashes) — under the player
    {
      const dt = 1 / 60;
      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const pt = parts[i];
        pt.life += dt;
        if (pt.life >= pt.max) { parts.splice(i, 1); continue; }
        if (pt.kind === "dust") {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.vy += 0.35 * dt; // gravity in normalized space
          pt.vx *= 0.94;
        }
        const t = pt.life / pt.max;
        const alpha = 1 - t;
        if (pt.kind === "flash") {
          const r = pt.size * (0.6 + t * 1.6);
          ctx.save();
          ctx.globalAlpha = alpha * 0.85;
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(pt.x * W, pt.y * H, r, r * 0.4, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.ellipse(pt.x * W, pt.y * H, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          const s = pt.size * (1 - t * 0.4);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = pt.color;
          // pixel-style square puffs
          ctx.fillRect(Math.round(pt.x * W - s / 2), Math.round(pt.y * H - s / 2), s, s);
          ctx.restore();
        }
      }
    }

    // Player
    const p = playerRef.current;
    const px = p.x * W, py = p.y * H;
    const moving = Math.hypot(p.vx, p.vy) > 0.001;
    // Hop variations: per-hop amplitude, occasional big hop, gentle sway
    const hopIndex = Math.max(0, Math.floor(p.hopPhase / Math.PI));
    // deterministic pseudo-random amp per hop (0.85..1.35), every 7th is a bigger hop (1.55)
    const hopSeed = (hopIndex * 2654435761) >>> 0;
    const rand01 = ((hopSeed ^ (hopSeed >>> 16)) & 0xffff) / 0xffff;
    const isBig = hopIndex > 0 && hopIndex % 7 === 0;
    const hopAmp = isBig ? 1.55 : (0.85 + rand01 * 0.5);
    const sway = isBig ? Math.sin(p.hopPhase) * 4 * p.face : 0;
    const rawSin = Math.sin(p.hopPhase);
    // shaped arc: peakier at apex, gentler at ends (feels more organic)
    const hopSin = rawSin >= 0 ? Math.pow(rawSin, 0.72) : rawSin;
    const hopUp = moving ? Math.max(0, hopSin) : 0;
    const hopY = -hopUp * 22 * hopAmp;
    const airT = hopUp;
    // Landing squash (crisp compression right after touchdown)
    const landDur = 0.14;
    const landK = Math.max(0, Math.min(1, p.landT / landDur));
    const landSquashY = landK * 0.22;
    const landStretchX = landK * 0.18;
    // Anticipation squash right as a new hop starts (first ~15% of arc)
    const antiT = rawSin > 0 && rawSin < 0.25 ? (1 - rawSin / 0.25) * 0.10 : 0;
    // Idle breathing when standing still
    const breatheY = !moving ? Math.sin(p.idleT * 2.6) * 0.03 : 0;
    const breatheX = !moving ? -Math.sin(p.idleT * 2.6) * 0.02 : 0;
    // Wing flap: two soft beats per hop (takeoff + apex) — subtle horizontal spread
    const flapBeat = Math.max(0, Math.sin(p.hopPhase * 2));
    const wingFlap = moving ? flapBeat * flapBeat * 0.055 * hopAmp : 0;
    // Idle wing shuffle: micro breath-flap when standing
    const idleFlap = !moving ? Math.max(0, Math.sin(p.idleT * 3.8)) * 0.015 : 0;
    // Head bob: 2x hop-frequency vertical nod, counter-phase to squash (peaks mid-rise, dips on land)
    const headBobPx = moving ? -Math.cos(p.hopPhase * 2) * 1.6 * hopAmp : Math.sin(p.idleT * 2.6) * 0.6;
    // Head sway: gentle side-to-side wobble in the sprite's local X, faces travel direction
    const headSwayPx = moving ? Math.sin(p.hopPhase) * 0.9 * p.face : 0;
    const scaleY = 1 + airT * 0.14 * hopAmp * M - landSquashY * M - antiT * M + breatheY;
    const scaleX = 1 - airT * 0.07 * hopAmp * M + landStretchX * M + antiT * 0.6 * M + breatheX + wingFlap + idleFlap;
    // shadow (shrinks when airborne; expands briefly on landing)
    const shadowScale = (1 - airT * 0.55) * (1 + landK * 0.15);
    ctx.fillStyle = `rgba(0,0,0,${0.5 - airT * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(px, py + 28, 24 * shadowScale, 8 * shadowScale, 0, 0, Math.PI*2);
    ctx.fill();

    // Dash smear trail (short, crisp silhouettes — not motion blur). Disabled under reduced motion.
    if (motionRef.current.mode !== "reduced") {
      const now = performance.now() / 1000;
      const ddt = lastDrawTimeRef.current ? Math.min(0.05, now - lastDrawTimeRef.current) : 1 / 60;
      lastDrawTimeRef.current = now;
      const trail = trailRef.current;
      // Capture snapshot only during the fresh window after dash trigger
      if (p.dashCd > 0.95 && moving) {
        const last = trail[trail.length - 1];
        if (!last || Math.hypot(last.x - px, last.y - py) > 8) {
          trail.push({ x: px, y: py, face: p.face, hopY, t: 0 });
        }
      }
      // Age + prune
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].t += ddt;
        if (trail[i].t > 0.28) trail.splice(i, 1);
      }
      // Cap length
      while (trail.length > 5) trail.shift();
      // Render behind player
      const mm = mascotImgRef.current;
      if (mm && trail.length) {
        const size = Math.max(66, Math.min(122, W * 0.075));
        const trailH = size * spriteAspectRef.current;
        for (let i = 0; i < trail.length; i++) {
          const s = trail[i];
          const k = 1 - s.t / 0.28; // 1..0
          const alpha = 0.32 * k * k;
          if (alpha < 0.02) continue;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(s.x, s.y + 16);
          // slight squeeze along travel axis so it reads as speed lines, not blur
          ctx.scale(s.face * (0.82 + k * 0.10), 0.94 + k * 0.06);
          ctx.translate(-s.x, -(s.y + 16));
          ctx.drawImage(mm, s.x - size / 2, s.y + 16 - trailH + s.hopY, size, trailH);
          ctx.restore();
        }
      }
    }

    const pxs = px + sway;
    const m = mascotImgRef.current;
    if (m) {
      // Scale the bird with the canvas so he reads the same on a phone and a monitor
      const size = Math.max(66, Math.min(122, W * 0.075));
      const drawH = size * spriteAspectRef.current;
      // Feet sit ON the floor line (py + 16); headBob nods, headSway leans along facing
      const drawY = py + 16 - drawH + hopY + headBobPx;
      const drawX = pxs - size / 2 + headSwayPx;
      ctx.save();
      ctx.translate(pxs, py + 16);
      ctx.scale(p.face * scaleX, scaleY);
      ctx.translate(-pxs, -(py + 16));
      // slight tilt into direction of travel + subtle roll on big hops
      if (moving) {
        // Dash reads as a hard forward lean; normal hops keep a gentle bob-tilt
        const isDashHop = p.dashCd > 0.6;
        const tiltGain = isDashHop ? 0.95 : 0.6;
        const tiltClamp = isDashHop ? 0.22 : 0.12;
        const baseTilt = Math.max(-tiltClamp, Math.min(tiltClamp, p.vx * tiltGain)) * p.face;
        // Dash hops: exaggerated forward roll; normal big-hop: subtle sway roll
        const bigRoll = isBig ? Math.sin(p.hopPhase) * (isDashHop ? 0.14 : 0.08) * p.face : 0;
        // Anticipation lean: sharper on dash flips, softer on normal
        const leanEase = 1 - (1 - p.lean) * (1 - p.lean);
        const anticGain = isDashHop ? 0.38 : 0.24;
        const antic = leanEase * p.leanDir * anticGain * (p.face >= 0 ? 1 : -1);
        const tilt = baseTilt + bigRoll + antic;
        ctx.translate(pxs, py + 16);
        ctx.rotate(tilt);
        ctx.translate(-pxs, -(py + 16));
      }
      ctx.drawImage(m, drawX, drawY, size, drawH);
      ctx.restore();

      // Vice acting: cig raised to the beak, or a flask pulled out
      const va = viceAnimRef.current;
      if (va.type && va.t > 0) {
        const raise = Math.min(1, (va.max - va.t) * 5); // hand comes up fast
        const bx = pxs + p.face * (14 + 6 * raise);
        const by = py - 30 + hopY - 10 * raise;
        ctx.save();
        ctx.translate(bx, by);
        ctx.scale(p.face, 1);
        if (va.type === "smoke") {
          // cigarette
          ctx.rotate(-0.25);
          ctx.fillStyle = "#F5F5F4";
          ctx.fillRect(0, -1.5, 13, 3);
          ctx.fillStyle = "#D97706";
          ctx.fillRect(10.5, -1.5, 2.5, 3);
          ctx.fillStyle = "#FCA5A5";
          ctx.fillRect(13, -1.5, 1.5, 3);
          ctx.restore();
          // smoke puffs drifting up
          const now = performance.now() / 1000;
          for (let i = 0; i < 3; i++) {
            const k = ((now * 0.7 + i * 0.33) % 1);
            ctx.save();
            ctx.globalAlpha = 0.35 * (1 - k) * raise;
            ctx.fillStyle = "#D4D4D8";
            ctx.beginPath();
            ctx.arc(bx + p.face * 16 + Math.sin((now + i) * 3) * 3, by - 6 - k * 26, 3 + k * 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else {
          // flask tipped to the mouth
          ctx.rotate(-0.7 * raise);
          ctx.fillStyle = "#9CA3AF";
          ctx.beginPath();
          ctx.roundRect(-2, -4, 11, 15, 3);
          ctx.fill();
          ctx.fillStyle = "#6B7280";
          ctx.fillRect(1, -7, 5, 4);
          ctx.strokeStyle = "#4B5563";
          ctx.lineWidth = 1;
          ctx.strokeRect(0, 0, 7, 7);
          ctx.restore();
          // amber glugs
          const now = performance.now() / 1000;
          for (let i = 0; i < 2; i++) {
            const k = ((now * 1.1 + i * 0.5) % 1);
            ctx.save();
            ctx.globalAlpha = 0.5 * (1 - k) * raise;
            ctx.fillStyle = "#F59E0B";
            ctx.beginPath();
            ctx.arc(bx + p.face * 6, by - 2 - k * 10, 1.5 + k * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }
    } else {
      ctx.fillStyle = employee.tint;
      ctx.beginPath();
      ctx.arc(pxs, py + hopY, 18, 0, Math.PI*2);
      ctx.fill();
    }
    // Name tag (follows hop)
    // Name tag rides just above the sprite, whatever size it renders at
    const spriteH = Math.max(66, Math.min(122, W * 0.075)) * spriteAspectRef.current;
    const tagY = py + 16 - spriteH - 26 + hopY;
    ctx.fillStyle = "#7C3AED";
    ctx.fillRect(pxs - 42, tagY, 84, 18);
    ctx.strokeStyle = "#FACC15";
    ctx.strokeRect(pxs - 42, tagY, 84, 18);
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(employee.name.toUpperCase(), pxs, tagY + 13);

    // Carried items — real icons floating in a clear row above the bird's head,
    // each on a dark gold-ringed plate so you always see exactly what he holds
    // (kept off the body so the sprite's own art never hides them).
    const carry = carryRef.current;
    if (carry.length) {
      const sz = 22;
      const gap = 3;
      const rowY = tagY - 15;
      carry.forEach((it, i) => {
        const cxi = pxs + (i - (carry.length - 1) / 2) * (sz + gap);
        const cyi = rowY;
        ctx.save();
        ctx.fillStyle = "rgba(9,9,11,0.82)";
        ctx.beginPath();
        ctx.arc(cxi, cyi, sz / 2 + 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(250,204,21,0.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        const img = ingImgRef.current[it];
        if (img) {
          ctx.drawImage(img, cxi - sz / 2, cyi - sz / 2, sz, sz);
        } else {
          ctx.fillStyle = ING_META[it].color;
          ctx.beginPath();
          ctx.arc(cxi, cyi, sz / 2 - 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
    if (hasExtinguisherRef.current) {
      // A proper fire extinguisher in his wing: red tank, valve, hose, yellow nozzle
      ctx.save();
      ctx.translate(px + 26 * p.face, py - 6 + hopY);
      ctx.scale(p.face, 1);
      ctx.fillStyle = "#DC2626";
      ctx.beginPath();
      ctx.roundRect(-5, -14, 10, 20, 3);
      ctx.fill();
      ctx.fillStyle = "#FCA5A5";
      ctx.fillRect(-3, -11, 2, 13);
      ctx.fillStyle = "#FFF";
      ctx.fillRect(-4, -6, 8, 5);
      ctx.fillStyle = "#111";
      ctx.fillRect(-2, -18, 4, 4);
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, -15);
      ctx.quadraticCurveTo(12, -22, 16, -14);
      ctx.stroke();
      ctx.fillStyle = "#FACC15";
      ctx.fillRect(14, -16, 6, 4);
      ctx.restore();
    }

    // The extinguisher + mop bucket sit visibly at their stations until picked up
    if (!hasExtinguisherRef.current) {
      const es = STATIONS.find((s) => s.id === "extinguisher")!;
      ctx.save();
      ctx.font = "28px system-ui";
      ctx.textAlign = "center";
      const bob2 = Math.sin(performance.now() / 500) * 2;
      ctx.fillText("🧯", (es.x + es.w / 2) * W, (es.y + es.h / 2) * H + 8 + bob2);
      ctx.restore();
    }

    // Bananas on the floor (the oldest joke in gaming, still undefeated)
    for (const bn of bananasRef.current) {
      ctx.save();
      ctx.translate(bn.x * W, bn.y * H);
      ctx.rotate(Math.sin(performance.now() / 900 + bn.wob) * 0.12);
      ctx.font = "22px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("🍌", 0, 6);
      ctx.restore();
    }

    // Explosion shockwave rings
    if (shockRef.current) {
      const age = (performance.now() - shockRef.current.start) / 1000;
      if (age > 0.9) shockRef.current = null;
      else {
        const cx = shockRef.current.x * W, cy = shockRef.current.y * H;
        ctx.save();
        for (const [spd, col, lw] of [[1300, "rgba(250,204,21,", 5], [950, "rgba(239,68,68,", 3]] as const) {
          const rr = age * spd;
          ctx.strokeStyle = `${col}${Math.max(0, 0.8 - age)})`;
          ctx.lineWidth = lw * (1 - age * 0.6);
          ctx.beginPath();
          ctx.ellipse(cx, cy, rr, rr * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Flying debris / foam puffs (stateless physics from spawn time)
    if (debrisRef.current.length) {
      const nowT = performance.now();
      debrisRef.current = debrisRef.current.filter((d) => nowT - d.start < 1400);
      for (const d of debrisRef.current) {
        const age = (nowT - d.start) / 1000;
        const dx2 = (d.x + d.vx * age) * W;
        const dy2 = (d.y + d.vy * age + 0.45 * age * age) * H;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - age / 1.4);
        ctx.translate(dx2, dy2);
        ctx.rotate(d.rot + d.vr * age);
        ctx.font = d.color ? "bold 18px system-ui" : "20px system-ui";
        if (d.color) ctx.fillStyle = d.color;
        ctx.textAlign = "center";
        ctx.fillText(d.glyph, 0, 0);
        ctx.restore();
      }
    }
    if (mopRef.current.has) {
      ctx.save();
      ctx.translate(px + 26, py - 4);
      ctx.rotate(-0.35);
      // handle
      ctx.fillStyle = "#A0522D";
      ctx.fillRect(-2, -26, 4, 32);
      // mop head
      ctx.fillStyle = mopRef.current.charges > 0 ? "#22D3EE" : "#6B7280";
      ctx.fillRect(-8, -32, 16, 8);
      ctx.fillStyle = "#000";
      ctx.fillRect(-8, -24, 16, 2);
      ctx.restore();
    }

    // Floats
    for (const fl of floatsRef.current) {
      ctx.globalAlpha = Math.max(0, fl.life);
      ctx.fillStyle = fl.color;
      ctx.font = "bold 16px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(fl.text, fl.x * W, fl.y * H);
      ctx.globalAlpha = 1;
    }

    // Station labels — scale with canvas so they stay readable on phones
    {
      const lf = Math.max(10, Math.round(W * 0.011));
      const boxH = lf + 8;
      ctx.font = `bold ${lf}px system-ui`;
      ctx.textAlign = "center";
      for (const s of STATIONS) {
        const cx = (s.x + s.w/2) * W;
        const cy = (s.y + s.h + 0.01) * H;
        const tw = ctx.measureText(s.label).width + 14;
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(cx - tw/2, cy, tw, boxH);
        ctx.strokeStyle = s.color;
        ctx.strokeRect(cx - tw/2, cy, tw, boxH);
        ctx.fillStyle = s.color;
        ctx.fillText(s.label, cx, cy + lf + 2);
      }
    }

    // Point-and-click destination marker
    if (targetRef.current) {
      const tp = targetRef.current;
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 130);
      ctx.save();
      ctx.strokeStyle = `rgba(34,211,238,${0.5 + 0.5 * pulse})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(tp.x * W, tp.y * H, 14 + pulse * 6, 7 + pulse * 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(tp.x * W, tp.y * H, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,211,238,${0.6 + 0.4 * pulse})`;
      ctx.fill();
      ctx.restore();
    }

    // GUIDANCE: pulsing highlight + bouncing arrow over the station you need next
    {
      const gd = guidance();
      const st = gd ? STATIONS.find((s) => s.id === gd.stationId) : null;
      if (st) {
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 220);
        const gx = st.x * W, gy = st.y * H, gw = st.w * W, gh = st.h * H;
        const ccx = gx + gw / 2, ccy = gy + gh / 2;
        ctx.save();
        // Radial glow — the station literally lights up
        const rad = Math.max(gw, gh) * (0.95 + pulse * 0.25);
        const glow = ctx.createRadialGradient(ccx, ccy, rad * 0.25, ccx, ccy, rad);
        glow.addColorStop(0, `rgba(250,204,21,${0.35 + pulse * 0.22})`);
        glow.addColorStop(0.6, `rgba(250,204,21,${0.12 + pulse * 0.1})`);
        glow.addColorStop(1, "rgba(250,204,21,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(ccx - rad, ccy - rad, rad * 2, rad * 2);
        // Pulsing dashed frame
        ctx.strokeStyle = `rgba(250,204,21,${0.6 + 0.4 * pulse})`;
        ctx.lineWidth = 3.5 + pulse * 2.5;
        ctx.setLineDash([10, 7]);
        ctx.strokeRect(gx - 7, gy - 7, gw + 14, gh + 14);
        ctx.setLineDash([]);
        // Bigger bouncing arrow with glow
        const bob = Math.sin(performance.now() / 200) * 8;
        const acx = gx + gw / 2;
        const acy = gy - 30 + bob;
        const s2 = 1.25; // arrow scale
        ctx.shadowColor = "rgba(250,204,21,0.9)";
        ctx.shadowBlur = 14 + pulse * 10;
        ctx.fillStyle = "#FACC15";
        ctx.strokeStyle = "#09090B";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(acx, acy + 16 * s2);
        ctx.lineTo(acx - 13 * s2, acy);
        ctx.lineTo(acx - 5 * s2, acy);
        ctx.lineTo(acx - 5 * s2, acy - 12 * s2);
        ctx.lineTo(acx + 5 * s2, acy - 12 * s2);
        ctx.lineTo(acx + 5 * s2, acy);
        ctx.lineTo(acx + 13 * s2, acy);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }

      // TRAINING SHIFT: spotlight the target station while Gary is teaching
      if (trainingRef.current && st) {
        const scx = (st.x + st.w / 2) * W;
        const scy = (st.y + st.h / 2) * H;
        const srad = Math.max(st.w * W, st.h * H) * 0.95 + 34;
        const plx = playerRef.current.x * W;
        const ply = playerRef.current.y * H;
        const prad = 85;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.rect(0, 0, W, H);
        ctx.arc(scx, scy, srad, 0, Math.PI * 2);
        if (Math.hypot(plx - scx, ply - scy) > srad + prad) ctx.arc(plx, ply, prad, 0, Math.PI * 2);
        ctx.fill("evenodd");
        ctx.restore();
      }
    }
    ctx.restore();
    // Explosion flash overlay (drawn without transform)
    if (explosionRef.current > 0 && motionRef.current.mode !== "reduced") {
      ctx.fillStyle = `rgba(255,220,120,${0.55 * explosionRef.current * M})`;
      ctx.fillRect(0, 0, W, H);
    }
    // Smoke alarm overlay: pulsing red vignette + strobe banner
    if (alarmRef.current.life > 0) {
      // in reduced motion, freeze strobe at mid-brightness (no flashing)
      const pulse = motionRef.current.mode === "reduced" ? 0.5 : 0.5 + 0.5 * Math.sin(alarmRef.current.strobe);
      // red edge vignette
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, "rgba(239,68,68,0)");
      vg.addColorStop(1, `rgba(239,68,68,${0.55 * pulse})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      // top strobe banner
      const bh = 34;
      ctx.fillStyle = pulse > 0.5 ? "#EF4444" : "#09090B";
      ctx.fillRect(0, 0, W, bh);
      ctx.strokeStyle = "#FACC15";
      ctx.lineWidth = 2;
      // hazard stripes
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, bh - 6, W, 6);
      ctx.clip();
      const off = (performance.now() / 40) % 24;
      for (let x = -24 - off; x < W + 24; x += 24) {
        ctx.fillStyle = "#FACC15";
        ctx.beginPath();
        ctx.moveTo(x, bh - 6);
        ctx.lineTo(x + 12, bh - 6);
        ctx.lineTo(x + 6, bh);
        ctx.lineTo(x - 6, bh);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = pulse > 0.5 ? "#09090B" : "#FACC15";
      ctx.font = "bold 16px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`🚨 SMOKE ALARM — ${alarmRef.current.life.toFixed(1)}s`, W / 2, 22);
      // corner strobe circle
      const sx = W - 26, sy = 20;
      ctx.beginPath();
      ctx.arc(sx, sy, 10 + pulse * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(239,68,68,${0.6 + 0.4 * pulse})`;
      ctx.fill();
      ctx.strokeStyle = "#FACC15";
      ctx.stroke();
    }
  }, [employee]);

  // Keep the game loop's arrival-callback pointed at the latest interact()
  useEffect(() => { interactFnRef.current = interact; mopFnRef.current = mopHere; });

  // Resize canvas
  useEffect(() => {
    const onResize = () => {
      const cv = canvasRef.current;
      const wrap = wrapRef.current;
      if (!cv || !wrap) return;
      const r = wrap.getBoundingClientRect();
      cv.width = Math.floor(r.width);
      cv.height = Math.floor(r.height);
    };
    onResize();
    const t1 = setTimeout(onResize, 120);
    window.addEventListener("resize", onResize);
    document.addEventListener("fullscreenchange", onResize);
    return () => {
      clearTimeout(t1);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", onResize);
    };
  }, [isFs]);

  // Fullscreen: real Fullscreen API where it exists; CSS page-takeover everywhere
  // (iPhone Safari has no element fullscreen — the takeover IS the fullscreen there).
  // iPhone Safari (in-browser, not a home-screen app) can't use the Fullscreen API,
  // so real fullscreen there = Add to Home Screen. Detect that case to show a tip.
  const [showIosTip, setShowIosTip] = useState(false);
  const iosInBrowser =
    typeof navigator !== "undefined" &&
    /iP(hone|od|ad)/.test(navigator.userAgent) &&
    !(navigator as unknown as { standalone?: boolean }).standalone &&
    !(typeof document !== "undefined" && (document as unknown as { fullscreenEnabled?: boolean }).fullscreenEnabled);

  const toggleFs = () => {
    const next = !isFs;
    setIsFs(next); // CSS takeover — maximizes on every device (incl. iPhone in Safari)
    // On iPhone-in-Safari that's as big as a website can get; offer the home-screen how-to.
    if (next && iosInBrowser) setShowIosTip(true);
    const el = wrapRef.current as (HTMLDivElement & { requestFullscreen?: (o?: object) => Promise<void> }) | null;
    if (next) {
      el?.requestFullscreen?.({ navigationUI: "hide" })?.catch?.(() => {});
      try { (screen.orientation as unknown as { lock?: (o: string) => Promise<void> })?.lock?.("landscape")?.catch?.(() => {}); } catch {}
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setTimeout(() => window.dispatchEvent(new Event("resize")), 80);
  };
  // Show the iPhone home-screen tip once, automatically (they auto-start in takeover mode).
  useEffect(() => {
    if (iosInBrowser && typeof localStorage !== "undefined" && !localStorage.getItem("bb_ios_tip")) {
      const t = setTimeout(() => { setShowIosTip(true); localStorage.setItem("bb_ios_tip", "1"); }, 1200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative mx-auto flex max-w-[1920px] flex-col items-center gap-2 p-2 md:p-3 lg:flex-row lg:items-start lg:justify-center max-lg:landscape:flex-row max-lg:landscape:items-start max-lg:landscape:justify-center max-lg:landscape:gap-1.5 max-lg:landscape:p-1.5" style={{ paddingLeft: "max(0.375rem, env(safe-area-inset-left))", paddingRight: "max(0.375rem, env(safe-area-inset-right))" }}>
      {/* Black backdrop behind the letterboxed game in fullscreen */}
      {isFs && <div className="fixed inset-0 z-[99] bg-black" />}
      {/* The kitchen — a clean, unblocked field of view; every panel lives in the sidebar.
          In fullscreen it's a centered 16:9 box (letterboxed) so the art never squishes. */}
      <div
        ref={wrapRef}
        className={
          isFs
            ? "fixed inset-0 z-[100] m-auto h-[min(100dvh,56.25vw)] w-[min(100vw,177.78dvh)] overflow-hidden bg-black"
            : "relative aspect-[16/9] w-full overflow-hidden rounded-xl border-2 border-[#7C3AED] shadow-[0_0_60px_rgba(124,58,237,0.4)] lg:w-[min(calc(100%_-_316px),calc((100vh_-_100px)*1.7778))] max-lg:landscape:w-[min(calc(100%_-_212px),calc((100dvh_-_16px)*1.7778))]"
        }
      >
        {/* Fullscreen toggle */}
        <button
          onClick={toggleFs}
          className="absolute right-2 top-2 z-50 rounded-md border-2 border-[#FACC15]/80 bg-[#09090B]/85 px-3 py-2 text-xs font-black uppercase tracking-widest text-[#FACC15] backdrop-blur active:scale-95"
        >
          {isFs ? "✕ EXIT" : "⛶ FULL SCREEN"}
        </button>

        {/* iPhone-in-Safari fullscreen how-to (Apple blocks the real fullscreen API) */}
        {showIosTip && (
          <div className="fixed inset-0 z-[120] grid place-items-center bg-black/85 p-5" onClick={() => setShowIosTip(false)}>
            <div onClick={(e) => e.stopPropagation()} className="max-w-sm rounded-xl border-2 border-[#FACC15] bg-[#2E1065] p-5 text-center">
              <div className="[font-family:'Bungee','Impact',sans-serif] text-xl text-[#FACC15]">GO FULLSCREEN ON IPHONE</div>
              <p className="mt-2 text-sm text-white/85">
                Safari won't let a website hide its bar — but you can play with <b className="text-[#FACC15]">zero browser junk</b>:
              </p>
              <ol className="mt-3 space-y-1.5 text-left text-sm text-white/80">
                <li>1. Tap the <b className="text-[#22D3EE]">Share</b> button <span className="text-white/50">(square with an ↑)</span> at the bottom of Safari.</li>
                <li>2. Choose <b className="text-[#22D3EE]">Add to Home Screen</b>.</li>
                <li>3. Open <b className="text-[#FACC15]">Bird Burger</b> from your home screen — it runs fullscreen, no bar.</li>
              </ol>
              <button onClick={() => setShowIosTip(false)} className="mt-4 w-full rounded-lg border-2 border-[#FACC15] bg-[#FACC15]/20 py-2 text-sm font-black uppercase tracking-widest text-[#FACC15]">Got it</button>
            </div>
          </div>
        )}

        {/* Compact day/time/rent chip (fullscreen + phones) */}
        <div className={`pointer-events-none absolute left-2 top-2 z-20 flex-col gap-1 ${isFs ? "flex" : "flex lg:hidden"}`}>
          <div className="flex items-center gap-2 rounded-md border border-[#FACC15]/50 bg-[#09090B]/85 px-2 py-1 backdrop-blur">
            {trainUi ? (
              <>
                <span className="rounded bg-[#22D3EE] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#09090B]">🎓 TRAINING</span>
                <span className="text-[10px] font-black uppercase text-white/60">no clock · no rent</span>
              </>
            ) : (
              <>
                <span className="rounded bg-[#7C3AED] px-1.5 py-0.5 text-[9px] font-black uppercase text-white">DAY {round}</span>
                {holderTier && <span className="rounded bg-[#00C805]/25 px-1 text-[9px] font-black text-[#00C805]" title={`${holderTier.label}: ${holderTier.blurb}`}>{holderTier.emoji}</span>}
                <span className="font-mono text-sm font-black text-[#FACC15]">{fmt(timeLeft)}</span>
                <span className="text-[10px] font-black text-[#22D3EE]">${dayEarned.toLocaleString()}<span className="text-white/40">/${roundConfig(round).quota.toLocaleString()}</span></span>
              </>
            )}
          </div>
        </div>

        {/* Live order ticket — compact top strip (fullscreen + phones) so it never
            covers the PICK UP window or the fridge. Sits under the guidance banner. */}
        {ordersRef.current[0] && (() => {
          const o = ordersRef.current[0];
          const pool = [...carryRef.current];
          const rows = o.template.items.slice(0, 5).map((it) => {
            const idx = pool.indexOf(it);
            const have = idx >= 0;
            if (have) pool.splice(idx, 1);
            return { it, have };
          });
          const nextIdx = rows.findIndex((r) => !r.have);
          return (
            <div className={`pointer-events-none absolute inset-x-0 top-11 z-20 justify-center px-2 ${isFs ? "flex" : "flex lg:hidden"}`}>
              <div className="flex max-w-full items-center gap-1.5 overflow-hidden rounded-full border-2 border-[#FACC15] bg-[#09090B]/90 px-2.5 py-1 shadow-[0_0_16px_rgba(250,204,21,0.35)] backdrop-blur">
                <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-[#FACC15]">{o.template.name}</span>
                {rows.map((r, i) => (
                  <span
                    key={i}
                    className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                      r.have ? "ring-2 ring-[#00C805]" : i === nextIdx ? "animate-pulse ring-2 ring-[#FACC15]" : "opacity-50 grayscale-[35%]"
                    }`}
                    style={{ background: ING_META[r.it].color + "55" }}
                  >
                    <IngIcon kind={r.it} className="h-4 w-4" />
                    {r.have && <span className="absolute -right-1 -top-1 grid h-3 w-3 place-items-center rounded-full bg-[#00C805] text-[7px] font-black text-white">✓</span>}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
        {/* Portrait phones: the kitchen needs the wide way round */}
        <div className="pointer-events-none absolute inset-0 z-40 hidden place-items-center bg-black/75 backdrop-blur-[2px] max-lg:portrait:grid">
          <div className="px-6 text-center">
            <div className="text-5xl">🔄</div>
            <div className="mt-2 [font-family:'Bungee','Impact',sans-serif] text-2xl text-[#FACC15]">ROTATE YOUR PHONE</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-white/70">The kitchen only fits sideways. Health code thing.</div>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none select-none"
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" } as React.CSSProperties}
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width;
            const ny = (e.clientY - r.top) / r.height;
            // Tapped a grease puddle? Run onto it and mop it clean — works even while
            // carrying food. Generous hitbox so it's easy to hit on a phone.
            const sp = spillsRef.current.find((s) => Math.hypot(nx - s.x, ny - s.y) < s.r + 0.05);
            if (sp) {
              targetRef.current = { x: clamp(sp.x, 0.02, 0.98), y: clamp(sp.y, 0.1, 0.96), interact: false, mop: true };
              return;
            }
            // Clicked a station (generous hitbox)? Run there and use it on arrival.
            const st = STATIONS.find((s) => nx >= s.x - 0.025 && nx <= s.x + s.w + 0.025 && ny >= s.y - 0.035 && ny <= s.y + s.h + 0.035);
            if (st) {
              targetRef.current = {
                x: clamp(st.x + st.w / 2, 0.02, 0.98),
                y: clamp(st.y + st.h + 0.03, 0.1, 0.96),
                interact: true,
              };
            } else {
              targetRef.current = { x: clamp(nx, 0.02, 0.98), y: clamp(ny, 0.1, 0.96), interact: false };
            }
          }}
        />




        {/* Floating ingredient badges above each station */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {STATION_YIELDS.map(({ id, items }) => {
            const s = STATIONS.find((st) => st.id === id)!;
            return (
              <div
                key={id}
                className="absolute flex -translate-x-1/2 -translate-y-full gap-0.5"
                style={{ left: `${(s.x + s.w / 2) * 100}%`, top: `${(s.y - 0.012) * 100}%`, animation: `bounce 2.6s ease-in-out ${(s.x * 1.7).toFixed(2)}s infinite` }}
              >
                {items.map((it) => (
                  <span key={it} title={ING_META[it].label} className="grid h-7 w-7 place-items-center rounded-full border border-white/25 bg-[#09090B]/80 shadow-[0_2px_8px_rgba(0,0,0,0.6)] backdrop-blur-[2px]">
                    <IngIcon kind={it} className="h-5 w-5" />
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        {/* In-field action banner: the one instruction, right where you're looking */}
        {(() => {
          const gd = guidance();
          return gd ? (
            <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center">
              <div className="rounded-full border-2 border-[#FACC15] bg-[#09090B]/90 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-[#FACC15] shadow-[0_0_20px_rgba(250,204,21,0.4)] md:text-xs">
                👉 {gd.text}
              </div>
            </div>
          ) : null;
        })()}

        {/* TRAINING: Gary's coaching bubble + skip */}
        {trainUi && !trainWelcome && (
          <div className="pointer-events-none absolute left-2 top-12 z-30 flex max-w-[320px] flex-col gap-1.5 md:left-3 md:top-14 md:max-w-[420px]">
            <div className="flex items-end gap-2">
              <img src={EMPLOYEES.find((e) => e.id === "gary")!.img} alt="Manager Gary" className="h-16 w-16 shrink-0 rounded-full border-2 border-[#00C805] bg-[#09090B]/80 object-contain md:h-20 md:w-20" />
              <div className="rounded-xl rounded-bl-none border-2 border-[#00C805]/80 bg-[#09090B]/95 p-3 shadow-[0_0_24px_rgba(0,200,5,0.35)] backdrop-blur md:p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#00C805] md:text-xs">MANAGER GARY · LESSON {trainStep + 1}/2</div>
                <p className="mt-1 text-sm font-bold leading-snug text-white md:text-base">
                  {trainStep === 0
                    ? "Welcome aboard. The ticket up top is the order. The kitchen GLOWS where you need to go — tap the glow, your bird does the rest."
                    : "Easy money! Now a real burger: raw PATTY → GRILL it → wait for the DING → grab it → add SAUCE → deliver. Don't let it burn."}
                </p>
              </div>
            </div>
            <button
              onClick={() => graduate(false)}
              className="pointer-events-auto self-start rounded-md border border-white/30 bg-[#09090B]/85 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white md:text-xs"
            >
              Skip training →
            </button>
          </div>
        )}

        {/* TRAINING: one welcome card, then it's hands-on */}
        {trainWelcome && (
          <div className="absolute inset-0 z-50 grid place-items-center bg-black/80 p-5">
            <div className="w-full max-w-sm rounded-2xl border-2 border-[#22D3EE] bg-[#2E1065] p-6 text-center shadow-[0_0_60px_rgba(34,211,238,0.35)]">
              <img src={EMPLOYEES.find((e) => e.id === "gary")!.img} alt="" className="mx-auto h-20 w-20 rounded-full border-2 border-[#00C805] bg-[#09090B]/60 object-contain" />
              <div className="mt-3 [font-family:'Bungee','Impact',sans-serif] text-xl text-[#22D3EE]">FIRST DAY AT BIRD BURGER</div>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                Manager Gary will train you: <b className="text-[#FACC15]">two quick orders</b>. No clock, no fires, no pressure — the kitchen glows, you tap.
              </p>
              <button
                onClick={() => setTrainWelcome(false)}
                className="mt-5 w-full rounded-xl border-4 border-[#FACC15] bg-[#FACC15] py-3.5 text-base font-black uppercase tracking-widest text-[#09090B] shadow-[0_5px_0_#B08807] active:translate-y-0.5"
              >
                🎓 Start training
              </button>
              <button
                onClick={() => graduate(false)}
                className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/40 underline-offset-2 hover:underline"
              >
                Skip — I've flipped burgers before
              </button>
            </div>
          </div>
        )}

        {/* DAY COMPLETE flash */}
        {(() => {
          void dayBannerTick;
          const b = dayBannerRef.current;
          if (!b || performance.now() > b.until) return null;
          return (
            <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
              <div className="animate-[pulse_0.7s_ease-out] rounded-2xl border-4 border-[#00C805] bg-[#09090B]/85 px-8 py-4 text-center shadow-[0_0_60px_rgba(0,200,5,0.7)]">
                <div className="[font-family:'Bungee','Impact',sans-serif] text-3xl text-[#00C805] md:text-5xl">💸 {b.text}</div>
                <div className="mt-1 text-xs font-black uppercase tracking-widest text-[#FACC15] md:text-sm">{b.sub}</div>
              </div>
            </div>
          );
        })()}

        {/* HEALTH INSPECTOR shutdown countdown */}
        {inspectorT >= 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center md:top-16">
            <div className="animate-pulse rounded-xl border-4 border-[#EF4444] bg-[#09090B]/90 px-6 py-3 text-center shadow-[0_0_50px_rgba(239,68,68,0.8)]">
              <div className="[font-family:'Bungee','Impact',sans-serif] text-2xl text-[#EF4444] md:text-4xl">🚨 HEALTH INSPECTOR: {Math.ceil(Math.max(0, inspectorT))} 🚨</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#FACC15]">CALM THE CHAOS OR GET SHUT DOWN — MOP, EXTINGUISH, DELIVER!</div>
            </div>
          </div>
        )}



        {/* Bottom-center: what you're holding, big and readable */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center md:bottom-4">
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-[#FACC15]/70 bg-[#09090B]/90 px-3 py-1.5 backdrop-blur">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#FACC15]">HANDS {carryRef.current.length}/4</span>
            {carryRef.current.length === 0 ? (
              <span className="px-1 text-[10px] uppercase tracking-wider text-white/50">empty — click a glowing station</span>
            ) : (
              carryRef.current.map((it, i) => (
                <span key={i} className="flex items-center gap-1 rounded-lg px-2 py-1 shadow" style={{ background: ING_META[it].color }}>
                  <IngIcon kind={it} className="h-6 w-6 drop-shadow" />
                  <span className="hidden text-[9px] font-black uppercase text-[#09090B] md:inline">{ING_META[it].label}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Mobile touch controls */}
        {showTouch && <TouchControls onInteract={interact} onDrop={dropCarry} />}
      </div>
      <aside className="flex w-full flex-col gap-2 lg:w-[300px] lg:shrink-0 max-lg:landscape:max-h-[calc(100dvh-16px)] max-lg:landscape:w-[205px] max-lg:landscape:shrink-0 max-lg:landscape:overflow-y-auto">
        {/* Day + time + rent */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            {trainUi ? (
              <>
                <InfoCard title="SHIFT" value="🎓" sub="TRAINING" tint="#22D3EE" wide />
                <InfoCard title="TIME" value="∞" sub="NO CLOCK" tint="#FACC15" wide />
                <InfoCard title="LESSON" value={`${trainStep + 1}/2`} sub="ORDERS" tint="#7C3AED" wide />
              </>
            ) : (
              <>
                <InfoCard title="DAY" value={`${round}`} sub={`TOTAL $${score.toLocaleString()}`} tint="#7C3AED" wide />
                <InfoCard title="TIME" value={fmt(timeLeft)} sub="TILL CLOSE" tint="#FACC15" wide />
                <InfoCard title="TODAY'S RENT" value={`$${dayEarned.toLocaleString()}`} sub={`NEED $${roundConfig(round).quota.toLocaleString()}`} tint="#22D3EE" wide />
              </>
            )}
          </div>
          {/* Day rent progress bar */}
          {!trainUi && (() => {
            const q = roundConfig(round).quota;
            const paid = dayEarned >= q;
            return (
              <div className="self-stretch rounded-lg border-2 border-[#22D3EE]/60 bg-[#09090B]/85 p-1.5 backdrop-blur">
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#22D3EE] to-[#00C805] transition-[width] duration-300"
                    style={{ width: `${Math.min(100, (dayEarned / q) * 100)}%` }}
                  />
                </div>
                <div className="mt-0.5 text-center text-[8px] font-black uppercase tracking-widest text-white/60">
                  {paid ? "RENT PAID — NEXT DAY!" : `$${(q - dayEarned).toLocaleString()} TO SURVIVE DAY ${round}`}
                </div>
              </div>
            );
          })()}
          {cleanCombo >= 2 && (
            <div
              key={cleanCombo}
              className={`self-end rounded-lg border-2 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest backdrop-blur animate-[pulse_0.6s_ease-out] ${
                cleanCombo >= 3 ? "border-[#FACC15] bg-[#FACC15]/20 text-[#FACC15]" : "border-[#22D3EE] bg-[#22D3EE]/20 text-[#22D3EE]"
              }`}
            >
              MOP CHAIN <span className="text-base">×{cleanCombo}</span>
            </div>
          )}
        </div>
        {/* Orders + next-step guidance */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex flex-wrap justify-center gap-2">
            {ordersRef.current.map((o, i) => <OrderCard key={o.id} order={o} carry={carryRef.current} focused={i === 0} />)}
          </div>
        </div>
        {/* Chaos + controls */}
        <div className="flex flex-col gap-2">
          {!showTouch && (
            <div className="hidden rounded-lg border-2 border-[#7C3AED]/50 bg-[#09090B]/85 p-2 text-[10px] uppercase tracking-widest backdrop-blur md:block">
              <div className="mb-1 font-black text-[#FACC15]">CONTROLS</div>
              <KeyRow keyLabel="CLICK" action="Run there / use station" />
              <KeyRow keyLabel="SPACE" action="Interact" />
              <KeyRow keyLabel="Q" action="Drop" />
              <KeyRow keyLabel="WASD" action="Move (optional)" />
            </div>
          )}
          <div className={`rounded-lg border-2 bg-[#09090B]/85 p-2 text-[10px] uppercase tracking-widest backdrop-blur ${chaos >= 4.5 ? "border-[#EF4444] animate-pulse" : "border-[#EF4444]/60"}`}>
            <div className="mb-1 font-black text-[#EF4444]">CHAOS {chaos >= 4.5 ? "— INSPECTOR WATCHING" : "LEVEL"}</div>
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={`text-lg leading-none ${i < Math.floor(chaos) ? "" : "grayscale opacity-30"}`}>🔥</span>
              ))}
            </div>
            <div className="mt-0.5 text-[8px] text-white/50">MAX = HEALTH INSPECTOR SHUTS YOU DOWN</div>
          </div>
          <button onClick={onQuit} className="rounded border border-[#EF4444]/70 bg-[#09090B]/85 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#EF4444]/90 backdrop-blur hover:bg-[#EF4444]/30">Clock Out</button>
        </div>
        {/* Kitchen tools + vices + settings */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 rounded-lg border-2 border-[#7C3AED] bg-[#2E1065]/85 p-2 backdrop-blur">
            <div className="flex-1">
              <div className="[font-family:'Bungee','Impact',sans-serif] text-xs leading-none text-[#7C3AED]">BIRD BURGER</div>
              <div className="[font-family:'Bungee','Impact',sans-serif] text-[10px] leading-none text-[#EC4899]">KITCHEN CHAOS</div>
            </div>
            <button
              onClick={() => setHudOpen((v) => !v)}
              className="rounded border-2 border-[#FACC15]/60 bg-[#FACC15]/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#FACC15] hover:bg-[#FACC15]/25"
              title="Show/hide stats & settings"
            >{hudOpen ? "×" : "…"}</button>
          </div>
          {hudOpen && (
          <div className="rounded-lg border-2 border-[#7C3AED]/60 bg-[#09090B]/85 p-2 text-[10px] uppercase tracking-widest backdrop-blur">
            <div className="mb-1 font-black text-[#FACC15]">KITCHEN STATS</div>
            <StatRow label="Completed" value={statsRef.current.ordersCompleted} />
            <StatRow label="Failed" value={statsRef.current.ordersFailed} />
            <StatRow label="Food Burned" value={statsRef.current.foodBurned} />
            <StatRow label="Fires" value={statsRef.current.fires} />
            <StatRow label="Pigeons Chased" value={statsRef.current.pigeonsChased} />
            <StatRow label="Dropped" value={statsRef.current.dropped} />
          </div>
          )}
          {firesRef.current.length > 0 && (() => {
            const worst = firesRef.current.reduce((a, b) => (a.danger < b.danger ? a : b));
            const pct = Math.max(0, Math.min(1, worst.danger / worst.dangerMax));
            const armed = pct < 0.35;
            return (
              <motion.div
                animate={{ borderColor: armed ? ["#EF4444", "#FACC15", "#EF4444"] : ["#F97316", "#FACC15", "#F97316"] }}
                transition={{ duration: armed ? 0.35 : 0.7, repeat: Infinity }}
                className="rounded-lg border-2 bg-[#EF4444]/20 p-2 text-[10px] uppercase tracking-widest"
              >
                <div className="flex items-center gap-1.5 font-black text-[#EF4444]"><Flame className="h-3 w-3" /> KITCHEN DISASTER</div>
                <div className="mt-0.5 font-black text-white">🔥 FIRE × {firesRef.current.length} — {worst.danger.toFixed(1)}s</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full transition-[width] duration-150"
                    style={{
                      width: `${pct * 100}%`,
                      background: pct > 0.5 ? "#FACC15" : pct > 0.25 ? "#F97316" : "#EF4444",
                    }}
                  />
                </div>
                <div className="mt-1 text-white/70">
                  {hasExtinguisherRef.current ? "Hold E / SPACE near the flames to spray!" : "Grab the 🧯 extinguisher!"}
                </div>
              </motion.div>
            );
          })()}
          {/* Vices — tucked behind the "…" toggle; fun for regulars, noise for new players */}
          {hudOpen && (() => {
            const v = viceRef.current;
            const smokeMax = 12, beerMax = 15;
            const smokePct = v.smokeCd > 0 ? 1 - v.smokeCd / smokeMax : 1;
            const beerPct = v.drinkCd > 0 ? 1 - v.drinkCd / beerMax : 1;
            const buzz = v.buzz;
            const buzzMax = 3;
            return (
              <div className="rounded-lg border-2 border-[#FACC15]/60 bg-[#09090B]/85 p-2 text-[10px] uppercase tracking-widest backdrop-blur">
                <div className="mb-1 flex items-center justify-between font-black text-[#FACC15]">
                  <span>SHIFT VICES</span>
                  {buzz > 0 && (
                    <span className="animate-pulse text-[9px] text-white/80">
                      {buzz > 1.5 ? "😵 WASTED" : buzz > 0.6 ? "😎 BUZZED" : "😌 EASY"} {buzz.toFixed(1)}s
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      if (v.smokeCd > 0) return;
                      v.smokeCd = smokeMax; v.buzz = Math.min(2.5, v.buzz + 1.2);
                      scoreRef.current += 15;
                      chaosRef.current = Math.max(0, chaosRef.current - 0.75);
                      setChaos(chaosRef.current);
                      viceAnimRef.current = { type: "smoke", t: 2.6, max: 2.6 };
                      floatsRef.current.push({ x: playerRef.current.x, y: playerRef.current.y - 0.04, text: "🚬 SMOKE BREAK", color: "#FACC15", life: 1.3 });
                      setViceTick((n) => n + 1);
                    }}
                    disabled={v.smokeCd > 0}
                    className="relative flex-1 overflow-hidden rounded border-2 border-[#FACC15]/70 bg-[#FACC15]/10 px-2 py-1 text-[10px] font-black text-[#FACC15] transition hover:bg-[#FACC15]/25 disabled:cursor-not-allowed disabled:opacity-70"
                    title="Smoke a dart. Calms the chaos. Makes the room wobble."
                  >
                    <div className="absolute inset-y-0 left-0 bg-[#FACC15]/25 transition-[width] duration-200" style={{ width: `${smokePct * 100}%` }} />
                    <span className="relative">🚬 {v.smokeCd > 0 ? `${v.smokeCd.toFixed(1)}s` : "SMOKE"}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (v.drinkCd > 0) return;
                      v.drinkCd = beerMax; v.buzz = Math.min(3, v.buzz + 2);
                      scoreRef.current += 25;
                      chaosRef.current = Math.max(0, chaosRef.current - 1);
                      setChaos(chaosRef.current);
                      playerRef.current.slipT = 0.8;
                      viceAnimRef.current = { type: "flask", t: 2.2, max: 2.2 };
                      floatsRef.current.push({ x: playerRef.current.x, y: playerRef.current.y - 0.04, text: "🥃 FLASK TIME", color: "#22D3EE", life: 1.3 });
                      setViceTick((n) => n + 1);
                    }}
                    disabled={v.drinkCd > 0}
                    className="relative flex-1 overflow-hidden rounded border-2 border-[#22D3EE]/70 bg-[#22D3EE]/10 px-2 py-1 text-[10px] font-black text-[#22D3EE] transition hover:bg-[#22D3EE]/25 disabled:cursor-not-allowed disabled:opacity-70"
                    title="Pull the flask. Chaos drops. So does your motor control."
                  >
                    <div className="absolute inset-y-0 left-0 bg-[#22D3EE]/25 transition-[width] duration-200" style={{ width: `${beerPct * 100}%` }} />
                    <span className="relative">🥃 {v.drinkCd > 0 ? `${v.drinkCd.toFixed(1)}s` : "FLASK"}</span>
                  </button>
                </div>
                {buzz > 0 && (
                  <div className="mt-1.5">
                    <div className="mb-0.5 flex justify-between text-[8px] text-white/60">
                      <span>BUZZ ACTIVE</span>
                      <span>{buzz.toFixed(1)}s LEFT</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-[width] duration-200"
                        style={{
                          width: `${Math.min(1, buzz / buzzMax) * 100}%`,
                          background: "linear-gradient(90deg,#22D3EE,#FACC15,#EF4444)",
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-1 text-[8px] leading-tight text-white/50">Reviews are already 1★. Live a little.</div>
              </div>
            );
          })()}

          {hudOpen && (<>
          {/* Perf mode toggle */}
          <div className="rounded-lg border-2 border-[#22D3EE]/50 bg-[#09090B]/85 p-2 text-[10px] uppercase tracking-widest backdrop-blur">
            <div className="mb-1 flex items-center justify-between font-black text-[#22D3EE]">
              <span>PERF MODE</span>
              <span className={`text-[9px] ${perfFps < 40 ? "text-[#EF4444]" : perfFps < 55 ? "text-[#FACC15]" : "text-white/60"}`}>{perfFps} FPS{perfActive ? " · LEAN" : ""}</span>
            </div>
            <div className="flex gap-1">
              {(["auto", "high", "low"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    perfRef.current.mode = m;
                    try { localStorage.setItem("bb_perf", m); } catch {}
                    setPerfMode(m);
                  }}
                  className={`flex-1 rounded border-2 px-1.5 py-1 text-[9px] font-black transition ${
                    perfMode === m
                      ? "border-[#22D3EE] bg-[#22D3EE]/25 text-[#22D3EE]"
                      : "border-white/20 bg-white/5 text-white/60 hover:border-white/40"
                  }`}
                >{m === "auto" ? "AUTO" : m === "high" ? "FULL FX" : "LEAN"}</button>
              ))}
            </div>
            <div className="mt-1 text-[8px] leading-tight text-white/50">
              {perfMode === "auto" ? "Auto-cuts dust & flashes when it gets hectic." : perfMode === "high" ? "Every spark, every puff." : "Minimal particles for smooth play."}
            </div>
          </div>

          {/* Motion sensitivity toggle */}
          <div className="rounded-lg border-2 border-[#A78BFA]/50 bg-[#09090B]/85 p-2 text-[10px] uppercase tracking-widest backdrop-blur">
            <div className="mb-1 flex items-center justify-between font-black text-[#A78BFA]">
              <span>MOTION</span>
              <span className="text-[9px] text-white/60">{motionMode === "reduced" ? "GENTLE" : "SPICY"}</span>
            </div>
            <div className="flex gap-1">
              {(["full", "reduced"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    motionRef.current.mode = m;
                    motionRef.current.scale = m === "reduced" ? 0.25 : 1;
                    try { localStorage.setItem("bb_motion", m); } catch {}
                    setMotionMode(m);
                  }}
                  className={`flex-1 rounded border-2 px-1.5 py-1 text-[9px] font-black transition ${
                    motionMode === m
                      ? "border-[#A78BFA] bg-[#A78BFA]/25 text-[#A78BFA]"
                      : "border-white/20 bg-white/5 text-white/60 hover:border-white/40"
                  }`}
                >{m === "full" ? "FULL" : "REDUCED"}</button>
              ))}
            </div>
            <div className="mt-1 text-[8px] leading-tight text-white/50">
              {motionMode === "reduced" ? "No dash trails or strobe flashes; softer shake & squash." : "Full shake, trails, flashes & squash chaos."}
            </div>
          </div>
          </>)}
        </div>
      </aside>
    </div>
  );
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function drawProgress(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, color: string) {
  const w = 60, h = 8;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(x - w/2, y - h/2, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x - w/2 + 1, y - h/2 + 1, (w - 2) * clamp(t, 0, 1), h - 2);
  ctx.strokeStyle = "#000";
  ctx.strokeRect(x - w/2, y - h/2, w, h);
}
// Graded on how many days you survived (with score as a tiebreaker flavor).
function gradeForDays(days: number, score: number): { letter: string; sub: string } {
  if (days >= 8) return { letter: "S", sub: "FRANCHISE MOGUL" };
  if (days >= 6) return { letter: "A", sub: "SEASONED LINE COOK" };
  if (days >= 4) return { letter: "B", sub: "SURVIVING, BARELY" };
  if (days >= 2) return { letter: "C", sub: "STILL EMPLOYED" };
  if (days >= 1) return { letter: "D", sub: "MADE IT ONE DAY" };
  return { letter: "F", sub: score >= 300 ? "SO CLOSE TO DAY ONE" : "FIRED ON THE SPOT" };
}

/* ─────────────────────────  UI SUBCOMPONENTS  ───────────────────────── */

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between border-b border-white/10 py-0.5 last:border-0">
      <span className="text-white/70">{label}</span>
      <span className="font-black text-white">{value}</span>
    </div>
  );
}

function InfoCard({ title, value, sub, tint, wide }: { title: string; value: string; sub: string; tint: string; wide?: boolean }) {
  return (
    <div className={`rounded-lg border-2 bg-[#09090B]/85 p-2 backdrop-blur ${wide ? "min-w-[100px]" : ""}`} style={{ borderColor: tint }}>
      <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: tint }}>{title}</div>
      <div className="[font-family:'Bungee','Impact',sans-serif] text-xl leading-none text-white" style={{ textShadow: `0 0 10px ${tint}80` }}>{value}</div>
      <div className="text-[8px] uppercase tracking-widest text-white/50">{sub}</div>
    </div>
  );
}

function KeyRow({ keyLabel, action }: { keyLabel: string; action: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="min-w-[54px] rounded border border-white/20 bg-[#2E1065]/60 px-1.5 py-0.5 text-center font-black text-[#FACC15]">{keyLabel}</span>
      <span className="text-white/80">{action}</span>
    </div>
  );
}

function OrderCard({ order, carry, focused }: { order: Order; carry: Ing[]; focused?: boolean }) {
  const t = order.remaining;
  const total = order.template.time;
  const pct = clamp(t / total, 0, 1);
  const urgent = t < 15;
  // Mark which ingredients you're already holding (consume duplicates properly)
  const pool = [...carry];
  const have = order.template.items.map((it) => {
    const i = pool.indexOf(it);
    if (i >= 0) { pool.splice(i, 1); return true; }
    return false;
  });
  return (
    <motion.div
      animate={urgent ? { x: [0, -2, 2, -2, 2, 0] } : {}}
      transition={urgent ? { duration: 0.4, repeat: Infinity } : {}}
      className={`pointer-events-auto shrink-0 overflow-hidden rounded-lg border-2 bg-[#FFF7DF] text-[#2E1065] shadow-lg ${
        focused ? "w-[195px] border-[3px] border-[#FACC15] shadow-[0_0_24px_rgba(250,204,21,0.6)]" : urgent ? "w-[130px] border-[#EF4444] opacity-85" : "w-[130px] border-[#2E1065] opacity-85"
      }`}
    >
      {focused && (
        <div className="bg-[#FACC15] py-0.5 text-center text-[9px] font-black uppercase tracking-[0.2em] text-[#09090B]">★ MAKE THIS ★</div>
      )}
      <div className="border-b border-[#2E1065]/30 bg-[#2E1065] px-2 py-1 text-center text-[10px] font-black uppercase tracking-widest text-[#FACC15]">
        {order.template.name}
      </div>
      {focused ? (
        /* Focused order: gross food glamour shot + readable recipe checklist */
        <div className="space-y-0.5 px-1.5 py-1">
          <img src={order.template.img} alt={order.template.name} className="mx-auto h-16 w-16 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" />
          {order.template.items.slice(0, 5).map((it, i) => (
            <div key={i} className={`flex items-center gap-1.5 rounded px-1 py-0.5 ${have[i] ? "bg-[#00C805]/15" : "bg-[#2E1065]/8"}`}>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full shadow-sm" style={{ background: ING_META[it].color + "55" }}><IngIcon kind={it} className="h-5 w-5" /></span>
              <span className={`flex-1 text-[11px] font-black uppercase leading-tight ${have[i] ? "text-[#0B7A1E] line-through" : "text-[#2E1065]"}`}>{ING_META[it].label}</span>
              <span className={`text-[10px] font-black ${have[i] ? "text-[#00C805]" : "text-[#2E1065]/40"}`}>{have[i] ? "✓" : "•"}</span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center py-1"><img src={order.template.img} alt={order.template.name} className="h-11 w-11 object-contain" /></div>
          <div className="flex justify-center gap-0.5 px-1 pb-1">
            {order.template.items.slice(0, 5).map((it, i) => (
              <span
                key={i}
                title={ING_META[it].label}
                className={`relative grid h-5 w-5 place-items-center rounded-full ${have[i] ? "ring-2 ring-[#00C805]" : "opacity-60 grayscale-[35%]"}`}
                style={{ background: ING_META[it].color + "55" }}
              >
                <IngIcon kind={it} className="h-4 w-4" />
              </span>
            ))}
          </div>
        </>
      )}
      <div className="px-1.5 pb-1">
        <div className="mb-0.5 text-center text-[10px] font-black">{t}s</div>
        <div className="h-1.5 w-full overflow-hidden rounded bg-[#2E1065]/20">
          <div className="h-full transition-all" style={{ width: `${pct*100}%`, background: urgent ? "#EF4444" : pct > 0.5 ? "#00C805" : "#FACC15" }} />
        </div>
      </div>
    </motion.div>
  );
}

function Minimap({ player, fires, pigeons }: { player: { x: number; y: number }; fires: Fire[]; pigeons: Pigeon[] }) {
  return (
    <div className="relative h-[86px] w-full overflow-hidden rounded border border-[#7C3AED]/50 bg-[#150724]">
      {STATIONS.map((s) => (
        <div key={s.id} className="absolute rounded-sm" style={{ left: `${s.x*100}%`, top: `${s.y*100}%`, width: `${s.w*100}%`, height: `${s.h*100}%`, background: s.color + "40", border: `1px solid ${s.color}` }} />
      ))}
      {fires.map((f, i) => (
        <div key={i} className="absolute h-2 w-2 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]" style={{ left: `${f.x*100}%`, top: `${f.y*100}%`, transform: "translate(-50%,-50%)" }} />
      ))}
      {pigeons.map((pg, i) => (
        <div key={i} className="absolute h-1.5 w-1.5 rounded-full bg-white" style={{ left: `${pg.x*100}%`, top: `${pg.y*100}%`, transform: "translate(-50%,-50%)" }} />
      ))}
      <div className="absolute h-2.5 w-2.5 rounded-full bg-[#FACC15] shadow-[0_0_10px_#FACC15]" style={{ left: `${player.x*100}%`, top: `${player.y*100}%`, transform: "translate(-50%,-50%)" }} />
    </div>
  );
}

function TouchControls({ onInteract, onDrop }: { onInteract: () => void; onDrop: () => void }) {
  // Tap-to-move IS the movement control on touch — no joystick blocking the kitchen.
  return (
    <div className="absolute bottom-3 right-3 z-20 flex items-end gap-2.5">
      <button onTouchStart={onDrop} className="h-12 w-12 rounded-full border-2 border-[#EF4444] bg-[#09090B]/70 text-[10px] font-black uppercase text-[#EF4444] active:bg-[#EF4444]/40">DROP</button>
      <button onTouchStart={onInteract} className="h-16 w-16 rounded-full border-4 border-[#FACC15] bg-[#FACC15]/90 text-xs font-black uppercase text-[#09090B] shadow-[0_0_18px_rgba(250,204,21,0.5)] active:scale-95">USE</button>
    </div>
  );
}

/* ─────────────────────────  FLEX CARD (shareable run image)  ───────────────────────── */

function FlexCard({ stats, rank }: { stats: GameStats; rank?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const days = stats.daysSurvived;
  const won = days >= 1;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = 1080, H = 1080;
    c.width = W; c.height = H;
    const draw = (bird?: HTMLImageElement) => {
      ctx.fillStyle = "#09090b"; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W * 0.34, H * 0.28, 60, W * 0.34, H * 0.28, 760);
      g.addColorStop(0, won ? "rgba(0,200,5,0.24)" : "rgba(239,68,68,0.2)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(139,92,246,0.09)"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 54) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      if (bird) {
        ctx.save(); ctx.globalAlpha = 0.95;
        ctx.shadowColor = won ? "rgba(0,200,5,0.5)" : "rgba(236,72,153,0.5)"; ctx.shadowBlur = 60;
        ctx.drawImage(bird, W - 520, H - 560, 500, 500);
        ctx.restore();
      }
      ctx.textAlign = "left";
      ctx.font = '600 40px "Bungee", Impact, sans-serif';
      ctx.fillStyle = "#FACC15"; ctx.fillText("BIRD BURGER:", 70, 108);
      ctx.fillStyle = "#EC4899"; ctx.fillText("KITCHEN CHAOS", 70, 162);
      ctx.fillStyle = won ? "#00C805" : "#EF4444";
      ctx.font = '210px "Bungee", Impact, sans-serif';
      ctx.fillText(won ? String(days) : "0", 60, 470);
      ctx.fillStyle = "#fff"; ctx.font = '64px "Bungee", Impact, sans-serif';
      ctx.fillText(days === 1 ? "DAY SURVIVED" : "DAYS SURVIVED", 66, 552);
      ctx.font = '600 46px "Space Grotesk", system-ui, sans-serif';
      ctx.fillStyle = "#FACC15"; ctx.fillText(`$${stats.score.toLocaleString()} banked`, 70, 662);
      ctx.fillStyle = "#22D3EE";
      ctx.fillText(`Grade ${stats.grade}${rank ? `   ·   Rank #${rank} this week` : ""}`, 70, 722);
      if (!won) {
        ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = '600 34px "Space Grotesk", sans-serif';
        ctx.fillText(stats.outcome === "shutdown" ? "Shut down by the health inspector" : "Evicted on Day 1", 70, 786);
      }
      ctx.fillStyle = "#FACC15";
      ctx.beginPath(); (ctx as any).roundRect(70, H - 168, 640, 92, 16); ctx.fill();
      ctx.fillStyle = "#09090b"; ctx.font = '44px "Bungee", Impact, sans-serif';
      ctx.fillText("birdburger.meme/game", 96, H - 108);
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.font = '600 30px "Space Grotesk", sans-serif';
      ctx.fillText("Free to play  ·  top 3 birds each week earn $BRGR", 70, H - 44);
    };
    const bird = new Image();
    bird.src = mascotHero;
    bird.onload = () => draw(bird);
    bird.onerror = () => draw();
  }, [stats, rank, days, won]);

  const share = async () => {
    const c = canvasRef.current;
    if (!c) return;
    const text = `I survived ${days} ${days === 1 ? "day" : "days"} in Bird Burger: Kitchen Chaos and banked $${stats.score.toLocaleString()}${rank ? ` (rank #${rank} this week)` : ""}. How long can you last? 🍔 birdburger.meme/game $BRGR`;
    c.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "bird-burger-run.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], text }); return; } catch { /* fall through */ }
      }
      // No forced download (looks like malware): open the image in a tab + copy the caption
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, "image/png");
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FACC15]">📸 Your Flex Card</div>
      <canvas ref={canvasRef} className="w-full max-w-[340px] rounded-xl border-2 border-[#FACC15]/50 shadow-[0_0_30px_rgba(250,204,21,0.25)]" />
      <button onClick={share} className="inline-flex items-center gap-2 rounded-lg border-4 border-[#22D3EE] bg-[#22D3EE] px-6 py-3 text-sm font-black uppercase tracking-widest text-[#09090B] shadow-[0_5px_0_#0e7490] hover:-translate-y-0.5 active:translate-y-0.5">
        <Trophy className="h-4 w-4" /> Share My Run
      </button>
    </div>
  );
}

/* ─────────────────────────  RESULTS SCREEN  ───────────────────────── */

function ResultsScreen({ stats, onReplay, onQuit }: { stats: GameStats; onReplay: () => void; onQuit: () => void }) {
  const [rank, setRank] = useState<number | undefined>(undefined);
  const days = stats.daysSurvived;
  const won = days >= 1; // survived at least one full day = a good run, celebrate it
  const dayWord = days === 1 ? "DAY" : "DAYS";
  const share = () => {
    const text = `Bird Burger: Kitchen Chaos — I survived ${days} ${dayWord.toLowerCase()} and banked $${stats.score.toLocaleString()} (grade ${stats.grade}) before ${stats.outcome === "shutdown" ? "the health inspector shut me down" : "getting evicted"}. How many days can you last? birdburger.meme/game`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };
  const banner = won
    ? { pill: `💸 SURVIVED ${days} ${dayWord} 💸`, pillCls: "border-[#00C805] bg-[#00C805]/20 text-[#00C805]", h1: `${days} ${dayWord}`, sub: stats.outcome === "shutdown" ? "The health inspector finally caught up with you." : `Day ${days + 1}'s rent was too steep. You had a good run.` }
    : stats.outcome === "shutdown"
      ? { pill: "🚨 SHUT DOWN BY THE HEALTH INSPECTOR 🚨", pillCls: "border-[#EF4444] bg-[#EF4444]/20 text-[#EF4444]", h1: "SHUT DOWN", sub: "He walked in on Day 1. He saw everything. He left crying." }
      : { pill: "🚨 EVICTION NOTICE 🚨", pillCls: "border-[#EF4444] bg-[#EF4444]/20 text-[#EF4444]", h1: "EVICTED", sub: `Couldn't make Day 1 rent. The landlord has changed the locks.` };
  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${kitchenBg})`, backgroundSize: "cover", filter: won ? "blur(4px)" : "blur(4px) hue-rotate(-20deg)" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/85 via-[#2E1065]/70 to-[#09090B]" />
      {won && <CoinRain />}
      {won && <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,200,5,0.22),transparent_70%)]" />}
      <div className="relative mx-auto max-w-3xl px-6 py-12">
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className={`inline-block rounded-full border-2 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] ${won ? "" : "animate-pulse"} ${banner.pillCls}`}
          >
            {banner.pill}
          </motion.div>
          <motion.h1
            initial={{ scale: won ? 0.3 : 0.8, opacity: 0, rotate: won ? -6 : 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
            className={`mt-3 [font-family:'Bungee','Impact',sans-serif] text-5xl leading-none drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] md:text-7xl ${won ? "text-[#00C805] drop-shadow-[0_0_35px_rgba(0,200,5,0.7)]" : "text-[#FACC15]"}`}
          >
            {won && <span className="mr-2">🏆</span>}{banner.h1}
          </motion.h1>
          <p className="mt-2 text-sm uppercase tracking-widest text-white/70">{banner.sub}</p>
          {/* Total banked */}
          <div className="mx-auto mt-4 max-w-md rounded-lg border-2 border-[#22D3EE]/50 bg-[#09090B]/60 px-4 py-2 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Total banked · </span>
            <span className="font-display text-lg text-[#FACC15]">${stats.score.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border-2 border-[#7C3AED] bg-[#09090B]/70 p-5 backdrop-blur">
            <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#EC4899]">SHIFT REPORT</div>
            <ResultRow label="Days Survived" value={days} good={won} big />
            <ResultRow label="Total Banked" value={`$${stats.score.toLocaleString()}`} good />
            <ResultRow label="Orders Completed" value={stats.ordersCompleted} good />
            <ResultRow label="Orders Failed" value={stats.ordersFailed} />
            <ResultRow label="Food Burned" value={stats.foodBurned} />
            <ResultRow label="Fires Endured" value={stats.fires} />
            <ResultRow label="Pigeons Chased" value={stats.pigeonsChased} good />
            <ResultRow label="Ingredients Dropped" value={stats.dropped} />
            <div className="my-3 h-px bg-white/20" />
            <ResultRow label="Bird Bucks Earned" value={`+${stats.birdBucks}${won ? " (WIN BONUS +150)" : ""}`} good />
            <ResultRow label="Personal Best" value={stats.best.toLocaleString()} />
          </div>
          <div className={`flex flex-col items-center justify-center rounded-xl border-2 bg-[#2E1065]/70 p-6 text-center backdrop-blur ${won ? "border-[#00C805]" : "border-[#FACC15]"}`}>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#FACC15]">RESTAURANT GRADE</div>
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 11, delay: 0.45 }}
              className={`mt-2 [font-family:'Bungee','Impact',sans-serif] text-[140px] leading-none ${won ? "text-[#00C805] drop-shadow-[0_0_30px_rgba(0,200,5,0.6)]" : "text-[#EF4444] drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]"}`}
            >
              {stats.grade}
            </motion.div>
            <div className="mt-2 text-xs font-black uppercase tracking-widest text-white">{stats.gradeSub}</div>
          </div>
        </div>

        <FlexCard stats={stats} rank={rank} />

        <PayrollSubmit stats={stats} onRank={setRank} />

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={onReplay} className="inline-flex items-center gap-2 rounded-lg border-4 border-[#FACC15] bg-[#FACC15] px-5 py-3 text-sm font-black uppercase tracking-widest text-[#09090B] shadow-[0_6px_0_#B08807] hover:-translate-y-0.5 active:translate-y-0.5">
            <Zap className="h-4 w-4" /> Clock In Again
          </button>
          <button onClick={share} className="inline-flex items-center gap-2 rounded-lg border-2 border-[#22D3EE] bg-[#22D3EE]/10 px-5 py-3 text-sm font-black uppercase tracking-widest text-[#22D3EE] hover:bg-[#22D3EE]/25">
            <Trophy className="h-4 w-4" /> Share as Text
          </button>
          <button onClick={onQuit} className="inline-flex items-center gap-2 rounded-lg border-2 border-[#EC4899] bg-[#EC4899]/10 px-5 py-3 text-sm font-black uppercase tracking-widest text-[#EC4899] hover:bg-[#EC4899]/25">
            <ArrowLeft className="h-4 w-4" /> Return to Restaurant
          </button>
        </div>
      </div>
    </div>
  );
}

// Celebratory coin + confetti rain for a winning shift
function CoinRain() {
  const bits = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i % 10) * 0.22,
        dur: 2.6 + (i % 5) * 0.5,
        glyph: i % 3 === 0 ? "💵" : i % 3 === 1 ? "🪙" : "💰",
        rot: (i % 2 ? 1 : -1) * (180 + (i % 4) * 90),
        size: 18 + (i % 4) * 6,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute top-[-8%] select-none"
          style={{ left: `${b.left}%`, fontSize: b.size }}
          initial={{ y: "-10vh", rotate: 0, opacity: 0 }}
          animate={{ y: "115vh", rotate: b.rot, opacity: [0, 1, 1, 0.9] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "linear" }}
        >
          {b.glyph}
        </motion.span>
      ))}
    </div>
  );
}

/* ─────────────────────────  $BRGR PAYROLL (leaderboard)  ───────────────────────── */

function PayrollSubmit({ stats, onRank }: { stats: GameStats; onRank?: (r: number) => void }) {
  const [name, setName] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem("bb_lb_name") || "" : ""));
  const [wallet, setWallet] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem("bb_lb_wallet") || "" : ""));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ rank: number; week: string; top: LbEntry[] } | null>(null);

  const submit = async () => {
    setErr("");
    if (name.trim().length < 2) { setErr("Give the payroll department a name (2+ characters)."); return; }
    setBusy(true);
    try {
      window.localStorage.setItem("bb_lb_name", name.trim());
      window.localStorage.setItem("bb_lb_wallet", wallet.trim());
      const r = await submitScore({ data: { name: name.trim(), wallet: wallet.trim(), score: stats.score, won: stats.daysSurvived >= 1, days: stats.daysSurvived } });
      setResult(r);
      onRank?.(r.rank);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payroll machine is jammed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border-2 border-[#00C805]/60 bg-[#09090B]/70 p-5 backdrop-blur">
      <div className="mb-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#00C805]">💸 $BRGR PAYROLL — {PAYROLL.season}</div>
      {!result ? (
        <>
          <p className="mb-3 text-xs text-white/70">
            Clock your <b className="text-white">${stats.score.toLocaleString()}</b> shift onto the weekly leaderboard. Top 3 birds each week earn $BRGR back-pay when the token launches.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={16}
              placeholder="Employee name"
              className="w-40 rounded-md border-2 border-[#7C3AED]/60 bg-[#09090B] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#FACC15] focus:outline-none"
            />
            <input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x wallet for back-pay (optional)"
              className="min-w-[260px] flex-1 rounded-md border-2 border-[#7C3AED]/60 bg-[#09090B] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#FACC15] focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={busy}
              className="rounded-md border-2 border-[#00C805] bg-[#00C805]/15 px-5 py-2 text-sm font-black uppercase tracking-widest text-[#00C805] hover:bg-[#00C805]/30 disabled:opacity-50"
            >
              {busy ? "Filing…" : "Clock It In"}
            </button>
          </div>
          {err && <div className="mt-2 text-xs font-bold text-[#EF4444]">{err}</div>}
          <div className="mt-2 text-[9px] uppercase tracking-wider text-white/40">{PAYROLL.disclaimers[0]}</div>
        </>
      ) : (
        <div>
          <div className="text-sm font-black text-white">
            Filed! You're <span className="text-[#FACC15]">#{result.rank}</span> this week ({result.week}).
            {result.rank <= 3 && <span className="ml-2 text-[#00C805]">CURRENTLY IN THE MONEY 💰</span>}
          </div>
          <LeaderboardList top={result.top} highlight={name.trim()} />
        </div>
      )}
    </div>
  );
}

function LeaderboardList({ top, highlight }: { top: LbEntry[]; highlight?: string }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="mt-3 space-y-1">
      {top.map((e, i) => (
        <div
          key={e.n + e.w + i}
          className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${i < 3 ? "bg-[#FACC15]/10" : "bg-white/5"} ${highlight && e.n.toLowerCase() === highlight.toLowerCase() ? "ring-1 ring-[#00C805]" : ""}`}
        >
          <span className="w-7 shrink-0 text-center font-black text-white/70">{medals[i] ?? `#${i + 1}`}</span>
          <span className="flex-1 truncate font-bold text-white">{e.n}</span>
          {e.d ? <span className="rounded bg-[#7C3AED]/30 px-1 text-[8px] font-black uppercase text-[#C4B5FD]">{e.d}d</span> : null}
          <span className="font-black text-[#FACC15]">${e.s.toLocaleString()}</span>
        </div>
      ))}
      {top.length === 0 && <div className="text-xs text-white/50">Nobody has clocked in this week. The #1 spot is free real estate.</div>}
    </div>
  );
}

function PayrollPanel() {
  const [data, setData] = useState<{ week: string; top: LbEntry[]; total: number } | null>(null);
  useEffect(() => {
    getLeaderboard().then(setData).catch(() => {});
  }, []);
  return (
    <div className="mt-5 max-w-md rounded-lg border-2 border-[#00C805]/50 bg-[#09090B]/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#00C805]">💸 Weekly $BRGR Payroll</span>
        {data && <span className="text-[9px] uppercase tracking-wider text-white/50">{data.week} · {data.total} employees</span>}
      </div>
      <div className="mb-2 grid grid-cols-3 gap-1.5 text-center">
        {PAYROLL.prizes.map((pr) => (
          <div key={pr.place} className="rounded border border-[#FACC15]/40 bg-[#FACC15]/5 p-1.5">
            <div className="text-[9px] font-black uppercase text-[#FACC15]">{pr.place}</div>
            <div className="text-[10px] font-black text-white">{pr.amount}</div>
            <div className="text-[7px] uppercase tracking-wider text-white/50">{pr.title}</div>
          </div>
        ))}
      </div>
      <LeaderboardList top={(data?.top ?? []).slice(0, 5)} />
      <div className="mt-2 text-[8px] uppercase leading-relaxed tracking-wider text-white/40">
        {PAYROLL.workerAirdrop} · {PAYROLL.disclaimers[0]}
      </div>
    </div>
  );
}

function ResultRow({ label, value, good, big }: { label: string; value: string | number; good?: boolean; big?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/10 py-1.5 last:border-0">
      <span className="text-[11px] uppercase tracking-widest text-white/70">{label}</span>
      <span className={`font-black ${big ? "[font-family:'Bungee','Impact',sans-serif] text-2xl text-[#FACC15]" : good ? "text-[#00C805]" : "text-white"}`}>{value}</span>
    </div>
  );
}
