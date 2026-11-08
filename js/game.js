'use strict';
// Pup Evolution - rules: economy, upgrades, crates, cash drops, ZOOMIES, tutorial steps, saves, YouTube Playables SDK, ads.
// Boot order and rules follow the youtube-playables skill (sections 3 and 4). No drawing in this file.

const yt = (typeof ytgame !== 'undefined' && ytgame.IN_PLAYABLES_ENV) ? ytgame : null;

const CFG = {
  INC0: 1.5625, INC_G: 3,        // pup of level L earns 1.5625 * 3^(L-1) coins/s: a merge makes a pup worth 1.5 x (its two
                                 // parents), e.g. two 1/s pups make a 3/s pup (owner, 2026-11-08; was x2.2 per level)
  MERGE_BONUS: 0.15,             // every merge adds +15% to all income forever; not shown anywhere (owner: 10% on 11-06, 15% in v0.9)
  COST0: 10, COST_N: 1.075,      // tutorial adopt price = 10 * 1.075^(adoptions so far), so its two adoptions stay cheap
  // After the tutorial a pup costs S seconds of steady income, S from ADOPT_S by the best pup found so far: flat early, rising
  // late (v1.0, owner: "early game too quick, late too slow"; targets pup 5 ~2 min, pup 10 ~15 min, The Legend ~1 h).
  // Never lower than the last price paid (owner: no resets). Until v0.9 it was min(10 * 1.075^n, 100 s of income), which
  // made the first ~150 pups nearly free (pup 9 in 1-2 min) and the end slow (pup 12 to 15 took ~2 h).
  ADOPT_S: [8, 8, 8, 8, 8, 12, 18, 25, 32, 45, 100, 160, 300, 440, 640, 640],   // [best pup found]: 8 s up to pup 4, then
                                 // 12, 18, 25, 32, 45 s at pups 5-9, 100, 160, 300, 440, 640 s at pups 10-14 (index 0 unused).
                                 // v1.3 (owner: "the progression curve needs to be steep, early needs to be fast and late needs to be
                                 // slow"; a fast playthrough ~1 h). v1.2 had 12 s up to pup 4 ... 250/360/480 late; v1.0-v1.1 had 60 s
                                 // up to pup 8, so after the tutorial (one Waffles, ~86/s) each Pebble cost ~5.2K.
  ADOPT_S_OLD: { 5: [60, 60, 60, 60, 60, 60, 60, 60, 60, 70, 120, 170, 230, 320, 420, 420],   // v0.9-v1.1 saves (save version 5)
                 6: [12, 12, 12, 12, 12, 18, 28, 38, 50, 70, 120, 170, 250, 360, 480, 480] },  // v1.2 saves: for the price migration
  START_COINS: 25,               // enough for the tutorial's two adoptions
  CRATE_S: 18, CRATE_STEP: 2,    // a free crate every 18 s; Faster Crates takes 2 s off per level (5 levels: every 8 s) (owner)
  CRATES_MAX: 3,                 // the crate clock keeps running while crates wait; at most 3 unopened on the grass (owner)
  LUCKY: 0.1,                    // Lucky Crates: +10% per level (max 50%) that a crate pup is one level higher
  // Lucky Merge (owner, 2026-11-08): +10% chance per level (max 30%). Each lucky merge adds +1x coins up to x8 and the whole
  // streak stays until it breaks, and while it lasts ZOOMIES doesn't run down. Every lucky merge gives the streak its full
  // time again: 6 s, or 4 s while ZOOMIES runs (owner, v0.9; no diminishing returns). At x8 a lucky merge still resets it.
  LUCKY_M: 0.1, LUCKY_S: 6, LUCKY_ZOOM_S: 4, LUCKY_MAX: 8,
  DROP_MIN: 3, DROP_MAX: 10, DROP_S: 2, DROP_LIFE: 9, DROPS_MAX: 6,   // cash drops every 3-10 s, worth 2 s of income
  PET_S: 1, PET_CD: 1,           // tap a pup: 1 s of that pup's income, once a second per pup (owner, 2026-11-06)
  BISCUIT_S: 45, BISCUIT_FIRST: 25, BISCUIT_MIN: 30, BISCUIT_MAX: 55,   // jackpot bone: 45 s of coins, one every 30-55 s (owner: x2)
  RETIRE_S: 30,                  // pups below a new adoption level leave with 30 s of their income as a thank-you
  ZOOM_S: 15, ZOOM_MULT: 3, ZOOM_NEED: 100, ZOOM_HOLD_MAX: Infinity,   // no recharge wait: the meter fills again as soon as ZOOMIES ends (owner)
  ZOOM_MIN_PAIRS: 3, TUT_PARTY_PAIRS: 3,   // ZOOMIES party (v1.1 playtest): if the ranch has fewer twin pairs than this when ZOOMIES
                                 // starts, free pups of the adoption level drop in to make them, so every ZOOMIES merges something
                                 // (early ones started with 1-3 pups and ended "haul: 0 merges"). v1.1 shipped 1 pair to keep the
                                 // pacing; v1.2 (owner: early too slow) uses 3, the size that felt best. 0 turns it off.
  SUPER: { MULT: 5, NEED: 70, ADOPT_GAP: 0.35 },   // Super Zoomies: 30% less to fill, x5 coins, adopts pups by itself
  ZOOM_PTS: { merge: 5, drop: 2, crate: 5, pet: 3, biscuit: 25 },   // meter points = % of the bar (100 fills it; Super Zoomies
                                 // needs 70). Owner 2026-11-08: bone 25%, tap 3%, crate 5%, your merge 5% (were 30, 0.4, 3, 1)
  COMBO_GAP: 2, COMBO_MAX: 10, COMBO_S: 0.25,   // your own merges within 2 s chain; each pays combo x 0.25 s of income
  BOOST_S: 180, BOOST_MULT: 2,   // rewarded video: x2 coins for 3 minutes of play
  OFFLINE_CAP_S: 7200, OFFLINE_MIN_S: 60,
  FREE_PUP_CD_S: 180,
  ADS_FROM_FOUND: 4, AD_GAP_S: 120,   // interstitials only after the 4th pup, the tutorial, and 2 minutes apart
  AUTOSAVE_MS: 5000, SCORE_MS: 4000,
  SAVE_VERSION: 7,
};
// Shop: one price per level (income jumps x3 per pup level, so base x mul^level can't follow it), in two tabs (v1.0: Ranch and
// ZOOMIES, 4-5 rows each so every row stays big enough to tap on a phone). Prices are tuned with dev/sim.html so purchases
// come all through the run; see DESIGN.md for the latest numbers.
const TREAT_STEP = 0.5, ZOOM_LONG = 3, BONE_STEP = 25;   // Treat Bowl +50% coins, Longer Zoomies +3 s, Golden Bones +25 s
const UPGRADES = [
  { id: 'crate', tab: 0, name: 'Faster Crates', max: 5, costs: [300, 5e6, 250e6, 6e9, 4.4e11], icon: 'crate',
    line: (k, mx) => `Crate every ${CFG.CRATE_S - CFG.CRATE_STEP * k}s${mx ? '' : ' → ' + (CFG.CRATE_S - CFG.CRATE_STEP * (k + 1)) + 's'}` },
  { id: 'lucky', tab: 0, name: 'Lucky Crates', max: 5, costs: [3000, 25e6, 1e9, 1e11, 1.4e12], icon: 'clover',
    line: (k, mx) => `Better pup ${k * 10}%${mx ? '' : ' → ' + (k + 1) * 10 + '%'}` },
  { id: 'magnet', tab: 0, name: 'Coin Magnet', max: 1, costs: [75e6], icon: 'magnet',
    line: () => 'Auto-grabs cash drops' },
  { id: 'treat', tab: 0, name: 'Treat Bowl', max: 8, costs: [2e4, 2e6, 1e8, 2e9, 2e10, 4e11, 3e12, 2e13], icon: 'bowl',
    line: (k, mx) => `All coins x${1 + TREAT_STEP * k}${mx ? '' : ' → x' + (1 + TREAT_STEP * (k + 1))}` },
  { id: 'luckym', tab: 1, name: 'Lucky Merge', max: 3, costs: [9000, 500e6, 1e11], icon: 'star',
    refund: (k) => Math.ceil(9000 * Math.pow(23, k)),   // what levels 4-5 cost before v0.5 (refunded to old saves)
    line: (k, mx) => `x2 coins ${k * 10}%${mx ? '' : ' → ' + (k + 1) * 10 + '%'}` },
  { id: 'zoom', tab: 1, name: 'Super Zoomies', max: 1, costs: [2e9], icon: 'bolt',
    line: () => 'Sooner, +x2, auto-adopts' },
  { id: 'zlong', tab: 1, name: 'Longer Zoomies', max: 5, costs: [5e4, 1e7, 5e8, 1e10, 9e11], icon: 'clock',
    line: (k, mx) => `ZOOMIES ${CFG.ZOOM_S + ZOOM_LONG * k}s${mx ? '' : ' → ' + (CFG.ZOOM_S + ZOOM_LONG * (k + 1)) + 's'}` },
  { id: 'zpow', tab: 1, name: 'Zoomies Power', max: 4, costs: [2e5, 5e7, 5e9, 2e12], icon: 'up',
    line: (k, mx) => { const z = (superZoom() ? CFG.SUPER.MULT : CFG.ZOOM_MULT) + k; return `ZOOMIES coins x${z}${mx ? '' : ' → x' + (z + 1)}`; } },   // was "+x0 → +x1"
  { id: 'bone', tab: 1, name: 'Golden Bones', max: 4, costs: [1e5, 2e7, 3e9, 1.1e12], icon: 'bone',
    line: (k, mx) => `Bone pays ${CFG.BISCUIT_S + BONE_STEP * k}s${mx ? '' : ' → ' + (CFG.BISCUIT_S + BONE_STEP * (k + 1)) + 's'}` },
];
const TUT = { MERGE: 0, PET: 1, ADOPT: 2, MERGE2: 3, DROP: 4, CRATE: 5, ZOOM: 6, SHOP: 7, BOOK: 8, DONE: 9 };

