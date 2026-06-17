// Indicator detail page renderer. Reads ?ind=slug and renders from indicators.js.
import { INDICATORS, INDICATOR_ORDER } from "./indicators.js";
import { initCursor } from "./cursor.js";

const root = document.getElementById("ind-root");
const slug = new URLSearchParams(location.search).get("ind") || "advanced-orb";
const ind = INDICATORS[slug];

const CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

function render() {
  if (!ind) {
    document.title = "Indicator not found - MOT";
    root.innerHTML = `<h1 style="font-size:36px">Indicator not found</h1>
      <p style="color:var(--muted);margin:14px 0 22px">No indicator exists for "${slug}".</p>
      <a class="btn btn-primary" href="index.html#indicators">Back to all indicators</a>`;
    return;
  }
  document.title = `${ind.name} - Max Options Trading`;

  const related = INDICATOR_ORDER.filter((s) => s !== slug).slice(0, 3).map((s) => {
    const r = INDICATORS[s];
    return `<a class="rel-card" href="indicator.html?ind=${s}">
      <div class="rt">${r.tag}</div><h3>${r.name}</h3><p>${r.tagline}</p></a>`;
  }).join("");

  root.innerHTML = `
    <section class="ind-hero">
      <div>
        <div class="tag">${ind.tag}</div>
        <h1>${ind.name}</h1>
        <p class="blurb">${ind.blurb}</p>
        <div class="cta">
          <a class="btn btn-primary" href="#">Get this indicator</a>
          <a class="btn btn-ghost" href="#access">How access works</a>
        </div>
      </div>
      <div class="ind-art"><img src="https://picsum.photos/seed/mot-${slug}/800/600" alt="${ind.name} chart preview" /></div>
    </section>

    <section class="ind-sec">
      <h2>What it does</h2>
      <div class="feat-grid">
        ${ind.features.map((f) => `<div class="feat"><span class="ck">${CHECK}</span><p>${f}</p></div>`).join("")}
      </div>
      <div class="access" id="access">
        <div>
          <div class="at">Access</div>
          <div class="av">Built for <b>${ind.platforms}</b>. Access is granted to your linked account within minutes of purchase.</div>
        </div>
        <a class="btn btn-primary" href="#">Get this indicator</a>
      </div>
    </section>

    <section class="ind-sec">
      <h2>More MOT indicators</h2>
      <div class="related">${related}</div>
    </section>`;
}

initCursor();
render();
