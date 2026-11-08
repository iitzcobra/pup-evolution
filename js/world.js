'use strict';
// Pup Evolution - the four ranches (painted in code once per screen size), their ambient life, and the UI icons.
// The ranch changes when pup 6, 9 and 12 are found: the same steps where adoptions get better.

const WORLDS = [
  { name: 'Meadow Ranch', at: 1, sky: ['#3aa6f2', '#86d3ff', '#dff6ff'], far: '#a9d4e6', hills: ['#9ad66f', '#74c24f'],
    grass: ['#a2e06e', '#79c94c', '#62b63a'], blades: ['#5aa834', '#6cbf42', '#8fd862', '#b3ea86'], tree: ['#3f9c43', '#5fbf55', '#2e7a33'],
    fence: '#d9a161', fenceDark: '#8a5a2b', flowers: ['#ffffff', '#ffe066', '#ff8fb1', '#b39dff'], ambient: 'butterfly',
    panel: ['#a46a3c', '#7b4a26', '#5c3518'], text: '#ffffff' },
  { name: 'Golden Hills', at: 6, sky: ['#ff6f61', '#ffa46b', '#ffe0a0'], far: '#e9a07c', hills: ['#e8b54f', '#cf9536'],
    grass: ['#e4cf66', '#d0b54d', '#b89a3a'], blades: ['#b08e2e', '#c7a73d', '#e0c45a', '#f2dc84'], tree: ['#c9702a', '#e8953c', '#9c5220'],
    fence: '#b8723a', fenceDark: '#5e3414', flowers: ['#ffd23f', '#ff9f43', '#fff3b0', '#ff7a59'], ambient: 'petal',
    panel: ['#975a2e', '#6e3c1a', '#4f2910'], text: '#ffffff' },
  { name: 'Neon Night', at: 9, sky: ['#070320', '#24104d', '#6a2283'], far: '#2a1158', hills: ['#25124f', '#1b0d3d'],
    grass: ['#33206b', '#291a5c', '#1f134a'], blades: ['#4a2f96', '#5b3bb3', '#7a50d6', '#29e3ff'], tree: ['#ff4fd8', '#29e3ff', '#1a0d3d'],
    fence: '#29e3ff', fenceDark: '#ff4fd8', flowers: ['#29e3ff', '#ff4fd8', '#b6ff4f'], ambient: 'firefly', neon: true,
    panel: ['#22145a', '#140b38', '#0b0622'], text: '#ffffff' },
  { name: 'Cosmic Ranch', at: 12, sky: ['#02030a', '#0e0b30', '#2f1c66'], far: '#1c1448', hills: ['#2c2170', '#20185a'],
    grass: ['#3a2f86', '#2d2672', '#211c5a'], blades: ['#4b3fa6', '#5d50c2', '#7b6ee0', '#a9f0ff'], tree: ['#7fe3ff', '#d58bff', '#1c1448'],
    fence: '#c6b3ff', fenceDark: '#6b52ff', flowers: ['#9fd8ff', '#ffd1ff', '#fff3a0'], ambient: 'star', neon: true, space: true,
    panel: ['#1d1650', '#120d36', '#0a0722'], text: '#ffffff' },
];
function worldOf(best) { return best >= 12 ? 3 : best >= 9 ? 2 : best >= 6 ? 1 : 0; }

