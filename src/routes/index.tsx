import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Menu as MenuIcon,
  X,
  Wallet,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Copy,
  Printer,
  Share2,
  Flame,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  Star,
  ShoppingBag,
  Bird,
  Sparkles,
  AlertTriangle,
  Zap,
  Trash2,
  Palette,
  Trophy,
  Receipt,
  Download,
} from "lucide-react";
import mascotHero from "@/assets/bird-mascot.png.asset.json";
import kitchenBg from "@/assets/kitchen-bg.jpg";
import kitchenCamImg from "@/assets/kitchen-cam.png.asset.json";
import menuMcrug from "@/assets/menu-mcrug.png.asset.json";
import menuFries from "@/assets/menu-liquidity-fries.png.asset.json";
import menuShake from "@/assets/menu-pump-shake.png.asset.json";
import menuNuggets from "@/assets/menu-diamond-nuggets.png.asset.json";
import menuCombo from "@/assets/menu-exit-combo.png.asset.json";
import menuChud from "@/assets/menu-chudburger.png.asset.json";
import menuKids from "@/assets/menu-paper-hands.png.asset.json";
import menuNothing from "@/assets/menu-nothing-burger.png.asset.json";
import { BB_CONFIG, activeNetwork } from "@/lib/bird-burger-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: BirdBurgerPage,
});

/* ─────────────────────────  DATA  ───────────────────────── */

const NAV_LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#kitchen-cam", label: "Kitchen Cam" },
  { href: "#bird-of-the-day", label: "Bird of the Day" },
  { href: "#token", label: "Token" },
  { href: "#how-to-buy", label: "How to Buy" },
  { href: "#community", label: "Community" },
];

const MENU_ITEMS = [
  { name: "McRug Pull", price: "$6.90", desc: "The burger disappears immediately after purchase.", img: menuMcrug.url, rating: 0.3 },
  { name: "Liquidity Fries", price: "$4.20", desc: "Your fries have been permanently locked.", img: menuFries.url, rating: 1.1 },
  { name: "Pump & Shake", price: "$8.88", desc: "Goes straight up before violently coming back down.", img: menuShake.url, rating: 0.7 },
  { name: "Diamond Hands Nuggets", price: "$12.00", desc: "So hard you physically cannot sell them.", img: menuNuggets.url, rating: 2.4 },
  { name: "Exit Liquidity Combo", price: "$69.00", desc: "Designed specifically for our most loyal customers.", img: menuCombo.url, rating: 0.1 },
  { name: "Chudburger Deluxe", price: "$14.99", desc: "Two patties, no vegetables, negative social awareness.", img: menuChud.url, rating: 1.9 },
  { name: "Paper Hands Kids Meal", price: "$3.33", desc: "Customer sells the toy before opening the box.", img: menuKids.url, rating: 0.5 },
  { name: "Nothing Burger", price: "$99.99", desc: "Contains exactly what the project promised.", img: menuNothing.url, rating: 5.0 },
];

const TICKER_MSGS = [
  "LIQUIDITY FRIES CURRENTLY UNAVAILABLE",
  "CHEF BOUGHT THE TOP",
  "ICE CREAM MACHINE RUGGED AGAIN",
  "TABLE 6 REQUESTED A REFUND — TABLE 6 HAS BEEN REMOVED",
  "MANAGEMENT DENIES EVERYTHING",
  "BURGER PRICES MAY EXPERIENCE EXTREME VOLATILITY",
  "HEALTH INSPECTOR CONNECTED WALLET",
  "CURRENT WAIT TIME: UNTIL NEXT CYCLE",
];

const STATUS_ROWS = [
  ["Burger Machine", ["Barely Working", "Overheating", "On Fire", "Doing Fine (Lying)"]],
  ["Ice Cream Machine", ["Rugged", "Rugged Again", "Being Investigated", "In Cold Storage"]],
  ["Liquidity", ["Missing", "Locked Forever", "In Chef's Pocket", "See Yesterday"]],
  ["Chef", ["Sleeping", "Trading", "Crying", "Posting Bullish"]],
  ["Manager", ["Posting on X", "In a Spaces Call", "Gone For Milk", "Unresponsive"]],
  ["Health Inspector", ["Blocked", "Ratio'd", "Bribed With Fries", "Coming Back Later"]],
  ["Drive-Thru Speaker", ["Screaming", "Whispering", "Fried", "Enlightened"]],
  ["Token Contract", ["Coming Soon", "Still Coming Soon", "Being Renounced", "Vibing"]],
] as const;

const EMPLOYEES = [
  { name: "Larry", role: "Fry Cook / Technical Analyst", reason: "Bought the top", perf: "-97.4%", skill: "Posting 'bullish' under bad news" },
  { name: "Chad", role: "Line Cook / Ponzi Enthusiast", reason: "Started a pyramid inside the walk-in freezer", perf: "-99.9%", skill: "Referring his mother" },
  { name: "Tiffany", role: "Cashier / DAO Delegate", reason: "Voted herself a raise", perf: "-42.0%", skill: "Losing quorum" },
  { name: "Rodney", role: "Grill Cook / Airdrop Farmer", reason: "Farmed the fryer for airdrops", perf: "-78.2%", skill: "Sybil attacks on the drive-thru" },
  { name: "Dwayne", role: "Drive-Thru / Chart Reader", reason: "Only spoke in cup-and-handle", perf: "-65.5%", skill: "Ignoring customers" },
  { name: "Brenda", role: "Assistant Manager / KOL", reason: "Shilled the ice cream machine", perf: "-88.1%", skill: "Deleting tweets" },
  { name: "Chip", role: "Fryer Tech / Node Operator", reason: "Ran a validator on the fryer", perf: "-100%", skill: "Slashing himself" },
  { name: "Denise", role: "Barista / Wick Hunter", reason: "Long-wicked the espresso machine", perf: "-73.0%", skill: "Selling bottoms" },
  { name: "Kyle", role: "Mop Boy / Founder", reason: "Rug in aisle three", perf: "-100%", skill: "Rebranding" },
  { name: "Marla", role: "Hostess / MEV Searcher", reason: "Front-ran her own tips", perf: "-51.2%", skill: "Sandwich attacks (literal)" },
  { name: "Greg", role: "Baker / Yield Farmer", reason: "APY was crumbs", perf: "-84.9%", skill: "Compounding regret" },
  { name: "Sasha", role: "Dishwasher / Governance Whale", reason: "Voted to renounce the sink", perf: "-33.3%", skill: "Whale watching" },
  { name: "Terry", role: "Janitor / Rug Puller", reason: "Pulled the actual rug", perf: "-100%", skill: "Slippery exits" },
  { name: "Beth", role: "Prep Cook / L2 Advocate", reason: "Onchained the coleslaw", perf: "-58.8%", skill: "Rollup drama" },
  { name: "Vince", role: "Manager / VC", reason: "Led a seed round for the salt shaker", perf: "-91.4%", skill: "Overvaluations" },
  { name: "Karen", role: "Refund Desk / Renouncer", reason: "Renounced her keys AND her shift", perf: "-100%", skill: "Immutable no-shows" },
];

const CAM_OVERLAYS = [
  "MOTION DETECTED",
  "LIQUIDITY DETECTED — FALSE ALARM",
  "MANAGER HAS LEFT THE BUILDING",
  "UNAUTHORIZED PIGEON",
  "FRYER TRANSACTION FAILED",
  "HEALTH INSPECTOR APPROACHING",
  "FOOTAGE DELETED BY MANAGEMENT",
];

const INCIDENTS = ["smoke", "fries", "red", "runby", "explosion", "rug"] as const;

const CALL_LINES = [
  "Bird Burger, please hold. I'm trading.",
  "The fryer is currently validating a block.",
  "Sir, this is not financial advice.",
  "Your order is behind 8,294 other mistakes.",
  "We cannot issue refunds because the register has been renounced.",
  "The manager is in a Spaces call.",
  "The burger is decentralized now. We don't control it.",
  "We put your fries in cold storage.",
];
const CALL_ENDINGS = [
  "The employee sold the phone.",
  "The call was front-run by a bot.",
  "The fryer caught fire mid-sentence.",
  "Larry hung up to buy the top again.",
  "Manager renounced the phone line.",
];
const USER_OPTIONS = [
  "Where is my burger?",
  "Connect me to the manager.",
  "I demand a refund.",
  "Is the ice cream machine working?",
  "Wen food?",
  "This is bullish.",
];

const REVIEWS = [
  { stars: 5, text: "Never received my burger, but the website made a bird noise.", who: "0xCHUD" },
  { stars: 1, text: "Burger rugged me halfway through lunch.", who: "Anonymous Victim" },
  { stars: 5, text: "My wife left me, but Bird Burger liked my post.", who: "DiamondDave" },
  { stars: 2, text: "Fries were cold. Storage was colder.", who: "LedgerLarry" },
  { stars: 5, text: "I have no idea what this is. Bullish.", who: "DefinitelyRealCustomer" },
];

const LEADERBOARD = [
  { rank: 1, name: "0xCHUD", pts: 94201, note: "Received Nothing" },
  { rank: 2, name: "FryCook420", pts: 69420, note: "Banned From Kitchen" },
  { rank: 3, name: "Larry", pts: -14, note: "Fired" },
  { rank: 4, name: "Mom's Wallet", pts: 8008, note: "Wants Refund" },
  { rank: 5, name: "0xRUG", pts: 404, note: "Points Not Found" },
];

const ROADMAP = [
  { phase: "Phase 1", title: "Open Restaurant", items: ["Launch website", "Burn first batch of fries", "Hire Larry", "Fire Larry"] },
  { phase: "Phase 2", title: "Expand Operations", items: ["Add wallet connection", "Release pigeons", "Repair ice cream machine", "Break it again"] },
  { phase: "Phase 3", title: "Global Domination", items: ["Open second location", "Forget where it is", "Put burger onchain", "Blame management"] },
  { phase: "Phase 4", title: "Exit", items: ["There is no Phase 4", "Everyone is still waiting for their order"] },
];

const FAQ = [
  { q: "Is Bird Burger a real restaurant?", a: "Legally, emotionally, and nutritionally: no." },
  { q: "Is $BRGR financial advice?", a: "No. It is barely a sandwich." },
  { q: "Where is my order?", a: "Currently being confirmed by the kitchen." },
  { q: "Why is the ice cream machine broken?", a: "Decentralization." },
  { q: "Can I get a refund?", a: "The cashier has renounced ownership." },
  { q: "Will the token increase in value?", a: "No one knows. Meme tokens are highly speculative and can lose all value." },
  { q: "Is this affiliated with Robinhood?", a: "No. Bird Burger is an independent meme project built for Robinhood Chain." },
  { q: "Can I submit someone else's phone number?", a: "No. Do not submit private information or use the website to harass anyone." },
];

const MEME_CAPTIONS = [
  "THE BURGER IS DECENTRALIZED",
  "SIR, THIS IS A BIRD BURGER",
  "LIQUIDITY FRIES ARE SOLD OUT",
  "CHEF BOUGHT THE TOP",
  "WE ARE SO BACK IN THE KITCHEN",
  "THIS RESTAURANT HAS NO ROADMAP",
];

/* ─────────────────────────  HELPERS  ───────────────────────── */

const rand = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;
const clean = (s: string) =>
  s
    .replace(/\b\d{3,}\b/g, "###")
    .replace(/https?:\/\/\S+/gi, "[link removed]")
    .replace(/\b(fuck|shit|bitch|slur1|slur2)\b/gi, "****")
    .slice(0, 140);

function useSound(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  return (kind: "beep" | "buzz" | "chirp" | "bell") => {
    if (muted) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = ctxRef.current!;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      const now = ctx.currentTime;
      if (kind === "beep") { o.frequency.value = 880; g.gain.setValueAtTime(0.05, now); }
      if (kind === "buzz") { o.type = "square"; o.frequency.value = 120; g.gain.setValueAtTime(0.06, now); }
      if (kind === "chirp") { o.frequency.setValueAtTime(1200, now); o.frequency.exponentialRampToValueAtTime(2400, now + 0.08); g.gain.setValueAtTime(0.04, now); }
      if (kind === "bell") { o.frequency.value = 1400; g.gain.setValueAtTime(0.05, now); }
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      o.start(now); o.stop(now + 0.28);
    } catch {}
  };
}

function useFartSong(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const stoppedRef = useRef(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (muted) {
      stoppedRef.current = true;
      if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
      if (ctxRef.current) { try { ctxRef.current.suspend(); } catch {} }
      return;
    }
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch { return; }
    const ctx = ctxRef.current!;
    if (ctx.state === "suspended") ctx.resume();
    stoppedRef.current = false;

    // Goofy "fart tuba" melody — [semitone offset, seconds]
    const melody: [number, number][] = [
      [0, 0.22], [4, 0.22], [7, 0.28], [4, 0.22],
      [0, 0.34], [7, 0.22], [12, 0.28], [10, 0.22],
      [7, 0.28], [4, 0.22], [0, 0.22], [-3, 0.5],
      [5, 0.22], [3, 0.22], [0, 0.22], [-5, 0.6],
    ];
    const baseFreq = 98; // G2 – low & flatulent

    const playFart = (when: number, semi: number, dur: number) => {
      if (!ctxRef.current) return;
      const f0 = baseFreq * Math.pow(2, semi / 12);
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const g = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1600, when);
      filter.frequency.exponentialRampToValueAtTime(600, when + dur);
      osc.type = "sawtooth";
      osc2.type = "square";
      osc.frequency.setValueAtTime(f0 * 1.35, when);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, f0 * 0.75), when + dur * 0.95);
      osc2.frequency.setValueAtTime(f0 * 0.55, when);
      osc2.frequency.exponentialRampToValueAtTime(Math.max(30, f0 * 0.4), when + dur * 0.95);
      lfo.frequency.value = 24;
      lfoGain.gain.value = 22;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfoGain.connect(osc2.frequency);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.09, when + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      osc.connect(filter); osc2.connect(filter); filter.connect(g); g.connect(ctx.destination);
      osc.start(when); osc2.start(when); lfo.start(when);
      const stopAt = when + dur + 0.05;
      osc.stop(stopAt); osc2.stop(stopAt); lfo.stop(stopAt);
    };

    let cursor = ctx.currentTime + 0.15;
    const schedule = () => {
      if (stoppedRef.current || !ctxRef.current) return;
      const now = ctx.currentTime;
      while (cursor < now + 1.5 && !stoppedRef.current) {
        for (const [semi, dur] of melody) {
          playFart(cursor, semi, dur);
          cursor += dur + 0.04;
        }
        cursor += 0.4; // gap between loops
      }
      timerRef.current = window.setTimeout(schedule, 500);
    };
    schedule();

    return () => {
      stoppedRef.current = true;
      if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    };
  }, [muted]);
}

/* ─────────────────────────  PAGE  ───────────────────────── */

function BirdBurgerPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [orderItem, setOrderItem] = useState<string | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [wrongNet, setWrongNet] = useState(false);
  const [bucks, setBucks] = useState(0);

  const play = useSound(muted);
  useFartSong(muted);

  useEffect(() => {
    const saved = localStorage.getItem("bb_bucks");
    if (saved) setBucks(parseInt(saved, 10) || 0);
  }, []);
  useEffect(() => { localStorage.setItem("bb_bucks", String(bucks)); }, [bucks]);

  const earn = (n: number) => setBucks((b) => b + n);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg text-ink grain">
      <Nav
        open={navOpen}
        setOpen={setNavOpen}
        muted={muted}
        setMuted={setMuted}
        onConnect={() => setWalletOpen(true)}
        wallet={wallet}
        wrongNet={wrongNet}
      />
      <Hero onOrder={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} onBuy={() => document.getElementById("token")?.scrollIntoView({ behavior: "smooth" })} />
      <Ticker />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 pt-6 md:grid-cols-3">
        <KitchenStatus onRefresh={() => play("beep")} />
        <KitchenCam onIncident={() => play("buzz")} />
        <BirdOfTheDay onFire={() => { play("buzz"); earn(25); }} />
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-3">
        <CallKitchenCard onStart={() => play("chirp")} onEnd={() => earn(30)} />
        <TodaysSpecials />
        <RecentActivityCard wallet={wallet} />
      </div>
      <PfpCreator onDownload={() => earn(40)} />
      <PurpleBand bucks={bucks} wallet={wallet} onDownload={() => earn(20)} />
      <Menu onOrder={(name) => { setOrderItem(name); play("bell"); earn(50); }} />
      <Reviews />
      <CommunitySection wallet={wallet} />
      <TokenSection wallet={wallet} />
      <HowToBuy />
      <Roadmap />
      <FAQSection />
      <Footer />

      <AnimatePresence>
        {orderItem && <OrderModal item={orderItem} onClose={() => setOrderItem(null)} />}
        {walletOpen && (
          <WalletModal
            wallet={wallet}
            wrongNet={wrongNet}
            onClose={() => setWalletOpen(false)}
            onConnect={(addr, wrong) => { setWallet(addr); setWrongNet(wrong); earn(100); }}
            onSwitch={() => setWrongNet(false)}
            onDisconnect={() => { setWallet(null); setWrongNet(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────  COMPACT REFERENCE-MATCH CARDS  ───────── */

function CallKitchenCard({ onStart, onEnd: _onEnd }: { onStart: () => void; onEnd: () => void }) {
  const [ringing, setRinging] = useState(false);
  const [duration, setDuration] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!ringing) return;
    const id = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(id);
  }, [ringing]);

  const fmt = (s: number) => {
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  const call = () => {
    setRinging(true);
    setDuration(0);
    onStart();
    setTimeout(() => setRinging(false), 4200);
  };

  const quick = (label: string) => {
    setFlash(label);
    call();
    setTimeout(() => setFlash(null), 2200);
  };

  const cornerTick = "before:absolute before:w-3 before:h-3 before:border-pink-400/70 after:absolute after:w-3 after:h-3 after:border-pink-400/70";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 border-pink-500/70 bg-[#120620] p-4 shadow-[0_0_30px_-4px_rgba(236,72,153,0.6),inset_0_0_40px_rgba(236,72,153,0.08)]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(236,72,153,0.18), transparent 55%), radial-gradient(circle at 90% 100%, rgba(6,182,212,0.12), transparent 55%)",
      }}
    >
      {/* Corner brackets */}
      <span className="absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-pink-400/80" />
      <span className="absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-pink-400/80" />
      <span className="absolute left-2 bottom-2 h-3 w-3 border-l-2 border-b-2 border-pink-400/80" />
      <span className="absolute right-2 bottom-2 h-3 w-3 border-r-2 border-b-2 border-pink-400/80" />
      {/* Hazard stripes accent */}
      <div className="absolute right-6 top-0 h-2 w-10 opacity-70" style={{ backgroundImage: "repeating-linear-gradient(45deg,#facc15 0 4px,#000 4px 8px)" }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Phone className="mt-1 h-6 w-6 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.9)]" />
          <div className="font-display text-lg leading-[0.95] text-white tracking-wide [text-shadow:0_0_10px_rgba(236,72,153,0.9),0_0_20px_rgba(236,72,153,0.5)]">
            CALL THE<br />KITCHEN
          </div>
        </div>
        <div className="rounded-lg border-2 border-pink-500/70 bg-black/60 px-2.5 py-1.5 text-center shadow-[inset_0_0_10px_rgba(236,72,153,0.25)]">
          <div className="flex items-center justify-center gap-1 font-mono text-[8px] uppercase tracking-[0.25em] text-pink-300">
            <span className="text-[10px]">🐦</span> Hotline
          </div>
          <div className="font-display text-[11px] tracking-wider text-white [text-shadow:0_0_6px_rgba(236,72,153,0.8)]">1-800-BIRD-BAD</div>
        </div>
      </div>

      {/* Neon dial */}
      <div className="relative mx-auto my-5 grid h-40 w-40 place-items-center">
        {/* Sound waves */}
        <AnimatePresence>
          {ringing && (
            <>
              <motion.span
                key="wave-l" initial={{ opacity: 0, x: 0 }} animate={{ opacity: [0.8, 0], x: -18 }} exit={{ opacity: 0 }}
                transition={{ duration: 1.1, repeat: Infinity }}
                className="absolute left-[-28px] top-1/2 h-16 w-8 -translate-y-1/2 rounded-l-full border-l-2 border-pink-400"
                style={{ boxShadow: "-6px 0 12px -2px rgba(236,72,153,0.7)" }}
              />
              <motion.span
                key="wave-r" initial={{ opacity: 0, x: 0 }} animate={{ opacity: [0.8, 0], x: 18 }} exit={{ opacity: 0 }}
                transition={{ duration: 1.1, repeat: Infinity }}
                className="absolute right-[-28px] top-1/2 h-16 w-8 -translate-y-1/2 rounded-r-full border-r-2 border-pink-400"
                style={{ boxShadow: "6px 0 12px -2px rgba(236,72,153,0.7)" }}
              />
            </>
          )}
        </AnimatePresence>
        {/* Outer cyan ring */}
        <span className="absolute inset-0 rounded-full border-2 border-cyan-400/70" style={{ boxShadow: "0 0 18px rgba(6,182,212,0.6), inset 0 0 18px rgba(6,182,212,0.3)" }} />
        {/* Inner pink ring */}
        <motion.span
          animate={ringing ? { boxShadow: ["0 0 20px rgba(236,72,153,0.8), inset 0 0 20px rgba(236,72,153,0.4)", "0 0 40px rgba(236,72,153,1), inset 0 0 30px rgba(236,72,153,0.7)", "0 0 20px rgba(236,72,153,0.8), inset 0 0 20px rgba(236,72,153,0.4)"] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="absolute inset-2 rounded-full border-2 border-pink-400"
          style={{ boxShadow: "0 0 20px rgba(236,72,153,0.8), inset 0 0 20px rgba(236,72,153,0.4)" }}
        />
        {/* Screw dots */}
        {[0, 90, 180, 270, 45, 135, 225, 315].map((deg) => (
          <span key={deg} className="absolute h-1.5 w-1.5 rounded-full bg-pink-300/70" style={{ transform: `rotate(${deg}deg) translate(0, -68px)` }} />
        ))}
        {/* Screen bg */}
        <div className="absolute inset-4 rounded-full bg-black/70" style={{ backgroundImage: "radial-gradient(circle, rgba(236,72,153,0.15), transparent 70%), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 4px)" }} />
        {/* Phone icon */}
        <motion.div
          animate={ringing ? { rotate: [-14, 14, -14] } : { rotate: 0 }}
          transition={{ duration: 0.35, repeat: ringing ? Infinity : 0 }}
          className="relative z-10"
        >
          <Phone className="h-14 w-14 text-pink-400" style={{ filter: "drop-shadow(0 0 10px rgba(236,72,153,1)) drop-shadow(0 0 20px rgba(236,72,153,0.6))" }} strokeWidth={2.5} />
        </motion.div>
      </div>

      {/* RINGING pill */}
      <div className="mb-3 flex justify-center">
        <div className="rounded-full border-2 border-pink-400/70 bg-black/60 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-pink-300">
          {ringing ? (
            <span className="flex items-center gap-2">
              RINGING<motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.8, repeat: Infinity }}>...</motion.span>
              <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_6px_rgba(236,72,153,1)]" />
            </span>
          ) : "DIAL TONE ·"}
        </div>
      </div>

      {/* CALL NOW big yellow button */}
      <button
        onClick={call}
        disabled={ringing}
        className="relative w-full overflow-hidden rounded-lg border-2 border-yellow-600 bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 px-4 py-3.5 font-display text-lg tracking-[0.15em] text-[#2a1500] shadow-[0_6px_0_0_#854d0e,0_0_25px_-4px_rgba(250,204,21,0.7)] transition active:translate-y-[3px] active:shadow-[0_3px_0_0_#854d0e] disabled:opacity-80"
        style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.15)" }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/25" />
        <span className="relative flex items-center justify-center gap-3">
          <span className="text-xl">🐦</span>
          <span>{ringing ? "CALLING…" : "CALL NOW"}</span>
          <ChevronRight className="h-5 w-5" strokeWidth={3} />
        </span>
      </button>

      {/* Status bar */}
      <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-pink-500/40 bg-black/50 px-3 py-2">
        <div className="grid h-9 w-9 place-items-center rounded-md border border-pink-400/50 bg-purple-900/50 text-lg">😵</div>
        <div className="min-w-0">
          <div className="font-display text-[11px] tracking-wide text-white">
            {flash ? flash.toUpperCase() + "…" : "Nobody's picking up."}
          </div>
          <div className="font-mono text-[10px] text-pink-300/80">{flash ? "The line just laughed." : "As always."}</div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 font-mono text-[8px] uppercase tracking-[0.2em] text-cyan-300/80"><Clock className="h-3 w-3"/>Call Duration</div>
          <div className="font-mono text-sm text-cyan-300 [text-shadow:0_0_6px_rgba(6,182,212,0.7)]">{fmt(duration)}</div>
        </div>
      </div>

      {/* Quick requests */}
      <div className="mt-3">
        <div className="flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-pink-300/70">
          <span className="text-cyan-300">//</span> Quick Requests <span className="text-cyan-300">//</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { emoji: "💸", label: "REFUND" },
            { emoji: "🍔", label: "WEN BURGER" },
            { emoji: "👔", label: "TALK TO MANAGER" },
          ].map((q) => (
            <button
              key={q.label}
              onClick={() => quick(q.label)}
              disabled={ringing}
              className="flex items-center justify-center gap-1 rounded-md border border-pink-500/50 bg-black/40 px-2 py-2 font-display text-[9px] tracking-wider text-pink-200 transition hover:border-pink-300 hover:bg-pink-500/10 hover:text-white disabled:opacity-60"
            >
              <span>{q.emoji}</span>{q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer chip */}
      <div className="mt-3 flex items-center justify-center gap-2 font-display text-[10px] tracking-[0.35em] text-pink-400/90 [text-shadow:0_0_6px_rgba(236,72,153,0.7)]">
        <span>≪</span> BIRD BURGER <span>≫</span>
      </div>
    </div>
  );
}

const SPECIALS = [
  { d: "MON", n: "Manic Monday Melt", p: "$4.20", note: "Now with 30% more panic" },
  { d: "TUE", n: "Two-For-Tuesday", p: "$6.66", note: "You still only get one" },
  { d: "WED", n: "Wednesday Rug", p: "$0.01", note: "Delivered in 3-5 business years" },
  { d: "THU", n: "Thursday Throwaway", p: "$3.14", note: "Pi day, every day" },
  { d: "FRI", n: "Fried Friday Fumble", p: "$9.99", note: "Contains regret" },
];
function TodaysSpecials() {
  return (
    <div className="relative rounded-sm bg-[#f5f0e0] p-4 text-[#1a1a1a] shadow-[6px_6px_0_rgba(124,58,237,0.5)]">
      <div className="absolute inset-x-0 -top-2 h-4 bg-[repeating-linear-gradient(90deg,#f5f0e0_0_10px,transparent_10px_16px)]" aria-hidden />
      <div className="text-center">
        <div className="font-display text-lg tracking-widest">TODAY'S SPECIALS</div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-[#666]">— Receipt #{Math.floor(Math.random()*99999)} —</div>
      </div>
      <div className="my-3 border-t-2 border-dashed border-[#1a1a1a]/40" />
      <ul className="space-y-1.5 font-mono text-xs">
        {SPECIALS.map((s) => (
          <li key={s.d} className="grid grid-cols-[36px_1fr_auto] items-baseline gap-2">
            <span className="rounded bg-grape px-1 py-0.5 text-center font-display text-[10px] text-white">{s.d}</span>
            <span>
              <div className="font-bold uppercase tracking-wide">{s.n}</div>
              <div className="text-[10px] text-[#666]">{s.note}</div>
            </span>
            <span className="text-right font-bold text-grape">{s.p}</span>
          </li>
        ))}
      </ul>
      <div className="my-3 border-t-2 border-dashed border-[#1a1a1a]/40" />
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span>TOTAL</span>
        <span className="font-display text-lg text-grease">$∞.99</span>
      </div>
      <div className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-[#666]">*** THANK YOU / PLEASE REGRET ***</div>
    </div>
  );
}

const ACTIVITY = [
  { u: "0xB1RD…D3AD", a: "burned 420 $BRGR", t: "2s ago", c: "text-grease" },
  { u: "chef.eth", a: "renamed the Big Bird to Small Regret", t: "18s ago", c: "text-mustard" },
  { u: "0xF00D…C0DE", a: "ordered a McRug Pull", t: "44s ago", c: "text-cyan" },
  { u: "pigeon.dao", a: "released 12 pigeons into the DMs", t: "1m ago", c: "text-robin" },
  { u: "0xDEAD…BEEF", a: "connected wallet, immediately left", t: "2m ago", c: "text-grease" },
  { u: "manager.eth", a: "clocked in (still missing)", t: "3m ago", c: "text-pink-400" },
];
function RecentActivityCard({ wallet }: { wallet: string | null }) {
  const [items, setItems] = useState(ACTIVITY);
  useEffect(() => {
    const t = setInterval(() => {
      setItems((prev) => [{ ...prev[Math.floor(Math.random()*prev.length)], t: "now" }, ...prev.slice(0, 5)]);
    }, 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col rounded-lg border-2 border-robin/50 bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-display text-sm neon-green">📡 RECENT ACTIVITY</div>
        <span className="flex items-center gap-1 font-mono text-[10px] text-robin"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-robin"/>LIVE</span>
      </div>
      <ul className="flex-1 space-y-1.5 font-mono text-[11px]">
        <AnimatePresence initial={false}>
          {items.slice(0, 6).map((it, i) => (
            <motion.li key={it.u + i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-baseline justify-between gap-2 border-b border-ink/10 pb-1">
              <span className="truncate"><span className={it.c}>{it.u}</span> <span className="text-ink/70">{it.a}</span></span>
              <span className="shrink-0 text-ink/40">{it.t}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <div className="mt-3 rounded border border-grape/40 bg-grape/10 p-2 font-mono text-[10px] text-ink/70">
        {wallet ? <>You: <span className="text-cyan">{wallet.slice(0,6)}…{wallet.slice(-4)}</span> — behaving suspiciously.</> : "Connect wallet to be publicly judged."}
      </div>
    </div>
  );
}

/* ─────────  PFP CREATOR  ───────── */

const PFP_CREW = [
  { id: "larry", name: "Larry", role: "Fry Cook", tint: "#f59e0b", hat: "🍟", quote: "Grease is a lifestyle." },
  { id: "chad",  name: "Chad",  role: "Missing Manager", tint: "#7c3aed", hat: "👔", quote: "Out to lunch. Since 2021." },
  { id: "cindy", name: "Cindy", role: "Cashier", tint: "#06b6d4", hat: "💅", quote: "Cash, card, or copium?" },
  { id: "karen", name: "Karen", role: "Health Inspector", tint: "#ef4444", hat: "🚫", quote: "This place is a felony." },
  { id: "bird",  name: "The Bird", role: "Mascot / CEO", tint: "#00c805", hat: "👑", quote: "I run this dump." },
  { id: "gary",  name: "Gary",  role: "Dishwasher (allegedly)", tint: "#ec4899", hat: "🧽", quote: "I have not seen soap." },
];

const PFP_BGS = [
  { id: "grape",   label: "Grape",   value: "#7c3aed" },
  { id: "cyan",    label: "Cyan",    value: "#22d3ee" },
  { id: "robin",   label: "Robin",   value: "#00c805" },
  { id: "mustard", label: "Mustard", value: "#facc15" },
  { id: "grease",  label: "Grease",  value: "#ef4444" },
  { id: "noir",    label: "Noir",    value: "#0a0a0a" },
  { id: "grad1",   label: "Sunset",  value: "linear:#7c3aed,#ec4899,#f59e0b" },
  { id: "grad2",   label: "Neon",    value: "linear:#00c805,#22d3ee" },
];

type Platform = "x" | "discord";

function PfpCreator({ onDownload }: { onDownload: () => void }) {
  const [empId, setEmpId] = useState(PFP_CREW[0]!.id);
  const [bgId, setBgId] = useState(PFP_BGS[0]!.id);
  const [platform, setPlatform] = useState<Platform>("x");
  const [handle, setHandle] = useState("@bird_burger");
  const [showBadge, setShowBadge] = useState(true);
  const [animated, setAnimated] = useState(true);
  const [intensity, setIntensity] = useState(60);
  const [exporting, setExporting] = useState(false);
  const [exportPct, setExportPct] = useState(0);
  const [gifPreview, setGifPreview] = useState<{ url: string; blob: Blob } | null>(null);
  const LOOP_LEN = 30;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgReady = useRef(false);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  const employee = PFP_CREW.find((e) => e.id === empId)!;
  const bg = PFP_BGS.find((b) => b.id === bgId)!;

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = mascotHero.url;
    img.onload = () => { imgRef.current = img; imgReady.current = true; };
  }, []);

  const drawFrame = (ctx: CanvasRenderingContext2D, size: number, frame: number, anim: boolean = animated, intensityOverride?: number, loopLen: number = LOOP_LEN) => {
    const iv = (intensityOverride ?? intensity) / 100; // 0..1
    // Normalize into a single loop so first and last frame align exactly.
    const fMod = ((frame % loopLen) + loopLen) % loopLen;
    const phase = fMod / loopLen; // 0..1
    const twoPi = Math.PI * 2;

    // Jitter: sinusoidal so it returns to origin at phase 0/1 (seamless).
    const jitterAmp = anim ? Math.max(1, Math.round(iv * 4)) : 0;
    const jx = anim ? Math.round(Math.sin(twoPi * phase) * jitterAmp) : 0;
    const jy = anim ? Math.round(Math.cos(twoPi * phase * 2) * jitterAmp) : 0;

    // Blinks: integer number of blinks per loop, each blink at a fixed phase.
    const blinksPerLoop = anim && iv > 0.05 ? Math.min(3, Math.max(1, Math.round(iv * 3))) : 0;
    const blinkDuration = Math.max(2, Math.round(2 + iv * 3));
    let blinking = false;
    if (blinksPerLoop > 0) {
      const seg = loopLen / blinksPerLoop; // 30/{1,2,3} → integer
      const posInSeg = fMod % seg;
      blinking = posInSeg < blinkDuration;
    }

    const pulse = anim ? 0.5 + 0.5 * Math.sin(twoPi * phase) * (0.4 + iv * 0.6) : 0.7;

    ctx.save();
    ctx.clearRect(0, 0, size, size);
    if (platform === "x") {
      ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.clip();
    } else {
      roundRect(ctx, 0, 0, size, size, size * 0.1875); ctx.clip();
    }
    if (bg.value.startsWith("linear:")) {
      const stops = bg.value.slice(7).split(",");
      const g = ctx.createLinearGradient(0, 0, size, size);
      stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = bg.value;
    }
    ctx.fillRect(0, 0, size, size);

    const scanAlpha = 0.02 + iv * 0.16;
    ctx.globalAlpha = scanAlpha;
    // loopLen (30) is divisible by 3, so mod-3 shift is also seamless.
    const shift = anim ? fMod % 3 : 0;
    for (let y = shift; y < size; y += 3) { ctx.fillStyle = "#000"; ctx.fillRect(0, y, size, 1); }
    ctx.globalAlpha = 1;

    const haloAlpha = Math.floor(0x99 + pulse * 0x40).toString(16).padStart(2, "0");
    const halo = ctx.createRadialGradient(size/2, size*0.55, 20, size/2, size*0.55, size*0.55);
    halo.addColorStop(0, employee.tint + haloAlpha);
    halo.addColorStop(1, "transparent");
    ctx.fillStyle = halo; ctx.fillRect(0, 0, size, size);

    const img = imgRef.current;
    if (img) {
      const mSize = size * 0.82;
      const mx = (size - mSize) / 2 + jx;
      const my = size - mSize + 20 + jy;
      ctx.save();
      ctx.shadowColor = employee.tint; ctx.shadowBlur = 30 + pulse * 20;
      ctx.drawImage(img, mx, my, mSize, mSize);
      ctx.restore();

      if (blinking) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(mx + mSize * 0.28, my + mSize * 0.30, mSize * 0.45, mSize * 0.045);
        ctx.restore();
      }
    } else {
      ctx.fillStyle = "#fff"; ctx.font = `bold ${size*0.35}px sans-serif`; ctx.textAlign = "center";
      ctx.fillText("🐦", size/2, size*0.65);
    }

    // Hat bob: 2 full cycles per loop → returns to origin at seam.
    const hatBob = anim ? Math.sin(twoPi * phase * 2) * (1 + iv * 4) : 0;
    ctx.font = `bold ${size*0.176}px 'Apple Color Emoji','Segoe UI Emoji',sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(employee.hat, size*0.72 + jx, size*0.32 + hatBob);

    // LIVE dot: integer flashes per loop from the set of loopLen divisors {1,2,3,5}.
    const FLASHES = [1, 2, 3, 5];
    const liveFlashes = anim ? FLASHES[Math.min(FLASHES.length - 1, Math.max(0, Math.round(iv * 3)))]! : 0;
    let liveOn = false;
    if (liveFlashes > 0) {
      const seg = loopLen / liveFlashes;
      const posInSeg = fMod % seg;
      liveOn = posInSeg < seg * 0.6;
    }
    if (liveOn) {
      ctx.save();
      ctx.fillStyle = "#ff2e63";
      ctx.shadowColor = "#ff2e63"; ctx.shadowBlur = 8 + iv * 14;
      ctx.beginPath(); ctx.arc(size*0.12, size*0.11, size*0.018, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${size*0.028}px 'Bungee', Impact, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LIVE", size*0.15, size*0.11);
    }

    if (showBadge) {
      ctx.save();
      ctx.translate(size*0.16, size*0.82);
      ctx.rotate(-0.06);
      const w = size*0.68, h = size*0.144;
      roundRect(ctx, 0, 0, w, h, 8);
      ctx.fillStyle = "#facc15"; ctx.fill();
      ctx.fillStyle = "#0a0a0a";
      ctx.font = `bold ${size*0.058}px 'Bungee', Impact, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(employee.name.toUpperCase(), size*0.035, size*0.05);
      ctx.font = `bold ${size*0.031}px monospace`;
      ctx.fillText(employee.role.toUpperCase(), size*0.035, size*0.105);
      ctx.textAlign = "right";
      ctx.fillText(handle, w - size*0.035, size*0.078);
      ctx.restore();
    }

    ctx.save();
    ctx.lineWidth = size * 0.027;
    ctx.strokeStyle = employee.tint;
    if (platform === "x") {
      ctx.beginPath(); ctx.arc(size/2, size/2, size/2 - size*0.0137, 0, Math.PI*2); ctx.stroke();
    } else {
      roundRect(ctx, size*0.0137, size*0.0137, size - size*0.0273, size - size*0.0273, size*0.176); ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  };

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const size = 512; c.width = size; c.height = size;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 66) {
        drawFrame(ctx, size, frameRef.current);
        frameRef.current = (frameRef.current + 1) % 600;
        last = t;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empId, bgId, platform, handle, showBadge, animated, intensity]);

  const download = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a");
    a.download = `bird-burger-${employee.id}-${platform}.png`;
    a.href = c.toDataURL("image/png"); a.click();
    onDownload();
  };

  const renderGif = async () => {
    if (exporting) return;
    // Discard any stale preview when re-rendering.
    if (gifPreview) { URL.revokeObjectURL(gifPreview.url); setGifPreview(null); }
    setExporting(true); setExportPct(0);
    try {
      const [{ default: GIF }, workerUrlMod] = await Promise.all([
        import("gif.js"),
        import("gif.js/dist/gif.worker.js?url"),
      ]);
      const size = 320;
      const off = document.createElement("canvas");
      off.width = size; off.height = size;
      const octx = off.getContext("2d")!;
      const frames = LOOP_LEN;
      const delay = 66;
      if (!imgReady.current) {
        await new Promise<void>((res) => {
          const check = () => imgReady.current ? res() : setTimeout(check, 50);
          check();
        });
      }
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: size,
        height: size,
        workerScript: (workerUrlMod as { default: string }).default,
      });
      const exportIntensity = animated ? intensity : Math.max(60, intensity);
      // Render frames 0..LOOP_LEN-1. Because every animated quantity in
      // drawFrame is periodic over LOOP_LEN, frame 0 and frame LOOP_LEN are
      // pixel-identical → the GIF loops with no visible seam.
      for (let i = 0; i < frames; i++) {
        drawFrame(octx, size, i, true, exportIntensity, LOOP_LEN);
        gif.addFrame(octx, { copy: true, delay });
      }
      gif.on("progress", (p: number) => setExportPct(Math.round(p * 100)));
      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setGifPreview({ url, blob });
        setExporting(false); setExportPct(0);
      });
      gif.render();
    } catch (err) {
      console.error("GIF export failed", err);
      setExporting(false); setExportPct(0);
    }
  };

  const confirmDownloadGif = () => {
    if (!gifPreview) return;
    const a = document.createElement("a");
    a.href = gifPreview.url;
    a.download = `bird-burger-${employee.id}-${platform}.gif`;
    a.click();
    onDownload();
  };

  const closeGifPreview = () => {
    if (gifPreview) URL.revokeObjectURL(gifPreview.url);
    setGifPreview(null);
  };

  useEffect(() => () => { if (gifPreview) URL.revokeObjectURL(gifPreview.url); }, [gifPreview]);


  const share = async () => {
    const text = `I got hired as ${employee.name} (${employee.role}) at Bird Burger 🐦🍔 — "${employee.quote}"`;
    try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <section id="pfp" className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle
        kicker="Employee of the Millisecond"
        title="HIRE YOURSELF: PFP GENERATOR"
        sub="Pick a Bird Burger crew member. Slap them on your X or Discord. Cause immediate distrust in your online friends."
      />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Preview */}
        <div className="rounded-lg border-2 border-grape/50 bg-black/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => setPlatform("x")}
              className={`flex-1 rounded-md border-2 px-3 py-2 font-display text-xs tracking-widest transition ${platform==="x" ? "border-cyan bg-cyan/20 text-cyan" : "border-ink/20 text-ink/60 hover:bg-ink/5"}`}
            >𝕏 · CIRCLE</button>
            <button
              onClick={() => setPlatform("discord")}
              className={`flex-1 rounded-md border-2 px-3 py-2 font-display text-xs tracking-widest transition ${platform==="discord" ? "border-grape bg-grape/20 text-ink" : "border-ink/20 text-ink/60 hover:bg-ink/5"}`}
            >DISCORD · ROUNDED</button>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <canvas ref={canvasRef} className="h-full w-full" style={{ imageRendering: "auto" }} />
            <div className="absolute -bottom-2 -right-2 rotate-[-4deg] rounded bg-grease px-2 py-1 font-display text-[10px] tracking-widest text-white shadow-md">512 × 512</div>
          </div>
          <p className="mt-4 text-center font-mono text-[11px] italic text-ink/60">"{employee.quote}"</p>
          <button
            onClick={() => setAnimated((v) => !v)}
            className={`mt-3 w-full rounded-md border-2 px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition ${animated ? "border-robin bg-robin/15 text-robin" : "border-ink/20 text-ink/60 hover:bg-ink/5"}`}
          >
            {animated ? "◉ Live preview: ON (blink + jitter)" : "○ Live preview: OFF"}
          </button>
          <div className={`mt-3 rounded-md border-2 p-3 transition ${animated ? "border-grape/60 bg-grape/10" : "border-ink/15 bg-black/20 opacity-60"}`}>
            <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-ink/70">
              <span>Animation Intensity</span>
              <span className="text-mustard">
                {intensity === 0 ? "OFF" : intensity < 25 ? "SUBTLE" : intensity < 55 ? "LIVELY" : intensity < 85 ? "GLITCHY" : "SEIZURE"} · {intensity}%
              </span>
            </div>
            <input
              type="range" min={0} max={100} value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
              disabled={!animated}
              className="w-full accent-pink-400 disabled:cursor-not-allowed"
            />
            <div className="mt-1 grid grid-cols-3 gap-1 font-mono text-[9px] uppercase tracking-widest text-ink/50">
              <span>Jitter</span>
              <span className="text-center">Blink</span>
              <span className="text-right">Scanlines</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={download} className="rounded-md border-2 border-mustard bg-mustard px-3 py-3 font-display text-xs tracking-widest text-bg shadow-[3px_3px_0_#000] hover:translate-y-[-2px] transition">
              PNG
            </button>
            <button
              onClick={renderGif}
              disabled={exporting}
              className="rounded-md border-2 border-robin bg-robin px-3 py-3 font-display text-xs tracking-widest text-bg shadow-[3px_3px_0_#000] hover:translate-y-[-2px] transition disabled:cursor-wait disabled:opacity-60"
            >
              {exporting ? `RENDERING ${exportPct}%` : "PREVIEW GIF LOOP"}
            </button>
          </div>
          <button onClick={share} className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border-2 border-cyan bg-cyan/10 px-3 py-2 font-display text-xs tracking-widest text-cyan">
            <Share2 className="h-4 w-4"/> SHARE THE SHAME
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div>
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-mustard">1 · Pick your employee</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PFP_CREW.map((e) => {
                const active = e.id === empId;
                return (
                  <button
                    key={e.id}
                    onClick={() => setEmpId(e.id)}
                    className={`rounded-lg border-2 p-3 text-left transition ${active ? "border-mustard bg-mustard/10 shadow-[0_0_20px_rgba(250,204,21,0.3)]" : "border-ink/15 bg-card hover:border-grape/60"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg"
                        style={{ background: e.tint + "33", boxShadow: `0 0 12px ${e.tint}80` }}
                      >{e.hat}</div>
                      <div className="min-w-0">
                        <div className="truncate font-display text-sm">{e.name}</div>
                        <div className="truncate font-mono text-[10px] uppercase tracking-widest text-ink/60">{e.role}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-mustard">2 · Background</div>
            <div className="flex flex-wrap gap-2">
              {PFP_BGS.map((b) => {
                const style: React.CSSProperties = b.value.startsWith("linear:")
                  ? { backgroundImage: `linear-gradient(135deg, ${b.value.slice(7).split(",").join(", ")})` }
                  : { background: b.value };
                const active = b.id === bgId;
                return (
                  <button
                    key={b.id}
                    onClick={() => setBgId(b.id)}
                    className={`h-10 w-10 rounded-md border-2 transition ${active ? "border-mustard scale-110 shadow-[0_0_10px_rgba(250,204,21,0.6)]" : "border-ink/20 hover:border-ink/40"}`}
                    style={style}
                    aria-label={b.label}
                    title={b.label}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-mustard">3 · Your handle</div>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.slice(0, 24))}
              placeholder="@your_handle"
              className="w-full rounded-md border-2 border-cyan/40 bg-black/60 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-cyan"
            />
          </div>

          <label className="flex items-center gap-3 rounded-md border border-ink/15 bg-black/30 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={showBadge}
              onChange={(e) => setShowBadge(e.target.checked)}
              className="h-4 w-4 accent-mustard"
            />
            <span>Show name badge & handle overlay</span>
          </label>

          <div className="rounded-md border-2 border-grape/40 bg-grape/10 p-4 text-xs text-ink/75">
            <div className="mb-1 flex items-center gap-2 font-display text-sm text-mustard"><Star className="h-4 w-4 fill-mustard text-mustard"/> LEGAL NOTICE</div>
            Using this PFP does not constitute actual employment. You will not be paid. You may still be fired.
          </div>
        </div>
      </div>
    </section>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

const FLOCK_QUICK_CAPTIONS: { top: string; bot: string; icon: string }[] = [
  { top: "THE BURGER IS", bot: "DECENTRALIZED", icon: "🥞" },
  { top: "LIQUIDITY FRIES", bot: "ARE SOLD OUT", icon: "🍟" },
  { top: "SIR, THIS IS", bot: "A BIRD BURGER", icon: "💀" },
  { top: "WE ARE SO BACK", bot: "IN THE KITCHEN", icon: "🔥" },
  { top: "CHEF BOUGHT", bot: "THE TOP", icon: "👨‍🍳" },
  { top: "THIS RESTAURANT HAS", bot: "NO ROADMAP", icon: "🗺️" },
];

const FLOCK_HOLDERS = [
  { rank: 1, name: "0xCHAD",     pts: 94291, status: "Received Nothing",   dot: "#22c55e" },
  { rank: 2, name: "FryCook420", pts: 69420, status: "Banned From Kitchen", dot: "#38bdf8" },
  { rank: 3, name: "Larry",      pts:   -14, status: "Fired",              dot: "#ec4899" },
  { rank: 4, name: "Mom's Wallet", pts: 5005, status: "Wants Refund",      dot: "#facc15" },
  { rank: 5, name: "0xRUG",      pts:   404, status: "Points Not Found",   dot: "#a855f7" },
];

function PixelBird({ className = "" }: { className?: string }) {
  // 8-bit style purple bird silhouette
  return (
    <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" aria-hidden>
      {[
        [5,2],[6,2],[7,2],
        [4,3],[5,3],[6,3],[7,3],[8,3],
        [3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],
        [3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],
        [3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],
        [4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],
        [5,8],[6,8],[7,8],[8,8],[9,8],[10,8],
        [5,9],[6,9],[9,9],[10,9],
        [5,10],[6,10],[9,10],[10,10],
      ].map(([x,y],i) => (<rect key={i} x={x} y={y} width={1} height={1} fill="#7C3AED" />))}
      <rect x={9} y={4} width={1} height={1} fill="#fef08a" />
      <rect x={10} y={4} width={1} height={1} fill="#fef08a" />
    </svg>
  );
}

function SparklesDeco() {
  const pts = [
    { x: "8%", y: "12%", s: 8, c: "#facc15" },
    { x: "18%", y: "6%", s: 6, c: "#22d3ee" },
    { x: "32%", y: "20%", s: 5, c: "#ec4899" },
    { x: "70%", y: "8%", s: 7, c: "#22c55e" },
    { x: "82%", y: "22%", s: 6, c: "#facc15" },
    { x: "92%", y: "10%", s: 5, c: "#22d3ee" },
    { x: "50%", y: "4%", s: 6, c: "#f9a8d4" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {pts.map((p, i) => (
        <span
          key={i}
          className="absolute animate-pulse"
          style={{ left: p.x, top: p.y, width: p.s, height: p.s, color: p.c }}
        >
          <svg viewBox="0 0 8 8" width={p.s} height={p.s}>
            <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="currentColor" />
          </svg>
        </span>
      ))}
    </div>
  );
}

function FlockMemeCard({ onDownload }: { onDownload: () => void }) {
  const [top, setTop] = useState("THE BURGER IS");
  const [bot, setBot] = useState("DECENTRALIZED");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = 800; c.height = 800;
    ctx.fillStyle = "#7C3AED"; ctx.fillRect(0, 0, 800, 800);
    const img = new Image(); img.crossOrigin = "anonymous"; img.src = mascotHero.url;
    img.onload = () => {
      ctx.drawImage(img, 100, 100, 600, 600);
      ctx.font = "900 68px Impact, 'Bungee', sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff"; ctx.strokeStyle = "#000"; ctx.lineWidth = 8;
      ctx.strokeText(top, 400, 100); ctx.fillText(top, 400, 100);
      ctx.strokeText(bot, 400, 760); ctx.fillText(bot, 400, 760);
    };
  }, [top, bot]);

  const download = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a");
    a.download = "bird-burger-meme.png"; a.href = c.toDataURL("image/png"); a.click();
    onDownload();
  };
  const share = async () => {
    const text = `${top} ${bot} — from Bird Burger 🐦🍔`;
    try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <div className="relative rounded-2xl border-2 border-pink-400/70 bg-[#120826]/85 p-5 shadow-[0_0_30px_-6px_rgba(236,72,153,0.55),inset_0_0_20px_rgba(236,72,153,0.08)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-pink-400/60 bg-pink-500/10 text-pink-300">
          <Palette className="h-4 w-4" />
        </span>
        <div>
          <div className="font-display text-2xl tracking-wider text-pink-300 [text-shadow:0_0_10px_rgba(236,72,153,0.7)]">MEME MACHINE</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-pink-200/60">Make it cluckin&apos; memeable</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr] md:items-start">
        <div className="rounded-xl border-2 border-cyan-400/60 bg-[#0a0416] p-2 shadow-[0_0_20px_-8px_rgba(34,211,238,0.7)]">
          <canvas ref={canvasRef} className="aspect-square w-full rounded-lg" />
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200/80">Top Text</label>
            <input value={top} onChange={(e)=>setTop(e.target.value.slice(0,40).toUpperCase())}
              className="w-full rounded-md border-2 border-cyan-400/40 bg-[#0a0416] px-3 py-2 font-mono text-sm text-cyan-100 outline-none focus:border-cyan-400" />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200/80">Bottom Text</label>
            <input value={bot} onChange={(e)=>setBot(e.target.value.slice(0,40).toUpperCase())}
              className="w-full rounded-md border-2 border-cyan-400/40 bg-[#0a0416] px-3 py-2 font-mono text-sm text-cyan-100 outline-none focus:border-cyan-400" />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {FLOCK_QUICK_CAPTIONS.map((q) => (
          <button
            key={q.top + q.bot}
            onClick={() => { setTop(q.top); setBot(q.bot); }}
            className="flex items-center gap-2 rounded-lg border border-purple-500/50 bg-purple-500/10 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-purple-100/90 transition hover:border-pink-400/70 hover:bg-purple-500/20"
          >
            <span className="text-base leading-none">{q.icon}</span>
            <span className="leading-tight">{q.top}<br/>{q.bot}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={download}
          className="group flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-yellow-300 bg-gradient-to-b from-yellow-300 to-yellow-500 px-4 py-3 font-display text-sm tracking-[0.2em] text-[#2a1500] shadow-[0_6px_0_0_#a16207,0_0_25px_-4px_rgba(250,204,21,0.7)] transition active:translate-y-[3px] active:shadow-[0_3px_0_0_#a16207]">
          <Download className="h-4 w-4" /> DOWNLOAD MEME
        </button>
        <button onClick={share} aria-label="Share meme"
          className="flex items-center justify-center rounded-lg border-2 border-cyan-400 bg-cyan-400/10 px-4 py-3 text-cyan-300 shadow-[0_0_15px_-4px_rgba(34,211,238,0.7)] hover:bg-cyan-400/20">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function FlockBucksCard({ bucks, wallet }: { bucks: number; wallet: string | null }) {
  const rows = useMemo(() => {
    if (!wallet) return FLOCK_HOLDERS;
    return [
      ...FLOCK_HOLDERS,
      { rank: 6, name: `${wallet.slice(0, 6)}…${wallet.slice(-4)}`, pts: bucks, status: "You (Wants Refund)", dot: "#f97316" },
    ];
  }, [wallet, bucks]);

  return (
    <div className="relative rounded-2xl border-2 border-green-400/70 bg-[#120826]/85 p-5 shadow-[0_0_30px_-6px_rgba(34,197,94,0.5),inset_0_0_20px_rgba(34,197,94,0.08)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-green-400/60 bg-green-500/10 text-green-300">
          <Trophy className="h-4 w-4" />
        </span>
        <div>
          <div className="font-display text-2xl tracking-wider text-green-300 [text-shadow:0_0_10px_rgba(34,197,94,0.7)]">BIRD BUCKS</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-green-200/60">
            Worthless points. <span className="text-pink-300">Definitely not market data.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[24px_1fr_auto_auto] items-center gap-3 border-b border-purple-500/30 pb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-purple-200/70">
        <span>#</span><span>Holder</span><span>Bird Bucks</span><span className="hidden sm:inline">Status</span>
      </div>

      <ul className="mt-2 space-y-2">
        {rows.map((r) => (
          <li key={r.rank}
              className="grid grid-cols-[24px_1fr_auto_auto] items-center gap-3 rounded-lg border border-purple-500/40 bg-[#0a0416] px-3 py-2.5">
            <span className="font-display text-lg text-yellow-300">{r.rank}</span>
            <span className="flex items-center gap-2 truncate">
              <span className="inline-block h-4 w-4 rounded-sm" style={{ backgroundColor: r.dot, boxShadow: `0 0 8px ${r.dot}88` }} />
              <span className="truncate font-mono text-sm text-cyan-200">{r.name}</span>
            </span>
            <span className={`font-mono text-sm tabular-nums ${r.pts < 0 ? "text-pink-400" : "text-ink"}`}>{r.pts.toLocaleString()}</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-purple-200/70 sm:inline">{r.status}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 font-mono text-[11px] leading-relaxed text-pink-200/80">
        Earn Bird Bucks by ordering, calling the kitchen, hiring employees, and making memes. They do nothing.
      </p>
    </div>
  );
}

function FlockReceiptCard({ bucks }: { bucks: number }) {
  return (
    <div className="relative rounded-2xl border-2 border-pink-400/70 bg-[#120826]/85 p-5 shadow-[0_0_30px_-6px_rgba(236,72,153,0.55),inset_0_0_20px_rgba(236,72,153,0.08)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-pink-400/60 bg-pink-500/10 text-pink-300">
          <Receipt className="h-4 w-4" />
        </span>
        <div>
          <div className="font-display text-2xl tracking-wider text-pink-300 [text-shadow:0_0_10px_rgba(236,72,153,0.7)]">YOUR RECEIPT</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-pink-200/60">Thanks for supporting Bird Burger</div>
        </div>
      </div>

      <div
        className="relative mx-auto max-w-sm rounded-sm bg-[#f4ecd8] px-6 pt-6 pb-8 font-mono text-[12px] text-[#1a1a1a] shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
        style={{
          clipPath: "polygon(0 8px,4% 0,8% 8px,12% 0,16% 8px,20% 0,24% 8px,28% 0,32% 8px,36% 0,40% 8px,44% 0,48% 8px,52% 0,56% 8px,60% 0,64% 8px,68% 0,72% 8px,76% 0,80% 8px,84% 0,88% 8px,92% 0,96% 8px,100% 0,100% calc(100% - 8px),96% 100%,92% calc(100% - 8px),88% 100%,84% calc(100% - 8px),80% 100%,76% calc(100% - 8px),72% 100%,68% calc(100% - 8px),64% 100%,60% calc(100% - 8px),56% 100%,52% calc(100% - 8px),48% 100%,44% calc(100% - 8px),40% 100%,36% calc(100% - 8px),32% 100%,28% calc(100% - 8px),24% 100%,20% calc(100% - 8px),16% 100%,12% calc(100% - 8px),8% 100%,4% calc(100% - 8px),0 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <PixelBird className="h-8 w-8" />
          <div className="font-display text-2xl tracking-wider text-[#1a1a1a]">BIRD BURGER</div>
          <div className="text-[9px] uppercase tracking-[0.25em] text-[#333]">The Worst Restaurant on the Blockchain</div>
        </div>
        <div className="my-3 border-t border-dashed border-[#1a1a1a]/50" />
        <div className="space-y-1">
          <div className="flex justify-between"><span>1x Regret Deluxe</span><span>$1.21</span></div>
          <div className="flex justify-between"><span>1x Side of Silence</span><span>$1.69</span></div>
          <div className="flex justify-between"><span>Tip (nobody earned)</span><span>$0.00</span></div>
        </div>
        <div className="my-3 border-t border-dashed border-[#1a1a1a]/50" />
        <div className="flex justify-between font-bold"><span>TOTAL</span><span>$4.19</span></div>
        <div className="mt-3 text-center text-[9px] uppercase tracking-[0.25em] text-[#555]">*** please regret your decisions ***</div>

        <div className="mt-5 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-sm border-2 border-dashed border-purple-700/70 px-4 py-2">
            <PixelBird className="h-5 w-5 opacity-70" />
            <div className="text-center leading-tight">
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#333]">Bird Bucks earned:</div>
              <div className="font-display text-2xl text-purple-700">{bucks}</div>
            </div>
            <PixelBird className="h-5 w-5 opacity-70" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PurpleBand({ bucks, wallet, onDownload }: { bucks: number; wallet: string | null; onDownload: () => void }) {
  return (
    <section
      id="community-band"
      className="relative overflow-hidden border-y-2 border-purple-500/30 py-16"
      style={{
        background:
          "radial-gradient(1200px 500px at 50% -10%, rgba(124,58,237,0.35), transparent 60%), linear-gradient(180deg, #0d0620 0%, #14082e 50%, #0d0620 100%)",
      }}
    >
      {/* pixel-dot corners */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-40 w-40 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#7c3aed 1px, transparent 1px)",
          backgroundSize: "8px 8px",
          maskImage: "linear-gradient(135deg, black, transparent)",
          WebkitMaskImage: "linear-gradient(135deg, black, transparent)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-40 w-40 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#7c3aed 1px, transparent 1px)",
          backgroundSize: "8px 8px",
          maskImage: "linear-gradient(-135deg, black, transparent)",
          WebkitMaskImage: "linear-gradient(-135deg, black, transparent)",
        }}
        aria-hidden
      />
      <SparklesDeco />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.4em] text-green-400 [text-shadow:0_0_10px_rgba(34,197,94,0.6)]">
            Holder Perks (Not Really)
          </div>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <PixelBird className="hidden h-10 w-10 md:block" />
            <h2 className="font-display text-4xl uppercase tracking-[0.08em] text-pink-300 md:text-6xl [text-shadow:0_0_15px_rgba(236,72,153,0.8),0_0_35px_rgba(236,72,153,0.5)]">
              Join the Flock
            </h2>
            <PixelBird className="hidden h-10 w-10 md:block" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <FlockMemeCard onDownload={onDownload} />
          <FlockBucksCard bucks={bucks} wallet={wallet} />
          <FlockReceiptCard bucks={bucks} />
        </div>
      </div>
    </section>
  );
}



function Nav({ open, setOpen, muted, setMuted, onConnect, wallet, wrongNet }: {
  open: boolean; setOpen: (b: boolean) => void; muted: boolean; setMuted: (b: boolean) => void;
  onConnect: () => void; wallet: string | null; wrongNet: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-grape/40 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
        <a href="#top" className="flex min-w-0 items-center gap-2">
          <img src="/favicon.png" alt="Bird Burger" width={40} height={40} className="h-10 w-10 shrink-0 rounded-md bg-bg object-cover shadow-[0_0_20px_rgba(124,58,237,0.6)]" />
          <div className="min-w-0 leading-none">
            <div className="font-display text-lg tracking-wider text-mustard">BIRD BURGER</div>
            <div className="hidden truncate text-[10px] uppercase tracking-widest text-ink/60 sm:block">The Worst Restaurant on the Blockchain</div>
          </div>
        </a>
        <nav className="hidden justify-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded px-3 py-2 text-xs font-bold uppercase tracking-widest text-ink/80 transition-colors hover:bg-grape/20 hover:text-mustard">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-md border-2 border-robin/60 bg-robin/10 px-3 py-1.5 text-[11px] font-bold uppercase text-robin md:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-robin shadow-[0_0_10px_#00C805]" />
            Store Open — Mgmt Missing
          </div>
          <button onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute sounds" : "Mute sounds"} className="grid h-10 w-10 place-items-center rounded-md border border-ink/20 text-ink/70 hover:bg-ink/10">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onConnect}
            className={`hidden items-center gap-2 rounded-md border-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all sm:inline-flex ${
              wallet
                ? wrongNet
                  ? "border-grease bg-grease/20 text-grease"
                  : "border-cyan bg-cyan/10 text-cyan"
                : "border-grape bg-grape text-white hover:bg-grape/80 shadow-[0_0_20px_rgba(124,58,237,0.5)]"
            }`}
          >
            <Wallet className="h-4 w-4" />
            {wallet ? (wrongNet ? "Wrong Restaurant" : `${wallet.slice(0, 6)}…${wallet.slice(-4)}`) : "Connect Wallet"}
          </button>
          <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-md border border-ink/20 text-ink lg:hidden" aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-grape/30 bg-card lg:hidden">
            <div className="flex flex-col p-3">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded px-3 py-3 text-sm font-bold uppercase tracking-widest text-ink/85 hover:bg-grape/20">{l.label}</a>
              ))}
              <button onClick={() => { setOpen(false); onConnect(); }} className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border-2 border-grape bg-grape px-3 py-3 text-sm font-bold uppercase text-white">
                <Wallet className="h-4 w-4" /> {wallet ? `${wallet.slice(0,6)}…${wallet.slice(-4)}` : "Connect Wallet"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─────────────────────────  HERO  ───────────────────────── */

function Hero({ onOrder, onBuy }: { onOrder: () => void; onBuy: () => void }) {
  const [counter, setCounter] = useState({ serving: 4892, order: 98391, rugged: 6942 });
  const reduced = useReducedMotion();
  useEffect(() => {
    const t = setInterval(() => {
      setCounter((c) => ({ serving: c.serving + Math.floor(Math.random() * 3), order: c.order + Math.floor(Math.random() * 2), rugged: c.rugged + Math.floor(Math.random() * 5) }));
    }, 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden border-b-2 border-grape/30">
      <div aria-hidden className="absolute inset-0 -z-10">
        <img src={kitchenBg} alt="" width={1536} height={1024} className="h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/55 to-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,140,0,0.18),transparent_50%)]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="block">THE WORST</span>
            <span className="block neon-purple">RESTAURANT</span>
            <span className="block">ON THE BLOCKCHAIN</span>
          </motion.h1>
          <div className="mt-5 inline-block rotate-[-1deg] rounded-sm bg-mustard px-3 py-1.5 font-mono text-sm font-bold text-bg shadow-[3px_3px_0_#000]">
            NO ROADMAP. NO NUTRITION. ABSOLUTELY NO REFUNDS.
          </div>
          <p className="mt-4 max-w-md text-sm text-ink/70">
            Bird Burger is a completely unnecessary meme restaurant powered by <span className="font-bold text-cyan">{BB_CONFIG.token.symbol}</span> on Robinhood Chain. Order a burger you will never receive.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={onBuy} className="group inline-flex items-center gap-2 rounded-md border-2 border-grape bg-grape px-5 py-3 font-display text-sm tracking-wider text-white shadow-[0_0_25px_rgba(124,58,237,0.6)] transition hover:translate-y-[-2px]">
              <ShoppingBag className="h-4 w-4" /> BUY THE BURGER
            </button>
            <button onClick={onOrder} className="inline-flex items-center gap-2 rounded-md border-2 border-cyan bg-cyan/10 px-5 py-3 font-display text-sm tracking-wider text-cyan hover:bg-cyan/20">
              🍟 VIEW THE MENU
            </button>
          </div>
          <div className="mt-6 inline-flex items-center gap-3 rounded-md border-2 border-mustard/60 bg-mustard/10 px-4 py-2">
            <Star className="h-4 w-4 fill-mustard text-mustard" />
            <span className="font-mono text-lg font-bold text-mustard">0.7/5</span>
            <span className="text-xs font-bold uppercase tracking-wider text-grease">Unfortunately Still Open</span>
          </div>
        </div>

        <div className="relative">
          <motion.div
            animate={reduced ? undefined : { y: [0, -14, 0], rotate: [-1, 1, -1] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto max-w-md"
          >
            <img src={mascotHero.url} alt="Bird Burger mascot holding a burger" width={1024} height={1024} className="w-full drop-shadow-[0_20px_60px_rgba(124,58,237,0.55)]" />
            <div className="absolute -left-3 -top-3 -rotate-6 rounded bg-grease px-2 py-1 font-display text-xs text-white shadow-md">GREASY</div>
            <div className="absolute -right-3 top-6 rotate-6 rounded bg-mustard px-2 py-1 font-display text-xs text-bg shadow-md">$BRGR</div>
          </motion.div>
          {/* Floating fries */}
          {!reduced && ["🍟","🍟","🍔","🕯️","🍟"].map((e, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute select-none text-2xl"
              style={{ left: `${10 + i * 18}%`, top: `${5 + (i % 3) * 25}%` }}
              animate={{ y: [0, -20, 0], rotate: [0, 12, -6, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3 }}
            >{e}</motion.span>
          ))}
          {/* Neon sign */}
          <div className="mt-4 mx-auto max-w-xs rotate-[-2deg] rounded-md border-2 border-robin bg-black/80 p-3 text-center scanlines flicker">
            <div className="font-display text-xs neon-pink">NOW ACCEPTING</div>
            <div className="font-display text-xl neon-cyan">ETH · REGRET</div>
            <div className="font-display text-xl neon-green">& POOR DECISIONS</div>
          </div>
        </div>
      </div>

      {/* Counter row */}
      <div className="mx-auto max-w-7xl border-y-2 border-grape/40 bg-black/40 px-4 py-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Now Serving" val={`#${counter.serving.toLocaleString()}`} tone="cyan" />
          <Stat label="Your Order" val={`#${counter.order.toLocaleString()}`} tone="mustard" />
          <Stat label="Estimated Wait" val="18 YEARS" tone="pink" />
          <Stat label="Burgers Rugged Today" val={counter.rugged.toLocaleString()} tone="grease" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, val, tone }: { label: string; val: string; tone: "cyan"|"mustard"|"pink"|"grease" }) {
  const cls = { cyan: "neon-cyan", mustard: "text-mustard", pink: "neon-pink", grease: "text-grease" }[tone];
  return (
    <div className="text-center">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink/60">{label}</div>
      <div className={`font-display text-xl md:text-2xl ${cls}`}>{val}</div>
    </div>
  );
}

