// Bird Burger — single source of truth for token, network, and social links.
// Update these values when the real info is available; nothing else needs to change.

export const BB_CONFIG = {
  brand: {
    name: "BIRD BURGER",
    tagline: "The Worst Restaurant on the Blockchain.",
    disclaimer:
      "Bird Burger is an independent meme project and is not affiliated with Robinhood Markets, Inc. Nothing on this website is financial advice. The food is also not advice.",
  },
  token: {
    name: "Bird Burger",
    symbol: "$BRGR",
    // LIVE 2026-07-21 — verified on-chain: symbol BRGR, name "Bird Burger", 18 decimals
    contract: "0x64677ab0b5a6204c3c2ae27c3a9a5cd59d13c0de",
    tradingUrl: "https://hood.dev/terminal/0x64677ab0b5a6204c3c2ae27c3a9a5cd59d13c0de",
    launchpadUrl: "",
  },
  socials: {
    x: "https://x.com/Birdburgermeme",
    telegram: "",
  },
  networks: {
    mainnet: {
      name: "Robinhood Chain",
      chainId: 4663,
      chainIdHex: "0x1237",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
      blockExplorer: "https://robinhoodchain.blockscout.com",
    },
    testnet: {
      name: "Robinhood Chain Testnet",
      chainId: 46630,
      chainIdHex: "0xB626",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrl: "https://rpc.testnet.chain.robinhood.com",
      blockExplorer: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  // Toggle to true during development if you want the wallet to use the testnet.
  useTestnet: false,
} as const;

export const activeNetwork = () =>
  BB_CONFIG.useTestnet ? BB_CONFIG.networks.testnet : BB_CONFIG.networks.mainnet;