const S = {
  phase: 'loading', paused: false, pausedAt: 0, audioOn: true,
  canSave: false, dirty: false, sentBest: 0,
  save: null,
  dogs: [], crates: [], drops: [], biscuit: null, parts: [], uid: 0,
  modal: null, queue: [],
  drag: null, cursor: -1, held: null,
  zoomLeft: 0, combo: 0, comboT: -9, banner: null, luckyN: 0, luckyLeft: 0, autoT: 0, pairT: 0, crowdK: 1,
  crateTimer: 0, dropTimer: 4, biscuitTimer: CFG.BISCUIT_FIRST, mergeFxT: 0, mergeSfxT: -9,
  tutT: 0, tutCount: 0, tutCheer: null, tutGift: 0,
  toast: null, adBusy: false, adBreaks: 0, lastAdT: -999,
  saveTimer: 0, scoreTimer: 0,
  t: 0,
};

// ---------- numbers ----------
const income = (L) => (L > 0 ? CFG.INC0 * Math.pow(CFG.INC_G, L - 1) : 0);
function mergeMult() { return 1 + CFG.MERGE_BONUS * S.save.merges; }
function superZoom() { return upLevel('zoom') > 0; }
function zoomPower() { return (superZoom() ? CFG.SUPER.MULT : CFG.ZOOM_MULT) + upLevel('zpow'); }   // x3 (x5 Super) + Zoomies Power
function zoomMult() { return S.zoomLeft > 0 ? zoomPower() : 1; }
function zoomDur() { return CFG.ZOOM_S + ZOOM_LONG * upLevel('zlong'); }      // 15 s + Longer Zoomies
function treatMult() { return 1 + TREAT_STEP * upLevel('treat'); }          // Treat Bowl (not in pup prices, so it speeds you up)
function zoomNeed() { return superZoom() ? CFG.SUPER.NEED : CFG.ZOOM_NEED; }
function liveMult() { return mergeMult() * treatMult() * zoomMult() * (S.save.boostS > 0 ? CFG.BOOST_MULT : 1) * luckyMult(); }
function luckyMult() { return 1 + S.luckyN; }
function luckyWindow() {                            // seconds to land the next lucky merge: 6 s, 4 s during ZOOMIES (owner)
  return S.zoomLeft > 0 ? CFG.LUCKY_ZOOM_S : CFG.LUCKY_S;
}   // seconds to the next lucky merge
function baseIncome() { let s = 0; for (const d of S.dogs) s += income(d.lv); return s; }
function totalIncome() { return baseIncome() * liveMult(); }
function adoptLevel() { return 1 + worldOf(S.save.best); }          // owner: Biscuit after pup 6, Noodle after 9, Waffles after 12
function adoptSecs() { return CFG.ADOPT_S[Math.min(S.save.best, CFG.ADOPT_S.length - 1)]; }   // seconds of steady income per pup
function adoptCost() {
  const sv = S.save;
  const byIncome = Math.max(CFG.COST0, baseIncome() * mergeMult() * adoptSecs());
  const tutorial = CFG.COST0 * Math.pow(CFG.COST_N, Math.min(sv.adopts, 5000));
  const price = sv.tut < TUT.DONE ? Math.min(tutorial, byIncome) : byIncome;
  return Math.ceil(Math.max(price, sv.lastPrice || 0));
}
function upLevel(id) { return S.save.up[id] || 0; }
function upCost(u) { return u.costs[Math.min(upLevel(u.id), u.costs.length - 1)]; }
function crateEvery() { return CFG.CRATE_S - CFG.CRATE_STEP * upLevel('crate'); }
function fmt(n) {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  const u = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  let i = -1; while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
  return (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1') + u[i];
}

// ---------- save data ----------
function freshSave() {
  const found = new Array(MAX_LEVEL + 1).fill(0); found[1] = 1;
  return { v: CFG.SAVE_VERSION, coins: CFG.START_COINS, dogs: [1, 1], crates: [], best: 1, found, freePupAt: 0,
           lastSeen: Date.now(), playS: 0, tut: 0, adopts: 0, lastPrice: 0, merges: 0, legendSeen: 0, worldSeen: 0,
           up: { magnet: 0, crate: 0, lucky: 0, luckym: 0, zoom: 0, treat: 0, zlong: 0, zpow: 0, bone: 0 }, music: 1, zoom: 0, boostS: 0 };
}
function migrate(raw) {
  let s = null;
  try { s = raw ? JSON.parse(raw) : null; } catch (e) { s = null; }
  const out = freshSave();
  if (!s || typeof s !== 'object') return out;
  const lv = (x) => { x = x | 0; return x >= 1 && x <= MAX_LEVEL ? x : 0; };
  for (const k of Object.keys(out)) if (typeof s[k] === typeof out[k] && !['dogs', 'crates', 'found', 'up'].includes(k)) out[k] = s[k];
  if (Array.isArray(s.dogs)) out.dogs = s.dogs.map(lv).filter(Boolean).slice(0, 2000);
  else if (Array.isArray(s.slots)) out.dogs = s.slots.map(lv).filter(Boolean).slice(0, 2000);   // version 1: the 4x5 grid
  if (Array.isArray(s.crates)) {                    // crates over the limit (it was 6) are opened: their pups join the ranch
    const cr = s.crates.map(lv).filter(Boolean);
    out.crates = cr.slice(0, CFG.CRATES_MAX); out.dogs = out.dogs.concat(cr.slice(CFG.CRATES_MAX, 50));
  }
  if (Array.isArray(s.found)) for (let L = 1; L <= MAX_LEVEL; L++) out.found[L] = s.found[L] ? 1 : 0;
  if (s.up && typeof s.up === 'object') for (const u of UPGRADES) {
    const had = Math.min(Math.max(s.up[u.id] | 0, 0), 99);
    out.up[u.id] = Math.min(had, u.max);
    if (u.refund) for (let k = u.max; k < had; k++) out.coins += u.refund(k);   // levels above a lowered max: refunded
  }
  out.best = 1;                                     // never trust a stored "best": rebuild it from pups found and owned
  for (let L = 1; L <= MAX_LEVEL; L++) if (out.found[L]) out.best = L;
  for (const L of out.dogs.concat(out.crates)) out.best = Math.max(out.best, L);
  for (let L = 1; L <= out.best; L++) out.found[L] = 1;
  const oldS = CFG.ADOPT_S_OLD[s.v | 0];           // saves from an older price table: the price never drops below the last one
  if (oldS) {                                       // paid, so scale that once to the current table (cheaper only, never up)
    const i = Math.min(out.best, CFG.ADOPT_S.length - 1);
    out.lastPrice *= Math.min(1, CFG.ADOPT_S[i] / oldS[i]);
  }
  const num = (x, hi) => (Number.isFinite(x) && x >= 0 ? Math.min(x, hi) : 0);
  out.coins = num(out.coins, 1e300); out.merges = Math.floor(num(out.merges, 1e9)); out.adopts = Math.floor(num(out.adopts, 1e9));
  out.lastPrice = num(out.lastPrice, 1e300); out.playS = num(out.playS, 1e9);
  out.zoom = Math.min(num(+out.zoom || 0, 99), 99);
  out.boostS = num(+out.boostS || 0, CFG.BOOST_S);
  if ((s.v | 0) === 4) out.lastPrice = Math.round(out.lastPrice / 0.7);   // v0.7-v0.8 saves: undo their 30% price cut (owner, v0.9)
  if ((s.v | 0) < 3) {                             // older versions had a 4-step tutorial (3 = done)
    const t = s.tut | 0;
    out.tut = t >= 3 ? TUT.DONE : t === 2 ? TUT.DROP : t === 1 ? TUT.ADOPT : 0;
    if ((s.v | 0) < 2) out.worldSeen = worldOf(out.best);
  }
  out.tut = Math.min(Math.max(out.tut | 0, 0), TUT.DONE);
  out.worldSeen = Math.min(out.worldSeen | 0, worldOf(out.best));
  const AL = adoptLevelFor(out.best);               // owner rule: no pups below the adoption level stay on the ranch
  const old = out.dogs.filter(L => L < AL);
  if (old.length) {
    out.dogs = out.dogs.filter(L => L >= AL);
    for (const L of old) out.coins += income(L) * (1 + CFG.MERGE_BONUS * out.merges) * CFG.RETIRE_S;
  }
  out.crates = out.crates.map(L => Math.max(L, AL));
  if (!out.dogs.length && !out.crates.length) out.dogs = [AL, AL];
  out.v = CFG.SAVE_VERSION;
  return out;
}
function adoptLevelFor(best) { return 1 + worldOf(best); }
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
async function loadSave() {
  if (!yt) { try { return localStorage.getItem('merge-kennel') || ''; } catch (e) { return ''; } }   // dev only
  for (let attempt = 0; attempt < 2; attempt++) {
    try { const d = await withTimeout(yt.game.loadData(), 2000); S.canSave = true; return d; }   // 2 x 2 s keeps boot under 5 s
    catch (e) { yt.health.logWarning(); await new Promise(r => setTimeout(r, 300)); }
  }
  yt.health.logError();                            // play on, but never save over a cloud save we couldn't read
  return '';
}
function saveNow(force) {
  if (!S.save || (!S.dirty && !force)) return;
  S.save.lastSeen = Date.now();
  S.save.dogs = S.dogs.map(d => d.lv);
  S.save.crates = S.crates.map(c => c.lv);
  const data = JSON.stringify(S.save);
  S.dirty = false;
  if (!yt) { try { localStorage.setItem('merge-kennel', data); } catch (e) {} return; }
  if (!S.canSave) return;
  yt.game.saveData(data).catch(() => { S.dirty = true; yt.health.logWarning(); });
}
function sendBest() {
  if (!yt || S.save.best <= S.sentBest) return;
  S.sentBest = S.save.best;                        // one integer: best pup level, same as the save
  yt.engagement.sendScore({ value: S.save.best }).catch(() => {});
}

// ---------- tutorial steps (drawing is in ui.js) ----------
const CHEERS = ['Nice!', 'Great!', 'Awesome!', 'Perfect!', 'Woof-tastic!'];
function tutNext(from) {
  if (!S.save || S.save.tut !== from) return;
  S.save.tut = from + 1; S.tutCount = 0; S.dirty = true;
  const st = S.save.tut, done = st === TUT.DONE;
  // a short "Nice!" between steps; the next step's card waits for it
  S.tutCheer = done ? { t0: S.t, dur: 2.6, text: 'You did it!', sub: 'Now merge your way to The Legend!' } : { t0: S.t, dur: 0.9, text: CHEERS[from % CHEERS.length] };
  S.tutT = S.t + S.tutCheer.dur;
  SFX.cheer(done);
  if (st === TUT.DROP) spawnDrop(true);
  if (st === TUT.CRATE) S.crates.push(newCrate(adoptLevel()));
  if (st === TUT.SHOP) {                            // make sure the first upgrade is affordable, so the step ends in a real purchase
    const need = upCost(UPGRADES.find(u => u.id === 'crate')) - S.save.coins;
    if (need > 0) { addCoins(Math.ceil(need) + 5); S.tutGift = Math.ceil(need) + 5; }
  }
  if (done) saveNow(true);
}
function tutActive() { return S.save && S.save.tut < TUT.DONE && S.t >= S.tutT; }
function tutorialZoomies() { if (S.save.tut === TUT.ZOOM) { startZoomies(CFG.TUT_PARTY_PAIRS); tutNext(TUT.ZOOM); } }   // the free taste gets a full party

// ---------- testing: start a brand-new playthrough (only offered outside YouTube, never touches a cloud save) ----------
function canReset() { return !yt; }
function resetGame() {
  if (!canReset()) return;
  S.save = freshSave();                            // coins, pups, upgrades, the running adopt price, tutorial: all back to the start
  Object.assign(S, { drops: [], crates: [], parts: [], biscuit: null, luckyN: 0, luckyLeft: 0, queue: [], modal: null, banner: null, toast: null,
    zoomLeft: 0, combo: 0, comboT: -9, crateTimer: 0, dropTimer: 4, biscuitTimer: CFG.BISCUIT_FIRST, mergeFxT: 0, autoT: 0, pairT: 0,
    crowdK: 1, tutCount: 0, tutCheer: null, tutGift: 0, tutT: S.t, held: null, drag: null, cursor: null, press: null, sentBest: 0, lastAdT: -999, adBreaks: 0 });
  placeLoadedRanch();
  SFX.setMusic(!!S.save.music);
  S.dirty = true; saveNow(true);
}

// ---------- actions ----------
function addCoins(n) { if (n > 0) { S.save.coins = Math.min(S.save.coins + n, 1e300); S.dirty = true; if (S.zoomLeft > 0) S.zoomCoins = (S.zoomCoins || 0) + n; } }
function spendCoins(n) { if (S.save.coins < n) return false; S.save.coins -= n; S.dirty = true; return true; }
function tryAdopt(auto) {
  const c = adoptCost();
  if (!spendCoins(c)) { if (!auto) { toast('Not enough coins yet'); SFX.nope(); } return false; }
  const sv = S.save, L = adoptLevel();
  sv.lastPrice = c; sv.adopts++;
  addDog(L, 'adopt');
  if (sv.tut === TUT.ADOPT && ++S.tutCount >= 2) tutNext(TUT.ADOPT);
  if (!auto || S.t - S.mergeSfxT > 0.2) SFX.adopt();
  return true;
}
function buyUpgrade(u) {
  if (upLevel(u.id) >= u.max) return false;
  const c = upCost(u);
  if (!spendCoins(c)) { toast('Not enough coins yet'); SFX.nope(); return false; }
  S.save.up[u.id] = upLevel(u.id) + 1;
  SFX.upgrade(); saveNow(true);
  tutNext(TUT.SHOP);
  return true;
}
// Drop pup a onto pup b: merge if they match.
function canMerge(a, b) { return a && b && a !== b && a.lv === b.lv && a.lv < MAX_LEVEL; }
function mergeDogs(a, b, auto) {
  if (!canMerge(a, b)) return false;
  const sv = S.save, L = a.lv + 1, before = adoptLevel();
  S.dogs.splice(S.dogs.indexOf(a), 1);
  b.lv = L; sv.merges++;
  let bonus = 0;
  if (!auto) {                                      // combos are for your own fast merges, not the ZOOMIES auto-merges
    if (S.t - S.comboT < CFG.COMBO_GAP) S.combo++; else S.combo = 1;
    S.comboT = S.t;
    if (S.combo >= 2) { bonus = Math.max(5, totalIncome() * Math.min(S.combo, CFG.COMBO_MAX) * CFG.COMBO_S); addCoins(bonus); }
  }
  let lucky = false;
  const lk = upLevel('luckym');
  if (lk && Math.random() < lk * CFG.LUCKY_M) {     // Lucky Merge: +1x more, and the whole streak gets its 10 s back
    lucky = true;
    S.luckyN = Math.min(S.luckyN + 1, CFG.LUCKY_MAX - 1); S.luckyLeft = luckyWindow();   // at the cap it only resets the timer
  }
  if (S.zoomLeft > 0) S.zoomMerges = (S.zoomMerges || 0) + 1;
  if (!auto || S.t - S.mergeSfxT > 0.07) {          // ZOOMIES merges climb a scale, so a big run sounds like a big run
    if (S.zoomLeft > 0) SFX.zoomPop(S.zoomMerges); else SFX.merge(L);
    S.mergeSfxT = S.t;
  }
  onMerged(b, a, bonus, lucky, auto);
  if (L > sv.best) sv.best = L;
  if (!sv.found[L]) {
    sv.found[L] = 1;
    SFX.discover();
    openModal({ type: L === MAX_LEVEL ? 'legend' : 'discover', level: L });
  }
  if (adoptLevel() > before) {                     // a new ranch: older pups retire, the world card says so
    const wi = worldOf(sv.best), r = retireOld();
    if (wi > sv.worldSeen) { sv.worldSeen = wi; openModal({ type: 'world', world: wi, retired: r.n, pay: r.pay }); }
  }
  if (!auto) { addZoom(CFG.ZOOM_PTS.merge); tutNext(TUT.MERGE); tutNext(TUT.MERGE2); }
  S.dirty = true; saveNow(); sendBest();
  return true;
}
function retireOld() {                              // owner: when adoptions move up, the older pups leave (no clutter)
  const L = adoptLevel(), gone = [];
  for (let i = S.dogs.length - 1; i >= 0; i--) if (S.dogs[i].lv < L) gone.push(S.dogs.splice(i, 1)[0]);
  for (const c of S.crates) if (c.lv < L) c.lv = L;
  let pay = 0;
  for (const d of gone) pay += income(d.lv) * mergeMult() * CFG.RETIRE_S;
  if (!gone.length) return { n: 0, pay: 0 };
  addCoins(pay);
  if (S.drag && gone.includes(S.drag.dog)) S.drag = null;
  if (gone.includes(S.held)) S.held = null;
  if (gone.includes(S.cursor)) S.cursor = null;
  for (const d of S.dogs) if (d.mate && gone.includes(d.mate)) d.mate = null;
  onRetired(gone);
  return { n: gone.length, pay };
}
function crateLevel() {
  const L = adoptLevel();
  return Math.min(MAX_LEVEL, Math.random() < upLevel('lucky') * CFG.LUCKY ? L + 1 : L);
}
function spawnCrate() { if (S.crates.length < CFG.CRATES_MAX) { S.crates.push(newCrate(crateLevel())); S.dirty = true; } }
function openCrate(c) {
  const i = S.crates.indexOf(c); if (i < 0) return;
  S.crates.splice(i, 1);
  addDog(c.lv, 'crate', c);
  SFX.crate(); addZoom(CFG.ZOOM_PTS.crate); S.dirty = true;
  tutNext(TUT.CRATE);
}
function spawnDrop(tut) {
  if (S.drops.length >= CFG.DROPS_MAX) return;
  const pool = S.dogs.filter(d => !d.arrive && d !== (S.drag && S.drag.dog));
  if (!pool.length) return;
  const d = pool[(Math.random() * pool.length) | 0];
  const b = newDrop(d, Math.max(1, totalIncome() * CFG.DROP_S));
  b.tut = !!tut;
  S.drops.push(b); SFX.pop();
}
function collectDrop(b, auto) {
  const i = S.drops.indexOf(b); if (i < 0) return;
  S.drops.splice(i, 1);
  const p = dropPos(b);
  addCoins(b.val); SFX.coins(); onCoins(p.x, p.y, b.val);
  if (!auto) addZoom(CFG.ZOOM_PTS.drop);
  if (b.tut) tutNext(TUT.DROP);
}
function petDog(d) {
  d.happy = 0.9; d.hopT = 0.001;
  if (d.petCd > 0) { onPet(d, 0); SFX.pet(false); return; }
  d.petCd = CFG.PET_CD; d.petT = S.t;
  const v = income(d.lv) * liveMult() * CFG.PET_S;  // exactly 1 s of this pup's coins (merge bonus and boosts included)
  addCoins(v); SFX.pet(true);
  onPet(d, v, addZoom(CFG.ZOOM_PTS.pet));
  if (S.save.tut === TUT.PET && ++S.tutCount >= 3) tutNext(TUT.PET);
}
function catchBiscuit() {
  const b = S.biscuit; if (!b) return;
  S.biscuit = null;
  const v = Math.max(50, totalIncome() * (CFG.BISCUIT_S + BONE_STEP * upLevel('bone')));   // Golden Bones: +25 s a level
  addCoins(v); onBiscuit(b, v); SFX.jackpot(); addZoom(CFG.ZOOM_PTS.biscuit); saveNow();
}
function startZoomies(party) { S.save.zoom = 0; S.zoomLeft = zoomDur(); S.zoomCoins = 0; S.zoomMerges = 0; S.zoomHeld = 0; S.autoT = 0; S.zoomParty = zoomParty(party == null ? CFG.ZOOM_MIN_PAIRS : party); SFX.zoomies(); onZoomies(); }
function zoomParty(want) {                         // free pups drop in until the ranch has `want` twin pairs (returns how many)
  const L = adoptLevel(), n = {};
  for (const d of S.dogs) if (d.lv < MAX_LEVEL) n[d.lv] = (n[d.lv] || 0) + 1;
  let pairs = 0; for (const k in n) pairs += n[k] >> 1;
  let add = 0;
  if (pairs < want && (n[L] || 0) % 2) { add++; pairs++; }   // a lone pup of that level gets its twin first
  add += Math.max(0, want - pairs) * 2;
  for (let i = 0; i < add; i++) addDog(L, 'gift');
  return add;
}
function addZoom(n) {                              // returns true when the points went into the meter
  if (S.zoomLeft > 0 || !S.save || S.save.tut <= TUT.ZOOM) return false;
  S.save.zoom += n;
  if (S.save.zoom >= zoomNeed()) startZoomies();
  return true;
}
function applyOffline(seconds) {
  const away = Math.min(Math.max(seconds, 0), CFG.OFFLINE_CAP_S);   // clamp clock jumps and long breaks
  if (away < CFG.OFFLINE_MIN_S) return;
  const gain = Math.floor(baseIncome() * mergeMult() * treatMult() * away);   // the Treat Bowl says "all coins" (v1.1: it was left out)
  if (gain > 0) openModal({ type: 'offline', amount: gain, seconds: away });
}

// One step of the rules. The frame loop and the pacing simulator both call this.
function tick(dt) {
  const sv = S.save, tut = sv.tut;
  S.t += dt;                                         // animation clock: keeps running behind cards
  if (S.modal) return;                               // a card on screen (shop, Pup Book, new pup...) pauses the game: no coins,
                                                     // every timer stops (v0.8 paid ZOOMIES coins forever while the shop was open)
  sv.playS += dt;
  if (S.luckyN) {                                    // the streak ends when its timer runs out (6 s, 4 s during ZOOMIES)
    S.luckyLeft = Math.min(S.luckyLeft, luckyWindow()) - dt;
    if (S.luckyLeft <= 0) { S.luckyN = 0; S.luckyLeft = 0; }
  }
  addCoins(totalIncome() * dt);
  if (S.zoomLeft > 0) {
    if (S.luckyN && (S.zoomHeld || 0) < CFG.ZOOM_HOLD_MAX) S.zoomHeld = (S.zoomHeld || 0) + dt;   // a Lucky streak holds ZOOMIES
    else S.zoomLeft -= dt;                           // (owner); ZOOM_HOLD_MAX can limit how long one ZOOMIES is held
    if (superZoom()) { S.autoT -= dt; if (S.autoT <= 0) { S.autoT = CFG.SUPER.ADOPT_GAP; if (sv.coins >= adoptCost()) tryAdopt(true); } }
    if (S.zoomLeft <= 0) { S.zoomLeft = 0; onZoomiesEnd(S.zoomCoins || 0, S.zoomMerges || 0); }   // no recharge wait
  }
  if (sv.boostS > 0) sv.boostS = Math.max(0, sv.boostS - dt);
  if (tut >= TUT.ZOOM) { S.crateTimer += dt; if (S.crateTimer >= crateEvery()) { S.crateTimer = 0; spawnCrate(); } }
  S.dropTimer -= dt;
  if (S.dropTimer <= 0) { S.dropTimer = CFG.DROP_MIN + Math.random() * (CFG.DROP_MAX - CFG.DROP_MIN); if (tut >= TUT.CRATE) spawnDrop(false); }
  if (tut === TUT.DROP && !S.drops.some(b => b.tut) && S.t - S.tutT > 0.6) spawnDrop(true);   // after a reload mid-step
  if (tut === TUT.CRATE && !S.crates.length) S.crates.push(newCrate(adoptLevel()));
  if (tut >= TUT.DONE) { S.biscuitTimer -= dt; if (S.biscuitTimer <= 0) { S.biscuitTimer = CFG.BISCUIT_MIN + Math.random() * (CFG.BISCUIT_MAX - CFG.BISCUIT_MIN); S.biscuit = newBiscuit(); } }
  for (const d of S.dogs) if (d.petCd > 0) d.petCd -= dt;
  for (let i = S.drops.length - 1; i >= 0; i--) {
    const b = S.drops[i]; b.age += dt;
    if (b.tut) continue;                             // the tutorial's cash drop waits for the player
    if (upLevel('magnet') && b.age > 0.9) collectDrop(b, true);
    else if (b.age > CFG.DROP_LIFE) S.drops.splice(i, 1);
  }
  if (S.biscuit) { S.biscuit.age += dt; if (S.biscuit.age > S.biscuit.dur) S.biscuit = null; }
}

// ---------- ads (YouTube's only; every one optional, with an equal free choice) ----------
function freePupUnlocked() { return S.save.tut >= TUT.DONE || S.save.playS > 180; }   // no video offers before the player knows the game
function freePupReady() { return freePupUnlocked() && Date.now() >= S.save.freePupAt; }
async function watchFreePup() {
  if (!yt || S.adBusy || !freePupReady()) return;
  S.adBusy = true;
  try {
    const earned = await yt.ads.requestRewardedAd('free-pup');
    if (earned) {
      addDog(Math.min(adoptLevel() + 1, MAX_LEVEL), 'gift');
      S.save.freePupAt = Date.now() + CFG.FREE_PUP_CD_S * 1000; S.dirty = true; saveNow();
    }
  } catch (e) { toast('No video right now, try later'); }
  finally { S.adBusy = false; }
}
function boostReady() { return freePupUnlocked() && S.save.boostS <= 0; }
async function watchBoost() {
  if (!yt || S.adBusy || !boostReady()) return;
  S.adBusy = true;
  try {
    const earned = await yt.ads.requestRewardedAd('coin-boost');
    if (earned) { S.save.boostS = CFG.BOOST_S; S.dirty = true; saveNow(); toast('x2 coins for 3 minutes!'); }
  } catch (e) { toast('No video right now, try later'); }
  finally { S.adBusy = false; }
}
async function collectOffline(double) {
  const m = S.modal; if (!m || m.type !== 'offline') return;
  if (double && yt && !S.adBusy) {
    S.adBusy = true;
    let earned = false;
    try { earned = await yt.ads.requestRewardedAd('offline-double'); } catch (e) { earned = false; }
    S.adBusy = false;
    addCoins(earned ? m.amount * 2 : m.amount);
    if (!earned) toast('No video right now: collected normally');
  } else addCoins(m.amount);
  SFX.coins(); closeModal(false); saveNow();
}
function naturalBreak() {
  // Interstitials only between two different screens (closing the last "new pup" card) and never early on.
  if (!yt || S.save.tut < TUT.DONE) return;
  const found = S.save.found.reduce((a, b) => a + b, 0);
  if (found < CFG.ADS_FROM_FOUND || S.t - S.lastAdT < CFG.AD_GAP_S) return;
  S.lastAdT = S.t; S.adBreaks++;
  yt.ads.requestInterstitialAd().catch(() => {});
}

// ---------- cards and toasts ----------
function openModal(m) {
  if (S.modal) { S.queue.push(m); return; }
  S.modal = m; m.t0 = S.t; S.drag = null; S.held = null;
}
function closeModal(isBreak) {
  const m = S.modal; S.modal = null;
  if (m && m.type === 'legend') S.save.legendSeen = 1;
  if (m && m.type === 'shop') tutNext(TUT.SHOP);
  if (m && m.type === 'book') tutNext(TUT.BOOK);
  if (S.queue.length) { openModal(S.queue.shift()); return; }
  if (isBreak && m && (m.type === 'discover' || m.type === 'legend' || m.type === 'world')) naturalBreak();
}
function toast(text, secs) { S.toast = { text, until: S.t + (secs || 2.2) }; }

// ---------- pause / resume: only from the SDK ----------
function pause() {
  if (S.paused) return;
  S.paused = true; S.pausedAt = Date.now();
  stopLoop();
  dropDrag();                                      // a pup being dragged is set down
  SFX.setAllowed(false);
  saveNow(true);                                    // resume is not guaranteed
  draw();
}
function resume() {
  if (!S.paused) return;
  S.paused = false;
  SFX.setAllowed(S.audioOn);
  if (S.phase === 'play') {
    if (!S.modal) applyOffline((Date.now() - S.pausedAt) / 1000);   // a long scroll-away pays like offline time
    startLoop();
  }
}
