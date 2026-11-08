'use strict';
// Pup Evolution pups: data plus art drawn in code (no image files). Chibi style: big heads, 3/4 faces with two shiny
// eyes, chunky bodies, round paws. Each pup is cut into parts (legs, tail, body, cape, scarf, head, wings) that are
// drawn once per size and cached, then posed every frame: walk, wag, blink, nap, fly.
// Art box: 120 x 100 units. The pup faces right, feet on y = 92, feet centre near x = 60.

const TIERS = [
  { name: 'COMMON', col: '#7ed957', dark: '#2f7a1f' },
  { name: 'RARE', col: '#4db8ff', dark: '#1765a8' },
  { name: 'EPIC', col: '#c77dff', dark: '#6f2db8' },
  { name: 'LEGENDARY', col: '#ffc531', dark: '#a86a00' },
];
// Descriptions: written with ChatGPT (2026-11-05), checked for a 13+ general audience.
const PUPS = [null,
  { name: 'Pebble', tier: 0, size: 0.84, fur: '#b9bfcc', belly: '#f3f5f9', ear: '#8a90a2', ears: 'floppy', len: 0.92, ht: 0.98, leg: 0.9, head: 1.12, tail: 'wag', acc: ['tuft'],
    desc: 'Small enough to trip over, mighty enough to steal your heart.' },
  { name: 'Biscuit', tier: 0, size: 0.9, fur: '#eab46c', belly: '#fdedd3', ear: '#c98a40', ears: 'floppy', len: 1, ht: 1, leg: 1, head: 1.06, tail: 'wag', acc: ['collar:#e8505b', 'tongue'],
    desc: 'Powered by sunshine, belly rubs, and an unreasonable amount of snacks.' },
  { name: 'Noodle', tier: 0, size: 0.95, fur: '#bd6c3a', belly: '#efbf96', ear: '#874422', ears: 'long', len: 1.55, ht: 0.84, leg: 0.55, head: 0.98, tail: 'wag', acc: ['collar:#2f6fed'],
    desc: 'Four legs, one sausage body, absolutely zero turning radius.' },
  { name: 'Waffles', tier: 0, size: 0.95, fur: '#f19a44', belly: '#fff6ea', ear: '#d67a28', ears: 'bigpointy', len: 1.18, ht: 1.0, leg: 0.55, head: 1.04, tail: 'stub', acc: ['corgi', 'collar:#3fa9f5', 'tongue'],
    desc: 'Short legs, big dreams, and a permanent appointment with breakfast.' },
  { name: 'Tater', tier: 0, size: 0.98, fur: '#b07a43', belly: '#f0d2a6', ear: '#77491f', ears: 'floppy', len: 1.05, ht: 1.3, leg: 0.6, head: 0.98, tail: 'wag', acc: ['spots', 'bandana:#e8505b'],
    desc: 'A walking potato with the confidence of a championship athlete.' },
  { name: 'Pickles', tier: 1, size: 1.0, fur: '#4b5468', belly: '#f4f6fa', ear: '#373e50', ears: 'pointy', len: 1.1, ht: 1, leg: 1.0, head: 1.02, tail: 'curl', acc: ['husky', 'blueeyes', 'bandana:#3cc46a'],
    desc: 'Howls at the moon, sneezes at snow, fears absolutely nothing.' },
  { name: 'Captain Fluff', tier: 1, size: 1.0, fur: '#f6f6fb', belly: '#ffffff', ear: '#e4e4ef', ears: 'fluffy', len: 1, ht: 1, leg: 1.05, head: 1.02, tail: 'pom', acc: ['poodle', 'bowtie:#2f6fed', 'captain'],
    desc: 'Seven seas conquered, three ships chased, one very fancy haircut.' },
  { name: 'Sir Woofington', tier: 1, size: 1.03, fur: '#7c4a2a', belly: '#d4a47a', ear: '#5a311a', ears: 'long', len: 1.05, ht: 1, leg: 1, head: 1.03, tail: 'wag', acc: ['mustache', 'monocle', 'tophat'],
    desc: 'Distinguished gentleman, professional treat critic, amateur squirrel investigator.' },
  { name: 'Disco', tier: 2, size: 1.05, fur: '#b99be2', belly: '#f3ebfd', ear: '#9775cf', ears: 'fluffy', len: 1, ht: 1, leg: 1.05, head: 1.02, tail: 'pom', acc: ['poodle', 'afro', 'starshades', 'chain'], fx: 'disco',
    desc: 'Born to boogie, trained to bark, allergic to boring parties.' },
  { name: 'Turbo', tier: 2, size: 1.06, fur: '#f0433a', belly: '#ffe4da', ear: '#b52a22', ears: 'swept', len: 1.12, ht: 0.92, leg: 1.0, head: 1.0, tail: 'wag', acc: ['racer', 'scarf:#ffd23f', 'goggles', 'sneakers:#2f6fed'], fx: 'speed',
    desc: 'Faster than lightning, less accurate than a shopping cart.' },
  { name: 'Professor Paws', tier: 2, size: 1.07, fur: '#8190b1', belly: '#eef1f8', ear: '#64729a', ears: 'folded', len: 1.05, ht: 1.02, leg: 0.95, head: 1.06, tail: 'wag', acc: ['beard', 'glasses', 'bowtie:#e8505b', 'gradcap'], fx: 'smart',
    desc: 'Has a PhD in biscuits and absolutely no student loans.' },
  { name: 'Rocket', tier: 3, size: 1.09, fur: '#36bfae', belly: '#dbfaf4', ear: '#23907e', ears: 'pointy', len: 1.05, ht: 1, leg: 1, head: 1.03, tail: 'wag', acc: ['jetpack', 'phones'], fx: 'jet',
    desc: 'One small bark for dogs, one giant leap for snackkind.' },
  { name: 'Majesty', tier: 3, size: 1.12, fur: '#f2d48c', belly: '#fff8e2', ear: '#d9ad55', ears: 'silky', len: 1.1, ht: 1, leg: 1.05, head: 1.02, tail: 'plume', acc: ['fringe', 'cape:#7b2fd1', 'chain', 'tiara'], fx: 'royal',
    desc: 'Royal by birth, dramatic by choice, demanding by breakfast.' },
  { name: 'Cosmo', tier: 3, size: 1.14, fur: '#3d5ce0', belly: '#e2e8ff', ear: '#2940ad', ears: 'pointy', len: 1.05, ht: 1, leg: 1, head: 1.03, tail: 'wag', acc: ['stars', 'pack', 'helmet'], fx: 'orbit',
    desc: "Exploring the galaxy, searching for the universe's biggest tennis ball." },
  { name: 'The Legend', tier: 3, size: 1.22, fur: '#ffc43a', belly: '#fff4cc', ear: '#e5951a', ears: 'floppy', len: 1.1, ht: 1.05, leg: 1.05, head: 1.06, tail: 'flame', acc: ['glow', 'wings', 'cape:#d6283f', 'shades', 'crown'], fx: 'legend',
    desc: 'Part angel, part royalty, entirely convinced the ranch belongs to them.' },
];
const MAX_LEVEL = PUPS.length - 1;
for (const p of PUPS) if (p) { p.has = {}; p.col = {}; for (const a of p.acc) { const [n, c] = a.split(':'); p.has[n] = true; if (c) p.col[n] = c; } }

// ---------- colour and path helpers ----------
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
  if (f >= 1) { const k = Math.min(f - 1, 1); r += (255 - r) * k; gg += (255 - gg) * k; b += (255 - b) * k; }
  else { r *= f; gg *= f; b *= f; }
  return `rgb(${r | 0},${gg | 0},${b | 0})`;
}
function ell(g, x, y, rx, ry, rot) {            // adds a closed ellipse sub-path (no line to the previous point)
  rot = rot || 0;
  g.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot));
  g.ellipse(x, y, Math.max(rx, 0.01), Math.max(ry, 0.01), rot, 0, Math.PI * 2);
}
function rrp(g, x, y, w, h, r) {                // adds a rounded-rect sub-path
  r = Math.min(r, w / 2, h / 2);
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
// Union shape with one outline: stroke every sub-path wide, then fill on top (hides the inner outlines).
function blob(g, path, fill, ol, w) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); path();
  g.strokeStyle = ol; g.lineWidth = w * 2; g.stroke();
  g.fillStyle = fill; g.fill();
}
function tube(g, path, width, fill, ol, w) {    // a stroked tail/strap with an outline
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); path(); g.strokeStyle = ol; g.lineWidth = width + w * 2; g.stroke();
  g.beginPath(); path(); g.strokeStyle = fill; g.lineWidth = width; g.stroke();
}
function starPath(g, x, y, r, inner, n, rot) {
  n = n || 5; inner = inner || 0.45; rot = rot === undefined ? -Math.PI / 2 : rot;
  g.moveTo(x + Math.cos(rot) * r, y + Math.sin(rot) * r);
  for (let i = 1; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * inner : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath();
}
function cloud(g, cx, cy, rx, ry, n, pr) {      // puffs around an ellipse (poodle fur, afros)
  ell(g, cx, cy, rx, ry);
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ell(g, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, pr, pr); }
}
function tri(g, a, b, c) {                      // a soft triangle (b = tip); round joins round the corners
  g.moveTo(a[0], a[1]);
  g.quadraticCurveTo((a[0] + b[0]) / 2 + (a[1] - b[1]) * -0.08, (a[1] + b[1]) / 2 + (b[0] - a[0]) * -0.08, b[0], b[1]);
  g.quadraticCurveTo((b[0] + c[0]) / 2 + (b[1] - c[1]) * -0.08, (b[1] + c[1]) / 2 + (c[0] - b[0]) * -0.08, c[0], c[1]);
  g.closePath();
}
const OLW = 1.4;
function OL(P) { return shade(P.fur, 0.36); }

