# PRD — MaxOptionsTrading 3D Website

**Product:** maxoptionstrading.com full redesign as a 3D-forward web experience
**Author:** (drafted with Claude Code)
**Date:** 2026-06-15
**Status:** Draft v1 for review

---

## 1. Summary

MaxOptionsTrading (MOT) is a futures/options **trading-education and community** brand founded by Max Anthony ("Big Daddy Max"): premium WealthCharts & TradingView indicators, courses, 1-on-1 coaching, a prop-firm partner directory, the MOT Network video channel, and a 70,000+ member Discord. The current site is a conventional React SPA.

This PRD specifies a **3D-forward redesign of every page** — public marketing, auth, the authenticated member app, and admin — using a single reusable 3D system. The goal is a premium, "statistical-precision / dark-tech" experience that raises perceived authority and conversion **without** sacrificing performance, accessibility, or the utility of data-heavy pages.

### Guiding principle (from 3D best practice)
> Use 3D where it enhances; never where it just shows off. Marketing/landing surfaces get immersive WebGL; utility surfaces (checkout, chat, admin, course player) get restrained 3D *accents* only. Every 3D surface ships with a loading state, a reduced-motion path, and a static fallback.

---

## 2. Goals & Non-Goals

### Goals
- **G1 — Differentiated brand:** a recognizably premium, three-dimensional identity that signals authority in a crowded prop/edu market.
- **G2 — Conversion:** lift signup → trial → paid and indicator/course purchases via immersive product storytelling.
- **G3 — Performance-safe:** 3D never degrades Core Web Vitals below targets (§6) or blocks task completion.
- **G4 — One system, every page:** a shared 3D design system + tiered intensity model so all ~30 pages are covered consistently.
- **G5 — Accessible & inclusive:** full keyboard, screen-reader, and `prefers-reduced-motion` support; nothing critical locked behind WebGL.

### Non-Goals
- Not building a 3D trading terminal or live charting engine (charts stay on TradingView/WealthCharts).
- Not gamifying real trading or simulating live market data in 3D.
- Not replacing the existing REST API/back end — this is a front-end + asset effort against current endpoints.
- Not shipping VR/AR (USDZ/WebXR) in v1 (noted as future).

---

## 3. Target Users & Personas

| Persona | Need | Where 3D helps |
|---|---|---|
| **Aspiring trader (cold)** | Trust, "is this legit?", quick understanding | Immersive hero, social proof, animated explainers |
| **Prop-firm shopper** | Compare eval accounts fast | Clear, fast 3D-accented comparison (utility-first) |
| **Indicator/course buyer** | See the product, understand value | 3D product showcases, configurator-style previews |
| **Existing member** | Get to courses/chat/coaching fast | Fast app with light 3D accents, no friction |
| **Affiliate/partner** | Manage links & payouts | Pure utility dashboard, minimal 3D |
| **Admin/staff** | Manage content & ops | No immersive 3D; subtle brand accents only |

---

## 4. 3D Intensity Tiers (applies to every page)

Each page is assigned exactly one tier. This is the core mechanism that lets us cover *every* page without breaking utility.

| Tier | Name | 3D budget | Used on |
|---|---|---|---|
| **T1** | Immersive | Full WebGL hero(es), scroll-driven camera, particles, models | Home, Indicators, Courses landing, Pricing, MOT Blitz, About |
| **T2** | Accented | Contained 3D modules (a single canvas card/section), hover depth | Partners, Coaching, Network, Community, FAQ, Contact |
| **T3** | Utility + Brand | No scene; CSS 3D micro-depth, animated logo, gradient mesh background only | Auth, Member dashboard, My Courses, Course player, Checkout, Billing, Chat, Notifications, Profile, Checklist, Calendar, Affiliate, Support, Admin |

> Rule: T3 pages must be fully usable with WebGL disabled. T1/T2 must degrade to a static poster image + standard layout.

---

