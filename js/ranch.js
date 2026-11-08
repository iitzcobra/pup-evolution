'use strict';
// Pup Evolution - the living ranch: pups that wander, nap, hop and sprint; ZOOMIES pairing; parachute crates; cash drops;
// the golden biscuit; particles. Positions are presentation only: the rules in game.js only look at each pup's level.

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
function field() { return LAYOUT ? LAYOUT.field : { x: 0, y: 0, w: 400, h: 600 }; }
// No ranch limit: pups get a little smaller as the ranch fills (down to 55%), so a big ranch still fits the screen.
function crowdTarget() { const n = S.dogs.length + S.crates.length; return clamp(Math.sqrt(14 / Math.max(14, n)), 0.55, 1); }
function dogSize(lv) { return (LAYOUT ? LAYOUT.dog : 80) * PUPS[lv].size * S.crowdK; }
function walkBox(size) {                            // where a pup's feet may stand
  const f = field(), mx = Math.min(size * 0.45, f.w * 0.3);
  const y0 = f.y + Math.min(size * 0.7, f.h * 0.45);
  let bottom = f.y + f.h - Math.max(6, size * 0.06);
  if (LAYOUT && S.save && S.save.tut < TUT.DONE) bottom = Math.min(bottom, f.y + f.h - coachBand());   // tutorial: stay above the card
  const y1 = Math.max(y0 + 1, bottom);
  return { x0: f.x + mx, x1: Math.max(f.x + mx + 1, f.x + f.w - mx), y0, y1 };
}
function spot(size) { const b = walkBox(size || 80); return { x: rand(b.x0, b.x1), y: rand(b.y0, b.y1) }; }
function keepInside(o, size) { const b = walkBox(size); o.x = clamp(o.x, b.x0, b.x1); o.y = clamp(o.y, b.y0, b.y1); }
// When the screen changes shape, move everything to the same place in the new ranch.
function remapRanch(of, nf) {
  if (!of || !nf || !of.w || !of.h) return;
  const m = (o, kx, ky) => { o[kx] = nf.x + (o[kx] - of.x) / of.w * nf.w; o[ky] = nf.y + (o[ky] - of.y) / of.h * nf.h; };
  for (const d of S.dogs) { m(d, 'x', 'y'); m(d, 'tx', 'ty'); keepInside(d, dogSize(d.lv)); }
  for (const c of S.crates) { m(c, 'x', 'y'); keepInside(c, dogSize(c.lv)); }
  for (const b of S.drops) { m(b, 'x0', 'y0'); m(b, 'x1', 'y1'); }
  S.parts.length = 0;
}

// ---------- entities ----------
function addDog(lv, how, at) {
  const sz = dogSize(lv), p = at ? { x: at.x, y: at.y } : spot(sz);
  keepInside(p, sz);
  const d = { id: ++S.uid, lv, x: p.x, y: p.y, tx: p.x, ty: p.y, state: 'idle', timer: rand(0.3, 1.5),
    face: Math.random() < 0.5 ? 1 : -1, faceS: 1, phase: rand(0, 6), petCd: 0, happy: 0, hopT: 0,
    blinkAt: S.t + rand(1, 4), blinkUntil: 0, zT: rand(0, 1), seed: rand(0, 10), arrive: null, mate: null, coolT: 0 };
  d.faceS = d.face;
  if (LAYOUT && how === 'adopt') { const b = LAYOUT.buttons.adopt; d.arrive = { x0: b.x + b.w / 2, y0: b.y + b.h * 0.3, t0: S.t, dur: 0.6, kind: 'jump' }; }
  else if (LAYOUT && how === 'gift') d.arrive = { x0: p.x, y0: field().y - sz * 1.5, t0: S.t, dur: 0.75, kind: 'drop' };
  else if (how === 'crate') { d.happy = 0.9; d.hopT = 0.001; burst(d.x, d.y - sz * 0.35, 18, ['#ffd23f', '#ff5d8f', '#4db8ff', '#7ed957', '#ffffff'], sz, 'confetti'); }
  if (how === 'gift') d.happy = 1.2;
  S.dogs.push(d); S.dirty = true;
  return d;
}
function newCrate(lv) { const p = spot(dogSize(lv)); return { id: ++S.uid, lv, x: p.x, y: p.y, t0: S.t, fall: 1.4, seed: rand(0, 6) }; }
// A cash drop pops out of a pup, arcs onto the grass beside it, bounces, then waits to be tapped.
function newDrop(d, val) {
  const sz = dogSize(d.lv), f = field(), r = Math.max(14, (LAYOUT ? LAYOUT.dog : 80) * 0.17);
  const side = Math.random() < 0.5 ? -1 : 1;
  const x1 = clamp(d.x + side * sz * rand(0.45, 0.8), f.x + r * 1.5, f.x + f.w - r * 1.5);
  const y1 = clamp(d.y + rand(-0.15, 0.25) * sz, f.y + r * 2, f.y + f.h - r);
  return { x0: d.x, y0: d.y - sz * 0.6, x1, y1, h: sz * 0.7, val, age: 0, seed: rand(0, 6) };
}
function dropPos(b) {
  const k = clamp(b.age / 0.5, 0, 1);
  if (k < 1) return { x: b.x0 + (b.x1 - b.x0) * k, y: b.y0 + (b.y1 - b.y0) * k - Math.sin(Math.PI * k) * b.h, air: 1 - k };
  const t2 = b.age - 0.5, hop = t2 < 0.3 ? Math.sin(t2 / 0.3 * Math.PI) * b.h * 0.16 : 0;
  return { x: b.x1, y: b.y1 - hop, air: 0 };
}
function newBiscuit() { const f = field(); return { age: 0, dur: 9, dir: Math.random() < 0.5 ? 1 : -1, y0: f.y + f.h * rand(0.25, 0.6), amp: f.h * 0.09 }; }
function biscuitPos(b) {
  const f = field(), k = b.age / b.dur, span = f.w + 120;
  return { x: b.dir > 0 ? f.x - 60 + span * k : f.x + f.w + 60 - span * k, y: b.y0 + Math.sin(k * Math.PI * 3) * b.amp };
}
function crateDrop(c) { return clamp((S.t - c.t0) / c.fall, 0, 1); }

