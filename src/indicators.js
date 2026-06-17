// Indicator catalog. Homepage cards show name + tagline (summary); the detail page
// (indicator.html?ind=slug) shows the blurb + full feature list.
export const INDICATORS = {
  "advanced-orb": {
    name: "Advanced ORB", tag: "Flagship",
    tagline: "Specialize in opening range breakouts with pinpoint precision.",
    blurb: "Our flagship opening-range breakout system. Define the range, plot the breakouts, and stack confluence across multiple sessions with pinpoint precision.",
    features: [
      "Define the 15-minute opening range for multiple sessions",
      "Automatically plot precise breakouts and reversals",
      "View overlapping ORB zones from multiple sessions",
      "Dynamically plot higher-timeframe support levels",
    ],
    platforms: "WealthCharts and TradingView",
  },
  "quantum-shift": {
    name: "Quantum Shift", tag: "Momentum",
    tagline: "Real-time trend shifts with multi-timeframe confluence.",
    blurb: "Catch trend shifts the moment they happen, confirmed across timeframes so you trade with momentum instead of against it.",
    features: [
      "Triple confirmation: price, EMA and oscillator",
      "Automatic support and resistance from EMA crossovers",
      "Dynamic trend clouds visualize momentum",
    ],
    platforms: "WealthCharts and TradingView",
  },
  "range-breaker": {
    name: "Range Breaker", tag: "Range",
    tagline: "Identify consolidation zones and ride the breakouts.",
    blurb: "Spot low-volatility consolidation early and trade the break with confirmation, filtering out the fakeouts that trap most traders.",
    features: [
      "Detect low-volatility consolidation zones",
      "Original multi-bar confirmation validates breakouts",
      "Trend and volatility filters minimize false breakouts",
      "Visual mapping distinguishes continuation vs reversal",
    ],
    platforms: "WealthCharts and TradingView",
  },
  "max-value-gap": {
    name: "Max Value Gap", tag: "Gaps",
    tagline: "Track liquidity gaps and trade alongside institutions.",
    blurb: "Map the gaps that matter and the fills that follow, so you can position alongside institutional liquidity instead of chasing it.",
    features: [
      "Automatically detect gap-up and gap-down zones",
      "Track each gap until price re-enters or fills",
      "Visual fill tracker highlights risk and reward",
      "Identifies institutional liquidity zones",
    ],
    platforms: "WealthCharts and TradingView",
  },
  "pivot-hunter-pro": {
    name: "Pivot Hunter Pro", tag: "Levels",
    tagline: "Detect, validate and trade real-time support and resistance.",
    blurb: "Real-time support and resistance that validates itself, adapts to false breakouts, and lets you backtest the levels before you trade them.",
    features: [
      "Automatically detects real-time S/R levels",
      "Built-in validation and spacing filters",
      "Adjusts levels dynamically for false breakouts",
      "Backtest mode for historical review",
    ],
    platforms: "WealthCharts and TradingView",
  },
  "p2p-algo": {
    name: "P2P Algo", tag: "Smart money",
    tagline: "Reveal where smart money is active and where price reacts.",
    blurb: "A clean, rule-based ICT execution tool built around Antonio Lama concepts that highlights where smart money is active and where price is most likely to react.",
    features: [
      "Reveal where smart money is active",
      "Clean rule-based ICT execution support",
      "Built around Antonio Lama concepts",
      "For Futures, Forex, Crypto and Indices",
    ],
    platforms: "Futures, Forex, Crypto and Indices",
  },
  "flowx": {
    name: "FlowX", tag: "Scalping",
    tagline: "ICT-based scalping: liquidity grabs, structure, automated entries.",
    blurb: "Built on an ICT-based scalping model, FlowX identifies liquidity grabs, confirms market structure, and delivers precise, automated entries for consistent execution.",
    features: [
      "Smart Signals",
      "Sweep Detection",
      "Live Checklist",
      "Full Alerts",
    ],
    platforms: "WealthCharts and TradingView",
  },
};

export const INDICATOR_ORDER = [
  "advanced-orb", "quantum-shift", "range-breaker",
  "max-value-gap", "pivot-hunter-pro", "p2p-algo", "flowx",
];
