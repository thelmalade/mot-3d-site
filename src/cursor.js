// Soft brand-green glow that trails the cursor (lerped for a premium feel).
// Skipped on touch devices; snaps instantly under prefers-reduced-motion.
export function initCursor() {
  if (matchMedia("(pointer: coarse)").matches) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let glow = document.getElementById("cursor-glow");
  if (!glow) {
    glow = document.createElement("div");
    glow.id = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);
  }

  let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
  addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY; glow.style.opacity = "1";
  }, { passive: true });
  addEventListener("pointerleave", () => { glow.style.opacity = "0"; });

  function loop() {
    const k = reduced ? 1 : 0.4;             // follow factor (higher = snappier)
    x += (tx - x) * k; y += (ty - y) * k;
    glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