// ---------- particles ----------
function addPart(p) { if (S.parts.length > 260) S.parts.shift(); p.t0 = S.t; S.parts.push(p); return p; }
function burst(x, y, n, cols, size, kind) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), sp = rand(0.6, 1.6) * size * 1.6;
    addPart({ kind: kind || 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - size * 1.2, g: size * 4, life: rand(0.6, 1.1),
      col: cols[i % cols.length], r: size * rand(0.04, 0.07), rot: rand(0, 6), vr: rand(-10, 10) });
  }
}
function floatText(x, y, text, col, size, life) { addPart({ kind: 'text', x, y, vx: 0, vy: -size * 1.4, g: 0, life: life || 1.1, col, r: size, text }); }
function onMerged(b, a, bonus, lucky, auto) {
  const sz = dogSize(b.lv), cx = b.x, cy = b.y - sz * 0.38, tc = TIERS[PUPS[b.lv].tier].col;
  b.happy = 1.2; b.hopT = 0.001; b.state = 'idle'; b.timer = rand(0.8, 1.6);
  addPart({ kind: 'ring', x: cx, y: cy, life: 0.55, r: sz * 0.9, col: tc });
  burst(cx, cy, auto ? 8 : 14, ['#ffd23f', '#ffffff', tc], sz, 'spark');
  if (bonus > 0) floatText(cx, cy - sz * 0.6, `COMBO x${S.combo}  +${fmt(bonus)}`, '#ffd23f', Math.max(16, sz * 0.24), 1.4);
  if (lucky) {
    floatText(cx, cy - sz * (bonus > 0 ? 1.0 : 0.6), `LUCKY! x${fmt(luckyMult())} COINS`, '#7dff6b', Math.max(16, sz * 0.24), 1.4);
    burst(cx, cy, 8, ['#7dff6b', '#d6ffcc'], sz * 0.8, 'clover');
    SFX.lucky();
  }
  S.mergeFxT = S.t;
}
function onCoins(x, y, v) {
  const c = LAYOUT ? LAYOUT.coinAt : { x: 0, y: 0 };
  for (let i = 0; i < 5; i++) addPart({ kind: 'coinfly', x: x + rand(-10, 10), y: y + rand(-10, 10), x1: c.x, y1: c.y, life: 0.55 + i * 0.06, r: Math.max(9, LAYOUT ? LAYOUT.dog * 0.11 : 10) });
  floatText(x, y - 12, '+' + fmt(v), '#ffe14f', Math.max(15, LAYOUT ? LAYOUT.dog * 0.2 : 16), 0.9);
}
function onPet(d, v, zoomed) {
  const sz = dogSize(d.lv);
  for (let i = 0; i < (v ? 3 : 1); i++) addPart({ kind: 'heart', x: d.x + rand(-0.25, 0.25) * sz, y: d.y - sz * 0.75, vx: rand(-12, 12), vy: -sz * rand(0.7, 1.0), g: 0, life: 1.0, r: sz * 0.12, col: '#ff5d8f' });
  if (v) floatText(d.x, d.y - sz * 1.0, '+' + (v < 10 ? (Math.floor(v * 10) / 10).toString() : fmt(v)), '#ffe14f', Math.max(15, sz * 0.2), 0.9);
  if (zoomed && LAYOUT) {                          // a tiny bolt flies into the ZOOMIES meter
    const m = LAYOUT.meter;
    addPart({ kind: 'boltfly', x: d.x, y: d.y - sz * 0.6, x1: m.x + m.w * Math.min(1, S.save.zoom / zoomNeed()), y1: m.y + m.h / 2, life: 0.6, r: Math.max(8, sz * 0.09) });
  }
}
function onBiscuit(b, v) {
  const p = biscuitPos(b);
  burst(p.x, p.y, 26, ['#ffd23f', '#fff6c2', '#ff9a2e'], LAYOUT ? LAYOUT.dog : 80, 'spark');
  onCoins(p.x, p.y, v);
  floatText(p.x, p.y - 40, 'JACKPOT!', '#ffd23f', Math.max(22, LAYOUT ? LAYOUT.dog * 0.32 : 24), 1.5);
}
function onRetired(list) {                         // older pups wave, hop and leave in a puff
  for (const d of list) {
    const sz = dogSize(d.lv);
    addPart({ kind: 'leave', x: d.x, y: d.y, lv: d.lv, face: d.face, life: 0.9, r: sz, seed: d.seed });
    burst(d.x, d.y - sz * 0.3, 5, ['rgba(255,255,255,0.9)'], sz * 0.6, 'dust');
  }
  SFX.bye();
}
const PARTY = ['#ff3fa8', '#ffd23f', '#4db8ff', '#7ed957', '#c09cff', '#ffffff'];
function onZoomies() {                             // v1.0 (owner: "ZOOMIES needs to hit dopamine"): flash, shake, confetti, fanfare
  S.banner = { text: 'ZOOMIES!', sub: `x${zoomPower()} coins - pups merge${superZoom() ? ' and adopt' : ''} on their own`, t0: S.t };
  S.zoomFx = S.t;
  for (const d of S.dogs) { if (d.state === 'sleep') d.state = 'idle'; d.happy = 1; }
  if (LAYOUT) { const f = field(); for (let i = 0; i < 5; i++) burst(f.x + f.w * (0.1 + i * 0.2), f.y + f.h * 0.15, 12, PARTY, LAYOUT.dog * 0.9, 'confetti'); }
}
function onZoomiesEnd(coins, merges) {               // the haul: a big gold number, coins flying to the counter, cha-ching
  if (coins <= 0) return;
  S.banner = { text: '+' + fmt(coins), sub: `ZOOMIES haul: ${merges} merge${merges === 1 ? '' : 's'}`, t0: S.t, gold: true };
  SFX.haul();
  if (LAYOUT) { const f = field(), x = f.x + f.w / 2, y = f.y + f.h * 0.35; burst(x, y, 26, ['#ffd23f', '#fff3a0', '#ffb020', '#ffffff'], LAYOUT.dog * 0.9, 'confetti'); onCoins(x, y, coins); onCoins(x - 30, y + 10, coins); }
}

