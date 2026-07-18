import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Trophy, Zap, ArrowLeft, Play, Users, HelpCircle, Volume2, VolumeX } from "lucide-react";
import kitchenBg from "@/assets/game-kitchen.jpg";
import mascotHero from "@/assets/bird-mascot.png.asset.json";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Bird Burger: Kitchen Chaos — Play the Game" },
      { name: "description", content: "Serve absurd meals, extinguish fryer fires, and survive the worst shift on the blockchain. Play Bird Burger: Kitchen Chaos free in your browser." },
      { property: "og:title", content: "Bird Burger: Kitchen Chaos" },
      { property: "og:description", content: "The worst shift on the blockchain. Play free in your browser." },
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

type StationKind = "fridge" | "cutting" | "raw_patty" | "cheese" | "sauce" | "grill" | "fryer" | "drink" | "assembly" | "pickup" | "extinguisher";

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
  { id: "extinguisher", kind: "extinguisher", x: 0.725, y: 0.605, w: 0.040, h: 0.070, label: "EXT.", color: "#EF4444" },
];

/* ─────────────────────────  ORDER RECIPES  ───────────────────────── */

type OrderTemplate = { name: string; items: Ing[]; time: number; score: number; emoji: string };

const ORDER_POOL: OrderTemplate[] = [
  { name: "McRug Pull", items: ["bun", "patty_cooked", "sauce"], time: 55, score: 220, emoji: "🍔" },
  { name: "Liquidity Fries", items: ["fries", "sauce"], time: 45, score: 160, emoji: "🍟" },
  { name: "Pump & Shake", items: ["shake"], time: 40, score: 120, emoji: "🥤" },
  { name: "Chudburger Deluxe", items: ["bun", "patty_cooked", "patty_cooked", "cheese", "sauce"], time: 80, score: 380, emoji: "🍔" },
  { name: "Diamond Nuggets", items: ["nugget", "sauce"], time: 50, score: 200, emoji: "🍗" },
  { name: "Exit Combo", items: ["bun", "patty_cooked", "cheese", "fries", "shake"], time: 95, score: 460, emoji: "🥡" },
  { name: "Paper Hands Meal", items: ["bun", "patty_cooked", "lettuce_chopped"], time: 60, score: 240, emoji: "🥪" },
  { name: "Nothing Burger", items: ["bun"], time: 30, score: 90, emoji: "🍞" },
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

const EMPLOYEES = [
  { id: "larry", name: "Larry", tint: "#C4A9F5", desc: "Tired. Always tired." },
  { id: "frycook", name: "FryCook420", tint: "#22D3EE", desc: "Wears shades indoors." },
  { id: "diamond", name: "Diamond Dave", tint: "#FACC15", desc: "Never sells." },
  { id: "pete", name: "Paper Hands Pete", tint: "#EC4899", desc: "Drops everything." },
  { id: "gary", name: "Manager Gary", tint: "#00C805", desc: "Reluctantly here." },
];

/* ─────────────────────────  COMPONENT  ───────────────────────── */

function GamePage() {
  const [phase, setPhase] = useState<Phase>("start");
  const [employee, setEmployee] = useState(EMPLOYEES[0]);
  const [showHelp, setShowHelp] = useState(false);
  const [muted, setMuted] = useState(true);
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <TopBar muted={muted} setMuted={setMuted} />
      <AnimatePresence mode="wait">
        {phase === "start" && (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StartScreen
              employee={employee}
              setEmployee={setEmployee}
              onStart={() => setPhase("playing")}
              onHelp={() => setShowHelp(true)}
            />
          </motion.div>
        )}
        {phase === "playing" && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameScreen
              employee={employee}
              muted={muted}
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
      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
    </div>
  );
}

/* ─────────────────────────  TOP BAR  ───────────────────────── */

function TopBar({ muted, setMuted }: { muted: boolean; setMuted: (v: boolean) => void }) {
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
        <button
          onClick={() => setMuted(!muted)}
          className="grid h-9 w-9 place-items-center rounded border border-[#7C3AED]/40 bg-[#2E1065]/60 text-[#C4A9F5] hover:bg-[#7C3AED]/30"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

/* ─────────────────────────  START SCREEN  ───────────────────────── */

function StartScreen({ employee, setEmployee, onStart, onHelp }: {
  employee: typeof EMPLOYEES[number];
  setEmployee: (e: typeof EMPLOYEES[number]) => void;
  onStart: () => void;
  onHelp: () => void;
}) {
  const [showEmp, setShowEmp] = useState(false);
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
          <p className="mt-3 max-w-md text-sm text-white/70">
            Cook absurd meals, extinguish fryer fires, chase pigeons, and try to survive three minutes at the greasiest kitchen in Web3.
          </p>
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
        </div>
        <div className="relative mx-auto">
          <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-72 w-72 rounded-full bg-[#7C3AED]/40 blur-3xl" />
          <motion.img
            src={mascotHero.url}
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
              <div className="grid h-16 w-16 place-items-center rounded-full" style={{ background: `radial-gradient(${e.tint}, transparent 70%)` }}>
                <img src={mascotHero.url} alt="" width={64} height={64} className="h-14 w-14 object-contain" style={{ filter: `hue-rotate(${hueFor(e.tint)}deg)` }} />
              </div>
              <div className="mt-2 text-xs font-black uppercase tracking-widest text-white">{e.name}</div>
              <div className="mt-1 text-[9px] uppercase tracking-widest text-white/60">{e.desc}</div>
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

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-xl border-2 border-[#EC4899] bg-[#2E1065] p-6">
        <h3 className="mb-3 [font-family:'Bungee','Impact',sans-serif] text-2xl text-[#EC4899]">HOW TO PLAY</h3>
        <ul className="space-y-2 text-sm text-white/85">
          <li><b className="text-[#FACC15]">WASD / Arrows</b> — Move Larry around the kitchen</li>
          <li><b className="text-[#FACC15]">SHIFT</b> — Dash (short burst of speed)</li>
          <li><b className="text-[#FACC15]">SPACE / E</b> — Interact with the nearest station</li>
          <li><b className="text-[#FACC15]">Q</b> — Drop what you're carrying</li>
          <li className="pt-2 text-white/70">Pick up buns, cook patties on the grill, chop lettuce at the cutting board, fry fries at the fryer. Assemble the meal in your hands and drop it at <b className="text-[#EC4899]">PICK UP</b>.</li>
          <li className="text-white/70">Fires break out at the fryer — grab the extinguisher and interact with the flames to put them out.</li>
          <li className="text-white/70">Pigeons will steal food. Run into them to scare them off.</li>
        </ul>
        <button onClick={onClose} className="mt-4 w-full rounded border-2 border-[#FACC15] bg-[#FACC15]/20 py-2 text-xs font-black uppercase tracking-widest text-[#FACC15] hover:bg-[#FACC15]/40">Got it</button>
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
      master.gain.value = 0.55;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 22;
      comp.ratio.value = 6;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;
      master.connect(comp).connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      compRef.current = comp;
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume().catch(() => {});
    return ctxRef.current;
  }, []);

  useEffect(() => {
    if (masterRef.current) masterRef.current.gain.value = muted ? 0 : 0.55;
  }, [muted]);

  useEffect(() => () => { try { ctxRef.current?.close(); } catch {} }, []);

  const rateOk = (key: string, minGap: number) => {
    const now = performance.now();
    const last = lastRef.current[key] || 0;
    if (now - last < minGap) return false;
    lastRef.current[key] = now;
    return true;
  };

  const hop = useCallback((intensity = 1) => {
    if (muted) return;
    const ctx = ensure(); if (!ctx || !masterRef.current) return;
    if (!rateOk("hop", 55)) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    const base = 320 + Math.random() * 60;
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 1.9, t + 0.06);
    const g = ctx.createGain();
    const peak = Math.min(0.28, 0.18 * intensity);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.11);
    osc.connect(g).connect(masterRef.current);
    osc.start(t); osc.stop(t + 0.13);
  }, [muted, ensure]);

  const land = useCallback((intensity = 1) => {
    if (muted) return;
    const ctx = ensure(); if (!ctx || !masterRef.current) return;
    if (!rateOk("land", 45)) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.09);
    const g = ctx.createGain();
    const peak = Math.min(0.34, 0.22 * intensity);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.14);
    osc.connect(g).connect(masterRef.current);
    const bufLen = Math.floor(ctx.sampleRate * 0.09);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
    const ng = ctx.createGain(); ng.gain.value = Math.min(0.18, 0.12 * intensity);
    noise.connect(hp).connect(ng).connect(masterRef.current);
    osc.start(t); osc.stop(t + 0.16);
    noise.start(t); noise.stop(t + 0.1);
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

  return { hop, land, boom, ensure };
}