## 5. Design Language & 3D Art Direction

- **Mood:** dark-tech, precise, "institutional but accessible." Statistical-precision metaphor → grids, data lattices, glowing nodes, candlestick-as-form.
- **Palette:** near-black base (#0A0B0E), elevated surfaces (#14161B), MOT accent (extract exact brand green/gold from current logo — `MOT_ALT_LOGO.png`), signal cyan for highlights, restrained neon glow. Maintain WCAG AA contrast on all text.
- **Typography:** Poppins (already in use) retained; large editorial display weights for heroes, tight tracking for data.
- **Recurring 3D motifs (the "MOT object language"):**
  - **The Lattice** — a 3D grid/point-field that reacts to cursor & scroll (home, transitions).
  - **Candle-forms** — abstract extruded candlesticks used as sculptural elements, never as fake live data.
  - **The Core** — a signature emblem/coin (Max Bucks, brand mark) rendered as a metallic GLB, reused across pages.
  - **Signal nodes** — glowing connected nodes representing the community/network.
- **Motion principles:** purposeful, eased (no linear), 150–400ms for UI; scroll-scrubbed for hero narratives; respect `prefers-reduced-motion` (replace motion with fades/static).

---

## 6. Technical Architecture & Budgets

### Stack
- **Framework:** keep React; recommend migrating marketing routes to **Next.js (App Router)** for SSR/SEO + route-level code-splitting (current app is a Vite SPA — SEO-weak for marketing). Authenticated app may remain SPA.
- **3D:** **React Three Fiber** + **@react-three/drei** (scene graph, loaders, controls, `Html`, `useProgress`). **@react-three/postprocessing** for bloom/DOF used sparingly.
- **Authoring:** heavy hero scenes hand-built in R3F; designer-driven decorative scenes may use **Spline** embeds where speed matters.
- **Scroll:** **GSAP + ScrollTrigger** (or drei `ScrollControls`) for scroll-driven camera/material changes.
- **Models:** GLB/GLTF, **Draco**-compressed, **WebP/KTX2** textures via `gltf-transform optimize`.

### Performance budgets (hard requirements)
| Device | Target FPS | Max triangles/scene | Initial 3D payload |
|---|---|---|---|
| Desktop | 60 | ≤ 500K | ≤ 5 MB (lazy, post-LCP) |
| Mobile | 30–60 | ≤ 100K | ≤ 2.5 MB |
| Low-end | 30 | ≤ 50K | static fallback allowed |

- **Core Web Vitals:** LCP ≤ 2.5s (3D must **not** be the LCP element — hero text/poster paints first; canvas hydrates after), CLS < 0.1, INP < 200ms.
- **DPR:** cap at 1 on mobile, 2 on desktop; `performance={{ min: 0.5 }}` to allow adaptive frame drops.
- **Loading:** every `<Canvas>` wrapped in `<Suspense>` with `useProgress` loader; no un-indicated 3D loads.
- **Fallback:** WebGL feature-detect → static poster `<img>` + standard DOM layout. No content exclusively inside the canvas.
- **Lazy/route-split:** 3D scenes `React.lazy` + dynamic import; never block first paint. Instanced meshes for repeated objects; single directional + ambient light baseline.
- **Accessibility:** all canvases `aria-hidden` with DOM equivalents; OrbitControls (where used) `enableZoom={false}` so they never hijack page scroll; full keyboard nav of all interactive DOM; captions on video.

### Asset pipeline
`Blender → reduce <100K polys → bake textures → export GLB → gltf-transform (draco + webp) → test <5MB → CDN`.

---

## 7. 3D Design System (shared components)

Build once, reuse on every page:

- `<SceneCanvas>` — wraps R3F Canvas with DPR caps, perf min, Suspense, WebGL detection + poster fallback, reduced-motion switch.
- `<Lattice>` — interactive point-field background (props: density, reactivity, color).
- `<CandleForm>` / `<CandleField>` — sculptural candlestick instances.
- `<CoreEmblem>` — the metallic brand/coin GLB (used in nav, Max Bucks, loaders).
- `<SignalNodes>` — connected-node network graphic.
- `<ScrollStage>` — scroll-scrubbed camera rig + section sync.
- `<Loader3D>` — branded `useProgress` loading indicator.
- `<Poster>` — static fallback image component (auto-used when WebGL off / reduced-motion / low-end).
- Shared shaders: gradient-mesh background, fresnel/glow, dissolve transitions.

---

## 8. Information Architecture & Global Navigation

- **Global nav (sticky, glass):** Home · Indicators · Courses · Coaching · Prop Firms (Partners) · Network · Pricing · [Login / Dashboard]. Secondary: FAQ, About, Blitz, Community.
- **3D in nav:** animated `<CoreEmblem>` logo; page transitions use a shared `<Lattice>` dissolve (skipped under reduced-motion).
- **Footer:** links (legal, social: Discord/YouTube/X/Instagram), Discord member count (`/api/discord/online-count`), newsletter.
- **Member app shell:** left rail (Dashboard, My Courses, Coaching, Chat, Checklist, Calendar, Max Bucks, Affiliate, Support, Profile), top bar (notifications, search, avatar). T3 — accents only.

---

## 9. Page-by-Page Requirements

> Format per page: **Purpose · Tier · 3D concept · Key sections/components · Motion/interaction · Data (existing API) · Fallback · Success metric.**

### 9.1 Home / Landing
- **Purpose:** convert cold visitors; establish authority; route to products.
- **Tier:** T1.
- **3D concept:** full-viewport `<Lattice>` + floating `<CandleField>` forming the MOT mark on load; scroll-scrubbed camera flies through "pillars" (Indicators → Courses → Coaching → Community).
- **Sections:** hero (headline + primary CTA "Start"/"Join"), trust bar (70k Discord, member/results, partner logos), product pillars, indicator showcase teaser, Network teaser, testimonials, final CTA.
- **Motion:** scroll narrative; cursor-reactive lattice; magnetic CTAs.
- **Data:** `/api/site-settings`, `/api/seo/public`, `/api/partners` (logos), `/api/discord/online-count`, `/api/network/live` (teaser).
- **Fallback:** static hero poster + DOM sections.
- **Metric:** hero→signup CTR; scroll-depth; bounce.

### 9.2 Indicators (catalog)
- **Purpose:** sell premium WealthCharts/TradingView indicators (ORB, scalping, range, multi-asset).
- **Tier:** T1.
- **3D concept:** each indicator as a 3D "module" card; hover lifts/rotates; a hero `<CandleForm>` with abstract signal markers (clearly stylized, **not** live data).
- **Sections:** filterable grid (by platform/asset/strategy), per-indicator highlights, "works on NQ/ES/MNQ/MES + stocks/options," platform badges, CTA to buy/whitelist info.
- **Motion:** 3D hover tilt, scroll-reveal; optional mini "configurator" preview swapping indicator variants.
- **Data:** `/api/indicators`.
- **Fallback:** 2D card grid.
- **Metric:** indicator detail views, add-to-cart, purchase.

### 9.3 Indicator Detail
- **Tier:** T1/T2. **3D concept:** spotlighted 3D product object + scroll-through feature beats (entry/exit logic, risk params), embedded demo video/GIF (real chart screenshots).
- **Sections:** what it does, supported platforms/assets, how access/whitelisting works (TradingView search; WealthCharts via account email), pricing, FAQ, related indicators.
- **Data:** `/api/indicators/:id`, `/api/checkout/price`.
- **Metric:** purchase conversion, time-on-page.

### 9.4 Courses (catalog)
- **Purpose:** sell step-by-step trading courses.
- **Tier:** T1.
- **3D concept:** "learning path" rendered as a 3D track/constellation of modules the camera travels along on scroll.
- **Sections:** course cards (level, modules, duration), curriculum preview, instructor (Max), outcomes, CTA.
- **Data:** `/api/courses`, `/api/coaches`.
- **Fallback:** course card grid.
- **Metric:** enrollments, course-detail CTR.

### 9.5 Course Detail
- **Tier:** T2. **3D concept:** module timeline as 3D nodes; accent only. **Sections:** syllabus (modules/lessons), preview lessons, pricing/inclusion in membership, reviews. **Data:** `/api/courses/:id`, `/api/admin/modules`/`lessons` (public read). **Metric:** enroll CTR.

### 9.6 Course Player / Lesson (authenticated)
- **Purpose:** consume lessons; track progress.
- **Tier:** **T3 (utility-first).** Video + notes + progress; **no immersive 3D** (it competes with learning). Brand accents: animated progress `<CoreEmblem>`, subtle gradient bg.
- **Sections:** video player, lesson list/next, mark-complete, resources, comments/checklist link.
- **Data:** `/api/my-courses`, `/api/my-courses/progress`, `/api/courses/:id/lessons`.
- **Fallback:** n/a (already DOM-first).
- **Metric:** lesson completion rate, course completion.

### 9.7 Coaching
- **Purpose:** book 1-on-1 coaches.
- **Tier:** T2.
- **3D concept:** coach cards on a contained 3D "stage"; floating accolades; restrained.
- **Sections:** coach profiles (specialty, bio), how sessions work ("bring your charts, tighten risk & execution"), booking CTA.
- **Data:** `/api/coaches`, `/api/coaching/bookings`.
- **Fallback:** profile card grid.
- **Metric:** booking starts/completions.

### 9.8 Prop Firms / Partners
- **Purpose:** compare prop-firm eval accounts; drive affiliate clicks (this is the page analyzed earlier).
- **Tier:** **T2 — utility dominates.** Fast, filterable comparison table is the product; 3D is a hero accent only (firm logos on a subtle 3D shelf), never blocking the table.
- **Sections:** partner cards (logo, tagline, discount %, affiliate CTA, promo code "BDM"), the **comparison table** with configurable columns/filters, prop-firm plan rows, discount badges.
- **Motion:** lightweight; table virtualized for speed; logo hover depth.
- **Data:** `/api/partners`, `/api/prop-firm-plans`, `/api/prop-firm-config`, `/api/prop-firm-discounts`. (See companion price-scraper project for keeping plan data fresh.)
- **Fallback:** plain table.
- **Metric:** affiliate outbound CTR, time-to-compare.

### 9.9 MOT Network
- **Purpose:** showcase video content / live shows / playlists.
- **Tier:** T2.
- **3D concept:** a 3D "broadcast" environment / floating screens; live indicator pulses when on-air.
- **Sections:** live banner, episode grid, playlists, featured show, subscribe CTAs (YouTube).
- **Data:** `/api/network/live`, `/api/network/episodes`, `/api/network/playlists`, `/api/youtube/live-status`.
- **Fallback:** video thumbnail grid.
- **Metric:** plays, watch-through, YouTube subs.

### 9.10 Pricing / Membership Plans
- **Purpose:** convert to subscription/bundles.
- **Tier:** T1.
- **3D concept:** tiers as ascending 3D "vaults"/pillars; selected tier elevates; `<CoreEmblem>` value anchor.
- **Sections:** plan comparison, what's included (indicators/courses/community/coaching), monthly/annual toggle, FAQ, CTA → checkout.
- **Data:** `/api/subscriptions`, `/api/checkout/price`, `/api/payment/config`, `/api/prop-firm-discounts` (member perks).
- **Fallback:** pricing cards.
- **Metric:** plan-select rate, checkout starts.

### 9.11 Checkout (Stripe/PayPal)
- **Purpose:** complete payment with zero friction.
- **Tier:** **T3.** No scene — trust, speed, clarity. Brand gradient bg + animated success `<CoreEmblem>` only.
- **Sections:** order summary, Stripe/PayPal elements, promo code validation, confirmation.
- **Data:** `/api/checkout`, `/api/checkout/stripe/confirm-subscription`, `/api/checkout/paypal/*`, `/api/stripe/publishable-key`, `/api/validate-promo-code`.
- **Fallback:** n/a.
- **Metric:** checkout completion, payment errors.

### 9.12 MOT Blitz (event landing)
- **Purpose:** drive waitlist/registration for the in-person event at WealthCharts HQ (Lake Geneva, WI).
- **Tier:** T1.
- **3D concept:** signature immersive scene — venue/stage flythrough, countdown, `<SignalNodes>` for community energy.
- **Sections:** event hero, agenda, speakers (Big Daddy Max + MOT Network), venue, waitlist form, FAQ.
- **Data:** `/api/site-settings` (event config), `/api/release-promo-claim` (if gated).
- **Fallback:** static event poster + form.
- **Metric:** waitlist signups.

### 9.13 About / Story
- **Tier:** T1/T2. **3D concept:** scroll timeline of MOT's growth as a 3D path; Max's story; 70k community node-bloom. **Sections:** mission ("statistical precision and daily discipline"), founder, milestones, values, press/social. **Data:** static + `/api/site-settings`. **Metric:** scroll-depth, nav to products.

### 9.14 Community / Discord
- **Tier:** T2. **3D concept:** `<SignalNodes>` swarm visualizing 70k members; live count pulse. **Sections:** what's inside Discord, member count, rules/etiquette, join CTA, channel highlights. **Data:** `/api/discord/online-count`. **Fallback:** static graphic + count. **Metric:** Discord join clicks.

### 9.15 FAQ
- **Tier:** T2 (accent) / T3. **3D concept:** subtle gradient-mesh bg; categories as light 3D tabs. **Sections:** searchable categorized accordions (indicators, access, billing, prop firms). **Data:** `/api/faqs`, `/api/faq-categories`. **Fallback:** standard accordion. **Metric:** search success, support deflection.

### 9.16 Contact / Support (public)
- **Tier:** T3. **Sections:** contact form, support hours, links to Discord/ticketing, social. **Data:** `/api/support/tickets` (create). **Metric:** ticket quality, response satisfaction.

### 9.17 Legal (Terms, Privacy, Disclaimer, Refund/Chargeback)
- **Tier:** T3. Plain, readable, fast. Brand gradient header only. **Data:** static. **Metric:** readability, no perf cost.

### 9.18 Auth — Login / Register / Forgot Password
- **Purpose:** frictionless entry; Google OAuth.
- **Tier:** **T3.** Single contained ambient `<Lattice>`/gradient panel beside the form; form is DOM-first and instant.
- **Sections:** email/password, Google sign-in, register, forgot-password, error states.
- **Data:** `/api/auth/login`, `/api/auth/register`, `/api/auth/google`, `/api/auth/forgot-password`, `/api/auth/user`.
- **Fallback:** form with flat gradient.
- **Metric:** auth completion, OAuth share, error rate.

### 9.19 Member Dashboard (home)
- **Purpose:** orient logged-in members; fast routing to value.
- **Tier:** T3 (brand accents).
- **Sections:** welcome + `<CoreEmblem>`, continue-learning, upcoming coaching, Network live, Max Bucks balance, notifications, quick links, Discord status.
- **Data:** `/api/bootstrap`, `/api/auth/user`, `/api/my-courses/progress`, `/api/user/max-bucks`, `/api/user/notifications`, `/api/network/live`.
- **Fallback:** n/a. **Metric:** DAU, click-through to courses/coaching.

### 9.20 My Courses
- **Tier:** T3. **Sections:** enrolled courses + progress rings (animated `<CoreEmblem>` motif), resume CTA. **Data:** `/api/my-courses`, `/api/my-courses/progress`. **Metric:** resume rate, completion.

### 9.21 Team Chat
- **Tier:** **T3 (zero scene).** Real-time chat must be fast/legible. Accents: presence dots, subtle depth on panels. **Sections:** channels, messages, reactions, mentions, unread, notification prefs. **Data:** `/api/team-chat/*`, `/api/staff/presence/heartbeat`. **Metric:** messages/active user, latency.

### 9.22 Notifications
- **Tier:** T3. **Sections:** list, mark-all-read, per-type prefs. **Data:** `/api/user/notifications*`. **Metric:** read rate.

### 9.23 Profile / Account Settings
- **Tier:** T3. **Sections:** profile, avatar, notification prefs, access diagnostic, connected accounts. **Data:** `/api/user/profile`, `/api/user/notifications/preferences`, `/api/user/access-diagnostic`. **Metric:** profile completion.

### 9.24 Checklist / Personal Tasks (trading routine)
- **Tier:** T3. **3D concept:** optional small `<CoreEmblem>` streak/ritual reward animation on completion. **Sections:** daily checklist runs, my tasks, reorder, activity/comments map. **Data:** `/api/checklist/*`, `/api/personal-tasks*`. **Metric:** daily completion / streaks.

### 9.25 Calendar (economic/events)
- **Tier:** T3. **Sections:** categorized calendar, filters. **Data:** `/api/calendar/categories`, `/api/admin/calendar/categories` (read). **Metric:** engagement, return visits.

### 9.26 Max Bucks (rewards)
- **Tier:** T3 → small T2 moment. **3D concept:** the `<CoreEmblem>` coin is the hero of this page — spin/earn animation; otherwise utility. **Sections:** balance, earn history, redeem. **Data:** `/api/user/max-bucks`. **Metric:** redemption, engagement.

### 9.27 Subscriptions / Billing / Customer Portal
- **Tier:** T3. **Sections:** current plan, invoices, manage/cancel, payment method. **Data:** `/api/subscriptions`, `/api/customer-portal`, `/api/checkout/cancel`. **Metric:** churn, self-serve rate.

### 9.28 Affiliate Dashboard
- **Purpose:** affiliates manage links, track, request payouts.
- **Tier:** T3 (pure utility).
- **Sections:** enroll/agreement, my links, buyers, payable balance, payout request, Stripe Connect onboarding/status, tracking.
- **Data:** `/api/affiliate/*` (`enroll`, `links`, `buyers`, `payable`, `payout/request`, `payouts`, `stripe-connect/*`, `track`, `me`, `agreement/accept`).
- **Metric:** active affiliates, payout volume.

### 9.29 Support Tickets (authenticated)
- **Tier:** T3. **Sections:** ticket list, active chat, unread, create. **Data:** `/api/support/tickets*`. **Metric:** resolution time, CSAT.

### 9.30 Admin Panel
- **Purpose:** staff manage content/users/ops.
- **Tier:** **T3 — no immersive 3D.** Dense, fast, data-first; brand accent in header only.
- **Sections:** users/platform-users, courses/modules/lessons (+reorder), FAQs/categories (+reorder), partners, prop-firm plans, coaches, indicators, tickets, tracking links, calendar categories, uploads, **operator** (jobs/summary/worker-settings/requeue), current-user/check.
- **Data:** `/api/admin/*`.
- **Metric:** admin task time, error rate.

---

## 10. Cross-Cutting Requirements

- **Responsive:** mobile-first DOM; mobile reduces or replaces scenes with posters where budget exceeded; no horizontal scroll; touch targets ≥44px.
- **Accessibility:** WCAG 2.2 AA; keyboard for all interactive elements; `prefers-reduced-motion` honored everywhere; canvas `aria-hidden` + DOM equivalents; captions/transcripts for video; focus-visible states.
- **SEO:** SSR/SSG for all public pages (Next.js); per-page meta from `/api/seo/public`; structured data (Course, FAQ, Product, Organization — schema.org already referenced); sitemap; OG images (static posters of 3D scenes).
- **Analytics:** existing pixels (GTM, Meta, Clarity, Reddit) preserved; event taxonomy for CTA clicks, 3D interaction depth, scroll milestones, purchase funnel; FPS/perf telemetry sampled.
- **i18n-ready:** copy externalized (future).
- **Security/consent:** cookie consent; no PII in client logs.

---

## 11. Phased Rollout

| Phase | Scope | Exit criteria |
|---|---|---|
| **0 — Foundations** | 3D design system (§7), tokens, Next.js marketing shell, perf harness, WebGL fallback | System renders on all tiers; budgets enforced in CI |
| **1 — Hero marketing (T1)** | Home, Indicators, Courses, Pricing, Blitz | CWV pass; A/B vs old converts ≥ flat-to-positive |
| **2 — Secondary marketing (T2)** | Partners, Coaching, Network, Community, About, FAQ, Contact, Legal | All public pages live; SEO parity+ |
| **3 — Auth + member app (T3)** | Auth, dashboard, courses/player, chat, checklist, calendar, max bucks, profile, billing, notifications | No regressions; task times ≤ current |
| **4 — Affiliate + admin (T3)** | Affiliate dashboard, support, admin | Feature parity with current admin |
| **5 — Polish** | Postprocessing, transitions, perf tuning, a11y audit | A11y + perf sign-off |

---

## 12. Success Metrics (program-level)

- **Primary:** signup conversion, trial→paid, indicator/course purchase rate, affiliate outbound CTR.
- **Engagement:** scroll depth on T1 pages, Network watch-through, Discord joins, course completion.
- **Quality gates:** LCP ≤2.5s, CLS <0.1, INP <200ms on all pages; 60fps desktop / ≥30fps mobile on 3D pages; WCAG AA pass; 0 content-blocked-by-WebGL defects.

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| 3D hurts performance/CWV → SEO & conversion drop | High | Strict budgets in CI; 3D never the LCP element; lazy-load post-paint; posters/fallbacks |
| Over-immersive utility pages frustrate members | High | Tier model (T3 utility-first); usability testing on app pages |
| Mobile/low-end devices choke | Med | DPR caps, triangle budgets, adaptive perf, static fallback |
| Asset bloat | Med | Draco+WebP/KTX2, <5MB/scene, CDN, code-split |
| Accessibility regressions from canvas | High | DOM-first, reduced-motion, screen-reader equivalents, audits each phase |
| Scope (every page) overruns | Med | Phased rollout; reuse 3D system; T3 pages are cheap |
| SPA→Next.js migration risk | Med | Migrate marketing first; keep app SPA initially |

---

## 14. Assumptions & Open Questions

**Assumptions**
- Existing REST API (endpoints referenced throughout) remains the data source.
- Brand colors/marks derived from current assets (`MOT_ALT_LOGO.png`, favicon); exact tokens to be confirmed by brand.
- "Every page" = the ~30 surfaces inventoried from the live API/site (§9). New pages inherit a tier.

**Open questions (need stakeholder input)**
1. **Intensity ceiling:** is the brand comfortable with full-immersive T1 heroes, or prefer 3D *accents* only across the board?
2. **Next.js migration:** in scope for v1, or keep the Vite SPA and add 3D within it (limits SEO gains)?
3. **Member app:** redesign now or marketing-only v1?
4. **3D authoring:** in-house R3F vs. Spline (designer-led) vs. agency for hero scenes?
5. **Budget/timeline** and whether a custom GLB asset library (candle-forms, Core emblem) is commissioned.
6. **WebXR/AR** desired as a future phase?

---

*Companion artifact: the prop-firm price-scraper (`C:\Users\Dee\propfirm-scraper`) can keep the Partners page (§9.8) plan data fresh via the existing `/api/admin/prop-firm-plans` endpoint.*