// ---------- geometry of one pup (art units) ----------
function geo(P) {
  const rx = 21 * P.len, ry = 15 * P.ht, hr = 18 * P.head;
  const bottom = 92 - 11 * P.leg;
  const bodyCy = bottom - ry * 0.78, hipY = bodyCy + ry * 0.35;
  const bodyCx = 60 - (P.len - 1) * 5;
  const hx = bodyCx + rx * 0.7 + hr * 0.18, hy = bodyCy - ry * 0.7 - hr * 0.55;
  const lw = 9.6 * (P.leg < 0.7 ? 1.1 : P.leg > 1.1 ? 0.9 : 1);
  return { rx, ry, hr, bodyCx, bodyCy, hipY, lw,
    backHipX: bodyCx - rx * 0.56, frontHipX: bodyCx + rx * 0.5,
    hx, hy, neckPX: hx - hr * 0.3, neckPY: hy + hr * 0.82,
    tailX: bodyCx - rx * 0.94, tailY: bodyCy - ry * 0.35,
    shX: bodyCx - rx * 0.12, shY: bodyCy - ry * 0.8,
    capeX: bodyCx + rx * 0.5, capeY: bodyCy - ry * 0.78,
    e1: [hx - hr * 0.08, hy - hr * 0.04], e2: [hx + hr * 0.58, hy - hr * 0.07], nose: [hx + hr * 0.84, hy + hr * 0.22],
  };
}

// ---------- parts ----------
function drawLeg(g, P, G, hipX, far) {
  const lw = G.lw, ol = OL(P), col = far ? shade(P.fur, 0.78) : P.fur;
  const x = hipX + (far ? 3.5 : 0), top = G.hipY - 6 - (far ? 1 : 0), bot = 92 - lw * 0.3;
  const lg = g.createLinearGradient(x - lw / 2, 0, x + lw / 2, 0);
  lg.addColorStop(0, shade(col.startsWith('#') ? col : P.fur, far ? 0.85 : 1.08)); lg.addColorStop(1, far ? shade(P.fur, 0.68) : shade(P.fur, 0.86));
  blob(g, () => rrp(g, x - lw / 2, top, lw, bot - top, lw / 2), lg, ol, OLW);
  if (P.has.poodle) blob(g, () => cloud(g, x + 0.5, 92 - lw * 0.95, lw * 0.36, lw * 0.3, 5, lw * 0.36), far ? shade(P.fur, 0.86) : shade(P.fur, 1.04), ol, OLW);
  if (P.has.fringe) blob(g, () => cloud(g, x, top + (bot - top) * 0.55, lw * 0.25, lw * 0.6, 5, lw * 0.3), far ? shade(P.fur, 0.82) : P.fur, ol, OLW);
  const px = x + lw * 0.2, py = 92 - lw * 0.38;
  if (P.col.sneakers) {                            // Turbo's racing sneakers
    const sc = far ? shade(P.col.sneakers, 0.75) : P.col.sneakers;
    blob(g, () => ell(g, px + lw * 0.05, py, lw * 0.82, lw * 0.47), sc, shade(P.col.sneakers, 0.3), OLW);
    g.save(); g.beginPath(); ell(g, px + lw * 0.05, py, lw * 0.82, lw * 0.47); g.clip();
    g.fillStyle = far ? '#d6dae2' : '#ffffff'; g.fillRect(px - lw, 92 - lw * 0.2, lw * 2.2, lw);
    g.beginPath(); ell(g, px + lw * 0.62, py + lw * 0.04, lw * 0.32, lw * 0.34); g.fill();
    g.restore();
    g.strokeStyle = far ? '#c9ced8' : '#ffffff'; g.lineWidth = lw * 0.12;
    g.beginPath(); g.moveTo(px - lw * 0.35, py - lw * 0.18); g.lineTo(px + lw * 0.15, py - lw * 0.32); g.stroke();
    return;
  }
  const white = P.has.corgi || P.has.husky;
  const pc = white ? (far ? shade(P.belly, 0.82) : P.belly) : far ? shade(P.fur, 0.85) : shade(P.fur, 1.1);
  blob(g, () => ell(g, px, py, lw * 0.7, lw * 0.43), pc, ol, OLW);
  g.strokeStyle = rgbaOL(P, 0.45); g.lineWidth = 0.8;
  for (const dx of [0.28, 0.55]) { g.beginPath(); g.moveTo(px + lw * dx, py - lw * 0.12); g.lineTo(px + lw * dx, py + lw * 0.2); g.stroke(); }
}
function rgbaOL(P, a) { const n = parseInt(P.fur.slice(1), 16); return `rgba(${((n >> 16) & 255) * 0.36 | 0},${((n >> 8) & 255) * 0.36 | 0},${(n & 255) * 0.36 | 0},${a})`; }

function drawTail(g, P, G) {
  const x = G.tailX, y = G.tailY, ol = OL(P);
  if (P.tail === 'wag' || P.tail === 'flame') {
    const w = P.tail === 'flame' ? 7.5 : 6.4;
    tube(g, () => { g.moveTo(x + 5, y + 2); g.quadraticCurveTo(x - 9, y + 1, x - 12, y - 15); }, w, P.fur, ol, OLW);
    g.beginPath(); g.moveTo(x - 9.5, y - 7); g.quadraticCurveTo(x - 11.5, y - 12, x - 12, y - 15);
    g.strokeStyle = shade(P.fur, 1.28); g.lineWidth = w * 0.42; g.stroke();
    if (P.tail === 'flame') {                     // golden flame tip
      const fx = x - 12.5, fy = y - 17;
      const gr = g.createLinearGradient(fx, fy + 4, fx, fy - 15);
      gr.addColorStop(0, '#ff6a1a'); gr.addColorStop(0.5, '#ffcf3a'); gr.addColorStop(1, '#fff6c2');
      blob(g, () => { g.moveTo(fx - 5.5, fy + 2); g.quadraticCurveTo(fx - 9, fy - 7, fx - 2, fy - 16); g.quadraticCurveTo(fx, fy - 8, fx + 4.5, fy - 12); g.quadraticCurveTo(fx + 7, fy - 3, fx + 4.5, fy + 2); g.quadraticCurveTo(fx, fy + 5.5, fx - 5.5, fy + 2); g.closePath(); }, gr, '#c45a00', 0.9);
    }
  } else if (P.tail === 'curl') {
    tube(g, () => { g.moveTo(x + 5, y + 1); g.bezierCurveTo(x - 10, y - 2, x - 9, y - 20, x + 1.5, y - 15.5); }, 8, P.fur, ol, OLW);
    g.beginPath(); g.moveTo(x - 6.5, y - 12); g.quadraticCurveTo(x - 4.5, y - 17.5, x + 1.5, y - 15.5);
    g.strokeStyle = P.belly; g.lineWidth = 3.5; g.stroke();
  } else if (P.tail === 'stub') {
    blob(g, () => cloud(g, x + 1.5, y + 1, 4.5, 3.4, 5, 3.4), P.fur, ol, OLW);
    g.fillStyle = P.belly; g.beginPath(); ell(g, x + 0.5, y + 2.5, 3.2, 2.2); g.fill();
  } else if (P.tail === 'pom') {
    tube(g, () => { g.moveTo(x + 5, y + 1); g.quadraticCurveTo(x - 5, y - 2, x - 7, y - 11); }, 3.6, P.fur, ol, OLW);
    blob(g, () => cloud(g, x - 8, y - 15.5, 3.4, 3.4, 6, 3.7), shade(P.fur, 1.06), ol, OLW);
  } else if (P.tail === 'plume') {
    blob(g, () => { g.moveTo(x + 5, y + 3); g.bezierCurveTo(x - 6, y + 2, x - 21, y - 6, x - 17, y - 23);
      g.bezierCurveTo(x - 13, y - 12, x - 5, y - 8, x + 5, y - 3); g.closePath(); }, P.fur, ol, OLW);
    g.strokeStyle = shade(P.fur, 0.8); g.lineWidth = 0.9;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - 2 - i * 3, y - 1 - i); g.quadraticCurveTo(x - 10 - i * 2, y - 6 - i * 2, x - 13 - i, y - 15 - i * 2); g.stroke(); }
  }
}

