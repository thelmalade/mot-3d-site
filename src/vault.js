// Course vault: sign-in gate -> ownership check -> unlocked video player or
// locked/enroll state. Auth + entitlement are mocked in localStorage (front-end
// demo). In production, swap getUser/owns/unlock for /api/auth + /api/my-courses.

import { PROGRAMS } from "./programs.js";
import { initCursor } from "./cursor.js";

const root = document.getElementById("vault-root");
const whoEl = document.getElementById("who");
const slug = new URLSearchParams(location.search).get("program") || "cso-battalion";
const program = PROGRAMS[slug];

// ---- mock auth + entitlement ----
const getUser = () => localStorage.getItem("mot_user");
const setUser = (e) => localStorage.setItem("mot_user", e);
const signOut = () => { localStorage.removeItem("mot_user"); render(); };
const owns = () => localStorage.getItem("mot_owns_" + slug) === "1" || (!!program && program.owned);
const unlock = () => { localStorage.setItem("mot_owns_" + slug, "1"); render(); };

// flat lesson list for indexing/progress
function lessons() {
  const out = [];
  program.modules.forEach((m) => m.lessons.forEach((l) => out.push(l)));
  return out;
}
let activeIndex = 0;
let playing = false;

function render() {
  if (!program) {
    whoEl.innerHTML = "";
    root.innerHTML = `<div class="vwrap"><div><h1 class="prog-title">Program not found</h1>
      <p class="prog-tag">No vault exists for "${slug}".</p><a class="btn btn-primary" href="index.html">Back to home</a></div></div>`;
    return;
  }
  if (!getUser()) return renderGate();
  renderVault();
}

// ---------- sign-in gate ----------
function renderGate() {
  whoEl.innerHTML = "";
  root.innerHTML = `
    <div class="gate">
      <div class="card">
        <div class="mark"></div>
        <h2>Sign in to the vault</h2>
        <p class="sub">Access your <b>${program.name}</b> content. Members only.</p>
        <form id="gate-form">
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="you@email.com" autocomplete="email" />
          <label for="pass">Password</label>
          <input id="pass" type="password" placeholder="••••••••" autocomplete="current-password" />
          <div class="err" id="err"></div>
          <button class="btn btn-primary" type="submit">Sign in</button>
        </form>
        <p class="alt">New here? <a href="#" id="create">Create an account</a></p>
      </div>
    </div>`;
  const form = document.getElementById("gate-form");
  const err = document.getElementById("err");
  const submit = (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("pass").value.trim();
    if (!email || !pass) { err.textContent = "Enter your email and password."; return; }
    if (!/.+@.+\..+/.test(email)) { err.textContent = "Enter a valid email."; return; }
    setUser(email);
    render();
  };
  form.addEventListener("submit", submit);
  document.getElementById("create").addEventListener("click", (e) => { e.preventDefault(); submit(e); });
}

// ---------- vault ----------
function renderVault() {
  const email = getUser();
  whoEl.innerHTML = `
    <span class="av">${email[0].toUpperCase()}</span>
    <span>${email}</span>
    <button id="signout">Sign out</button>`;
  whoEl.querySelector("#signout").addEventListener("click", signOut);

  const has = owns();
  const all = lessons();
  const total = all.length;
  const completed = has ? Math.min(2, total) : 0; // demo progress
  const pct = Math.round((completed / total) * 100);
  const active = all[activeIndex];
  const activePlayable = has || active.free;

  root.innerHTML = `
    <div class="vwrap">
      <section>
        <div class="prog-eyebrow">Course vault</div>
        <h1 class="prog-title">${program.name}</h1>
        <p class="prog-tag">${program.tagline}</p>

        <div class="stage ${playing ? "playing" : ""}" id="stage">
          <img src="${program.poster}" alt="" />
          ${activePlayable ? `
            <div class="play" id="play"><button aria-label="Play">${playing ? "❚❚" : "▶"}</button></div>
            <div class="nowbar"><span class="time">0:00</span><div class="bar"><i id="prog" style="width:${playing ? 40 : 0}%"></i></div><span class="time">${active.len}</span></div>
          ` : `
            <div class="lock-over">
              <div>
                <div class="lk">🔒</div>
                <h3>Unlock ${program.name}</h3>
                <p>You don't own this program yet. Free preview lessons are still available.</p>
                <div class="price">${program.price}</div>
                <button class="btn btn-primary" id="unlock">Enroll now</button>
              </div>
            </div>`}
        </div>

        <div class="now-meta">
          <h2>${active.t}</h2>
          <p>${activePlayable ? "Now playing from your library." : "Locked. Enroll to watch this lesson."}</p>
        </div>
      </section>

      <aside class="curric">
        <div class="ch">
          <div class="pl"><span class="pmeta">${has ? "Owned" : "Preview access"}</span><span class="pmeta">${completed}/${total} done</span></div>
          <div class="pbar"><i style="width:${pct}%"></i></div>
        </div>
        ${program.modules.map((m) => `
          <div class="mod">
            <div class="mh">${m.title}</div>
            ${m.lessons.map((l) => {
              const idx = all.indexOf(l);
              const playable = has || l.free;
              const isActive = idx === activeIndex;
              const ic = isActive && playing ? "❚❚" : playable ? "▶" : "🔒";
              return `<div class="lesson ${playable ? "playable" : "locked"} ${isActive ? "active" : ""}" data-idx="${idx}">
                <span class="ic">${ic}</span>
                <span class="t">${l.t}</span>
                ${l.free && !has ? `<span class="free">FREE</span>` : ""}
                <span class="len">${l.len}</span>
              </div>`;
            }).join("")}
          </div>`).join("")}
      </aside>
    </div>`;

  // wire interactions
  const unlockBtn = document.getElementById("unlock");
  if (unlockBtn) unlockBtn.addEventListener("click", unlock);

  const playBtn = document.getElementById("play");
  if (playBtn) playBtn.addEventListener("click", togglePlay);

  root.querySelectorAll(".lesson").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = +el.dataset.idx;
      const l = all[idx];
      if (!(has || l.free)) { // locked -> nudge enroll
        activeIndex = idx; playing = false; renderVault();
        document.getElementById("stage")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      activeIndex = idx; playing = true; renderVault();
    });
  });

  animateProgress();
}

function togglePlay() { playing = !playing; renderVault(); }

// gentle faux playhead so the player feels alive
let progTimer = null;
function animateProgress() {
  clearInterval(progTimer);
  if (!playing) return;
  const bar = document.getElementById("prog");
  if (!bar) return;
  let w = parseFloat(bar.style.width) || 0;
  progTimer = setInterval(() => {
    w = Math.min(100, w + 0.6);
    bar.style.width = w + "%";
    if (w >= 100) clearInterval(progTimer);
  }, 400);
}

initCursor();
render();
