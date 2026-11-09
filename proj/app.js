(function(){
'use strict';
var D = JSON.parse(document.getElementById('data').textContent);
var LS_KEY = 'oot-tracker-v1';
var VERS = D.vers;
var VERKEYS = VERS.map(function(v){ return v.k; });
var DEFAULT_VER = (typeof window.__ootDefVer === 'string' && window.__ootDefVer) || 'n64'; /* the window hook is for tests only */
var TABCFG = D.tabs, TABS = TABCFG.map(function(t){ return t.k; }), CFG = {};
TABCFG.forEach(function(t){ CFG[t.k] = t; });
var LISTS = D.lists, LAB = D.lab;
var state = { tab: 'main', ver: DEFAULT_VER, status: 'all', age: 'all', time: 'all', q: '', collapsed: {}, lock: true, showAll: false, dg: {} };
var lastShown = 0, activeGi = -1, laterCount = 0;
var TH = window.OOTTheme || null;
function secAttrs(name){ return TH ? TH.attrs(name) : ''; }
/* pictures are drawn in when their card comes near the screen, so a tab opens instantly */
function secBanner(name){ return TH ? '<span class="banner" aria-hidden="true" data-bn="' + esc(name) + '"></span>' : ''; }
var bnGen = 0;
/* each picture is one image (see bannerURL in the theme): cheap to put back after a re-render */
function fillBanner(s){
  if (!s || s.firstChild || !s.getAttribute('data-bn')) return;
  var im = document.createElement('img');
  im.alt = ''; im.decoding = 'async'; im.draggable = false;
  im.src = TH.bannerURL ? TH.bannerURL(s.getAttribute('data-bn'), state.ver) : '';
  s.appendChild(im);
}
function watchBanners(){
  var bs = el('list').querySelectorAll('.banner[data-bn]');
  for (var k = 0; k < bs.length; k++) fillBanner(bs[k]);
}
var revealed = new Set();
var tabTouched = false, verTouched = false, legacyHidden = false, inferHidden = false;
var got = new Set();
var hasStored = false;

function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function el(id){ return document.getElementById(id); }
function verInfo(k){ for (var i = 0; i < VERS.length; i++) if (VERS[i].k === k) return VERS[i]; return VERS[0]; }

/* ---------- static indexes ---------- */
var BASE = {};
var SUBS = {}, SUBOF = {}, NODES = [];
TABS.forEach(function(t){ LISTS[t].forEach(function(g){ g.rows.forEach(function(r){
  BASE[r.id] = { tab: t, row: r };
  if (r.subs) { SUBS[r.id] = r.subs; r.subs.forEach(function(s){ SUBOF[s.id] = r.id; BASE[s.id] = { tab: t, row: s, parent: r.id }; }); }
  /* two-Link checklists that only one game version needs (Switch 2 moved some of these) */
  if (r.v) Object.keys(r.v).forEach(function(vk){ var L = r.v[vk].subs; if (!L || SUBS[r.id]) return;
    SUBS[r.id] = L; L.forEach(function(s){ SUBOF[s.id] = r.id; BASE[s.id] = { tab: t, row: s, parent: r.id }; }); });
}); }); });
/* a first step that is just learning a song follows the song's own row, both ways */
var MIRBY = {};
Object.keys(SUBS).forEach(function(p){ SUBS[p].forEach(function(s){ if (s.mir) (MIRBY[s.mir] = MIRBY[s.mir] || []).push(s.id); }); });
/* in which versions does a row carry its checklist? */
/* a checklist as one game version has it: some dungeon steps exist only on Switch 2, or only on N64/3DS */
function subsV(p, v){ var L = SUBS[p]; if (!L) return L; v = v || state.ver;
  return L.filter(function(s){ return !s.only || s.only.indexOf(v) >= 0; }); }
function subsIn(p, v){ var r = BASE[p] && BASE[p].row; if (!r) return false; if (r.only && r.only.indexOf(v) < 0) return false;
  var o = r.v && r.v[v]; if (o && o.hide) return false; return !!((o && o.subs) || r.subs); }
var STEPS = [];
LISTS.main.forEach(function(g){ g.rows.forEach(function(r){ STEPS.push(r); }); });
var STEPPOS = {}, ANCS = {}, ANCL = {}, DESC = {}, GIVER = {};
NODES = STEPS.slice();
Object.keys(SUBS).forEach(function(p){ SUBS[p].forEach(function(s){ NODES.push(s); }); });
NODES.forEach(function(s, i){
  STEPPOS[s.id] = i;
  var a = {};
  (s.after || []).forEach(function(p){ a[p] = 1; Object.keys(ANCS[p]).forEach(function(x){ a[x] = 1; }); });
  ANCS[s.id] = a; ANCL[s.id] = Object.keys(a); DESC[s.id] = [];
});
NODES.forEach(function(s){ ANCL[s.id].forEach(function(a){ DESC[a].push(s.id); }); });
/* items a story step cannot be done without (Din's Fire for the Shadow Temple): ticked with the step, and unticking one undoes the step */
var NEEDS = {}, NEEDED_BY = {};
STEPS.forEach(function(s){ if (s.needs && s.needs.length) { NEEDS[s.id] = s.needs; s.needs.forEach(function(n){ (NEEDED_BY[n] = NEEDED_BY[n] || []).push(s.id); }); } });
var REWARDS_OF = {}, LINK_OF = {}, LINKS_FOR = null;
/* links and "who hands this over" can differ by game (Switch 2 swaps two Great Fairies), so they are rebuilt whenever the game changes */
function syncLinks(){
  if (LINKS_FOR === state.ver) return;
  LINKS_FOR = state.ver;
  Object.keys(REWARDS_OF).forEach(function(k){ delete REWARDS_OF[k]; });
  Object.keys(LINK_OF).forEach(function(k){ delete LINK_OF[k]; });
  Object.keys(GIVER).forEach(function(k){ delete GIVER[k]; });
  D.links.forEach(function(l){
    if (l.v && l.v.indexOf(state.ver) < 0) return;
    (REWARDS_OF[l.q] = REWARDS_OF[l.q] || []).push(l); LINK_OF[l.r] = l;
  });
  STEPS.forEach(function(s){
    var o = s.v && s.v[state.ver], gv = (o && o.gives) || s.gives || [];
    gv.forEach(function(g){ if (!GIVER[g]) GIVER[g] = s.id; });
  });
}
/* rows that are the same thing seen from two tabs (Scarecrow's Song) share their two-Link steps too */
var SUBPAIR = {};
var FULLN = {};
D.links.forEach(function(l){ if (l.m === 'full') FULLN[l.q] = (FULLN[l.q] || 0) + 1; });
D.links.forEach(function(l){ if (l.m !== 'full' || FULLN[l.q] !== 1 || !SUBS[l.r] || !SUBS[l.q] || SUBS[l.r].length !== SUBS[l.q].length) return;
  SUBS[l.r].forEach(function(s, i){ var t = SUBS[l.q][i]; if (s.step && t.step) { SUBPAIR[s.id] = t.id; SUBPAIR[t.id] = s.id; } }); });
var DERIV_OF = {}, DERIV_BY = {}, PARTIAL = {};
(D.derived || []).forEach(function(d){ DERIV_OF[d.i] = d; d.s.forEach(function(x){ (DERIV_BY[x] = DERIV_BY[x] || []).push(d); }); });
(D.partial || []).forEach(function(x){ PARTIAL[x] = 1; });

function tabFromHash(h){
  for (var i = 0; i < TABS.length; i++) if (CFG[TABS[i]].hash === h) return TABS[i];
  return null;
}
function parseHash(raw){
  var p = String(raw || '').replace('#', '').split(/[\/-]/);
  return { tab: tabFromHash(p[0]), ver: VERKEYS.indexOf(p[1]) >= 0 ? p[1] : null };
}
/* the address keeps the tab and game as a plain name like #skulltulas-sw2 (no slashes, so it survives being shared);
   replaceState updates it without a jump or an extra history entry */
function setHash(){
  var h = '#' + CFG[state.tab].hash + '-' + state.ver;
  if (location.hash === h) return;
  try { history.replaceState(null, '', h); } catch (e) { try { location.hash = h; } catch (e2) {} }
}

try {
  var raw = localStorage.getItem(LS_KEY);
  if (raw) {
    var j = JSON.parse(raw);
    if (j && Array.isArray(j.got)) {
      got = new Set(j.got.filter(function(x){ return typeof x === 'string'; }));
      hasStored = true;
      if (VERKEYS.indexOf(j.ver) >= 0) state.ver = j.ver;
      if (TABS.indexOf(j.tab) >= 0) state.tab = j.tab;
      if (['all', 'todo', 'ready', 'done'].indexOf(j.status) >= 0) state.status = j.status;
      if (['all', 'child', 'adult'].indexOf(j.age) >= 0) state.age = j.age;
      if (['all', 'day', 'night'].indexOf(j.time) >= 0) state.time = j.time;
      if (j.lock === false) state.lock = false;
      if (j.showAll === true) state.showAll = true;
      if (j.dg && typeof j.dg === 'object') Object.keys(j.dg).forEach(function(k){ if (j.dg[k] === true) state.dg[k] = true; });
      /* the old switch for every dungeon at once: keep those walkthroughs open */
      if (j.dsteps === true) Object.keys(SUBS).forEach(function(p){ if (SUBS[p][0] && SUBS[p][0].dg) state.dg[p] = true; });
    }
  }
} catch (e) {}
if (!hasStored) got = new Set(D.defaults);

try {
  var h0 = parseHash(location.hash);
  if (h0.tab) { state.tab = h0.tab; tabTouched = true; }
  if (h0.ver) { state.ver = h0.ver; verTouched = true; }
} catch (e) {}

/* ---------- per-version view ---------- */
function resolveRow(r, ver){
  if (r.only && r.only.indexOf(ver) < 0) return null;
  var o = r.v && r.v[ver];
  if (o && o.hide) return null;
  var m = {}, k;
  for (k in r) if (k !== 'v' && k !== 'only') m[k] = r[k];
  if (o) { for (k in o) m[k] = o[k]; m.diff = true; }
  if (m.subs) m.subs = m.subs.filter(function(s){ return !s.only || s.only.indexOf(ver) >= 0; });
  m.onlyHere = !!(r.only && r.only.length === 1);
  return m;
}
var VIEW = {}, RM = {};
function groups(tab){
  var ck = state.ver + '|' + tab;
  if (VIEW[ck]) return VIEW[ck];
  var out = [];
  LISTS[tab].forEach(function(g){
    var rows = [];
    g.rows.forEach(function(r){ var m = resolveRow(r, state.ver); if (m) rows.push(m); });
    if (!rows.length) return;
    out.push({ name: g.name, note: g.note, vnote: (g.vnote && g.vnote[state.ver]) || '', rows: rows });
  });
  VIEW[ck] = out;
  return out;
}
function rowMap(){
  syncLinks();
  var k = state.ver;
  if (RM[k]) return RM[k];
  var m = {};
  TABS.forEach(function(t){ groups(t).forEach(function(g){ g.rows.forEach(function(r){ m[r.id] = r; if (r.subs) r.subs.forEach(function(s){ m[s.id] = s; }); }); }); });
  RM[k] = m;
  return m;
}
function exists(id){ return !!rowMap()[id]; }
function findRow(id){ return rowMap()[id] || null; }

/* progress is stored per version as "ver:ID"; plain IDs are old saves not yet assigned to a game */
function key(id){ return state.ver + ':' + id; }
function has(id){ return got.has(key(id)); }
function legacyIds(){ var a = []; got.forEach(function(x){ if (x.indexOf(':') < 0) a.push(x); }); return a; }
function ids(tab){ var out = []; groups(tab).forEach(function(g){ g.rows.forEach(function(r){ out.push(r.id); }); }); return out; }
function countGot(tab){ var n = 0; ids(tab).forEach(function(i){ if (has(i)) n++; }); return n; }

/* ---------- what is done, what is unlocked ---------- */
var gotVer = 0, cacheE = null, cacheKey = '';
function touch(){ gotVer++; cacheE = null; }
function eff(){
  var ck = state.ver + '|' + gotVer;
  if (cacheE && cacheKey === ck) return cacheE;
  var s = {}, pre = state.ver + ':';
  got.forEach(function(k){ if (k.indexOf(pre) === 0) s[k.slice(pre.length)] = 1; });
  Object.keys(s).forEach(function(id){ if (ANCL[id]) ANCL[id].forEach(function(a){ s[a] = 1; }); });
  Object.keys(s).forEach(function(id){ if (NEEDS[id]) NEEDS[id].forEach(function(a){ s[a] = 1; }); });
  var n = 0;
  ids('skull').forEach(function(i){ if (s[i]) n++; });
  cacheE = { s: s, gs: n }; cacheKey = ck;
  return cacheE;
}
function leafOk(x, e){ return x.indexOf('GS:') === 0 ? e.gs >= +x.slice(3) : !!e.s[x]; }
/* once Link has grown up, child Link is out of reach until Sheik meets him in the Temple of Time after the Forest Temple
   (the Prelude of Light step): only then can the Master Sword go back in its pedestal */
var BACK = 'MQ-22';
function stuckAdult(){ return has(D.adult) && !has(BACK); }
function reqOf(r, noBack){
  var q = r.q || [];
  if ((r.age === 'Adult' || r.age === 'Both') && r.id !== D.adult) q = q.concat([[[D.adult]]]);
  if (!noBack && r.age === 'Child' && (!BASE[r.id] || BASE[r.id].tab !== 'main') && stuckAdult()) q = q.concat([[[BACK]]]);
  return q;
}
/* are a row's own requirements met (whatever the lock setting)? */
function reqMet(id){
  var r = rowMap()[id];
  if (!r) return false;
  var e = eff();
  return reqOf(r).every(function(c){ return c.some(function(o){ return o.every(function(x){ return leafOk(x, e); }); }); });
}
function unmetAny(r){
  if (!state.lock || has(r.id) || (BASE[r.id] && BASE[r.id].tab === 'main')) return [];
  var e = eff(), out = [];
  reqOf(r).forEach(function(c){
    var ok = c.some(function(o){ return o.every(function(x){ return leafOk(x, e); }); });
    if (!ok) out.push(c);
  });
  return out;
}
function stepReady(r){
  if (has(r.id)) return false;
  var e = eff();
  return (r.after || []).every(function(a){ return !!e.s[a] || (!!SUBOF[a] && !exists(a)); });
}
function leafLabel(x){
  if (x.indexOf('GS:') === 0) return x.slice(3) + ' Skulltula tokens (you have ' + eff().gs + ')';
  if (x === D.adult) return 'Master Sword (adult Link)';
  return LAB[x] || x;
}
function clauseText(c){
  if (c.length >= 3 && c.every(function(o){ return o.length === 1 && D.bottle.indexOf(o[0]) >= 0; })) return 'a bottle';
  var seen = {}, parts = [];
  c.forEach(function(o){ var t = o.map(leafLabel).join(' + '); if (!seen[t]) { seen[t] = 1; parts.push(t); } });
  return parts.join(' or ');
}
function lockText(U){
  var list = U.slice();
  if (list.length > 1) {
    var ad = list.filter(function(c){ return c.length === 1 && c[0].length === 1 && c[0][0] === D.adult; });
    if (ad.length) list = list.filter(function(c){ return ad.indexOf(c) < 0; });
  }
  var parts = list.map(clauseText);
  if (parts.length > 4) parts = parts.slice(0, 4).concat(['and ' + (parts.length - 4) + ' more']);
  return parts.join(', ');
}
/* a two-Link row whose next step can be done now counts as ready even while the row itself waits on the other age */
function halfReady(r){ return (r.subs || []).some(function(x){ return x.step && !has(x.id) && !unmetAny(x).length; }); }
/* the step a two-Link row is waiting on (null for other rows) */
function nextStep(r){
  if (!r.subs || !r.subs.length || has(r.id)) return null;
  return r.subs.filter(function(x){ return !has(x.id); })[0] || null;
}
/* ready = something can actually be done now: for a two-Link row that is its next step, whatever the row itself allows */
function rowReady(r){
  if (has(r.id)) return false;
  var nx = nextStep(r);
  return nx ? !unmetAny(nx).length : !unmetAny(r).length;
}
function readyCount(tab){
  var n = 0;
  groups(tab).forEach(function(g){ g.rows.forEach(function(r){ if (rowReady(r)) n++; }); });
  return n;
}

/* ---------- ticking: steps pull in what they need, quests and prizes follow each other ---------- */
var ref = null, writing = false, again = false, dirty = false, timer = null;
var remoteDecided = false, early = [];

var DRY = false; /* a dry run only reports what a tick would change */
function setRaw(k, on, log){
  if (on === got.has(k)) return false;
  if (DRY) { if (log) log.push([k, on]); return true; }
  if (on) got.add(k); else got.delete(k);
  touch();
  if (!remoteDecided) early.push([k, on]);
  if (log) log.push([k, on]);
  return true;
}
function setOn(id, on, log){ return setRaw(key(id), on, log); }
function tickOn(id, log, meta){
  syncLinks();
  var q = [id], seen = {}, queued = {};
  queued[id] = 1;
  /* anc = pushed as something that must come first; those are what the confirm asks about */
  function push(x, anc){ if (anc && meta && !queued[x]) meta.anc[x] = 1; queued[x] = 1; q.push(x); }
  function inSet(x){ return has(x) || !!seen[x]; }
  while (q.length) {
    var j = q.shift();
    if (seen[j] || !exists(j)) continue;
    seen[j] = 1;
    setOn(j, true, log);
    var r = rowMap()[j];
    if (ANCL[j]) ANCL[j].forEach(function(a){ push(a, 1); });
    /* the items it needs came from a Great Fairy: that quest was done too, along with its other prizes */
    if (NEEDS[j]) NEEDS[j].forEach(function(a){ push(a); var lk = LINK_OF[a]; if (lk && lk.m === 'full' && exists(lk.q)) push(lk.q); });
    (r.gives || []).forEach(function(g){ push(g); });
    /* a quest's prizes come with it; a one-way ("up") prize only once its own requirement is met
       (finishing the House of Skulltula rewards you wanted is not the same as having 50 tokens) */
    (REWARDS_OF[j] || []).forEach(function(l){ if (l.m !== 'up' || reqMet(l.r)) push(l.r); });
    /* a quest with a checklist: all steps follow it, and it follows its last step */
    if (SUBS[j]) subsV(j).forEach(function(s){ push(s.id); });
    if (SUBOF[j] && subsV(SUBOF[j]).every(function(s){ return inSet(s.id); })) push(SUBOF[j]);
    if (r.mir) push(r.mir);
    if (MIRBY[j]) MIRBY[j].forEach(function(x){ push(x); });
    if (SUBPAIR[j]) push(SUBPAIR[j]);
    /* upgrade pairs: the first quest gives the middle size, both give the biggest */
    (DERIV_BY[j] || []).forEach(function(d){
      var n = 0;
      d.s.forEach(function(x){ if (inSet(x)) n++; });
      if (n >= d.k) push(d.i);
    });
    /* ticking the upgrade itself: the quests it takes are done too, when that is clear
       (the biggest size needs both; the middle size names its quest once the other is done or still out of reach) */
    var dv = DERIV_OF[j];
    if (dv) {
      var left = dv.s.filter(function(x){ return exists(x) && !inSet(x); });
      var need = dv.k - (dv.s.length - left.length);
      if (need > 0) {
        if (left.length <= need) left.forEach(function(x){ push(x); });
        else { var open = left.filter(function(x){ return reqMet(x); }); if (open.length === need) open.forEach(function(x){ push(x); }); }
      }
    }
    var l2 = LINK_OF[j];
    if (l2 && l2.m === 'full') {
      var sib = (REWARDS_OF[l2.q] || []).filter(function(x){ return x.m === 'full' && exists(x.r); });
      if (sib.every(function(x){ return inSet(x.r); })) push(l2.q);
    }
    /* something a story step hands over: the step is done too, unless the item turns up part-way through it */
    var gv = GIVER[j];
    if (gv && !seen[gv] && exists(gv)) {
      if (PARTIAL[j]) (ANCL[gv] || []).forEach(function(a){ push(a, 1); });
      else if ((rowMap()[gv].gives || []).every(function(x){ return PARTIAL[x] || !exists(x) || inSet(x); })) push(gv);
    }
  }
}
/* mode: 0 = the row itself was unticked, 1 = it follows a linked prize (do not touch the quest's other prizes), 2 = it follows one of its checklist steps */
var REMOVING = {};
function tickOff(id, log){
  syncLinks();
  var q = [[id, 0]], seen = {}, firstGiver = null;
  REMOVING = {};
  while (q.length) {
    var it = q.shift(), j = it[0], mode = it[1];
    if (seen[j]) continue;
    seen[j] = 1; REMOVING[j] = 1;
    setOn(j, false, log);
    var r = rowMap()[j];
    (DESC[j] || []).forEach(function(a){ q.push([a, 0]); });
    (NEEDED_BY[j] || []).forEach(function(a){ if (has(a)) q.push([a, 0]); });
    /* everything a step or quest handed over goes with it: items, hearts and the rest of its prizes */
    if (mode !== 1) {
      (REWARDS_OF[j] || []).forEach(function(l){ q.push([l.r, 3]); });
      if (r) (r.gives || []).forEach(function(g){ if (exists(g)) q.push([g, 3]); });
    }
    if (mode === 0 && SUBS[j]) subsV(j).forEach(function(s){ q.push([s.id, 0]); });
    if (mode !== 0 && mode !== 2 && SUBS[j] && subsV(j).every(function(s){ return has(s.id) || REMOVING[s.id]; })) {
      var lastS = subsV(j)[subsV(j).length - 1];
      if (has(lastS.id)) q.push([lastS.id, 3]);
    }
    if (SUBOF[j]) q.push([SUBOF[j], 2]);
    if (SUBPAIR[j]) q.push([SUBPAIR[j], 0]);
    var l2 = LINK_OF[j];
    /* a quest whose whole prize is this row goes with it (Zora diving game -> Silver Scale) */
    /* unticking a one-way prize leaves its quest alone (the quest has other prizes) */
    if (l2 && l2.m === 'full') q.push([l2.q, 1]);
    /* an upgrade that needed this quest falls back (or goes) when fewer of its quests are done */
    (DERIV_BY[j] || []).forEach(function(d){
      var n = 0;
      d.s.forEach(function(x){ if (has(x) && !seen[x]) n++; });
      if (n < d.k && exists(d.i)) q.push([d.i, 3]);
    });
    /* the item you unticked came from a story step: that step is undone too, unless later steps already lean on it */
    /* any item that goes, and that a story step hands over, takes that step with it (unless later steps lean on it,
       or the step also hands over something that is staying) */
    if (mode !== 2) {
      var gv = GIVER[j];
      if (gv && !seen[gv] && has(gv) && exists(gv) && !PARTIAL[j] && !(DESC[gv] || []).some(function(x){ return has(x); }) &&
          ((rowMap()[gv].gives || []).every(function(x){ return x === j || seen[x] || !has(x) || !exists(x) || REMOVING[x]; }))) q.push([gv, 0]);
    }
  }
}
/* story steps a tick would also tick because they come first: the confirm below asks about these */
function pendingEarlier(id){
  var log = [], meta = { anc: {} }, pre = state.ver + ':', out = [];
  DRY = true;
  try { tickOn(id, log, meta); } finally { DRY = false; }
  log.forEach(function(e){
    if (!e[1] || e[0].indexOf(pre) !== 0) return;
    var x = e[0].slice(pre.length);
    if (x !== id && meta.anc[x] && STEPPOS[x] !== undefined) out.push(x);
  });
  out.sort(function(a, b){ return STEPPOS[a] - STEPPOS[b]; });
  return out;
}
var askFor = null, askBack = null;
function askEarlier(id, pend){
  var n = pend.length, own = STEPPOS[id] !== undefined, nm = chipText(id);
  askFor = id;
  el('ask-t').textContent = 'Check the earlier step' + (n === 1 ? '' : 's') + ' too?';
  el('ask-d').textContent = own
    ? (n === 1 ? 'One step before this one is not checked yet.' : n + ' steps before this one are not checked yet.')
    : '\u201c' + nm + '\u201d comes from the story, and ' + (n === 1 ? 'one step' : n + ' steps') + ' up to it ' + (n === 1 ? 'is' : 'are') + ' not checked yet.';
  var show = pend.slice(0, 4).map(function(x){ var rr = rowMap()[x]; return '<li>' + esc((rr && (rr.short || rr.name)) || x) + '</li>'; }).join('');
  if (n > 4) show += '<li class="more">and ' + (n - 4) + ' more</li>';
  el('ask-l').innerHTML = show;
  el('ask-yes').textContent = n === 1 ? 'Yes, check it' : 'Yes, check all ' + n;
  el('ask-no').textContent = 'No, leave it';
  askBack = document.activeElement;
  el('ask').classList.remove('hidden');
  document.body.classList.add('asking');
  el('ask-yes').focus();
}
function askClose(){
  el('ask').classList.add('hidden');
  document.body.classList.remove('asking');
  askFor = null;
  if (askBack && askBack.focus) { try { askBack.focus(); } catch (e) {} }
  askBack = null;
}
/* story steps that were taken out (their numbers stay retired): drop them from saved progress; what they handed over stays ticked */
var RETIRED = { 'MQ-14': 1 };
/* DG-1 to DG-41: the first, milestone-only dungeon lists (replaced by full walkthroughs) */
for (var _r = 1; _r <= 41; _r++) RETIRED['DG-' + _r] = 1;
function normalize(){
  var add = [], drop = [];
  got.forEach(function(k){ var i = k.indexOf(':'); if (i > 0 && RETIRED[k.slice(i + 1)]) drop.push(k); });
  drop.forEach(function(k){ got.delete(k); if (!remoteDecided) early.push([k, false]); });
  /* SQ-17 used to be ticked once you had the rewards you wanted; now it means every tier up to 100 tokens.
     An old tick without 100 tokens is taken back (its tiers are rebuilt from the prizes below). */
  got.forEach(function(k){
    var i = k.indexOf(':'); if (i < 0 || k.slice(i + 1) !== 'SQ-17') return;
    var v = k.slice(0, i), n = 0;
    LISTS.skull.forEach(function(g){ g.rows.forEach(function(r){ if (got.has(v + ':' + r.id)) n++; }); });
    if (n < 100) drop.push(k);
  });
  drop.forEach(function(k){ if (got.has(k)) { got.delete(k); if (!remoteDecided) early.push([k, false]); } });
  /* reward tiers (House of Skulltula): a prize you already ticked ticks its tier and the tiers before it */
  D.links.forEach(function(l){
    var s = BASE[l.q] && BASE[l.q].row;
    if (l.m !== 'full' || !s || !s.open) return;
    got.forEach(function(k){
      var i = k.indexOf(':'); if (i < 0 || k.slice(i + 1) !== l.r) return;
      var v = k.slice(0, i);
      if (l.v && l.v.indexOf(v) < 0) return;
      add.push(v + ':' + l.q);
      (ANCL[l.q] || []).forEach(function(a){ var o = BASE[a] && BASE[a].row; if (!o || !o.only || o.only.indexOf(v) >= 0) add.push(v + ':' + a); });
    });
  });
  got.forEach(function(k){
    var i = k.indexOf(':');
    if (i < 0) return;
    var v = k.slice(0, i), id = k.slice(i + 1);
    if (ANCL[id]) ANCL[id].forEach(function(a){ add.push(v + ':' + a); });
    if (NEEDS[id]) NEEDS[id].forEach(function(a){ add.push(v + ':' + a); });
  });
  /* a finished quest has its linked prizes (Switch 2 gave the Hyrule Castle fairy a new one, so older saves need catching up) */
  got.forEach(function(k){
    var i = k.indexOf(':');
    if (i < 0) return;
    var v = k.slice(0, i), id = k.slice(i + 1);
    D.links.forEach(function(l){ if (l.q === id && (!l.v || l.v.indexOf(v) >= 0)) add.push(v + ':' + l.r); });
  });
  var vers = {};
  got.forEach(function(k){ var i = k.indexOf(':'); if (i > 0) vers[k.slice(0, i)] = 1; });
  Object.keys(vers).forEach(function(v){
    Object.keys(SUBS).forEach(function(p){
      if (!subsIn(p, v)) return;
      var LV = subsV(p, v);
      if (got.has(v + ':' + p)) LV.forEach(function(s){ add.push(v + ':' + s.id); });
      else if (LV.every(function(s){ return got.has(v + ':' + s.id); })) add.push(v + ':' + p);
      LV.forEach(function(s){ if (s.mir && got.has(v + ':' + s.mir)) add.push(v + ':' + s.id); });
    });
  });
  var ch = drop.length > 0;
  add.forEach(function(k){ if (!got.has(k)) { got.add(k); ch = true; if (!remoteDecided) early.push([k, true]); } });
  return ch;
}
if (normalize()) { try { localStorage.setItem(LS_KEY, JSON.stringify({ got: Array.from(got), ver: state.ver })); } catch (e) {} }

/* ---------- filters and row html ---------- */
function matches(r){
  var on = has(r.id);
  if (state.status === 'todo' && on) return false;
  if (state.status === 'done' && !on) return false;
  if (state.status === 'ready' && !rowReady(r)) return false;
  if (state.age === 'child' && r.age === 'Adult') return false;
  if (state.age === 'adult' && r.age === 'Child') return false;
  if (state.tab === 'side') {
    if (state.time === 'day' && r.time === 'Night') return false;
    if (state.time === 'night' && r.time === 'Day') return false;
  }
  if (state.q) {
    var q = state.q.toLowerCase();
    var hay = CFG[state.tab].kind === 'quest'
      ? (r.id + ' ' + r.name + ' ' + r.kind + ' ' + (r.area || '') + ' ' + r.avail + ' ' + r.start + ' ' + r.reward + ' ' + (r.subs || []).map(function(s){ return s.name; }).join(' '))
      : (r.id + ' ' + r.where + ' ' + r.how);
    if (hay.toLowerCase().indexOf(q) < 0) return false;
  }
  return true;
}

function tagsFor(r, locked){
  var t;
  if (r.age === 'Both') t = '<span class="tag both" title="Needs both child Link and adult Link"><i class="c">Child</i><i class="a">Adult</i></span>';
  else t = '<span class="tag ' + r.age.toLowerCase() + '">' + (r.age === 'Either' ? 'Either Link' : r.age) + '</span>';
  if (r.time === 'Night') t += '<span class="tag night">Night</span>';
  if (r.time === 'Day') t += '<span class="tag day">Day</span>';
  if (r.time === 'Mixed') t += '<span class="tag mixed">Day + night</span>';
  if (BASE[r.id] && BASE[r.id].tab === 'heart' && LINK_OF[r.id] && exists(LINK_OF[r.id].q)) t += '<span class="tag prize" title="Paid out by a side quest">Quest prize</span>';
  if (r.onlyHere) t += '<span class="tag only">Only on ' + esc(verInfo(state.ver).name) + '</span>';
  /* two-Link rows say on the closed card how far along they are */
  var st = (r.subs && r.subs.length && r.subs[0].step) ? r.subs : null, half = '';
  if (st && !has(r.id)) {
    var nx = st.filter(function(x){ return !has(x.id); })[0];
    if (has(st[0].id)) half = '<span class="tag half">' + esc(st[0].age) + ' part done</span>';
    if (nx && locked && !unmetAny(nx).length) { t += half + '<span class="tag next">' + esc(nx.age) + ' part ready</span>'; return t; }
    if (nx && !locked && unmetAny(nx).length) { t += half + '<span class="tag lock">' + esc(nx.age) + ' part locked</span>'; return t; }
  }
  t += half;
  /* a quest with several prizes, some already collected (Dampé's race: the Hookshot first, the heart later) */
  if (BASE[r.id] && BASE[r.id].tab === 'side' && !has(r.id) && !st) {
    var pz = givesOf(r.id), pg = pz.filter(function(x){ return has(x); }).length;
    if (pz.length > 1 && pg) t += '<span class="tag half">' + pg + ' of ' + pz.length + ' prizes</span>';
  }
  if (locked) t += '<span class="tag lock">Locked</span>';
  else if (BASE[r.id] && BASE[r.id].tab === 'main' && stepReady(r)) t += '<span class="tag next">Next up</span>';
  return t;
}
function vnHtml(r){
  if (!r.note) return '';
  var lab = r.nlabel ? r.nlabel + '.' : (r.onlyHere ? 'New on ' : 'Differs on ') + verInfo(state.ver).name + '.';
  return '<div class="vn"><b>' + esc(lab) + '</b> ' + esc(r.note) + '</div>';
}
function rowCls(r, extra, locked){
  return 'row' + (extra || '') + (has(r.id) ? ' done' : '') + (locked ? ' locked' : '') + ((r.diff || r.onlyHere) ? ' diff' : '');
}
var PIN = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.5a6.2 6.2 0 0 0-6.2 6.2c0 4.4 6.2 10.8 6.2 10.8s6.2-6.4 6.2-10.8A6.2 6.2 0 0 0 10 1.5zm0 8.6a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8z"/></svg>';
var LOCK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-.5V4.5A3.5 3.5 0 0 0 8 1zm-2 3.5a2 2 0 1 1 4 0V6H6V4.5z"/></svg>';

function chipText(id){
  if (BASE[id] && BASE[id].tab === 'heart') return 'Piece of Heart';
  var r = rowMap()[id];
  return LAB[id] || (r && (r.short || r.name)) || id;
}
/* a requirement that only adult Link can get, shown on a row that is not an adult row: say so on the chip */
function eraTag(id, rowAge){
  if (!rowAge || rowAge === 'Adult' || id === D.adult) return '';
  var lr = rowMap()[id];
  return lr && lr.age === 'Adult' ? ' <i class="era" title="Adult Link gets this, so do it before you come back as a child">adult</i>' : '';
}
function chipBtn(id, st, rowAge){
  var r = rowMap()[id];
  if (!r) return '';
  return '<button type="button" class="chip' + (st ? ' ' + st : '') + '" data-goto="' + esc(id) + '">' +
    (st ? '<i class="mk" aria-hidden="true">' + (st === 'ok' ? '&#10003;' : '') + '</i>' : '') +
    esc(chipText(id)) + ' <small>' + esc(id) + '</small>' + eraTag(id, rowAge) + ' &rsaquo;</button>';
}
function leafChip(x, e, ra){
  if (x.indexOf('GS:') === 0) {
    var ok = e.gs >= +x.slice(3);
    return '<span class="chip gs ' + (ok ? 'ok' : 'miss') + '"><i class="mk" aria-hidden="true">' + (ok ? '&#10003;' : '') + '</i>' + esc(x.slice(3)) + ' Skulltula tokens <small>you have ' + e.gs + '</small></span>';
  }
  return chipBtn(x, leafOk(x, e) ? 'ok' : 'miss', ra) || '';
}
function clauseChips(c, e, ra){
  if (c.length >= 3 && c.every(function(o){ return o.length === 1 && D.bottle.indexOf(o[0]) >= 0; })) {
    var okb = c.some(function(o){ return leafOk(o[0], e); });
    var first = c.filter(function(o){ return exists(o[0]); })[0];
    if (!first) return '';
    return '<button type="button" class="chip bottle ' + (okb ? 'ok' : 'miss') + '" data-goto="' + esc(first[0]) + '"><i class="mk" aria-hidden="true">' + (okb ? '&#10003;' : '') + '</i>a bottle <small>any of ' + c.length + '</small> &rsaquo;</button>';
  }
  var seen = {}, parts = [];
  c.forEach(function(o){
    var t = o.map(function(x){ return leafChip(x, e, ra); }).join('<span class="pl">+</span>');
    if (t && !seen[t]) { seen[t] = 1; parts.push(t); }
  });
  return parts.length ? '<span class="nc">' + parts.join('<span class="or">or</span>') + '</span>' : '';
}
function needsHtml(r, U){
  if (has(r.id) || (BASE[r.id] && BASE[r.id].tab === 'main')) return '';
  var list = reqOf(r).slice(), e = eff();
  /* a two-Link step lists only what still stands in its way, growing up included */
  if (r.step) list = U.slice();
  else if (list.length > 1 && !r.ages) {
    var ad = list.filter(function(c){ return c.length === 1 && c[0].length === 1 && c[0][0] === D.adult; });
    if (ad.length) list = list.filter(function(c){ return ad.indexOf(c) < 0; });
  }
  var inner = list.map(function(c){ return clauseChips(c, e, r.age); }).join('');
  if (!inner) return '';
  var locked = U.length > 0, note = '';
  if (locked && !r.ages && !r.step && r.age !== 'Adult') {
    var al = [];
    U.forEach(function(c){
      var opts = c.map(function(o){ return o.filter(function(x){ var lr = rowMap()[x]; return lr && lr.age === 'Adult' && x !== D.adult && !leafOk(x, e); }); });
      if (c.length && opts.every(function(a){ return a.length; })) opts[0].forEach(function(x){ var t = leafLabel(x); if (al.indexOf(t) < 0) al.push(t); });
    });
    if (al.length) note = '<span class="eranote">Needs adult-era progress first: ' + esc(al.join(', ')) + '.</span>';
  }
  if (locked && r.age === 'Child' && stuckAdult() && U.some(function(c){ return c.length === 1 && c[0].length === 1 && c[0][0] === BACK; }))
    note += '<span class="eranote">You are adult Link now. The Master Sword can only go back in its pedestal once you clear the Forest Temple and Sheik meets you in the Temple of Time.</span>';
  return '<div class="needs' + (locked ? ' locked' : '') + '">' + (locked ? LOCK + '<b class="lt">Locked.</b> ' : '') + '<span class="cl">Needs</span>' + inner + note + '</div>';
}
/* where a row comes from: the story step that hands it over, the quest that pays it, or a pair of upgrade quests */
function sourcesOf(id){
  syncLinks();
  var out = [], gv = GIVER[id], l = LINK_OF[id], d = DERIV_OF[id];
  if (gv && exists(gv)) out.push({ ids: [gv] });
  if (l && exists(l.q) && l.q !== gv) out.push({ ids: [l.q], up: l.m === 'up' });
  if (d) out.push({ ids: d.s.filter(exists), k: d.k, n: d.s.length });
  return out;
}
function givesOf(id){
  syncLinks();
  var out = [], seen = {}, r = rowMap()[id];
  function add(x){ if (x && !seen[x] && exists(x)) { seen[x] = 1; out.push(x); } }
  ((r && r.gives) || []).forEach(add);
  (REWARDS_OF[id] || []).forEach(function(l){ add(l.r); });
  (DERIV_BY[id] || []).forEach(function(d){ add(d.i); });
  return out;
}
function linksHtml(r){
  var h = '', heart = BASE[r.id].tab === 'heart', S = sourcesOf(r.id);
  S.forEach(function(s){
    var chips = s.ids.map(function(x){ return chipBtn(x, has(x) ? 'ok' : 'miss'); }).join(s.k && s.k < s.n ? '<span class="or">or</span>' : '');
    var lab = heart ? 'Prize of side quest' : 'Obtained from';
    var note = '';
    if (s.k && s.k < s.n) note = '<span class="cm">Whichever you finish first.</span>';
    else if (s.k && s.n > 1) note = '<span class="cm">Finish both.</span>';
    if (s.up) note = '<span class="cm">The quest has other prizes too, so ticking this does not finish it.</span>';
    h += '<div class="chips"><span class="cl">' + lab + '</span>' + chips + note + '</div>';
  });
  var g = givesOf(r.id);
  if (g.length) {
    var gn = g.filter(function(x){ return has(x); }).length;
    h += '<div class="chips"><span class="cl">Gives</span>' + g.map(function(x){ return chipBtn(x, has(x) ? 'ok' : 'miss'); }).join('') +
      (g.length > 1 && !has(r.id) && gn ? '<span class="cm">' + gn + ' of ' + g.length + ' collected.</span>' : '') + '</div>';
  }
  return h;
}
/* what a checklist step's spoiler guide holds: where to go and what you get, then how */
function subHid(s){
  var title = s.short || s.name;
  return { id: s.id, name: title, guide: s.dg
    ? ['Where: ' + s.start].concat(s.guide || [], s.reward ? ['You get: ' + s.reward] : [])
    : ['Where: ' + s.start, 'You get: ' + s.reward].concat(s.guide || []) };
}
function subHtml(s){
  var on = has(s.id), U = unmetAny(s), locked = U.length > 0, tg = '';
  if (s.time === 'Night') tg += '<span class="tag night">Night</span>';
  if (s.time === 'Day') tg += '<span class="tag day">Day</span>';
  if (s.age === 'Adult') tg += '<span class="tag adult">Adult</span>';
  else if (s.age === 'Child') tg += '<span class="tag child">Child</span>';
  if (s.step) {
    var who = s.age === 'Adult' ? 'Adult Link' : 'Child Link';
    return '<div class="sub agestep' + (on ? ' done' : '') + (locked ? ' locked' : '') + '" data-sub="' + esc(s.id) + '">' +
      '<label class="chk"><input type="checkbox" data-id="' + esc(s.id) + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + ' aria-label="Done, ' + esc(who) + ': ' + esc(s.name) + (locked ? ' (locked)' : '') + '"></label>' +
      '<div class="sb"><div class="sn"><span class="stepno">' + (s.step === 1 ? 'First' : 'Then') + '</span>' + esc(s.name) + '<span class="stg">' + tg + '</span></div>' +
      (s.mir && exists(s.mir) ? '<div class="chips"><span class="cl">Same as</span>' + chipBtn(s.mir) + '</div>' : '') +
      needsHtml(s, U) + '</div></div>';
  }
  /* trading and mask chains: only the item's name shows. Who to take it to and what you get sit in the spoiler guide,
     and steps after the one you are on stay hidden until you tap them (or search, or finish the step before) */
  var title = s.short || s.name, veil = subSpoiled(s);
  var hid = subHid(s);
  if (veil) {
    return '<div class="sub veil' + (locked ? ' locked' : '') + '" data-sub="' + esc(s.id) + '">' +
      '<label class="chk"><input type="checkbox" data-id="' + esc(s.id) + '"' + (locked ? ' disabled' : '') + ' aria-label="Done with this later step (hidden)' + (locked ? ' (locked)' : '') + '"></label>' +
      '<div class="sb"><button type="button" class="spoilbtn subspoil" data-unveil="' + esc(s.id) + '"><b>Later step</b><span>Hidden so it stays a surprise. Tap to show.</span></button></div></div>';
  }
  return '<div class="sub' + (on ? ' done' : '') + (locked ? ' locked' : '') + '" data-sub="' + esc(s.id) + '">' +
    '<label class="chk"><input type="checkbox" data-id="' + esc(s.id) + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + ' aria-label="Done ' + esc(title) + (locked ? ' (locked)' : '') + '"></label>' +
    '<div class="sb"><div class="sn">' + esc(title) + '<span class="stg">' + tg + '</span></div>' +
    needsHtml(s, U) +
    '<div class="gbox" data-gbox="' + esc(s.id) + '">' + guideInner(hid) + '</div></div></div>';
}
/* a chain step is hidden while an earlier step is still open */
function subSpoiled(s){
  if (window.__ootNoVeil || s.free || s.open || has(s.id) || state.q || REVEAL[s.id]) return false;
  var p = SUBOF[s.id], L = p && rowMap()[p] && rowMap()[p].subs;
  if (!L) return false;
  var nx = L.filter(function(x){ return !has(x.id); })[0];
  return !!nx && nx.id !== s.id;
}
function subsHtml(r){
  var L = r.subs;
  if (!L || !L.length) return '';
  if (L[0].dg) {
    var nd = 0; L.forEach(function(s){ if (has(s.id)) nd++; });
    var cnt = '<span class="cnt' + (nd === L.length ? ' full' : '') + '">' + nd + '/' + L.length + '</span>';
    if (!state.dg[r.id]) {
      return '<div class="subs dg off"><button type="button" class="dgtog" data-dg="' + esc(r.id) + '" aria-expanded="false">' +
        '<b>Walkthrough</b>' + cnt + '<span class="dgl">Show ' + L.length + ' steps</span></button></div>';
    }
    return '<div class="subs dg"><div class="subh"><b>Step-by-step walkthrough</b>' + cnt +
      '<button type="button" class="linkbtn dghide" data-dg="' + esc(r.id) + '" aria-expanded="true">Hide steps</button></div>' +
      '<p class="subnote">' + (L[0].free ? 'Do these in any order. Finishing all of them finishes this step.' : 'Tick each one as you get there. Later ones stay hidden until you reach them, and each has a spoiler guide.') + '</p>' +
      L.map(subHtml).join('') + '</div>';
  }
  if (L[0].open) {
    var no = 0; L.forEach(function(s){ if (has(s.id)) no++; });
    return '<div class="subs"><div class="subh"><b>Rewards</b><span class="cnt' + (no === L.length ? ' full' : '') + '">' + no + '/' + L.length + '</span></div>' +
      '<p class="subnote">Each reward unlocks at its token count (your count is on the Skulltulas tab). Ticking one ticks the ones before it, and the item it gives.</p>' +
      L.map(subHtml).join('') + '</div>';
  }
  var n = 0, two = !!L[0].step;
  L.forEach(function(s){ if (has(s.id)) n++; });
  return '<div class="subs' + (two ? ' two' : '') + '"><div class="subh"><b>' + (two ? 'Needs both Links' : 'Checklist') + '</b><span class="cnt' + (n === L.length ? ' full' : '') + '">' + n + '/' + L.length + '</span></div>' +
    '<p class="subnote">' + (two ? 'Tick the first step when you have done it, so you know it is safe to switch ages. Ticking the second step finishes this row.' : 'Do these in order. Each step shows only the item; where it goes is in its spoiler guide, and later steps stay hidden until you reach them.') + '</p>' +
    L.map(subHtml).join('') + '</div>';
}
/* a story step lists the items it cannot be done without; they are not locks, just a reminder with a tick for the ones you have */
function stepNeedsHtml(r){
  if (!r.needs || !r.needs.length || BASE[r.id].tab !== 'main') return '';
  var e = eff(), chips = r.needs.filter(exists).map(function(x){ return leafChip(x, e, r.age); }).join('');
  return chips ? '<div class="needs sn"><span class="cl">Needs</span><span class="nc">' + chips + '</span></div>' : '';
}
function xHtml(r, U){
  var h = '';
  if (r.ages && !(r.subs && r.subs.length && r.subs[0].step)) h += '<div class="ages"><b>Needs both Links.</b> ' + esc(r.ages) + '</div>';
  h += vnHtml(r);
  h += needsHtml(r, U);
  h += stepNeedsHtml(r);
  h += linksHtml(r);
  if (BASE[r.id] && BASE[r.id].tab === 'main' && !has(r.id)) h += '<div class="chips"><button type="button" class="linkbtn" data-here="' + esc(r.id) + '">I’m here: tick every step up to this one</button></div>';
  h += subsHtml(r);
  return h ? '<div class="x">' + h + '</div>' : '';
}
function detailOf(start, area){
  var s = start || '';
  var base = area.replace(/\s*\(.*\)\s*$/, '');
  if (base && s.toLowerCase().indexOf(base.toLowerCase()) === 0) s = s.slice(base.length).replace(/^[,.:;\s]+/, '');
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s;
}

function guideInner(r){
  if (revealed.has(r.id)) {
    var st = r.guide || [];
    var body = st.length > 1
      ? '<ol>' + st.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>'
      : '<p>' + esc(st[0] || '') + '</p>';
    return '<div class="guide">' + body + '<button type="button" class="linkbtn" data-hide="' + esc(r.id) + '">Hide guide</button></div>';
  }
  return '<button type="button" class="spoil" data-reveal="' + esc(r.id) + '" aria-label="Show the spoiler guide for ' + esc(r.name) + '">' +
    '<span class="bars" aria-hidden="true"><i class="w1"></i><i class="w2"></i><i class="w3"></i></span>' +
    '<span class="lab">Spoiler guide. Tap to show</span></button>';
}

/* ---------- spoiler cover on the story ----------
   A step you cannot do yet (an earlier step is still open) is blurred, so a glance at the list does not give away what
   comes next. Tapping it shows it, and it stays shown. Searching, or jumping to a step from a chip, shows it too. */
var REVEAL = {};
try { REVEAL = JSON.parse(localStorage.getItem('oot-reveal') || '{}') || {}; } catch (e) { REVEAL = {}; }
function revealStep(id){ REVEAL[id] = 1; try { localStorage.setItem('oot-reveal', JSON.stringify(REVEAL)); } catch (e) {} }
function isSpoiled(r){
  if (window.__ootNoVeil) return false; /* test hook */
  return BASE[r.id] && BASE[r.id].tab === 'main' && !BASE[r.id].parent && !has(r.id) && !state.q && !REVEAL[r.id] && !stepReady(r);
}
function questRowHtml(r){
  var on = has(r.id), U = unmetAny(r), locked = U.length > 0, cfg = CFG[state.tab];
  var det = detailOf(r.start, r.area || '');
  var lk = state.tab === 'side' ? 'Starts at' : cfg.lab[1], sp = isSpoiled(r), ah = sp ? ' aria-hidden="true"' : '';
  return '<div class="' + rowCls(r, ' sq' + (sp ? ' veil' : ''), locked) + '" data-row="' + esc(r.id) + '">' +
    '<label class="chk"><input type="checkbox" data-id="' + esc(r.id) + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + ' aria-label="Done ' + (sp ? 'with this later step (hidden)' : esc(r.name)) + (locked ? ' (locked)' : '') + '"></label>' +
    (sp ? '<button type="button" class="spoilbtn" data-unveil="' + esc(r.id) + '"><b>Later step</b><span>Hidden so it stays a surprise. Tap to show.</span></button>' : '') +
    '<div class="id">' + esc(r.id) + '</div>' +
    '<div class="tags">' + tagsFor(r, locked) + '</div>' +
    '<div class="name"' + ah + '>' + esc(r.name) + '<span class="kind">' + esc(r.kind) + '</span></div>' +
    '<div class="loc"' + ah + '>' + PIN + '<span><span class="lk">' + esc(lk) + '</span><b>' + esc(r.area || '') + '</b>' + (det ? '<span class="ld">' + esc(det) + '</span>' : '') + '</span></div>' +
    '<div class="meta"' + ah + '>' +
      '<div><span class="k">' + esc(cfg.lab[0]) + '</span>' + esc(r.avail) + '</div>' +
      '<div><span class="k">' + esc(cfg.lab[2]) + '</span>' + esc(r.reward) + '</div>' +
    '</div>' +
    (sp ? xHtml(r, U).replace('<div class="x">', '<div class="x" aria-hidden="true">') : xHtml(r, U)) +
    '<div class="gbox" data-gbox="' + esc(r.id) + '"' + ah + '>' + guideInner(r) + '</div>' +
  '</div>';
}
function locRowHtml(r){
  var on = has(r.id), U = unmetAny(r), locked = U.length > 0;
  return '<div class="' + rowCls(r, '', locked) + '" data-row="' + esc(r.id) + '">' +
    '<label class="chk"><input type="checkbox" data-id="' + esc(r.id) + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + ' aria-label="Collected ' + esc(r.id) + (locked ? ' (locked)' : '') + '"></label>' +
    '<div class="id">' + esc(r.id) + '</div>' +
    '<div class="tags">' + tagsFor(r, locked) + '</div>' +
    '<div class="where">' + esc(r.where) + '</div>' +
    '<div class="how">' + esc(r.how) + '</div>' +
    xHtml(r, U) +
  '</div>';
}
function rowHtml(r){ return CFG[state.tab].kind === 'quest' ? questRowHtml(r) : locRowHtml(r); }

/* the story tab only shows as far ahead as you are, so it stays spoiler free */
function horizon(G){
  var last = 0;
  G.forEach(function(g, gi){ g.rows.forEach(function(r){ if (has(r.id) || stepReady(r)) last = gi; }); });
  return last;
}
function curGroups(){
  var G = groups(state.tab);
  laterCount = 0;
  if (state.tab === 'main' && !state.showAll && !state.q) {
    var h = horizon(G);
    for (var i = h + 1; i < G.length; i++) laterCount += G[i].rows.length;
    return G.slice(0, h + 1);
  }
  return G;
}

function renderList(){
  var G = curGroups();
  var html = '', shown = 0, hz = (state.tab === 'main' && state.showAll && !state.q) ? horizon(G) : -1, hideBar = hz >= 0 && hz < G.length - 1;
  G.forEach(function(g, gi){
    var rows = g.rows.filter(matches);
    if (hideBar && gi === hz + 1) html += '<section class="later showing"><button type="button" class="laterbtn" data-hideall="1"><b>Later steps are showing</b><span>Tap to hide everything after this point again, so the story stays a surprise.</span></button></section>';
    if (!rows.length) return;
    shown += rows.length;
    var total = g.rows.length, n = 0;
    g.rows.forEach(function(r){ if (has(r.id)) n++; });
    var coll = isColl(g) && !state.q;
    html += '<section class="grp' + (coll ? ' coll' : '') + '" id="g' + gi + '" data-g="' + gi + '" ' + secAttrs(g.name) + '><h2><button type="button" class="gh' + (g.name.length > 26 ? ' lg' : '') + '" data-gi="' + gi + '" aria-expanded="' + (coll ? 'false' : 'true') + '">' + secBanner(g.name) + '<span class="chev" aria-hidden="true"></span><span class="gname">' + esc(g.name) + '</span><span class="cnt' + (n === total ? ' full' : '') + '">' + n + '/' + total + '</span><i class="gp" aria-hidden="true"><b style="width:' + Math.round(100 * n / total) + '%"></b></i></button></h2>';
    if (!coll) {
      if (g.note) html += '<p class="note">' + esc(g.note) + '</p>';
      if (g.vnote) html += '<p class="note"><b>' + esc(verInfo(state.ver).name) + ':</b> ' + esc(g.vnote) + '</p>';
      html += rows.map(rowHtml).join('');
    }
    html += '</section>';
  });
  if (laterCount) html += '<section class="later"><button type="button" class="laterbtn" data-showall="1"><b>Later in the story</b><span>' + laterCount + ' more steps stay hidden until you reach them. Tap to show them now.</span></button></section>';
  lastShown = shown;
  if (!shown && !laterCount) html = '<p class="empty">Nothing matches these filters.</p>';
  else if (!shown) html = '<p class="empty">Nothing matches these filters.</p>' + html;
  el('list').innerHTML = html;
  watchBanners();
}
/* only the art you can see moves, so a long list stays light on a phone */
var cardIO = null;
function watchCards(){
  var secs = el('list').querySelectorAll('.grp');
  if (!('IntersectionObserver' in window)) { for (var i = 0; i < secs.length; i++) secs[i].classList.add('live'); return; }
  if (cardIO) cardIO.disconnect();
  /* only pictures that are actually on screen move (an open card scrolled past its picture stands still) */
  cardIO = new IntersectionObserver(function(es){ es.forEach(function(e){ var g = e.target.closest('.grp'); if (g) g.classList.toggle('live', e.isIntersecting); }); }, { rootMargin: '40px 0px' });
  for (var j = 0; j < secs.length; j++) { var gh = secs[j].querySelector('.gh') || secs[j]; cardIO.observe(gh); }
}
function ckey(name){ return state.tab + '|' + state.ver + '|' + name; }
/* every area starts closed so the list is quick to scan; on the story tab the chapter you are in starts open.
   state.collapsed holds explicit choices: 1 = closed, 0 = open */
function isColl(g){
  if (window.__ootOpen) return false; /* test hook: start every area open */
  var v = state.collapsed[ckey(g.name)];
  if (v === 1) return true;
  if (v === 0) return false;
  if (state.tab === 'main') {
    var Gm = groups('main');
    if (defOpen[state.ver] == null) defOpen[state.ver] = Gm[horizon(Gm)] ? Gm[horizon(Gm)].name : '';
    return g.name !== defOpen[state.ver];
  }
  return true;
}
var defOpen = {};
function filtered(){ return state.status !== 'all' || state.age !== 'all' || (state.tab === 'side' && state.time !== 'all') || !!state.q; }
function jumpHtml(){
  var o = '<option value="">Areas &#9662;</option>';
  curGroups().forEach(function(g, gi){
    var n = 0; g.rows.forEach(function(r){ if (has(r.id)) n++; });
    o += '<option value="' + gi + '">' + (n === g.rows.length ? '✓ ' : '') + esc(g.name) + ' (' + n + '/' + g.rows.length + ')</option>';
  });
  return o;
}
function renderNav(){
  var nav = el('areanav');
  if (!nav) return;
  var h = '';
  curGroups().forEach(function(g, gi){
    var n = 0, shown = 0;
    g.rows.forEach(function(r){ if (has(r.id)) n++; if (matches(r)) shown++; });
    var tot = g.rows.length;
    h += '<button type="button" class="an' + (n === tot ? ' full' : '') + (shown ? '' : ' none') + (gi === activeGi ? ' on' : '') + '" data-gi="' + gi + '" ' + secAttrs(g.name) + '>' +
      '<span class="dot" aria-hidden="true"></span><span class="nm">' + esc(g.name) + '</span><span class="ct">' + (n === tot ? '✓ ' : '') + n + '/' + tot + '</span>' +
      '<i class="pb" aria-hidden="true"><b style="width:' + Math.round(100 * n / tot) + '%"></b></i></button>';
  });
  if (laterCount) h += '<button type="button" class="an later-an" data-showall="1"><span class="dot" aria-hidden="true"></span><span class="nm">Later in the story</span><span class="ct">' + laterCount + '</span></button>';
  nav.innerHTML = h;
}
function markNav(){
  var nav = el('areanav'), items = nav.querySelectorAll('.an'), on = null;
  for (var i = 0; i < items.length; i++) {
    var is = +items[i].getAttribute('data-gi') === activeGi;
    items[i].classList.toggle('on', is);
    if (is) on = items[i];
  }
  if (on && nav.scrollHeight > nav.clientHeight) {
    var nb = nav.getBoundingClientRect(), ib = on.getBoundingClientRect();
    if (ib.top < nb.top) nav.scrollTop -= nb.top - ib.top + 6;
    else if (ib.bottom > nb.bottom) nav.scrollTop += ib.bottom - nb.bottom + 6;
  }
}
function goArea(gi){
  var gj = curGroups()[gi];
  if (!gj) return;
  if (isColl(gj)) { state.collapsed[ckey(gj.name)] = 0; renderList(); renderCounts(); }
  var sec = el('g' + gi);
  if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function syncSegs(){
  [['seg-status', 'status'], ['seg-age', 'age'], ['seg-time', 'time']].forEach(function(p){
    var all = el(p[0]).querySelectorAll('button');
    for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-pressed', all[i].getAttribute('data-v') === state[p[1]] ? 'true' : 'false');
  });
  var lb = el('lockon');
  lb.setAttribute('aria-pressed', state.lock ? 'true' : 'false');
  lb.textContent = state.lock ? 'Locks on' : 'Locks off';
}

function isAdultNow(){ return !!(D && D.adult && has(D.adult)); }
function tabHtml(t){
  var c = CFG[t], tot = ids(t).length;
  var ic = TH && TH.icon ? '<span class="tic" aria-hidden="true">' + TH.icon(t, state.ver, isAdultNow()) + '</span>' : '';
  return ic + '<span class="tn"><span class="tf">' + esc(c.name) + '</span><span class="ts">' + esc(c.short || c.name) + '</span></span><small><b>' + countGot(t) + '</b><span class="of"> of ' + tot + '</span></small>';
}
function renderCounts(){
  TABS.forEach(function(t){
    var b = el('tab-' + t);
    b.innerHTML = tabHtml(t);
    b.setAttribute('aria-label', CFG[t].name + ', ' + countGot(t) + ' of ' + ids(t).length);
    b.setAttribute('aria-selected', state.tab === t ? 'true' : 'false');
  });
  if (TH && TH.status) { var sb = el('sysbar'), got = 0, all = 0; TABS.forEach(function(t){ got += countGot(t); all += ids(t).length; }); if (sb) sb.innerHTML = TH.status(state.ver, all ? got / all : 0); }
  var tot2 = ids(state.tab).length, n = countGot(state.tab);
  el('barfill').style.width = (tot2 ? (100 * n / tot2) : 0) + '%';
  var rd = (state.lock && state.tab !== 'main') ? ' · ' + readyCount(state.tab) + ' ready' : '';
  el('sumtext').textContent = n + ' ' + CFG[state.tab].verb + ' · ' + (tot2 - n) + ' to go' + rd + (filtered() ? ' · showing ' + lastShown : '');
  el('jump').innerHTML = jumpHtml();
  renderNav();
  var Gc = curGroups(), anyOpen = Gc.some(function(g){ return !isColl(g); });
  el('collapse').textContent = anyOpen ? 'Collapse all' : 'Expand all';
  el('collapse').classList.toggle('hidden', Gc.length < 2);
  var secs = document.querySelectorAll('.grp');
  for (var i = 0; i < secs.length; i++) {
    var gi = +secs[i].getAttribute('data-g'), g = Gc[gi];
    if (!g) continue;
    var c = 0; g.rows.forEach(function(r){ if (has(r.id)) c++; });
    var cnt = secs[i].querySelector('.cnt');
    cnt.textContent = c + '/' + g.rows.length;
    cnt.className = 'cnt' + (c === g.rows.length ? ' full' : '');
    var gpb = secs[i].querySelector('.gp b'); if (gpb) gpb.style.width = Math.round(100 * c / g.rows.length) + '%';
  }
}

function renderLegacy(){
  var box = el('legacy'), L = legacyIds();
  if (!L.length || legacyHidden) { box.classList.add('hidden'); box.innerHTML = ''; return; }
  box.classList.remove('hidden');
  box.innerHTML = '<p><b>' + L.length + ' checkmark' + (L.length === 1 ? ' is' : 's are') + ' not tied to a game yet.</b> ' +
    'They are the pre-ticked Skulltulas or ones you saved before game versions existed here. Which game are they from?</p>' +
    '<div class="b">' + VERS.map(function(v){ return '<button type="button" data-claim="' + esc(v.k) + '">' + esc(v.name) + '</button>'; }).join('') +
    '<button type="button" data-claim="later">Ask me later</button></div>';
}

/* checkmarks that imply story steps you have not ticked */
function inferSteps(){
  var e = eff(), need = {}, M = rowMap();
  function want(x){
    if (x.indexOf('MQ-') === 0 || SUBOF[x]) { need[x] = 1; return; }
    var gv = GIVER[x];
    if (!gv) return;
    /* an item found part-way through a dungeon only proves the steps before it */
    if (PARTIAL[x]) (ANCL[gv] || []).forEach(function(a){ need[a] = 1; }); else need[gv] = 1;
  }
  Object.keys(M).forEach(function(id){
    var r = M[id];
    if (id.indexOf('MQ-') === 0 || !has(id)) return;
    want(id);
    reqOf(r, true).forEach(function(c){
      if (c.length !== 1) return;
      c[0].forEach(function(x){ if (x.indexOf('GS:') !== 0) want(x); });
    });
  });
  var out = Object.keys(need).filter(function(s){ return !e.s[s] && exists(s); });
  out.sort(function(a, b){ return STEPPOS[a] - STEPPOS[b]; });
  return out;
}
function renderInfer(){
  var box = el('infer');
  var L = (state.lock && !inferHidden) ? inferSteps() : [];
  if (!L.length) { box.classList.add('hidden'); box.innerHTML = ''; return; }
  var last = rowMap()[L[L.length - 1]];
  box.classList.remove('hidden');
  box.innerHTML = '<p><b>Your checkmarks say you are further along than your story steps.</b> ' + L.length + ' step' + (L.length === 1 ? '' : 's') +
    ' they depend on ' + (L.length === 1 ? 'is' : 'are') + ' not ticked' + (last ? ' (the furthest is ' + esc(last.short || last.name) + ')' : '') + ', so some rows look locked.</p>' +
    '<div class="b"><button type="button" data-infer="yes">Tick those steps</button><button type="button" data-infer="no">Not now</button></div>';
}

/* where you are, shown on the story tab */
function renderStory(){
  var box = el('story');
  if (state.tab !== 'main') { box.innerHTML = ''; return; }
  var next = STEPS.map(function(s){ return rowMap()[s.id]; }).filter(function(r){ return r && stepReady(r); });
  var h = '<div class="st-h">Where you are</div>';
  if (next.length) {
    h += '<p class="st-p"><span class="cl">Next up</span> ' + next.slice(0, 5).map(function(r){
      return '<button type="button" class="chip" data-goto="' + esc(r.id) + '">' + esc(r.short || r.name) + '</button>';
    }).join('') + (next.length > 5 ? ' and ' + (next.length - 5) + ' more' : '') + '</p>';
  } else if (countGot('main') === ids('main').length) {
    h += '<p class="st-p">You have finished the story, so everything is unlocked.</p>';
  }
  h += '<p class="st-p"><span class="cl">Ready now</span> ' + TABS.filter(function(t){ return t !== 'main'; }).map(function(t){
    var nr = state.lock ? readyCount(t) : ids(t).length - countGot(t), lb = CFG[t].short || CFG[t].name;
    if (nr === 1) lb = lb.replace(/s$/, '');
    return '<button type="button" class="chip" data-readytab="' + t + '"><b>' + nr + '</b> ' + esc(lb) + '</button>';
  }).join('') + '</p>';
  if (!state.showAll && laterCount) h += '<p class="st-p mute">Later steps are hidden so the story stays a surprise. <button type="button" class="linkbtn" data-showall="1">Show them</button></p>';
  else if (state.showAll) h += '<p class="st-p mute"><button type="button" class="chip" data-hideall="1">Hide later steps again</button></p>';
  h += beansHtml();
  box.innerHTML = '<div class="story">' + h + '</div>';
}
/* Magic beans: the soil spots whose sprout leads to a prize. A spot counts as planted once its child step
   (or the prize itself) is ticked, so the count follows your checkmarks. */
var BEAN_SPOTS = [
  { n: 'Lost Woods', r: ['LW-3'] }, { n: 'Graveyard', r: ['HP-15'] }, { n: 'Death Mountain Trail', r: ['HP-17'] },
  { n: 'Death Mountain Crater', r: ['HP-20'] }, { n: 'Lake Hylia', r: ['HP-28'] }, { n: 'Desert Colossus', r: ['HP-36', 'CL-3'] }
];
function beanPlanted(sp){
  return sp.r.some(function(id){
    if (!exists(id)) return false;
    if (has(id)) return true;
    var L = subsV(id);
    return !!(L && L.length && L[0].step && has(L[0].id));
  });
}
function beansHtml(){
  var spots = BEAN_SPOTS.filter(function(sp){ return sp.r.some(exists); });
  if (!spots.length) return '';
  var n = spots.filter(beanPlanted).length, left = spots.length - n;
  var chips = spots.map(function(sp){
    var ok = beanPlanted(sp);
    return '<button type="button" class="chip bottle ' + (ok ? 'ok' : 'miss') + '" data-goto="' + esc(sp.r.filter(exists)[0]) + '" aria-label="' + esc(sp.n) + (ok ? ', planted' : ', not planted yet') + '">' +
      '<i class="mk" aria-hidden="true">' + (ok ? '&#10003;' : '') + '</i>' + esc(sp.n) + '</button>';
  }).join('');
  var msg = left ? '<b>' + n + ' of ' + spots.length + '</b> planted. You need <b>' + left + '</b> more bean' + (left === 1 ? '' : 's') + ' for the rest.'
                 : 'All ' + spots.length + ' planted. You need no more beans.';
  return '<p class="st-p"><span class="cl">Magic beans</span> <span>' + msg + '</span></p><p class="st-p">' + chips + '</p>' +
    '<p class="st-p mute">Counted from your ticks: a spot is planted once its child step (or its prize) is ticked. These are the soil spots whose sprout leads to a Piece of Heart or a Skulltula; buy the beans from the seller in Zora\'s River.</p>';
}

function renderChrome(){
  el('jump').innerHTML = jumpHtml();
  syncSegs();
  var T = state.tab, vname = verInfo(state.ver).name, cfg = CFG[T];
  var vt = VERS.map(function(v){
    return '<button type="button" class="vtab" role="tab" data-ver="' + esc(v.k) + '" aria-selected="' + (state.ver === v.k ? 'true' : 'false') + '"><span class="vn1">' + esc(v.name) + '</span>' + (TH && TH.years ? '<small>' + esc(TH.years[v.k] || '') + '</small>' : '') + '</button>';
  }).join('');
  el('vtabs').innerHTML = vt;
  el('vtabs2').innerHTML = vt;
  document.body.setAttribute('data-ver', state.ver);
  document.body.setAttribute('data-tab', T);
  el('tabinfo').textContent = cfg.info || '';
  var P = D.vnotes[T] && D.vnotes[T][state.ver];
  el('vpanel').innerHTML = P
    ? '<details class="vpanel"><summary>' + (state.ver === 'sw2' ? 'Early data. ' : '') + 'What differs on ' + esc(vname) + ' (' + P.items.length + ')</summary><p class="lead">' + esc(P.lead) + '</p><ul>' +
      P.items.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details>'
    : '';
  el('footnote').textContent = cfg.foot || '';
  el('seg-time').classList.toggle('hidden', T !== 'side');
  el('q').placeholder = cfg.ph || 'Search';
  var srcList = (D.src[T] || []).concat(D.vsources[state.ver] || []);
  el('sources').innerHTML = srcList.map(function(s){ return '<a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + '</a>'; }).join(' · ');
}

function renderAll(){ touch(); renderChrome(); renderLegacy(); renderInfer(); renderList(); renderStory(); renderCounts(); }
function renderKeep(){
  var rows = el('list').querySelectorAll('.row'), anchor = null, off = 0;
  for (var i = 0; i < rows.length; i++) {
    var b = rows[i].getBoundingClientRect();
    if (b.bottom > 130) { anchor = rows[i].getAttribute('data-row'); off = b.top; break; }
  }
  var ae = document.activeElement, fid = ae && ae.getAttribute ? ae.getAttribute('data-id') : null;
  renderLegacy(); renderInfer(); renderList(); renderStory(); renderCounts();
  if (anchor) {
    var n = el('list').querySelector('[data-row="' + anchor + '"]');
    if (n) window.scrollBy(0, n.getBoundingClientRect().top - off);
  }
  if (fid) {
    var inp = el('list').querySelector('input[data-id="' + fid + '"]');
    if (inp) inp.focus({ preventScroll: true });
  }
}

/* ---------- toast with undo ---------- */
var toastT = null, undoLog = null;
function showToast(msg, log){
  undoLog = log || null;
  var t = el('toast');
  t.innerHTML = '<span>' + esc(msg) + '</span>' + (log ? '<button type="button" id="undo">Undo</button>' : '');
  t.classList.remove('hidden');
  clearTimeout(toastT);
  toastT = setTimeout(function(){ t.classList.add('hidden'); undoLog = null; }, 9000);
}
el('toast').addEventListener('click', function(ev){
  if (!ev.target || ev.target.id !== 'undo' || !undoLog) return;
  var L = undoLog; undoLog = null;
  for (var i = L.length - 1; i >= 0; i--) setRaw(L[i][0], !L[i][1]);
  el('toast').classList.add('hidden');
  touch(); saveLocal(); schedule(); renderKeep();
});
function finish(log, verb){
  touch(); saveLocal(); schedule();
  var n = log.length;
  if (n > 1) showToast((verb || 'Marked') + ' ' + n + ' things across your lists.', log);
  renderKeep();
}

/* ---------- persistence ---------- */
function setSync(t){ var s = el('sync'); if (s) s.textContent = t; }
function saveLocal(){
  try { localStorage.setItem(LS_KEY, JSON.stringify({ got: Array.from(got), ver: state.ver, tab: state.tab, status: state.status, age: state.age, time: state.time, lock: state.lock, showAll: state.showAll, dg: state.dg })); hasStored = true; } catch (e) {}
}
function schedule(){
  dirty = true;
  if (!ref) return;
  setSync('Saving…');
  clearTimeout(timer);
  timer = setTimeout(flush, 350);
}
function flush(){
  if (!ref) return Promise.resolve();
  if (writing) { again = true; return Promise.resolve(); }
  writing = true;
  return (async function(){
    try {
      do {
        again = false;
        await ref.set({ v: 2, got: Array.from(got).sort(), ver: state.ver, tab: state.tab });
      } while (again);
      dirty = false;
      setSync('Saved to your account');
    } catch (e) {
      dirty = false;
      setSync('Saved on this device only');
    } finally {
      writing = false;
    }
  })();
}
function sameSet(arr){
  if (arr.length !== got.size) return false;
  for (var i = 0; i < arr.length; i++) if (!got.has(arr[i])) return false;
  return true;
}

async function initRemote(){
  if (typeof claude === 'undefined' || !claude || !claude.use) return;
  var timeout = setTimeout(function(){ setSync('Saved on this device only'); }, 10000);
  try {
    var dbm = await claude.use('db');
    var um = await claude.use('user');
    var uid = um ? await um.id() : null;
    if (!dbm || !uid) { clearTimeout(timeout); setSync('Saved on this device only'); return; }
    var r = dbm.doc('data/users/' + uid + '/oot_tracker');
    r.onSnapshot(function(snap){
      var fromCache = !!(snap.metadata && snap.metadata.fromCache);
      var pending = !!(snap.metadata && snap.metadata.hasPendingWrites);
      if (!snap.exists && fromCache) return;
      clearTimeout(timeout);
      ref = r;
      var d = snap.exists ? (snap.data() || {}) : null;
      var arr = d && Array.isArray(d.got) ? d.got.filter(function(x){ return typeof x === 'string'; }) : [];
      if (!remoteDecided) {
        remoteDecided = true;
        if (snap.exists) {
          got = new Set(arr);
          early.forEach(function(op){ if (op[1]) got.add(op[0]); else got.delete(op[0]); });
          normalize();
          defOpen = {};
          if (!verTouched && d && VERKEYS.indexOf(d.ver) >= 0) state.ver = d.ver;
          if (!tabTouched && d && TABS.indexOf(d.tab) >= 0) state.tab = d.tab;
          saveLocal();
          renderAll();
        }
        early = [];
        if (dirty) { schedule(); } else { setSync('Saved to your account'); }
        return;
      }
      if (dirty || writing || pending) return;
      if (snap.exists && !sameSet(arr)) {
        got = new Set(arr);
        normalize();
        saveLocal();
        touch();
        renderLegacy(); renderInfer(); renderList(); renderStory(); renderCounts();
      }
      setSync('Saved to your account');
    }, function(){
      clearTimeout(timeout);
      ref = null;
      setSync('Saved on this device only');
    });
  } catch (e) {
    clearTimeout(timeout);
    setSync('Saved on this device only');
  }
}

/* ---------- jumping between rows and tabs ---------- */
function goRow(id){
  var info = BASE[id], r = rowMap()[id], hit = id;
  if (info && info.tab === 'main') revealStep(info.parent || id);
  if (!info || !r) { showToast('That row is not in ' + verInfo(state.ver).name + '.'); return; }
  if (info.parent) id = info.parent;
  state.tab = info.tab; state.status = 'all'; state.age = 'all'; state.time = 'all'; state.q = '';
  tabTouched = true;
  el('q').value = '';
  var G = groups(info.tab);
  if (info.tab === 'main' && !state.showAll) {
    var h = horizon(G), gi0 = -1;
    G.forEach(function(g, i){ g.rows.forEach(function(x){ if (x.id === id) gi0 = i; }); });
    if (gi0 > h) state.showAll = true;
  }
  G.forEach(function(g){ g.rows.forEach(function(x){ if (x.id === id) state.collapsed[state.tab + '|' + state.ver + '|' + g.name] = 0; }); });
  setHash(); saveLocal(); schedule(); renderAll();
  var n = el('list').querySelector('[data-row="' + id + '"]'), sb = hit !== id ? el('list').querySelector('[data-sub="' + hit + '"]') : null;
  if (n) {
    (sb || n).scrollIntoView({ block: sb ? 'center' : 'start' });
    var hn = sb || n;
    hn.classList.add('hit');
    setTimeout(function(){ hn.classList.remove('hit'); }, 2000);
  } else window.scrollTo(0, 0);
}

/* ---------- events ---------- */
el('list').addEventListener('change', function(ev){
  var t = ev.target;
  if (!t || !t.matches || !t.matches('input[data-id]')) return;
  var id = t.getAttribute('data-id'), log = [];
  if (t.checked) {
    var rr0 = findRow(id);
    if (rr0 && unmetAny(rr0).length) { t.checked = false; return; }
  }
  if (t.checked && !window.__ootNoAsk) {
    var pend = pendingEarlier(id);
    if (pend.length) { t.checked = false; askEarlier(id, pend); return; }
  }
  if (t.checked) tickOn(id, log); else tickOff(id, log);
  finish(log, t.checked ? 'Marked' : 'Unmarked');
});
el('ask').addEventListener('click', function(ev){
  var T = ev.target;
  if (T.id === 'ask-yes' && askFor) {
    var id = askFor, log = [];
    askClose();
    tickOn(id, log);
    finish(log, 'Marked');
  } else if (T.id === 'ask-no' || T.id === 'ask') askClose();
});
document.addEventListener('keydown', function(ev){
  if (ev.key === 'Escape' && askFor) { ev.preventDefault(); askClose(); }
  else if (ev.key === 'Tab' && askFor) {
    var b = [el('ask-yes'), el('ask-no')], i = b.indexOf(document.activeElement);
    ev.preventDefault();
    b[(i + (ev.shiftKey ? b.length - 1 : 1)) % b.length].focus();
  }
  /* arrow keys move along a row of tabs (the list tabs, or the game tabs) */
  else if ((ev.key === 'ArrowRight' || ev.key === 'ArrowLeft' || ev.key === 'Home' || ev.key === 'End') && document.activeElement && document.activeElement.getAttribute('role') === 'tab') {
    var cur = document.activeElement, sib = Array.prototype.filter.call(cur.parentNode.children, function(x){ return x.getAttribute('role') === 'tab' && x.offsetParent !== null; }), k = sib.indexOf(cur);
    if (k < 0) return;
    ev.preventDefault();
    var nx = ev.key === 'Home' ? 0 : ev.key === 'End' ? sib.length - 1 : (k + (ev.key === 'ArrowRight' ? 1 : sib.length - 1)) % sib.length;
    sib[nx].focus();
  }
});

function listClick(ev){
  var T = ev.target && ev.target.closest ? ev.target : null;
  if (!T) return false;
  var rv = T.closest('[data-unveil]');
  if (rv) { var rid = rv.getAttribute('data-unveil'); revealStep(rid); renderKeep(); var nr = el('list').querySelector('[data-row="' + rid + '"]'); if (nr) { nr.classList.add('unveil'); var cb = nr.querySelector('input'); if (cb) cb.focus({ preventScroll: true }); } return true; }
  var gh = T.closest('button.gh');
  if (gh) {
    var g0 = curGroups()[+gh.getAttribute('data-gi')];
    if (!g0) return true;
    var top0 = gh.getBoundingClientRect().top, k0 = ckey(g0.name);
    state.collapsed[k0] = isColl(g0) ? 0 : 1;
    renderList(); renderCounts();
    var nb0 = el('list').querySelector('button.gh[data-gi="' + gh.getAttribute('data-gi') + '"]');
    if (nb0) {
      var hh0 = document.querySelector('.top').offsetHeight + 6, nbb = nb0.closest('.grp').getBoundingClientRect().top;
      window.scrollBy(0, nbb - Math.max(top0, hh0));
      nb0.focus({ preventScroll: true });
    }
    return true;
  }
  var go = T.closest('[data-goto]');
  if (go) { goRow(go.getAttribute('data-goto')); return true; }
  var rt = T.closest('[data-readytab]');
  if (rt) {
    state.tab = rt.getAttribute('data-readytab'); state.status = 'ready'; state.q = ''; el('q').value = '';
    tabTouched = true;
    setHash(); saveLocal(); schedule(); renderAll(); window.scrollTo(0, 0);
    return true;
  }
  if (T.closest('[data-showall]')) { state.showAll = true; saveLocal(); renderKeep(); return true; }
  if (T.closest('[data-hideall]')) { state.showAll = false; saveLocal(); renderKeep(); return true; }
  var hr = T.closest('[data-here]');
  if (hr) {
    var tid = hr.getAttribute('data-here'), log = [];
    for (var i = 0; i <= STEPPOS[tid]; i++) tickOn(STEPS[i].id, log);
    finish(log, 'Marked');
    return true;
  }
  var dgb = T.closest('button[data-dg]');
  if (dgb) {
    var dgid = dgb.getAttribute('data-dg');
    if (state.dg[dgid]) delete state.dg[dgid]; else state.dg[dgid] = true;
    saveLocal(); renderKeep();
    var nb2 = el('list').querySelector('[data-row="' + dgid + '"] button[data-dg]');
    if (nb2) nb2.focus({ preventScroll: true });
    return true;
  }
  var b = T.closest('button[data-reveal], button[data-hide]');
  if (!b) return false;
  var id = b.getAttribute('data-reveal') || b.getAttribute('data-hide');
  var r = findRow(id);
  if (!r) return true;
  if (SUBOF[id] && !r.step) r = subHid(r);
  if (b.hasAttribute('data-reveal')) revealed.add(id); else revealed.delete(id);
  var box = el('list').querySelector('[data-gbox="' + id + '"]');
  if (box) {
    box.innerHTML = guideInner(r);
    var nb = box.querySelector('button');
    if (nb) nb.focus({ preventScroll: true });
  }
  return true;
}
el('list').addEventListener('click', listClick);
el('story').addEventListener('click', listClick);
el('infer').addEventListener('click', function(ev){
  var b = ev.target.closest ? ev.target.closest('button[data-infer]') : null;
  if (!b) return;
  if (b.getAttribute('data-infer') === 'no') { inferHidden = true; renderInfer(); return; }
  var L = inferSteps(), log = [];
  L.forEach(function(s){ tickOn(s, log); });
  finish(log, 'Marked');
});

el('tabs').innerHTML = TABS.map(function(t){
  return '<button class="tab" id="tab-' + t + '" role="tab" data-tab="' + t + '"></button>';
}).join('');
el('tabs').addEventListener('click', function(ev){
  var b = ev.target.closest('.tab');
  if (!b) return;
  var t = b.getAttribute('data-tab');
  if (t === state.tab) return;
  state.tab = t;
  tabTouched = true;
  setHash();
  saveLocal();
  schedule();
  renderAll();
  window.scrollTo(0, 0);
});

function onVerClick(ev){
  var b = ev.target.closest ? ev.target.closest('.vtab') : null;
  if (!b) return;
  var v = b.getAttribute('data-ver');
  if (!v || v === state.ver) return;
  state.ver = v;
  verTouched = true;
  setHash();
  saveLocal();
  schedule();
  renderAll();
  window.scrollTo(0, 0);
  setTimeout(warmPictures, 800);
  /* the game tabs are redrawn by the switch, so the tap motion is played on the new picked one */
  if (ev.pointerType !== 'mouse' && window.matchMedia && window.matchMedia('(hover: none)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.vtab[data-ver="' + v + '"]'), function(x){ x.classList.add('tapfx'); setTimeout(function(){ x.classList.remove('tapfx'); }, 900); });
  }
}
el('vtabs').addEventListener('click', onVerClick);
el('vtabs2').addEventListener('click', onVerClick);

el('legacy').addEventListener('click', function(ev){
  var b = ev.target.closest ? ev.target.closest('button[data-claim]') : null;
  if (!b) return;
  var v = b.getAttribute('data-claim');
  if (v === 'later') { legacyHidden = true; renderLegacy(); return; }
  if (VERKEYS.indexOf(v) < 0) return;
  legacyIds().forEach(function(x){
    got.delete(x); got.add(v + ':' + x);
    if (!remoteDecided) { early.push([x, false]); early.push([v + ':' + x, true]); }
  });
  state.ver = v;
  verTouched = true;
  setHash();
  saveLocal();
  schedule();
  renderAll();
});

function bindSeg(id, k){
  el(id).addEventListener('click', function(ev){
    var b = ev.target.closest('button');
    if (!b) return;
    state[k] = b.getAttribute('data-v');
    var all = el(id).querySelectorAll('button');
    for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-pressed', all[i] === b ? 'true' : 'false');
    saveLocal();
    renderList();
    renderCounts();
  });
}
bindSeg('seg-status', 'status');
bindSeg('seg-age', 'age');
bindSeg('seg-time', 'time');
el('lockon').addEventListener('click', function(){
  state.lock = !state.lock;
  syncSegs();
  saveLocal();
  renderInfer(); renderList(); renderStory(); renderCounts();
});

var qt = null;
el('q').addEventListener('input', function(ev){
  var v = ev.target.value;
  clearTimeout(qt);
  qt = setTimeout(function(){ state.q = v.trim(); renderList(); renderCounts(); }, 120);
});

el('jump').addEventListener('change', function(ev){
  var v = ev.target.value;
  if (v === '') return;
  goArea(+v);
  el('jump').value = '';
});
el('areanav').addEventListener('click', function(ev){
  var sa = ev.target.closest ? ev.target.closest('[data-showall]') : null;
  if (sa) { state.showAll = true; saveLocal(); renderKeep(); return; }
  var b = ev.target.closest ? ev.target.closest('button.an') : null;
  if (!b || b.classList.contains('none')) return;
  goArea(+b.getAttribute('data-gi'));
});

el('totop').addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });

el('collapse').addEventListener('click', function(){
  var G = curGroups();
  var anyOpen = G.some(function(g){ return !isColl(g); });
  G.forEach(function(g){ state.collapsed[ckey(g.name)] = anyOpen ? 1 : 0; });
  renderList(); renderCounts();
  window.scrollTo(0, 0);
});

/* the sticky header's height drives where area headings stick and where jumps land */
function setHH(){
  var h = document.querySelector('.top');
  /* on a short screen (a phone on its side) the header scrolls away so the list gets the room */
  var short = window.matchMedia && window.matchMedia('(max-height: 520px) and (orientation: landscape)').matches;
  if (h) document.documentElement.style.setProperty('--hh', (short ? 0 : h.offsetHeight) + 'px');
}
window.addEventListener('resize', setHH);
if (window.ResizeObserver) { try { new ResizeObserver(setHH).observe(document.querySelector('.top')); } catch (e) {} }

/* while the page is idle, draw the pictures for the other tabs ahead of time so switching tabs never stalls */
function warmPictures(){
  if (!TH || !TH.svgFor || !TH.keyFor) return;
  var todo = [];
  TABS.forEach(function(t){ groups(t).forEach(function(g){ todo.push(g.name); }); });
  var ver = state.ver, ric = window.requestIdleCallback || function(f){ return setTimeout(function(){ f({ timeRemaining: function(){ return 8; } }); }, 60); };
  (function step(dl){
    while (todo.length && dl.timeRemaining() > 4) { if (state.ver !== ver) return; (TH.bannerURL || TH.svgFor)(TH.bannerURL ? todo.shift() : TH.keyFor(todo.shift()), ver); }
    if (todo.length) ric(step);
  })({ timeRemaining: function(){ return 0; } });
}
setTimeout(warmPictures, 1500);

/* phones have no hover: a tap plays the same console-themed motion once. (A touch listener also lets iOS show the
   pressed state.) */
document.addEventListener('touchstart', function(){}, { passive: true });
document.addEventListener('pointerdown', function(ev){
  if (ev.pointerType === 'mouse') return;
  var b = ev.target && ev.target.closest ? ev.target.closest('.tab,.vtab,.seg button,.btn,.pill,.chip,.ask-b button,.spoilbtn') : null;
  if (!b) return;
  b.classList.remove('tapfx'); void b.offsetWidth; b.classList.add('tapfx');
  clearTimeout(b.__tapT); b.__tapT = setTimeout(function(){ b.classList.remove('tapfx'); }, 900);
}, { passive: true });

var spyQ = false;
function spy(){
  spyQ = false;
  var secs = el('list').querySelectorAll('.grp'), top = document.querySelector('.top').offsetHeight + 70, best = -1;
  for (var i = 0; i < secs.length; i++) {
    if (secs[i].getBoundingClientRect().top <= top) best = +secs[i].getAttribute('data-g');
  }
  if (best < 0 && secs.length) best = +secs[0].getAttribute('data-g');
  if (best !== activeGi) { activeGi = best; markNav(); }
  el('fab').classList.toggle('show', window.scrollY > 500);
}
window.addEventListener('scroll', function(){ if (!spyQ) { spyQ = true; requestAnimationFrame(spy); } }, { passive: true });

/* ---------- back up / move progress ---------- */
function progressCode(){ try { return 'OOT1.' + btoa(JSON.stringify(Array.from(got).sort())); } catch (e) { return ''; } }
el('xfer').addEventListener('toggle', function(){ if (el('xfer').open) { el('xcode').value = progressCode(); el('xmsg').textContent = ''; el('xmsg2').textContent = ''; } });
el('xcopy').addEventListener('click', function(){
  var ta = el('xcode');
  ta.value = progressCode();
  ta.focus(); ta.select();
  var ok = false;
  try { ok = document.execCommand && document.execCommand('copy'); } catch (e) {}
  if (!ok && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(ta.value).then(function(){ el('xmsg').textContent = 'Copied.'; }, function(){ el('xmsg').textContent = 'Select the code above and copy it.'; });
    return;
  }
  el('xmsg').textContent = ok ? 'Copied.' : 'Select the code above and copy it.';
});
el('xapply').addEventListener('click', function(){
  var raw = el('xin').value.trim(), out = el('xmsg2');
  if (raw.indexOf('OOT1.') !== 0) { out.textContent = 'That does not look like a progress code.'; return; }
  var arr;
  try { arr = JSON.parse(atob(raw.slice(5))); } catch (e) { arr = null; }
  if (!Array.isArray(arr)) { out.textContent = 'That code could not be read.'; return; }
  var added = 0;
  arr.forEach(function(x){
    if (typeof x !== 'string' || !/^((n64|3ds|sw2):)?[A-Z]{1,4}-\d{1,3}(\.\d)?$/.test(x) || got.has(x)) return;
    got.add(x); added++;
    if (!remoteDecided) early.push([x, true]);
  });
  if (added) normalize();
  out.textContent = added ? ('Added ' + added + ' checkmark' + (added === 1 ? '' : 's') + '.') : 'Nothing new in that code.';
  if (added) { el('xin').value = ''; saveLocal(); schedule(); renderAll(); el('xcode').value = progressCode(); }
});

window.addEventListener('hashchange', function(){
  var h = parseHash(location.hash);
  var changed = false;
  if (h.tab && h.tab !== state.tab) { state.tab = h.tab; tabTouched = true; changed = true; }
  if (h.ver && h.ver !== state.ver) { state.ver = h.ver; verTouched = true; changed = true; }
  if (changed) renderAll();
});

renderAll();
setHH();
spy();
initRemote();
window.__oot = { rowReady: function(id){ return rowReady(rowMap()[id]); }, ANCL: ANCL, pending: pendingEarlier, clear: function(){ got.clear(); touch(); }, DERIV_BY: DERIV_BY, adultId: function(){ return D.adult; }, render: function(){ renderAll(); }, tick: function(id){ var log = []; tickOn(id, log); touch(); return log; }, untick: function(id){ var log = []; tickOff(id, log); touch(); return log; }, subs: SUBS, state: state, got: function(){ return Array.from(got); }, eff: eff, unmet: unmetAny, rowMap: rowMap, goRow: goRow, reqOf: reqOf, GIVER: GIVER, inferSteps: inferSteps, groups: groups };
})();
