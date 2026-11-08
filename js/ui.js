'use strict';
// Pup Evolution - layout for any aspect ratio (9:32 to 32:9), HUD, buttons, banners, the tutorial. Crisp at any density.

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1, LAYOUT = null;
const FONT = '"Arial Rounded MT Bold", "Trebuchet MS", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const COL = { text: '#ffffff', dim: '#c9d3e6', gold: '#ffd23f', good: '#9dff7a', ink: 'rgba(12,10,30,0.85)' };
// button colours: face top, face bottom, side (lip), outline
const BTN = {
  adopt: ['#86f56f', '#2fb44a', '#1f8035', '#0e4a1c'], free: ['#c09cff', '#7445ea', '#5029b3', '#29125f'],
  shop: ['#ffd463', '#f58d1a', '#b85f08', '#663300'], book: ['#78d6ff', '#2a82e0', '#1a56a3', '#0b2c5c'],
  plain: ['#97a3c0', '#5b6886', '#3c4560', '#1c2133'], off: ['#a9afbd', '#767e8d', '#555b69', '#2a2e37'],
  gold: ['#ffe98a', '#f2ad1f', '#b57600', '#5a3a00'], zoom: ['#ff9cf0', '#ff3fa8', '#b81f72', '#5c0a36'],
  adoptWait: ['#6fa86a', '#3f7a45', '#2c5a31', '#15321a'],   // Adopt while saving up: still green, just quieter

};

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  if (w <= 0 || h <= 0) return;                    // Android first loads in a hidden 0x0 view: wait for a real size
  DPR = Math.min(window.devicePixelRatio || 1, 3);
  W = w; H = h;
  canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const old = LAYOUT ? LAYOUT.field : { x: 0, y: 0, w: 400, h: 600 };   // pups placed before the first real size move in
  LAYOUT = computeLayout();
  if (old && S.save) remapRanch(old, LAYOUT.field);
  draw();                                          // keep state, just redraw
}

function computeLayout() {
  const portrait = H >= W * 0.95;
  const m = Math.min(W, H), unit = clamp(m / 12, 28, 180);
  const pad = Math.max(8, Math.round(unit * 0.2));
  let btnH = clamp(Math.round(unit * 1.25), 54, 156);
  const r1 = clamp(Math.round(unit * 1.0), 34, 120), r2 = clamp(Math.round(unit * 0.72), 26, 86);
  const hud = { h: r1 + r2 + pad, r1, r2 };
  let field, panel, buttons;
  if (portrait) {
    const panelH = btnH * 2 + pad * 3.4;
    panel = { x: 0, y: H - panelH, w: W, h: panelH };
    const band = clamp(H * 0.06, 20, 96);
    field = { x: 0, y: hud.h + band, w: W, h: Math.max(60, panel.y - hud.h - band) };
    const bw = Math.min(W - pad * 2, Math.max(600, unit * 8)), bx = (W - bw) / 2, by = panel.y + pad * 1.3, third = (bw - pad * 2) / 3;
    buttons = {
      adopt: { x: bx, y: by, w: bw, h: btnH },
      free: { x: bx, y: by + btnH + pad, w: third, h: btnH },
      shop: { x: bx + third + pad, y: by + btnH + pad, w: third, h: btnH },
      book: { x: bx + (third + pad) * 2, y: by + btnH + pad, w: third, h: btnH },
    };
    hud.w = W;
  } else {
    const panelW = clamp(Math.round(W * 0.26), 180, Math.max(380, unit * 6));
    panel = { x: W - panelW, y: 0, w: panelW, h: H };
    const need = btnH * 4.3 + pad * 5;
    if (need > H) btnH = Math.max(44, (H - pad * 5) / 4.3);
    const adoptH = btnH * 1.3, total = adoptH + btnH * 3 + pad * 3, py = Math.max(pad, (H - total) / 2);
    const bx = panel.x + pad * 1.3, bw = panelW - pad * 2.3;
    buttons = {
      adopt: { x: bx, y: py, w: bw, h: adoptH },
      shop: { x: bx, y: py + adoptH + pad, w: bw, h: btnH },
      book: { x: bx, y: py + adoptH + btnH + pad * 2, w: bw, h: btnH },
      free: { x: bx, y: py + adoptH + btnH * 2 + pad * 3, w: bw, h: btnH },
    };
    const band = clamp(H * 0.08, 16, 96);
    field = { x: 0, y: hud.h + band, w: W - panelW, h: Math.max(60, H - hud.h - band) };
    hud.w = W - panelW;
  }
  const dog = clamp(Math.sqrt(field.w * field.h / (14 * 2.3)), 50, Math.max(50, Math.min(Math.max(150, unit * 2.4), field.h * 0.36, field.w * 0.32)));
  const coinS = r1 * 0.86;
  const zw = Math.min(hud.w * 0.38, 270), zh = Math.max(18, r2 * 0.66), y2 = pad * 0.6 + r1 + r2 / 2 + 2;
  return { portrait, unit, pad, hud, field, panel, buttons, dog, btnH,
    coinAt: { x: pad * 0.5 + coinS / 2, y: pad * 0.6 + r1 / 2 },
    music: { x: hud.w - pad - r1 * 0.92, y: pad * 0.6 + r1 * 0.04, w: r1 * 0.92, h: r1 * 0.92 },
    reset: { x: hud.w - pad * 1.5 - r1 * 1.84, y: pad * 0.6 + r1 * 0.04, w: r1 * 0.92, h: r1 * 0.92 },   // testing only
    meter: { x: hud.w - pad - zw, y: y2 - zh / 2, w: zw, h: zh } };
}

