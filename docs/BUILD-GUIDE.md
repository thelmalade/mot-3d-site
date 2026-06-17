# MOT 3D — Build Guide, Tooling & Page Framework

Companion to `PRD.md`. Covers: (A) how to run what's built, (B) which AI assistants & tools to use, (C) the production stack, (D) the page framework + how pages interact.

---

## A. What's built & how to run it

A working, brand-accurate **home page** implementing all four concepts:

| Your concept | Where it lives |
|---|---|
| 1 — 3D globe + live data streams + assets lighting up | `src/globe.js` (dot-globe, hub arcs with traveling packets, asset nodes pulse on every tick) |
| 2 — Trading + Entertainment merge (media hub, dual path) | `#paths` section — "The Edge" vs "The Network" |
| 3 — Live market pulse (sentiment, trending, wins, events) | `#pulse` terminal panels, fed by the simulated feed |
| 4 — Cinematic transitions | `src/main.js` `choreograph()` — GSAP ScrollTrigger flies the camera between sections |

**Run it** (needs a local server — ES modules don't load over `file://`):
```bash
cd mot-3d-website
python -m http.server 8123      # or:  npx serve .
# open http://localhost:8123
```
Palette is the real MOT brand: green `#4ebc97`, mint `#18e0a7`, cyan `#4fc3e8`, near-black `#05070a`, Poppins. The market data is **simulated** (random-walk in `src/data.js`) so it looks live with no API key; swap it for a real feed later (§C).

---

## B. Which AI assistant + tools to use

You're already using the best fit. Recommended division of labor:

| Job | Tool | Why |
|---|---|---|
| **Architecture, full-stack code, 3D logic, refactors** | **Claude Code** (this) — Opus | Best at multi-file builds, Three.js/R3F, wiring to the real API |
| **In-editor autocomplete while you tweak** | Cursor / VS Code + Copilot | Fast line-level help |
| **3D scenes without hand-coding** | **Spline** (spline.design) | Designer-friendly; export `.splinecode` or GLB, drop into R3F |
| **Generate hero/marketing imagery & textures** | Midjourney / DAL·E / the `imagegen-frontend-web` skill | Posters, fallbacks, OG images, environment maps |
| **3D models (Core emblem, candle-forms)** | Blender (+ Meshy/Luma AI for text-to-3D) | Then optimize with `gltf-transform` |
| **Deploy** | Vercel (Next.js) or Netlify | One-command deploy, edge CDN |

**Workflow:** Claude Code builds & wires everything → Spline/Blender for any bespoke 3D art → image AI for stills/fallbacks → Vercel to ship. You drive it all from Claude Code.

---

## C. Production stack (when you go beyond this demo)

This demo uses CDN Three.js to run instantly. For production, migrate to the PRD stack:

- **Next.js (App Router)** — SSR/SEO for marketing, route code-splitting.
- **React Three Fiber + drei + @react-three/postprocessing** — the globe becomes a `<Canvas>` component; `useGLTF` for models, `useProgress` for loaders, bloom for glow.
- **GSAP ScrollTrigger** (or drei `ScrollControls`) — same cinematic camera logic as `main.js`.
- **Tailwind CSS** — port `styles.css` tokens to a theme.
- **Live market data** — replace `src/data.js` with a websocket/poll layer (Polygon.io, Databento, or a broker feed). Keep the same `{sym, price, pct, up}` shape and everything else just works.
- **MOT backbone API** — the site's existing endpoints power real content:
  - Hero stats / SEO → `/api/site-settings`, `/api/seo/public`
  - The Edge → `/api/indicators`, `/api/courses`, `/api/coaches`, `/api/partners` + `/api/prop-firm-plans`
  - The Network → `/api/network/live`, `/api/network/episodes`, `/api/network/playlists`, `/api/youtube/live-status`
  - Community → `/api/discord/online-count`
  - Auth/Join → `/api/auth/*`, `/api/checkout/*`
- **Asset pipeline** — Blender → `<100k` polys → bake → GLB → `gltf-transform optimize --compress draco --texture-compress webp` → `<5MB` → CDN.
- **Perf gates** — DPR ≤1 mobile / ≤2 desktop, Suspense loaders, WebGL fallback (already in the demo), LCP ≤2.5s (3D never the LCP element).

---

## D. Page framework & how pages interact

The home page is the **bridge** in a hub-and-spoke model. Its two paths (The Edge / The Network) are the primary forks into the rest of the site.

```
                         ┌─────────────────────────────┐
                         │           HOME              │
                         │  3D globe · market pulse    │
                         │  dual-path media hub        │
                         └───────────┬─────────────────┘
                 ┌───────────────────┼───────────────────┐
                 ▼ (The Edge)        ▼ (Live pulse)        ▼ (The Network)
        ┌────────────────┐   ┌────────────────┐   ┌────────────────────┐
        │  TRADE & LEARN │   │  MARKET PULSE  │   │   THE NETWORK      │
        ├────────────────┤   │ (live data hub)│   ├────────────────────┤
        │ Indicators     │   │ sentiment      │   │ Livestreams        │
        │ Courses        │   │ trending       │   │ Podcasts           │
        │ Coaching       │   │ wins/payouts   │   │ Interviews         │
        │ Prop Firms     │   │ events feed ───┼──▶│ Events / MOT Blitz │
        └───────┬────────┘   └────────────────┘   └─────────┬──────────┘
                │                                            │
                └──────────────┬─────────────────────────────┘
                               ▼
                  ┌──────────────────────────┐
                  │  JOIN / PRICING / CHECKOUT│  ◀── global CTA from every page
                  └─────────────┬─────────────┘
                                ▼
                  ┌──────────────────────────┐
                  │   MEMBER APP (authed)     │
                  │ dashboard · my courses ·  │
                  │ chat · coaching · max bucks│
                  └──────────────────────────┘
```

### Interaction rules
- **Persistent shell:** the 3D globe + ticker live in a fixed background layer; route changes swap the foreground content with a cinematic "warp" transition (shared element / camera push), so navigation *feels* like flying through one space, not loading pages.
- **The Edge** (trading/education) and **The Network** (content/community) are sibling spokes; cross-links between them (e.g. a course references its livestream; a podcast links the indicator discussed).
- **Market Pulse** is a live data layer surfaced on Home and reused as widgets on Edge/Network pages; its "events" feed deep-links into The Network.
- **Join / Pricing / Checkout** is the conversion funnel reachable from every page's global CTA.
- **Member App** is the authenticated destination after Join; it drops the immersive 3D for utility (PRD Tier T3) while keeping brand accents.

See `PRD.md` §9 for the full per-page spec (all ~30 pages, tiers, APIs, fallbacks).

---

## Next steps (pick any, I can build them)
1. Port this demo to **Next.js + React Three Fiber** (production architecture).
2. Wire the panels/hero to the **real MOT API** instead of mock data.
3. Build the **page transition system** (warp between routes over the persistent globe).
4. Commission/generate the **Core emblem + candle-form GLBs** and load them in the scene.
5. Build the next page (Indicators or The Network) using the same system.