function bodyPath(g, P, G) {
  const { rx, ry, bodyCx: cx, bodyCy: cy } = G;
  if (P.has.poodle) {                              // lion cut: fluffy chest and hips, slimmer middle
    ell(g, cx, cy + 1, rx * 0.92, ry * 0.8);
    cloud(g, cx + rx * 0.45, cy - ry * 0.05, rx * 0.36, ry * 0.62, 8, ry * 0.36);
    cloud(g, cx - rx * 0.55, cy - ry * 0.08, rx * 0.3, ry * 0.55, 7, ry * 0.32);
  } else {
    ell(g, cx, cy, rx, ry);
    ell(g, cx - rx * 0.45, cy + ry * 0.03, rx * 0.58, ry * 0.95);             // rump
    ell(g, cx + rx * 0.5, cy - ry * 0.06, rx * 0.56, ry * 1.0);               // chest
    ell(g, cx + rx * 0.66, cy - ry * 0.6, G.hr * 0.5, G.hr * 0.7, 0.45);      // neck
  }
}
function drawBody(g, P, G) {
  const { rx, ry, bodyCx: cx, bodyCy: cy } = G, ol = OL(P), H = P.has;
  if (H.fringe) blob(g, () => { for (let i = 0; i < 7; i++) ell(g, cx - rx * 0.75 + i * rx * 0.25, cy + ry * 0.86, rx * 0.13, ry * 0.34); }, shade(P.fur, 0.9), ol, OLW);
  const gr = g.createRadialGradient(cx - rx * 0.3, cy - ry * 0.75, ry * 0.15, cx, cy, rx * 1.35);
  gr.addColorStop(0, shade(P.fur, 1.2)); gr.addColorStop(0.55, P.fur); gr.addColorStop(1, shade(P.fur, 0.8));
  blob(g, () => bodyPath(g, P, G), gr, ol, OLW);
  g.save(); g.beginPath(); bodyPath(g, P, G); g.clip();
  // belly and chest fluff
  g.fillStyle = P.belly; g.beginPath(); ell(g, cx + rx * 0.15, cy + ry * 0.66, rx * 0.74, ry * 0.42); g.fill();
  g.beginPath(); ell(g, cx + rx * 0.78, cy + ry * 0.05, rx * 0.3, ry * 0.7); g.fill();
  if (H.husky || H.corgi) { g.beginPath(); ell(g, cx + rx * 0.72, cy + ry * 0.05, rx * 0.36, ry * 0.8); g.fill(); }
  if (H.spots) {
    g.fillStyle = shade(P.fur, 0.68);
    for (const [ax, ay, sr] of [[-0.5, -0.4, 0.24], [0.12, -0.6, 0.16], [-0.12, 0.05, 0.14], [0.45, -0.28, 0.12]]) { g.beginPath(); ell(g, cx + rx * ax, cy + ry * ay, rx * sr, rx * sr * 0.75, 0.3); g.fill(); }
  }
  if (H.racer) {                                   // Turbo: twin racing stripes and a number 1 on the side
    g.strokeStyle = '#ffffff'; g.lineCap = 'butt';
    for (const off of [-0.28, 0.02]) {
      g.lineWidth = ry * 0.17;
      g.beginPath(); g.moveTo(cx - rx * 1.2, cy + ry * (off - 0.3)); g.quadraticCurveTo(cx, cy + ry * (off - 0.75), cx + rx * 1.2, cy + ry * (off - 0.55)); g.stroke();
    }
    const nx = cx - rx * 0.12, ny = cy + ry * 0.12, nr = ry * 0.4;
    g.fillStyle = '#ffffff'; g.beginPath(); ell(g, nx, ny, nr, nr); g.fill();
    g.strokeStyle = '#1d2233'; g.lineWidth = 0.9; g.beginPath(); ell(g, nx, ny, nr, nr); g.stroke();
    g.fillStyle = '#1d2233'; g.font = `900 ${nr * 1.45}px Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('1', nx, ny + nr * 0.08);
  }
  if (H.stars) {
    g.fillStyle = '#fff6b0';
    for (const [ax, ay, sr] of [[-0.5, -0.4, 2.3], [0.05, -0.62, 1.7], [-0.15, -0.05, 1.4], [0.4, -0.3, 2.0], [-0.7, 0.05, 1.3]]) { g.beginPath(); starPath(g, cx + rx * ax, cy + ry * ay, sr, 0.42, 4); g.fill(); }
  }
  if (H.glow) {                                    // The Legend: shiny gold sheen
    const sh = g.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.45, 'rgba(255,255,255,0.5)'); sh.addColorStop(0.55, 'rgba(255,255,255,0)');
    g.fillStyle = sh; g.fillRect(cx - rx * 1.5, cy - ry * 1.5, rx * 3, ry * 3);
  }
  g.fillStyle = 'rgba(0,0,0,0.1)'; g.beginPath(); ell(g, cx - rx * 0.2, cy + ry * 1.05, rx * 1.1, ry * 0.4); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); ell(g, cx - rx * 0.15, cy - ry * 0.62, rx * 0.55, ry * 0.2, -0.05); g.fill();
  g.restore();
  // gear on the back
  if (H.jetpack) {
    const jx = cx - rx * 0.3, jy = cy - ry * 1.05;
    for (const dx of [-3.4, 3.4]) {
      const tg = g.createLinearGradient(jx + dx - 4, 0, jx + dx + 4, 0);
      tg.addColorStop(0, '#ffffff'); tg.addColorStop(0.5, '#d3dae4'); tg.addColorStop(1, '#8e9aab');
      blob(g, () => rrp(g, jx + dx - 4.2, jy - 9, 8.4, 18, 4.2), tg, '#3a4350', 1);
      blob(g, () => { g.moveTo(jx + dx - 4.2, jy - 5); g.lineTo(jx + dx, jy - 15); g.lineTo(jx + dx + 4.2, jy - 5); g.closePath(); }, '#ff4d3d', '#6d1a14', 0.9);
      blob(g, () => rrp(g, jx + dx - 2.8, jy + 7.5, 5.6, 3.4, 1), '#3a4350', '#1c2129', 0.7);
      g.fillStyle = '#5ad1ff'; g.beginPath(); ell(g, jx + dx, jy - 1, 1.6, 1.6); g.fill();
    }
    g.strokeStyle = '#3a4350'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(jx - 6, jy + 2); g.quadraticCurveTo(cx + rx * 0.2, cy - ry * 0.2, cx + rx * 0.4, cy + ry * 0.2); g.stroke();
  }
  if (H.pack) {
    const px = cx - rx * 0.3, py = cy - ry * 0.95;
    blob(g, () => rrp(g, px - 8.5, py - 7, 17, 12.5, 3.5), '#eef2f8', '#4a5468', 1);
    g.fillStyle = '#5ad1ff'; g.beginPath(); ell(g, px + 3, py - 1, 1.9, 1.9); g.fill();
    g.fillStyle = '#ff5d6c'; g.beginPath(); ell(g, px - 2, py - 1, 1.4, 1.4); g.fill();
    g.fillStyle = '#7dff6b'; g.beginPath(); ell(g, px - 5.5, py - 1, 1.1, 1.1); g.fill();
  }
}

function drawCape(g, P, G) {
  const { rx, ry, bodyCx: cx, bodyCy: cy } = G, col = P.col.cape;
  const gr = g.createLinearGradient(cx - rx, cy - ry, cx + rx * 0.5, cy + ry);
  gr.addColorStop(0, shade(col, 1.3)); gr.addColorStop(1, shade(col, 0.72));
  blob(g, () => {
    g.moveTo(G.capeX + 3, G.capeY - 2);
    g.quadraticCurveTo(cx, cy - ry * 1.38, cx - rx * 1.08, cy - ry * 0.45);
    g.lineTo(cx - rx * 1.15, cy + ry * 0.58);
    g.quadraticCurveTo(cx - rx * 0.86, cy + ry * 0.36, cx - rx * 0.62, cy + ry * 0.64);
    g.quadraticCurveTo(cx - rx * 0.35, cy + ry * 0.3, cx - rx * 0.1, cy + ry * 0.52);
    g.quadraticCurveTo(cx + rx * 0.15, cy + ry * 0.05, cx + rx * 0.45, cy + ry * 0.05);
    g.quadraticCurveTo(G.capeX + 2, cy - ry * 0.3, G.capeX + 3, G.capeY - 2);
    g.closePath();
  }, gr, shade(col, 0.38), OLW);
  g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - rx * 0.2, cy - ry * 1.0); g.quadraticCurveTo(cx - rx * 0.6, cy - ry * 0.5, cx - rx * 0.75, cy + ry * 0.4); g.stroke();
  g.strokeStyle = '#ffd23f'; g.lineWidth = 1.5; g.lineCap = 'round';      // gold hem
  g.beginPath(); g.moveTo(cx - rx * 1.15, cy + ry * 0.58);
  g.quadraticCurveTo(cx - rx * 0.86, cy + ry * 0.36, cx - rx * 0.62, cy + ry * 0.64);
  g.quadraticCurveTo(cx - rx * 0.35, cy + ry * 0.3, cx - rx * 0.1, cy + ry * 0.52);
  g.quadraticCurveTo(cx + rx * 0.15, cy + ry * 0.05, cx + rx * 0.45, cy + ry * 0.05); g.stroke();
  g.fillStyle = '#ffd23f'; g.strokeStyle = '#8a5a00'; g.lineWidth = 0.8;
  g.beginPath(); ell(g, G.capeX + 2, G.capeY - 1, 2.8, 2.8); g.fill(); g.stroke();
}
function drawScarf(g, P, G) {                      // the long end of a scarf, flapping behind (posed separately)
  const { hx, hy, hr } = G, c = P.col.scarf, o = shade(c, 0.45);
  blob(g, () => {
    g.moveTo(hx - hr * 0.55, hy + hr * 0.72);
    g.quadraticCurveTo(hx - hr * 1.3, hy + hr * 0.4, hx - hr * 2.15, hy + hr * 0.62);
    g.lineTo(hx - hr * 2.05, hy + hr * 0.88); g.lineTo(hx - hr * 2.3, hy + hr * 1.05);
    g.quadraticCurveTo(hx - hr * 1.4, hy + hr * 0.92, hx - hr * 0.6, hy + hr * 1.02); g.closePath();
  }, c, o, 0.9);
  g.strokeStyle = shade(c, 0.75); g.lineWidth = 0.8;
  for (const k of [1.3, 1.7]) { g.beginPath(); g.moveTo(hx - hr * k, hy + hr * 0.55); g.lineTo(hx - hr * (k + 0.05), hy + hr * 0.95); g.stroke(); }
}
function drawWing(g, P, G, far) {                // feathered angel wing, white to pale gold
  const x = G.shX + (far ? 5 : 0), y = G.shY - (far ? 2 : 0);
  const gr = g.createLinearGradient(x, y, x - 30, y - 40);
  gr.addColorStop(0, far ? '#e9dcc0' : '#ffffff'); gr.addColorStop(0.6, far ? '#e2c98a' : '#fff6d8'); gr.addColorStop(1, far ? '#d8b25a' : '#ffe08a');
  const tips = [[-34, -31, -25, -26], [-37, -18, -25, -14], [-33, -5, -20, -3], [-22, 5, -8, 3]];
  blob(g, () => {
    g.moveTo(x + 2, y + 2);
    g.bezierCurveTo(x + 4, y - 22, x - 8, y - 40, x - 24, y - 42);
    for (const [tx, ty, ix, iy] of tips) {
      g.quadraticCurveTo(x + tx - 2, y + ty - 8, x + tx, y + ty);
      g.quadraticCurveTo(x + (tx + ix) / 2 + 1, y + (ty + iy) / 2 + 3, x + ix, y + iy);
    }
    g.quadraticCurveTo(x - 2, y + 4, x + 2, y + 2);
    g.closePath();
  }, gr, far ? '#a07a30' : '#c9932a', 1.1);
  g.strokeStyle = far ? 'rgba(160,120,40,0.45)' : 'rgba(205,155,50,0.55)'; g.lineWidth = 0.9;
  for (const [tx, ty] of tips) { g.beginPath(); g.moveTo(x - 3, y - 2); g.quadraticCurveTo(x + tx * 0.5, y + ty * 0.5 - 6, x + tx * 0.86, y + ty * 0.86); g.stroke(); }
}

// ---------- head (3/4 view facing right) ----------
const EARS_BEHIND = { pointy: 1, bigpointy: 1, swept: 1 };
const INNER_EAR = { pointy: 1, bigpointy: 1 };
function earTri(P, G, far) {
  const { hx, hy, hr } = G;
  const tip = P.ears === 'bigpointy' ? 1.78 : 1.48;
  return far ? [[hx + hr * 0.16, hy - hr * 0.88], [hx + hr * 0.66, hy - hr * (tip - 0.04)], [hx + hr * 0.86, hy - hr * 0.46]]
    : [[hx - hr * 0.96, hy - hr * 0.26], [hx - hr * 0.84, hy - hr * tip], [hx - hr * 0.2, hy - hr * 0.86]];
}
function earPath(g, P, G, far) {
  const { hx, hy, hr } = G;
  switch (P.ears) {
    case 'floppy': if (far) ell(g, hx + hr * 0.82, hy - hr * 0.32, hr * 0.26, hr * 0.5, -0.6); else ell(g, hx - hr * 0.86, hy + hr * 0.06, hr * 0.32, hr * 0.64, 0.42); break;
    case 'long': if (far) ell(g, hx + hr * 0.88, hy - hr * 0.05, hr * 0.24, hr * 0.72, -0.32); else ell(g, hx - hr * 0.88, hy + hr * 0.3, hr * 0.31, hr * 0.9, 0.25); break;
    case 'silky': for (let i = 0; i < 5; i++) { if (far) ell(g, hx + hr * (0.86 + i * 0.02), hy + hr * (-0.35 + i * 0.3), hr * (0.26 - i * 0.02), hr * 0.22); else ell(g, hx - hr * (0.84 - i * 0.03), hy + hr * (-0.22 + i * 0.34), hr * (0.35 - i * 0.03), hr * 0.27); } break;
    case 'swept':                                  // Turbo: soft ears blown straight back by the wind
      if (far) { g.moveTo(hx - hr * 0.1, hy - hr * 0.86); g.quadraticCurveTo(hx - hr * 0.7, hy - hr * 1.28, hx - hr * 1.25, hy - hr * 1.02); g.quadraticCurveTo(hx - hr * 0.8, hy - hr * 0.78, hx - hr * 0.35, hy - hr * 0.58); g.closePath(); }
      else { g.moveTo(hx - hr * 0.5, hy - hr * 0.72); g.quadraticCurveTo(hx - hr * 1.3, hy - hr * 0.98, hx - hr * 1.75, hy - hr * 0.5); g.quadraticCurveTo(hx - hr * 1.25, hy - hr * 0.3, hx - hr * 0.86, hy - hr * 0.16); g.closePath(); }
      break;
    case 'fluffy': if (far) cloud(g, hx + hr * 0.88, hy - hr * 0.02, hr * 0.14, hr * 0.38, 6, hr * 0.2); else cloud(g, hx - hr * 0.86, hy + hr * 0.26, hr * 0.18, hr * 0.44, 6, hr * 0.23); break;
    case 'folded':
      if (far) { g.moveTo(hx + hr * 0.3, hy - hr * 0.84); g.lineTo(hx + hr * 0.72, hy - hr * 1.02); g.lineTo(hx + hr * 0.95, hy - hr * 0.55); g.quadraticCurveTo(hx + hr * 0.82, hy - hr * 0.5, hx + hr * 0.7, hy - hr * 0.38); g.closePath(); }
      else { g.moveTo(hx - hr * 0.82, hy - hr * 0.48); g.lineTo(hx - hr * 0.35, hy - hr * 1.06); g.lineTo(hx + hr * 0.02, hy - hr * 0.8); g.quadraticCurveTo(hx - hr * 0.12, hy - hr * 0.62, hx - hr * 0.24, hy - hr * 0.42); g.closePath(); }
      break;
    default: { const [a, b, c] = earTri(P, G, far); tri(g, a, b, c); }
  }
}
function drawEar(g, P, G, far) {
  const col = far ? shade(P.ear, 0.78) : P.ear;
  blob(g, () => earPath(g, P, G, far), col, OL(P), OLW);
  if (INNER_EAR[P.ears]) {                          // pink (or white) inner ear
    const [a, b, c] = earTri(P, G, far), cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
    const m = (p, k) => [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k + 1.2];
    g.fillStyle = P.has.husky ? '#f4f6fa' : far ? '#e78f9d' : '#f7a9b6'; g.beginPath(); tri(g, m(a, 0.55), m(b, 0.62), m(c, 0.55)); g.fill();
  }
}
function headPath(g, P, G) {
  const { hx, hy, hr } = G;
  ell(g, hx, hy, hr * 1.04, hr * 0.94);
  ell(g, hx - hr * 0.5, hy + hr * 0.36, hr * 0.5, hr * 0.44);              // round cheek
  ell(g, hx + hr * 0.62, hy + hr * 0.36, hr * 0.5, hr * 0.38, 0.05);       // muzzle
  if (P.has.poodle && !P.has.afro) cloud(g, hx - hr * 0.02, hy - hr * 0.78, hr * 0.42, hr * 0.22, 7, hr * 0.26);
}
function drawEye(g, x, y, rx, ry, P, closed) {
  if (closed) {
    g.strokeStyle = '#1b1424'; g.lineWidth = Math.max(1.2, rx * 0.42); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - rx, y); g.quadraticCurveTo(x, y + ry * 0.65, x + rx, y); g.stroke();
    return;
  }
  if (P.has.blueeyes) {
    g.fillStyle = '#1b1424'; g.beginPath(); ell(g, x, y, rx, ry); g.fill();
    g.fillStyle = '#45c1ff'; g.beginPath(); ell(g, x, y + ry * 0.05, rx * 0.82, ry * 0.85); g.fill();
    g.fillStyle = '#0d1a2e'; g.beginPath(); ell(g, x + rx * 0.05, y + ry * 0.1, rx * 0.45, ry * 0.5); g.fill();
  } else {
    g.fillStyle = '#1b1424'; g.beginPath(); ell(g, x, y, rx, ry); g.fill();
    g.fillStyle = 'rgba(120,70,40,0.55)'; g.beginPath(); ell(g, x, y + ry * 0.38, rx * 0.68, ry * 0.42); g.fill();
  }
  g.fillStyle = '#ffffff'; g.beginPath(); ell(g, x + rx * 0.28, y - ry * 0.34, rx * 0.44, ry * 0.36); g.fill();
  g.beginPath(); ell(g, x - rx * 0.34, y + ry * 0.42, rx * 0.17, ry * 0.14); g.fill();
}
function drawHead(g, P, G, closed) {
  const { hx, hy, hr } = G, ol = OL(P), H = P.has;
  const [e1x, e1y] = G.e1, [e2x, e2y] = G.e2, [nx, ny] = G.nose;
  if (H.afro) {                                    // big afro behind the head
    const ag = g.createRadialGradient(hx - hr * 0.3, hy - hr * 1.1, hr * 0.2, hx - hr * 0.1, hy - hr * 0.8, hr * 1.4);
    ag.addColorStop(0, '#ffb3ea'); ag.addColorStop(1, '#d13fa6');
    blob(g, () => cloud(g, hx - hr * 0.12, hy - hr * 0.7, hr * 0.92, hr * 0.62, 10, hr * 0.37), ag, '#6e1656', OLW);
  }
  if (H.phones) blob(g, () => ell(g, hx + hr * 0.98, hy - hr * 0.2, hr * 0.14, hr * 0.28), '#c2372a', '#5a140c', 1);
  drawEar(g, P, G, true);
  if (EARS_BEHIND[P.ears]) drawEar(g, P, G, false);
  const gr = g.createRadialGradient(hx - hr * 0.32, hy - hr * 0.5, hr * 0.12, hx, hy, hr * 1.35);
  gr.addColorStop(0, shade(P.fur, 1.22)); gr.addColorStop(0.6, P.fur); gr.addColorStop(1, shade(P.fur, 0.84));
  blob(g, () => headPath(g, P, G), gr, ol, OLW);
  g.save(); g.beginPath(); headPath(g, P, G); g.clip();
  g.fillStyle = P.belly;
  g.beginPath(); ell(g, hx + hr * 0.64, hy + hr * 0.42, hr * 0.56, hr * 0.42); g.fill();               // muzzle
  if (H.husky) { g.beginPath(); ell(g, hx + hr * 0.2, hy + hr * 0.62, hr * 1.0, hr * 0.44); ell(g, e1x - hr * 0.02, e1y - hr * 0.4, hr * 0.13, hr * 0.08); ell(g, e2x + hr * 0.02, e2y - hr * 0.38, hr * 0.11, hr * 0.07); g.fill(); }
  if (H.corgi) {
    g.beginPath(); g.moveTo(hx + hr * 0.18, hy - hr * 1.0); g.quadraticCurveTo(hx + hr * 0.3, hy - hr * 0.4, hx + hr * 0.2, hy + hr * 0.1);
    g.lineTo(hx + hr * 0.52, hy + hr * 0.1); g.quadraticCurveTo(hx + hr * 0.4, hy - hr * 0.4, hx + hr * 0.34, hy - hr * 1.0); g.closePath(); g.fill();
    g.beginPath(); ell(g, hx - hr * 0.42, hy + hr * 0.62, hr * 0.5, hr * 0.32); g.fill();
  }
  if (H.spots) { g.fillStyle = shade(P.fur, 0.66); g.beginPath(); ell(g, e1x - hr * 0.04, e1y + hr * 0.02, hr * 0.36, hr * 0.38, -0.2); ell(g, hx + hr * 0.2, hy - hr * 0.72, hr * 0.22, hr * 0.14, 0.3); g.fill(); }
  if (H.stars) { g.fillStyle = '#fff6b0'; for (const [ax, ay, sr] of [[-0.5, -0.45, 1.7], [0.15, -0.72, 1.3], [-0.75, 0.2, 1.1]]) { g.beginPath(); starPath(g, hx + hr * ax, hy + hr * ay, sr, 0.42, 4); g.fill(); } }
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); ell(g, hx - hr * 0.3, hy - hr * 0.58, hr * 0.46, hr * 0.2, -0.3); g.fill();
  g.fillStyle = 'rgba(0,0,0,0.07)'; g.beginPath(); ell(g, hx - hr * 0.2, hy + hr * 0.95, hr * 1.1, hr * 0.3); g.fill();
  g.restore();
  if (H.tuft) {                                    // Pebble's little hair tuft
    g.strokeStyle = ol; g.lineWidth = 3.4; g.lineCap = 'round';
    const tf = () => { g.beginPath(); g.moveTo(hx - hr * 0.1, hy - hr * 0.86); g.quadraticCurveTo(hx - hr * 0.05, hy - hr * 1.25, hx + hr * 0.25, hy - hr * 1.2); g.moveTo(hx + hr * 0.08, hy - hr * 0.9); g.quadraticCurveTo(hx + hr * 0.2, hy - hr * 1.12, hx + hr * 0.42, hy - hr * 1.02); };
    tf(); g.stroke(); g.strokeStyle = shade(P.fur, 1.12); g.lineWidth = 1.6; tf(); g.stroke();
  }
  // cheeks, tongue, nose, mouth
  g.fillStyle = 'rgba(255,110,140,0.42)'; g.beginPath(); ell(g, e1x - hr * 0.26, e1y + hr * 0.38, hr * 0.18, hr * 0.1); ell(g, e2x + hr * 0.02, e2y + hr * 0.36, hr * 0.12, hr * 0.07); g.fill();
  if (H.tongue) {
    blob(g, () => ell(g, nx - hr * 0.08, ny + hr * 0.4, hr * 0.12, hr * 0.17), '#f2727f', '#a8343f', 0.8);
    g.strokeStyle = '#c9485a'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(nx - hr * 0.08, ny + hr * 0.3); g.lineTo(nx - hr * 0.08, ny + hr * 0.5); g.stroke();
  }
  g.strokeStyle = '#3a2228'; g.lineWidth = 1.2; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(nx - hr * 0.02, ny + hr * 0.1); g.lineTo(nx - hr * 0.04, ny + hr * 0.24);
  g.moveTo(nx - hr * 0.26, ny + hr * 0.2); g.quadraticCurveTo(nx - hr * 0.16, ny + hr * 0.34, nx - hr * 0.04, ny + hr * 0.24);
  g.quadraticCurveTo(nx + hr * 0.06, ny + hr * 0.32, nx + hr * 0.16, ny + hr * 0.2); g.stroke();
  g.fillStyle = '#1b1424'; g.beginPath();
  g.moveTo(nx - hr * 0.19, ny - hr * 0.07); g.quadraticCurveTo(nx, ny - hr * 0.17, nx + hr * 0.17, ny - hr * 0.08);
  g.quadraticCurveTo(nx + hr * 0.15, ny + hr * 0.08, nx - hr * 0.01, ny + hr * 0.12); g.quadraticCurveTo(nx - hr * 0.17, ny + hr * 0.08, nx - hr * 0.19, ny - hr * 0.07); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); ell(g, nx - hr * 0.06, ny - hr * 0.06, hr * 0.06, hr * 0.03); g.fill();
  if (H.mustache) {
    g.strokeStyle = '#1a0d05'; g.lineWidth = hr * 0.15; g.lineCap = 'round';
    g.beginPath(); g.moveTo(nx - hr * 0.04, ny + hr * 0.14); g.quadraticCurveTo(nx - hr * 0.34, ny + hr * 0.36, nx - hr * 0.58, ny + hr * 0.14);
    g.quadraticCurveTo(nx - hr * 0.7, ny - hr * 0.02, nx - hr * 0.56, ny - hr * 0.06); g.stroke();
    g.beginPath(); g.moveTo(nx + hr * 0.0, ny + hr * 0.14); g.quadraticCurveTo(nx + hr * 0.2, ny + hr * 0.32, nx + hr * 0.36, ny + hr * 0.1); g.quadraticCurveTo(nx + hr * 0.42, ny - hr * 0.02, nx + hr * 0.32, ny - hr * 0.06); g.stroke();
  }
  if (H.beard) blob(g, () => { ell(g, nx - hr * 0.1, ny + hr * 0.5, hr * 0.24, hr * 0.22); ell(g, nx - hr * 0.36, ny + hr * 0.56, hr * 0.26, hr * 0.24); ell(g, nx - hr * 0.6, ny + hr * 0.46, hr * 0.2, hr * 0.2); }, '#f6f8fc', '#6f7891', 1);
  // eyes and brows
  drawEye(g, e1x, e1y, hr * 0.19, hr * 0.25, P, closed);
  drawEye(g, e2x, e2y, hr * 0.15, hr * 0.23, P, closed);
  if (H.beard) blob(g, () => { ell(g, e1x - hr * 0.05, e1y - hr * 0.36, hr * 0.17, hr * 0.09); ell(g, e2x + hr * 0.02, e2y - hr * 0.36, hr * 0.14, hr * 0.08); }, '#f6f8fc', '#6f7891', 0.8);
  else if (!H.shades && !H.starshades) {
    g.strokeStyle = shade(P.fur, P.fur === '#f6f6fb' ? 0.6 : 0.42); g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(e1x - hr * 0.17, e1y - hr * 0.37); g.quadraticCurveTo(e1x, e1y - hr * 0.47, e1x + hr * 0.15, e1y - hr * 0.38);
    g.moveTo(e2x - hr * 0.12, e2y - hr * 0.37); g.quadraticCurveTo(e2x + hr * 0.02, e2y - hr * 0.45, e2x + hr * 0.13, e2y - hr * 0.35); g.stroke();
  }
  // neck wear (under the chin)
  if (P.col.collar) {
    tube(g, () => { g.moveTo(hx - hr * 0.72, hy + hr * 0.6); g.quadraticCurveTo(hx - hr * 0.05, hy + hr * 1.2, hx + hr * 0.62, hy + hr * 0.8); }, 3.8, P.col.collar, shade(P.col.collar, 0.4), 0.9);
    if (H.corgi) blob(g, () => { ell(g, hx - hr * 0.06, hy + hr * 1.18, 2.7, 1.3); ell(g, hx - hr * 0.06 - 2.7, hy + hr * 1.18, 1.35, 1.35); ell(g, hx - hr * 0.06 + 2.7, hy + hr * 1.18, 1.35, 1.35); }, '#ffffff', '#6b6b78', 0.6);
    else { blob(g, () => ell(g, hx - hr * 0.04, hy + hr * 1.18, 2.7, 2.7), '#ffd23f', '#8a5a00', 0.8); g.fillStyle = '#fff6c2'; g.beginPath(); ell(g, hx - hr * 0.04 - 0.8, hy + hr * 1.18 - 0.8, 0.8, 0.8); g.fill(); }
  }
  if (P.col.bandana) {
    const c = P.col.bandana;
    blob(g, () => { g.moveTo(hx - hr * 0.78, hy + hr * 0.58); g.lineTo(hx + hr * 0.66, hy + hr * 0.82); g.lineTo(hx - hr * 0.08, hy + hr * 1.62); g.closePath(); }, c, shade(c, 0.4), 0.9);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    for (const [ax, ay] of [[-0.32, 0.82], [0.18, 0.92], [-0.08, 1.2]]) { g.beginPath(); ell(g, hx + hr * ax, hy + hr * ay, 1.1, 1.1); g.fill(); }
  }
  if (P.col.scarf) tube(g, () => { g.moveTo(hx - hr * 0.78, hy + hr * 0.62); g.quadraticCurveTo(hx - hr * 0.05, hy + hr * 1.22, hx + hr * 0.62, hy + hr * 0.8); }, 5.4, P.col.scarf, shade(P.col.scarf, 0.45), 0.9);
  if (P.col.bowtie) {
    const c = P.col.bowtie, bx = hx + hr * 0.12, by = hy + hr * 1.08;
    blob(g, () => { g.moveTo(bx, by); g.lineTo(bx - hr * 0.42, by - hr * 0.25); g.lineTo(bx - hr * 0.42, by + hr * 0.25); g.closePath();
      g.moveTo(bx, by); g.lineTo(bx + hr * 0.42, by - hr * 0.25); g.lineTo(bx + hr * 0.42, by + hr * 0.25); g.closePath(); ell(g, bx, by, hr * 0.1, hr * 0.12); }, c, shade(c, 0.4), 0.8);
  }
  if (H.chain) {
    g.strokeStyle = '#ffd23f'; g.lineWidth = 1.9;
    g.beginPath(); g.moveTo(hx - hr * 0.68, hy + hr * 0.62); g.quadraticCurveTo(hx - hr * 0.2, hy + hr * 1.55, hx + hr * 0.6, hy + hr * 0.85); g.stroke();
    g.fillStyle = '#fff0a0'; for (let i = 1; i < 6; i++) { const k = i / 6, a = 1 - k; const px = a * a * (hx - hr * 0.68) + 2 * a * k * (hx - hr * 0.2) + k * k * (hx + hr * 0.6), py = a * a * (hy + hr * 0.62) + 2 * a * k * (hy + hr * 1.55) + k * k * (hy + hr * 0.85); g.beginPath(); ell(g, px, py, 0.8, 0.8); g.fill(); }
    const mg = g.createRadialGradient(hx - hr * 0.15, hy + hr * 1.3, 0.5, hx - hr * 0.1, hy + hr * 1.4, hr * 0.3);
    mg.addColorStop(0, '#fff6c2'); mg.addColorStop(1, '#e0a100');
    blob(g, () => ell(g, hx - hr * 0.1, hy + hr * 1.4, hr * 0.22, hr * 0.22), mg, '#7a5200', 0.8);
    g.fillStyle = '#b97a00'; g.beginPath(); starPath(g, hx - hr * 0.1, hy + hr * 1.4, hr * 0.12, 0.45, 5); g.fill();
  }
  // face wear
  if (H.shades) {                                   // The Legend: gold-framed shades over both eyes
    const fr = H.crown ? '#ffd23f' : '#000000';
    g.strokeStyle = '#151724'; g.lineWidth = 1.7; g.beginPath(); g.moveTo(e1x - hr * 0.3, e1y - hr * 0.1); g.lineTo(hx - hr * 0.78, hy - hr * 0.2); g.stroke();
    blob(g, () => {
      g.moveTo(e1x - hr * 0.33, e1y - hr * 0.2); g.lineTo(e1x + hr * 0.32, e1y - hr * 0.24); g.lineTo(e1x + hr * 0.26, e1y + hr * 0.16); g.quadraticCurveTo(e1x, e1y + hr * 0.26, e1x - hr * 0.26, e1y + hr * 0.14); g.closePath();
      g.moveTo(e2x - hr * 0.22, e2y - hr * 0.24); g.lineTo(e2x + hr * 0.26, e2y - hr * 0.26); g.lineTo(e2x + hr * 0.2, e2y + hr * 0.14); g.quadraticCurveTo(e2x, e2y + hr * 0.22, e2x - hr * 0.2, e2y + hr * 0.12); g.closePath();
      g.rect(e1x + hr * 0.3, e1y - hr * 0.22, e2x - e1x - hr * 0.5, hr * 0.07);
    }, '#121420', fr, 0.8);
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(e1x - hr * 0.16, e1y - hr * 0.1); g.lineTo(e1x + hr * 0.02, e1y - hr * 0.13); g.moveTo(e2x - hr * 0.1, e2y - hr * 0.12); g.lineTo(e2x + hr * 0.04, e2y - hr * 0.14); g.stroke();
  }
  if (H.starshades) {                               // Disco: pink star shades
    g.strokeStyle = '#ffd23f'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(e1x - hr * 0.28, e1y - hr * 0.08); g.lineTo(hx - hr * 0.74, hy - hr * 0.16); g.moveTo(e1x + hr * 0.3, e1y - hr * 0.08); g.lineTo(e2x - hr * 0.22, e2y - hr * 0.08); g.stroke();
    blob(g, () => { starPath(g, e1x + hr * 0.02, e1y, hr * 0.36, 0.5, 5); starPath(g, e2x, e2y, hr * 0.3, 0.5, 5); }, 'rgba(255,79,216,0.94)', '#ffd23f', 0.9);
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); ell(g, e1x - hr * 0.06, e1y - hr * 0.08, hr * 0.07, hr * 0.04, -0.5); ell(g, e2x - hr * 0.05, e2y - hr * 0.08, hr * 0.05, hr * 0.03, -0.5); g.fill();
  }
  if (H.monocle) {
    g.fillStyle = 'rgba(220,240,255,0.25)'; g.beginPath(); ell(g, e1x, e1y, hr * 0.3, hr * 0.3); g.fill();
    g.strokeStyle = '#e8b52a'; g.lineWidth = 1.6; g.beginPath(); ell(g, e1x, e1y, hr * 0.3, hr * 0.3); g.stroke();
    g.lineWidth = 0.7; g.beginPath(); g.moveTo(e1x - hr * 0.14, e1y + hr * 0.27); g.quadraticCurveTo(e1x - hr * 0.5, e1y + hr * 0.9, hx - hr * 0.3, hy + hr * 1.05); g.stroke();
  }
  if (H.glasses) {
    g.fillStyle = 'rgba(220,240,255,0.22)'; g.beginPath(); ell(g, e1x, e1y, hr * 0.29, hr * 0.27); ell(g, e2x, e2y, hr * 0.23, hr * 0.26); g.fill();
    g.strokeStyle = '#2b2d3a'; g.lineWidth = 1.5; g.beginPath(); ell(g, e1x, e1y, hr * 0.29, hr * 0.27); ell(g, e2x, e2y, hr * 0.23, hr * 0.26); g.stroke();
    g.beginPath(); g.moveTo(e1x + hr * 0.29, e1y - hr * 0.04); g.quadraticCurveTo((e1x + e2x) / 2 + hr * 0.03, e1y - hr * 0.14, e2x - hr * 0.23, e2y - hr * 0.04); g.moveTo(e1x - hr * 0.29, e1y - hr * 0.04); g.lineTo(hx - hr * 0.76, hy - hr * 0.2); g.stroke();
  }
  if (H.goggles) {                                  // Turbo: racing goggles pushed up on the forehead
    tube(g, () => { g.moveTo(hx - hr * 1.0, hy - hr * 0.3); g.quadraticCurveTo(hx - hr * 0.2, hy - hr * 0.82, hx + hr * 0.92, hy - hr * 0.5); }, hr * 0.2, '#2b2d3a', '#11131a', 0.6);
    for (const [gx, gy, grx, gry] of [[hx - hr * 0.06, hy - hr * 0.6, hr * 0.27, hr * 0.24], [hx + hr * 0.5, hy - hr * 0.62, hr * 0.22, hr * 0.23]]) {
      const lg = g.createLinearGradient(gx - grx, gy - gry, gx + grx, gy + gry);
      lg.addColorStop(0, '#ffe36b'); lg.addColorStop(1, '#ff6a3d');
      blob(g, () => ell(g, gx, gy, grx, gry), lg, '#c9ced8', 1.3);
      g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1; g.beginPath(); g.arc(gx, gy, grx * 0.62, -2.6, -1.6); g.stroke();
    }
  }
  if (!EARS_BEHIND[P.ears]) drawEar(g, P, G, false);
  // head wear
  if (H.phones) {
    g.strokeStyle = '#2b2d3a'; g.lineWidth = hr * 0.16; g.lineCap = 'round';
    g.beginPath(); g.arc(hx + hr * 0.02, hy + hr * 0.05, hr * 1.04, -2.75, -0.42); g.stroke();
    blob(g, () => ell(g, hx - hr * 0.88, hy - hr * 0.04, hr * 0.27, hr * 0.37), '#ff5d3d', '#6b1a0c', 1);
    g.fillStyle = '#2b2d3a'; g.beginPath(); ell(g, hx - hr * 0.88, hy - hr * 0.04, hr * 0.13, hr * 0.21); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); ell(g, hx - hr * 0.95, hy - hr * 0.2, hr * 0.07, hr * 0.1); g.fill();
  }
  const tx = hx + hr * 0.06, ty = hy - hr * 0.8;
  if (H.captain) {
    g.save(); g.translate(tx, ty); g.rotate(-0.1);
    const cg = g.createLinearGradient(0, -hr * 0.7, 0, 0); cg.addColorStop(0, '#ffffff'); cg.addColorStop(1, '#d9dde8');
    blob(g, () => { g.moveTo(-hr * 0.82, hr * 0.06); g.lineTo(-hr * 0.98, -hr * 0.36); g.quadraticCurveTo(0, -hr * 0.8, hr * 0.98, -hr * 0.36); g.lineTo(hr * 0.82, hr * 0.06); g.closePath(); }, cg, '#2b3040', 1);
    blob(g, () => { g.moveTo(-hr * 0.85, -hr * 0.12); g.lineTo(hr * 0.86, -hr * 0.12); g.lineTo(hr * 0.82, hr * 0.08); g.lineTo(-hr * 0.82, hr * 0.08); g.closePath(); }, '#1f3a8a', '#0d1a40', 0.8);
    blob(g, () => { g.moveTo(hr * 0.4, hr * 0.06); g.quadraticCurveTo(hr * 1.05, hr * 0.02, hr * 1.3, hr * 0.26); g.quadraticCurveTo(hr * 0.8, hr * 0.3, hr * 0.32, hr * 0.14); g.closePath(); }, '#161b2a', '#05070c', 0.7);
    blob(g, () => starPath(g, hr * 0.1, -hr * 0.32, hr * 0.18, 0.45, 5), '#ffd23f', '#8a5a00', 0.6);
    g.strokeStyle = '#ffd23f'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(-hr * 0.8, -hr * 0.02); g.lineTo(hr * 0.8, -hr * 0.02); g.stroke();
    g.restore();
  }
  if (H.tophat) {
    g.save(); g.translate(tx - hr * 0.08, ty - hr * 0.02); g.rotate(-0.14);
    const tg = g.createLinearGradient(-hr * 0.5, 0, hr * 0.5, 0); tg.addColorStop(0, '#454558'); tg.addColorStop(0.4, '#1a1a26'); tg.addColorStop(1, '#0c0c12');
    blob(g, () => { g.moveTo(-hr * 0.5, 0); g.lineTo(-hr * 0.56, -hr * 1.15); g.lineTo(hr * 0.56, -hr * 1.15); g.lineTo(hr * 0.5, 0); g.closePath(); ell(g, 0, 0, hr * 0.82, hr * 0.15); }, tg, '#000000', 0.9);
    g.fillStyle = '#c62a3c'; g.fillRect(-hr * 0.5, -hr * 0.32, hr * 1.0, hr * 0.2);
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(-hr * 0.38, -hr * 1.1, hr * 0.12, hr * 0.75);
    g.restore();
  }
  if (H.gradcap) {
    const cx = tx - hr * 0.05, cy = ty + hr * 0.08;
    blob(g, () => { g.moveTo(cx - hr * 0.62, cy + hr * 0.12); g.quadraticCurveTo(cx, cy - hr * 0.5, cx + hr * 0.62, cy + hr * 0.12); g.closePath(); }, '#1d1d28', '#000000', 0.8);
    blob(g, () => { g.moveTo(cx - hr * 1.05, cy - hr * 0.3); g.lineTo(cx + hr * 0.15, cy - hr * 0.58); g.lineTo(cx + hr * 1.08, cy - hr * 0.3); g.lineTo(cx - hr * 0.12, cy - hr * 0.02); g.closePath(); }, '#2c2c3c', '#000000', 0.8);
    g.strokeStyle = '#ffd23f'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(cx + hr * 0.02, cy - hr * 0.3); g.lineTo(cx + hr * 0.95, cy - hr * 0.28); g.lineTo(cx + hr * 0.98, cy + hr * 0.35); g.stroke();
    blob(g, () => { g.moveTo(cx + hr * 0.9, cy + hr * 0.3); g.lineTo(cx + hr * 1.08, cy + hr * 0.3); g.lineTo(cx + hr * 1.12, cy + hr * 0.62); g.lineTo(cx + hr * 0.86, cy + hr * 0.62); g.closePath(); }, '#ffd23f', '#8a5a00', 0.5);
  }
  if (H.tiara) {
    const cx = tx, cy = ty - hr * 0.06;
    g.strokeStyle = '#ffd23f'; g.lineWidth = 1.7; g.beginPath(); g.arc(cx, cy + hr * 0.5, hr * 0.62, -2.5, -0.65); g.stroke();
    blob(g, () => { g.moveTo(cx, cy - hr * 0.3); g.lineTo(cx + hr * 0.17, cy); g.lineTo(cx, cy + hr * 0.18); g.lineTo(cx - hr * 0.17, cy); g.closePath(); }, '#ff5fb0', '#8a1a52', 0.7);
    g.fillStyle = '#ffffff'; for (const a of [-2.1, -1.1]) { g.beginPath(); ell(g, cx + Math.cos(a) * hr * 0.62, cy + hr * 0.5 + Math.sin(a) * hr * 0.62, 1.2, 1.2); g.fill(); }
  }
  if (H.crown) {
    const cx = tx, cy = ty - hr * 0.02;
    const cg = g.createLinearGradient(0, cy - hr * 0.8, 0, cy + hr * 0.15);
    cg.addColorStop(0, '#fff3a8'); cg.addColorStop(0.5, '#ffc21a'); cg.addColorStop(1, '#e08a00');
    blob(g, () => { g.moveTo(cx - hr * 0.62, cy + hr * 0.12); g.lineTo(cx - hr * 0.72, cy - hr * 0.58); g.lineTo(cx - hr * 0.33, cy - hr * 0.25); g.lineTo(cx, cy - hr * 0.8);
      g.lineTo(cx + hr * 0.33, cy - hr * 0.25); g.lineTo(cx + hr * 0.72, cy - hr * 0.58); g.lineTo(cx + hr * 0.62, cy + hr * 0.12); g.closePath(); }, cg, '#7a4a00', 0.9);
    for (const [ax, ay] of [[-0.72, -0.58], [0, -0.8], [0.72, -0.58]]) { g.fillStyle = '#fff6c2'; g.beginPath(); ell(g, cx + hr * ax, cy + hr * ay, 1.6, 1.6); g.fill(); }
    g.fillStyle = '#e8283f'; g.beginPath(); ell(g, cx, cy - hr * 0.08, hr * 0.12, hr * 0.12); g.fill();
    g.fillStyle = '#3fa9f5'; g.beginPath(); ell(g, cx - hr * 0.4, cy - hr * 0.02, hr * 0.08, hr * 0.08); ell(g, cx + hr * 0.4, cy - hr * 0.02, hr * 0.08, hr * 0.08); g.fill();
  }
  if (H.helmet) {                                  // astronaut bubble
    const bx = hx + hr * 0.18, by = hy + hr * 0.04, br = hr * 1.58;
    g.fillStyle = 'rgba(190,225,255,0.16)'; g.beginPath(); ell(g, bx, by, br, br); g.fill();
    g.strokeStyle = 'rgba(235,245,255,0.92)'; g.lineWidth = 1.7; g.beginPath(); ell(g, bx, by, br, br); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2.3; g.beginPath(); g.arc(bx, by, br * 0.8, -2.7, -1.9); g.stroke();
    g.lineWidth = 1.4; g.beginPath(); g.arc(bx, by, br * 0.8, -1.75, -1.55); g.stroke();
    tube(g, () => g.arc(bx, by, br * 0.97, 0.75, 2.35), 3.8, '#cfd6e3', '#4a5468', 0.8);
    g.strokeStyle = '#cfd6e3'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(bx - br * 0.3, by - br * 0.95); g.lineTo(bx - br * 0.45, by - br * 1.35); g.stroke();
    blob(g, () => ell(g, bx - br * 0.47, by - br * 1.4, 2.1, 2.1), '#ff4d5e', '#7a1020', 0.6);
  }
}

// ---------- cache: each part drawn once per size, then posed ----------
const partCache = new Map();
function mkPart(k, box, pivot, fn) {
  const [x0, y0, x1, y1] = box;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil((x1 - x0) * k)); c.height = Math.max(1, Math.ceil((y1 - y0) * k));
  const g = c.getContext('2d');
  g.scale(k, k); g.translate(-x0, -y0); fn(g);
  return { c, x: x0, y: y0, w: c.width / k, h: c.height / k, px: pivot[0], py: pivot[1] };
}
function dogParts(lv, k) {
  const key = lv + ':' + k;
  let p = partCache.get(key);
  if (p) return p;
  if (partCache.size > 72) partCache.clear();      // sizes change on resize and crowding; keep memory bounded
  const P = PUPS[lv], G = geo(P), H = P.has;
  const hr = G.hr, legBox = (x) => [x - 10, G.hipY - 9, x + 15, 96];
  p = { G };
  if (H.wings) {
    p.wingFar = mkPart(k, [G.shX - 42, G.shY - 46, G.shX + 12, G.shY + 8], [G.shX + 5, G.shY - 2], (g) => drawWing(g, P, G, true));
    p.wingNear = mkPart(k, [G.shX - 42, G.shY - 46, G.shX + 8, G.shY + 8], [G.shX, G.shY], (g) => drawWing(g, P, G, false));
  }
  p.tail = mkPart(k, [G.tailX - 32, G.tailY - 38, G.tailX + 12, G.tailY + 12], [G.tailX + 3, G.tailY + 1], (g) => drawTail(g, P, G));
  p.legBF = mkPart(k, legBox(G.backHipX), [G.backHipX + 3.5, G.hipY - 2], (g) => drawLeg(g, P, G, G.backHipX, true));
  p.legFF = mkPart(k, legBox(G.frontHipX), [G.frontHipX + 3.5, G.hipY - 2], (g) => drawLeg(g, P, G, G.frontHipX, true));
  p.legBN = mkPart(k, legBox(G.backHipX), [G.backHipX, G.hipY - 1], (g) => drawLeg(g, P, G, G.backHipX, false));
  p.legFN = mkPart(k, legBox(G.frontHipX), [G.frontHipX, G.hipY - 1], (g) => drawLeg(g, P, G, G.frontHipX, false));
  p.body = mkPart(k, [G.bodyCx - G.rx * 1.3 - 6, G.bodyCy - G.ry - 28, G.bodyCx + G.rx + hr * 1.1, G.bodyCy + G.ry + 10], [0, 0], (g) => drawBody(g, P, G));
  if (P.col.cape) p.cape = mkPart(k, [G.bodyCx - G.rx * 1.3, G.bodyCy - G.ry * 1.7, G.capeX + 8, G.bodyCy + G.ry + 4], [G.capeX, G.capeY], (g) => drawCape(g, P, G));
  if (P.col.scarf) p.scarf = mkPart(k, [G.hx - hr * 2.5, G.hy + hr * 0.2, G.hx - hr * 0.3, G.hy + hr * 1.3], [G.hx - hr * 0.6, G.hy + hr * 0.8], (g) => drawScarf(g, P, G));
  const hb = [G.hx - hr * 2.4, G.hy - hr * 2.9, G.hx + hr * 2.1, G.hy + hr * 2.0];
  p.head = mkPart(k, hb, [G.neckPX, G.neckPY], (g) => drawHead(g, P, G, false));
  p.headBlink = mkPart(k, hb, [G.neckPX, G.neckPY], (g) => drawHead(g, P, G, true));
  partCache.set(key, p);
  return p;
}
function drawPart(g, pt, ang) {
  if (!pt) return;
  if (ang) { g.save(); g.translate(pt.px, pt.py); g.rotate(ang); g.drawImage(pt.c, pt.x - pt.px, pt.y - pt.py, pt.w, pt.h); g.restore(); }
  else g.drawImage(pt.c, pt.x, pt.y, pt.w, pt.h);
}

// ---------- posing ----------
// o: { t, face (+1 right / -1 left), phase (walk cycle), moving, sleep, blink, held, happy, lift, sx, sy, seed }
function drawDog(g, lv, x, y, size, o) {
  const P = PUPS[lv], t = o.t || 0;
  const k = Math.max(0.2, Math.round(size * (typeof DPR === 'number' ? DPR : 1) / 120 * 8) / 8);
  const parts = dogParts(lv, k), G = parts.G, s = size / 120;
  const legAmp = o.moving ? 0.5 : 0;
  let A = Math.sin(o.phase || 0) * legAmp, bob = o.moving ? -Math.abs(Math.sin(o.phase || 0)) * 2.4 : Math.sin(t * 2.4 + (o.seed || 0)) * 0.4;
  let lBF = A, lFF = -A, lBN = -A, lFN = A, head = Math.sin(t * 0.8 + (o.seed || 0)) * 0.05, headDy = 0, dy = 0;
  if (o.held) { const d = Math.sin(t * 7) * 0.22; lBF = d; lFF = -d; lBN = -d * 0.8; lFN = d * 0.8; head = 0.12; }
  if (o.sleep) { lFF = lFN = -1.4; lBF = lBN = 1.45; dy = 11 * P.leg * 0.9; head = 0.16; headDy = 1.5; bob = Math.sin(t * 1.6) * 0.5; }
  if (o.happy && !o.moving && !o.sleep) head += Math.sin(t * 9) * 0.06;
  const wagSpeed = o.happy ? 22 : o.moving ? 13 : o.held ? 16 : 6;
  const tail = o.sleep ? 0.55 : Math.sin(t * wagSpeed + (o.seed || 0)) * (o.happy ? 0.5 : 0.32);
  g.save();
  g.translate(x, y - (o.lift || 0));
  g.scale((o.face || 1) * (o.sx || 1), o.sy || 1);
  g.scale(s, s); g.translate(-60, -92 + bob + dy);
  const flap = Math.sin(t * (o.moving || o.held ? 9 : 4.5)) * 0.32;
  drawPart(g, parts.wingFar, -flap);
  drawPart(g, parts.tail, tail);
  drawPart(g, parts.legBF, lBF); drawPart(g, parts.legFF, lFF);
  drawPart(g, parts.body, 0);
  if (P.fx === 'jet') jetFlame(g, G, t, o);
  drawPart(g, parts.legBN, lBN); drawPart(g, parts.legFN, lFN);
  drawPart(g, parts.cape, Math.sin(t * 5 + (o.seed || 0)) * 0.035 - (o.moving ? 0.05 : 0));
  drawPart(g, parts.wingNear, flap);
  g.save(); g.translate(0, headDy);
  drawPart(g, parts.scarf, Math.sin(t * (o.moving ? 16 : 6) + (o.seed || 0)) * 0.1 + (o.moving ? 0.18 : 0) + head);
  drawPart(g, o.blink || o.sleep ? parts.headBlink : parts.head, head);
  g.restore();
  g.restore();
}
function jetFlame(g, G, t, o) {
  const f = 0.75 + Math.sin(t * 40) * 0.15 + Math.sin(t * 23) * 0.1, len = (o.moving || o.lift ? 14 : 8.5) * f;
  for (const dx of [-3.4, 3.4]) {
    const x = G.bodyCx - G.rx * 0.3 + dx, y = G.bodyCy - G.ry * 1.05 + 11;
    const gr = g.createLinearGradient(0, y, 0, y + len);
    gr.addColorStop(0, '#fffbe0'); gr.addColorStop(0.35, '#ffcf3a'); gr.addColorStop(0.8, 'rgba(255,90,30,0.8)'); gr.addColorStop(1, 'rgba(255,60,20,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 2.8, y); g.quadraticCurveTo(x, y + len * 1.2, x + 2.8, y); g.closePath(); g.fill();
  }
}

// Glows, sparkles and gadgets around a pup (CSS px). Called before (back) and after (front) the pup.
function sparkle(g, x, y, r, col, a) {
  g.globalAlpha = a; g.fillStyle = col; g.beginPath(); starPath(g, x, y, r, 0.28, 4, 0); g.fill(); g.globalAlpha = 1;
}
const auraCache = new Map();
function auraSprite(col) {
  let c = auraCache.get(col);
  if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, col); gr.addColorStop(0.45, col.replace(/[\d.]+\)$/, '0.35)')); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  auraCache.set(col, c);
  return c;
}
const AURA = ['', '', 'rgba(199,125,255,0.75)', 'rgba(255,197,49,0.8)'];
const GEO = [];
function headAt(lv, x, y, size, o) { const G = GEO[lv] || (GEO[lv] = geo(PUPS[lv])), s = size / 120; return { x: x + (G.hx - 60) * s * (o.face || 1), y: y - (o.lift || 0) + (G.hy - 92) * s, r: G.hr * s }; }
function drawDogFx(g, lv, x, y, size, o, front) {
  const P = PUPS[lv], t = o.t || 0, seed = o.seed || 0, cy = y - size * 0.36 - (o.lift || 0);
  if (!front) {
    if (P.tier >= 2) {
      const pulse = 1 + Math.sin(t * 3 + seed) * 0.08, r = size * (P.fx === 'legend' ? 0.95 : 0.7) * pulse;
      g.globalAlpha = P.fx === 'legend' ? 0.9 : 0.6; g.drawImage(auraSprite(AURA[P.tier]), x - r, cy - r, r * 2, r * 2); g.globalAlpha = 1;
    }
    if (P.fx === 'legend') {                       // turning light rays
      g.save(); g.translate(x, cy); g.rotate(t * 0.6); g.globalAlpha = 0.22; g.fillStyle = '#fff1a0';
      for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(0, 0); g.lineTo(size * 0.95, -size * 0.09); g.lineTo(size * 0.95, size * 0.09); g.closePath(); g.fill(); }
      g.restore(); g.globalAlpha = 1;
    }
    if (P.fx === 'disco') {                        // party lights on the grass
      const cols = ['#ff4fd8', '#29e3ff', '#ffe14f', '#7dff6b', '#ff7a3d'];
      for (let i = 0; i < 6; i++) {
        const a = t * 1.6 + i * Math.PI / 3, rx = size * 0.55, ry = size * 0.14;
        g.globalAlpha = 0.55; g.fillStyle = cols[i % 5]; g.beginPath(); ell(g, x + Math.cos(a) * rx, y + Math.sin(a) * ry, size * 0.06, size * 0.03); g.fill();
      }
      g.globalAlpha = 1;
    }
    if (P.fx === 'speed' && o.moving) {             // speed lines and an afterglow trail
      const f = o.face || 1;
      g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = Math.max(1.8, size * 0.025); g.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const yy = y - size * (0.15 + i * 0.12), off = ((t * 3.5 + i * 0.29) % 1) * size * 0.25, x0 = x - f * (size * 0.48 + off);
        g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 - f * size * (0.18 + (i % 2) * 0.1), yy); g.stroke();
      }
      g.globalAlpha = 0.25; g.fillStyle = '#ffd23f'; g.beginPath(); ell(g, x - f * size * 0.3, y - size * 0.3, size * 0.3, size * 0.12); g.fill(); g.globalAlpha = 1;
    }
    if (P.fx === 'orbit') orbit(g, x, cy, size, t, seed, false);
    return;
  }
  if (P.fx === 'orbit') orbit(g, x, cy, size, t, seed, true);
  if (P.fx === 'disco' && !o.sleep) {                // a little mirror ball floats over Disco's afro
    const h = headAt(lv, x, y, size, o), bx = h.x - (o.face || 1) * h.r * 0.1, by = h.y - h.r * 2.05 + Math.sin(t * 2 + seed) * h.r * 0.08, br = h.r * 0.32;
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by - br); g.lineTo(bx, by - br * 2.2); g.stroke();
    const bg = g.createRadialGradient(bx - br * 0.3, by - br * 0.3, br * 0.1, bx, by, br); bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#8e97b5');
    g.fillStyle = bg; g.beginPath(); ell(g, bx, by, br, br); g.fill();
    g.save(); g.beginPath(); ell(g, bx, by, br, br); g.clip();
    const cols = ['#ff4fd8', '#29e3ff', '#ffe14f', '#ffffff'];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { if ((i + j + Math.floor(t * 6)) % 3) continue; g.fillStyle = cols[(i * 3 + j) % 4]; g.fillRect(bx - br + i * br * 0.5, by - br + j * br * 0.5, br * 0.45, br * 0.45); }
    g.restore();
    sparkle(g, bx + br * 0.8, by - br * 0.6, br * 0.6 * (0.5 + 0.5 * Math.sin(t * 9)), '#ffffff', 0.9);
  }
  const n = P.fx === 'legend' ? 5 : P.tier >= 2 ? 3 : 0;
  const col = P.fx === 'smart' ? '#d9c2ff' : P.tier === 3 ? '#fff3b0' : '#f1dcff';
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.7 + i / n + seed * 0.13) % 1, a = (i * 2.4 + seed) % (Math.PI * 2);
    const px = x + Math.cos(a) * size * 0.45, py = cy + Math.sin(a) * size * 0.3 - ph * size * 0.25;
    sparkle(g, px, py, size * 0.06 * Math.sin(ph * Math.PI), col, Math.sin(ph * Math.PI));
  }
  if (P.fx === 'legend') {                         // rising golden embers
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.55 + i / 6 + seed * 0.07) % 1, px = x + Math.sin(i * 1.7 + t * 2) * size * 0.35, py = y - ph * size * 1.0;
      g.globalAlpha = (1 - ph) * 0.85; g.fillStyle = i % 2 ? '#ffd23f' : '#ff9a2e';
      g.beginPath(); ell(g, px, py, size * 0.025 * (1 - ph) + 1, size * 0.035 * (1 - ph) + 1); g.fill();
    }
    g.globalAlpha = 1;
  }
}
function orbit(g, x, cy, size, t, seed, front) {
  for (let i = 0; i < 2; i++) {
    const a = t * (1.3 + i * 0.5) + seed + i * Math.PI;
    const inFront = Math.sin(a) > 0;
    if (inFront !== front) continue;
    const px = x + Math.cos(a) * size * 0.62, py = cy + Math.sin(a) * size * 0.16 - size * 0.05;
    const r = size * (i ? 0.055 : 0.075);
    g.fillStyle = i ? '#ff9f5a' : '#7fe3ff'; g.beginPath(); ell(g, px, py, r, r); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); ell(g, px - r * 0.3, py - r * 0.3, r * 0.35, r * 0.25); g.fill();
    if (!i) { g.strokeStyle = '#e9f6ff'; g.lineWidth = Math.max(1, size * 0.012); g.beginPath(); ell(g, px, py, r * 1.7, r * 0.45, -0.3); g.stroke(); }
  }
}

// A still pup for icons and the Pup Book (cached).
const stillCache = new Map();
function dogStill(lv, px) {
  px = Math.max(16, Math.round(px));
  const key = lv + ':' + px;
  let c = stillCache.get(key);
  if (c) return c;
  if (stillCache.size > 80) stillCache.clear();
  c = document.createElement('canvas'); c.width = c.height = px;
  const d = typeof DPR === 'number' ? DPR : 1, g = c.getContext('2d'), sz = px * 0.84 / d;
  g.scale(d, d);
  const css = px / d;
  drawDog(g, lv, css / 2, css * 0.9, sz, { t: 0, face: 1, phase: 0 });
  stillCache.set(key, c);
  return c;
}
function dogSilhouette(lv, px) {
  px = Math.max(16, Math.round(px));
  const key = 's' + lv + ':' + px;
  let c = stillCache.get(key);
  if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = px;
  const g = c.getContext('2d');
  g.drawImage(dogStill(lv, px), 0, 0);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = '#0d1420'; g.fillRect(0, 0, px, px);
  stillCache.set(key, c);
  return c;
}
