// Market data feed adapter. The whole UI consumes one shape -> { sym, price, pct, up }
// so swapping the source never touches the globe / ticker / panels.
//
//   MockFeed  - random-walk simulation (default; no key, no network)
//   LiveFeed  - polls a real provider via YOUR backend proxy (Finnhub/Polygon/etc.)
//
// Flip FEED_CONFIG.mode to "live" once your proxy is up. NEVER put a provider API
// key in the browser; the LiveFeed talks to a backend endpoint that holds the key.

import { ASSETS, tick } from "./data.js";

export const FEED_CONFIG = {
  mode: "mock",              // "mock" | "live"
  endpoint: "/api/quotes",   // your backend proxy -> returns [{ sym, price }, ...]
  intervalMs: 420,           // mock cadence; live polling is set below (~5s)
};

// Map our internal symbols to a provider's symbols. Adjust to your provider.
//   Stocks: usually identical (AAPL, MSFT, ...). SPX index: Polygon "I:SPX",
//   Finnhub "^GSPC". Futures (NQ/ES/YM/GOLD) need a futures-capable feed and a
//   continuous-contract symbol (e.g. Databento "NQ.c.0").
export const SYMBOL_MAP = {
  GOLD: "GC=F", NQ: "NQ=F", ES: "ES=F", YM: "YM=F", SPX: "^GSPC",
  AAPL: "AAPL", MSFT: "MSFT", NVDA: "NVDA", AMZN: "AMZN",
  GOOGL: "GOOGL", META: "META", TSLA: "TSLA",
};

export function createFeed(cfg = FEED_CONFIG) {
  return cfg.mode === "live" ? new LiveFeed(cfg) : new MockFeed(cfg);
}

// ---------- mock (default) ----------
class MockFeed {
  constructor(cfg) { this.cfg = cfg; this.timer = null; this.isLive = false; }
  start(onTick) {
    const loop = () => {
      if (!this.cfg.isOpen || this.cfg.isOpen()) {
        onTick(tick(ASSETS[(Math.random() * ASSETS.length) | 0]));
      }
      this.timer = setTimeout(loop, this.cfg.intervalMs || 420);
    };
    loop();
  }
  stop() { clearTimeout(this.timer); }
}

// ---------- live (stub, wire to your proxy) ----------
class LiveFeed {
  constructor(cfg) { this.cfg = cfg; this.timer = null; this.prev = {}; this.isLive = true; }
  start(onTick) {
    const poll = async () => {
      if (!this.cfg.isOpen || this.cfg.isOpen()) {
        try {
          for (const q of await this.fetchQuotes()) {
            const prev = this.prev[q.sym] ?? q.price;
            const pct = prev ? ((q.price - prev) / prev) * 100 : 0;
            this.prev[q.sym] = q.price;
            onTick({ sym: q.sym, price: q.price, pct, up: q.price >= prev });
          }
        } catch (e) { console.warn("LiveFeed poll failed:", e); }
      }
      this.timer = setTimeout(poll, this.cfg.liveIntervalMs || 5000);
    };
    poll();
  }
  // Expected proxy response: [{ "sym": "AAPL", "price": 226.4 }, ...]
  // Your serverless function maps SYMBOL_MAP[sym] -> provider, holds the key, and
  // returns this normalized array. Example provider calls (server-side only):
  //   Finnhub:  GET https://finnhub.io/api/v1/quote?symbol=AAPL&token=KEY   -> .c
  //   Polygon:  GET https://api.polygon.io/v2/last/trade/AAPL?apiKey=KEY    -> .results.p
  async fetchQuotes() {
    const res = await fetch(this.cfg.endpoint, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("feed " + res.status);
    return res.json();
  }
  stop() { clearTimeout(this.timer); }
}
