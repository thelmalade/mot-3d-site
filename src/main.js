// Boot + orchestration: WebGL detection & fallback, render loop, simulated live
// market feed, terminal panels, and cinematic GSAP scroll transitions that fly the
// camera between sections (the "spacecraft / Bloomberg terminal" feel).

import { ASSETS, TRENDING, WINS, EVENTS, SENTIMENT, fmt } from "./data.js";
import { createFeed, FEED_CONFIG } from "./feed.js";
import { initCursor } from "./cursor.js";

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap?.registerPlugin(ScrollTrigger);

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch { return false; }
}

// ---------- live market state + sparklines ----------
const MARKET = {};
const sentHist = [];
function seed(p) { const a = []; let v = p; for (let i = 0; i < 14; i++) { v += (Math.random() - 0.5) * p * 0.002; a.push(v); } a.push(p); return a; }
function initMarket() { ASSETS.forEach((a) => { MARKET[a.sym] = { base: a.base, price: a.base, hist: seed(a.base) }; }); }
function sparkPath(hist, w, h) {
  if (hist.length < 2) return "";
  const min = Math.min(...hist), max = Math.max(...hist), range = (max - min) || 1, step = w / (hist.length - 1);
  return hist.map((v, i) => `${i ? "L" : "M"}${(i * step).toFixed(1)} ${(h - ((v - min) / range) * h).toFixed(1)}`).join(" ");
}

// ---------- build the live desk ----------
function paintPanels() {
  initMarket();
  document.getElementById("tape-list").innerHTML = ASSETS.map((a) => `
    <div class="tape-row" data-sym="${a.sym}">
      <div class="tp-id"><span class="sym">${a.sym}</span><span class="name">${a.name}</span></div>
      <svg class="spark" viewBox="0 0 80 26" preserveAspectRatio="none" aria-hidden="true"><path d="" /></svg>
      <span class="px mono">${fmt(a.base)}</span>
      <span class="chg mono up">+0.00%</span>
    </div>`).join("");

  const chip = (w) => `<div class="win-chip"><span class="res">${w.result}</span><span><b>${w.play}</b><span class="meta"> ${w.trader} · ${w.tag}</span></span></div>`;
  const chips = WINS.map(chip).join("");
  document.getElementById("wins-track").innerHTML = chips + chips;   // duplicated for seamless loop

  document.getElementById("sched-list").innerHTML = EVENTS.map((e, i) => `
    <div class="sched-row">
      <div class="sr-l">${i === 0 ? `<span class="badge live">LIVE</span>` : `<span class="kind">${e.kind}</span>`}<span class="title">${e.title}</span></div>
      <span class="when mono">${e.when}</span>
    </div>`).join("");

  // seed initial sparklines so the tape looks alive immediately
  ASSETS.forEach((a) => {
    const row = document.querySelector(`.tape-row[data-sym="${a.sym}"] .spark path`);
    if (row) row.setAttribute("d", sparkPath(MARKET[a.sym].hist, 80, 26));
  });
}

function updateBreadth() {
  let up = 0, n = 0, sum = 0, topSym = "--", topPct = 0;
  for (const s in MARKET) {
    const m = MARKET[s]; n++;
    const p = ((m.price - m.base) / m.base) * 100; sum += p;
    if (p >= 0) up++;
    if (Math.abs(p) > Math.abs(topPct)) { topPct = p; topSym = s; }
  }
  const dec = n - up, net = n ? sum / n : 0;
  const set = (id, txt) => { const e = document.getElementById(id); if (e) e.textContent = txt; };
  set("breadth", `${up}/${n} up`);
  set("ss-adv", up); set("ss-dec", dec);
  const ne = document.getElementById("ss-net");
  if (ne) { ne.textContent = `${net >= 0 ? "+" : ""}${net.toFixed(2)}%`; ne.className = `mono ${net >= 0 ? "up" : "down"}`; }
  set("ss-upd", new Date().toLocaleTimeString("en-US", { hour12: false }));
  // today's standout (biggest absolute mover)
  set("tm-sym", topSym);
  const tm = document.getElementById("tm-chg");
  if (tm) { tm.textContent = `${topPct >= 0 ? "+" : ""}${topPct.toFixed(2)}%`; tm.className = `mono ${topPct >= 0 ? "up" : "down"}`; }
}

function renderSentiment() {
  const sv = Math.round(SENTIMENT.value);
  const val = document.getElementById("sent-val");
  if (!val) return;
  val.textContent = sv;
  document.getElementById("sent-lab").textContent = sv > 60 ? "RISK-ON" : sv < 40 ? "RISK-OFF" : "NEUTRAL";
  const marker = document.getElementById("sent-marker");
  if (marker) {                                   // place the dot on the arc at the value
    const phi = (180 - (sv / 100) * 180) * Math.PI / 180;
    marker.setAttribute("cx", (100 + 80 * Math.cos(phi)).toFixed(1));
    marker.setAttribute("cy", (100 - 80 * Math.sin(phi)).toFixed(1));
  }
  sentHist.push(sv); if (sentHist.length > 40) sentHist.shift();
  const sp = document.getElementById("sent-spark");
  if (sp) sp.querySelector("path").setAttribute("d", sparkPath(sentHist, 300, 38));
}

