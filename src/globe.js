// 3D market globe (amber broadcast). Dot-matrix sphere + fresnel atmosphere glow +
// starfield + orbital HUD rings + evenly-spaced instrument nodes + clickable brand
// link-nodes + electric lightning bolts. Points/lines only -> stays in perf budget.

import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { ASSETS, BRANDS } from "./data.js";

const AMBER = 0xe8a13c;
const BRIGHT = 0xffc061;
const GREEN = 0x4ebc97;    // MOT brand green: flowing market data
const GREENB = 0x2ee6a6;
const ARC = 0x4ebc97;      // data streams in brand green
const DOT = 0x9c814a;
const BOLT = 0xfff1d0;
const R = 1.6;

// Evenly spaced points on a sphere (fibonacci) so instruments never bunch up.
function fib(i, n, radius = R) {
  const y = 1 - (i / (n - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const phi = i * Math.PI * (3 - Math.sqrt(5));
  return new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r).multiplyScalar(radius);
}

export function createGlobe(canvas, labelLayer, opts = {}) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, /Mobi|Android/i.test(navigator.userAgent) ? 1 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.4, 5.2);

  const root = new THREE.Group();
  scene.add(root);
  const labelRenderer = new CSS2DRenderer({ element: labelLayer });

  // --- starfield (behind everything) ---
  const starN = 700;
  const sp = new Float32Array(starN * 3);
  for (let i = 0; i < starN; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(14 + Math.random() * 16);
    sp.set([v.x, v.y, v.z], i * 3);
  }
  const stars = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(sp, 3)),
    new THREE.PointsMaterial({ color: 0xbfae8c, size: 0.06, transparent: true, opacity: 0.5 })
  );
  scene.add(stars);

  // --- dark core ---
  root.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.99, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x140f08, transparent: true, opacity: 0.7 })
  ));

  // --- dot-matrix sphere ---
  const N = 2800;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const v = fib(i, N); pos.set([v.x, v.y, v.z], i * 3); }
  root.add(new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pos, 3)),
    new THREE.PointsMaterial({ color: DOT, size: 0.023, transparent: true, opacity: 0.9, sizeAttenuation: true })
  ));

  // --- wire shell ---
  root.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.002, 36, 22),
    new THREE.MeshBasicMaterial({ color: GREEN, wireframe: true, transparent: true, opacity: 0.06 })
  ));

  // --- fresnel atmosphere glow (premium rim) ---
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.18, 64, 64),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
      uniforms: { uAmber: { value: new THREE.Color(AMBER) }, uGreen: { value: new THREE.Color(GREEN) } },
      vertexShader: `varying vec3 vN; varying vec3 vP; varying vec3 vL;
        void main(){ vN=normalize(normalMatrix*normal); vL=normalize(position);
        vec4 mv=modelViewMatrix*vec4(position,1.0); vP=normalize(-mv.xyz);
        gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vP; varying vec3 vL;
        uniform vec3 uAmber; uniform vec3 uGreen;
        void main(){
          float f=pow(1.0-abs(dot(vN,vP)),2.6);
          float t=clamp(vL.y*0.5+0.5,0.0,1.0);   // green low -> amber high
          vec3 col=mix(uGreen,uAmber,t);
          gl_FragColor=vec4(col,f*0.9);
        }`,
    })
  );
  root.add(atmo);

  // --- orbital HUD rings (tilted, slow spin) ---
  const ringMat = new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(R * 1.42, 0.006, 8, 120), ringMat);
  ringA.rotation.x = Math.PI / 2.2;
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(R * 1.62, 0.004, 8, 120), ringMat.clone());
  ringB.rotation.x = Math.PI / 1.7; ringB.rotation.z = 0.6;
  // two extra subtle green bands
  const greenRingMat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
  const ringC = new THREE.Mesh(new THREE.TorusGeometry(R * 1.52, 0.005, 8, 120), greenRingMat);
  ringC.rotation.x = Math.PI / 2.6; ringC.rotation.y = 0.4;
  const ringD = new THREE.Mesh(new THREE.TorusGeometry(R * 1.74, 0.004, 8, 120), greenRingMat.clone());
  ringD.rotation.x = Math.PI / 1.9; ringD.rotation.z = -0.5;
  scene.add(ringA, ringB, ringC, ringD);

  // --- nodes: instruments + brand links, evenly spaced ---
  const total = ASSETS.length + BRANDS.length;
  const nodes = [];
  ASSETS.forEach((asset, i) => {
    const p = fib(i, total, R * 1.03);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 14), new THREE.MeshBasicMaterial({ color: AMBER }));
    dot.position.copy(p); root.add(dot);
    const el = document.createElement("div");
    el.className = "asset-label";
    el.innerHTML = `<span class="sym">${asset.sym}</span><span class="px"></span>`;
    const label = new CSS2DObject(el); label.position.copy(p.clone().multiplyScalar(1.05)); root.add(label);
    nodes.push({ asset, dot, el, px: el.querySelector(".px"), pos: p, pulse: 0 });
  });

  BRANDS.forEach((brand, i) => {
    const p = fib(ASSETS.length + i, total, R * 1.05);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 10, 24), new THREE.MeshBasicMaterial({ color: BRIGHT }));
    ring.position.copy(p); ring.lookAt(0, 0, 0); root.add(ring);
    const a = document.createElement("a");
    a.className = "brand-node"; a.href = brand.url;
    a.innerHTML = `<span class="bn-dot"></span>${brand.name}<span class="bn-arrow">&#8599;</span>`;
    const label = new CSS2DObject(a); label.position.copy(p.clone().multiplyScalar(1.12)); root.add(label);
    nodes.push({ brand: true, dot: ring, pos: p, pulse: 0, spin: 0.4 + Math.random() });
  });

  // --- streaming arcs between random instrument nodes ---
  const streams = [];
  const arcGroup = new THREE.Group(); root.add(arcGroup);
  const instr = nodes.filter((n) => n.asset);
  for (let i = 0; i < 14; i++) {
    const a = instr[i % instr.length].pos, b = instr[(i * 5 + 3) % instr.length].pos;
    if (a.equals(b)) continue;
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.22 + Math.random() * 0.28));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    arcGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),
      new THREE.LineBasicMaterial({ color: ARC, transparent: true, opacity: 0.28 })));
    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), new THREE.MeshBasicMaterial({ color: GREENB }));
    arcGroup.add(packet);
    streams.push({ curve, packet, t: Math.random(), speed: 0.0018 + Math.random() * 0.003 });
  }

  // --- lightning (dramatic: forks + endpoint glow + flicker + volleys) ---
  const bolts = [];
  function jagged(a, b, segs, jitter) {
    const pts = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const p = a.clone().lerp(b, t);
      if (i > 0 && i < segs)
        p.add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
          .multiplyScalar(jitter * Math.sin(t * Math.PI)));
      pts.push(p);
    }
    return pts;
  }
  // Real tube geometry so thickness actually renders (WebGL ignores line width).
  function boltLine(pts, radius = 0.0117) {   // ~30% fatter than the prior ~0.009 read
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, radius, 5, false);
    return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: BOLT, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
  }
  function spawnBolt(a, b) {
    if (reduced) return;
    const g = new THREE.Group();
    const main = jagged(a, b, 13, 0.22);
    g.add(boltLine(main));
    // branching forks
    const forks = 1 + (Math.random() * 2 | 0);
    for (let k = 0; k < forks; k++) {
      const base = main[3 + (Math.random() * (main.length - 5) | 0)];
      const tip = base.clone().add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.55));
      g.add(boltLine(jagged(base, tip, 5, 0.13), 0.0068)); // thinner forks
    }
    // bright endpoint flash
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 10),
      new THREE.MeshBasicMaterial({ color: BRIGHT, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending })
    );
    glow.position.copy(b); g.add(glow);
    root.add(g);
    bolts.push({ g, ttl: 0.36, max: 0.36 });
    if (opts.onBolt) opts.onBolt();
    const hit = nodes.find((n) => n.asset && n.pos.distanceTo(b) < 0.02);
    if (hit) hit.pulse = 1;
  }
  function volley() {
    const c = instr.length;
    const a = instr[Math.random() * c | 0].pos;
    spawnBolt(Math.random() < 0.5 ? instr[Math.random() * c | 0].pos : a.clone().multiplyScalar(2.9), a);
    if (Math.random() < 0.6) {
      const x = instr[Math.random() * c | 0].pos, y = instr[Math.random() * c | 0].pos;
      if (!x.equals(y)) spawnBolt(x, y);
    }
  }
  let boltTimer = 0;

  // --- pointer parallax ---
  let target = { x: 0, y: 0 };
  if (!reduced) addEventListener("pointermove", (e) => {
    target.y = (e.clientX / innerWidth - 0.5) * 0.5;
    target.x = (e.clientY / innerHeight - 0.5) * 0.3;
  });

  function resize(w, h) {
    renderer.setSize(w, h, false); labelRenderer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  const clock = new THREE.Clock();
  function render() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!reduced) { root.rotation.y += dt * 0.05; stars.rotation.y -= dt * 0.005; }
    root.rotation.x += (target.x - root.rotation.x) * 0.04;
    root.rotation.z += (target.y * 0.12 - root.rotation.z) * 0.04;
    ringA.rotation.z += dt * 0.12; ringB.rotation.y += dt * 0.09;
    ringC.rotation.z -= dt * 0.08; ringD.rotation.y -= dt * 0.06;

    for (const s of streams) {
      s.t = (s.t + s.speed * (reduced ? 0 : 1) * 60 * dt) % 1;
      s.curve.getPoint(s.t, s.packet.position);
      const f = Math.sin(s.t * Math.PI);
      s.packet.material.opacity = 0.3 + f * 0.7; s.packet.scale.setScalar(0.6 + f);
    }

    for (const n of nodes) {
      if (n.brand) { n.dot.rotation.z += dt * n.spin; continue; }
      n.pulse = Math.max(0, n.pulse - dt * 1.6);
      n.dot.scale.setScalar(1 + n.pulse * 2.4);
      n.dot.material.color.setHex(n.pulse > 0.4 ? BRIGHT : AMBER);
      n.el.classList.toggle("hot", n.pulse > 0.4);
    }

    // frequent dramatic lightning volleys
    boltTimer -= dt;
    if (boltTimer <= 0 && !reduced) { boltTimer = 0.5 + Math.random() * 0.8; volley(); }
    for (let i = bolts.length - 1; i >= 0; i--) {
      const bt = bolts[i]; bt.ttl -= dt;
      if (bt.ttl <= 0) {
        root.remove(bt.g);
        bt.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        bolts.splice(i, 1);
      } else {
        const o = (bt.ttl / bt.max) * (0.55 + Math.random() * 0.45); // electric flicker
        bt.g.children.forEach((c) => { if (c.material) c.material.opacity = o; });
      }
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  resize(innerWidth, innerHeight);
  return {
    camera, root, render, resize,
    flash(sym, priceText, up) {
      const n = nodes.find((x) => x.asset && x.asset.sym === sym);
      if (!n) return;
      n.pulse = 1; n.px.textContent = priceText; n.el.classList.toggle("down", !up);
      if (Math.random() < 0.55) { // bolt off a live tick
        const o = instr[(Math.random() * instr.length) | 0];
        if (o !== n) spawnBolt(n.pos, o.pos);
      }
    },
  };
}
