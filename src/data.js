// Simulated "live" feed. Instruments per request: Gold, NQ, ES, Dow (YM), SPX, and
// the Mag-7 single stocks. No crypto, no FX. Positions are assigned by the globe
// (evenly spaced via a fibonacci distribution), so no lat/lon here.

export const ASSETS = [
  { sym: "GOLD", name: "Gold",        base: 2410,  kind: "metal"  },
  { sym: "NQ",   name: "Nasdaq 100",  base: 19850, kind: "future" },
  { sym: "ES",   name: "S&P 500",     base: 5520,  kind: "future" },
  { sym: "YM",   name: "Dow Jones",   base: 39120, kind: "future" },
  { sym: "SPX",  name: "S&P 500 Idx", base: 5510,  kind: "index"  },
  { sym: "AAPL", name: "Apple",       base: 226.4, kind: "stock"  },
  { sym: "MSFT", name: "Microsoft",   base: 441.2, kind: "stock"  },
  { sym: "NVDA", name: "Nvidia",      base: 124.8, kind: "stock"  },
  { sym: "AMZN", name: "Amazon",      base: 184.7, kind: "stock"  },
  { sym: "GOOGL",name: "Alphabet",    base: 176.3, kind: "stock"  },
  { sym: "META", name: "Meta",        base: 503.1, kind: "stock"  },
  { sym: "TSLA", name: "Tesla",       base: 248.9, kind: "stock"  },
];

// Course-program nodes that orbit the globe. Each links into the gated vault.
export const BRANDS = [
  { name: "CSO Battalion", slug: "cso-battalion", url: "vault.html?program=cso-battalion" },
  { name: "P2P",           slug: "p2p",           url: "vault.html?program=p2p" },
  { name: "Maxtermind",    slug: "maxtermind",    url: "vault.html?program=maxtermind" },
  { name: "FuturesOne",    slug: "futuresone",    url: "vault.html?program=futuresone" },
];

export const TRENDING = [
  { sym: "NVDA", chg: +3.12 }, { sym: "NQ", chg: +1.84 }, { sym: "GOLD", chg: +0.46 },
  { sym: "ES",   chg: +0.91 }, { sym: "TSLA", chg: -1.27 }, { sym: "META", chg: +1.08 },
];

export const WINS = [
  { trader: "Big Daddy Max", play: "NQ ORB long",     result: "+312 pts", tag: "Live call" },
  { trader: "Andre O.",      play: "ES gap fill",      result: "+4.2R",    tag: "Funded" },
  { trader: "Priya R.",      play: "NVDA breakout",    result: "+1.9R",    tag: "Payout" },
  { trader: "Marcus DiSalvo",play: "Gold reversal",    result: "+186 pts", tag: "Eval pass" },
];

export const EVENTS = [
  { when: "Today 9:30 ET",  title: "Opening Bell Live", kind: "Livestream" },
  { when: "Wed 4:00 ET",    title: "After Hours with Max", kind: "Podcast" },
  { when: "Fri",            title: "Weekly Game Plan",   kind: "Education" },
  { when: "Soon",           title: "MOT Blitz at WealthCharts HQ", kind: "In-person" },
];

export const SENTIMENT = { value: 68, label: "Risk-On" };

export function tick(asset) {
  const vol = asset.base * 0.0007;
  const delta = (Math.random() - 0.48) * vol;
  asset.base = Math.max(0.01, asset.base + delta);
  const pct = (delta / asset.base) * 100;
  return { sym: asset.sym, price: asset.base, pct, up: delta >= 0 };
}

export function fmt(price) {
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 1 });
  if (price >= 10) return price.toFixed(2);
  return price.toFixed(2);
}