// ---------- the ranch's life, once per frame ----------
function busy(d) { return d.arrive || S.held === d || (S.drag && S.drag.dog === d); }
// ZOOMIES: every free pup is paired with its nearest twin; both sprint to meet and merge on contact (or after 1 s).
function zoomPairs() {
  const groups = {};
  for (const d of S.dogs) {
    if (d.mate && (d.mate.mate !== d || d.mate.lv !== d.lv || busy(d) || busy(d.mate))) { if (d.mate.mate === d) d.mate.mate = null; d.mate = null; }
    if (d.mate || busy(d) || d.lv >= MAX_LEVEL || S.t < d.coolT) continue;
    (groups[d.lv] = groups[d.lv] || []).push(d);
  }
  for (const k in groups) {
    const g = groups[k];
    while (g.length >= 2) {
      const a = g.pop(); let bi = 0, bd = Infinity;
      for (let i = 0; i < g.length; i++) { const dx = g[i].x - a.x, dy = g[i].y - a.y, dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; bi = i; } }
      const b = g.splice(bi, 1)[0];
      a.mate = b; b.mate = a; a.mateT = b.mateT = S.t;
      a.state = b.state = 'run';
    }
  }
}
function updateRanch(dt) {
  const zoom = S.zoomLeft > 0 && !S.modal;
  S.crowdK += (crowdTarget() - S.crowdK) * Math.min(1, dt * 1.5);
  if (zoom) { S.pairT -= dt; if (S.pairT <= 0) { S.pairT = 0.1; zoomPairs(); } }
  else if (S.pairT !== 0) { S.pairT = 0; for (const d of S.dogs) d.mate = null; }
  for (const d of S.dogs) {
    const sz = dogSize(d.lv);
    if (d.happy > 0) d.happy -= dt;
    if (d.hopT > 0) { d.hopT += dt / 0.45; if (d.hopT >= 1) d.hopT = 0; }
    if (S.t > d.blinkAt) { d.blinkUntil = S.t + 0.14; d.blinkAt = S.t + rand(2.2, 5.5); }
    if (d.arrive) {
      if (S.t - d.arrive.t0 >= d.arrive.dur) { d.arrive = null; d.hopT = 0.001; burst(d.x, d.y, 6, ['rgba(255,255,255,0.8)'], sz * 0.6, 'dust'); }
      continue;
    }
    if (busy(d)) continue;
    d.timer -= dt;
    if (zoom && d.mate) {                            // sprint to meet the twin halfway
      const m = d.mate, tx = (d.x + m.x) / 2, ty = (d.y + m.y) / 2, dx = tx - d.x, dy = ty - d.y, dist = Math.hypot(dx, dy);
      const step = sz * 6 * dt;
      if (dist > 0.5) { const k = Math.min(1, step / dist); d.x += dx * k; d.y += dy * k; }
      if (Math.abs(dx) > 1) d.face = dx > 0 ? 1 : -1;
      d.phase += dt * 26; d.state = 'run';
      if (Math.random() < dt * 5) addPart({ kind: 'dust', x: d.x - d.face * sz * 0.3, y: d.y - 2, vx: -d.face * 20, vy: -6, g: 0, life: 0.4, r: sz * 0.035, col: 'rgba(255,255,255,0.45)' });
      d.faceS += (d.face - d.faceS) * Math.min(1, dt * 18);
      continue;
    }
    if (zoom && d.state !== 'run') { d.state = 'run'; aim(d, sz, true); }
    else if (!zoom && d.state === 'run') { d.state = 'idle'; d.timer = rand(0.4, 1.4); }
    if (d.state === 'idle' && d.timer <= 0) chooseNext(d, sz);
    else if (d.state === 'sleep') {
      if (d.timer <= 0) { d.state = 'idle'; d.timer = rand(0.5, 1.2); d.hopT = 0.001; }
      d.zT -= dt;
      if (d.zT <= 0) { d.zT = 1.1; addPart({ kind: 'z', x: d.x + d.face * sz * 0.3, y: d.y - sz * 0.45, vx: d.face * 6, vy: -sz * 0.35, g: 0, life: 1.6, r: sz * 0.14 }); }
    } else if (d.state === 'walk' || d.state === 'run') {
      const dx = d.tx - d.x, dy = d.ty - d.y, dist = Math.hypot(dx, dy);
      const speed = sz * (d.state === 'run' ? 3.3 : 0.62) * (PUPS[d.lv].fx === 'speed' ? 1.6 : 1);
      const step = speed * dt;
      if (Math.abs(dx) > 2) d.face = dx > 0 ? 1 : -1;
      if (dist <= step || d.timer < -8) {
        d.x = d.tx; d.y = d.ty;
        if (d.state === 'run') aim(d, sz, true); else { d.state = 'idle'; d.timer = rand(0.8, 3); }
      } else { d.x += dx / dist * step; d.y += dy / dist * step; }
      d.phase += Math.min(step / (sz * 0.075), dt * 24);
      if (d.state === 'run' && Math.random() < dt * 4) addPart({ kind: 'dust', x: d.x - d.face * sz * 0.3, y: d.y - 2, vx: -d.face * 20, vy: -6, g: 0, life: 0.4, r: sz * 0.035, col: 'rgba(255,255,255,0.45)' });
    }
    d.faceS += (d.face - d.faceS) * Math.min(1, dt * 18);
  }
  // ZOOMIES: twins that reached each other merge (up to 8 pairs a frame); a pair that hasn't met after 1 s merges anyway
  if (zoom) {
    let n = 0;
    for (const a of S.dogs.slice()) {
      const b = a.mate;
      if (!b || b.mate !== a || a.id > b.id) continue;
      const sa = dogSize(a.lv), near = Math.hypot(b.x - a.x, (b.y - a.y) * 1.3) < sa * 0.42;
      if (near || S.t - a.mateT > 1.0) {
        a.mate = b.mate = null;
        b.x = (a.x + b.x) / 2; b.y = (a.y + b.y) / 2;
        if (mergeDogs(a, b, true)) { b.coolT = S.t + 0.22; if (++n >= 8) break; }
      }
    }
  }
  // pups gently push apart (twins meeting in ZOOMIES may overlap)
  const N = S.dogs.length, pushK = Math.min(1, dt * 6);
  for (let i = 0; i < N; i++) {
    const a = S.dogs[i]; if (a.arrive || (S.drag && S.drag.dog === a)) continue;
    const sa = dogSize(a.lv);
    for (let j = i + 1; j < N; j++) {
      const b = S.dogs[j]; if (b.arrive || (S.drag && S.drag.dog === b) || a.mate === b) continue;
      const sb = dogSize(b.lv), min = (sa + sb) * 0.24;
      const dx = b.x - a.x; if (dx > min || dx < -min) continue;
      const dy = (b.y - a.y) * 1.8, dd = Math.hypot(dx, dy);
      if (dd >= min) continue;
      const push = (min - dd) * 0.5 * pushK / Math.max(dd, 0.01);
      const ax = a.state === 'sleep' || S.held === a ? 0 : 1, bx = b.state === 'sleep' || S.held === b ? 0 : 1;
      a.x -= dx * push * ax; a.y -= dy * push * ax / 1.8; b.x += dx * push * bx; b.y += dy * push * bx / 1.8;
      keepInside(a, sa); keepInside(b, sb);
    }
  }
  for (let i = S.parts.length - 1; i >= 0; i--) {
    const p = S.parts[i], age = S.t - p.t0;
    if (age > p.life) { S.parts.splice(i, 1); continue; }
    if (p.vx !== undefined) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; if (p.vr) p.rot += p.vr * dt; }
  }
  updateAmbient(dt, worldOf(S.save.best));
}
function aim(d, sz, far) {
  const b = walkBox(sz), f = field();
  if (far) { d.tx = rand(b.x0, b.x1); d.ty = rand(b.y0, b.y1); }
  else { d.tx = clamp(d.x + rand(-0.4, 0.4) * f.w, b.x0, b.x1); d.ty = clamp(d.y + rand(-0.3, 0.3) * f.h, b.y0, b.y1); }
  d.timer = 0;
}
function chooseNext(d, sz) {
  const r = Math.random(), P = PUPS[d.lv];
  if (S.save && S.save.tut <= TUT.MERGE2) {          // early tutorial: pups stay put (hop, look around) so they are easy to grab
    if (r < 0.5) { d.hopT = 0.001; d.happy = 0.6; } else d.face = -d.face;
    d.timer = rand(1.2, 2.6); return;
  }
  if (r < 0.6) { d.state = 'walk'; aim(d, sz, false); }
  else if (r < 0.7 && P.fx !== 'jet') { d.state = 'sleep'; d.timer = rand(5, 10); d.zT = 0.4; }
  else if (r < 0.84) { d.hopT = 0.001; d.happy = 0.6; d.timer = rand(0.8, 2); }
  else { d.face = -d.face; d.timer = rand(1, 2.5); }
}

