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
  Star,
  ShoppingBag,
  Bird,
  Sparkles,
  AlertTriangle,
  Zap,
  Trash2,
} from "lucide-react";
import mascotHero from "@/assets/bird-mascot.png.asset.json";
import kitchenBg from "@/assets/kitchen-bg.jpg";
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
  { name: "McRug Pull", price: "$6.90", desc: "The burger disappears immediately after purchase.", icon: "🍔", rating: 0.3 },
  { name: "Liquidity Fries", price: "$4.20", desc: "Your fries have been permanently locked.", icon: "🍟", rating: 1.1 },
  { name: "Pump & Shake", price: "$8.88", desc: "Goes straight up before violently coming back down.", icon: "🥤", rating: 0.7 },
  { name: "Diamond Hands Nuggets", price: "$12.00", desc: "So hard you physically cannot sell them.", icon: "💎", rating: 2.4 },
  { name: "Exit Liquidity Combo", price: "$69.00", desc: "Designed specifically for our most loyal customers.", icon: "🎟️", rating: 0.1 },
  { name: "Chudburger Deluxe", price: "$14.99", desc: "Two patties, no vegetables, negative social awareness.", icon: "🍔", rating: 1.9 },
  { name: "Paper Hands Kids Meal", price: "$3.33", desc: "Customer sells the toy before opening the box.", icon: "🧃", rating: 0.5 },
  { name: "Nothing Burger", price: "$99.99", desc: "Contains exactly what the project promised.", icon: "🫥", rating: 5.0 },
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
  return (
    <div className="rounded-lg border-2 border-mustard/50 bg-card p-4 shadow-[0_0_25px_rgba(255,193,7,0.15)]">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-display text-sm neon-pink">☎ CALL THE KITCHEN</div>
        <span className="rounded bg-grease/20 px-2 py-0.5 font-mono text-[10px] uppercase text-grease">1-800-BIRD-BAD</span>
      </div>
      <div className="relative mx-auto my-3 grid h-28 w-28 place-items-center rounded-full border-4 border-mustard bg-mustard/10">
        <span className="text-4xl">📞</span>
        {ringing && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full border-2 border-mustard/60" />
            <span className="absolute -inset-2 animate-pulse rounded-full border border-mustard/40" />
          </>
        )}
      </div>
      <button
        onClick={() => { setRinging(true); onStart(); setTimeout(() => setRinging(false), 3500); }}
        className="w-full rounded-md border-2 border-mustard bg-mustard px-3 py-2.5 font-display text-xs tracking-widest text-bg shadow-[3px_3px_0_#000] hover:translate-y-[-2px] transition"
      >
        {ringing ? "RINGING…" : "CALL NOW"}
      </button>
      <p className="mt-2 text-center font-mono text-[10px] text-ink/50">Nobody's picking up. As always.</p>
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