// ---------- drawing helpers ----------
function rrPath(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); else g.rect(x, y, w, h); }
function font(size, weight) { return `${weight || 800} ${Math.round(size)}px ${FONT}`; }
function fitSize(s, size, maxW, weight) { ctx.font = font(size, weight); const w = ctx.measureText(s).width; return w > maxW ? Math.max(8, size * maxW / w) : size; }
function outlinedText(g, s, x, y, size, fill, stroke, align, weight) {
  g.font = font(size, weight); g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = Math.max(2.5, size * 0.2); g.strokeText(s, x, y); }
  g.fillStyle = fill || COL.text; g.fillText(s, x, y);
}
function fitText(s, x, y, size, maxW, fill, stroke, align, weight) { outlinedText(ctx, s, x, y, fitSize(s, size, maxW, weight), fill, stroke, align, weight); }
function wrapLines(s, size, maxW, weight) {
  ctx.font = font(size, weight); const words = s.split(' '), lines = []; let line = '';
  for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = wd; } else line = t; }
  if (line) lines.push(line);
  return lines;
}
function wrapText(s, x, y, size, maxW, fill, stroke, weight, maxLines) {
  let lines = wrapLines(s, size, maxW, weight);
  while (lines.length > (maxLines || 3) && size > 11) { size *= 0.9; lines = wrapLines(s, size, maxW, weight); }
  const lh = size * 1.25, y0 = y - (lines.length - 1) * lh / 2;
  lines.forEach((ln, i) => fitText(ln, x, y0 + i * lh, size, maxW, fill, stroke, 'center', weight || 700));
  return lines.length * lh;
}
function pill(x, y, w, h, fill) { ctx.fillStyle = fill || COL.ink; rrPath(ctx, x, y, w, h, h / 2); ctx.fill(); }
// HUD plate: dark glassy pill with a light rim
function plate(x, y, w, h, rim) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; rrPath(ctx, x, y + 2.5, w, h, h / 2); ctx.fill();
  const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(38,30,78,0.86)'); gr.addColorStop(1, 'rgba(16,12,40,0.9)');
  ctx.fillStyle = gr; rrPath(ctx, x, y, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = rim || 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2; rrPath(ctx, x + 1, y + 1, w - 2, h - 2, h / 2 - 1); ctx.stroke();
}
// Chunky game button: dark outline, side lip, gradient face, gloss, inner rim; pressed buttons sink; ready ones shine.
function button(b, label, sub, style, enabled, opts) {
  opts = opts || {};
  const c = BTN[enabled ? style : 'off'], down = S.press === opts.name && enabled;
  const lip = Math.max(4, Math.round(b.h * 0.085)), h = b.h - lip, sink = down ? lip * 0.75 : 0, y = b.y + sink;
  const r = Math.min(h * 0.32, 24);
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; rrPath(ctx, b.x + 2, b.y + lip + 4, b.w, h, r); ctx.fill();
  ctx.fillStyle = c[3]; rrPath(ctx, b.x - 2, y - 2, b.w + 4, h + lip - sink + 4, r + 2); ctx.fill();
  ctx.fillStyle = c[2]; rrPath(ctx, b.x, y + lip - sink, b.w, h, r); ctx.fill();
  const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
  ctx.fillStyle = gr; rrPath(ctx, b.x, y, b.w, h, r); ctx.fill();
  ctx.save(); rrPath(ctx, b.x, y, b.w, h, r); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.24)'; ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, y - h * 0.18, b.w * 0.7, h * 0.62, 0, 0, Math.PI * 2); ctx.fill();
  if (enabled && opts.shine) {                      // a light sweep every few seconds says "you can buy this"
    const k = ((S.t * 0.55 + (opts.seed || 0)) % 2.4) / 1.0;
    if (k < 1) {
      const sx = b.x - b.w * 0.3 + (b.w * 1.6) * k;
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath();
      ctx.moveTo(sx, y); ctx.lineTo(sx + h * 0.45, y); ctx.lineTo(sx + h * 0.05, y + h); ctx.lineTo(sx - h * 0.4, y + h); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; rrPath(ctx, b.x + 2, y + 2, b.w - 4, h - 4, r - 2); ctx.stroke();
  let tx = b.x + b.w / 2, maxW = b.w - 16;
  const iconS = Math.min(h * 0.58, 46);
  if (opts.icon || opts.dog) {
    const ix = b.x + Math.max(10, h * 0.16) + iconS / 2, iy = y + h / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.arc(ix, iy, iconS * 0.62, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.arc(ix, iy - iconS * 0.06, iconS * 0.55, 0, Math.PI * 2); ctx.fill();
    if (opts.dog) { const ds = iconS * 1.55; ctx.drawImage(dogStill(opts.dog, ds * DPR), ix - ds / 2, iy - ds * 0.58, ds, ds); }
    else icon(ctx, opts.icon, ix, iy, iconS * 0.72, '#ffffff');
    const used = (ix - b.x) + iconS * 0.62 + 4;
    tx = b.x + used + (b.w - used) / 2; maxW = b.w - used - 10;
  }
  const stroke = c[3], tc = enabled ? '#ffffff' : '#eef0f4';
  if (sub) {
    fitText(label, tx, y + h * 0.36, Math.max(15, h * 0.31), maxW, tc, stroke, 'center', 900);
    const ss = Math.max(13, h * 0.25), sy = y + h * 0.72;
    if (opts.subCoin) {
      const sw = fitSize(sub, ss, maxW - ss - 14, 900); ctx.font = font(sw, 900);
      const tw = ctx.measureText(sub).width, pw = tw + ss + 18, x0 = tx - pw / 2;
      pill(x0, sy - ss * 0.68, pw, ss * 1.36, 'rgba(0,0,0,0.28)');
      icon(ctx, 'coin', x0 + ss * 0.5 + 4, sy, ss * 1.05);
      outlinedText(ctx, sub, x0 + ss + 9, sy + 1, sw, opts.subCol || '#fff6c2', stroke, 'left', 900);
    } else fitText(sub, tx, sy, ss * 0.92, maxW, opts.subCol || '#f2f4ff', stroke, 'center', 800);
  } else fitText(label, tx, y + h / 2, Math.max(15, h * 0.34), maxW, tc, stroke, 'center', 900);
  if (opts.badge) {
    const bx = b.x + b.w - 6, by = b.y + 6, br = Math.max(8, h * 0.14), bounce = Math.abs(Math.sin(S.t * 4)) * 2;
    ctx.fillStyle = '#ff2f55'; ctx.beginPath(); ctx.arc(bx, by - bounce, br, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke();
    outlinedText(ctx, '!', bx, by - bounce + 1, br * 1.3, '#ffffff', null, 'center', 900);
  }
}

// ---------- main draw ----------
function draw() {
  if (!W || !H || !LAYOUT) return;
  const L = LAYOUT;
  if (S.phase === 'loading' || !S.save) { drawLoading(); return; }
  const zfx = S.zoomFx != null ? S.t - S.zoomFx : 9, shake = zfx < 0.45 ? (1 - zfx / 0.45) * Math.min(W, H) * 0.012 : 0;
  if (shake) { ctx.save(); ctx.translate((Math.random() * 2 - 1) * shake, (Math.random() * 2 - 1) * shake); }   // ZOOMIES kick
  drawRanch(ctx);
  if (shake) ctx.restore();
  if (zfx < 0.35) { ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - zfx / 0.35)})`; ctx.fillRect(0, 0, W, H); }   // and a flash
  drawHud();
  const hits = [];
  drawButtons(hits);
  if (S.banner) drawBanner();
  drawTutorial();
  if (S.toast && S.t < S.toast.until) drawToast(S.toast.text);
  S.hit = hits;
  if (S.modal) drawModal();
  if (S.tutCheer) drawCheer();                       // above cards too (the shop step ends inside the shop)
  if (S.paused) {
    ctx.fillStyle = 'rgba(8,12,20,0.72)'; ctx.fillRect(0, 0, W, H);
    outlinedText(ctx, 'Paused', W / 2, H / 2, Math.max(28, L.unit * 1.1), '#ffffff', 'rgba(0,0,0,0.6)');
  }
}
function drawLoading() {
  const g = ctx;
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#5ec4ff'); gr.addColorStop(0.55, '#bdeaff'); gr.addColorStop(0.56, '#8fd65b'); gr.addColorStop(1, '#5fb83a');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const sz = Math.min(W, H) * 0.34, t = performance.now() / 1000;
  g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(W / 2, H * 0.62, sz * 0.3, sz * 0.07, 0, 0, Math.PI * 2); g.fill();
  drawDog(g, 1, W / 2, H * 0.62, sz, { t, face: 1, phase: t * 9, moving: true, seed: 1, happy: true });
  const ts = Math.max(28, Math.min(W * 0.1, 64));
  outlinedText(g, 'Pup Evolution', W / 2, H * 0.24, ts, '#ffe14f', '#5a2d00', 'center', 900);
  outlinedText(g, 'Loading the ranch...', W / 2, H * 0.73, Math.max(15, Math.min(W, H) * 0.04), '#ffffff', 'rgba(0,0,0,0.45)', 'center', 700);
}
function drawHud() {
  const L = LAYOUT, sv = S.save, pad = L.pad, hd = L.hud;
  // coins
  const r1 = hd.r1, coinS = r1 * 0.86, cy = pad * 0.6 + r1 / 2;
  const coinsTxt = fmt(sv.coins), cs = Math.max(20, r1 * 0.62);
  ctx.font = font(cs, 900);
  const cw = Math.min(ctx.measureText(coinsTxt).width, hd.w * 0.5);
  plate(pad * 0.5 + coinS * 0.45, pad * 0.6 + r1 * 0.12, coinS * 0.55 + cw + pad * 1.8, r1 * 0.76, 'rgba(255,210,63,0.55)');
  icon(ctx, 'coin', L.coinAt.x, cy, coinS);
  fitText(coinsTxt, pad * 0.5 + coinS + pad * 0.4, cy + 1, cs, hd.w * 0.5, '#ffffff', '#1a1236', 'left', 900);
  // income (merge bonus stays hidden: owner, 2026-11-06)
  const r2 = hd.r2, y2 = pad * 0.6 + r1 + r2 / 2 + 2, ts = Math.max(13, r2 * 0.56);
  const ti = totalIncome(), inc = `+${ti < 10 ? (Math.floor(ti * 10) / 10).toString() : fmt(ti)}/s`;
  ctx.font = font(ts, 900); const iw = ctx.measureText(inc).width;
  const hot = S.zoomLeft > 0 || sv.boostS > 0 || S.luckyN > 0;
  plate(pad * 0.5, y2 - r2 * 0.42, iw + pad * 1.8, r2 * 0.84, hot ? 'rgba(255,225,79,0.7)' : null);
  outlinedText(ctx, inc, pad * 0.5 + pad * 0.9, y2 + 1, ts, hot ? '#ffe14f' : COL.good, '#0d0a24', 'left', 900);
  // Lucky Merge stacks
  let chipY = y2 + r2 * 0.5 + 4;
  if (S.luckyN) {
    const left = S.luckyLeft, txt = `LUCKY x${fmt(luckyMult())}`, chs = Math.max(12, r2 * 0.48);
    ctx.font = font(chs, 900); const tw = ctx.measureText(txt).width, chw = tw + chs * 2.4, chh = chs * 1.6;
    const pulse = 1 + Math.sin(S.t * 8) * 0.03;
    ctx.save(); ctx.translate(pad * 0.5, chipY); ctx.scale(pulse, pulse);
    ctx.fillStyle = '#1d6b1a'; rrPath(ctx, 0, 0, chw, chh, chh / 2); ctx.fill();
    ctx.fillStyle = '#3fcf3a'; rrPath(ctx, 0, 0, chw * clamp(left / luckyWindow(), 0, 1), chh, chh / 2); ctx.fill();
    ctx.strokeStyle = '#c9ffb8'; ctx.lineWidth = 2; rrPath(ctx, 1, 1, chw - 2, chh - 2, chh / 2); ctx.stroke();
    icon(ctx, 'clover', chs * 0.85, chh / 2, chs * 1.1);
    outlinedText(ctx, txt, chs * 1.6, chh / 2 + 1, chs, '#ffffff', '#0d3d0b', 'left', 900);
    ctx.restore();
  }
  // music toggle (music only; YouTube's mute still silences everything)
  const mu = L.music;
  plate(mu.x, mu.y, mu.w, mu.h);
  icon(ctx, sv.music ? 'music' : 'musicOff', mu.x + mu.w / 2, mu.y + mu.h / 2, mu.h * 0.52, '#ffffff');
  // ZOOMIES meter
  const z = L.meter, zh = z.h;
  const full = S.zoomLeft > 0, k = full ? S.zoomLeft / zoomDur() : Math.min(1, sv.zoom / zoomNeed());
  plate(z.x - zh * 1.25, z.y - 4, z.w + zh * 1.25 + 4, zh + 8, full ? `hsla(${(S.t * 300) % 360},100%,70%,0.9)` : null);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rrPath(ctx, z.x, z.y, z.w, zh, zh / 2); ctx.fill();
  if (k > 0) {
    const zg = ctx.createLinearGradient(z.x, 0, z.x + z.w, 0);
    if (full) { const h = (S.t * 300) % 360; zg.addColorStop(0, `hsl(${h},100%,62%)`); zg.addColorStop(1, `hsl(${(h + 120) % 360},100%,62%)`); }
    else { zg.addColorStop(0, '#ff9a2e'); zg.addColorStop(1, '#ffe14f'); }
    ctx.fillStyle = zg; rrPath(ctx, z.x, z.y, Math.max(zh, z.w * k), zh, zh / 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; rrPath(ctx, z.x + 3, z.y + 2, Math.max(zh, z.w * k) - 6, zh * 0.32, zh * 0.16); ctx.fill();
  }
  const boltS = zh * 1.25 * (k > 0.85 && !full ? 1 + Math.sin(S.t * 10) * 0.08 : 1);
  icon(ctx, 'bolt', z.x - zh * 0.55, z.y + zh / 2, boltS, '#ffe14f');
  const zl = full ? (S.luckyN ? `ZOOMIES ${Math.ceil(S.zoomLeft)}s  LUCKY HOLD` : `ZOOMIES ${Math.ceil(S.zoomLeft)}s`) : sv.boostS > 0 ? `x2 COINS ${Math.floor(sv.boostS / 60)}:${String(Math.floor(sv.boostS % 60)).padStart(2, '0')}` : 'ZOOMIES';
  fitText(zl, z.x + z.w / 2, z.y + zh / 2 + 1, zh * 0.7, z.w - 8, '#ffffff', '#120c2e', 'center', 900);
  if (full && S.zoomCoins > 0) {                     // the ZOOMIES haul so far, counting up under the bar
    const hs = zh * (0.78 + 0.06 * Math.sin(S.t * 14));
    outlinedText(ctx, '+' + fmt(S.zoomCoins), z.x + z.w / 2, z.y + zh * 1.75, hs, '#ffe14f', '#3a2200', 'center', 900);
  }
  S.hudHit = [[mu, () => { sv.music = sv.music ? 0 : 1; SFX.setMusic(!!sv.music); S.dirty = true; }]];
  if (canReset()) {                                  // testing: start a new playthrough (hidden on YouTube)
    const rb = L.reset;
    plate(rb.x, rb.y, rb.w, rb.h, 'rgba(255,120,120,0.6)');
    icon(ctx, 'reset', rb.x + rb.w / 2, rb.y + rb.h / 2, rb.h * 0.52, '#ffffff');
    S.hudHit.push([rb, () => { SFX.click(); openModal({ type: 'reset' }); }]);
  }
}
function drawButtons(hits) {
  const B = LAYOUT.buttons, sv = S.save, cost = adoptCost(), canAdopt = sv.coins >= cost;
  button(B.adopt, `Adopt ${PUPS[adoptLevel()].name}`, fmt(cost), canAdopt ? 'adopt' : 'adoptWait', true,
    { name: 'adopt', dog: adoptLevel(), subCoin: true, subCol: canAdopt ? '#fff6c2' : '#ffb3b3', shine: canAdopt });
  hits.push(['adopt', B.adopt]);
  if (yt) {
    const ready = freePupReady() && !S.adBusy, left = Math.ceil((sv.freePupAt - Date.now()) / 1000);
    const sub = !freePupUnlocked() ? 'soon' : ready ? `${PUPS[Math.min(adoptLevel() + 1, MAX_LEVEL)].name}` : `${Math.floor(left / 60)}:${String(Math.max(left, 0) % 60).padStart(2, '0')}`;
    button(B.free, 'Free pup', sub, 'free', ready, { name: 'free', icon: 'play', shine: true, seed: 0.7 });
    if (ready) hits.push(['free', B.free]);
  } else button(B.free, 'Free pup', 'on YouTube', 'free', false, { name: 'free', icon: 'play' });
  const affordable = UPGRADES.some(u => upLevel(u.id) < u.max && sv.coins >= upCost(u));
  button(B.shop, 'Shop', 'upgrades', 'shop', true, { name: 'shop', icon: 'shop', badge: affordable && sv.tut >= TUT.SHOP });
  hits.push(['shop', B.shop]);
  const found = sv.found.reduce((a, b) => a + b, 0);
  button(B.book, 'Pup Book', `${found}/${MAX_LEVEL}`, 'book', true, { name: 'book', icon: 'book' });
  hits.push(['book', B.book]);
}
function drawBanner() {
  const b = S.banner, k = (S.t - b.t0) / 1.8;
  if (k >= 1) { S.banner = null; return; }
  const pop = k < 0.15 ? k / 0.15 : 1, a = k > 0.8 ? (1 - k) / 0.2 : 1, f = LAYOUT.field;
  const size = Math.min(W * 0.14, 84) * (0.6 + 0.4 * pop + Math.sin(S.t * 20) * 0.02);
  ctx.globalAlpha = a;
  const hue = (S.t * 400) % 360;
  outlinedText(ctx, b.text, f.x + f.w / 2, f.y + f.h * 0.35, size * (b.gold ? 1.1 : 1), b.gold ? `hsl(${44 + Math.sin(S.t * 12) * 6},100%,${60 + Math.sin(S.t * 12) * 8}%)` : `hsl(${hue},100%,62%)`, 'rgba(20,10,40,0.9)', 'center', 900);
  if (b.sub) fitText(b.sub, f.x + f.w / 2, f.y + f.h * 0.35 + size * 0.75, Math.max(14, size * 0.28), f.w - 20, '#ffffff', 'rgba(0,0,0,0.75)');
  ctx.globalAlpha = 1;
}

// ---------- tutorial: one step at a time, each finished by doing it ----------
function tutPair() {
  let best = null, bd = Infinity;
  for (let i = 0; i < S.dogs.length; i++) for (let j = i + 1; j < S.dogs.length; j++) {
    const a = S.dogs[i], b = S.dogs[j];
    if (!canMerge(a, b) || a.arrive || b.arrive) continue;
    const d = Math.hypot(a.x - b.x, a.y - b.y) + a.lv * 1e4;
    if (d < bd) { bd = d; best = [a, b]; }
  }
  return best;
}
// What the current step shows and what it lets you touch. gate: null = no limits; else { field, buttons: [...] }.
function tutStep() {
  const sv = S.save, st = sv.tut, L = LAYOUT, B = L.buttons, n = S.tutCount;
  const btnHand = (b) => ({ x: b.x + b.w * 0.72, y: b.y + b.h * 0.55, tap: true });
  const ring = (x, y, r) => ({ x, y, r });
  if (st === TUT.MERGE || st === TUT.MERGE2) {
    const pr = tutPair();
    if (!pr) return { title: 'One more pup', text: 'Adopt one more pup to make a pair of twins.', spot: B.adopt, hand: btnHand(B.adopt), gate: { field: true, buttons: ['adopt'] } };
    const [a, b] = pr, sa = dogSize(a.lv);
    return { title: st === TUT.MERGE ? 'Merge twins' : 'Merge again', text: st === TUT.MERGE ? 'Drag one Pebble onto the other Pebble.' : 'Two new Pebbles! Drag one onto the other.',
      holes: [ring(a.x, a.y - sa * 0.35, sa * 0.62), ring(b.x, b.y - sa * 0.35, sa * 0.62)], merge: pr, gate: { field: true, buttons: [] } };
  }
  if (st === TUT.PET) {
    const d = S.dogs.find(x => !x.arrive); if (!d) return null;
    const sz = dogSize(d.lv);
    return { title: 'Tap for coins', text: `Tap a pup to get 1 second of its coins. Tap again every second! (${Math.min(n, 3)}/3)`,
      holes: [ring(d.x, d.y - sz * 0.38, sz * 0.68)], hand: { x: d.x + sz * 0.05, y: d.y - sz * 0.32, tap: true }, gate: { field: true, buttons: [] } };
  }
  if (st === TUT.ADOPT) return { title: 'Adopt pups', text: `Pups earn coins every second. Spend them: tap Adopt! (${Math.min(n, 2)}/2)`, spot: B.adopt, hand: btnHand(B.adopt), gate: { field: true, buttons: ['adopt'] } };
  if (st === TUT.DROP) {
    const b = S.drops.find(x => x.tut); if (!b) return null;
    const p = dropPos(b), r = Math.max(14, L.dog * 0.17);
    return { title: 'Cash drops', text: 'Pups drop coins now and then. Tap the coin to grab it!', holes: [ring(p.x, p.y - r, r * 2.4)], hand: { x: p.x + 4, y: p.y - r * 0.6, tap: true }, gate: { field: true, buttons: [] } };
  }
  if (st === TUT.CRATE) {
    const c = S.crates[0]; if (!c) return null;
    const s = dogSize(c.lv), landed = crateDrop(c) >= 1;
    return { title: 'Free crates', text: 'A crate is falling from the sky. Tap it to open it!', holes: landed ? [ring(c.x, c.y - s * 0.3, s * 0.75)] : null,
      hand: landed ? { x: c.x + 4, y: c.y - s * 0.3, tap: true } : null, gate: { field: true, buttons: [] } };
  }
  if (st === TUT.ZOOM) return { title: 'ZOOMIES!', text: "Playing fills this meter. When it's full, pups go wild: x3 coins, and twins merge by themselves!", spot: L.meter, meter: true, btn: 'Try it now!', gate: { field: false, buttons: [] } };
  // the free ZOOMIES plays out first (v1.1 playtest: the shop step started at once and the ranch was locked while it ran)
  if (st === TUT.SHOP && S.zoomLeft > 0) return { watch: true, gate: { field: true, buttons: [] } };
  if (st === TUT.SHOP) return { title: 'Upgrades', text: S.tutGift ? `Here's a gift of ${fmt(S.tutGift)} coins. Open the Shop and buy your first upgrade!` : 'Open the Shop and buy your first upgrade!', spot: B.shop, hand: btnHand(B.shop), gate: { field: false, buttons: ['shop'] } };
  if (st === TUT.BOOK) return { title: 'Pup Book', text: 'Every new pup you make is saved here. Can you find all 15?', spot: B.book, hand: btnHand(B.book), gate: { field: false, buttons: ['book'] } };
  return null;
}
function drawTutorial() {
  S.tutHit = null; S.tutGate = null;
  const sv = S.save, st = sv.tut, L = LAYOUT, f = L.field, t = S.t;
  if (st >= TUT.DONE || S.modal) return;
  const s = tutStep(); if (!s) return;
  S.tutGate = s.gate;                                // the gate applies during the "Nice!" pause too
  if (s.watch || t < S.tutT || (S.drag && S.drag.moved)) return;
  const appear = Math.min(1, (t - S.tutT) / 0.3);
  // spotlight: dim the screen, leave the target clear (buttons: a rounded box; ranch things: soft circles)
  if (s.spot || s.holes) {
    ctx.save(); ctx.globalAlpha = appear;
    ctx.fillStyle = s.spot ? 'rgba(6,10,28,0.55)' : 'rgba(6,10,28,0.38)'; ctx.beginPath(); ctx.rect(0, 0, W, H);
    const p = 6, ext = s.meter ? s.spot.h * 1.35 : 0;
    if (s.spot) { ctx.moveTo(s.spot.x - p - ext, s.spot.y - p); ctx.lineTo(s.spot.x - p - ext, s.spot.y + s.spot.h + p); ctx.lineTo(s.spot.x + s.spot.w + p, s.spot.y + s.spot.h + p); ctx.lineTo(s.spot.x + s.spot.w + p, s.spot.y - p); ctx.closePath(); }
    for (const h of s.holes || []) { ctx.moveTo(h.x + h.r, h.y); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2, true); }
    ctx.fill('evenodd');
    const pulse = 0.55 + 0.45 * Math.sin(t * 6);
    ctx.strokeStyle = `rgba(255,225,79,${pulse})`; ctx.lineWidth = 3.5;
    if (s.spot) { rrPath(ctx, s.spot.x - p - ext, s.spot.y - p, s.spot.w + p * 2 + ext, s.spot.h + p * 2, 14); ctx.stroke(); }
    for (const h of s.holes || []) { ctx.beginPath(); ctx.arc(h.x, h.y, h.r * (1 + 0.04 * Math.sin(t * 6)), 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  // the merge demo: a see-through pup rides the glove from one twin to the other
  let hand = s.hand ? { ...s.hand, y: s.hand.y + (s.hand.tap ? Math.sin(t * 6) * 4 : 0) } : null;
  if (s.merge) {
    const [a, b] = s.merge, sa = dogSize(a.lv), k = (t % 2.1) / 1.5, kk = Math.min(k, 1), e = kk * kk * (3 - 2 * kk);
    const gx = a.x + (b.x - a.x) * e, gy = a.y + (b.y - a.y) * e - sa * 0.12 * Math.sin(Math.PI * kk);
    if (k <= 1) { ctx.globalAlpha = 0.55; drawDog(ctx, a.lv, gx, gy, sa * 1.05, { t, face: b.x >= a.x ? 1 : -1, held: true, seed: a.seed }); ctx.globalAlpha = 1; }
    else { const q = (k - 1) / 0.4; ctx.globalAlpha = Math.max(0, 1 - q); ctx.strokeStyle = '#7dff6b'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(b.x, b.y - sa * 0.35, sa * (0.4 + q * 0.5), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    hand = { x: gx, y: gy - sa * 0.3, alpha: k <= 1 ? 1 : 0.35, drag: true, from: { x: a.x, y: a.y - sa * 0.35 } };
  }
  drawCoach(s, hand, appear);
  if (hand) drawHand(hand.x, hand.y, Math.max(34, L.dog * S.crowdK * 0.5), (hand.alpha == null ? 1 : hand.alpha) * appear, hand);
}
// The coach card: Pebble (alive, blinking), a title, the instruction, progress dots. It always sits at the bottom of the
// ranch, just above the buttons (owner, v0.9: it used to jump between top and bottom); during the tutorial pups, crates and
// cash drops stay above it (walkBox in ranch.js).
function coachFont() { return Math.max(14, Math.min(LAYOUT.unit * 0.42, 22)); }
function coachBand() { return coachFont() * 7.6 + LAYOUT.pad * 2; }   // room for the tallest card (3 lines) plus a gap
function drawCoach(s, hand, appear) {
  const L = LAYOUT, f = L.field, t = S.t, st = S.save.tut;
  const fs = coachFont(), cw = Math.min(f.w - L.pad * 2, 560), textX = fs * 5, textW = cw - textX - fs * 0.8;
  const lines = wrapLines(s.text, fs, textW, 800).length;
  const bH = Math.max(48, fs * 2.6);                 // "Try it now!" is a real touch target (it was 36 px on a 375 px phone)
  const ch = fs * 1.5 + fs * 0.9 + lines * fs * 1.25 + fs * 1.0 + (s.btn ? bH + fs * 0.6 : 0);
  const cx = f.x + (f.w - cw) / 2, cy = f.y + f.h - ch - L.pad;
  const sc = 0.85 + 0.15 * (1 - Math.pow(1 - appear, 3));
  ctx.save(); ctx.globalAlpha = appear; ctx.translate(cx + cw / 2, cy + ch / 2); ctx.scale(sc, sc); ctx.translate(-(cx + cw / 2), -(cy + ch / 2));
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; rrPath(ctx, cx, cy + 5, cw, ch, 20); ctx.fill();
  const bg = ctx.createLinearGradient(0, cy, 0, cy + ch); bg.addColorStop(0, '#fffdf6'); bg.addColorStop(1, '#fff1d2');
  ctx.fillStyle = bg; rrPath(ctx, cx, cy, cw, ch, 20); ctx.fill();
  ctx.strokeStyle = '#ffb020'; ctx.lineWidth = 3.5; rrPath(ctx, cx + 1.75, cy + 1.75, cw - 3.5, ch - 3.5, 18); ctx.stroke();
  // Pebble the coach, bobbing and blinking
  const mx = cx + fs * 2.5, my = cy + Math.min(ch, fs * 5.2) * 0.5, ms = fs * 4.1;
  const halo = ctx.createRadialGradient(mx, my, 0, mx, my, fs * 2.1); halo.addColorStop(0, '#ffe7a0'); halo.addColorStop(1, 'rgba(255,231,160,0)');
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(mx, my, fs * 2.1, 0, Math.PI * 2); ctx.fill();
  drawDog(ctx, 1, mx, my + ms * 0.42, ms, { t, face: 1, happy: true, seed: 3, blink: (t % 3.1) < 0.13, lift: Math.abs(Math.sin(t * 3)) * ms * 0.05 });
  // title, dots, instruction
  let y = cy + fs * 1.05;
  outlinedText(ctx, s.title, cx + textX, y, fs * 1.18, '#e07800', null, 'left', 900);
  y += fs * 0.95;
  for (let i = 0; i < 9; i++) { ctx.fillStyle = i < st ? '#ffb020' : i === st ? '#ff7a00' : 'rgba(150,110,40,0.25)'; ctx.beginPath(); ctx.arc(cx + textX + fs * 0.3 + i * fs * 0.78, y, i === st ? fs * 0.26 : fs * 0.2, 0, Math.PI * 2); ctx.fill(); }
  y += fs * 0.95;
  const ls = wrapLines(s.text, fs, textW, 800);
  ls.forEach((ln, i) => fitText(ln, cx + textX, y + i * fs * 1.25, fs, textW, '#3a2a14', null, 'left', 800));
  if (s.btn) {
    const bb = { x: cx + cw * 0.2, y: cy + ch - bH - fs * 0.4, w: cw * 0.6, h: bH };
    button(bb, s.btn, null, 'zoom', true, { name: 'tutbtn', icon: 'bolt', shine: true });
    const k = sc, ox = cx + cw / 2, oy = cy + ch / 2;
    S.tutHit = [[{ x: ox + (bb.x - ox) * k, y: oy + (bb.y - oy) * k, w: bb.w * k, h: bb.h * k }, () => tutorialZoomies()]];
  }
  ctx.restore();
}
function drawCheer() {                               // "Nice!" between steps, "You did it!" at the end
  const c = S.tutCheer, k = (S.t - c.t0) / c.dur;
  if (k >= 1) { S.tutCheer = null; return; }
  const f = LAYOUT.field;
  if (!c.fx) { c.fx = true; burst(f.x + f.w / 2, f.y + f.h * 0.38, c.sub ? 40 : 16, ['#ffd23f', '#ff5d8f', '#4db8ff', '#7ed957', '#ffffff'], LAYOUT.dog * 0.9, 'confetti'); }
  const pop = k < 0.18 ? 0.5 + 0.5 * Math.sin(k / 0.18 * Math.PI / 2) * 1.15 : 1, a = k > 0.8 ? (1 - k) / 0.2 : 1;
  const size = Math.min(W * (c.sub ? 0.13 : 0.12), c.sub ? 80 : 66) * pop;
  ctx.globalAlpha = a;
  outlinedText(ctx, c.text, f.x + f.w / 2, f.y + f.h * 0.38, size, '#ffe14f', '#6b3a00', 'center', 900);
  if (c.sub) fitText(c.sub, f.x + f.w / 2, f.y + f.h * 0.38 + size * 0.8, Math.max(16, size * 0.32), f.w - 24, '#ffffff', 'rgba(0,0,0,0.75)', 'center', 800);
  ctx.globalAlpha = 1;
}
function drawHand(x, y, s, alpha, h) {               // a white cartoon glove, fingertip at (x, y)
  ctx.save(); ctx.globalAlpha = alpha;
  if (h && h.drag && h.from) {                      // dotted path from the pup to its twin
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.setLineDash([4, 7]);
    ctx.beginPath(); ctx.moveTo(h.from.x, h.from.y); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
  }
  if (h && h.tap) { const k = (S.t * 1.6) % 1; ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, s * (0.15 + k * 0.45), 0, Math.PI * 2); ctx.stroke(); }
  ctx.translate(x, y); ctx.rotate(-0.42);
  const u = s / 10;
  const glove = () => {
    ctx.beginPath();
    ctx.moveTo(-1.3 * u, 0.6 * u);                 // index finger up to the tip
    ctx.lineTo(-1.3 * u, 4.5 * u);
    ctx.quadraticCurveTo(-1.3 * u, 6.3 * u, 0, 6.3 * u); ctx.quadraticCurveTo(1.3 * u, 6.3 * u, 1.3 * u, 4.5 * u);
    ctx.lineTo(1.3 * u, 0.6 * u);
    ctx.arc(0, 0.6 * u, 1.3 * u, 0, Math.PI, true);
    ctx.closePath();
    ctx.moveTo(-2.9 * u, 6.2 * u);                 // palm with curled fingers
    ctx.quadraticCurveTo(-3.4 * u, 4.6 * u, -1.9 * u, 4.4 * u);
    ctx.lineTo(3.4 * u, 4.6 * u); ctx.quadraticCurveTo(4.5 * u, 4.9 * u, 4.2 * u, 6.6 * u);
    ctx.lineTo(4.0 * u, 9.2 * u); ctx.quadraticCurveTo(3.6 * u, 11.6 * u, 0.8 * u, 11.6 * u);
    ctx.lineTo(-1.5 * u, 11.6 * u); ctx.quadraticCurveTo(-3.6 * u, 11.2 * u, -4.4 * u, 8.6 * u);
    ctx.quadraticCurveTo(-5.2 * u, 6.8 * u, -2.9 * u, 6.2 * u);
    ctx.closePath();
  };
  ctx.lineJoin = 'round';
  glove(); ctx.strokeStyle = '#1c1f2b'; ctx.lineWidth = Math.max(4, u * 1.3); ctx.stroke();
  glove(); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.strokeStyle = 'rgba(28,31,43,0.35)'; ctx.lineWidth = Math.max(1.2, u * 0.4);
  ctx.beginPath(); ctx.moveTo(1.4 * u, 7.6 * u); ctx.lineTo(3.6 * u, 7.6 * u); ctx.moveTo(1.4 * u, 9.4 * u); ctx.lineTo(3.4 * u, 9.4 * u); ctx.stroke();
  ctx.restore();
}
function drawToast(s, low) {
  const L = LAYOUT, size = Math.max(15, Math.min(L.unit * 0.45, 24)), f = L.field;
  const fs = fitSize(s, size, f.w - 48), w = Math.min((ctx.measureText(s).width) + 36, f.w - 16), h = size * 2.1;
  const y = low ? f.y + f.h - h - 10 : f.y + 8;
  ctx.fillStyle = 'rgba(10,14,24,0.85)'; rrPath(ctx, f.x + (f.w - w) / 2, y, w, h, h / 2); ctx.fill();
  outlinedText(ctx, s, f.x + f.w / 2, y + h / 2 + 1, fs, '#ffffff', null);
}