/* ─────────────────────────  TICKER  ───────────────────────── */

function Ticker() {
  const line = [...TICKER_MSGS, ...TICKER_MSGS];
  return (
    <div className="border-b-2 border-grape/40 bg-black/60 py-2">
      <div className="flex whitespace-nowrap ticker">
        {line.map((m, i) => (
          <span key={i} className="mx-6 font-mono text-xs font-bold uppercase tracking-widest text-mustard">
            <span className="mr-6 text-grape">◆</span>
            <span className="text-grease">{m.split(" ")[0]}</span> <span className="text-ink/80">{m.split(" ").slice(1).join(" ")}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────  MENU  ───────────────────────── */

function Menu({ onOrder }: { onOrder: (name: string) => void }) {
  return (
    <section id="menu" className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle kicker="Today's Menu" title="ORDER A MISTAKE" sub="Every item is prepared with zero care and unlimited grease. Prices in USD (or Regret)." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MENU_ITEMS.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, rotate: -0.5 }}
            className="group relative rounded-lg border-2 border-grape/40 bg-card p-4 shadow-[6px_6px_0_rgba(124,58,237,0.35)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-grape/30 bg-gradient-to-br from-grape/20 to-black/60">
              <img src={m.img} alt={m.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <h3 className="font-display text-base leading-tight">{m.name}</h3>
              <span className="whitespace-nowrap font-mono text-sm font-bold text-mustard">{m.price}</span>
            </div>
            <p className="mt-1 text-xs text-ink/60">{m.desc}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className={`h-3 w-3 ${j < Math.round(m.rating) ? "fill-mustard text-mustard" : "text-ink/20"}`} />
              ))}
              <span className="ml-1 text-ink/50">{m.rating.toFixed(1)}</span>
            </div>
            <button onClick={() => onOrder(m.name)} className="mt-3 w-full rounded-md border-2 border-cyan bg-cyan/10 py-2 font-display text-xs tracking-widest text-cyan transition group-hover:bg-cyan group-hover:text-bg">
              ORDER
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────  ORDER MODAL  ───────────────────────── */

const BUN_OPTIONS = [
  { id: "sesame",  label: "Sesame (Rugged)",     emoji: "🍞", surcharge: 0.42 },
  { id: "brioche", label: "Brioche (Overfluffed)", emoji: "🥐", surcharge: 1.11 },
  { id: "nobun",   label: "No Bun (Nothing Burger)", emoji: "🫥", surcharge: -0.69 },
];
const SIDE_OPTIONS = [
  { id: "fries",  label: "Liquidity Fries",     emoji: "🍟", price: 2.10 },
  { id: "nugs",   label: "Nugget Airdrop (x6)", emoji: "🐔", price: 4.20 },
  { id: "silence",label: "Side of Silence",     emoji: "🤫", price: 1.69 },
  { id: "coin",   label: "Chocolate Rug Coin",  emoji: "🍫", price: 0.99 },
];
const TOPPING_OPTIONS = [
  { id: "copium",  label: "Copium",       emoji: "💊", price: 0.42 },
  { id: "hopium",  label: "Hopium",       emoji: "🌈", price: 0.42 },
  { id: "regret",  label: "Extra Regret", emoji: "😔", price: 0.01 },
  { id: "diamond", label: "Diamond Sauce",emoji: "💎", price: 6.90 },
];
const DELUSION_TIERS = [
  { id: "paper",   label: "Paper Hands",   emoji: "🧻", mult: 0.8 },
  { id: "diamond", label: "Diamond Hands", emoji: "💎", mult: 1.4 },
  { id: "ape",     label: "Full Ape",      emoji: "🦍", mult: 2.5 },
];
const COOK_STAGES = [
  { pct: 12,  txt: "Waking up the chef…" },
  { pct: 28,  txt: "Chef fainted. Trying again…" },
  { pct: 46,  txt: "Burning the bun (on purpose)…" },
  { pct: 62,  txt: "Reversing the transaction…" },
  { pct: 78,  txt: "Dropping fries into the void…" },
  { pct: 92,  txt: "Yelling at the manager…" },
  { pct: 100, txt: "Sealing your regret." },
];

function OrderModal({ item, onClose, onSent }: { item: string; onClose: () => void; onSent?: () => void }) {
  const [step, setStep] = useState<"customize" | "cooking" | "receipt">("customize");
  const [qty, setQty] = useState(1);
  const [bun, setBun] = useState(BUN_OPTIONS[0]!.id);
  const [chaos, setChaos] = useState(6);
  const [sides, setSides] = useState<string[]>(["fries"]);
  const [toppings, setToppings] = useState<string[]>(["regret"]);
  const [delusion, setDelusion] = useState(DELUSION_TIERS[1]!.id);
  const [cookPct, setCookPct] = useState(0);
  const [cookMsg, setCookMsg] = useState(COOK_STAGES[0]!.txt);
  const orderId = useMemo(() => Math.floor(Math.random() * 900000 + 100000), []);

  const bunObj = BUN_OPTIONS.find((b) => b.id === bun)!;
  const delusionObj = DELUSION_TIERS.find((d) => d.id === delusion)!;
  const chosenSides = SIDE_OPTIONS.filter((s) => sides.includes(s.id));
  const chosenToppings = TOPPING_OPTIONS.filter((t) => toppings.includes(t.id));

  const basePrice = 4.20;
  const itemSubtotal = (basePrice + bunObj.surcharge) * qty;
  const sidesTotal = chosenSides.reduce((a, s) => a + s.price, 0);
  const toppingsTotal = chosenToppings.reduce((a, t) => a + t.price, 0) * qty;
  const chaosFee = (chaos * 0.13);
  const preTotal = (itemSubtotal + sidesTotal + toppingsTotal + chaosFee) * delusionObj.mult;
  const gasFee = 4.20;
  const total = preTotal + gasFee;

  const toggle = (arr: string[], setArr: (v: string[]) => void, id: string) =>
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const sendToKitchen = () => {
    setStep("cooking");
    onSent?.();
    let i = 0;
    const tick = () => {
      const stage = COOK_STAGES[i]!;
      setCookPct(stage.pct);
      setCookMsg(stage.txt);
      i++;
      if (i < COOK_STAGES.length) {
        setTimeout(tick, 480 + Math.random() * 220);
      } else {
        setTimeout(() => setStep("receipt"), 420);
      }
    };
    tick();
  };

  const shareReceipt = async () => {
    const text = `Just ordered ${qty}× ${item} at Bird Burger. Total: $${total.toFixed(2)} of pure regret. 🐦🍔 ETA: never.`;
    try {
      if (navigator.share) await navigator.share({ title: "Bird Burger", text });
      else await navigator.clipboard.writeText(text);
    } catch {}
  };

  const receiptLines = useMemo(() => {
    const lines: { label: string; price: string; tone?: "neg" | "big" }[] = [];
    lines.push({ label: `${qty} × ${item.slice(0, 22)}`, price: `$${itemSubtotal.toFixed(2)}` });
    lines.push({ label: `  bun: ${bunObj.label}`, price: bunObj.surcharge >= 0 ? `+$${bunObj.surcharge.toFixed(2)}` : `-$${Math.abs(bunObj.surcharge).toFixed(2)}`, tone: bunObj.surcharge < 0 ? "neg" : undefined });
    if (chosenToppings.length) {
      chosenToppings.forEach((t) => lines.push({ label: `  + ${t.label}`, price: `$${(t.price * qty).toFixed(2)}` }));
    }
    chosenSides.forEach((s) => lines.push({ label: `1 × ${s.label}`, price: `$${s.price.toFixed(2)}` }));
    lines.push({ label: `Chaos Level ${chaos}/10`, price: `$${chaosFee.toFixed(2)}` });
    lines.push({ label: `${delusionObj.label} multiplier`, price: `×${delusionObj.mult.toFixed(1)}` });
    lines.push({ label: "Gas (paid to nobody)", price: `$${gasFee.toFixed(2)}` });
    lines.push({ label: "TOTAL", price: `$${total.toFixed(2)}`, tone: "big" });
    return lines;
  }, [qty, item, itemSubtotal, bunObj, chosenToppings, chosenSides, chaos, chaosFee, delusionObj, gasFee, total]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        key={step}
        initial={{ y: 40, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        {step === "customize" && (
          <div className="rounded-2xl border-2 border-mustard/70 bg-[#120826] p-5 shadow-[0_0_40px_-6px_rgba(250,204,21,0.5)]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-mustard/80">Build your regret</div>
                <div className="font-display text-2xl uppercase tracking-wider text-mustard [text-shadow:0_0_10px_rgba(250,204,21,0.6)]">{item}</div>
              </div>
              <button onClick={onClose} aria-label="Close" className="rounded-full border border-ink/20 p-1.5 text-ink/60 hover:text-ink"><X className="h-4 w-4"/></button>
            </div>

            <div className="max-h-[62vh] space-y-4 overflow-y-auto pr-1">
              <Field label="Bun Situation">
                <div className="grid grid-cols-3 gap-2">
                  {BUN_OPTIONS.map((b) => (
                    <button key={b.id} onClick={() => setBun(b.id)}
                      className={`rounded-lg border-2 px-2 py-2 text-left font-mono text-[10px] uppercase tracking-wider transition ${bun === b.id ? "border-pink-400 bg-pink-400/10 text-pink-200" : "border-purple-500/40 bg-black/40 text-ink/80 hover:border-purple-400"}`}>
                      <div className="text-lg leading-none">{b.emoji}</div>
                      <div className="mt-1 leading-tight">{b.label}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={`Chaos Level: ${chaos}/10`}>
                <input type="range" min={0} max={10} value={chaos} onChange={(e) => setChaos(parseInt(e.target.value, 10))}
                  className="w-full accent-pink-400"/>
                <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-widest text-ink/50">
                  <span>Mild disappointment</span><span>Full rug</span>
                </div>
              </Field>

              <Field label="Sides (pick your poisons)">
                <div className="grid grid-cols-2 gap-2">
                  {SIDE_OPTIONS.map((s) => {
                    const on = sides.includes(s.id);
                    return (
                      <button key={s.id} onClick={() => toggle(sides, setSides, s.id)}
                        className={`flex items-center justify-between gap-2 rounded-lg border-2 px-3 py-2 text-left font-mono text-[11px] transition ${on ? "border-cyan-400 bg-cyan-400/10 text-cyan-200" : "border-purple-500/40 bg-black/40 text-ink/80"}`}>
                        <span className="flex items-center gap-2"><span className="text-base">{s.emoji}</span>{s.label}</span>
                        <span className="text-mustard">${s.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Toppings">
                <div className="flex flex-wrap gap-2">
                  {TOPPING_OPTIONS.map((t) => {
                    const on = toppings.includes(t.id);
                    return (
                      <button key={t.id} onClick={() => toggle(toppings, setToppings, t.id)}
                        className={`rounded-full border px-3 py-1.5 font-mono text-[11px] transition ${on ? "border-green-400 bg-green-400/15 text-green-200" : "border-purple-500/40 bg-black/40 text-ink/80"}`}>
                        {t.emoji} {t.label} <span className="opacity-60">${t.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Delusion Tier">
                <div className="grid grid-cols-3 gap-2">
                  {DELUSION_TIERS.map((d) => (
                    <button key={d.id} onClick={() => setDelusion(d.id)}
                      className={`rounded-lg border-2 px-2 py-2 text-center font-mono text-[10px] uppercase tracking-wider transition ${delusion === d.id ? "border-mustard bg-mustard/10 text-mustard" : "border-purple-500/40 bg-black/40 text-ink/80"}`}>
                      <div className="text-lg leading-none">{d.emoji}</div>
                      <div className="mt-1 leading-tight">{d.label}</div>
                      <div className="text-[9px] opacity-70">×{d.mult.toFixed(1)}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Quantity">
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 rounded-lg border-2 border-purple-500/50 bg-black/40 font-display text-lg text-ink">−</button>
                  <div className="min-w-[3ch] text-center font-display text-2xl text-mustard">{qty}</div>
                  <button onClick={() => setQty(Math.min(99, qty + 1))} className="h-9 w-9 rounded-lg border-2 border-purple-500/50 bg-black/40 font-display text-lg text-ink">+</button>
                  <div className="ml-auto font-mono text-xs text-ink/70">Est. regret: <span className="text-mustard">${total.toFixed(2)}</span></div>
                </div>
              </Field>
            </div>

            <button
              onClick={sendToKitchen}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-yellow-300 bg-gradient-to-b from-yellow-300 to-yellow-500 px-4 py-3 font-display text-sm tracking-[0.2em] text-[#2a1500] shadow-[0_6px_0_0_#a16207,0_0_30px_-4px_rgba(250,204,21,0.7)] transition active:translate-y-[3px] active:shadow-[0_3px_0_0_#a16207]"
            >
              <Flame className="h-4 w-4" /> SEND TO KITCHEN
            </button>
            <div className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-ink/50">
              No food. No refunds. No comment.
            </div>
          </div>
        )}

        {step === "cooking" && (
          <div className="relative overflow-hidden rounded-2xl border-2 border-pink-400/70 bg-[#120826] p-8 text-center shadow-[0_0_40px_-6px_rgba(236,72,153,0.6)]">
            <div className="pointer-events-none absolute inset-0 opacity-25" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 4px)" }} />
            <motion.div animate={{ rotate: [0, -8, 8, -6, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="mx-auto mb-4 text-6xl">🍳</motion.div>
            <div className="font-display text-2xl uppercase tracking-wider text-pink-300 [text-shadow:0_0_10px_rgba(236,72,153,0.7)]">Sending to Kitchen…</div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/60">Order #{orderId}</div>

            <div className="mx-auto mt-6 h-4 w-full max-w-sm overflow-hidden rounded-full border-2 border-purple-500/50 bg-black/60">
              <motion.div
                animate={{ width: `${cookPct}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-pink-500 via-mustard to-green-400"
                style={{ boxShadow: "0 0 20px rgba(236,72,153,0.7)" }}
              />
            </div>
            <div className="mt-3 font-mono text-xs text-mustard">{cookPct}%</div>

            <motion.div
              key={cookMsg}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 font-mono text-sm text-ink/90"
            >
              {cookMsg}
              <span className="ml-1 inline-block animate-pulse">…</span>
            </motion.div>

            <div className="mt-6 flex justify-center gap-1">
              {[0,1,2,3,4].map((i) => (
                <motion.span key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                  className="h-2 w-2 rounded-full bg-pink-400"
                />
              ))}
            </div>
          </div>
        )}

        {step === "receipt" && (
          <motion.div
            initial={{ y: -400, rotate: -3 }}
            animate={{ y: 0, rotate: -1 }}
            transition={{ type: "spring", damping: 18 }}
            className="relative mx-auto max-w-sm bg-[#f4ecd8] px-6 pt-6 pb-8 font-mono text-[12px] text-[#1a1a1a] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            style={{
              clipPath:
                "polygon(0 8px,4% 0,8% 8px,12% 0,16% 8px,20% 0,24% 8px,28% 0,32% 8px,36% 0,40% 8px,44% 0,48% 8px,52% 0,56% 8px,60% 0,64% 8px,68% 0,72% 8px,76% 0,80% 8px,84% 0,88% 8px,92% 0,96% 8px,100% 0,100% calc(100% - 8px),96% 100%,92% calc(100% - 8px),88% 100%,84% calc(100% - 8px),80% 100%,76% calc(100% - 8px),72% 100%,68% calc(100% - 8px),64% 100%,60% calc(100% - 8px),56% 100%,52% calc(100% - 8px),48% 100%,44% calc(100% - 8px),40% 100%,36% calc(100% - 8px),32% 100%,28% calc(100% - 8px),24% 100%,20% calc(100% - 8px),16% 100%,12% calc(100% - 8px),8% 100%,4% calc(100% - 8px),0 100%)",
            }}
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-center">
              <div className="font-display text-2xl tracking-wider">BIRD BURGER</div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#333]">Order Confirmed · Regret Pending</div>
              <div className="mt-2 border-y-2 border-dashed border-[#1a1a1a]/50 py-1 text-[10px]">
                RECEIPT #{orderId} · {new Date().toLocaleTimeString()}
              </div>
            </motion.div>

            <ul className="mt-3 space-y-1">
              {receiptLines.map((l, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.15, duration: 0.25 }}
                  className={`flex justify-between ${l.tone === "big" ? "mt-2 border-t-2 border-dashed border-[#1a1a1a]/50 pt-2 font-display text-sm" : ""} ${l.tone === "neg" ? "text-[#a04040]" : ""}`}
                >
                  <span>{l.label}</span>
                  <span className={l.tone === "big" ? "font-bold" : ""}>{l.price}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: -14, opacity: 1 }}
              transition={{ delay: 0.35 + receiptLines.length * 0.15 + 0.1, type: "spring", damping: 10, stiffness: 200 }}
              className="mx-auto mt-4 w-fit rounded-md border-4 border-[#a01818] px-4 py-1 font-display text-lg uppercase tracking-widest text-[#a01818]"
              style={{ textShadow: "0 0 1px rgba(160,24,24,0.3)" }}
            >
              PAID IN REGRET
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 + receiptLines.length * 0.15 + 0.35 }}
              className="mt-3 text-center text-[9px] uppercase tracking-[0.25em] text-[#555]"
            >
              *** please regret your decisions ***
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + receiptLines.length * 0.15 + 0.5 }}
              className="mt-4 grid gap-2"
            >
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded border-2 border-[#1a1a1a] py-2 text-[10px] font-bold uppercase tracking-widest">
                <Printer className="h-3.5 w-3.5"/>Print My Regret
              </button>
              <button onClick={shareReceipt} className="flex items-center justify-center gap-2 rounded border-2 border-grape bg-grape py-2 text-[10px] font-bold uppercase tracking-widest text-white">
                <Share2 className="h-3.5 w-3.5"/>Share Receipt
              </button>
              <button onClick={onClose} className="flex items-center justify-center gap-2 rounded border-2 border-[#5a2a2a] bg-[#7a3535] py-2 text-[10px] font-bold uppercase tracking-widest text-white">
                <Trash2 className="h-3.5 w-3.5"/>Order Another Mistake
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">{label}</div>
      {children}
    </div>
  );
}

/* ─────────────────────────  KITCHEN STATUS  ───────────────────────── */

function KitchenStatus({ onRefresh }: { onRefresh: () => void }) {
  const [rows, setRows] = useState(() => STATUS_ROWS.map(([k, opts]) => [k, opts[0]] as [string, string]));
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setRows((rs) => {
        const idx = Math.floor(Math.random() * rs.length);
        const opts = STATUS_ROWS[idx]![1];
        const next = [...rs];
        next[idx] = [rs[idx]![0], opts[Math.floor(Math.random() * opts.length)]!];
        return next;
      });
    }, 25000);
    return () => clearInterval(t);
  }, []);
  const scramble = () => {
    setLoading(true); onRefresh();
    setTimeout(() => {
      setRows(STATUS_ROWS.map(([k, opts]) => [k, opts[Math.floor(Math.random() * opts.length)]!] as [string, string]));
      setLoading(false);
    }, 700);
  };
  return (
    <div className="rounded-lg border-2 border-robin/50 bg-black/70 p-4 scanlines">
      <div className="mb-3 text-center font-display text-lg neon-green">KITCHEN STATUS</div>
      <ul className="space-y-1.5 font-mono text-xs">
        {rows.map(([k, v]) => (
          <li key={k} className="flex items-center justify-between gap-2 border-b border-robin/10 pb-1">
            <span className="flex items-center gap-2 text-ink/85"><span className="h-2 w-2 rounded-full bg-mustard shadow-[0_0_6px_#FACC15]"/> {k.toUpperCase()}</span>
            <span className="text-right text-grease">{loading ? "…scrambling" : v}</span>
          </li>
        ))}
      </ul>
      <button onClick={scramble} className="mt-3 flex w-full items-center justify-center gap-2 rounded border-2 border-robin bg-robin/10 py-2 font-display text-xs tracking-widest text-robin hover:bg-robin/20">
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}/> REFRESH THE LIES
      </button>
    </div>
  );
}

/* ─────────────────────────  KITCHEN CAM  ───────────────────────── */

function KitchenCam({ onIncident }: { onIncident: () => void }) {
  const [overlay, setOverlay] = useState<string>("MOTION DETECTED");
  const [incident, setIncident] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [clipping, setClipping] = useState(false);
  const [clipPct, setClipPct] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const camImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const t = setInterval(() => setOverlay(rand(CAM_OVERLAYS)), 5000);
    const t2 = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = kitchenCamImg.url;
    img.onload = () => { camImgRef.current = img; };
    return () => { clearInterval(t); clearInterval(t2); };
  }, []);
  const trigger = () => {
    onIncident();
    const inc = rand(INCIDENTS);
    setIncident(inc);
    setTimeout(() => setIncident(null), 1800);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const buildClip = async (): Promise<Blob | null> => {
    try {
      const [{ default: GIF }, workerUrlMod] = await Promise.all([
        import("gif.js"),
        import("gif.js/dist/gif.worker.js?url"),
      ]);
      // wait for cam image
      if (!camImgRef.current) {
        await new Promise<void>((res) => {
          const check = () => camImgRef.current ? res() : setTimeout(check, 50);
          check();
        });
      }
      const W = 480, H = 270;
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const ctx = off.getContext("2d")!;
      const gif = new GIF({
        workers: 2,
        quality: 8,
        width: W,
        height: H,
        workerScript: (workerUrlMod as { default: string }).default,
      });
      const FRAMES = 36;
      const DELAY = 80; // ~2.9s loop
      const baseTime = new Date();
      const pickedOverlay = overlay || rand(CAM_OVERLAYS);
      for (let i = 0; i < FRAMES; i++) {
        // background image with slight jitter/zoom for CCTV feel
        const jx = ((i * 53) % 5) - 2;
        const jy = ((i * 97) % 5) - 2;
        ctx.save();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        const img = camImgRef.current!;
        // cover
        const ir = img.width / img.height;
        const cr = W / H;
        let dw = W, dh = H, dx = 0, dy = 0;
        if (ir > cr) { dh = H; dw = H * ir; dx = (W - dw) / 2; }
        else { dw = W; dh = W / ir; dy = (H - dh) / 2; }
        ctx.drawImage(img, dx + jx, dy + jy, dw, dh);
        ctx.restore();

        // purple radial vignette
        const rad = ctx.createRadialGradient(W/2, H*0.6, 20, W/2, H*0.6, W*0.7);
        rad.addColorStop(0, "rgba(124,58,237,0.10)");
        rad.addColorStop(1, "rgba(0,0,0,0.65)");
        ctx.fillStyle = rad; ctx.fillRect(0, 0, W, H);

        // scanlines (drift)
        ctx.globalAlpha = 0.22;
        const shift = i % 3;
        ctx.fillStyle = "#000";
        for (let y = shift; y < H; y += 3) ctx.fillRect(0, y, W, 1);
        ctx.globalAlpha = 1;

        // flicker
        if (i % 7 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(0, 0, W, H);
        }

        // top-left CAM label
        ctx.fillStyle = "#c9c1a5";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillText("CAM 04 — FRY STATION", 8, 8);

        // top-right timestamp (ticks per frame)
        const t = new Date(baseTime.getTime() + i * 80);
        const hh = String(t.getHours()).padStart(2, "0");
        const mm = String(t.getMinutes()).padStart(2, "0");
        const ss = String(t.getSeconds()).padStart(2, "0");
        const ms = String(t.getMilliseconds()).padStart(3, "0").slice(0, 2);
        ctx.fillStyle = "#22d3ee";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${hh}:${mm}:${ss}.${ms}`, W - 8, 8);

        // REC blinking dot
        if (i % 8 < 5) {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath(); ctx.arc(W - 14, 28, 4, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "right";
          ctx.fillText("REC", W - 22, 24);
        }

        // bottom-left overlay pill
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        const label = `⚠ ${pickedOverlay}`;
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = "rgba(124,58,237,0.35)";
        ctx.fillRect(8, H - 24, tw + 14, 18);
        ctx.fillStyle = "#c9c1a5";
        ctx.fillText(label, 15, H - 11);

        // bottom-right watermark
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(250,204,21,0.85)";
        ctx.fillText("BIRDBURGER.CAM", W - 8, H - 8);

        gif.addFrame(ctx, { copy: true, delay: DELAY });
      }

      return await new Promise<Blob>((resolve, reject) => {
        gif.on("progress", (p: number) => setClipPct(Math.round(p * 100)));
        gif.on("finished", (blob: Blob) => resolve(blob));
        try { gif.render(); } catch (e) { reject(e); }
      });
    } catch (err) {
      console.error("Clip build failed", err);
      return null;
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const shareTo = async (target: "x" | "discord") => {
    if (clipping) return;
    setClipping(true); setClipPct(0);
    const caption =
      target === "x"
        ? `LEAKED FOOTAGE from the Bird Burger kitchen 🐦🍔🔥\nThey're melting the fryer AGAIN. $BRGR to the moon (or the morgue).\n#BirdBurger #BRGR`
        : `📼 leaked kitchen cam clip from Bird Burger — attach the GIF below 👇\n$BRGR // birdburger.cam`;
    const blob = await buildClip();
    setClipping(false); setClipPct(0);
    if (!blob) { showToast("Clip render failed. Try again."); return; }

    // Try native share with the file first (mobile)
    const file = new File([blob], `bird-burger-cam-${Date.now()}.gif`, { type: "image/gif" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: caption, title: "Bird Burger Kitchen Cam" });
        onIncident();
        showToast("Clip shared.");
        return;
      } catch { /* fall through to desktop flow */ }
    }

    // Desktop: download the GIF, copy caption, open target compose window
    downloadBlob(blob, `bird-burger-cam.gif`);
    try { await navigator.clipboard.writeText(caption); } catch {}
    if (target === "x") {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      showToast("GIF downloaded · caption copied · X opened. Attach the GIF!");
    } else {
      window.open("https://discord.com/channels/@me", "_blank", "noopener,noreferrer");
      showToast("GIF downloaded · caption copied · Discord opened. Drop the GIF in chat!");
    }
    onIncident();
  };

  return (
    <div id="kitchen-cam" className="relative overflow-hidden rounded-lg border-2 border-cyan/50 bg-black">
      <div className="flex items-center justify-between border-b border-cyan/30 bg-black/80 px-3 py-2 font-mono text-xs">
        <span className="font-display neon-cyan text-sm">LIVE KITCHEN CAM</span>
        <span className="flex items-center gap-1.5 text-grease"><span className="h-2 w-2 animate-pulse rounded-full bg-grease"/>LIVE</span>
      </div>
      <div className="relative aspect-video overflow-hidden scanlines">
        <img
          src={kitchenCamImg.url}
          alt="Bird Burger kitchen surveillance feed"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(124,58,237,0.15),transparent_70%)] mix-blend-overlay"/>
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 0.15, repeat: Infinity }}
          className="absolute inset-0 bg-white/10 pointer-events-none"
        />
        <div className="absolute left-2 top-2 font-mono text-[10px] text-grease">CAM 04 — FRY STATION</div>
        <div className="absolute right-2 top-2 font-mono text-[10px] text-cyan">{time}</div>
        <AnimatePresence>
          <motion.div key={overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-2 left-2 rounded bg-grease/20 px-2 py-1 font-mono text-[10px] font-bold uppercase text-grease">
            ⚠ {overlay}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {incident === "smoke" && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 3 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center text-8xl">💨</motion.div>
          )}
          {incident === "fries" && Array.from({length:12}).map((_,i)=>(
            <motion.div key={i} initial={{ x: -20, y: 200, opacity: 1 }} animate={{ x: 400 + i*10, y: -50, rotate: 360 }} transition={{ duration: 1.5 }} className="absolute text-2xl">🍟</motion.div>
          ))}
          {incident === "red" && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-grease/40 mix-blend-multiply"/>}
          {incident === "runby" && <motion.div initial={{x:-100,y:80}} animate={{x:500}} transition={{duration:1}} className="absolute text-5xl">🐦</motion.div>}
          {incident === "explosion" && <motion.div initial={{scale:0}} animate={{scale:5}} exit={{opacity:0}} className="absolute inset-0 grid place-items-center text-9xl">💥</motion.div>}
          {incident === "rug" && <motion.div initial={{y:200}} animate={{y:0}} className="absolute inset-0 grid place-items-center bg-black/80 font-display text-xl neon-pink">RESTAURANT TEMPORARILY RUGGED</motion.div>}
        </AnimatePresence>
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-2 top-8 mx-auto max-w-[90%] rounded border-2 border-mustard bg-black/90 px-3 py-2 text-center font-mono text-[11px] text-mustard shadow-lg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
        {clipping && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-[1px]">
            <div className="rounded border-2 border-cyan bg-black/80 px-4 py-3 text-center">
              <div className="font-display text-sm text-cyan">RENDERING LEAKED CLIP</div>
              <div className="mt-1 font-mono text-xs text-grease">{clipPct}% · scanlines applied</div>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 border-t-2 border-grape">
        <button
          onClick={trigger}
          className="border-r border-grape/60 bg-grape py-2.5 font-display text-[11px] tracking-widest text-white hover:bg-grape/80"
        >
          INCIDENT ✨
        </button>
        <button
          onClick={() => shareTo("x")}
          disabled={clipping}
          className="border-r border-grape/60 bg-black py-2.5 font-display text-[11px] tracking-widest text-cyan hover:bg-cyan/10 disabled:opacity-60"
          title="Share leaked clip to X"
        >
          {clipping ? `… ${clipPct}%` : "LEAK TO 𝕏"}
        </button>
        <button
          onClick={() => shareTo("discord")}
          disabled={clipping}
          className="bg-black py-2.5 font-display text-[11px] tracking-widest text-mustard hover:bg-mustard/10 disabled:opacity-60"
          title="Share leaked clip to Discord"
        >
          {clipping ? `… ${clipPct}%` : "LEAK TO DISCORD"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────  BIRD OF THE DAY  ───────────────────────── */

function BirdOfTheDay({ onFire }: { onFire: () => void }) {
  const [idx, setIdx] = useState(0);
  const [fired, setFired] = useState(0);
  const emp = EMPLOYEES[idx]!;
  const fire = () => {
    onFire();
    setFired((f) => f + 1);
    setTimeout(() => setIdx((i) => (i + 1 + Math.floor(Math.random() * (EMPLOYEES.length - 1))) % EMPLOYEES.length), 400);
  };
  return (
    <div id="bird-of-the-day" className="rounded-lg border-2 border-mustard/50 bg-card p-4">
      <div className="text-center font-display text-lg text-mustard">★ BIRD OF THE DAY ★</div>
      <AnimatePresence mode="wait">
        <motion.div key={emp.name} initial={{ x: 200, opacity: 0, rotate: 15 }} animate={{ x: 0, opacity: 1, rotate: 0 }} exit={{ x: -400, opacity: 0, rotate: -20 }} transition={{ type: "spring", damping: 15 }}>
          <div className="mt-3 flex gap-3">
            <img src={mascotHero.url} alt="Employee" loading="lazy" width={1024} height={1024} className="h-24 w-24 rounded border-2 border-grape bg-grape/20 object-cover"/>
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg neon-purple truncate">{emp.name.toUpperCase()}</div>
              <div className="text-xs text-ink/70">{emp.role}</div>
              <div className="mt-1 inline-block rounded bg-grease/20 px-2 py-0.5 text-[10px] font-bold uppercase text-grease">TERMINATED</div>
            </div>
          </div>
          <ul className="mt-3 space-y-1 font-mono text-xs text-ink/80">
            <li><span className="text-mustard">REASON:</span> {emp.reason}</li>
            <li><span className="text-mustard">WALLET:</span> <span className="text-grease">{emp.perf}</span></li>
            <li><span className="text-mustard">SKILL:</span> {emp.skill}</li>
          </ul>
        </motion.div>
      </AnimatePresence>
      <button onClick={fire} className="mt-3 flex w-full items-center justify-center gap-2 rounded border-2 border-grease bg-grease py-2 font-display text-xs tracking-widest text-white hover:bg-grease/80">
        <Flame className="h-3.5 w-3.5"/> FIRE THIS EMPLOYEE
      </button>
      <div className="mt-2 text-center font-mono text-[10px] text-ink/60">Employees Fired Today: <span className="text-grease">{(1247 + fired).toLocaleString()}</span></div>
    </div>
  );
}

/* ─────────────────────────  CALL THE KITCHEN  ───────────────────────── */

function CallTheKitchen({ onStart, onEnd }: { onStart: () => void; onEnd: () => void }) {
  const [state, setState] = useState<"idle"|"dialing"|"live"|"done">("idle");
  const [log, setLog] = useState<{ who: "them"|"me"; text: string }[]>([]);
  const [timer, setTimer] = useState(0);
  const [ending, setEnding] = useState("");
  useEffect(() => {
    if (state !== "live") return;
    const t = setInterval(() => setTimer((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const start = () => {
    onStart(); setState("dialing"); setLog([]); setTimer(0);
    setTimeout(() => { setState("live"); setLog([{ who: "them", text: rand(CALL_LINES) }]); }, 1400);
  };
  const say = (text: string) => {
    setLog((l) => [...l, { who: "me", text }, { who: "them", text: rand(CALL_LINES) }]);
    if (log.length >= 6) {
      setTimeout(() => { setEnding(rand(CALL_ENDINGS)); setState("done"); onEnd(); }, 800);
    }
  };
  const share = async () => {
    const text = `I called Bird Burger. Result: ${ending} 🐦☎️ ${BB_CONFIG.brand.tagline}`;
    try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch {}
  };
  const mm = String(Math.floor(timer/60)).padStart(2,"0");
  const ss = String(timer%60).padStart(2,"0");
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle kicker="Phone Simulator" title="CALL THE KITCHEN" sub="Speak directly with someone who should not be employed. Not a real phone line — no real numbers involved." />
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border-2 border-cyan/50 bg-black/70 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
        <div className="flex items-center justify-between border-b border-cyan/30 bg-black/60 px-4 py-2 font-mono text-xs">
          <span className="flex items-center gap-2 text-cyan"><Phone className="h-3.5 w-3.5"/> DRIVE-THRU LINE</span>
          <span className="text-mustard">{mm}:{ss}</span>
        </div>
        <div className="min-h-[280px] space-y-2 p-4">
          {state === "idle" && (
            <div className="grid place-items-center py-10 text-center">
              <div className="mb-4 text-6xl">☎️</div>
              <p className="mb-4 max-w-xs text-sm text-ink/70">Calls may be recorded for our own entertainment.</p>
              <button onClick={start} className="rounded-md border-2 border-cyan bg-cyan px-6 py-3 font-display text-sm tracking-widest text-bg shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:bg-cyan/80">
                START CALL
              </button>
            </div>
          )}
          {state === "dialing" && (
            <div className="grid place-items-center py-14 text-center">
              <motion.div animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 0.6, repeat: Infinity }} className="mb-3 text-5xl">📞</motion.div>
              <div className="font-display text-lg neon-cyan">Dialing Bird Burger…</div>
              <div className="mt-1 font-mono text-xs text-ink/50">ringing… ringing… ringing…</div>
            </div>
          )}
          {(state === "live" || state === "done") && (
            <div className="space-y-2">
              {log.map((m, i) => (
                <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.who === "them" ? "bg-grape/30 text-ink" : "ml-auto bg-cyan/20 text-cyan"}`}>
                  <div className="mb-0.5 text-[10px] font-bold uppercase opacity-60">{m.who === "them" ? "Employee" : "You"}</div>
                  {m.text}
                </div>
              ))}
              {state === "live" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {USER_OPTIONS.map((o) => (
                    <button key={o} onClick={() => say(o)} className="rounded-md border border-cyan/50 bg-cyan/10 px-3 py-1.5 text-xs text-cyan hover:bg-cyan/20">{o}</button>
                  ))}
                </div>
              )}
              {state === "done" && (
                <div className="mt-4 rounded-md border-2 border-grease bg-grease/10 p-3 text-center">
                  <div className="flex items-center justify-center gap-2 font-display text-grease"><PhoneOff className="h-4 w-4"/> CALL DISCONNECTED</div>
                  <div className="mt-1 text-xs text-ink/70">{ending}</div>
                  <div className="mt-3 flex justify-center gap-2">
                    <button onClick={share} className="rounded border border-cyan/50 bg-cyan/10 px-3 py-1.5 text-xs text-cyan"><Share2 className="mr-1 inline h-3 w-3"/>Share Call Result</button>
                    <button onClick={() => setState("idle")} className="rounded border border-grape/60 bg-grape/20 px-3 py-1.5 text-xs text-ink">Call Again</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  REVIEWS  ───────────────────────── */

function Reviews() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % REVIEWS.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="border-y-2 border-grape/30 bg-black/40 py-12">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-mustard">Restaurant Reviews</div>
        <div className="mb-6 font-display text-2xl md:text-3xl">WHAT THE VICTIMS ARE SAYING</div>
        <AnimatePresence mode="wait">
          <motion.blockquote key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-lg border-2 border-mustard/40 bg-card p-6">
            <div className="mb-2 flex justify-center gap-0.5">
              {Array.from({length:5}).map((_,j)=>(<Star key={j} className={`h-4 w-4 ${j < REVIEWS[i]!.stars ? "fill-mustard text-mustard" : "text-ink/20"}`}/>))}
            </div>
            <p className="text-lg italic">"{REVIEWS[i]!.text}"</p>
            <footer className="mt-3 font-mono text-xs text-cyan">— {REVIEWS[i]!.who}</footer>
          </motion.blockquote>
        </AnimatePresence>
        <div className="mt-4 flex justify-center gap-1.5">
          {REVIEWS.map((_, j) => (
            <button key={j} onClick={() => setI(j)} className={`h-2 w-2 rounded-full ${j === i ? "bg-mustard w-6" : "bg-ink/30"} transition-all`} aria-label={`review ${j+1}`}/>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  MEME GENERATOR  ───────────────────────── */

function MemeGenerator({ onDownload, embedded = false }: { onDownload: () => void; embedded?: boolean }) {
  const [top, setTop] = useState("THE BURGER IS");
  const [bot, setBot] = useState("DECENTRALIZED");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = 800; c.height = 800;
    ctx.fillStyle = "#7C3AED"; ctx.fillRect(0,0,800,800);
    const img = new Image(); img.crossOrigin = "anonymous"; img.src = mascotHero.url;
    img.onload = () => {
      ctx.drawImage(img, 100, 100, 600, 600);
      ctx.font = "bold 64px Impact, sans-serif";
      ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.strokeStyle = "#000"; ctx.lineWidth = 6;
      ctx.strokeText(top, 400, 90); ctx.fillText(top, 400, 90);
      ctx.strokeText(bot, 400, 760); ctx.fillText(bot, 400, 760);
    };
  };
  useEffect(() => { draw(); }, [top, bot]);
  const download = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a"); a.download = "bird-burger-meme.png"; a.href = c.toDataURL("image/png"); a.click();
    onDownload();
  };
  const share = async () => {
    const text = `${top} ${bot} — from Bird Burger 🐦🍔`;
    try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch {}
  };
  const body = (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr] items-start">
      <div className="rounded-lg border-2 border-grape/50 bg-black/40 p-3">
        <canvas ref={canvasRef} className="aspect-square w-full rounded"/>
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-mustard">Top Text</label>
          <input value={top} onChange={(e)=>setTop(e.target.value.slice(0,40).toUpperCase())} className="w-full rounded-md border-2 border-cyan/40 bg-black/60 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-cyan"/>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-mustard">Bottom Text</label>
          <input value={bot} onChange={(e)=>setBot(e.target.value.slice(0,40).toUpperCase())} className="w-full rounded-md border-2 border-cyan/40 bg-black/60 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-cyan"/>
        </div>
        <div className="flex flex-wrap gap-2">
          {MEME_CAPTIONS.map((c) => (
            <button key={c} onClick={() => { const [a,...b] = c.split(" "); setTop(a!); setBot(b.join(" ")); }} className="rounded border border-grape/50 bg-grape/10 px-2 py-1 text-[10px] uppercase tracking-widest text-ink/80 hover:bg-grape/20">{c}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={download} className="flex-1 rounded-md border-2 border-mustard bg-mustard px-4 py-3 font-display text-sm tracking-widest text-bg">DOWNLOAD MEME</button>
          <button onClick={share} className="rounded-md border-2 border-cyan bg-cyan/10 px-4 py-3 font-display text-sm tracking-widest text-cyan"><Share2 className="h-4 w-4"/></button>
        </div>
      </div>
    </div>
  );
  if (embedded) return body;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle kicker="Make. Share. Confuse." title="BURGER PROPAGANDA MACHINE" />
      {body}
    </section>
  );
}

/* ─────────────────────────  LEADERBOARD  ───────────────────────── */

function Leaderboard({ bucks, wallet, embedded = false }: { bucks: number; wallet: string | null; embedded?: boolean }) {
  const rows = useMemo(() => {
    const me = wallet ? { rank: 6, name: `${wallet.slice(0,6)}…${wallet.slice(-4)}`, pts: bucks, note: "You (Wants Refund)" } : null;
    return me ? [...LEADERBOARD, me] : LEADERBOARD;
  }, [wallet, bucks]);
  const body = (
    <>
      {!embedded && <div className="mb-1 font-display text-xl md:text-2xl">🏆 BIRD BUCKS LEADERBOARD</div>}
      <div className="mb-4 text-xs uppercase tracking-widest text-ink/60">Completely worthless restaurant points · <span className="text-grease">Definitely Not Market Data</span></div>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.rank} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded border border-ink/10 bg-black/40 px-3 py-2 font-mono text-sm">
            <span className="font-display text-mustard w-6">{r.rank}</span>
            <span className="truncate text-cyan">{r.name}</span>
            <span className={r.pts < 0 ? "text-grease" : "text-ink"}>{r.pts.toLocaleString()}</span>
            <span className="hidden text-xs text-ink/60 sm:inline">{r.note}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-center font-mono text-[10px] text-ink/50">Earn Bird Bucks by ordering, calling the kitchen, firing employees, and making memes. They do nothing.</div>
    </>
  );
  if (embedded) return <div>{body}</div>;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-lg border-2 border-mustard/40 bg-card p-5">{body}</div>
    </section>
  );
}

/* ─────────────────────────  COMMUNITY  ───────────────────────── */

function CommunitySection({ wallet }: { wallet: string | null }) {
  const [feed, setFeed] = useState([
    { who: "0x82F…91A", act: "released 500 pigeons.", ago: "2m" },
    { who: "0x19B…420", act: "renamed the burger 'The Divorce Combo.'", ago: "5m" },
    { who: "0xDAD…BAD", act: "fired Larry again.", ago: "11m" },
    { who: "0xCAFE…BIRD", act: "declared the ice cream machine 'fixed.'", ago: "22m" },
    { who: "Anonymous", act: "reported the restaurant to nobody.", ago: "42m" },
  ]);
  const [newName, setNewName] = useState("");
  const submit = (act: string) => {
    if (!act.trim()) return;
    const who = wallet ? `${wallet.slice(0,6)}…${wallet.slice(-4)}` : "Anonymous";
    setFeed((f) => [{ who, act: clean(act), ago: "now" }, ...f].slice(0, 8));
    setNewName("");
  };
  return (
    <section id="community" className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle kicker="Community-Controlled Restaurant" title="JOIN THE CHAOS" sub="Change harmless parts of the restaurant. Text is filtered. Links, phone numbers, and slurs are stripped." />
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border-2 border-grape/50 bg-card p-5">
          <div className="mb-3 font-display text-lg text-mustard">RESTAURANT ACTIONS</div>
          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            {["Release 500 pigeons","Vote to fire the manager","Trigger a kitchen incident","Fix the ice cream machine","Break the ice cream machine","Change slogan to 'wen fries'"].map((a) => (
              <button key={a} onClick={() => submit(a.toLowerCase() + ".")} className="rounded-md border border-cyan/40 bg-cyan/5 px-3 py-2 text-left text-xs text-ink hover:bg-cyan/15">
                <Sparkles className="mr-1 inline h-3 w-3 text-cyan"/>{a}
              </button>
            ))}
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-mustard">Rename the Burger of the Hour</label>
            <div className="flex gap-2">
              <input value={newName} onChange={(e) => setNewName(e.target.value.slice(0, 40))} placeholder="e.g. The Divorce Combo" className="flex-1 rounded-md border-2 border-cyan/40 bg-black/60 px-3 py-2 text-sm text-ink outline-none focus:border-cyan" />
              <button onClick={() => newName && submit(`renamed the burger '${clean(newName)}.'`)} className="rounded-md border-2 border-grape bg-grape px-4 py-2 font-display text-xs tracking-widest text-white">SUBMIT</button>
            </div>
            <p className="mt-1 text-[10px] text-ink/50">Text is filtered · No personal info · One submission at a time</p>
          </div>
        </div>
        <div className="rounded-lg border-2 border-robin/50 bg-black/60 p-5 scanlines">
          <div className="mb-3 font-display text-lg neon-green">RECENT ACTIVITY</div>
          <ul className="space-y-2 font-mono text-xs">
            <AnimatePresence initial={false}>
              {feed.map((f, i) => (
                <motion.li key={f.who + f.act + i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-2 border-b border-robin/10 pb-1.5">
                  <span className="text-cyan">{f.who}</span>
                  <span className="text-ink/85">{f.act}</span>
                  <span className="text-ink/40">{f.ago}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  TOKEN  ───────────────────────── */

function TokenSection({ wallet }: { wallet: string | null }) {
  const net = activeNetwork();
  const [copied, setCopied] = useState(false);
  const cta = BB_CONFIG.token.tradingUrl || "";
  const disabled = !cta;
  const copyCA = async () => {
    await navigator.clipboard.writeText(BB_CONFIG.token.contract);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section id="token" className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle kicker="The Burger Economy" title={`WHAT IS ${BB_CONFIG.token.symbol}?`} sub="$BRGR is a meme token powering absolutely essential restaurant operations such as firing employees, renaming sandwiches, releasing pigeons, and making the website temporarily worse." />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border-2 border-grape/50 bg-card p-6">
          <div className="grid gap-3 sm:grid-cols-2 font-mono text-sm">
            <Info label="Token Name" val={BB_CONFIG.token.name}/>
            <Info label="Symbol" val={BB_CONFIG.token.symbol} tone="mustard"/>
            <Info label="Network" val={`${net.name} (${net.chainId})`}/>
            <Info label="Contract" val={BB_CONFIG.token.contract} tone="grease"/>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={cta || undefined} aria-disabled={disabled} className={`inline-flex items-center gap-2 rounded-md border-2 px-4 py-2.5 font-display text-xs tracking-widest ${disabled ? "cursor-not-allowed border-ink/20 bg-ink/5 text-ink/40" : "border-mustard bg-mustard text-bg"}`}>BUY {BB_CONFIG.token.symbol}</a>
            <a href={net.blockExplorer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border-2 border-cyan bg-cyan/10 px-4 py-2.5 font-display text-xs tracking-widest text-cyan">VIEW CONTRACT</a>
            <button onClick={copyCA} className="inline-flex items-center gap-2 rounded-md border-2 border-grape bg-grape/20 px-4 py-2.5 font-display text-xs tracking-widest text-ink">
              <Copy className="h-3.5 w-3.5"/> {copied ? "COPIED" : "COPY CA"}
            </button>
            <button disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border-2 border-ink/20 bg-ink/5 px-4 py-2.5 font-display text-xs tracking-widest text-ink/40">ADD TO WALLET</button>
          </div>
          <div className="mt-4 rounded-md border border-mustard/40 bg-mustard/5 p-3 text-xs text-mustard">
            <AlertTriangle className="mr-1 inline h-3.5 w-3.5"/> "Buy it because the bird is stupid, not because anyone promised you money." Meme tokens are highly speculative and may lose all value.
          </div>
        </div>
        <div className="rounded-lg border-2 border-cyan/40 bg-card p-6">
          <div className="mb-3 font-display text-lg neon-cyan">MAYBE UTILITY (EVENTUALLY)</div>
          <ul className="space-y-2 text-sm">
            {["Vote on the menu","Name the Burger of the Hour","Choose new mascot outfits","Trigger website events","Access holder-only receipt designs","Participate in restaurant votes"].map((u) => (
              <li key={u} className="flex items-start gap-2"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-mustard"/>{u}</li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-ink/60">
            Wallet: {wallet ? <span className="text-cyan">{wallet.slice(0,6)}…{wallet.slice(-4)}</span> : <span className="text-grease">Not connected</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
function Info({ label, val, tone }: { label: string; val: string; tone?: "mustard"|"grease" }) {
  const c = tone === "mustard" ? "text-mustard" : tone === "grease" ? "text-grease" : "text-cyan";
  return (
    <div className="rounded border border-ink/10 bg-black/40 p-3">
      <div className="text-[10px] uppercase tracking-widest text-ink/50">{label}</div>
      <div className={`mt-0.5 truncate ${c}`}>{val}</div>
    </div>
  );
}

/* ─────────────────────────  HOW TO BUY  ───────────────────────── */

function HowToBuy() {
  const steps = [
    { t: "Get a Wallet", d: "Install any EVM-compatible wallet (MetaMask, Rabby, Rainbow, or Robinhood Wallet)." },
    { t: "Add Robinhood Chain", d: `Add the network: Chain ID ${activeNetwork().chainId}, RPC ${activeNetwork().rpcUrl}.` },
    { t: "Get ETH on Robinhood Chain", d: "Bridge or acquire ETH on the Robinhood Chain network." },
    { t: `Swap for ${BB_CONFIG.token.symbol}`, d: "Visit the official trading link and swap. Only trust the contract listed on this page." },
  ];
  return (
    <section id="how-to-buy" className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle kicker="Instructions Nobody Reads" title="HOW TO BUY $BRGR"/>
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.t} className="relative rounded-lg border-2 border-grape/40 bg-card p-5">
            <div className="absolute -top-4 -left-2 grid h-10 w-10 place-items-center rounded-full border-2 border-mustard bg-bg font-display text-lg text-mustard">{i+1}</div>
            <div className="mt-3 font-display text-base">{s.t}</div>
            <p className="mt-2 text-xs text-ink/70">{s.d}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-md border-2 border-grease/40 bg-grease/5 p-4 text-xs text-ink/80">
        <div className="mb-1 flex items-center gap-2 font-display text-grease"><AlertTriangle className="h-4 w-4"/> WARNINGS</div>
        <ul className="list-inside list-disc space-y-0.5">
          <li>Verify the official contract address above. Never trust addresses posted in random replies.</li>
          <li>Never share your seed phrase. Bird Burger staff will never DM you first.</li>
          <li>Meme tokens are highly speculative and may lose all value.</li>
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────  ROADMAP  ───────────────────────── */

function Roadmap() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle kicker="Improvement Plan" title="THE (NOT A) ROADMAP" sub="This is comedic content. Not a promise of development, returns, or future value." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {ROADMAP.map((p, i) => (
          <motion.div key={p.phase} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*0.08 }} className="rounded-lg border-2 border-cyan/40 bg-card p-5">
            <div className="text-xs uppercase tracking-widest text-mustard">{p.phase}</div>
            <div className="mt-1 font-display text-lg neon-cyan">{p.title}</div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {p.items.map((it) => (<li key={it} className="flex gap-2"><span className="text-grape">▶</span><span className="text-ink/80">{it}</span></li>))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────  FAQ  ───────────────────────── */

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <SectionTitle kicker="Frequently Regretted Questions" title="FAQ"/>
      <div className="space-y-2">
        {FAQ.map((f, i) => (
          <div key={f.q} className="rounded-lg border-2 border-grape/40 bg-card">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
              <span className="font-display text-sm">{f.q}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}/>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="px-4 pb-4 text-sm text-ink/75">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────  FOOTER  ───────────────────────── */

function Footer() {
  const net = activeNetwork();
  return (
    <footer className="border-t-2 border-grape/40 bg-black/60 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded bg-grape text-lg">🐦</span><span className="font-display text-lg text-mustard">BIRD BURGER</span></div>
            <p className="mt-2 text-xs text-ink/60">{BB_CONFIG.brand.tagline}</p>
          </div>
          <div>
            <div className="font-display text-xs tracking-widest text-cyan">TOKEN</div>
            <ul className="mt-2 space-y-1 text-xs text-ink/70">
              <li>{BB_CONFIG.token.symbol}</li>
              <li>Contract: <span className="text-grease">{BB_CONFIG.token.contract}</span></li>
              <li><a href={net.blockExplorer} target="_blank" rel="noreferrer" className="hover:text-cyan">Block Explorer →</a></li>
            </ul>
          </div>
          <div>
            <div className="font-display text-xs tracking-widest text-cyan">NETWORK</div>
            <ul className="mt-2 space-y-1 text-xs text-ink/70">
              <li>{net.name}</li>
              <li>Chain ID: {net.chainId}</li>
            </ul>
          </div>
          <div>
            <div className="font-display text-xs tracking-widest text-cyan">FOLLOW US</div>
            <ul className="mt-2 space-y-1 text-xs text-ink/70">
              <li>X: <span className="text-grease">{BB_CONFIG.socials.x || "COMING SOON"}</span></li>
              <li>Telegram: <span className="text-grease">{BB_CONFIG.socials.telegram || "COMING SOON"}</span></li>
              <li><a href="#community" className="hover:text-cyan">Community Rules</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 space-y-2 border-t border-ink/10 pt-4 text-center text-xs text-ink/55">
          <p>© 2026 Bird Burger. No burgers were delivered in the making of this website.</p>
          <p>{BB_CONFIG.brand.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────  WALLET  ───────────────────────── */

function WalletModal({ wallet, wrongNet, onClose, onConnect, onSwitch, onDisconnect }: {
  wallet: string | null; wrongNet: boolean; onClose: () => void;
  onConnect: (addr: string, wrong: boolean) => void;
  onSwitch: () => void; onDisconnect: () => void;
}) {
  const [status, setStatus] = useState<"idle"|"connecting">("idle");
  const connect = async () => {
    setStatus("connecting");
    const eth = (window as any).ethereum;
    try {
      if (eth?.request) {
        const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
        const chainId: string = await eth.request({ method: "eth_chainId" });
        const addr = accounts[0]!;
        const wrong = chainId.toLowerCase() !== activeNetwork().chainIdHex.toLowerCase();
        onConnect(addr, wrong); onClose();
        return;
      }
    } catch {}
    // Fallback: fake address so the UI is fully functional without a wallet
    const fake = "0x" + Array.from({length:40}, () => "0123456789abcdef"[Math.floor(Math.random()*16)]).join("");
    onConnect(fake, false); onClose();
  };
  const switchNetwork = async () => {
    const net = activeNetwork();
    const eth = (window as any).ethereum;
    try {
      await eth?.request({ method: "wallet_switchEthereumChain", params: [{ chainId: net.chainIdHex }] });
    } catch (e: any) {
      if (e?.code === 4902) {
        await eth?.request({ method: "wallet_addEthereumChain", params: [{
          chainId: net.chainIdHex, chainName: net.name,
          nativeCurrency: net.nativeCurrency, rpcUrls: [net.rpcUrl], blockExplorerUrls: [net.blockExplorer],
        }]});
      }
    }
    onSwitch();
  };
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4">
      <motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} onClick={(e)=>e.stopPropagation()} className="w-full max-w-md rounded-xl border-2 border-grape bg-card p-6">
        <div className="mb-1 font-display text-xl">{wallet ? "YOUR WALLET" : "CONNECT WALLET"}</div>
        <p className="mb-4 text-xs text-ink/60">We never request token approvals for connecting. No auto-drains here.</p>
        {!wallet && (
          <div className="space-y-2">
            <button onClick={connect} disabled={status==="connecting"} className="flex w-full items-center gap-3 rounded-md border-2 border-grape bg-grape/10 px-4 py-3 text-left hover:bg-grape/20">
              <span className="text-2xl">🦊</span>
              <div><div className="font-bold">Browser Wallet</div><div className="text-xs text-ink/60">MetaMask, Rabby, Rainbow, Robinhood</div></div>
            </button>
            <button onClick={connect} className="flex w-full items-center gap-3 rounded-md border-2 border-cyan bg-cyan/10 px-4 py-3 text-left hover:bg-cyan/20">
              <span className="text-2xl">🔗</span>
              <div><div className="font-bold">WalletConnect</div><div className="text-xs text-ink/60">Any WalletConnect-compatible wallet</div></div>
            </button>
          </div>
        )}
        {wallet && (
          <div className="space-y-3">
            <div className="rounded-md border border-ink/10 bg-black/40 p-3 font-mono text-sm">
              <div className="text-xs uppercase text-ink/50">Address</div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-cyan">{wallet}</span>
                <button onClick={() => navigator.clipboard.writeText(wallet)} className="rounded border border-ink/20 p-1 text-ink/70 hover:bg-ink/10"><Copy className="h-3.5 w-3.5"/></button>
              </div>
            </div>
            {wrongNet && (
              <div className="rounded-md border-2 border-grease bg-grease/10 p-3">
                <div className="font-display text-grease">WRONG RESTAURANT.</div>
                <div className="mb-2 text-xs text-ink/70">Switch to {activeNetwork().name}.</div>
                <button onClick={switchNetwork} className="w-full rounded border-2 border-grease bg-grease py-2 font-display text-xs tracking-widest text-white">SWITCH NETWORK</button>
              </div>
            )}
            <div className="rounded-md border border-mustard/40 bg-mustard/5 p-3 font-mono text-xs">
              <div className="mb-1 font-bold text-mustard">WELCOME, {wallet.slice(0,6).toUpperCase()}…{wallet.slice(-4).toUpperCase()}</div>
              <div>You now own:</div>
              <div className="mt-1 space-y-0.5 text-ink/80">
                <div>· 0 burgers</div>
                <div>· 47 regrets</div>
                <div>· 1 questionable wallet connection</div>
              </div>
            </div>
            <button onClick={() => { onDisconnect(); onClose(); }} className="w-full rounded border-2 border-ink/30 py-2 font-display text-xs tracking-widest text-ink/80 hover:bg-ink/10">DISCONNECT</button>
          </div>
        )}
        <button onClick={onClose} className="mt-3 w-full text-center text-xs text-ink/50 hover:text-ink">Close</button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────  SECTION TITLE  ───────────────────────── */

function SectionTitle({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 text-center">
      {kicker && <div className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-mustard">{kicker}</div>}
      <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
      {sub && <p className="mx-auto mt-2 max-w-2xl text-sm text-ink/65">{sub}</p>}
    </div>
  );
}
