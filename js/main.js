'use strict';
// Pup Evolution - cards (new pup, ranch upgrade, Legend, welcome back, shop, Pup Book), input, the loop, boot order.

// ---------- cards ----------
function cardBox(wFrac, hFrac, maxW, maxH) {
  const k = Math.max(1, LAYOUT.unit / 64);              // grow cards on 4K screens
  const w = Math.min(W * wFrac, (maxW || 460) * k), h = Math.min(H * hFrac, (maxH || 600) * k);
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}
function drawCard(c, accent) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rrPath(ctx, c.x, c.y + 6, c.w, c.h, 24); ctx.fill();
  const gr = ctx.createLinearGradient(0, c.y, 0, c.y + c.h); gr.addColorStop(0, '#33276e'); gr.addColorStop(1, '#1a1442');
  ctx.fillStyle = gr; rrPath(ctx, c.x, c.y, c.w, c.h, 24); ctx.fill();
  ctx.strokeStyle = accent || COL.gold; ctx.lineWidth = 3; rrPath(ctx, c.x + 1.5, c.y + 1.5, c.w - 3, c.h - 3, 22); ctx.stroke();
}
function ribbon(text, cx, y, w, size, col) {
  const h = size * 1.7;
  ctx.fillStyle = shade(col, 0.6); ctx.beginPath(); ctx.moveTo(cx - w / 2 - h * 0.4, y + h * 0.2); ctx.lineTo(cx - w / 2, y + h * 0.2); ctx.lineTo(cx - w / 2, y + h); ctx.lineTo(cx - w / 2 - h * 0.4, y + h); ctx.lineTo(cx - w / 2 - h * 0.2, y + h * 0.6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + w / 2 + h * 0.4, y + h * 0.2); ctx.lineTo(cx + w / 2, y + h * 0.2); ctx.lineTo(cx + w / 2, y + h); ctx.lineTo(cx + w / 2 + h * 0.4, y + h); ctx.lineTo(cx + w / 2 + h * 0.2, y + h * 0.6); ctx.closePath(); ctx.fill();
  const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, shade(col, 1.2)); gr.addColorStop(1, col);
  ctx.fillStyle = gr; rrPath(ctx, cx - w / 2, y, w, h * 0.85, 8); ctx.fill();
  fitText(text, cx, y + h * 0.43, size, w - 16, '#ffffff', 'rgba(0,0,0,0.5)', 'center', 900);
}
function sunburst(cx, cy, r, col, t) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.4);
  ctx.fillStyle = col; ctx.globalAlpha = 0.28;
  for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, -r * 0.16); ctx.lineTo(r, r * 0.16); ctx.closePath(); ctx.fill(); }
  ctx.restore(); ctx.globalAlpha = 1;
  const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.7); gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2); ctx.fill();
}
function bigDog(lv, cx, feetY, size) {
  const t = S.t, o = { t, face: 1, phase: 0, happy: true, seed: lv, lift: Math.abs(Math.sin(t * 3)) * size * 0.05, blink: (t % 3.2) < 0.13 };
  if (PUPS[lv].fx === 'jet') o.lift += size * 0.08;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(cx, feetY, size * 0.32, size * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  drawDogFx(ctx, lv, cx, feetY, size, o, false); drawDog(ctx, lv, cx, feetY, size, o); drawDogFx(ctx, lv, cx, feetY, size, o, true);
}
// Welcome-back card pieces, shared by the tall and the sideways card. No-break spaces keep "1 h 30 min" on one line.
function awayText(sec) { const mins = Math.round(sec / 60), hrs = Math.floor(mins / 60); return `Your pups earned this while you were away (${hrs ? hrs + ' h ' : ''}${mins % 60} min)`; }
function coinAmount(n, cx, y, cs) {
  ctx.font = font(cs, 900); const tw = ctx.measureText(`+${fmt(n)}`).width;
  icon(ctx, 'coin', cx - tw / 2 - cs * 0.45, y, cs);
  outlinedText(ctx, `+${fmt(n)}`, cx + cs * 0.15, y, cs, '#ffe14f', 'rgba(0,0,0,0.5)', 'center', 900);
}
function offlineButtons(a, gap, hit) {
  if (yt) {
    const half = (a.w - gap) / 2;
    const b1 = { x: a.x, y: a.y, w: half, h: a.h }, b2 = { x: a.x + half + gap, y: a.y, w: half, h: a.h };
    button(b1, 'Collect', null, 'adopt', !S.adBusy, { name: 'm1' });         // the free choice is just as big and easy
    button(b2, 'Collect x2', null, 'free', !S.adBusy, { name: 'm2', icon: 'play' });
    if (!S.adBusy) { hit.push([b1, () => collectOffline(false)]); hit.push([b2, () => collectOffline(true)]); }
  } else { button(a, 'Collect', null, 'adopt', true, { name: 'm1' }); hit.push([a, () => collectOffline(false)]); }
}
const RESET_TEXT = 'A brand-new playthrough: back to two Pebbles, starting prices, no upgrades, and the tutorial from step 1. Your current pups and coins are deleted.';
// Short wide screens (landscape phones, ultrawide): cards turn sideways, picture on the left, words and buttons on the right.
// v1.1 playtest: at 915x412 and 1200x300 the tall cards' words ran under their buttons.
function wideCards() { const k = Math.max(1, LAYOUT.unit / 64); return W > H * 1.15 && Math.min(H * 0.9, 640 * k) < 520; }
function drawCardWide(m, hit) {
  const k = Math.max(1, LAYOUT.unit / 64), cw = Math.min(W * 0.92, 780 * k), ch = Math.min(H * 0.9, 460 * k);
  const c = { x: (W - cw) / 2, y: (H - ch) / 2, w: cw, h: ch }, pad = Math.max(10, ch * 0.045);
  const big = Math.max(18, Math.min(ch * 0.085, 32)), small = Math.max(13, Math.min(ch * 0.05, 19)), bh = Math.max(48, Math.min(ch * 0.16, 64));
  const top = c.y + pad + big * 0.45;                                   // below the ribbon
  const P = { x: c.x + pad, y: top, w: cw * 0.42 - pad, h: c.y + ch - pad - top };            // the picture
  const R = { x: P.x + P.w + pad, y: top }; R.w = c.x + cw - pad - R.x;                       // words and buttons
  const rcx = R.x + R.w / 2, by = c.y + ch - pad - bh, btn = { x: R.x, y: by, w: R.w, h: bh };
  const lines = (s, n) => Math.min(n, wrapLines(s, small, R.w, 700).length) * small * 1.25;
  const stack = (items) => {                         // centres the words in the space above the button
    const gap = small * 0.55, total = items.reduce((a, it) => a + it.h, 0) + gap * (items.length - 1);
    let y = R.y + Math.max(0, (by - pad * 0.4 - R.y - total) / 2);
    for (const it of items) { it.draw(y + it.h / 2); y += it.h + gap; }
  };
  const ribbonW = (s) => Math.min(cw * 0.6, 380);
  if (m.type === 'discover' || m.type === 'legend' || m.type === 'pup') {
    const pp = PUPS[m.level], tier = TIERS[pp.tier], legend = m.type === 'legend';
    drawCard(c, tier.col);
    ribbon(legend ? 'YOU RAISED THE LEGEND!' : m.type === 'pup' ? `PUP #${m.level}` : 'NEW PUP!', c.x + cw / 2, c.y - big * 0.55, ribbonW(), big * 0.8, legend ? '#e0a100' : tier.dark);
    const ds = Math.min(P.w * 0.85, P.h * 0.78), feet = P.y + P.h * 0.88;
    ctx.save(); rrPath(ctx, c.x, c.y, cw, ch, 24); ctx.clip(); sunburst(P.x + P.w / 2, feet - ds * 0.38, ds * 0.85, tier.col, S.t); ctx.restore();
    bigDog(m.level, P.x + P.w / 2, feet, ds);
    const desc = legend ? "That's every pup! Your ranch keeps earning forever. Thanks for playing!" : `"${pp.desc}"`, ts = small * 0.85;
    const earn = income(m.level) * mergeMult();
    stack([
      { h: big * 1.15, draw: (y) => fitText(pp.name, rcx, y, big * 1.05, R.w, '#ffffff', 'rgba(0,0,0,0.5)', 'center', 900) },
      { h: ts * 1.7, draw: (y) => { ctx.font = font(ts, 900); const tw = ctx.measureText(tier.name).width + 22; pill(rcx - tw / 2, y - ts * 0.85, tw, ts * 1.7, tier.col); outlinedText(ctx, tier.name, rcx, y + ts * 0.03, ts, '#ffffff', 'rgba(0,0,0,0.45)', 'center', 900); } },
      { h: lines(desc, 4), draw: (y) => wrapText(desc, rcx, y, small, R.w, '#e8e4ff', null, 700, 4) },
      { h: small * 1.3, draw: (y) => fitText(`Earns ${earn < 10 ? (Math.floor(earn * 10) / 10).toString() : fmt(earn)} coins/s`, rcx, y, small, R.w, COL.good, 'rgba(0,0,0,0.4)') },
    ]);
    button(btn, m.type === 'pup' ? 'Back' : legend ? 'Keep playing' : 'Awesome!', null, legend ? 'gold' : 'adopt', true, { name: 'm1' });
    hit.push([btn, () => { if (m.type === 'pup') { closeModal(false); openModal({ type: 'book' }); } else closeModal(true); }]);
  } else if (m.type === 'world') {
    drawCard(c, '#ffd23f');
    ribbon('RANCH UPGRADE!', c.x + cw / 2, c.y - big * 0.55, ribbonW(), big * 0.8, '#e0a100');
    ctx.save(); rrPath(ctx, P.x, P.y, P.w, P.h, 16); ctx.clip();
    const bg = ranchBackground(m.world), f = LAYOUT.field, kk = bg.width / W;   // a slice of the real new ranch, same shape as P
    let sh = H, sw = sh * P.w / P.h; if (sw > W) { sw = W; sh = sw * P.h / P.w; }
    const sx = clamp(f.x + (f.w - sw) / 2, 0, W - sw), sy = clamp(f.y - sh * 0.3, 0, H - sh);
    ctx.drawImage(bg, sx * kk, sy * kk, sw * kk, sh * kk, P.x, P.y, P.w, P.h);
    bigDog(m.world === 1 ? 6 : m.world === 2 ? 9 : 12, P.x + P.w / 2, P.y + P.h * 0.92, Math.min(P.h * 0.75, P.w * 0.7));
    ctx.restore();
    const bye = m.retired ? ` Your ${m.retired} ${PUPS[m.world].name}${m.retired > 1 ? 's' : ''} retired to the farm and left you ${fmt(m.pay)} coins.` : '';
    const text = `A whole new ranch! Every adoption and crate now gives you ${PUPS[1 + m.world].name}.${bye}`;
    stack([
      { h: big * 1.25, draw: (y) => fitText(WORLDS[m.world].name, rcx, y, big * 1.15, R.w, '#ffd23f', 'rgba(0,0,0,0.5)', 'center', 900) },
      { h: lines(text, 5), draw: (y) => wrapText(text, rcx, y, small, R.w, '#e8e4ff', null, 700, 5) },
    ]);
    button(btn, "Let's go!", null, 'gold', true, { name: 'm1' });
    hit.push([btn, () => closeModal(true)]);
  } else if (m.type === 'offline') {
    drawCard(c, '#7ed957');
    ribbon('WELCOME BACK!', c.x + cw / 2, c.y - big * 0.55, ribbonW(), big * 0.8, '#2f9e3f');
    const ds = Math.min(P.w * 0.8, P.h * 0.75), feet = P.y + P.h * 0.88;
    ctx.save(); rrPath(ctx, c.x, c.y, cw, ch, 24); ctx.clip(); sunburst(P.x + P.w / 2, feet - ds * 0.38, ds * 0.8, '#ffd23f', S.t); ctx.restore();
    bigDog(Math.max(1, S.save.best), P.x + P.w / 2, feet, ds);
    const text = awayText(m.seconds), cs = big * 1.2;
    stack([
      { h: lines(text, 3), draw: (y) => wrapText(text, rcx, y, small, R.w, '#e8e4ff', null, 700) },
      { h: cs * 1.2, draw: (y) => coinAmount(m.amount, rcx, y, cs) },
    ]);
    offlineButtons(btn, pad, hit);
  } else if (m.type === 'reset') {                   // testing: confirm a brand-new playthrough
    drawCard(c, '#ff6b6b');
    ribbon('START OVER?', c.x + cw / 2, c.y - big * 0.55, Math.min(cw * 0.5, 300), big * 0.8, '#c0392b');
    const ds = Math.min(P.w * 0.7, P.h * 0.62); bigDog(1, P.x + P.w / 2, P.y + P.h * 0.8, ds);
    stack([
      { h: lines(RESET_TEXT, 5), draw: (y) => wrapText(RESET_TEXT, rcx, y, small, R.w, '#e8e4ff', null, 700, 5) },
      { h: small, draw: (y) => fitText('(Test button: only shown outside YouTube)', rcx, y, small * 0.8, R.w, '#a99fd8', null, 'center', 700) },
    ]);
    const half = (R.w - pad) / 2, b1 = { x: R.x, y: by, w: half, h: bh }, b2 = { x: R.x + half + pad, y: by, w: half, h: bh };
    button(b1, 'Cancel', null, 'plain', true, { name: 'm1' });
    button(b2, 'Restart', null, 'zoom', true, { name: 'm2', icon: 'reset' });
    hit.push([b1, () => closeModal(false)]);
    hit.push([b2, () => { closeModal(false); resetGame(); toast('New playthrough started!', 2.5); }]);
  }
}
function drawModal() {
  const m = S.modal, hit = [];
  ctx.fillStyle = 'rgba(6,8,22,0.72)'; ctx.fillRect(0, 0, W, H);
  const appear = Math.min(1, (S.t - (m.t0 || 0)) / 0.22), sc = 0.85 + 0.15 * (1 - Math.pow(1 - appear, 3));
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
  if (m.type === 'book') drawBook(hit);
  else if (m.type === 'shop') drawShop(hit);
  else if (wideCards()) drawCardWide(m, hit);
  else {
    const c = cardBox(0.92, 0.9, 470, 640), pad = Math.max(14, c.w * 0.05);
    const big = Math.max(20, Math.min(c.w * 0.085, 34)), small = Math.max(14, Math.min(c.w * 0.048, 19));
    const bh = Math.max(52, Math.min(c.h * 0.12, 68));
    if (m.type === 'discover' || m.type === 'legend' || m.type === 'pup') {
      const P = PUPS[m.level], tier = TIERS[P.tier], legend = m.type === 'legend';
      drawCard(c, tier.col);
      ribbon(legend ? 'YOU RAISED THE LEGEND!' : m.type === 'pup' ? `PUP #${m.level}` : 'NEW PUP!', c.x + c.w / 2, c.y - big * 0.55, Math.min(c.w * 0.86, 380), big * 0.8, legend ? '#e0a100' : tier.dark);
      const ds = Math.min(c.w * 0.62, c.h * 0.4), feet = c.y + c.h * 0.5;
      ctx.save(); rrPath(ctx, c.x, c.y, c.w, c.h, 24); ctx.clip(); sunburst(c.x + c.w / 2, feet - ds * 0.38, ds * 0.85, tier.col, S.t); ctx.restore();
      bigDog(m.level, c.x + c.w / 2, feet, ds);
      fitText(P.name, c.x + c.w / 2, feet + big * 0.95, big * 1.05, c.w - pad * 2, '#ffffff', 'rgba(0,0,0,0.5)', 'center', 900);
      const ts = small * 0.85; ctx.font = font(ts, 900); const tw = ctx.measureText(tier.name).width + 22;
      pill(c.x + c.w / 2 - tw / 2, feet + big * 1.7, tw, ts * 1.7, tier.col);
      outlinedText(ctx, tier.name, c.x + c.w / 2, feet + big * 1.7 + ts * 0.88, ts, '#ffffff', 'rgba(0,0,0,0.45)', 'center', 900);
      const descY = feet + big * 1.7 + ts * 1.7 + small * 1.9;
      wrapText(legend ? "That's every pup! Your ranch keeps earning forever. Thanks for playing!" : `"${P.desc}"`, c.x + c.w / 2, descY, small, c.w - pad * 2, '#e8e4ff', null, 700);
      const earn = income(m.level) * mergeMult();
      fitText(`Earns ${earn < 10 ? (Math.floor(earn * 10) / 10).toString() : fmt(earn)} coins/s`, c.x + c.w / 2, descY + small * 2.4, small, c.w - pad * 2, COL.good, 'rgba(0,0,0,0.4)');
      const b = { x: c.x + pad, y: c.y + c.h - pad - bh, w: c.w - pad * 2, h: bh };
      button(b, m.type === 'pup' ? 'Back' : legend ? 'Keep playing' : 'Awesome!', null, legend ? 'gold' : 'adopt', true, { name: 'm1' });
      hit.push([b, () => { if (m.type === 'pup') { closeModal(false); openModal({ type: 'book' }); } else closeModal(true); }]);
    } else if (m.type === 'world') {
      const w = WORLDS[m.world];
      drawCard(c, '#ffd23f');
      ribbon('RANCH UPGRADE!', c.x + c.w / 2, c.y - big * 0.55, Math.min(c.w * 0.8, 340), big * 0.8, '#e0a100');
      const pv = { x: c.x + pad, y: c.y + pad + big * 1.2, w: c.w - pad * 2, h: c.h * 0.36 };
      ctx.save(); rrPath(ctx, pv.x, pv.y, pv.w, pv.h, 16); ctx.clip();
      const bg = ranchBackground(m.world), f = LAYOUT.field;               // a slice of the real new ranch: sky, fence, grass
      const sw = Math.min(W, f.w), sh = Math.min(H, sw * pv.h / pv.w), sx = f.x + (f.w - sw) / 2, sy = clamp(f.y - sh * 0.5, 0, H - sh), k = bg.width / W;
      ctx.drawImage(bg, sx * k, sy * k, sw * k, sh * k, pv.x, pv.y, pv.w, pv.h);
      bigDog(m.world === 1 ? 6 : m.world === 2 ? 9 : 12, pv.x + pv.w / 2, pv.y + pv.h * 0.92, Math.min(pv.h * 1.0, pv.w * 0.5));
      ctx.restore();
      fitText(w.name, c.x + c.w / 2, pv.y + pv.h + big * 1.1, big * 1.15, c.w - pad * 2, '#ffd23f', 'rgba(0,0,0,0.5)', 'center', 900);
      const bye = m.retired ? ` Your ${m.retired} ${PUPS[m.world].name}${m.retired > 1 ? 's' : ''} retired to the farm and left you ${fmt(m.pay)} coins.` : '';
      wrapText(`A whole new ranch! Every adoption and crate now gives you ${PUPS[1 + m.world].name}.${bye}`, c.x + c.w / 2, pv.y + pv.h + big * 3.1, small, c.w - pad * 2, '#e8e4ff', null, 700, 4);
      const b = { x: c.x + pad, y: c.y + c.h - pad - bh, w: c.w - pad * 2, h: bh };
      button(b, "Let's go!", null, 'gold', true, { name: 'm1' });
      hit.push([b, () => closeModal(true)]);
    } else if (m.type === 'reset') {               // testing: confirm a brand-new playthrough
      const rc = cardBox(0.9, 0.62, 440, 420), rp = Math.max(14, rc.w * 0.05);
      drawCard(rc, '#ff6b6b');
      ribbon('START OVER?', rc.x + rc.w / 2, rc.y - big * 0.55, Math.min(rc.w * 0.7, 300), big * 0.8, '#c0392b');
      const ds = Math.min(rc.w * 0.34, rc.h * 0.3);
      bigDog(1, rc.x + rc.w / 2, rc.y + rp + big * 0.6 + ds * 0.95, ds);
      const ty = rc.y + rp + big * 0.6 + ds * 0.95 + small * 2.2;
      const th = wrapText('A brand-new playthrough: back to two Pebbles, starting prices, no upgrades, and the tutorial from step 1. Your current pups and coins are deleted.', rc.x + rc.w / 2, ty + small * 1.2, small, rc.w - rp * 2, '#e8e4ff', null, 700, 4);
      fitText('(Test button: only shown outside YouTube)', rc.x + rc.w / 2, ty + small * 1.2 + th / 2 + small * 0.7, small * 0.8, rc.w - rp * 2, '#a99fd8', null, 'center', 700);
      const half = (rc.w - rp * 3) / 2, by = rc.y + rc.h - rp - bh;
      const b1 = { x: rc.x + rp, y: by, w: half, h: bh }, b2 = { x: rc.x + rp * 2 + half, y: by, w: half, h: bh };
      button(b1, 'Cancel', null, 'plain', true, { name: 'm1' });
      button(b2, 'Restart', null, 'zoom', true, { name: 'm2', icon: 'reset' });
      hit.push([b1, () => closeModal(false)]);
      hit.push([b2, () => { closeModal(false); resetGame(); toast('New playthrough started!', 2.5); }]);
    } else if (m.type === 'offline') {
      drawCard(c, '#7ed957');
      ribbon('WELCOME BACK!', c.x + c.w / 2, c.y - big * 0.55, Math.min(c.w * 0.8, 340), big * 0.8, '#2f9e3f');
      const ds = Math.min(c.w * 0.5, c.h * 0.34), feet = c.y + c.h * 0.44;
      sunburst(c.x + c.w / 2, feet - ds * 0.38, ds * 0.8, '#ffd23f', S.t);
      bigDog(Math.max(1, S.save.best), c.x + c.w / 2, feet, ds);
      wrapText(awayText(m.seconds), c.x + c.w / 2, feet + small * 2.2, small, c.w - pad * 2, '#e8e4ff', null, 700);
      coinAmount(m.amount, c.x + c.w / 2, feet + small * 4.6, big * 1.2);
      offlineButtons({ x: c.x + pad, y: c.y + c.h - pad - bh, w: c.w - pad * 2, h: bh }, pad, hit);
    }
  }
  ctx.restore();
  S.modalHit = hit.map(([b, fn]) => [{ x: W / 2 + (b.x - W / 2) * sc, y: H / 2 + (b.y - H / 2) * sc, w: b.w * sc, h: b.h * sc }, fn]);
}
function shopRows(t) { return UPGRADES.filter(u => u.tab === t); }
function shopRow(row, r, i, small, bw, pad, hit) {   // one upgrade (or Coin Party) row; returns its buy button
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; rrPath(ctx, r.x, r.y, r.w, r.h, 14); ctx.fill();
  const is = Math.min(r.h * 0.55, 40), ix = r.x + pad * 0.6 + is / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(ix, r.y + r.h / 2, is * 0.62, 0, Math.PI * 2); ctx.fill();
  const tx = ix + is * 0.75, tw = r.w - (tx - r.x) - bw - pad;
  const b = { x: r.x + r.w - bw - pad * 0.4, y: r.y + r.h * 0.14, w: bw, h: r.h * 0.72 };
  if (row.boost) {
    icon(ctx, 'bolt', ix, r.y + r.h / 2, is * 0.8, '#ffe14f');
    fitText('Coin Party', tx, r.y + r.h * 0.33, small * 1.15, tw, '#ffffff', 'rgba(0,0,0,0.4)', 'left', 900);
    fitText(S.save.boostS > 0 ? 'x2 coins running now' : 'x2 coins for 3 minutes', tx, r.y + r.h * 0.68, small * 0.92, tw, '#d9d4ff', null, 'left', 700);
    const ok = boostReady() && !S.adBusy;
    button(b, ok ? 'Watch' : S.save.boostS > 0 ? 'Active' : 'Soon', null, 'free', ok, { name: 'sb', icon: 'play' });
    if (ok) hit.push([b, () => watchBoost()]);
    return b;
  }
  const u = row.u, k = upLevel(u.id), maxed = k >= u.max, cost = upCost(u), can = !maxed && S.save.coins >= cost;
  icon(ctx, u.icon, ix, r.y + r.h / 2, is * 0.8, '#ffd23f');
  const lvl = u.max === 1 ? (maxed ? 'OWNED' : '') : maxed ? 'MAX' : `${k}/${u.max}`;
  fitText(`${u.name}  ${lvl}`, tx, r.y + r.h * 0.33, small * 1.15, tw, '#ffffff', 'rgba(0,0,0,0.4)', 'left', 900);
  fitText(u.line(k, maxed), tx, r.y + r.h * 0.68, small * 0.95, tw, '#d9d4ff', null, 'left', 700);
  if (maxed) button(b, u.max === 1 ? 'Owned' : 'Maxed', null, 'plain', false, { name: 'u' + i });
  else { button(b, fmt(cost), null, 'gold', can, { name: 'u' + i, icon: 'coin', shine: true, seed: i * 0.4 }); hit.push([b, () => buyUpgrade(u)]); }
  return b;
}
function drawShop(hit) {
  const tutShop = S.save.tut === TUT.SHOP;
  if (tutShop) S.shopTab = 0;                        // the tutorial's Faster Crates lives on the Ranch tab
  const tab = S.shopTab || 0, rows = Math.max(...[0, 1].map(t => shopRows(t).length + (t === 0 && yt ? 1 : 0)));
  const list = shopRows(tab).map((u) => ({ u })); if (yt && tab === 0) list.push({ boost: true });
  const noteText = tutShop ? 'Tap the price to buy Faster Crates: more free pups from the sky!' : tab ? 'Lucky stacks to x8: land the next one in time!' : 'Treats multiply every coin your pups earn!';
  const noteCol = tutShop ? '#ffe14f' : '#bfb6f0', noteWt = tutShop ? 900 : 700;
  // Two tabs (v1.0): Ranch and ZOOMIES, so each page keeps big rows. Tall screens: tabs on top, one column of rows, Close at
  // the bottom. Short wide screens can't fit 5 rows that way (v1.1 playtest: 25 px rows at 915x412, one squashed row at
  // 1200x300), so there the tabs and Close move to a side column and the rows go two across.
  let c = cardBox(0.94, 0.92, 560, 720), pad = Math.max(12, c.w * 0.04);
  let big = Math.max(20, Math.min(c.w * 0.07, 32)), closeH = Math.max(50, Math.min(c.h * 0.1, 62)), tabH = Math.max(44, Math.min(c.h * 0.075, 54));
  const note = Math.max(12, Math.min(c.w * 0.032, 16));
  let tabY = c.y + pad + big * 0.75, top = tabY + tabH + pad * 0.6;
  let rh = (c.y + c.h - pad * 2 - closeH - top - note * 1.8) / rows, tabB, cb, slots, bw;
  if (!(W > H * 1.15 && rh < 60)) {
    drawCard(c, '#ffbe4d');
    ribbon('RANCH SHOP', c.x + c.w / 2, c.y - big * 0.55, Math.min(c.w * 0.7, 300), big * 0.8, '#d0700f');
    const tabW = (c.w - pad * 2.5) / 2;
    tabB = [0, 1].map(t => ({ x: c.x + pad + t * (tabW + pad * 0.5), y: tabY, w: tabW, h: tabH }));
    rh = Math.min(rh, 96); bw = Math.min(c.w * 0.32, 170);
    slots = list.map((_, i) => ({ x: c.x + pad, y: top + i * rh, w: c.w - pad * 2 }));
    cb = { x: c.x + (c.w - Math.min(c.w - pad * 2, 320)) / 2, y: c.y + c.h - pad - closeH, w: Math.min(c.w - pad * 2, 320), h: closeH };
    fitText(noteText, c.x + c.w / 2, cb.y - note * 0.95, tutShop ? note * 1.1 : note, c.w - pad * 2, noteCol, null, 'center', noteWt);
  } else {
    const k = Math.max(1, LAYOUT.unit / 64), cw = Math.min(W * 0.95, 1000 * k), ch = Math.min(H * 0.92, 560 * k);
    c = { x: (W - cw) / 2, y: (H - ch) / 2, w: cw, h: ch }; pad = Math.max(10, Math.min(cw, ch) * 0.04);
    big = Math.max(18, Math.min(ch * 0.09, 30)); closeH = Math.max(48, Math.min(ch * 0.17, 62)); tabH = Math.max(46, Math.min(ch * 0.17, 58));
    drawCard(c, '#ffbe4d');
    ribbon('RANCH SHOP', c.x + cw / 2, c.y - big * 0.55, Math.min(cw * 0.4, 300), big * 0.8, '#d0700f');
    top = c.y + pad + big * 0.5;
    const lw = clamp(cw * 0.24, 130, 230), lx = c.x + pad;
    tabB = [0, 1].map(t => ({ x: lx, y: top + t * (tabH + pad * 0.5), w: lw, h: tabH }));
    cb = { x: lx, y: c.y + ch - pad - closeH, w: lw, h: closeH };
    const ny = top + tabH * 2 + pad * 0.5, room = cb.y - ny, ns = Math.max(11, Math.min(note, room / 4));   // the note fits between
    if (room > ns * 2.6) wrapText(noteText, lx + lw / 2, ny + room / 2, ns, lw - 4, noteCol, null, noteWt, Math.max(1, Math.floor(room / (ns * 1.3)) - 1));
    const rx = lx + lw + pad, rw = c.x + cw - pad - rx, per = Math.ceil(rows / 2), colW = (rw - pad * 0.5) / 2;
    rh = Math.min((c.y + ch - pad - top) / per, 96); bw = Math.min(colW * 0.36, 170);
    slots = list.map((_, i) => ({ x: rx + Math.floor(i / per) * (colW + pad * 0.5), y: top + (i % per) * rh, w: colW }));   // top to bottom, then the next column
  }
  ['RANCH', 'ZOOMIES'].forEach((name, t) => {
    const b = tabB[t];
    button(b, name, null, t === tab ? (t ? 'zoom' : 'shop') : 'plain', t === tab || !tutShop, { name: 'tab' + t, icon: t ? 'bolt' : 'crate' });
    if (t !== tab && !tutShop) hit.push([b, () => { S.shopTab = t; SFX.click(); }]);
  });
  const gap = Math.max(6, rh * 0.1), small = Math.max(13, Math.min(rh * 0.21, 19));
  let tutRow = null, tutBtn = null;
  list.forEach((row, i) => {
    const r = { x: slots[i].x, y: slots[i].y, w: slots[i].w, h: rh - gap };
    const b = shopRow(row, r, i, small, bw, pad, hit);
    if (row.u && row.u.id === 'crate') { tutRow = r; tutBtn = b; }
  });
  if (tutShop && tutRow) {                           // tutorial: point at the first upgrade to buy
    ctx.strokeStyle = `rgba(255,225,79,${0.55 + 0.45 * Math.sin(S.t * 6)})`; ctx.lineWidth = 3.5; rrPath(ctx, tutRow.x - 2, tutRow.y - 2, tutRow.w + 4, tutRow.h + 4, 15); ctx.stroke();
    drawHand(tutBtn.x + tutBtn.w * 0.62, tutBtn.y + tutBtn.h * 0.6 + Math.sin(S.t * 6) * 4, Math.max(34, tutBtn.h * 0.75), 1, { tap: true });
  }
  button(cb, 'Close', null, 'plain', true, { name: 'mc' });
  hit.push([cb, () => closeModal(false)]);
}
function drawBook(hit) {
  const c = cardBox(0.96, 0.94, 900, 900), pad = Math.max(10, Math.min(c.w, c.h) * 0.03);
  drawCard(c, '#5cc4ff');
  const big = Math.max(20, Math.min(c.w * 0.06, 32));
  const found = S.save.found.reduce((a, b) => a + b, 0);
  ribbon(`PUP BOOK  ${found}/${MAX_LEVEL}`, c.x + c.w / 2, c.y - big * 0.55, Math.min(c.w * 0.7, 340), big * 0.8, '#1d6fb0');
  const cols = c.w / c.h > 1.25 ? 5 : 3, rows = Math.ceil(MAX_LEVEL / cols);
  const closeH = Math.max(50, Math.min(c.h * 0.09, 62));
  const top = c.y + pad + big * 0.8, areaH = c.y + c.h - pad * 2 - closeH - top, areaW = c.w - pad * 2;
  const cw = areaW / cols, ch = areaH / rows;
  for (let L = 1; L <= MAX_LEVEL; L++) {
    const i = L - 1, x = c.x + pad + (i % cols) * cw, y = top + Math.floor(i / cols) * ch, tier = TIERS[PUPS[L].tier];
    const r = { x: x + 3, y: y + 3, w: cw - 6, h: ch - 6 };
    ctx.fillStyle = S.save.found[L] ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.25)'; rrPath(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
    ctx.strokeStyle = S.save.found[L] ? tier.col : 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; rrPath(ctx, r.x, r.y, r.w, r.h, 12); ctx.stroke();
    const ps = Math.min(r.w * 1.05, r.h * 0.95);
    if (S.save.found[L]) {
      ctx.drawImage(dogStill(L, ps * DPR), r.x + r.w / 2 - ps / 2, r.y + r.h * 0.42 - ps / 2, ps, ps);
      fitText(PUPS[L].name, r.x + r.w / 2, r.y + r.h * 0.86, Math.max(11, r.h * 0.12), r.w - 8, '#ffffff', 'rgba(0,0,0,0.5)');
      hit.push([r, () => { closeModal(false); openModal({ type: 'pup', level: L }); }]);
    } else {
      ctx.globalAlpha = 0.7; ctx.drawImage(dogSilhouette(L, ps * DPR), r.x + r.w / 2 - ps / 2, r.y + r.h * 0.42 - ps / 2, ps, ps); ctx.globalAlpha = 1;
      outlinedText(ctx, '?', r.x + r.w / 2, r.y + r.h * 0.42, ps * 0.32, '#8fa0c8', null);
      fitText(`Lv.${L}`, r.x + r.w / 2, r.y + r.h * 0.86, Math.max(11, r.h * 0.12), r.w - 8, '#8fa0c8', null);
    }
  }
  const cb = { x: c.x + (c.w - Math.min(c.w - pad * 2, 320)) / 2, y: c.y + c.h - pad - closeH, w: Math.min(c.w - pad * 2, 320), h: closeH };
  button(cb, 'Close', null, 'plain', true, { name: 'mc' });
  hit.push([cb, () => closeModal(false)]);
}