function GameScreen({ employee, muted, onEnd, onQuit }: {
  employee: typeof EMPLOYEES[number];
  muted: boolean;
  onEnd: (s: GameStats) => void;
  onQuit: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const mascotImgRef = useRef<HTMLImageElement | null>(null);
  const sfx = useGameSfx(muted);
  const sfxRef = useRef(sfx);
  useEffect(() => { sfxRef.current = sfx; }, [sfx]);
  // Resume AudioContext on first user gesture (autoplay policy)
  useEffect(() => {
    const kick = () => { sfxRef.current.ensure(); };
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
  const ordersRef = useRef<Order[]>([]);
  const orderIdRef = useRef(1);
  const firesRef = useRef<Fire[]>([]);
  const pigeonsRef = useRef<Pigeon[]>([]);
  const spillsRef = useRef<Spill[]>([]);
  const floatsRef = useRef<FloatText[]>([]);
  const hasExtinguisherRef = useRef(false);
  const grillRef = useRef({ progress: 0, item: null as Ing | null });
  const fryerRef = useRef({ progress: 0, item: null as Ing | null });
  const minimapRef = useRef<HTMLDivElement | null>(null);
  const shakeRef = useRef(0); // seconds remaining
  const explosionRef = useRef(0); // 0..1 flash intensity remaining
  const viceRef = useRef({ smokeCd: 0, drinkCd: 0, buzz: 0 });
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
  // Perf mode — caps particles + throttles flashes when the kitchen gets busy
  const perfRef = useRef({
    mode: (typeof localStorage !== "undefined" && (localStorage.getItem("bb_perf") as any)) || "auto", // "auto" | "low" | "high"
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
  const timeRef = useRef(180);

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
    m.src = mascotHero.url;
    m.onload = () => { mascotImgRef.current = m; };
  }, []);

  // Seed orders
  useEffect(() => {
    ordersRef.current = [];
    for (let i = 0; i < 4; i++) spawnOrder();
    setTick((t) => t + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function spawnOrder() {
    const t = ORDER_POOL[Math.floor(Math.random() * ORDER_POOL.length)];
    ordersRef.current.push({ id: orderIdRef.current++, template: t, remaining: t.time });
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
      carryRef.current = [];
      return;
    }
    const order = ordersRef.current[idx];
    const timeBonus = Math.max(0, Math.floor(order.remaining * 2));
    const gain = order.template.score + timeBonus;
    scoreRef.current += gain;
    setScore(scoreRef.current);
    statsRef.current.ordersCompleted++;
    pushFloat(`+${gain}`, "#00C805");
    ordersRef.current.splice(idx, 1);
    carryRef.current = [];
    // spawn a new one
    setTimeout(() => { spawnOrder(); setTick((t) => t + 1); }, 400);
    setTick((t) => t + 1);
  }

  function interact() {
    // Clean grease spill if standing on one with empty hands
    const p = playerRef.current;
    const spillHit = spillsRef.current.find((sp) => Math.hypot(p.x - sp.x, p.y - sp.y) < sp.r + 0.01);
    if (spillHit && carryRef.current.length === 0) {
      spillHit.cleanT += 0.34;
      if (spillHit.cleanT >= 1) {
        spillsRef.current = spillsRef.current.filter((sp) => sp !== spillHit);
        scoreRef.current += 40;
        setScore(scoreRef.current);
        chaosRef.current = Math.max(0, chaosRef.current - 0.4);
        pushFloat("+ MOPPED", "#22D3EE");
      } else {
        pushFloat("MOPPING…", "#22D3EE");
      }
      return;
    }
    const s = nearestStation();
    if (!s) return;
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
          pushFloat("+ COOKED", "#7C3A1F");
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
          f.item = "fries";
          f.progress = 0;
          pushFloat("FRYING…", "#FACC15");
        } else if (f.progress >= 1) {
          if (carry.length >= 4) return pushFloat("HANDS FULL", "#EF4444");
          carry.push(f.item === "fries" ? "fries" : "nugget");
          f.item = null;
          f.progress = 0;
          pushFloat("+ FRIES", "#FFD24A");
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
      const mag = Math.hypot(dx, dy);
      if (mag > 0) { dx /= mag; dy /= mag; }
      const dashing = (k["shift"] || false) && p.dashCd <= 0 && mag > 0;
      const speed = dashing ? 0.55 : 0.28;
      if (dashing) p.dashCd = 1.2;
      p.dashCd = Math.max(0, p.dashCd - dt);
      // slip if in grease
      if (p.slipT > 0) { p.slipT -= dt; }
      p.vx = dx * speed; p.vy = dy * speed;
      p.x = clamp(p.x + dx * speed * dt, 0.02, 0.98);
      p.y = clamp(p.y + dy * speed * dt, 0.10, 0.96);
      // Grease spills: overlapping puddle → boost slipT (drunk-like slide)
      for (const sp of spillsRef.current) {
        if (Math.hypot(p.x - sp.x, p.y - sp.y) < sp.r) {
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
          // Small crisp pixel-flash at the pivot point (skipped under perf pressure)
          if (scale2 > 0.55 || Math.random() < scale2) {
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
        // Flash: skip probabilistically when perf-mode is reducing effects
        if (scale > 0.55 || Math.random() < scale) {
          particlesRef.current.push({ x: fx, y: fy, vx: 0, vy: 0, life: 0, max: 0.18, size: (dashing ? 22 : 16) * (0.7 + 0.3 * scale), color: "#FFF6C2", kind: "flash" });
        }
        p.landT = dashing ? 0.16 : 0.13;
        sfxRef.current.land(dashing ? 1.2 : 0.85);
      }
      lastHopSinRef.current = curSin;
      p.landT = Math.max(0, p.landT - dt);
      if (mag <= 0) p.idleT += dt; else p.idleT = 0;

      // Grill cooking
      const g = grillRef.current;
      if (g.item === "patty_raw") {
        g.progress += dt / 5;
        if (g.progress >= 1) { g.item = "patty_cooked"; }
      } else if (g.item === "patty_cooked") {
        g.progress += dt / 8;
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
        f.progress += dt / 4;
        if (f.progress > 2) {
          f.item = null; f.progress = 0;
          statsRef.current.foodBurned++;
        }
      }

      // Fires + mishaps
      fireCd -= dt;
      if (fireCd <= 0) {
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
            sfxRef.current.boom(1.1);
            floatsRef.current.push({ x: st.x + st.w/2, y: st.y - 0.02, text: "💥 BOOM!", color: "#FACC15", life: 1.2 });
            floatsRef.current.push({ x: playerRef.current.x, y: playerRef.current.y - 0.04, text: "OSHA WHO?", color: "#EF4444", life: 1.2 });
          }
        }
        fireCd = (explode ? 14 : 10) + Math.random() * 10;
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
      // Grease spills: random splatters near cook stations
      spillCd -= dt;
      if (spillCd <= 0 && spillsRef.current.length < 6) {
        const near = Math.random() < 0.7
          ? STATIONS.find((s) => s.id === (Math.random() < 0.5 ? "grill" : "fryer"))!
          : STATIONS[Math.floor(Math.random() * STATIONS.length)];
        const ang = Math.random() * Math.PI * 2;
        const rad = 0.05 + Math.random() * 0.1;
        spillsRef.current.push({
          x: clamp(near.x + near.w/2 + Math.cos(ang) * rad, 0.05, 0.95),
          y: clamp(near.y + near.h/2 + Math.sin(ang) * rad, 0.14, 0.94),
          r: 0.03 + Math.random() * 0.025,
          life: 22 + Math.random() * 10,
          cleanT: 0,
          hue: Math.random() < 0.5 ? 42 : 30,
          wob: Math.random() * Math.PI * 2,
        });
        spillCd = 7 + Math.random() * 8;
      }
      // spill decay: shrink slowly + expire
      spillsRef.current.forEach((sp) => { sp.life -= dt; sp.cleanT = Math.max(0, sp.cleanT - dt * 0.15); });
      spillsRef.current = spillsRef.current.filter((sp) => sp.life > 0);

      // ─── KITCHEN DISASTERS ───
      disasterCd -= dt;
      if (disasterCd <= 0) {
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
        disasterCd = 14 + Math.random() * 12;
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
      if (pigeonCd <= 0) {
        pigeonsRef.current.push({ x: -0.05, y: 0.5 + (Math.random() - 0.5) * 0.4, vx: 0.08 + Math.random()*0.05, vy: (Math.random() - 0.5) * 0.05, hp: 1 });
        pigeonCd = 12 + Math.random() * 10;
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
          floatsRef.current.push({ x: pg.x, y: pg.y - 0.02, text: "SHOO!", color: "#22D3EE", life: 1 });
        }
      });
      pigeonsRef.current = pigeonsRef.current.filter((pg) => pg.hp > 0 && pg.x < 1.1);

      // Orders countdown
      orderTickAcc += dt;
      if (orderTickAcc > 1) {
        orderTickAcc = 0;
        ordersRef.current.forEach((o) => { o.remaining -= 1; });
        const failed = ordersRef.current.filter((o) => o.remaining <= 0);
        if (failed.length) {
          statsRef.current.ordersFailed += failed.length;
          chaosRef.current = Math.min(6, chaosRef.current + failed.length);
          ordersRef.current = ordersRef.current.filter((o) => o.remaining > 0);
          failed.forEach(() => spawnOrder());
        }
      }

      // Floats
      floatsRef.current.forEach((fl) => { fl.life -= dt; fl.y -= dt * 0.05; });
      floatsRef.current = floatsRef.current.filter((fl) => fl.life > 0);

      // Timer
      timeRef.current -= dt;
      if (timeRef.current <= 0) {
        cancelAnimationFrame(raf);
        finishGame();
        return;
      }

      // React state sync every ~0.25s
      uiTickAcc += dt;
      if (uiTickAcc > 0.2) {
        uiTickAcc = 0;
        setTimeLeft(Math.max(0, Math.ceil(timeRef.current)));
        setScore(scoreRef.current);
        setChaos(chaosRef.current);
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

  function finishGame() {
    const s = statsRef.current;
    const total = scoreRef.current;
    const newBest = Math.max(best, total);
    if (typeof window !== "undefined") window.localStorage.setItem("bb_kc_best", String(newBest));
    // Grade
    const grade = gradeFor(total);
    const bucks = Math.floor(total / 10) + s.ordersCompleted * 5;
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

    // Station highlight rings
    const near = nearestStation();
    for (const s of STATIONS) {
      const cx = (s.x + s.w/2) * W;
      const cy = (s.y + s.h/2) * H;
      const r = Math.max(s.w, s.h) * W * 0.55;
      const active = near?.id === s.id;
      ctx.save();
      ctx.strokeStyle = active ? "#FACC15" : s.color + "88";
      ctx.lineWidth = active ? 4 : 2;
      ctx.setLineDash(active ? [] : [6, 6]);
      ctx.shadowColor = s.color;
      ctx.shadowBlur = active ? 24 : 8;
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
      const rx = sp.r * W * 1.15;
      const ry = sp.r * H * 0.75;
      const fade = Math.min(1, sp.life / 4) * (1 - sp.cleanT);
      ctx.save();
      // dark oily body
      ctx.globalAlpha = 0.72 * fade;
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(rx, ry));
      grad.addColorStop(0, `hsl(${sp.hue}, 55%, 18%)`);
      grad.addColorStop(0.7, `hsl(${sp.hue}, 45%, 10%)`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // glossy highlight streak
      ctx.globalAlpha = 0.55 * fade;
      ctx.fillStyle = `hsl(${sp.hue}, 95%, 68%)`;
      const gx = cx - rx * 0.35 + Math.sin(performance.now() / 700 + sp.wob) * 2;
      const gy = cy - ry * 0.35;
      ctx.beginPath();
      ctx.ellipse(gx, gy, rx * 0.32, ry * 0.18, -0.5, 0, Math.PI * 2);
      ctx.fill();
      // little droplets around edge
      ctx.globalAlpha = 0.5 * fade;
      ctx.fillStyle = `hsl(${sp.hue}, 60%, 22%)`;
      for (let i = 0; i < 4; i++) {
        const a = sp.wob + i * 1.7;
        const dx = Math.cos(a) * rx * 1.15;
        const dy = Math.sin(a) * ry * 1.15;
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 2 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
      // cleaning progress ring
      if (sp.cleanT > 0.01) {
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = "#22D3EE";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(rx, ry) + 4, -Math.PI / 2, -Math.PI / 2 + sp.cleanT * Math.PI * 2);
        ctx.stroke();
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
      // flames
      for (let i = 0; i < 5; i++) {
        const tt = Math.sin(performance.now()/120 + i) * 6;
        ctx.fillStyle = i % 2 ? "#FACC15" : "#EF4444";
        ctx.beginPath();
        ctx.arc(cx + (i-2)*10, cy + tt - 10, 12 - i*1.2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`🔥 ${fi.danger.toFixed(1)}s`, cx, cy + 30);
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

    // Pigeons
    for (const pg of pigeonsRef.current) {
      const cx = pg.x * W, cy = pg.y * H;
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
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(cx+4, cy-4, 2, 0, Math.PI*2);
      ctx.fill();
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

    // Dash smear trail (short, crisp silhouettes — not motion blur)
    {
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
        const size = 76;
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
          ctx.drawImage(mm, s.x - size / 2, s.y - size + 16 + s.hopY, size, size);
          // tint pass to flatten detail into a silhouette
          ctx.globalCompositeOperation = "source-atop";
          ctx.globalAlpha = alpha * 1.4;
          ctx.fillStyle = employee.tint;
          ctx.fillRect(s.x - size / 2, s.y - size + 16 + s.hopY, size, size);
          ctx.restore();
        }
      }
    }

    const pxs = px + sway;
    const m = mascotImgRef.current;
    if (m) {
      const size = 76;
      // headBobPx adds a subtle 2x-frequency nod on top of hopY; headSwayPx pushes the whole sprite slightly along facing
      const drawY = py - size + 16 + hopY + headBobPx;
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
      ctx.drawImage(m, drawX, drawY, size, size);
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = employee.tint + "40";
      ctx.fillRect(drawX, drawY, size, size);
      ctx.restore();
    } else {
      ctx.fillStyle = employee.tint;
      ctx.beginPath();
      ctx.arc(pxs, py + hopY, 18, 0, Math.PI*2);
      ctx.fill();
    }
    // Name tag (follows hop)
    const tagY = py - 78 + hopY;
    ctx.fillStyle = "#7C3AED";
    ctx.fillRect(pxs - 42, tagY, 84, 18);
    ctx.strokeStyle = "#FACC15";
    ctx.strokeRect(pxs - 42, tagY, 84, 18);
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(employee.name.toUpperCase(), pxs, tagY + 13);

    // Carrying stack
    const carry = carryRef.current;
    if (carry.length) {
      carry.forEach((it, i) => {
        const info = ING_META[it];
        ctx.fillStyle = info.color;
        ctx.beginPath();
        ctx.arc(px + 30 * p.face + i*10*p.face, py - 10 - i*10 + hopY, 8, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
    if (hasExtinguisherRef.current) {
      ctx.fillStyle = "#EF4444";
      ctx.fillRect(px - 32, py - 20, 8, 22);
      ctx.fillStyle = "#000";
      ctx.fillRect(px - 32, py - 24, 8, 4);
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

    // Station labels
    for (const s of STATIONS) {
      const cx = (s.x + s.w/2) * W;
      const cy = (s.y + s.h + 0.01) * H;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      const tw = ctx.measureText(s.label).width + 12;
      ctx.fillRect(cx - tw/2, cy, tw, 16);
      ctx.strokeStyle = s.color;
      ctx.strokeRect(cx - tw/2, cy, tw, 16);
      ctx.fillStyle = s.color;
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(s.label, cx, cy + 12);
    }
    ctx.restore();
    // Explosion flash overlay (drawn without transform)
    if (explosionRef.current > 0) {
      ctx.fillStyle = `rgba(255,220,120,${0.55 * explosionRef.current * M})`;
      ctx.fillRect(0, 0, W, H);
    }
    // Smoke alarm overlay: pulsing red vignette + strobe banner
    if (alarmRef.current.life > 0) {
      const pulse = 0.5 + 0.5 * Math.sin(alarmRef.current.strobe);
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
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="relative mx-auto max-w-[1920px] p-2 md:p-4">
      <div ref={wrapRef} className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border-2 border-[#7C3AED] shadow-[0_0_60px_rgba(124,58,237,0.4)]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Top-left: logo + kitchen stats + disaster */}
        <div className="absolute left-2 top-2 w-[220px] space-y-2 md:left-4 md:top-4">
          <div className="rounded-lg border-2 border-[#7C3AED] bg-[#2E1065]/85 p-2 backdrop-blur">
            <div className="[font-family:'Bungee','Impact',sans-serif] text-sm leading-none text-[#7C3AED]">BIRD BURGER</div>
            <div className="[font-family:'Bungee','Impact',sans-serif] text-xs leading-none text-[#EC4899]">KITCHEN CHAOS</div>
          </div>
          <div className="rounded-lg border-2 border-[#7C3AED]/60 bg-[#09090B]/85 p-2 text-[10px] uppercase tracking-widest backdrop-blur">
            <div className="mb-1 font-black text-[#FACC15]">KITCHEN STATS</div>
            <StatRow label="Completed" value={statsRef.current.ordersCompleted} />
            <StatRow label="Failed" value={statsRef.current.ordersFailed} />
            <StatRow label="Food Burned" value={statsRef.current.foodBurned} />
            <StatRow label="Fires" value={statsRef.current.fires} />
            <StatRow label="Pigeons Chased" value={statsRef.current.pigeonsChased} />
            <StatRow label="Dropped" value={statsRef.current.dropped} />
          </div>
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
          {/* Vices — because the place has 1★ reviews anyway */}
          {(() => {
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
                      floatsRef.current.push({ x: playerRef.current.x, y: playerRef.current.y - 0.04, text: "🍺 CRACK OPEN", color: "#22D3EE", life: 1.3 });
                      setViceTick((n) => n + 1);
                    }}
                    disabled={v.drinkCd > 0}
                    className="relative flex-1 overflow-hidden rounded border-2 border-[#22D3EE]/70 bg-[#22D3EE]/10 px-2 py-1 text-[10px] font-black text-[#22D3EE] transition hover:bg-[#22D3EE]/25 disabled:cursor-not-allowed disabled:opacity-70"
                    title="Crack a cold one. Chaos drops. So does your motor control."
                  >
                    <div className="absolute inset-y-0 left-0 bg-[#22D3EE]/25 transition-[width] duration-200" style={{ width: `${beerPct * 100}%` }} />
                    <span className="relative">🍺 {v.drinkCd > 0 ? `${v.drinkCd.toFixed(1)}s` : "BEER"}</span>
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
        </div>


        {/* Top: order queue */}
        <div className="pointer-events-none absolute inset-x-0 top-2 mx-auto flex max-w-[62%] justify-center gap-2 md:top-4">
          {ordersRef.current.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>

        {/* Top-right: time / score / bucks */}
        <div className="absolute right-2 top-2 flex flex-col gap-2 md:right-4 md:top-4">
          <div className="flex gap-2">
            <InfoCard title="TIME" value={fmt(timeLeft)} sub="ROUND 1" tint="#FACC15" wide />
            <InfoCard title="SCORE" value={score.toLocaleString()} sub={`BEST: ${Math.max(best, score).toLocaleString()}`} tint="#22D3EE" wide />
            <InfoCard title="BIRD BUCKS" value={Math.floor(score/10).toLocaleString()} sub="COMPLETELY WORTHLESS" tint="#EC4899" wide />
          </div>
          <button onClick={onQuit} className="self-end rounded border border-[#EF4444] bg-[#EF4444]/20 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#EF4444] hover:bg-[#EF4444]/40">Clock Out</button>
        </div>

        {/* Bottom-left: minimap (fades when player walks over it) */}
        <div
          ref={minimapRef}
          className="absolute bottom-2 left-2 h-[110px] w-[160px] rounded-lg border-2 border-[#7C3AED] bg-[#09090B]/80 p-1 backdrop-blur transition-opacity duration-150 md:bottom-4 md:left-4"
        >
          <div className="mb-0.5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-[#EC4899]"><span>PIGEON MENACE</span><span className="text-[#FACC15]">MAP</span></div>
          <Minimap
            player={playerRef.current}
            fires={firesRef.current}
            pigeons={pigeonsRef.current}
          />
        </div>

        {/* Bottom-right: controls + chaos */}
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-2 md:bottom-4 md:right-4">
          {!showTouch && (
            <div className="hidden rounded-lg border-2 border-[#7C3AED]/50 bg-[#09090B]/85 p-2 text-[10px] uppercase tracking-widest backdrop-blur md:block">
              <div className="mb-1 font-black text-[#FACC15]">CONTROLS</div>
              <KeyRow keyLabel="WASD" action="Move" />
              <KeyRow keyLabel="SPACE/E" action="Interact" />
              <KeyRow keyLabel="SHIFT" action="Dash" />
              <KeyRow keyLabel="Q" action="Drop" />
            </div>
          )}
          <div className="rounded-lg border-2 border-[#EF4444]/60 bg-[#09090B]/85 p-2 text-[10px] uppercase tracking-widest backdrop-blur">
            <div className="mb-1 font-black text-[#EF4444]">CHAOS LEVEL</div>
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={`text-lg leading-none ${i < Math.floor(chaos) ? "" : "grayscale opacity-30"}`}>🔥</span>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile touch controls */}
        {showTouch && <TouchControls touchRef={touchRef} onInteract={interact} onDrop={dropCarry} />}
      </div>
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
function gradeFor(score: number): { letter: string; sub: string } {
  if (score >= 4000) return { letter: "S", sub: "MICHELIN INSPECTOR CONFUSED" };
  if (score >= 2500) return { letter: "A", sub: "MILDLY EDIBLE" };
  if (score >= 1500) return { letter: "B", sub: "TECHNICALLY LEGAL" };
  if (score >= 700) return { letter: "C", sub: "HEALTH CODE VIOLATION" };
  if (score >= 200) return { letter: "D", sub: "TOTAL RUG PULL" };
  return { letter: "F", sub: "CLOSED BY AUTHORITIES" };
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

function OrderCard({ order }: { order: Order }) {
  const t = order.remaining;
  const total = order.template.time;
  const pct = clamp(t / total, 0, 1);
  const urgent = t < 15;
  return (
    <motion.div
      animate={urgent ? { x: [0, -2, 2, -2, 2, 0] } : {}}
      transition={urgent ? { duration: 0.4, repeat: Infinity } : {}}
      className={`pointer-events-auto w-[150px] shrink-0 overflow-hidden rounded-lg border-2 bg-[#FFF7DF] text-[#2E1065] shadow-lg ${urgent ? "border-[#EF4444]" : "border-[#2E1065]"}`}
    >
      <div className="border-b border-[#2E1065]/30 bg-[#2E1065] px-2 py-1 text-center text-[10px] font-black uppercase tracking-widest text-[#FACC15]">
        {order.template.name}
      </div>
      <div className="flex items-center justify-center py-1 text-3xl">{order.template.emoji}</div>
      <div className="flex justify-center gap-0.5 px-1 pb-1">
        {order.template.items.slice(0, 5).map((it, i) => (
          <span key={i} title={ING_META[it].label} className="grid h-5 w-5 place-items-center rounded-full text-[10px]" style={{ background: ING_META[it].color }}>
            {ING_META[it].emoji}
          </span>
        ))}
      </div>
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

function TouchControls({ touchRef, onInteract, onDrop }: { touchRef: React.MutableRefObject<{ dx: number; dy: number } | null>; onInteract: () => void; onDrop: () => void }) {
  const [nub, setNub] = useState({ x: 0, y: 0 });
  const stickRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<number | null>(null);
  const onStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    activeIdRef.current = t.identifier;
  };
  const onMove = (e: React.TouchEvent) => {
    if (!stickRef.current) return;
    const t = Array.from(e.touches).find((tt) => tt.identifier === activeIdRef.current);
    if (!t) return;
    const r = stickRef.current.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const dx = (t.clientX - cx) / (r.width/2);
    const dy = (t.clientY - cy) / (r.height/2);
    const mag = Math.hypot(dx, dy);
    const nx = mag > 1 ? dx/mag : dx;
    const ny = mag > 1 ? dy/mag : dy;
    setNub({ x: nx * 24, y: ny * 24 });
    touchRef.current = { dx: nx, dy: ny };
  };
  const onEnd = () => {
    activeIdRef.current = null;
    setNub({ x: 0, y: 0 });
    touchRef.current = null;
  };
  return (
    <>
      <div
        ref={stickRef}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
        onTouchCancel={onEnd}
        className="absolute bottom-4 left-4 grid h-24 w-24 place-items-center rounded-full border-2 border-[#7C3AED]/60 bg-[#09090B]/60 md:hidden"
      >
        <div className="h-10 w-10 rounded-full bg-[#FACC15]/80" style={{ transform: `translate(${nub.x}px, ${nub.y}px)` }} />
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 md:hidden">
        <button onTouchStart={onInteract} className="h-16 w-16 rounded-full border-4 border-[#FACC15] bg-[#FACC15] text-xs font-black uppercase text-[#09090B]">USE</button>
        <button onTouchStart={onDrop} className="h-12 w-12 rounded-full border-2 border-[#EF4444] bg-[#EF4444]/30 text-[10px] font-black uppercase text-[#EF4444]">DROP</button>
      </div>
    </>
  );
}

/* ─────────────────────────  RESULTS SCREEN  ───────────────────────── */

function ResultsScreen({ stats, onReplay, onQuit }: { stats: GameStats; onReplay: () => void; onQuit: () => void }) {
  const share = () => {
    const text = `I just clocked out of Bird Burger: Kitchen Chaos with ${stats.score} pts (grade ${stats.grade}). ${stats.foodBurned} foods burned. ${stats.fires} fires. ${stats.pigeonsChased} pigeons chased. The worst shift on the blockchain.`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };
  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${kitchenBg})`, backgroundSize: "cover", filter: "blur(4px) hue-rotate(-20deg)" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/85 via-[#2E1065]/70 to-[#09090B]" />
      <div className="relative mx-auto max-w-3xl px-6 py-12">
        <div className="mb-6 text-center">
          <div className="inline-block rounded-full border-2 border-[#EF4444] bg-[#EF4444]/20 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#EF4444] animate-pulse">
            🚨 RESTAURANT CLOSED BY AUTHORITIES 🚨
          </div>
          <h1 className="mt-3 [font-family:'Bungee','Impact',sans-serif] text-4xl leading-none text-[#FACC15] drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] md:text-6xl">
            SHIFT OVER
          </h1>
          <p className="mt-2 text-sm uppercase tracking-widest text-white/70">The bird has stopped screaming. Briefly.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border-2 border-[#7C3AED] bg-[#09090B]/70 p-5 backdrop-blur">
            <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#EC4899]">SHIFT REPORT</div>
            <ResultRow label="Orders Completed" value={stats.ordersCompleted} good />
            <ResultRow label="Orders Failed" value={stats.ordersFailed} />
            <ResultRow label="Food Burned" value={stats.foodBurned} />
            <ResultRow label="Fires Endured" value={stats.fires} />
            <ResultRow label="Pigeons Chased" value={stats.pigeonsChased} good />
            <ResultRow label="Ingredients Dropped" value={stats.dropped} />
            <div className="my-3 h-px bg-white/20" />
            <ResultRow label="Bird Bucks Earned" value={`+${stats.birdBucks}`} good />
            <ResultRow label="Final Score" value={stats.score.toLocaleString()} big />
            <ResultRow label="Personal Best" value={stats.best.toLocaleString()} />
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-[#FACC15] bg-[#2E1065]/70 p-6 text-center backdrop-blur">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#FACC15]">RESTAURANT GRADE</div>
            <div className="mt-2 [font-family:'Bungee','Impact',sans-serif] text-[140px] leading-none text-[#EF4444] drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]">
              {stats.grade}
            </div>
            <div className="mt-2 text-xs font-black uppercase tracking-widest text-white">{stats.gradeSub}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={onReplay} className="inline-flex items-center gap-2 rounded-lg border-4 border-[#FACC15] bg-[#FACC15] px-5 py-3 text-sm font-black uppercase tracking-widest text-[#09090B] shadow-[0_6px_0_#B08807] hover:-translate-y-0.5 active:translate-y-0.5">
            <Zap className="h-4 w-4" /> Clock In Again
          </button>
          <button onClick={share} className="inline-flex items-center gap-2 rounded-lg border-2 border-[#22D3EE] bg-[#22D3EE]/10 px-5 py-3 text-sm font-black uppercase tracking-widest text-[#22D3EE] hover:bg-[#22D3EE]/25">
            <Trophy className="h-4 w-4" /> Share Disaster
          </button>
          <button onClick={onQuit} className="inline-flex items-center gap-2 rounded-lg border-2 border-[#EC4899] bg-[#EC4899]/10 px-5 py-3 text-sm font-black uppercase tracking-widest text-[#EC4899] hover:bg-[#EC4899]/25">
            <ArrowLeft className="h-4 w-4" /> Return to Restaurant
          </button>
        </div>
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