// ---------- simulated live feed ----------
let globe = null;
function buildTicker() {
  const row = ASSETS.concat(ASSETS).map((a) => `
    <span class="ticker-item" data-sym="${a.sym}"><span class="sym">${a.sym}</span>
      <span class="px">${fmt(a.base)}</span><span class="chg up">+0.00%</span></span>`).join("");
  document.getElementById("ticker").innerHTML = row;
}

// ---------- US market hours (regular session, ET) ----------
// NOTE: this is a client-side clock check (Mon-Fri 9:30-16:00 ET). It does NOT
// know about market holidays or half-days. For accuracy use a real market-status
// API (see notes shared in chat) instead of this heuristic.
function nowET() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
}
function fmtDur(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h >= 1) return `${h}h ${m}m`;
  if (m >= 1) return `${m}m ${sec}s`;
  return `${sec}s`;
}
function marketStatus() {
  const et = nowET();
  const day = et.getDay();                       // 0 Sun .. 6 Sat
  const min = et.getHours() * 60 + et.getMinutes();
  const OPEN = 570, CLOSE = 960;                  // 9:30 .. 16:00
  const weekday = day >= 1 && day <= 5;
  if (weekday && min >= OPEN && min < CLOSE) {
    return { open: true, label: "Market open", sub: `Closes in ${fmtDur((CLOSE - min) * 60)}` };
  }
  const next = new Date(et);
  next.setHours(9, 30, 0, 0);
  if (!(weekday && min < OPEN)) {                 // not "earlier today" -> roll forward
    do { next.setDate(next.getDate() + 1); } while (next.getDay() === 0 || next.getDay() === 6);
  }
  const secs = Math.max(0, Math.round((next - et) / 1000));
  return { open: false, label: "Market closed", sub: `Opens in ${fmtDur(secs)}` };
}
function updateMarketStatus() {
  const el = document.getElementById("mkt-status");
  if (!el) return;
  const s = marketStatus();
  el.className = "mkt-status " + (s.open ? "open" : "closed");
  el.innerHTML = `<span class="dot"></span> <span class="lbl">${s.label}</span> <span class="sub">· ${s.sub}</span>`;
}

// apply one normalized tick { sym, price, pct, up } to tape + ticker + globe.
function applyTick(t) {
  const m = MARKET[t.sym];
  if (m) { m.price = t.price; m.hist.push(t.price); if (m.hist.length > 24) m.hist.shift(); }
  const base = m ? m.base : t.price;
  const dayPct = ((t.price - base) / base) * 100;
  const up = dayPct >= 0;
  const chgTxt = `${up ? "+" : ""}${dayPct.toFixed(2)}%`;

  // bottom ticker
  document.querySelectorAll(`.ticker-item[data-sym="${t.sym}"]`).forEach((el) => {
    el.querySelector(".px").textContent = fmt(t.price);
    const c = el.querySelector(".chg"); c.textContent = chgTxt; c.className = `chg ${up ? "up" : "down"}`;
  });
  // live tape row
  const row = document.querySelector(`.tape-row[data-sym="${t.sym}"]`);
  if (row && m) {
    row.querySelector(".px").textContent = fmt(t.price);
    const c = row.querySelector(".chg"); c.textContent = chgTxt; c.className = `chg mono ${up ? "up" : "down"}`;
    const p = row.querySelector(".spark path");
    p.setAttribute("d", sparkPath(m.hist, 80, 26));
    p.setAttribute("class", up ? "" : "down");
  }
  updateBreadth();
  globe?.flash(t.sym, fmt(t.price), t.up);
}

// sentiment is a derived metric (mock here). In production compute from breadth /
// VIX / a sentiment API rather than a random drift.
function driftSentiment() {
  if (marketStatus().open) {
    SENTIMENT.value = Math.max(8, Math.min(94, SENTIMENT.value + (Math.random() - 0.5) * 2));
    renderSentiment();
  }
  setTimeout(driftSentiment, 1500);
}

let feed = null;
function startFeed() {
  feed = createFeed({ ...FEED_CONFIG, isOpen: () => marketStatus().open });
  feed.start(applyTick);
  renderSentiment();    // initial paint even if market is closed
  updateBreadth();
  driftSentiment();
}

// ---------- page lightning flash, fired by the globe whenever a bolt spawns ----------
function pageFlash() {
  const el = document.getElementById("page-flash");
  if (!el) return;
  // reduced 60% from the original 0.45-1.0 range
  el.style.opacity = (0.18 + Math.random() * 0.22).toFixed(2);
  setTimeout(() => { el.style.opacity = "0"; }, 70 + Math.random() * 80);
}