// ---------- picking things up ----------
function dogBody(d) { const sz = dogSize(d.lv); return { x: d.x, y: d.y - sz * 0.38, rx: Math.max(24, sz * 0.44), ry: Math.max(24, sz * 0.4) }; }
function dogAt(x, y, except) {
  let best = null, bestY = -1e9;
  for (const d of S.dogs) {
    if (d === except || d.arrive) continue;
    const b = dogBody(d), nx = (x - b.x) / b.rx, ny = (y - b.y) / b.ry;
    if (nx * nx + ny * ny <= 1 && d.y > bestY) { best = d; bestY = d.y; }
  }
  return best;
}
function mergeTarget(d, x, y) {                     // nearest twin under the finger
  let best = null, bestD = 1e9;
  for (const o of S.dogs) {
    if (o === d || o.arrive || !canMerge(d, o)) continue;
    const b = dogBody(o), dd = Math.hypot((x - b.x) / (b.rx * 1.25), (y - b.y) / (b.ry * 1.25));
    if (dd < 1 && dd < bestD) { best = o; bestD = dd; }
  }
  return best;
}
function crateAt(x, y) {
  for (const c of S.crates) { if (crateDrop(c) < 1) continue; const s = dogSize(c.lv) * 0.5; if (Math.abs(x - c.x) < Math.max(30, s * 0.75) && y > c.y - Math.max(56, s * 1.4) && y < c.y + 14) return c; }
  return null;
}
function dropAt(x, y) {
  let best = null, bd = Infinity;
  const r = Math.max(32, (LAYOUT ? LAYOUT.dog : 80) * 0.32);
  for (const b of S.drops) { const p = dropPos(b), d = Math.hypot(x - p.x, y - (p.y - r * 0.3)); if (d < r && d < bd) { bd = d; best = b; } }
  return best;
}
function biscuitAt(x, y) { if (!S.biscuit) return false; const p = biscuitPos(S.biscuit); return Math.hypot(x - p.x, y - p.y) < Math.max(44, (LAYOUT ? LAYOUT.dog : 80) * 0.55); }
function dropDrag() {
  const dr = S.drag; S.drag = null;
  if (dr && dr.dog) { keepInside(dr.dog, dogSize(dr.dog.lv)); dr.dog.state = 'idle'; dr.dog.timer = rand(0.5, 1.5); }
}