function rng(seed) {                               // small deterministic random (mulberry32)
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

// ---------- the static ranch picture, redrawn only on resize or a new world ----------
let BG = null, BGKEY = '';
function ranchBackground(wi) {
  const key = `${W}x${H}@${DPR}:${wi}:${LAYOUT.portrait}`;
  if (BG && BGKEY === key) return BG;
  BGKEY = key;
  BG = BG || document.createElement('canvas');
  BG.width = Math.round(W * DPR); BG.height = Math.round(H * DPR);
  const g = BG.getContext('2d');
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  paintWorld(g, WORLDS[wi], LAYOUT);
  return BG;
}
function paintWorld(g, w, L) {
  const wi = WORLDS.indexOf(w), R = rng(1234 + wi * 77), f = L.field, top = f.y, u = Math.min(W, H) / 100;
  const band = Math.max(12, top - L.hud.h);
  // sky
  const sky = g.createLinearGradient(0, 0, 0, top);
  sky.addColorStop(0, w.sky[0]); sky.addColorStop(0.62, w.sky[1]); sky.addColorStop(1, w.sky[2]);
  g.fillStyle = sky; g.fillRect(0, 0, W, top + 2);
  if (w.neon) {                                    // stars
    for (let i = 0; i < 110; i++) { g.globalAlpha = 0.25 + R() * 0.75; g.fillStyle = R() < 0.15 ? '#ffd6ff' : '#ffffff'; const r = R() * 1.3 + 0.3; g.beginPath(); g.arc(R() * W, R() * top * 0.95, r, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;
  }
  if (wi === 0) {
    sun(g, W * 0.86, top - band * 0.8, Math.max(14, band * 0.3), '#fff8c4', 'rgba(255,244,170,0.55)', true);
    for (let i = 0; i < 5; i++) cloudShape(g, R() * W, L.hud.h * 0.25 + R() * (band * 0.55 + L.hud.h * 0.4), 14 + R() * 20, '#ffffff', '#cfe8f7');
  } else if (wi === 1) {
    sun(g, W * 0.24, top - band * 0.32, Math.max(22, band * 0.55), '#fff2c0', 'rgba(255,190,110,0.6)', false);
    for (let i = 0; i < 4; i++) cloudShape(g, R() * W, L.hud.h * 0.3 + R() * band * 0.6, 14 + R() * 18, '#ffd2b0', '#f0a07c');
  } else if (wi === 2) {
    synthSun(g, W * 0.5, top - band * 0.15, Math.max(26, Math.min(W * 0.2, band * 1.1)));
  } else {
    nebula(g, W * 0.22, top - band * 0.7, Math.max(70, W * 0.3), 'rgba(160,90,255,0.32)');
    nebula(g, W * 0.7, top - band * 1.2, Math.max(60, W * 0.24), 'rgba(60,160,255,0.22)');
    planet(g, W * 0.82, top - band * 0.62, Math.max(16, band * 0.34));
    g.fillStyle = '#d9d4ff'; g.beginPath(); g.arc(W * 0.12, top - band * 0.95, Math.max(5, band * 0.1), 0, Math.PI * 2); g.fill();
  }
  // far layer, mid hills, horizon props
  ridge(g, top, band * 0.95, w.far, R, 7, 0.55);
  if (wi === 2) skyline(g, top, band, R);
  if (wi === 3) spires(g, top, band, R);
  ridge(g, top, band * 0.55, w.hills[0], R, 5, 0.8);
  if (wi === 0) { barn(g, W * 0.74, top - band * 0.18, Math.max(16, band * 0.42)); treeRow(g, top, band, w, R); }
  if (wi === 1) { windmill(g, W * 0.7, top - band * 0.12, Math.max(18, band * 0.55)); treeRow(g, top, band, w, R); }
  if (wi === 2) palms(g, top, band, R);
  ridge(g, top, band * 0.22, w.hills[1], R, 4, 1);
  if (wi === 1) for (let i = 0; i < 3; i++) hay(g, W * (0.12 + i * 0.3) + R() * 20, top - 1, Math.max(9, band * 0.2));
  // the field
  paintField(g, w, wi, f, R, u);
  fence(g, f, w);
  doghouse(g, f.x + Math.min(f.w * 0.15, 80), top + 3, Math.max(30, Math.min(band * 1.05, f.w * 0.2, 92)), w);
  // panel behind the buttons
  panelBox(g, L, w);
}
function paintField(g, w, wi, f, R, u) {
  const bottom = f.y + f.h, fH = H - f.y;
  const fg = g.createLinearGradient(0, f.y, 0, H);
  fg.addColorStop(0, w.grass[0]); fg.addColorStop(0.55, w.grass[1]); fg.addColorStop(1, w.grass[2]);
  g.fillStyle = fg; g.fillRect(0, f.y, W, fH);
  // sunlit middle
  const lit = g.createRadialGradient(f.x + f.w * 0.55, f.y + f.h * 0.42, 0, f.x + f.w * 0.55, f.y + f.h * 0.42, Math.max(f.w, f.h) * 0.75);
  lit.addColorStop(0, w.neon ? 'rgba(160,110,255,0.16)' : 'rgba(255,255,220,0.2)'); lit.addColorStop(1, 'rgba(255,255,220,0)');
  g.fillStyle = lit; g.fillRect(0, f.y, W, fH);
  // big soft patches
  for (let i = 0; i < 16; i++) {
    const x = f.x + R() * f.w, y = f.y + R() * f.h, rx = (0.08 + R() * 0.16) * f.w, ry = rx * (0.35 + R() * 0.2);
    g.fillStyle = R() < 0.5 ? rgba(w.grass[2], 0.18) : rgba(w.grass[0], 0.22);
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
  }
  if (wi < 2) {                                    // mowed stripes that widen toward you
    const n = Math.max(5, Math.round(f.w / Math.max(46, u * 11)));
    for (let i = 0; i < n; i += 2) {
      const x0 = f.x + (i / n) * f.w, x1 = f.x + ((i + 1) / n) * f.w, cx = f.x + f.w / 2, spread = 1.35;
      g.fillStyle = 'rgba(255,255,255,0.055)'; g.beginPath(); g.moveTo(x0, f.y); g.lineTo(x1, f.y);
      g.lineTo(cx + (x1 - cx) * spread, H); g.lineTo(cx + (x0 - cx) * spread, H); g.closePath(); g.fill();
    }
  } else if (wi === 2) {                           // synthwave grid
    g.save(); g.shadowColor = '#ff4fd8'; g.shadowBlur = 6; g.strokeStyle = 'rgba(255,79,216,0.42)'; g.lineWidth = 1.3;
    const vx = f.x + f.w / 2;
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(vx + i * f.w * 0.035, f.y); g.lineTo(vx + i * f.w * 0.2, H); g.stroke(); }
    for (let k = 1; k < 16; k++) { const y = f.y + Math.pow(k / 15, 1.7) * fH; g.globalAlpha = 0.3 + k / 26; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.restore(); g.globalAlpha = 1;
  } else {                                         // craters on the moon meadow
    for (let i = 0; i < 12; i++) {
      const x = f.x + R() * f.w, y = f.y + 10 + R() * (f.h - 10), r = (2.5 + R() * 6) * u;
      g.fillStyle = 'rgba(8,6,36,0.38)'; g.beginPath(); g.ellipse(x, y, r, r * 0.38, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(170,150,255,0.3)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y + r * 0.04, r, r * 0.38, 0, 0.15, Math.PI - 0.15); g.stroke();
    }
  }
  // grass blades: many small strokes in four shades
  const nb = Math.min(4200, Math.round(f.w * f.h / 95)), bl = Math.max(3, u * 0.9);
  g.lineCap = 'round';
  for (let i = 0; i < nb; i++) {
    const x = f.x + R() * f.w, y = f.y + 4 + R() * (fH - 4), s = bl * (0.6 + R() * 0.8) * (0.75 + 0.5 * (y - f.y) / fH);
    g.strokeStyle = w.blades[(R() * (w.neon ? 3 : 4)) | 0]; g.globalAlpha = w.neon ? 0.5 : 0.75; g.lineWidth = Math.max(1, s * 0.28);
    const lean = (R() - 0.5) * s * 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + lean * 0.3, y - s * 0.6, x + lean, y - s); g.stroke();
  }
  g.globalAlpha = 1;
  // clusters: flowers and clovers (or glowing bits at night)
  const nc = Math.round(f.w * f.h / 9000);
  for (let i = 0; i < nc; i++) {
    const x = f.x + R() * f.w, y = f.y + 12 + R() * (fH - 12), col = w.flowers[(R() * w.flowers.length) | 0];
    const k = w.neon ? 1 : 2 + ((R() * 3) | 0), s = Math.max(2.2, u * 0.62) * (0.8 + R() * 0.5);
    for (let j = 0; j < k; j++) flower(g, x + (R() - 0.5) * s * 7, y + (R() - 0.5) * s * 3, s, col, w);
  }
  if (!w.neon) for (let i = 0; i < Math.round(f.w / 120); i++) rock(g, f.x + R() * f.w, f.y + f.h * (0.2 + R() * 0.78), Math.max(4, u * (1 + R() * 1.4)), wi);
  if (wi === 0) for (let i = 0; i < 3; i++) mushroom(g, f.x + R() * f.w, f.y + f.h * (0.3 + R() * 0.65), Math.max(4, u * 1.1));
  if (wi === 1) for (let i = 0; i < 4; i++) wheat(g, f.x + (i < 2 ? R() * f.w * 0.1 : f.w * (0.9 + R() * 0.1)), f.y + f.h * (0.2 + R() * 0.7), Math.max(10, u * 3.2), R);
  if (w.space) for (let i = 0; i < 7; i++) crystal(g, f.x + R() * f.w, f.y + 14 + R() * (f.h - 20), Math.max(5, u * (1.6 + R() * 1.6)), i % 2 ? '#7fe3ff' : '#d58bff');
  if (wi === 2) for (let i = 0; i < 4; i++) glowPlant(g, f.x + R() * f.w, f.y + 14 + R() * (f.h - 20), Math.max(4, u * 1.2), i % 2 ? '#29e3ff' : '#ff4fd8');
  // bushes that frame the sides
  for (let i = 0; i < 7; i++) {
    const side = i % 2 ? 1 : 0, y = f.y + f.h * (0.08 + i * 0.14) + R() * 12, r = Math.max(14, u * (4 + R() * 3));
    bush(g, side ? f.x + f.w + r * 0.35 : f.x - r * 0.35, y, r, w, wi);
  }
  // shade under the fence, soft vignette
  const fs = g.createLinearGradient(0, f.y, 0, f.y + Math.max(18, u * 5));
  fs.addColorStop(0, w.neon ? 'rgba(0,0,0,0.35)' : 'rgba(20,50,10,0.28)'); fs.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = fs; g.fillRect(0, f.y, W, Math.max(18, u * 5));
  const vg = g.createRadialGradient(f.x + f.w / 2, f.y + f.h / 2, Math.min(f.w, f.h) * 0.45, f.x + f.w / 2, f.y + f.h / 2, Math.hypot(f.w, f.h) * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, w.neon ? 'rgba(0,0,10,0.38)' : 'rgba(20,40,0,0.22)');
  g.fillStyle = vg; g.fillRect(f.x, f.y, f.w, bottom - f.y);
}
function sun(g, x, y, r, core, glow, rays) {
  const gr = g.createRadialGradient(x, y, r * 0.3, x, y, r * 2.8);
  gr.addColorStop(0, glow); gr.addColorStop(1, glow.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 2.8, 0, Math.PI * 2); g.fill();
  if (rays) { g.save(); g.translate(x, y); g.fillStyle = 'rgba(255,250,200,0.28)'; for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(r * 1.15, -r * 0.12); g.lineTo(r * 1.75, 0); g.lineTo(r * 1.15, r * 0.12); g.closePath(); g.fill(); } g.restore(); }
  g.fillStyle = core; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2); g.fill();
}
function synthSun(g, x, y, r) {                     // striped neon sun behind the skyline
  g.save();
  const glow = g.createRadialGradient(x, y, r * 0.5, x, y, r * 2.2); glow.addColorStop(0, 'rgba(255,90,170,0.5)'); glow.addColorStop(1, 'rgba(255,90,170,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(x, y, r * 2.2, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
  const gr = g.createLinearGradient(0, y - r, 0, y + r); gr.addColorStop(0, '#ffe36b'); gr.addColorStop(0.5, '#ff7a59'); gr.addColorStop(1, '#ff3fa8');
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  g.fillStyle = '#24104d';
  for (let i = 0; i < 6; i++) { const yy = y + r * (0.05 + i * 0.17), hh = r * (0.03 + i * 0.022); g.fillRect(x - r, yy, r * 2, hh); }
  g.restore();
}
function cloudShape(g, x, y, r, col, under) {
  const puffs = [[0, 0, 1], [r * 0.95, r * 0.18, 0.72], [-r * 0.95, r * 0.22, 0.68], [r * 0.38, -r * 0.42, 0.72], [-r * 0.4, -r * 0.28, 0.6]];
  g.fillStyle = under; g.beginPath(); for (const [dx, dy, k] of puffs) { g.moveTo(x + dx + r * k, y + dy + r * 0.12); g.arc(x + dx, y + dy + r * 0.12, r * k, 0, Math.PI * 2); } g.fill();
  g.fillStyle = col; g.beginPath(); for (const [dx, dy, k] of puffs) { g.moveTo(x + dx + r * k * 0.95, y + dy - r * 0.04); g.arc(x + dx, y + dy - r * 0.04, r * k * 0.95, 0, Math.PI * 2); } g.fill();
}
function planet(g, x, y, r) {
  g.strokeStyle = 'rgba(255,230,190,0.55)'; g.lineWidth = Math.max(2, r * 0.14);
  g.beginPath(); g.ellipse(x, y, r * 1.85, r * 0.46, -0.35, Math.PI, Math.PI * 2); g.stroke();
  const gr = g.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
  gr.addColorStop(0, '#ffe0b8'); gr.addColorStop(0.6, '#e0874f'); gr.addColorStop(1, '#8c3f24');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(140,60,30,0.35)'; g.lineWidth = Math.max(1, r * 0.1);
  for (const k of [-0.35, 0.1, 0.45]) { g.beginPath(); g.ellipse(x, y + r * k, r * Math.sqrt(1 - k * k) * 0.98, r * 0.08, 0, 0, Math.PI); g.stroke(); }
  g.strokeStyle = 'rgba(255,236,200,0.9)'; g.lineWidth = Math.max(2, r * 0.14);
  g.beginPath(); g.ellipse(x, y, r * 1.85, r * 0.46, -0.35, 0, Math.PI); g.stroke();
}
function nebula(g, x, y, r, col) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}
function ridge(g, top, hgt, col, R, n, rough) {     // a soft rolling ridge line
  g.fillStyle = col; g.beginPath(); g.moveTo(0, top + 2);
  let px = 0, py = top - hgt * (0.5 + R() * 0.5);
  g.lineTo(0, py);
  for (let i = 1; i <= n; i++) {
    const x = i / n * W, y = top - hgt * (0.35 + R() * 0.65 * rough + (1 - rough) * 0.4);
    g.bezierCurveTo(px + W / n * 0.4, py - hgt * 0.25, x - W / n * 0.4, y - hgt * 0.25, x, y);
    px = x; py = y;
  }
  g.lineTo(W, top + 2); g.closePath(); g.fill();
}
function treeRow(g, top, band, w, R) {
  const nt = Math.max(4, Math.round(W / 85));
  for (let i = 0; i < nt; i++) {
    const x = (i + 0.2 + R() * 0.6) / nt * W; if (x > W * 0.62 && x < W * 0.86) continue;   // leave room for the barn/windmill
    const r = Math.max(6, band * (0.14 + R() * 0.1)), y = top - band * 0.22 - r * 0.2;
    g.fillStyle = '#6b4224'; g.fillRect(x - r * 0.1, y, r * 0.2, r * 0.9);
    g.fillStyle = w.tree[2]; g.beginPath(); g.arc(x + r * 0.12, y - r * 0.15, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = w.tree[0]; g.beginPath(); g.arc(x, y - r * 0.25, r * 0.92, 0, Math.PI * 2); g.fill();
    g.fillStyle = w.tree[1]; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.55, r * 0.45, 0, Math.PI * 2); g.fill();
  }
}
function barn(g, x, y, s) {
  g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(x - s * 0.8, y - 1, s * 1.9, 3);
  g.fillStyle = '#c9cfd6'; g.fillRect(x + s * 0.62, y - s * 1.25, s * 0.42, s * 1.25);     // silo
  g.beginPath(); g.arc(x + s * 0.83, y - s * 1.25, s * 0.21, Math.PI, 0); g.fillStyle = '#9aa3ad'; g.fill();
  g.fillStyle = '#c8372d'; g.beginPath(); g.moveTo(x - s * 0.7, y); g.lineTo(x - s * 0.7, y - s * 0.72); g.lineTo(x, y - s * 1.1); g.lineTo(x + s * 0.7, y - s * 0.72); g.lineTo(x + s * 0.7, y); g.closePath(); g.fill();
  g.fillStyle = '#7a2018'; g.beginPath(); g.moveTo(x - s * 0.8, y - s * 0.68); g.lineTo(x, y - s * 1.2); g.lineTo(x + s * 0.8, y - s * 0.68); g.lineTo(x + s * 0.72, y - s * 0.62); g.lineTo(x, y - s * 1.08); g.lineTo(x - s * 0.72, y - s * 0.62); g.closePath(); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(1, s * 0.06);
  g.strokeRect(x - s * 0.28, y - s * 0.55, s * 0.56, s * 0.55);
  g.beginPath(); g.moveTo(x - s * 0.28, y - s * 0.55); g.lineTo(x + s * 0.28, y); g.moveTo(x + s * 0.28, y - s * 0.55); g.lineTo(x - s * 0.28, y); g.stroke();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y - s * 0.78, s * 0.1, 0, Math.PI * 2); g.fill();
}
function windmill(g, x, y, s) {
  g.fillStyle = '#8a4a24'; g.beginPath(); g.moveTo(x - s * 0.22, y); g.lineTo(x - s * 0.12, y - s * 1.1); g.lineTo(x + s * 0.12, y - s * 1.1); g.lineTo(x + s * 0.22, y); g.closePath(); g.fill();
  g.fillStyle = '#5e2f14'; g.beginPath(); g.moveTo(x - s * 0.18, y - s * 1.05); g.lineTo(x, y - s * 1.3); g.lineTo(x + s * 0.18, y - s * 1.05); g.closePath(); g.fill();
  g.save(); g.translate(x, y - s * 1.08); g.rotate(0.35); g.fillStyle = '#f6e2c0'; g.strokeStyle = '#7a4a24'; g.lineWidth = 1;
  for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.fillRect(s * 0.06, -s * 0.07, s * 0.62, s * 0.14); g.strokeRect(s * 0.06, -s * 0.07, s * 0.62, s * 0.14); }
  g.fillStyle = '#5e2f14'; g.beginPath(); g.arc(0, 0, s * 0.07, 0, Math.PI * 2); g.fill(); g.restore();
}
function palms(g, top, band, R) {                    // neon palm silhouettes
  for (const x of [W * 0.08, W * 0.92, W * 0.3]) {
    const h = band * (0.7 + R() * 0.3), base = top;
    g.strokeStyle = '#150a33'; g.lineWidth = Math.max(3, band * 0.06); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + h * 0.15, base - h * 0.5, x + h * 0.08, base - h); g.stroke();
    g.save(); g.shadowColor = '#29e3ff'; g.shadowBlur = 6; g.strokeStyle = '#1d0f45'; g.lineWidth = Math.max(2, band * 0.045);
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.5; g.beginPath(); g.moveTo(x + h * 0.08, base - h); g.quadraticCurveTo(x + h * 0.08 + Math.cos(a) * h * 0.3, base - h + Math.sin(a) * h * 0.2 - h * 0.08, x + h * 0.08 + Math.cos(a) * h * 0.45, base - h + Math.sin(a) * h * 0.1 + h * 0.15); g.stroke(); }
    g.restore();
  }
}
function spires(g, top, band, R) {
  for (let i = 0; i < 6; i++) {
    const x = R() * W, h = band * (0.5 + R() * 0.6), w = band * (0.12 + R() * 0.1);
    g.fillStyle = '#251b5e'; g.beginPath(); g.moveTo(x - w, top); g.quadraticCurveTo(x - w * 0.3, top - h * 0.6, x, top - h); g.quadraticCurveTo(x + w * 0.3, top - h * 0.6, x + w, top); g.closePath(); g.fill();
    g.fillStyle = 'rgba(160,140,255,0.35)'; g.beginPath(); g.arc(x, top - h, Math.max(1.5, w * 0.25), 0, Math.PI * 2); g.fill();
  }
}
function skyline(g, top, band, R) {
  let x = 0;
  while (x < W) {
    const bw = 16 + R() * 32, bh = band * (0.4 + R() * 0.75);
    g.fillStyle = R() < 0.5 ? '#1b0f45' : '#160b3a'; g.fillRect(x, top - bh, bw - 3, bh + 2);
    g.fillStyle = 'rgba(255,79,216,0.5)'; g.fillRect(x, top - bh, bw - 3, 1.5);
    for (let wy = top - bh + 5; wy < top - 4; wy += 7) for (let wx = x + 4; wx < x + bw - 7; wx += 7) {
      if (R() < 0.33) { g.fillStyle = ['#ffe14f', '#29e3ff', '#ff4fd8'][(R() * 3) | 0]; g.globalAlpha = 0.8; g.fillRect(wx, wy, 3, 3); g.globalAlpha = 1; }
    }
    x += bw;
  }
}
function flower(g, x, y, r, col, w) {
  if (w.neon) {                                    // a glowing neon tulip (single, so no pairs of "eyes" in the dark)
    const gr = g.createRadialGradient(x, y - r, 0, x, y - r, r * 3.2); gr.addColorStop(0, rgba(col, 0.55)); gr.addColorStop(1, rgba(col, 0));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y - r, r * 3.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = rgba(col, 0.7); g.lineWidth = Math.max(1, r * 0.3); g.beginPath(); g.moveTo(x, y + r * 1.6); g.lineTo(x, y - r * 0.4); g.stroke();
    g.fillStyle = col; g.beginPath(); g.moveTo(x - r * 0.8, y - r * 1.6); g.lineTo(x - r * 0.3, y - r * 0.9); g.lineTo(x, y - r * 1.7); g.lineTo(x + r * 0.3, y - r * 0.9); g.lineTo(x + r * 0.8, y - r * 1.6);
    g.quadraticCurveTo(x + r * 0.8, y - r * 0.2, x, y - r * 0.2); g.quadraticCurveTo(x - r * 0.8, y - r * 0.2, x - r * 0.8, y - r * 1.6); g.fill();
    return;
  }
  g.strokeStyle = shade(w.blades[0], 0.9); g.lineWidth = Math.max(1, r * 0.35); g.beginPath(); g.moveTo(x, y + r * 0.5); g.lineTo(x, y + r * 2.4); g.stroke();
  g.fillStyle = 'rgba(0,0,0,0.12)'; g.beginPath(); g.ellipse(x, y + r * 2.4, r * 1.3, r * 0.4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = col;
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, r * 0.72, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = col === '#ffe066' || col === '#ffd23f' ? '#c0651c' : '#ffcf3a'; g.beginPath(); g.arc(x, y, r * 0.5, 0, Math.PI * 2); g.fill();
}
function rock(g, x, y, r, wi) {
  g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(x + r * 0.2, y + r * 0.2, r * 1.2, r * 0.4, 0, 0, Math.PI * 2); g.fill();
  const gr = g.createLinearGradient(0, y - r, 0, y + r * 0.3); gr.addColorStop(0, wi === 1 ? '#d9c39c' : '#c9cdd4'); gr.addColorStop(1, wi === 1 ? '#9c8460' : '#8c929c');
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - r, y + r * 0.2); g.quadraticCurveTo(x - r * 0.9, y - r * 0.7, x - r * 0.1, y - r * 0.8); g.quadraticCurveTo(x + r * 0.9, y - r * 0.8, x + r, y + r * 0.2); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.45, r * 0.3, r * 0.14, -0.3, 0, Math.PI * 2); g.fill();
}
function mushroom(g, x, y, r) {
  g.fillStyle = '#f4ead8'; g.fillRect(x - r * 0.3, y - r * 0.9, r * 0.6, r * 0.9);
  g.fillStyle = '#e8463d'; g.beginPath(); g.ellipse(x, y - r * 0.9, r, r * 0.65, 0, Math.PI, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff'; for (const [dx, dy] of [[-0.45, -1.15], [0.1, -1.38], [0.5, -1.05]]) { g.beginPath(); g.arc(x + dx * r, y + dy * r, r * 0.14, 0, Math.PI * 2); g.fill(); }
}
function wheat(g, x, y, s, R) {
  g.strokeStyle = '#a8842a'; g.lineWidth = Math.max(1, s * 0.06); g.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const dx = (i - 2) * s * 0.14, h = s * (0.8 + R() * 0.4), tip = x + dx + (R() - 0.5) * s * 0.2;
    g.beginPath(); g.moveTo(x + dx, y); g.quadraticCurveTo(x + dx, y - h * 0.6, tip, y - h); g.stroke();
    g.fillStyle = '#e8c45a'; g.beginPath(); g.ellipse(tip, y - h - s * 0.08, s * 0.06, s * 0.16, 0, 0, Math.PI * 2); g.fill();
  }
}
function hay(g, x, y, r) {
  g.fillStyle = 'rgba(0,0,0,0.15)'; g.beginPath(); g.ellipse(x, y, r * 1.4, r * 0.3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8c252'; g.strokeStyle = '#a07a1e'; g.lineWidth = 1.5;
  g.beginPath(); g.ellipse(x, y - r * 0.8, r * 1.2, r * 0.8, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.beginPath(); g.ellipse(x + r * 0.7, y - r * 0.8, r * 0.45, r * 0.75, 0, 0, Math.PI * 2); g.fillStyle = '#f2d36c'; g.fill(); g.stroke();
  g.beginPath(); g.arc(x + r * 0.7, y - r * 0.8, r * 0.25, 0, Math.PI * 1.6); g.stroke();
}
function crystal(g, x, y, s, col) {
  const gr = g.createRadialGradient(x, y - s, 0, x, y - s, s * 3); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = 0.35; g.fillStyle = gr; g.beginPath(); g.arc(x, y - s, s * 3, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  for (const [dx, h, wd] of [[-0.45, 1.4, 0.32], [0, 2.1, 0.4], [0.45, 1.2, 0.3]]) {
    g.fillStyle = col; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x + dx * s - wd * s, y); g.lineTo(x + dx * s - wd * s * 0.6, y - h * s * 0.8); g.lineTo(x + dx * s, y - h * s); g.lineTo(x + dx * s + wd * s * 0.6, y - h * s * 0.8); g.lineTo(x + dx * s + wd * s, y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(x + dx * s - wd * s * 0.3, y - 2); g.lineTo(x + dx * s - wd * s * 0.2, y - h * s * 0.8); g.lineTo(x + dx * s, y - h * s * 0.95); g.closePath(); g.fill();
  }
}
function glowPlant(g, x, y, s, col) {
  g.strokeStyle = '#1a0d3d'; g.lineWidth = Math.max(1.5, s * 0.25);
  for (const a of [-0.5, 0, 0.5]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + a * s * 2, y - s * 1.5, x + a * s * 2.4, y - s * 2.6); g.stroke();
    const gr = g.createRadialGradient(x + a * s * 2.4, y - s * 2.6, 0, x + a * s * 2.4, y - s * 2.6, s * 1.4); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x + a * s * 2.4, y - s * 2.6, s * 1.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = col; g.beginPath(); g.ellipse(x + a * s * 2.4, y - s * 2.6, s * 0.4, s * 0.6, a, 0, Math.PI * 2); g.fill(); }
}
function bush(g, x, y, r, w, wi) {
  const c = w.tree;
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(x, y + r * 0.15, r * 1.3, r * 0.35, 0, 0, Math.PI * 2); g.fill();
  const puffs = [[-0.6, -0.3, 0.62], [0, -0.55, 0.75], [0.6, -0.3, 0.62], [-0.25, -0.05, 0.6], [0.3, -0.05, 0.6]];
  g.fillStyle = wi >= 2 ? '#1a0d3d' : c[2]; g.beginPath(); for (const [dx, dy, k] of puffs) { g.moveTo(x + dx * r + k * r, y + dy * r); g.arc(x + dx * r, y + dy * r, k * r, 0, Math.PI * 2); } g.fill();
  g.fillStyle = wi >= 2 ? '#2a1660' : c[0]; g.beginPath(); for (const [dx, dy, k] of puffs) { g.moveTo(x + dx * r + k * r * 0.86, y + dy * r - r * 0.08); g.arc(x + dx * r, y + dy * r - r * 0.08, k * r * 0.86, 0, Math.PI * 2); } g.fill();
  g.fillStyle = wi >= 2 ? rgba(c[wi === 3 ? 0 : 1], 0.5) : c[1]; for (const [dx, dy, k] of puffs.slice(0, 3)) { g.beginPath(); g.arc(x + dx * r - r * 0.15, y + dy * r - r * 0.25, k * r * 0.38, 0, Math.PI * 2); g.fill(); }
  if (wi === 0) { g.fillStyle = '#ff5d6c'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x + (i - 1) * r * 0.5, y - r * (0.35 + (i % 2) * 0.3), Math.max(1.5, r * 0.09), 0, Math.PI * 2); g.fill(); } }
}
function fence(g, f, w) {
  const y = f.y, postH = Math.max(16, Math.min(W, H) * 0.04), gap = Math.max(36, postH * 2.4);
  if (w.neon) {
    g.save(); g.shadowColor = w.fence; g.shadowBlur = 12; g.strokeStyle = w.fence; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, y - postH * 0.68); g.lineTo(W, y - postH * 0.68); g.moveTo(0, y - postH * 0.28); g.lineTo(W, y - postH * 0.28); g.stroke();
    g.strokeStyle = w.fenceDark; g.shadowColor = w.fenceDark; g.lineWidth = 4;
    for (let x = gap / 2; x < W; x += gap) { g.beginPath(); g.moveTo(x, y + 2); g.lineTo(x, y - postH); g.stroke(); }
    g.restore();
    return;
  }
  const rail = Math.max(4, postH * 0.24);
  g.fillStyle = 'rgba(0,0,0,0.2)';
  for (const k of [0.7, 0.3]) g.fillRect(0, y - postH * k - rail / 2 + rail * 0.9, W, rail * 0.5);
  for (const k of [0.7, 0.3]) {
    const ry = y - postH * k - rail / 2;
    g.fillStyle = w.fenceDark; g.fillRect(0, ry + rail * 0.55, W, rail * 0.45);
    g.fillStyle = w.fence; g.fillRect(0, ry, W, rail * 0.62);
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(0, ry, W, rail * 0.18);
  }
  for (let x = gap / 2; x < W; x += gap) {
    const pw = Math.max(7, postH * 0.4);
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(x + pw * 0.4, y + 2, pw * 0.9, pw * 0.25, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = w.fenceDark; rrPath(g, x - pw / 2 - 1, y - postH - 1, pw + 2, postH + 4, pw * 0.25); g.fill();
    const pg = g.createLinearGradient(x - pw / 2, 0, x + pw / 2, 0); pg.addColorStop(0, shade(w.fence, 1.18)); pg.addColorStop(0.6, w.fence); pg.addColorStop(1, shade(w.fence, 0.78));
    g.fillStyle = pg; rrPath(g, x - pw / 2, y - postH, pw, postH + 2, pw * 0.22); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - pw * 0.1, y - postH * 0.8, 1, postH * 0.6);
    g.fillStyle = shade(w.fence, 1.3); g.fillRect(x - pw / 2 + 1, y - postH, pw - 2, Math.max(2, pw * 0.22));
  }
}
function doghouse(g, x, y, s, w) {
  const neon = w.neon, body = neon ? '#2c1a66' : w === WORLDS[1] ? '#c4513a' : '#e0503f', roof = neon ? '#ff4fd8' : '#6d3b1f';
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x + s * 0.05, y, s * 0.7, s * 0.13, 0, 0, Math.PI * 2); g.fill();
  // walls with planks
  const wg = g.createLinearGradient(x - s * 0.45, 0, x + s * 0.45, 0); wg.addColorStop(0, shade(body, 1.15)); wg.addColorStop(1, shade(body, 0.82));
  g.fillStyle = shade(body, 0.5); g.fillRect(x - s * 0.47, y - s * 0.64, s * 0.94, s * 0.66);
  g.fillStyle = wg; g.fillRect(x - s * 0.45, y - s * 0.62, s * 0.9, s * 0.62);
  g.strokeStyle = 'rgba(0,0,0,0.15)'; g.lineWidth = 1;
  for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x - s * 0.45, y - s * 0.62 + k * s * 0.155); g.lineTo(x + s * 0.45, y - s * 0.62 + k * s * 0.155); g.stroke(); }
  // door
  g.fillStyle = neon ? '#0b0622' : '#2a1510'; g.beginPath(); g.moveTo(x - s * 0.2, y); g.lineTo(x - s * 0.2, y - s * 0.3); g.arc(x, y - s * 0.3, s * 0.2, Math.PI, 0); g.lineTo(x + s * 0.2, y); g.closePath(); g.fill();
  g.strokeStyle = neon ? '#29e3ff' : '#fff1d6'; g.lineWidth = Math.max(1.5, s * 0.04); g.beginPath(); g.moveTo(x - s * 0.2, y); g.lineTo(x - s * 0.2, y - s * 0.3); g.arc(x, y - s * 0.3, s * 0.2, Math.PI, 0); g.lineTo(x + s * 0.2, y); g.stroke();
  // roof with an overhang
  if (neon) { g.save(); g.shadowColor = roof; g.shadowBlur = 10; }
  g.fillStyle = shade(roof, 0.6); g.beginPath(); g.moveTo(x - s * 0.62, y - s * 0.54); g.lineTo(x, y - s * 1.08); g.lineTo(x + s * 0.62, y - s * 0.54); g.lineTo(x + s * 0.62, y - s * 0.48); g.lineTo(x, y - s * 1.0); g.lineTo(x - s * 0.62, y - s * 0.48); g.closePath(); g.fill();
  g.fillStyle = roof; g.beginPath(); g.moveTo(x - s * 0.62, y - s * 0.56); g.lineTo(x, y - s * 1.1); g.lineTo(x + s * 0.62, y - s * 0.56); g.lineTo(x + s * 0.5, y - s * 0.56); g.lineTo(x, y - s * 0.98); g.lineTo(x - s * 0.5, y - s * 0.56); g.closePath(); g.fill();
  if (neon) g.restore();
  // bone sign
  const bx = x, by = y - s * 0.72, bl = s * 0.17;
  g.fillStyle = neon ? '#29e3ff' : '#fff4dc'; g.strokeStyle = neon ? 'rgba(0,0,0,0)' : '#8a5a2b'; g.lineWidth = 1;
  if (neon) { g.save(); g.shadowColor = '#29e3ff'; g.shadowBlur = 8; }
  g.beginPath(); g.rect(bx - bl, by - s * 0.035, bl * 2, s * 0.07);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { g.moveTo(bx + sx * bl + s * 0.05, by + sy * s * 0.04); g.arc(bx + sx * bl, by + sy * s * 0.04, s * 0.05, 0, Math.PI * 2); }
  g.fill();
  if (neon) g.restore();
  // food bowl
  const fx = x + s * 0.62, fy = y + s * 0.02;
  g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(fx, fy + 1, s * 0.2, s * 0.05, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = neon ? '#ff4fd8' : '#2f78e8'; g.beginPath(); g.moveTo(fx - s * 0.18, fy - s * 0.1); g.lineTo(fx + s * 0.18, fy - s * 0.1); g.lineTo(fx + s * 0.13, fy); g.lineTo(fx - s * 0.13, fy); g.closePath(); g.fill();
  g.fillStyle = '#c98a3e'; g.beginPath(); g.ellipse(fx, fy - s * 0.1, s * 0.17, s * 0.045, 0, 0, Math.PI * 2); g.fill();
}
function panelBox(g, L, w) {
  const p = L.panel;
  g.fillStyle = 'rgba(0,0,0,0.3)'; if (L.portrait) g.fillRect(p.x, p.y - 5, p.w, 5); else g.fillRect(p.x - 5, p.y, 5, p.h);
  const pg = L.portrait ? g.createLinearGradient(0, p.y, 0, p.y + p.h) : g.createLinearGradient(p.x, 0, p.x + p.w, 0);
  pg.addColorStop(0, w.panel[0]); pg.addColorStop(1, w.panel[1]);
  g.fillStyle = pg; g.fillRect(p.x, p.y, p.w, p.h);
  const R = rng(99);
  if (!w.neon) {                                   // wood planks with grain and nails
    const ph = Math.max(20, (L.portrait ? p.h : p.w) / 5);
    g.lineWidth = 1;
    if (L.portrait) {
      for (let y = p.y; y < p.y + p.h; y += ph) {
        g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(p.x, y, p.w, 2); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(p.x, y + 2, p.w, 1.5);
        g.strokeStyle = 'rgba(0,0,0,0.08)';
        for (let i = 0; i < 4; i++) { const yy = y + 5 + R() * (ph - 10); g.beginPath(); g.moveTo(p.x, yy); g.bezierCurveTo(p.x + p.w * 0.3, yy + 3, p.x + p.w * 0.6, yy - 3, p.x + p.w, yy + 1); g.stroke(); }
        g.fillStyle = w.panel[2]; for (const nx of [p.x + 12, p.x + p.w - 12]) { g.beginPath(); g.arc(nx, y + ph / 2, 2.2, 0, Math.PI * 2); g.fill(); }
      }
    } else {
      for (let x = p.x; x < p.x + p.w; x += ph) {
        g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x, p.y, 2, p.h); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 2, p.y, 1.5, p.h);
        g.strokeStyle = 'rgba(0,0,0,0.08)';
        for (let i = 0; i < 3; i++) { const xx = x + 5 + R() * (ph - 10); g.beginPath(); g.moveTo(xx, p.y); g.bezierCurveTo(xx + 3, p.y + p.h * 0.3, xx - 3, p.y + p.h * 0.6, xx + 1, p.y + p.h); g.stroke(); }
      }
    }
    g.fillStyle = shade(w.panel[0], 1.25);
    if (L.portrait) g.fillRect(p.x, p.y, p.w, 3); else g.fillRect(p.x, p.y, 3, p.h);
  } else {                                         // dark glass with a neon edge
    g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 1;
    for (let x = p.x; x < p.x + p.w; x += 22) { g.beginPath(); g.moveTo(x, p.y); g.lineTo(x, p.y + p.h); g.stroke(); }
    for (let y = p.y; y < p.y + p.h; y += 22) { g.beginPath(); g.moveTo(p.x, y); g.lineTo(p.x + p.w, y); g.stroke(); }
    g.save(); g.shadowColor = w.fence; g.shadowBlur = 10; g.strokeStyle = w.fence; g.lineWidth = 2.5;
    g.beginPath(); if (L.portrait) { g.moveTo(p.x, p.y + 1); g.lineTo(p.x + p.w, p.y + 1); } else { g.moveTo(p.x + 1, p.y); g.lineTo(p.x + 1, p.y + p.h); } g.stroke(); g.restore();
  }
}