// ---------- Get Funded horizontal partner rail ----------
function initDeals() {
  const track = document.getElementById("deals-track");
  const prev = document.getElementById("deals-prev");
  const next = document.getElementById("deals-next");
  if (!track || !prev || !next) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const step = () => Math.max(258, track.clientWidth * 0.8);
  prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }));
  next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }));
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  };
  track.addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
}

// ---------- GSAP-driven container hover (lift + shadow + accent border) ----------
function initHovers() {
  if (!gsap) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // excludes market-pulse desk, the tape, and testimonials by selector
  document.querySelectorAll(".ind, .prop-deal, .deal-more, .media, .faq-item").forEach((el) => {
    gsap.set(el, { transformPerspective: 600 });
    const over = () => gsap.to(el, {
      y: reduce ? 0 : -6, borderColor: "#e8a13c",
      boxShadow: "0 18px 46px rgba(0,0,0,0.45)", duration: 0.3, ease: "power2.out",
    });
    const out = () => gsap.to(el, {
      y: 0, borderColor: "#2a2a31",
      boxShadow: "0 0px 0px rgba(0,0,0,0)", duration: 0.35, ease: "power2.out",
    });
    el.addEventListener("mouseenter", over);
    el.addEventListener("mouseleave", out);
  });
}

// ---------- cinematic scroll choreography ----------
function choreograph() {
  if (!gsap || !globe) return;
  const cam = globe.camera;
  const root = globe.root;

  // gsap.matchMedia() -> reduced-motion handling with automatic cleanup/revert.
  const mm = gsap.matchMedia();
  mm.add(
    { reduce: "(prefers-reduced-motion: reduce)", motion: "(prefers-reduced-motion: no-preference)" },
    (ctx) => {
      const reduce = ctx.conditions.reduce;

      // scroll reveals (instant under reduced motion)
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: reduce ? 0 : 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });

      if (reduce) return; // skip scrubbed camera / scale / label fade for reduced motion

      // globe shrinks the moment you scroll, by an increasing amount (ease-in)
      gsap.fromTo(root.scale,
        { x: 1, y: 1, z: 1 },
        { x: 0.4, y: 0.4, z: 0.4, ease: "power2.in", immediateRender: false,
          scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true } }
      );

      // fade labels as the stats strip rises toward the globe; kill clicks once hidden
      gsap.to("#label-layer", {
        opacity: 0, ease: "power1.in",
        scrollTrigger: {
          trigger: "#stats", start: "top 80%", end: "top 45%", scrub: 0.4,
          onUpdate: (self) =>
            document.getElementById("label-layer").classList.toggle("faded", self.progress > 0.85),
        },
      });

      // cinematic camera moves between sections (created top-to-bottom in page order)
      gsap.timeline({ scrollTrigger: { trigger: "#indicators", start: "top bottom", end: "top top", scrub: 1 } })
        .to(cam.position, { x: -1.6, z: 6.4, y: 0.2, ease: "none" }, 0);
      gsap.timeline({ scrollTrigger: { trigger: "#pulse", start: "top bottom", end: "top center", scrub: 1 } })
        .to(cam.position, { x: 2.2, z: 4.4, y: -0.4, ease: "none" }, 0)
        .to("#globe-canvas", { opacity: 0.45, ease: "none" }, 0);
      gsap.timeline({ scrollTrigger: { trigger: "#community", start: "top bottom", end: "top center", scrub: 1 } })
        .to(cam.position, { x: 0, z: 5.0, y: 0.3, ease: "none" }, 0)
        .to("#globe-canvas", { opacity: 0.9, ease: "none" }, 0);
    }
  );

  // recalc trigger positions once fonts/images settle (prevents start/end drift)
  addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
}

// ---------- init ----------
async function init() {
  initCursor();
  paintPanels();
  buildTicker();
  updateMarketStatus();
  setInterval(updateMarketStatus, 1000);
  initDeals();
  initHovers();

  if (!hasWebGL()) {
    document.documentElement.classList.add("no-webgl");
    // still reveal content (no scrubbed camera)
    gsap?.utils.toArray(".reveal").forEach((el) =>
      gsap.to(el, { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: el, start: "top 85%" } })
    );
    startFeed();
    return;
  }

  const { createGlobe } = await import("./globe.js");
  const canvas = document.getElementById("globe-canvas");
  const labelLayer = document.getElementById("label-layer");
  globe = createGlobe(canvas, labelLayer, { onBolt: pageFlash });

  function resize() { globe.resize(window.innerWidth, window.innerHeight); }
  resize();
  window.addEventListener("resize", resize);

  function frame() {
    if (!document.hidden) { globe.camera.lookAt(0, 0, 0); globe.render(); } // skip GPU work when tab hidden
    requestAnimationFrame(frame);
  }
  frame();

  choreograph();
  startFeed();
}

init();