// ---------- input ----------
const inside = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
function hitTest(list, x, y) { for (const [b, fn] of list) if (inside(b, x, y)) return fn; return null; }
function pressButton(name) {
  if (name === 'adopt') tryAdopt();
  else if (name === 'free') watchFreePup();
  else if (name === 'book') openModal({ type: 'book' });
  else if (name === 'shop') openModal({ type: 'shop' });
}
// During the tutorial only the thing being taught can be used (music and Start over always work).
function tutAllows(what) { const g = S.tutGate; return !g || (what === 'field' ? g.field : g.buttons.includes(what)); }
function canvasXY(e) { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
function onDown(e) {
  SFX.nudge();                                       // audio already started at boot; this is only a fallback
  if (S.paused || S.phase !== 'play') return;
  const [x, y] = canvasXY(e);
  S.cursorShown = false;
  if (S.modal) { if ((S.t - (S.modal.t0 || 0)) > 0.25) { const fn = hitTest(S.modalHit || [], x, y); if (fn) fn(); } return; }
  const tf = hitTest(S.tutHit || [], x, y); if (tf) { tf(); return; }
  const hf = hitTest(S.hudHit || [], x, y); if (hf) { hf(); return; }
  for (const [name, b] of S.hit || []) if (inside(b, x, y)) { if (tutAllows(name)) { S.press = name; S.pressB = b; } else SFX.nope(); return; }
  if (!tutAllows('field')) return;
  if (biscuitAt(x, y)) { catchBiscuit(); return; }
  const bub = dropAt(x, y); if (bub) { collectDrop(bub); return; }
  const cr = crateAt(x, y); if (cr) { openCrate(cr); return; }
  const d = dogAt(x, y);
  if (d) {
    S.drag = { dog: d, x: d.x, y: d.y, ox: x - d.x, oy: y - d.y, sx: x, sy: y, moved: false, target: null };
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  }
}
function onMove(e) {
  if (S.paused) return;
  const [x, y] = canvasXY(e);
  if (S.press && !inside(S.pressB, x, y)) S.press = null;
  const dr = S.drag; if (!dr) return;
  dr.x = x - dr.ox; dr.y = y - dr.oy;
  if (!dr.moved && Math.hypot(x - dr.sx, y - dr.sy) > 8) { dr.moved = true; SFX.pick(); dr.dog.state = 'idle'; }
  if (dr.moved) dr.target = mergeTarget(dr.dog, dr.x, dr.y - dogSize(dr.dog.lv) * 0.34);
}
function onUp(e) {
  if (S.press) { const name = S.press; S.press = null; if (!S.paused) pressButton(name); return; }
  const dr = S.drag; S.drag = null;
  if (!dr || S.paused) return;
  const d = dr.dog;
  if (!dr.moved) { petDog(d); return; }
  const tgt = mergeTarget(d, dr.x, dr.y - dogSize(d.lv) * 0.34);
  if (tgt) { mergeDogs(d, tgt); return; }
  d.x = dr.x; d.y = dr.y; keepInside(d, dogSize(d.lv));
  d.tx = d.x; d.ty = d.y; d.state = 'idle'; d.timer = rand(0.6, 1.6); d.hopT = 0.001;
  SFX.drop();
}
function cursorTargets() { return [...S.dogs.filter(d => !d.arrive), ...S.crates.filter(c => crateDrop(c) >= 1)]; }
function onKey(e) {
  if (e.key === 'Escape') { if (S.modal && S.modal.type !== 'offline') closeModal(S.modal.type !== 'book' && S.modal.type !== 'shop' && S.modal.type !== 'pup'); else S.held = null; return; }  // never preventDefault on Esc
  if (S.paused || S.phase !== 'play') return;
  const k = e.key;
  if (S.modal) {
    if (k === ' ' || k === 'Enter') {
      e.preventDefault();
      const mt = S.modal.type;
      if (mt === 'offline') collectOffline(false);
      else if (mt === 'pup') { closeModal(false); openModal({ type: 'book' }); }
      else closeModal(mt !== 'book' && mt !== 'shop');
    } else if (S.modal.type === 'shop') {          // 1-5 buy on the open tab; Tab or the arrows switch tabs
      const rw = shopRows(S.shopTab || 0);
      if (k >= '1' && k <= String(rw.length)) buyUpgrade(rw[+k - 1]);
      else if ((k === 'Tab' || k === 'ArrowLeft' || k === 'ArrowRight') && S.save.tut !== TUT.SHOP) { e.preventDefault(); S.shopTab = (S.shopTab || 0) ? 0 : 1; SFX.click(); }
    }
    return;
  }
  if (S.save.tut === TUT.ZOOM && (k === ' ' || k === 'Enter' || k === 'z' || k === 'Z')) { e.preventDefault(); tutorialZoomies(); return; }
  const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const fieldKey = k in dirs || k === ' ' || k === 'Enter' || 'cCpP'.includes(k);
  const btnKey = { a: 'adopt', A: 'adopt', b: 'book', B: 'book', s: 'shop', S: 'shop', f: 'free', F: 'free' }[k];
  if ((fieldKey && !tutAllows('field')) || (btnKey && !tutAllows(btnKey))) { if (k === ' ') e.preventDefault(); SFX.nope(); return; }
  if (k === 'c' || k === 'C') { const b = S.drops[0]; if (b) collectDrop(b); return; }   // C grabs a cash drop
  if (k === 'p' || k === 'P') { const d = S.dogs.includes(S.cursor) ? S.cursor : S.dogs.find(x => !x.arrive); if (d) petDog(d); return; }   // P pets
  if (k in dirs) {                                   // jump to the nearest pup or crate in that direction
    e.preventDefault(); S.cursorShown = true;
    const list = cursorTargets(); if (!list.length) return;
    const cur = list.includes(S.cursor) ? S.cursor : null, [dx, dy] = dirs[k];
    const ox = cur ? cur.x : LAYOUT.field.x + LAYOUT.field.w / 2, oy = cur ? cur.y : LAYOUT.field.y + LAYOUT.field.h / 2;
    let best = null, bestS = 1e9;
    for (const o of list) {
      if (o === cur) continue;
      const vx = o.x - ox, vy = o.y - oy, along = vx * dx + vy * dy, side = Math.abs(vx * dy - vy * dx);
      if (along <= 0 || side > along * 1.8) continue;
      const sc = along + side * 2; if (sc < bestS) { bestS = sc; best = o; }
    }
    if (best) S.cursor = best; else if (!cur) S.cursor = list[0];
    return;
  }
  if (k === ' ' || k === 'Enter') {
    e.preventDefault(); S.cursorShown = true;
    const c = S.cursor;
    if (!c) { S.cursor = cursorTargets()[0] || null; return; }
    if (S.crates.includes(c)) { openCrate(c); S.cursor = null; return; }
    if (!S.dogs.includes(c)) { S.cursor = null; return; }
    if (!S.held) { S.held = c; SFX.pick(); }
    else if (S.held === c) S.held = null;
    else if (canMerge(S.held, c)) { const h = S.held; S.held = null; mergeDogs(h, c); }
    else { S.held = c; SFX.pick(); }
    return;
  }
  if (k === 'a' || k === 'A') tryAdopt();
  else if (k === 'b' || k === 'B') openModal({ type: 'book' });
  else if (k === 's' || k === 'S') openModal({ type: 'shop' });
  else if ((k === 'f' || k === 'F') && yt) watchFreePup();
  else if ((k === 'r' || k === 'R') && canReset()) openModal({ type: 'reset' });   // testing only; the card asks first
  else if (k === 'm' || k === 'M') { S.save.music = S.save.music ? 0 : 1; SFX.setMusic(!!S.save.music); S.dirty = true; }
}

// ---------- loop: one loop drives everything, so pausing it halts all game work ----------
let raf = 0, lastFrame = 0;
function startLoop() { if (raf) return; lastFrame = performance.now(); raf = requestAnimationFrame(frame); }
function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
function frame(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.1); lastFrame = now;
  if (window.innerWidth !== W || window.innerHeight !== H) resize();   // safety net if a resize event was missed
  tick(dt);
  updateRanch(dt);
  S.saveTimer += dt * 1000; S.scoreTimer += dt * 1000;
  if (S.saveTimer >= CFG.AUTOSAVE_MS) { S.saveTimer = 0; saveNow(); }
  if (S.scoreTimer >= CFG.SCORE_MS) { S.scoreTimer = 0; sendBest(); }
  SFX.musicTick(worldOf(S.save.best), S.zoomLeft > 0);
  draw();
  raf = requestAnimationFrame(frame);
}