function PurpleBand({ bucks, wallet, onDownload }: { bucks: number; wallet: string | null; onDownload: () => void }) {
  return (
    <section id="community-band" className="relative border-y-4 border-mustard/60 bg-gradient-to-br from-grape via-grape/90 to-[#3a1d6b] py-16">
      <div className="absolute inset-0 grain opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center">
          <div className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-mustard">Holder Perks (Not Really)</div>
          <h2 className="font-display text-3xl neon-pink md:text-4xl">JOIN THE FLOCK</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border-2 border-mustard/60 bg-black/40 p-5">
            <div className="mb-3 font-display text-lg neon-cyan">🎨 MEME MACHINE</div>
            <MemeGenerator onDownload={onDownload} embedded />
          </div>
          <div className="rounded-lg border-2 border-cyan/60 bg-black/40 p-5">
            <div className="mb-3 font-display text-lg neon-green">🏆 BIRD BUCKS</div>
            <Leaderboard bucks={bucks} wallet={wallet} embedded />
          </div>
          <div className="rounded-lg border-2 border-robin/60 bg-black/40 p-5">
            <div className="mb-3 font-display text-lg neon-pink">🧾 YOUR RECEIPT</div>
            <div className="rounded-sm bg-[#f5f0e0] p-4 font-mono text-[11px] text-[#1a1a1a]">
              <div className="text-center font-display text-sm">BIRD BURGER</div>
              <div className="text-center text-[9px] uppercase tracking-widest text-[#666]">The Worst Restaurant on the Blockchain</div>
              <div className="my-2 border-t border-dashed border-[#1a1a1a]/40" />
              <div className="flex justify-between"><span>1x Regret Deluxe</span><span>$4.20</span></div>
              <div className="flex justify-between"><span>1x Side of Silence</span><span>$0.69</span></div>
              <div className="flex justify-between"><span>Tip (nobody earned)</span><span>$0.00</span></div>
              <div className="my-2 border-t border-dashed border-[#1a1a1a]/40" />
              <div className="flex justify-between font-bold"><span>TOTAL</span><span>$4.89</span></div>
              <div className="mt-2 text-center text-[9px] uppercase tracking-widest text-[#666]">*** PLEASE REGRET YOUR DECISION ***</div>
              <div className="mt-2 text-center">Bird Bucks earned: <span className="font-bold text-grape">{bucks}</span></div>
            </div>
          </div>
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
            <div className="grid h-32 place-items-center rounded-md border border-ink/10 bg-gradient-to-br from-grape/20 to-black/50 text-6xl">
              {m.icon}
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

function OrderModal({ item, onClose }: { item: string; onClose: () => void }) {
  const share = async () => {
    const text = `Just ordered ${item} at Bird Burger. Estimated delivery: never. 🐦🍔 ${BB_CONFIG.brand.tagline}`;
    try {
      if (navigator.share) await navigator.share({ title: "Bird Burger", text });
      else await navigator.clipboard.writeText(text);
    } catch {}
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <motion.div initial={{ y: -400, rotate: -3 }} animate={{ y: 0, rotate: -1 }} exit={{ y: 600 }} transition={{ type: "spring", damping: 18 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-receipt p-6 font-mono text-bg shadow-2xl" style={{ clipPath: "polygon(0 0, 100% 0, 100% 96%, 92% 100%, 80% 96%, 68% 100%, 56% 96%, 44% 100%, 32% 96%, 20% 100%, 8% 96%, 0 100%)" }}>
        <div className="text-center">
          <div className="font-display text-xl tracking-wider">BIRD BURGER</div>
          <div className="text-[10px] uppercase tracking-widest">Order Confirmed</div>
          <div className="my-2 border-y-2 border-dashed border-bg/40 py-1 text-[10px]">RECEIPT #{Math.floor(Math.random()*90000+10000)}</div>
        </div>
        <ul className="mt-2 space-y-1 text-sm">
          <li className="flex justify-between"><span>1 × {item}</span><span>$0.00</span></li>
          <li className="flex justify-between"><span>2 Liquidity Fries</span><span>$0.00</span></li>
          <li className="flex justify-between"><span>1 Permanent Financial Decision</span><span>$0.00</span></li>
          <li className="flex justify-between"><span>Extra Regret</span><span>$0.00</span></li>
        </ul>
        <div className="mt-3 border-t-2 border-dashed border-bg/40 pt-2 text-sm font-bold">
          <div className="flex justify-between"><span>TOTAL</span><span>Too Much</span></div>
          <div className="flex justify-between text-xs"><span>Estimated Delivery</span><span>Never</span></div>
        </div>
        <div className="mt-4 grid gap-2">
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded border-2 border-bg py-2 text-xs font-bold uppercase tracking-widest"><Printer className="h-3.5 w-3.5"/>Print My Regret</button>
          <button onClick={share} className="flex items-center justify-center gap-2 rounded border-2 border-grape bg-grape py-2 text-xs font-bold uppercase tracking-widest text-white"><Share2 className="h-3.5 w-3.5"/>Share Receipt</button>
          <button onClick={onClose} className="flex items-center justify-center gap-2 rounded border-2 border-grease bg-grease py-2 text-xs font-bold uppercase tracking-widest text-white"><Trash2 className="h-3.5 w-3.5"/>Order Another Mistake</button>
        </div>
        <div className="mt-3 text-center text-[10px] opacity-60">*Not a real food purchase. No burger will arrive.</div>
      </motion.div>
    </motion.div>
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
  useEffect(() => {
    const t = setInterval(() => setOverlay(rand(CAM_OVERLAYS)), 5000);
    const t2 = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => { clearInterval(t); clearInterval(t2); };
  }, []);
  const trigger = () => {
    onIncident();
    const inc = rand(INCIDENTS);
    setIncident(inc);
    setTimeout(() => setIncident(null), 1800);
  };
  return (
    <div id="kitchen-cam" className="relative overflow-hidden rounded-lg border-2 border-cyan/50 bg-black">
      <div className="flex items-center justify-between border-b border-cyan/30 bg-black/80 px-3 py-2 font-mono text-xs">
        <span className="font-display neon-cyan text-sm">LIVE KITCHEN CAM</span>
        <span className="flex items-center gap-1.5 text-grease"><span className="h-2 w-2 animate-pulse rounded-full bg-grease"/>LIVE</span>
      </div>
      <div className="relative aspect-video overflow-hidden scanlines">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(124,58,237,0.3),transparent_70%),linear-gradient(180deg,#1a0b2e_0%,#000_100%)]"/>
        {/* Simulated kitchen */}
        <div className="absolute inset-0 opacity-70">
          <div className="absolute bottom-8 left-1/3 h-16 w-16 rounded bg-black/70 shadow-[0_0_20px_rgba(239,68,68,0.4)]"/>
          <div className="absolute bottom-8 right-1/4 h-12 w-20 rounded bg-black/60"/>
          <motion.div
            animate={{ x: [-20, 240, -20] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 left-0 text-3xl"
          >🐦</motion.div>
          <motion.div
            animate={{ x: [400, -50] }}
            transition={{ duration: 5, repeat: Infinity, delay: 2, ease: "linear" }}
            className="absolute bottom-16 text-2xl"
          >🍔</motion.div>
          <motion.div
            animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -30, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-24 left-1/3 h-10 w-10 rounded-full bg-white/30 blur-lg"
          />
        </div>
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
      </div>
      <button onClick={trigger} className="w-full border-t-2 border-grape bg-grape py-2.5 font-display text-xs tracking-widest text-white hover:bg-grape/80">
        CAUSE A KITCHEN INCIDENT ✨
      </button>
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

function Leaderboard({ bucks, wallet }: { bucks: number; wallet: string | null }) {
  const rows = useMemo(() => {
    const me = wallet ? { rank: 6, name: `${wallet.slice(0,6)}…${wallet.slice(-4)}`, pts: bucks, note: "You (Wants Refund)" } : null;
    return me ? [...LEADERBOARD, me] : LEADERBOARD;
  }, [wallet, bucks]);
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-lg border-2 border-mustard/40 bg-card p-5">
        <div className="mb-1 font-display text-xl md:text-2xl">🏆 BIRD BUCKS LEADERBOARD</div>
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
      </div>
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