// ---------- ambient life (butterflies, petals, fireflies, twinkles), drawn above the pups ----------
const AMB = [];
function updateAmbient(dt, wi) {
  const f = LAYOUT.field, kind = WORLDS[wi].ambient;
  const want = kind === 'butterfly' ? 5 : kind === 'petal' ? 8 : kind === 'firefly' ? 10 : 7;
  for (let i = AMB.length - 1; i >= 0; i--) { const a = AMB[i]; a.age += dt; if (a.kind !== kind || a.age > a.life) AMB.splice(i, 1); }
  while (AMB.length < want) {
    AMB.push({ kind, age: 0, life: 6 + Math.random() * 8, x: f.x + Math.random() * f.w, y: f.y + Math.random() * f.h,
      vx: (Math.random() - 0.5) * 30, vy: kind === 'petal' ? 12 + Math.random() * 14 : (Math.random() - 0.5) * 16, seed: Math.random() * 10,
      col: WORLDS[wi].flowers[(Math.random() * 3) | 0] });
  }
  for (const a of AMB) {
    a.x += (a.vx + Math.sin(a.age * 1.7 + a.seed) * 18) * dt; a.y += (a.vy + Math.cos(a.age * 1.3 + a.seed) * 10) * dt;
    if (a.x < f.x - 20) a.x = f.x + f.w + 10; if (a.x > f.x + f.w + 20) a.x = f.x - 10;
    if (a.y > f.y + f.h + 10) a.y = f.y - 10; if (a.y < f.y - 30) a.y = f.y + f.h;
  }
}
function drawAmbient(g, t, front) {
  if (!front) return;
  const u = Math.max(4, Math.min(W, H) * 0.012);
  for (const a of AMB) {
    const fade = Math.min(1, a.age / 0.8, (a.life - a.age) / 0.8);
    g.globalAlpha = Math.max(0, fade);
    if (a.kind === 'butterfly') {
      const flap = Math.abs(Math.sin(t * 14 + a.seed)) * 0.8 + 0.2, col = a.col === '#ffffff' ? '#ffd9f0' : a.col;
      g.fillStyle = col;
      g.beginPath(); g.ellipse(a.x - u * 0.55 * flap, a.y, u * 0.6 * flap, u * 0.75, -0.3, 0, Math.PI * 2); g.ellipse(a.x + u * 0.55 * flap, a.y, u * 0.6 * flap, u * 0.75, 0.3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(a.x - u * 0.5 * flap, a.y - u * 0.2, u * 0.22 * flap, u * 0.25, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3a2a2a'; g.fillRect(a.x - 0.8, a.y - u * 0.5, 1.6, u);
    } else if (a.kind === 'petal') {
      g.fillStyle = a.col; g.save(); g.translate(a.x, a.y); g.rotate(t * 2 + a.seed); g.beginPath(); g.ellipse(0, 0, u * 0.55, u * 0.28, 0, 0, Math.PI * 2); g.fill(); g.restore();
    } else if (a.kind === 'firefly') {
      const tw = 0.5 + 0.5 * Math.sin(t * 5 + a.seed * 3);
      g.globalAlpha *= tw; g.fillStyle = a.col; g.beginPath(); g.arc(a.x, a.y, u * 0.35, 0, Math.PI * 2); g.fill();
      g.globalAlpha *= 0.35; g.beginPath(); g.arc(a.x, a.y, u * 1.1, 0, Math.PI * 2); g.fill();
    } else {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + a.seed * 2));
      sparkle(g, a.x, a.y, u * 0.7 * tw, '#ffffff', fade * tw);
    }
  }
  g.globalAlpha = 1;
}