// ---------- boot: the order the certification checks expect ----------
function placeLoadedRanch() {
  const sv = S.save;
  S.dogs = []; S.crates = [];
  for (const L of sv.dogs) addDog(L, 'load');
  for (const L of sv.crates) { const c = newCrate(L); c.t0 = -10; S.crates.push(c); }
  if (LAYOUT && sv.tut === 0 && S.dogs.length === 2) {         // first visit: two Pebbles close together, the first merge is obvious
    const f = LAYOUT.field, y = f.y + f.h * 0.55;
    S.dogs[0].x = S.dogs[0].tx = f.x + f.w * 0.36; S.dogs[1].x = S.dogs[1].tx = f.x + f.w * 0.64;
    S.dogs[0].y = S.dogs[0].ty = S.dogs[1].y = S.dogs[1].ty = y; S.dogs[0].face = S.dogs[0].faceS = 1; S.dogs[1].face = S.dogs[1].faceS = -1;
    S.dogs[0].timer = S.dogs[1].timer = 6;
  }
}
async function boot() {
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', () => { dropDrag(); S.press = null; });
  window.addEventListener('keydown', onKey);
  if (yt) {
    S.audioOn = yt.system.isAudioEnabled();
    yt.system.onAudioEnabledChange((on) => { S.audioOn = on; SFX.setAllowed(on && !S.paused); });
    yt.system.onPause(pause);
    yt.system.onResume(resume);
  }
  SFX.init(); SFX.setAllowed(S.audioOn && !S.paused);
  resize();
  draw();                                            // the loading screen is up...
  if (yt) yt.game.firstFrameReady();                 // ...so tell YouTube (required, before gameReady)
  S.save = migrate(await loadSave());                // MUST finish before any saveData
  SFX.setMusic(!!S.save.music);
  if (!LAYOUT) resize();
  placeLoadedRanch();
  S.phase = 'play';
  applyOffline((Date.now() - S.save.lastSeen) / 1000);
  if (!S.paused) startLoop();
  draw();
  if (yt) yt.game.gameReady();                       // only now is the game interactive
}
boot();