// ---------- drawing the ranch ----------
function poseOf(d) {
  const sz = dogSize(d.lv), held = (S.drag && S.drag.dog === d && S.drag.moved) || S.held === d;
  const o = { t: S.t, face: d.faceS, phase: d.phase, moving: d.state === 'walk' || d.state === 'run', sleep: d.state === 'sleep',
    blink: S.t < d.blinkUntil, held, happy: d.happy > 0, seed: d.seed, lift: 0, sx: 1, sy: 1, run: d.state === 'run' };
  if (Math.abs(o.face) < 0.15) o.face = o.face < 0 ? -0.15 : 0.15;
  if (d.hopT > 0) { const k = d.hopT, s = Math.sin(Math.PI * k); o.lift = s * sz * 0.2; o.sy = 1 + 0.1 * s; o.sx = 1 - 0.05 * s; }
  if (PUPS[d.lv].fx === 'jet') o.lift += sz * (0.08 + Math.sin(S.t * 2.5 + d.seed) * 0.03);
  if (PUPS[d.lv].fx === 'legend' && !o.sleep) o.lift += sz * (0.04 + Math.sin(S.t * 2 + d.seed) * 0.03);
  return o;
}
function arrivePos(d) {
  const a = d.arrive, k = clamp((S.t - a.t0) / a.dur, 0, 1), sz = dogSize(d.lv);
  if (a.kind === 'drop') { const e = k * k; return { x: d.x, y: a.y0 + (d.y - a.y0) * e, lift: 0 }; }
  return { x: a.x0 + (d.x - a.x0) * k, y: a.y0 + (d.y - a.y0) * k, lift: Math.sin(Math.PI * k) * sz * 1.1 };
}
function drawRanch(g) {
  const wi = worldOf(S.save.best), t = S.t;
  g.drawImage(ranchBackground(wi), 0, 0, W, H);
  const f = LAYOUT.field;
  g.save(); g.beginPath(); g.rect(f.x, f.y - LAYOUT.dog * 1.2, f.w, f.h + LAYOUT.dog * 1.2); g.clip();
  drawAmbient(g, t, false);
  const dragDog = S.drag && S.drag.moved ? S.drag.dog : null;
  const list = [];
  for (const d of S.dogs) if (d !== dragDog) list.push(d);
  for (const c of S.crates) list.push(c);
  list.sort((a, b) => a.y - b.y);
  // shadows and tier glows first, so no shadow ever lies on a pup
  for (const o of list) {
    const isCrate = !('state' in o), sz = dogSize(o.lv);
    let x = o.x, y = o.y, k = 1;
    if (isCrate) k = crateDrop(o); else if (o.arrive) { const p = arrivePos(o); x = p.x; y = p.y; }
    if (!isCrate && PUPS[o.lv].tier >= 2) groundGlow(g, x, y, sz, PUPS[o.lv].tier, t + o.seed);
    g.fillStyle = 'rgba(20,30,10,0.24)'; g.beginPath(); g.ellipse(x, y + 1, sz * 0.34 * (isCrate ? 0.8 : Math.sqrt(PUPS[o.lv].len)) * (0.4 + 0.6 * k), sz * 0.08, 0, 0, Math.PI * 2); g.fill();
  }
  for (const b of S.drops) dropShadow(g, b);
  const twins = dragDog ? dragDog.lv : (S.held ? S.held.lv : 0);
  const target = S.drag && S.drag.target;
  for (const o of list) {
    if (!('state' in o)) { drawCrate(g, o); continue; }
    const d = o, sz = dogSize(d.lv), pose = poseOf(d);
    let x = d.x, y = d.y;
    if (d.arrive) { const p = arrivePos(d); x = p.x; y = p.y; pose.lift += p.lift; }
    if (twins && d.lv === twins && d.lv < MAX_LEVEL && d !== S.held) {       // show every pup it can merge with
      const on = d === target, pulse = 0.5 + 0.5 * Math.sin(t * 8);
      g.strokeStyle = on ? '#7dff6b' : 'rgba(255,255,255,0.9)'; g.lineWidth = on ? 4.5 : 3; g.globalAlpha = on ? 1 : 0.5 + pulse * 0.4;
      g.beginPath(); g.ellipse(x, y, sz * 0.46, sz * 0.14, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    }
    if (S.cursorShown && S.cursor === d) { g.strokeStyle = '#ffd23f'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, sz * 0.48, sz * 0.15, 0, 0, Math.PI * 2); g.stroke(); }
    drawDogFx(g, d.lv, x, y, sz, pose, false);
    drawDog(g, d.lv, x, y, sz, pose);
    drawDogFx(g, d.lv, x, y, sz, pose, true);
    if (d.petT && S.t - d.petT < CFG.PET_CD + 0.25) {   // after a tap: a small ring fills until this pup pays again
      const k = clamp((S.t - d.petT) / CFG.PET_CD, 0, 1), rx = x, ry = y - sz * 0.95 - pose.lift, rr = Math.max(6, sz * 0.08);
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.arc(rx, ry, rr + 2, 0, Math.PI * 2); g.fill();
      g.strokeStyle = k >= 1 ? '#7dff6b' : '#ffe14f'; g.lineWidth = Math.max(2, rr * 0.45); g.lineCap = 'round';
      g.beginPath(); g.arc(rx, ry, rr * 0.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke();
    }
    if (S.held === d) { g.strokeStyle = '#ffd23f'; g.lineWidth = 3; g.setLineDash([6, 5]); g.beginPath(); g.ellipse(x, y - sz * 0.38, sz * 0.52, sz * 0.48, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
  }
  for (const b of S.drops) drawDrop(g, b);
  drawAmbient(g, t, true);
  g.restore();
  if (S.biscuit) drawBiscuit(g, S.biscuit);
  if (dragDog) {                                    // the pup in the hand, above everything
    const sz = dogSize(dragDog.lv) * 1.12, pose = poseOf(dragDog);
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(S.drag.x, S.drag.y + sz * 0.18, sz * 0.3, sz * 0.07, 0, 0, Math.PI * 2); g.fill();
    drawDogFx(g, dragDog.lv, S.drag.x, S.drag.y, sz, pose, false);
    drawDog(g, dragDog.lv, S.drag.x, S.drag.y, sz, pose);
    drawDogFx(g, dragDog.lv, S.drag.x, S.drag.y, sz, pose, true);
  }
  drawParts(g);
  if (S.zoomLeft > 0) {                             // rainbow edge and a beating colour wash while ZOOMIES runs
    const a = 0.45 + 0.25 * Math.sin(t * 10), hue = (t * 240) % 360;
    g.fillStyle = `hsla(${(hue + 180) % 360},100%,60%,${0.05 + 0.04 * Math.max(0, Math.sin(t * 9))})`; g.fillRect(f.x, f.y, f.w, f.h);
    g.strokeStyle = `hsla(${hue},100%,60%,${a})`; g.lineWidth = Math.max(10, Math.min(W, H) * 0.032);
    g.strokeRect(f.x + 4, f.y + 4, f.w - 8, f.h - 8);
  }
}
const GLOW = [null, null, ['rgba(199,125,255,0.55)', 'rgba(199,125,255,0)'], ['rgba(255,210,70,0.65)', 'rgba(255,200,60,0)']];
function groundGlow(g, x, y, sz, tier, t) {          // Epic and Legendary pups stand on a soft glowing ring
  const c = GLOW[tier], r = sz * (tier === 3 ? 0.62 : 0.52) * (1 + Math.sin(t * 3) * 0.05);
  g.save(); g.translate(x, y); g.scale(1, 0.3);
  const gr = g.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
  gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  g.restore();
}
function drawCrate(g, c) {
  const sz = dogSize(c.lv), k = crateDrop(c), s = sz * 0.48, t = S.t;
  const ease = k < 1 ? 1 - Math.pow(1 - k, 3) : 1;
  const sway = k < 1 ? Math.sin(t * 4 + c.seed) * 0.18 * (1 - k) : Math.sin((t - c.t0) * 6) * 0.04;
  const y = (field().y - sz * 1.6) + (c.y - (field().y - sz * 1.6)) * ease;
  const rare = c.lv > adoptLevel();
  g.save(); g.translate(c.x, y); g.rotate(sway);
  if (k < 1 || t - c.t0 - c.fall < 0.4) {           // parachute (folds away after landing)
    const fade = k < 1 ? 1 : 1 - (t - c.t0 - c.fall) / 0.4;
    g.globalAlpha = Math.max(0, fade);
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(-s * 0.5, -s); g.lineTo(-s * 0.95, -s * 2.1); g.moveTo(s * 0.5, -s); g.lineTo(s * 0.95, -s * 2.1); g.moveTo(0, -s); g.lineTo(0, -s * 2.25); g.stroke();
    const cols = rare ? ['#ffd23f', '#fff6c2'] : ['#ff5d6c', '#ffffff'];
    for (let i = 0; i < 5; i++) { g.fillStyle = cols[i % 2]; g.beginPath(); g.moveTo(0, -s * 2.2); g.arc(0, -s * 2.15, s * 1.1, Math.PI + i * Math.PI / 5, Math.PI + (i + 1) * Math.PI / 5); g.closePath(); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, -s * 2.15, s * 1.1, Math.PI, 0); g.stroke();
    g.globalAlpha = 1;
  }
  if (rare && k >= 1) { const gr = g.createRadialGradient(0, -s * 0.5, s * 0.2, 0, -s * 0.5, s * 1.3); gr.addColorStop(0, 'rgba(255,220,90,0.55)'); gr.addColorStop(1, 'rgba(255,220,90,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, -s * 0.5, s * 1.3, 0, Math.PI * 2); g.fill(); }
  const w = s * 1.15, h = s * 1.05, x0 = -w / 2, y0 = -h;
  g.lineJoin = 'round';
  g.fillStyle = '#5a3410'; rrPath(g, x0 - 1.5, y0 - 1.5, w + 3, h + 3, s * 0.14); g.fill();      // outline
  const gr = g.createLinearGradient(0, y0, 0, 0); gr.addColorStop(0, rare ? '#ffe27a' : '#e8ac5e'); gr.addColorStop(1, rare ? '#e09a12' : '#b97a32');
  g.fillStyle = gr; rrPath(g, x0, y0, w, h, s * 0.12); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x0 + s * 0.08, y0 + s * 0.06, w - s * 0.16, s * 0.1);
  g.strokeStyle = rare ? '#9a6400' : '#8c5a22'; g.lineWidth = Math.max(1.5, s * 0.1); g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0 + s * 0.12, y0 + h * 0.5); g.lineTo(-x0 - s * 0.12, y0 + h * 0.5); g.stroke();
  g.fillStyle = rare ? '#b57800' : '#7a4a18';
  for (const [px, py] of [[x0 + s * 0.14, y0 + s * 0.14], [-x0 - s * 0.14, y0 + s * 0.14], [x0 + s * 0.14, -s * 0.14], [-x0 - s * 0.14, -s * 0.14]]) { g.beginPath(); g.arc(px, py, Math.max(1.2, s * 0.05), 0, Math.PI * 2); g.fill(); }
  icon(g, 'paw', 0, y0 + h * 0.5, s * 0.5, rare ? '#fff6c2' : '#ffe08a');
  if (k >= 1) {                                     // a little bounce invites the tap
    const bob = Math.sin(t * 5 + c.seed) * s * 0.08;
    outlinedText(g, rare ? '!' : '?', 0, y0 - s * 0.38 + bob, Math.max(15, s * 0.6), rare ? '#ffe14f' : '#ffffff', '#5a3410');
  }
  g.restore();
}
function dropShadow(g, b) {
  const p = dropPos(b), r = Math.max(14, (LAYOUT ? LAYOUT.dog : 80) * 0.17), k = 1 - p.air * 0.6;
  g.fillStyle = 'rgba(20,30,10,0.25)'; g.beginPath(); g.ellipse(p.x, b.age < 0.5 ? b.y0 + (b.y1 - b.y0) * (b.age / 0.5) : b.y1, r * 0.8 * k, r * 0.26 * k, 0, 0, Math.PI * 2); g.fill();
}
function drawDrop(g, b) {                          // a spinning gold coin with a glow; it blinks before it goes
  const p = dropPos(b), r = Math.max(14, (LAYOUT ? LAYOUT.dog : 80) * 0.17), t = S.t;
  const left = CFG.DROP_LIFE - b.age;
  if (!b.tut && left < 2 && Math.sin(t * 18) < 0) return;
  const pop = Math.min(1, b.age / 0.15), cy = p.y - r * 1.05;
  const gl = g.createRadialGradient(p.x, cy, r * 0.3, p.x, cy, r * 2);
  gl.addColorStop(0, 'rgba(255,236,120,0.55)'); gl.addColorStop(1, 'rgba(255,220,80,0)');
  g.fillStyle = gl; g.beginPath(); g.arc(p.x, cy, r * 2 * (0.9 + 0.1 * Math.sin(t * 4 + b.seed)), 0, Math.PI * 2); g.fill();
  const spin = Math.cos(t * 3.2 + b.seed), sx = Math.max(0.16, Math.abs(spin));
  g.save(); g.translate(p.x, cy + Math.sin(t * 3 + b.seed) * r * 0.08 * (p.air ? 0 : 1)); g.scale(sx * pop, pop);
  g.fillStyle = '#a66400'; g.beginPath(); g.arc(0, r * 0.1, r, 0, Math.PI * 2); g.fill();
  const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#fff6b0'); gr.addColorStop(0.45, '#ffd02e'); gr.addColorStop(1, '#e48f00');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 0.92, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(170,100,0,0.55)'; g.lineWidth = Math.max(1, r * 0.09); g.beginPath(); g.arc(0, 0, r * 0.7, 0, Math.PI * 2); g.stroke();
  if (sx > 0.4) { g.fillStyle = '#d98a00'; paw(g, 0, r * 0.05, r * 0.42); }
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.45, r * 0.24, r * 0.11, -0.6, 0, Math.PI * 2); g.fill();
  g.restore();
  const tw = (t * 1.3 + b.seed) % 2;
  if (tw < 0.5) sparkle(g, p.x + r * 0.6, cy - r * 0.6, r * 0.45 * Math.sin(tw / 0.5 * Math.PI), '#ffffff', 0.95);
}
function drawBiscuit(g, b) {
  const p = biscuitPos(b), s = Math.max(24, (LAYOUT ? LAYOUT.dog : 80) * 0.32), t = S.t;
  const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 1.9);
  gr.addColorStop(0, 'rgba(255,230,120,0.65)'); gr.addColorStop(1, 'rgba(255,200,60,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, s * 1.9, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 4; i++) {                    // a golden trail
    const q = biscuitPos({ ...b, age: Math.max(0, b.age - (i + 1) * 0.08) });
    g.globalAlpha = 0.35 - i * 0.07; g.fillStyle = '#ffe27a'; g.beginPath(); g.arc(q.x, q.y, s * (0.32 - i * 0.05), 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
  g.save(); g.translate(p.x, p.y); g.rotate(Math.sin(t * 6) * 0.5);
  const bg = g.createLinearGradient(0, -s * 0.4, 0, s * 0.4); bg.addColorStop(0, '#fff1a0'); bg.addColorStop(1, '#e8a317');
  g.fillStyle = bg; g.strokeStyle = '#8a5200'; g.lineWidth = 2.5;     // a golden bone-shaped biscuit
  const bone = () => { g.beginPath(); for (const [sx, sy] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) { g.moveTo(sx * s * 0.6 + s * 0.2, sy * s * 0.17); g.arc(sx * s * 0.6, sy * s * 0.17, s * 0.2, 0, Math.PI * 2); } g.rect(-s * 0.6, -s * 0.15, s * 1.2, s * 0.3); };
  bone(); g.stroke(); bone(); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(-s * 0.45, -s * 0.1, s * 0.7, s * 0.06);
  g.restore();
  for (let i = 0; i < 3; i++) sparkle(g, p.x + Math.cos(t * 3 + i * 2.1) * s, p.y + Math.sin(t * 3 + i * 2.1) * s * 0.7, s * 0.2, '#fff6c2', 0.5 + 0.5 * Math.sin(t * 7 + i));
}
function drawParts(g) {
  const t = S.t;
  for (const p of S.parts) {
    const k = (t - p.t0) / p.life;
    if (p.kind === 'text') { g.globalAlpha = k < 0.75 ? 1 : (1 - k) * 4; outlinedText(g, p.text, p.x, p.y, p.r, p.col, 'rgba(0,0,0,0.75)'); }
    else if (p.kind === 'spark') { sparkle(g, p.x, p.y, p.r * 2.2 * (1 - k * 0.6), p.col, 1 - k); }
    else if (p.kind === 'confetti') { g.globalAlpha = 1 - k; g.fillStyle = p.col; g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r); g.restore(); }
    else if (p.kind === 'clover') { g.globalAlpha = 1 - k; g.save(); g.translate(p.x, p.y); g.rotate(p.rot); icon(g, 'clover', 0, 0, p.r * 3.2); g.restore(); }
    else if (p.kind === 'dust') { g.globalAlpha = (1 - k) * 0.7; g.fillStyle = p.col || 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(p.x, p.y, p.r * (1 + k * 1.5), 0, Math.PI * 2); g.fill(); }
    else if (p.kind === 'ring') { g.globalAlpha = 1 - k; g.strokeStyle = p.col; g.lineWidth = 5 * (1 - k) + 1; g.beginPath(); g.arc(p.x, p.y, p.r * (0.3 + k), 0, Math.PI * 2); g.stroke(); }
    else if (p.kind === 'heart') { g.globalAlpha = 1 - k; icon(g, 'heart', p.x + Math.sin(k * 8) * 4, p.y, p.r * 2 * (0.6 + k * 0.5)); }
    else if (p.kind === 'z') { g.globalAlpha = Math.sin(k * Math.PI); outlinedText(g, 'z', p.x + Math.sin(k * 6) * 5, p.y, p.r * (0.7 + k * 0.6), '#ffffff', 'rgba(40,50,90,0.6)'); }
    else if (p.kind === 'leave') {                  // a retiring pup hops up and fades out
      g.globalAlpha = Math.max(0, 1 - k * 1.1);
      drawDog(g, p.lv, p.x, p.y, p.r, { t, face: p.face, phase: t * 20, moving: true, happy: true, seed: p.seed, lift: Math.sin(Math.min(k, 1) * Math.PI) * p.r * 0.5 + k * p.r * 0.3 });
      if (k > 0.5) sparkle(g, p.x, p.y - p.r * 0.6, p.r * 0.3 * (1 - k), '#ffffff', 1);
    }
    else if (p.kind === 'boltfly') {
      const e = k * k, x = p.x + (p.x1 - p.x) * e, y = p.y + (p.y1 - p.y) * e - Math.sin(k * Math.PI) * 30;
      g.globalAlpha = 1; icon(g, 'bolt', x, y, p.r * 2 * (1 - k * 0.4), '#ffe14f');
    }
    else if (p.kind === 'coinfly') {
      const e = k * k, x = p.x + (p.x1 - p.x) * e, y = p.y + (p.y1 - p.y) * e - Math.sin(k * Math.PI) * 40;
      g.globalAlpha = 1; icon(g, 'coin', x, y, p.r * 2);
    }
    g.globalAlpha = 1;
  }
}