// ---------- icons (drawn in code so they match on every device) ----------
function icon(g, name, x, y, s, col) {
  g.save(); g.translate(x, y); g.lineJoin = 'round'; g.lineCap = 'round';
  const k = s / 2;
  if (name === 'coin') {
    const gr = g.createLinearGradient(0, -k, 0, k); gr.addColorStop(0, '#fff3a0'); gr.addColorStop(0.5, '#ffcf2e'); gr.addColorStop(1, '#e89600');
    g.fillStyle = '#a66400'; g.beginPath(); g.arc(0, k * 0.1, k, 0, Math.PI * 2); g.fill();
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, k * 0.92, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d98a00'; paw(g, 0, k * 0.06, k * 0.5);
    g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(-k * 0.35, -k * 0.45, k * 0.25, k * 0.12, -0.6, 0, Math.PI * 2); g.fill();
  } else if (name === 'paw') { g.fillStyle = col || '#ffffff'; paw(g, 0, 0, k); }
  else if (name === 'book') {
    g.fillStyle = col || '#ffffff'; g.beginPath(); g.moveTo(0, -k * 0.6); g.quadraticCurveTo(-k * 0.5, -k * 0.85, -k, -k * 0.65); g.lineTo(-k, k * 0.7); g.quadraticCurveTo(-k * 0.5, k * 0.5, 0, k * 0.8);
    g.quadraticCurveTo(k * 0.5, k * 0.5, k, k * 0.7); g.lineTo(k, -k * 0.65); g.quadraticCurveTo(k * 0.5, -k * 0.85, 0, -k * 0.6); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = Math.max(1, k * 0.12); g.beginPath(); g.moveTo(0, -k * 0.55); g.lineTo(0, k * 0.72); g.stroke();
    g.fillStyle = '#ff5d8f'; paw(g, -k * 0.5, k * 0.02, k * 0.22); paw(g, k * 0.5, k * 0.02, k * 0.22);
  } else if (name === 'shop') {
    g.fillStyle = col || '#ffffff';
    g.fillRect(-k * 0.75, -k * 0.1, k * 1.5, k * 0.95);
    const cols = ['#ff5d6c', '#ffffff'];
    for (let i = 0; i < 4; i++) { g.fillStyle = cols[i % 2]; g.beginPath(); g.moveTo(-k * 0.9 + i * k * 0.45, -k * 0.2); g.lineTo(-k * 0.7 + i * k * 0.35, -k * 0.85); g.lineTo(-k * 0.7 + (i + 1) * k * 0.35, -k * 0.85); g.lineTo(-k * 0.9 + (i + 1) * k * 0.45, -k * 0.2); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-k * 0.2, k * 0.25, k * 0.4, k * 0.6);
  } else if (name === 'play') {
    g.fillStyle = col || '#ffffff'; g.beginPath(); g.moveTo(-k * 0.45, -k * 0.65); g.lineTo(k * 0.7, 0); g.lineTo(-k * 0.45, k * 0.65); g.closePath(); g.fill();
  } else if (name === 'music' || name === 'musicOff') {
    g.fillStyle = col || '#ffffff'; g.strokeStyle = col || '#ffffff'; g.lineWidth = Math.max(1.5, k * 0.2);
    g.beginPath(); g.ellipse(-k * 0.45, k * 0.5, k * 0.32, k * 0.24, -0.4, 0, Math.PI * 2); g.ellipse(k * 0.45, k * 0.3, k * 0.32, k * 0.24, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(-k * 0.17, k * 0.45); g.lineTo(-k * 0.17, -k * 0.7); g.lineTo(k * 0.73, -k * 0.9); g.lineTo(k * 0.73, k * 0.25); g.stroke();
    if (name === 'musicOff') { g.strokeStyle = '#ff5d6c'; g.lineWidth = Math.max(2, k * 0.25); g.beginPath(); g.moveTo(-k, -k); g.lineTo(k, k); g.stroke(); }
  } else if (name === 'bolt') {
    g.fillStyle = '#8a4b00'; g.beginPath(); g.moveTo(k * 0.25, -k * 1.08); g.lineTo(-k * 0.7, k * 0.2); g.lineTo(-k * 0.08, k * 0.2); g.lineTo(-k * 0.36, k * 1.08); g.lineTo(k * 0.74, -k * 0.24); g.lineTo(k * 0.12, -k * 0.24); g.closePath(); g.fill();
    g.fillStyle = col || '#ffe14f'; g.beginPath(); g.moveTo(k * 0.2, -k * 0.95); g.lineTo(-k * 0.56, k * 0.12); g.lineTo(-k * 0.02, k * 0.12); g.lineTo(-k * 0.26, k * 0.92); g.lineTo(k * 0.6, -k * 0.18); g.lineTo(k * 0.06, -k * 0.18); g.closePath(); g.fill();
  } else if (name === 'heart') {
    g.fillStyle = col || '#ff5d8f'; g.beginPath(); g.moveTo(0, k * 0.8); g.bezierCurveTo(-k * 1.2, -k * 0.1, -k * 0.6, -k * 1.0, 0, -k * 0.4); g.bezierCurveTo(k * 0.6, -k * 1.0, k * 1.2, -k * 0.1, 0, k * 0.8); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(-k * 0.42, -k * 0.35, k * 0.18, k * 0.1, -0.7, 0, Math.PI * 2); g.fill();
  } else if (name === 'crate') {
    g.fillStyle = '#5a3410'; g.fillRect(-k * 0.88, -k * 0.78, k * 1.76, k * 1.56);
    g.fillStyle = '#d8984a'; g.fillRect(-k * 0.8, -k * 0.7, k * 1.6, k * 1.4);
    g.strokeStyle = '#8c5a22'; g.lineWidth = Math.max(1, k * 0.16); g.beginPath(); g.moveTo(-k * 0.7, 0); g.lineTo(k * 0.7, 0); g.stroke();
    g.fillStyle = '#fff1c2'; paw(g, 0, 0, k * 0.36);
  } else if (name === 'up') {
    g.fillStyle = col || '#ffffff'; g.beginPath(); g.moveTo(0, -k); g.lineTo(k * 0.85, 0); g.lineTo(k * 0.35, 0); g.lineTo(k * 0.35, k); g.lineTo(-k * 0.35, k); g.lineTo(-k * 0.35, 0); g.lineTo(-k * 0.85, 0); g.closePath(); g.fill();
  } else if (name === 'reset') {                     // a circular "start over" arrow
    const rr = k * 0.62, a0 = Math.PI * 0.15, a1 = Math.PI * 1.62;   // open on the upper right, head at the end
    g.strokeStyle = col || '#ffffff'; g.lineWidth = Math.max(2, k * 0.24);
    g.beginPath(); g.arc(0, 0, rr, a0, a1); g.stroke();
    const ex = Math.cos(a1) * rr, ey = Math.sin(a1) * rr, tx = -Math.sin(a1), ty = Math.cos(a1), nx = Math.cos(a1), ny = Math.sin(a1);
    g.fillStyle = col || '#ffffff'; g.beginPath();
    g.moveTo(ex + tx * k * 0.5, ey + ty * k * 0.5); g.lineTo(ex + nx * k * 0.34, ey + ny * k * 0.34); g.lineTo(ex - nx * k * 0.34, ey - ny * k * 0.34); g.closePath(); g.fill();
  } else if (name === 'magnet') {
    g.lineCap = 'butt'; g.strokeStyle = '#7a1018'; g.lineWidth = k * 0.62; g.beginPath(); g.arc(0, -k * 0.05, k * 0.55, Math.PI, 0); g.lineTo(k * 0.55, k * 0.5); g.moveTo(-k * 0.55, -k * 0.05); g.lineTo(-k * 0.55, k * 0.5); g.stroke();
    g.strokeStyle = '#ff4d5e'; g.lineWidth = k * 0.46; g.beginPath(); g.arc(0, -k * 0.05, k * 0.55, Math.PI, 0); g.lineTo(k * 0.55, k * 0.45); g.moveTo(-k * 0.55, -k * 0.05); g.lineTo(-k * 0.55, k * 0.45); g.stroke();
    g.fillStyle = '#e8eef6'; g.fillRect(-k * 0.78, k * 0.45, k * 0.46, k * 0.4); g.fillRect(k * 0.32, k * 0.45, k * 0.46, k * 0.4);
    g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = k * 0.1; g.beginPath(); g.arc(0, -k * 0.05, k * 0.55, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  } else if (name === 'clover') {
    g.fillStyle = '#1f7a23';
    for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2 + Math.PI / 4); g.beginPath(); g.arc(-k * 0.2, -k * 0.45, k * 0.3, 0, Math.PI * 2); g.arc(k * 0.2, -k * 0.45, k * 0.3, 0, Math.PI * 2); g.fill(); g.restore(); }
    g.fillStyle = '#53d44f';
    for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2 + Math.PI / 4); g.beginPath(); g.arc(-k * 0.18, -k * 0.43, k * 0.23, 0, Math.PI * 2); g.arc(k * 0.18, -k * 0.43, k * 0.23, 0, Math.PI * 2); g.fill(); g.restore(); }
    g.strokeStyle = '#1f7a23'; g.lineWidth = k * 0.14; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(k * 0.2, k * 0.5, k * 0.5, k * 0.9); g.stroke();
  } else if (name === 'bowl') {                      // Treat Bowl: a red bowl heaped with kibble
    g.fillStyle = '#7a3a10'; for (const [dx, dy, r] of [[-0.42, -0.12, 0.24], [0, -0.3, 0.26], [0.42, -0.12, 0.24], [-0.18, 0.02, 0.22], [0.2, 0.0, 0.22]]) { g.beginPath(); g.arc(dx * k, dy * k, r * k, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#c9772e'; for (const [dx, dy, r] of [[-0.4, -0.16, 0.16], [0.02, -0.34, 0.18], [0.4, -0.16, 0.16]]) { g.beginPath(); g.arc(dx * k, dy * k, r * k, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#8f1622'; g.beginPath(); g.moveTo(-k * 1.0, 0); g.lineTo(k * 1.0, 0); g.lineTo(k * 0.72, k * 0.78); g.lineTo(-k * 0.72, k * 0.78); g.closePath(); g.fill();
    g.fillStyle = '#e8384a'; g.beginPath(); g.moveTo(-k * 0.92, k * 0.04); g.lineTo(k * 0.92, k * 0.04); g.lineTo(k * 0.68, k * 0.7); g.lineTo(-k * 0.68, k * 0.7); g.closePath(); g.fill();
    g.fillStyle = '#fff1c2'; paw(g, 0, k * 0.38, k * 0.22);
  } else if (name === 'clock') {                     // Longer Zoomies: a stopwatch
    g.fillStyle = '#4a4f63'; g.fillRect(-k * 0.16, -k * 1.0, k * 0.32, k * 0.26);
    g.fillStyle = '#4a4f63'; g.beginPath(); g.arc(0, k * 0.1, k * 0.86, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, k * 0.1, k * 0.7, 0, Math.PI * 2); g.fill();
    g.fillStyle = col || '#ffd23f'; g.beginPath(); g.moveTo(0, k * 0.1); g.arc(0, k * 0.1, k * 0.7, -Math.PI / 2, Math.PI * 0.35); g.closePath(); g.fill();
    g.strokeStyle = '#4a4f63'; g.lineWidth = Math.max(1.5, k * 0.12); g.beginPath(); g.moveTo(0, k * 0.1); g.lineTo(0, -k * 0.42); g.stroke();
  } else if (name === 'bone') {                      // Golden Bones: a shiny bone
    g.save(); g.rotate(-0.5);
    g.fillStyle = '#9a5a00'; g.fillRect(-k * 0.62, -k * 0.24, k * 1.24, k * 0.48);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) { g.beginPath(); g.arc(sx * k * 0.7, sy * k * 0.24, k * 0.3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = col || '#ffd23f'; g.fillRect(-k * 0.6, -k * 0.17, k * 1.2, k * 0.34);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) { g.beginPath(); g.arc(sx * k * 0.7, sy * k * 0.24, k * 0.22, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(-k * 0.5, -k * 0.12, k * 0.8, k * 0.08);
    g.restore();
  } else if (name === 'star') {
    g.fillStyle = '#9a5a00'; g.beginPath(); starPath(g, 0, k * 0.06, k * 1.02, 0.5, 5); g.fill();
    const gr = g.createLinearGradient(0, -k, 0, k); gr.addColorStop(0, '#fff3a0'); gr.addColorStop(1, '#ffb020');
    g.fillStyle = gr; g.beginPath(); starPath(g, 0, 0, k * 0.88, 0.5, 5); g.fill();
  }
  g.restore();
}
function paw(g, x, y, k) {
  g.beginPath(); g.ellipse(x, y + k * 0.3, k * 0.5, k * 0.42, 0, 0, Math.PI * 2); g.fill();
  for (const [dx, dy, r] of [[-0.55, -0.2, 0.2], [-0.2, -0.55, 0.22], [0.2, -0.55, 0.22], [0.55, -0.2, 0.2]]) { g.beginPath(); g.arc(x + dx * k, y + dy * k, r * k, 0, Math.PI * 2); g.fill(); }
}
