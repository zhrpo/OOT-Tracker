/* Themed layer: area catalogue and procedural banner scenes.
   The same landscape is drawn at three fidelity levels: 1 = N64 (few flat facets),
   2 = 3DS (more facets, gradients, soft shading), 3 = Switch 2 (smooth curves, glow, haze).
   Everything is original: simple shapes and palettes only. */
(function () {
'use strict';

var YEARS = { n64: '1998', '3ds': '2011', sw2: '2026' };
var LV = { n64: 1, '3ds': 2, sw2: 3 };

/* ---------- area catalogue: hue, saturation, scene, lighting ---------- */
var AREAS = {
  forest:   { h: 138, s: 44, k: 'forest',   m: 'day' },
  woods:    { h: 152, s: 38, k: 'woods',    m: 'woods' },
  field:    { h: 100, s: 42, k: 'field',    m: 'day' },
  ranch:    { h: 38,  s: 48, k: 'ranch',    m: 'day' },
  town:     { h: 222, s: 34, k: 'town',     m: 'day' },
  village:  { h: 24,  s: 52, k: 'village',  m: 'dusk' },
  graves:   { h: 268, s: 28, k: 'graves',   m: 'night' },
  mountain: { h: 14,  s: 40, k: 'mountain', m: 'day' },
  goron:    { h: 20,  s: 60, k: 'cave',     m: 'fire' },
  crater:   { h: 6,   s: 66, k: 'crater',   m: 'fire' },
  river:    { h: 190, s: 50, k: 'water',    m: 'day' },
  domain:   { h: 202, s: 54, k: 'cave',     m: 'ice' },
  fountain: { h: 196, s: 50, k: 'fountain', m: 'ice' },
  lake:     { h: 214, s: 56, k: 'lake',     m: 'day' },
  valley:   { h: 30,  s: 50, k: 'valley',   m: 'dawn' },
  desert:   { h: 40,  s: 56, k: 'desert',   m: 'day' },
  deku:     { h: 96,  s: 44, k: 'deku',     m: 'woods' },
  dodongo:  { h: 10,  s: 48, k: 'cave',     m: 'fire' },
  jabu:     { h: 332, s: 42, k: 'jabu',     m: 'cave' },
  ftemple:  { h: 146, s: 40, k: 'columns',  m: 'woods' },
  fire:     { h: 4,   s: 62, k: 'flames',   m: 'fire' },
  wtemple:  { h: 208, s: 52, k: 'columns',  m: 'cave' },
  shadow:   { h: 286, s: 30, k: 'columns',  m: 'night' },
  spirit:   { h: 36,  s: 52, k: 'columns',  m: 'dusk' },
  well:     { h: 92,  s: 24, k: 'cave',     m: 'murk' },
  ice:      { h: 192, s: 56, k: 'ice',      m: 'ice' },
  meadow:   { h: 126, s: 42, k: 'forest',   m: 'dawn' },
  hcastle:  { h: 232, s: 34, k: 'castle',   m: 'dusk' },
  ganon:    { h: 300, s: 30, k: 'castle',   m: 'storm' },
  fortress: { h: 20,  s: 52, k: 'desert',   m: 'dawn' },
  waste:    { h: 46,  s: 40, k: 'desert',   m: 'dusk' },
  armory:   { h: 28,  s: 30, k: 'armory',   m: 'hall' },
  wardrobe: { h: 30,  s: 28, k: 'wardrobe', m: 'hall' },
  bench:    { h: 30,  s: 30, k: 'bench',    m: 'hall' },
  magic:    { h: 280, s: 40, k: 'magic',    m: 'arcane' },
  trial:    { h: 100, s: 30, k: 'trial',    m: 'day' },
  stall:    { h: 34,  s: 44, k: 'stall',    m: 'dusk' },
  shelf:    { h: 30,  s: 34, k: 'shelf',    m: 'hall' },
  relics:   { h: 250, s: 26, k: 'relics',   m: 'arcane' },
  songc:    { h: 136, s: 44, k: 'songs',    m: 'dawn' },
  songa:    { h: 262, s: 30, k: 'songs',    m: 'night' },
  e1:       { h: 140, s: 44, k: 'field',    m: 'dawn' },
  e2:       { h: 14,  s: 42, k: 'mountain', m: 'day' },
  e3:       { h: 262, s: 30, k: 'town',     m: 'dusk' },
  e4:       { h: 34,  s: 54, k: 'ranch',    m: 'dusk' },
  e5:       { h: 285, s: 30, k: 'castle',   m: 'storm' }
};
var KEYS = [
  [/^swords and shields/i, 'armory'], [/^tunics and boots/i, 'wardrobe'], [/^tools and weapons/i, 'bench'], [/^magic, spells/i, 'magic'], [/^strength, swimming/i, 'trial'], [/^bags, quivers/i, 'stall'], [/^bottles/i, 'shelf'], [/^quest items and medallions/i, 'relics'], [/^songs you learn as a child/i, 'songc'], [/^songs you learn as an adult/i, 'songa'],
  [/^child: early/i, 'e1'], [/^child: after/i, 'e2'], [/^adult: right after/i, 'e3'], [/^adult: after/i, 'e4'], [/^adult: late/i, 'e5'],
  [/deku tree/i, 'deku'], [/dodongo/i, 'dodongo'], [/jabu/i, 'jabu'], [/forest temple/i, 'ftemple'], [/fire temple/i, 'fire'],
  [/water temple/i, 'wtemple'], [/shadow temple/i, 'shadow'], [/spirit temple/i, 'spirit'], [/bottom of the well/i, 'well'], [/ice cavern/i, 'ice'],
  [/ganon/i, 'ganon'], [/lost woods/i, 'woods'], [/sacred forest|meadow/i, 'meadow'], [/kokiri/i, 'forest'], [/hyrule field/i, 'field'], [/lon lon/i, 'ranch'], [/castle town|market/i, 'town'], [/hyrule castle/i, 'hcastle'],
  [/graveyard/i, 'graves'], [/kakariko/i, 'village'], [/crater/i, 'crater'], [/death mountain/i, 'mountain'], [/goron/i, 'goron'],
  [/zora.s river/i, 'river'], [/zora.s domain/i, 'domain'], [/zora.s fountain/i, 'fountain'], [/lake hylia/i, 'lake'],
  [/gerudo valley/i, 'valley'], [/fortress/i, 'fortress'], [/wasteland/i, 'waste'], [/gerudo|desert|colossus/i, 'desert']
];
function keyFor(name) {
  for (var i = 0; i < KEYS.length; i++) if (KEYS[i][0].test(name)) return KEYS[i][1];
  return 'field';
}

/* mood = sky top, sky bottom (hsl), lightness shift for land, sun/moon colour, haze colour, whether the sky shows an orb or stars */
var MOODS = {
  day:   { t: [208, 70, 66], b: [196, 78, 88], L: 0,   o: [48, 100, 76],  fog: [200, 60, 94], orb: 1, stars: 0 },
  dawn:  { t: [222, 48, 66], b: [28, 88, 82],  L: -4,  o: [38, 100, 76],  fog: [30, 70, 90],  orb: 1, stars: 0 },
  dusk:  { t: [256, 38, 34], b: [16, 82, 66],  L: -14, o: [24, 100, 64],  fog: [20, 60, 62],  orb: 1, stars: 0 },
  night: { t: [246, 48, 12], b: [258, 36, 28], L: -28, o: [210, 30, 90],  fog: [250, 30, 42], orb: 1, stars: 1 },
  woods: { t: [170, 40, 9],  b: [150, 34, 24], L: -30, o: [100, 60, 70],  fog: [150, 30, 36], orb: 0, stars: 1 },
  storm: { t: [266, 34, 10], b: [282, 30, 26], L: -30, o: [0, 0, 70],     fog: [270, 24, 30], orb: 0, stars: 0 },
  fire:  { t: [358, 64, 9],  b: [16, 90, 34],  L: -26, o: [34, 100, 62],  fog: [14, 70, 32],  orb: 0, stars: 0, glow: [30, 100, 58] },
  ice:   { t: [206, 56, 70], b: [192, 66, 92], L: 2,   o: [190, 40, 96],  fog: [196, 60, 94], orb: 0, stars: 0, glow: [190, 90, 70] },
  cave:  { t: [200, 30, 10], b: [200, 34, 24], L: -28, o: [190, 70, 70],  fog: [200, 30, 30], orb: 0, stars: 0, glow: [180, 80, 56] },
  hall:  { t: [26, 30, 12],  b: [24, 36, 28], L: -20, o: [40, 90, 70],  fog: [26, 40, 34], orb: 0, stars: 0, glow: [34, 96, 58] },
  arcane:{ t: [268, 50, 9],  b: [284, 44, 24], L: -26, o: [280, 70, 80], fog: [280, 40, 36], orb: 0, stars: 1, glow: [280, 90, 70] },
  murk:  { t: [96, 24, 7],   b: [100, 26, 18], L: -32, o: [80, 60, 60],   fog: [96, 22, 24],  orb: 0, stars: 0, glow: [90, 70, 50] }
};

/* ---------- utilities ---------- */
function hash(str) { var h = 2166136261 >>> 0; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function n1(v) { return Math.round(v * 10) / 10; }
function pts(P) { return P.map(function (p) { return n1(p[0]) + ',' + n1(p[1]); }).join(' '); }
function rgbOf(c) {
  var h = c[0] / 360, s = c[1] / 100, l = c[2] / 100, r, g, b;
  if (!s) { r = g = b = l; } else {
    var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    var f = function (t) { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    r = f(h + 1 / 3); g = f(h); b = f(h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}
function mix(a, b, t) { var x = rgbOf(a), y = rgbOf(b); return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' + Math.round(x[1] + (y[1] - x[1]) * t) + ',' + Math.round(x[2] + (y[2] - x[2]) * t) + ')'; }

function Ctx(key, ver) {
  var A = AREAS[key], c = { key: key, A: A, M: MOODS[A.m], lvl: LV[ver] || 3, W: 1200, H: 140, defs: [], o: [], n: 0 };
  var r = rng(hash(key));
  c.f = [];
  for (var i = 0; i < 8; i++) c.f.push({ a: .004 + r() * .006, b: .011 + r() * .01, c: .027 + r() * .02, p: r() * 6.28, q: r() * 6.28, s: r() * 6.28 });
  c.rs = [];
  for (i = 0; i < 10; i++) c.rs.push(rng(hash(key + '#' + i)));
  return c;
}
function prof(c, i) { var f = c.f[i % 8]; return function (x) { return .5 + .28 * Math.sin(x * f.a + f.p) + .15 * Math.sin(x * f.b + f.q) + .07 * Math.sin(x * f.c + f.s); }; }
function add(c, s) { c.o.push(s); }
function uid(c) { return '§' + (c.n++); }

/* colour of land layer i of n (0 = far and pale, n-1 = near and dark) */
function lcol(c, i, n, dh) {
  var t = n > 1 ? i / (n - 1) : 1, M = c.M, A = c.A;
  return [(A.h + (dh || 0) + 360) % 360, A.s * (.45 + .55 * t), clamp(62 - 38 * t + M.L * (.55 + .3 * t), 5, 88)];
}
function hs(c, a, dl, al) {
  var l = a[2] + (dl || 0), s = a[1], h = a[0];
  if (c.lvl === 1) { l = Math.round(l / 10) * 10; s = Math.round(s / 14) * 14; h = Math.round(h / 20) * 20; }
  else if (c.lvl === 2) { s = s * .96; l = Math.round((l + 3) / 6) * 6; }
  else { l = l + (l - 50) * .2; s = Math.min(100, s * 1.16); }
  l = clamp(Math.round(l), 3, 96);
  return al == null ? 'hsl(' + Math.round(h) + ',' + Math.round(s) + '%,' + l + '%)' : 'hsla(' + Math.round(h) + ',' + Math.round(s) + '%,' + l + '%,' + al + ')';
}
/* far layers on Switch 2 are softly out of focus */
/* (the far layers used to be blurred with an SVG filter; the whole picture now gets one cheap blur instead) */
function far(c, s) { return c.lvl === 3 ? '<g opacity=".92">' + s + '</g>' : s; }
function lin(c, stops, x1, y1, x2, y2) {
  var id = uid(c);
  c.defs.push('<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 || 0) + '" y2="' + (y2 == null ? 1 : y2) + '">' +
    stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</linearGradient>');
  return 'url(#' + id + ')';
}
function rad(c, stops) {
  var id = uid(c);
  c.defs.push('<radialGradient id="' + id + '">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>');
  return 'url(#' + id + ')';
}
/* a fill that is flat on N64 and a top-to-bottom gradient on the newer games */
function fv(c, col, up, down) {
  if (c.lvl <= 2) return hs(c, col);
  return lin(c, [[0, hs(c, col, up == null ? 8 : up)], [1, hs(c, col, down == null ? -8 : down)]]);
}
function smooth(P, H) {
  var d = 'M' + n1(P[0][0]) + ',' + H + ' L' + n1(P[0][0]) + ',' + n1(P[0][1]);
  for (var k = 0; k < P.length - 1; k++) {
    var p0 = P[k - 1] || P[k], p1 = P[k], p2 = P[k + 1], p3 = P[k + 2] || p2;
    d += ' C' + n1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + n1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + n1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + n1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + n1(p2[0]) + ',' + n1(p2[1]);
  }
  return d + ' L' + n1(P[P.length - 1][0]) + ',' + H + ' Z';
}

/* ---------- drawing parts ---------- */
function sky(c) {
  var M = c.M, W = c.W, H = c.H, out = '';
  if (c.lvl === 1) {
    for (var k = 0; k < 5; k++) {
      var col = mix(M.t, M.b, k / 4);
      out += '<rect x="0" y="' + Math.round(k * H / 5) + '" width="' + W + '" height="' + (Math.ceil(H / 5) + 1) + '" fill="' + col + '"/>';
    }
  } else {
    out += '<rect width="' + W + '" height="' + H + '" fill="' + lin(c, [[0, hs(c, M.t)], [1, hs(c, M.b)]]) + '"/>';
  }
  add(c, out);
  if (M.stars) {
    var r = c.rs[9], N = [8, 14, 64][c.lvl - 1];
    for (var i = 0; i < N; i++) {
      var x = r() * W, y = r() * H * .6, s = r(), tw = (c.lvl === 3 ? i % 4 === 0 : i % 3 === 0) ? ' class="twk t' + (i % 4) + '"' : '';
      if (c.lvl === 1) add(c, '<rect' + tw + ' x="' + Math.round(x) + '" y="' + Math.round(y) + '" width="3" height="3" fill="#fff" opacity=".85"/>');
      else add(c, '<circle' + tw + ' cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(.6 + s * (c.lvl === 3 ? 1.5 : 1)) + '" fill="#fff" opacity="' + n1(.35 + s * .55) + '"/>');
    }
    if (c.lvl === 3) add(c, '<path class="shoot" d="M900,26 L940,18" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0"/>');
  } else if (c.lvl === 2 && M.orb && M.L > -20) {
    add(c, '<g class="fly f0"><path d="M0,58 l7,-6 l7,6" fill="none" stroke="#2a3a50" stroke-opacity=".75" stroke-width="2.2" stroke-linejoin="round"/></g><g class="fly f2"><path d="M0,40 l5,-5 l5,5" fill="none" stroke="#2a3a50" stroke-opacity=".6" stroke-width="2" stroke-linejoin="round"/></g>');
  } else if (c.lvl === 3 && M.orb && M.L > -20) {
    /* daytime life: a few birds crossing the sky */
    add(c, '<g class="fly f0"><path d="M0,60 q6,-7 12,0 q6,-7 12,0" fill="none" stroke="#2a3a50" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round"/></g><g class="fly f1"><path d="M0,40 q5,-6 10,0 q5,-6 10,0" fill="none" stroke="#2a3a50" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/></g><g class="fly f2"><path d="M0,76 q4,-5 8,0 q4,-5 8,0" fill="none" stroke="#2a3a50" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/></g>');
  }
}
function orb(c, x, y, r) {
  var M = c.M;
  if (!M.orb) return;
  var o = M.o;
  if (c.lvl === 1) {
    var P = []; for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4 + Math.PI / 8; P.push([x + Math.cos(a) * r * 1.08, y + Math.sin(a) * r * 1.08]); }
    add(c, '<polygon points="' + pts(P) + '" fill="' + hs(c, o) + '"/>');
  } else if (c.lvl === 2) {
    add(c, '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + hs(c, o, -4) + '"/><circle cx="' + x + '" cy="' + y + '" r="' + n1(r * .62) + '" fill="' + hs(c, o, 8) + '"/>');
  } else {
    var rays = '', q, a, a2;
    for (q = 0; q < 12; q++) { a = q * Math.PI / 6; a2 = a + .07; rays += '<polygon points="' + pts([[x, y], [x + Math.cos(a) * r * 8, y + Math.sin(a) * r * 8], [x + Math.cos(a2) * r * 8, y + Math.sin(a2) * r * 8]]) + '"/>'; }
    add(c, '<g class="spin slow" fill="' + hs(c, o, 0, .16) + '">' + rays + '</g>');
    add(c, '<circle class="pulse" cx="' + x + '" cy="' + y + '" r="' + r * 5 + '" fill="' + rad(c, [[0, hs(c, o, 0, .55)], [.35, hs(c, o, 0, .16)], [1, hs(c, o, 0, 0)]]) + '"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + rad(c, [[0, '#fff'], [.6, hs(c, o, 6)], [1, hs(c, o, -4)]]) + '"/>');
  }
}
function clouds(c) {
  if (c.M.stars || c.M.L < -20) return;
  var r = c.rs[8], W = c.W, tone = c.M.fog, NC = [3, 3, 7][c.lvl - 1];
  for (var i = 0; i < NC; i++) {
    var x = r() * W, y = 14 + r() * 36, w = 70 + r() * 70, h = 12 + r() * 8, s;
    if (c.lvl === 1) s = '<polygon points="' + pts([[x - w, y + h], [x - w * .6, y], [x - w * .1, y - h * .3], [x + w * .4, y], [x + w, y + h]]) + '" fill="' + mix(tone, [0, 0, 100], .5) + '" opacity=".85"/>';
    else if (c.lvl === 2) s = '<g fill="#fff"><ellipse cx="' + n1(x) + '" cy="' + n1(y + h * .6) + '" rx="' + n1(w) + '" ry="' + n1(h * .55) + '"/><ellipse cx="' + n1(x - w * .3) + '" cy="' + n1(y + h * .3) + '" rx="' + n1(w * .45) + '" ry="' + n1(h * .55) + '"/><ellipse cx="' + n1(x + w * .25) + '" cy="' + n1(y + h * .2) + '" rx="' + n1(w * .4) + '" ry="' + n1(h * .6) + '"/></g><ellipse cx="' + n1(x) + '" cy="' + n1(y + h * 1.05) + '" rx="' + n1(w) + '" ry="' + n1(h * .22) + '" fill="' + mix(tone, [0, 0, 100], .2) + '" opacity=".7"/>';
    else s = '<ellipse cx="' + n1(x) + '" cy="' + n1(y + h * .6) + '" rx="' + n1(w * 1.2) + '" ry="' + n1(h * .8) + '" fill="' + rad(c, [[0, '#fff', .75], [1, '#fff', 0]]) + '"/><ellipse cx="' + n1(x - w * .3) + '" cy="' + n1(y + h * .3) + '" rx="' + n1(w * .6) + '" ry="' + n1(h * .55) + '" fill="' + rad(c, [[0, '#fff', .8], [1, '#fff', 0]]) + '"/><ellipse cx="' + n1(x + w * .35) + '" cy="' + n1(y + h * .5) + '" rx="' + n1(w * .5) + '" ry="' + n1(h * .5) + '" fill="' + rad(c, [[0, mix(tone, [0, 0, 100], .3), .5], [1, '#fff', 0]]) + '"/>';
    add(c, '<g class="drift d' + (i % 3) + '">' + s + '</g>');
  }
}
function ridgeLine(d) { return d.replace(/^M[^ ]+ L/, 'M').replace(/ L[^ ]+ Z$/, ''); }
function ridge(c, i, n, base, amp, pf) {
  var f = prof(c, pf == null ? i : pf), N = [5, 8, 38][c.lvl - 1], W = c.W, H = c.H, P = [], k;
  for (k = 0; k <= N; k++) { var x = k * W / N; P.push([x, base - amp * (f(x) - .5) * 2]); }
  var col = lcol(c, i, n);
  if (c.lvl === 3) {
    if (i === 0) {
      /* a second, paler range far behind the first one */
      var f2 = prof(c, (pf == null ? i : pf) + 3), P2 = [];
      for (k = 0; k <= N; k++) { var x2 = k * W / N; P2.push([x2, base - 12 - amp * 1.3 * (f2(x2) - .5) * 2]); }
      add(c, far(c, '<path d="' + smooth(P2, H) + '" fill="' + hs(c, lcol(c, 0, n + 1, 0), 8, .6) + '"/>'));
    }
    var d = smooth(P, H), rp = '<path d="' + d + '" fill="' + fv(c, col, 10, -6) + '"/>';
    add(c, i === 0 ? far(c, rp) : rp);
    add(c, '<path d="' + ridgeLine(d) + '" fill="none" stroke="#fff" stroke-opacity="' + (i === 0 ? .12 : .24) + '" stroke-width="1.5" stroke-linecap="round"/>');
    return;
  }
  add(c, '<polygon points="' + pts(P) + ' ' + W + ',' + H + ' 0,' + H + '" fill="' + hs(c, col) + '"/>');
  for (k = 1; k < P.length - 1; k++) {
    if (P[k][1] < P[k - 1][1] && P[k][1] <= P[k + 1][1]) {
      add(c, '<polygon points="' + pts([P[k], P[k - 1], [P[k - 1][0], H], [P[k][0], H]]) + '" fill="' + hs(c, col, c.lvl === 1 ? 8 : 5) + '"/>');
    }
  }
  if (c.lvl === 2) add(c, '<polyline points="' + pts(P) + '" fill="none" stroke="' + hs(c, col, -26) + '" stroke-width="2.2" stroke-linejoin="round"/>');
}
function ground(c, i, n, y) {
  var col = lcol(c, i, n);
  add(c, '<rect x="0" y="' + y + '" width="' + c.W + '" height="' + (c.H - y + 1) + '" fill="' + fv(c, col, 4, -8) + '"/>');
}
function fog(c, y, h, a) {
  if (c.lvl < 3) return;
  var col = c.M.fog, one = function (yy, hh, aa) { return '<rect x="-60" y="' + yy + '" width="' + (c.W + 120) + '" height="' + hh + '" fill="' + lin(c, [[0, hs(c, col, 0, 0)], [.6, hs(c, col, 0, aa)], [1, hs(c, col, 0, 0)]]) + '"/>'; };
  add(c, '<g class="drift d2">' + one(y, h, a) + '</g><g class="drift d1">' + one(y + h * .35, h * .8, a * .7) + '</g>');
}
function parts(c, n, col, ymin, ymax) {
  var N = [Math.round(n * .3), Math.round(n * .35), Math.round(n * 1.1)][c.lvl - 1], r = c.rs[7];
  for (var i = 0; i < N; i++) {
    var x = r() * c.W, y = ymin + r() * (ymax - ymin), s = r();
    add(c, '<circle class="twk t' + (i % 4) + '" cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(c.lvl === 1 ? 3 + s * 2 : 1.2 + s * 1.8) + '" fill="' + hs(c, col) + '" opacity="' + n1(.5 + s * .5) + '"/>');
  }
}
/* wind: every swaying thing gets a delay from its x position, so gusts travel across the picture */
function ph(c, x) { return n1(-(x / c.W) * 7); }
function pine(c, x, y, h, col, bold) {
  var w = h * .46, dark = hs(c, col, -10), mid = fv(c, col, 6, -4);
  if (c.lvl === 1) {
    add(c, '<polygon points="' + pts([[x, y - h], [x - w, y - h * .12], [x + w, y - h * .12]]) + '" fill="' + hs(c, col) + '"/><polygon points="' + pts([[x, y - h], [x, y - h * .12], [x + w, y - h * .12]]) + '" fill="' + dark + '"/><rect x="' + n1(x - h * .05) + '" y="' + n1(y - h * .14) + '" width="' + n1(h * .1) + '" height="' + n1(h * .14) + '" fill="' + dark + '"/>');
    return;
  }
  var tiers = c.lvl === 2 ? 2 : 5, s = '', big = c.lvl === 3 && h >= 56 && !bold;
  s += '<rect x="' + n1(x - h * .04) + '" y="' + n1(y - h * .2) + '" width="' + n1(h * .08) + '" height="' + n1(h * .2) + '" fill="' + dark + '"/>';
  for (var t = 0; t < tiers; t++) {
    var top = y - h + t * h * (.62 / tiers), bot = y - h * .16 - (tiers - 1 - t) * h * .1, ww = w * (.45 + .55 * (t + 1) / tiers), tr = '';
    tr += '<polygon points="' + pts([[x, top], [x - ww, bot], [x + ww, bot]]) + '" fill="' + mid + '"' + (c.lvl === 3 ? ' stroke="' + mid + '" stroke-width="1.5" stroke-linejoin="round"' : '') + '/>';
    tr += '<polygon points="' + pts([[x, top], [x, bot], [x + ww, bot]]) + '" fill="' + dark + '" opacity="' + (c.lvl === 3 ? .35 : .5) + '"/>';
    if (c.lvl === 3) tr += '<polygon points="' + pts([[x - w * .04, top + 1], [x - ww * .98, bot], [x - ww * .5, bot]]) + '" fill="#fff" opacity=".1"/>';
    s += big && t === tiers - 1 ? '<g class="flut" style="--fr:' + n1(.7 + t * .5) + 'deg;animation-delay:' + n1(-t * .45 + (x % 5) * .3) + 's">' + tr + '</g>' : tr;
  }
  /* the far rows stand still (bold = far); nearer trees bend with the wind */
  add(c, bold || (c.lvl === 3 && h < 30) ? s : '<g class="sway" style="--sk:' + (c.lvl === 3 ? n1(1.3 + h / 38) : 2.4) + 'deg;--sp:' + n1(4.2 + (Math.round(h) % 4) * .5) + 's;animation-delay:' + ph(c, x) + 's">' + s + '</g>');
}
function pines(c, i, n, y, count, hmin, hmax, ri) {
  var r = c.rs[ri == null ? i : ri], col = lcol(c, i, n, 6);
  count = Math.round(count * [.6, .75, 1.7][c.lvl - 1]);
  for (var k = 0; k < count; k++) pine(c, (k + .2 + r() * .6) * c.W / count, y + r() * 6, hmin + r() * (hmax - hmin), col, i === 0 && n > 2);
}
function trunk(c, x, y, w, h, col) {
  var dark = hs(c, col, -10), lit = fv(c, col, 6, -4);
  if (c.lvl === 1) add(c, '<polygon points="' + pts([[x - w, y], [x - w * .8, y - h], [x + w * .8, y - h], [x + w, y]]) + '" fill="' + hs(c, col) + '"/><polygon points="' + pts([[x + w * .1, y - h], [x + w * .8, y - h], [x + w, y], [x + w * .1, y]]) + '" fill="' + dark + '"/>');
  else add(c, '<path d="M' + n1(x - w) + ',' + n1(y) + ' Q' + n1(x - w * .7) + ',' + n1(y - h * .5) + ' ' + n1(x - w * .75) + ',' + n1(y - h) + ' L' + n1(x + w * .75) + ',' + n1(y - h) + ' Q' + n1(x + w * .7) + ',' + n1(y - h * .5) + ' ' + n1(x + w) + ',' + n1(y) + ' Z" fill="' + lit + '"/><path d="M' + n1(x + w * .15) + ',' + n1(y - h) + ' L' + n1(x + w * .75) + ',' + n1(y - h) + ' Q' + n1(x + w * .7) + ',' + n1(y - h * .5) + ' ' + n1(x + w) + ',' + n1(y) + ' L' + n1(x + w * .15) + ',' + n1(y) + ' Z" fill="' + dark + '" opacity=".4"/>');
}
function trunks(c, i, n, count, w0, ri) {
  var r = c.rs[ri == null ? i : ri], col = lcol(c, i, n, 8);
  for (var k = 0; k < count; k++) trunk(c, (k + .15 + r() * .7) * c.W / count, c.H + 4, w0 * (.7 + r() * .7), c.H + 20, col);
}
function peaks(c, i, n, base, count, hmin, hmax, snow, ri) {
  var r = c.rs[ri == null ? i : ri], col = lcol(c, i, n), W = c.W, list = [];
  for (var k = 0; k < count; k++) list.push([(k + .3 + r() * .4) * W / count, hmin + r() * (hmax - hmin), (hmax + 30 + r() * 40) * .62]);
  list.forEach(function (p) {
    var x = p[0], h = p[1], w = p[2], y = base, s = '';
    if (c.lvl === 3) {
      s += '<path d="M' + n1(x - w) + ',' + y + ' Q' + n1(x - w * .35) + ',' + n1(y - h * .55) + ' ' + n1(x) + ',' + n1(y - h) + ' Q' + n1(x + w * .4) + ',' + n1(y - h * .55) + ' ' + n1(x + w) + ',' + y + ' Z" fill="' + fv(c, col, 12, -8) + '"/>';
      s += '<path d="M' + n1(x) + ',' + n1(y - h) + ' Q' + n1(x + w * .4) + ',' + n1(y - h * .55) + ' ' + n1(x + w) + ',' + y + ' L' + n1(x + w * .1) + ',' + y + ' Z" fill="' + hs(c, col, -14, .45) + '"/>';
      if (snow) s += '<path d="M' + n1(x - w * .2) + ',' + n1(y - h * .78) + ' Q' + n1(x - w * .05) + ',' + n1(y - h * .94) + ' ' + n1(x) + ',' + n1(y - h) + ' Q' + n1(x + w * .1) + ',' + n1(y - h * .93) + ' ' + n1(x + w * .22) + ',' + n1(y - h * .74) + ' Q' + n1(x + w * .02) + ',' + n1(y - h * .8) + ' ' + n1(x - w * .2) + ',' + n1(y - h * .78) + ' Z" fill="#fff" opacity=".85"/>';
    } else {
      s += '<polygon points="' + pts([[x - w, y], [x, y - h], [x + w, y]]) + '" fill="' + hs(c, col, c.lvl === 1 ? 6 : 4) + '"/><polygon points="' + pts([[x, y - h], [x + w, y], [x + w * .05, y]]) + '" fill="' + hs(c, col, -10) + '"/>';
      if (snow && c.lvl >= 2) s += '<polygon points="' + pts([[x, y - h], [x - w * .24, y - h * .72], [x - w * .05, y - h * .8], [x + w * .1, y - h * .7], [x + w * .22, y - h * .74]]) + '" fill="#fff" opacity=".9"/>';
      if (snow && c.lvl === 1) s += '<polygon points="' + pts([[x, y - h], [x - w * .2, y - h * .76], [x + w * .2, y - h * .76]]) + '" fill="#eef"/>';
    }
    add(c, i === 0 ? far(c, s) : s);
  });
}
function glints(c, y, h) {
  var r = c.rs[6], N = c.lvl === 3 ? 16 : 5, s = '', k;
  for (k = 0; k < N; k++) { var gx = r() * c.W, gy = y + 6 + r() * Math.max(8, h - 14), gl = 4 + r() * 8; s += '<path class="twk t' + (k % 4) + '" d="M' + n1(gx) + ',' + n1(gy) + ' h' + n1(gl) + '" stroke="#fff" stroke-width="' + (c.lvl === 3 ? 1.4 : 2.2) + '" stroke-linecap="round" opacity=".8"/>'; }
  add(c, s);
}
function waves(c, y, h, i, n) { waves0(c, y, h, i, n); if (c.lvl >= 2) glints(c, y, h); }
function waves0(c, y, h, i, n) {
  var col = lcol(c, i, n, 0), W = c.W, H = c.H, N = [10, 24, 60][c.lvl - 1], P = [], f = prof(c, 5);
  for (var k = 0; k <= N; k++) { var x = k * W / N; P.push([x, y + (c.lvl === 1 ? (k % 2 ? 4 : -4) : Math.sin(k * 1.3 + f(x) * 6) * (c.lvl === 2 ? 3 : 2.2))]); }
  if (c.lvl === 3) {
    add(c, '<path d="' + smooth(P, H) + '" fill="' + lin(c, [[0, hs(c, col, 14)], [1, hs(c, col, -14)]]) + '"/>');
    add(c, '<g class="drift d1" stroke="#fff" stroke-opacity=".38" stroke-width="1.2" fill="none"><path d="M60,' + (y + 14) + ' q40,-5 80,0 t80,0"/><path d="M420,' + (y + 24) + ' q40,-5 80,0 t80,0"/><path d="M820,' + (y + 12) + ' q40,-5 80,0 t80,0"/><path d="M1000,' + (y + 28) + ' q40,-5 80,0 t80,0"/></g><g class="drift d0" stroke="#fff" stroke-opacity=".25" stroke-width="1" fill="none"><path d="M200,' + (y + 8) + ' q30,-4 60,0 t60,0"/><path d="M640,' + (y + 18) + ' q30,-4 60,0 t60,0"/><path d="M940,' + (y + 6) + ' q30,-4 60,0 t60,0"/></g><ellipse class="pulse" cx="' + (c.W * .62) + '" cy="' + (y + 4) + '" rx="190" ry="8" fill="' + rad(c, [[0, '#fff', .35], [1, '#fff', 0]]) + '"/>');
  } else {
    add(c, '<polygon points="' + pts(P) + ' ' + W + ',' + H + ' 0,' + H + '" fill="' + hs(c, col) + '"/>');
    if (c.lvl === 1) add(c, '<g class="drift d1"><polygon points="' + pts([[0, y + 22], [140, y + 14], [260, y + 22], [140, y + 28]]) + '" fill="' + hs(c, col, 10) + '"/><polygon points="' + pts([[700, y + 30], [860, y + 22], [960, y + 30], [860, y + 36]]) + '" fill="' + hs(c, col, 10) + '"/></g>');
    else add(c, '<g class="drift d1"><path d="M80,' + (y + 14) + ' q30,-5 60,0 t60,0 M520,' + (y + 26) + ' q30,-5 60,0 t60,0 M860,' + (y + 16) + ' q30,-5 60,0 t60,0" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" fill="none"/></g>');
  }
}
function house(c, x, y, w, h, col, lit) {
  var body = hs(c, col, 2), roof = hs(c, col, -12), s = '';
  if (c.lvl === 3) s += '<rect x="' + n1(x) + '" y="' + n1(y - h) + '" width="' + w + '" height="' + h + '" fill="' + fv(c, col, 6, -6) + '"/><polygon points="' + pts([[x - w * .1, y - h], [x + w / 2, y - h - w * .5], [x + w * 1.1, y - h]]) + '" fill="' + fv(c, col, -4, -16) + '" stroke="' + roof + '" stroke-linejoin="round" stroke-width="1.5"/>';
  else s += '<rect x="' + n1(x) + '" y="' + n1(y - h) + '" width="' + w + '" height="' + h + '" fill="' + body + '"/><polygon points="' + pts([[x - w * .1, y - h], [x + w / 2, y - h - w * .5], [x + w * 1.1, y - h]]) + '" fill="' + roof + '"/>';
  if (lit && c.lvl >= 2) s += '<rect x="' + n1(x + w * .3) + '" y="' + n1(y - h * .7) + '" width="' + n1(w * .22) + '" height="' + n1(w * .22) + '" fill="hsl(46,100%,' + (c.lvl === 3 ? 72 : 66) + '%)"/>';
  else if (lit) s += '<rect x="' + n1(x + w * .3) + '" y="' + n1(y - h * .7) + '" width="' + n1(w * .24) + '" height="' + n1(w * .24) + '" fill="hsl(48,100%,64%)"/>';
  if (lit && c.lvl >= 2) {
    c.hn = (c.hn || 0) + 1;
    if (c.hn % 2 === 0) {
      var sx = x + w * .75, sy = y - h - w * .46, puff = '';
      s += '<rect x="' + n1(sx - w * .07) + '" y="' + n1(sy) + '" width="' + n1(w * .14) + '" height="' + n1(w * .22) + '" fill="' + roof + '"/>';
      for (var q = 0; q < (c.lvl === 3 ? 3 : 2); q++) puff += '<circle class="smoke" cx="' + n1(sx) + '" cy="' + n1(sy - 2) + '" r="' + (c.lvl === 3 ? 3.2 : 4) + '" fill="' + (c.lvl === 3 ? 'rgba(255,255,255,.6)' : '#f3f6fa') + '" style="animation-delay:' + n1(-q * (c.lvl === 3 ? 1.7 : 2.4)) + 's"/>';
      s += puff;
    }
  }
  add(c, s);
}
function tower(c, x, y, w, h, col, roofH) {
  var body = fv(c, col, 6, -6), dark = hs(c, col, -12), s = '';
  s += '<rect x="' + n1(x - w / 2) + '" y="' + n1(y - h) + '" width="' + w + '" height="' + h + '" fill="' + body + '"/>';
  if (roofH) s += '<polygon points="' + pts([[x - w * .62, y - h], [x, y - h - roofH], [x + w * .62, y - h]]) + '" fill="' + dark + '"/>';
  else for (var k = 0; k < 3; k++) s += '<rect x="' + n1(x - w / 2 + k * w / 3) + '" y="' + n1(y - h - 5) + '" width="' + n1(w / 5) + '" height="6" fill="' + body + '"/>';
  add(c, s);
  if (roofH && c.lvl >= 2) flag(c, x, y - h - roofH + 1);
}
function flag(c, x, y) {
  var col = hs(c, [2, 70, 46]), pole = hs(c, [30, 18, 24]), f = c.lvl === 3 ? 'M0,0 C6,-3 11,3 18,0 L15,4.5 L18,9 C11,12 6,6 0,9 Z' : 'M0,0 L16,4 L0,8 Z';
  add(c, '<g transform="translate(' + n1(x) + ' ' + n1(y) + ')"><rect x="-.7" y="-17" width="1.4" height="17" fill="' + pole + '"/><g transform="translate(.7 -17)"><path class="flag" d="' + f + '" fill="' + col + '"/></g></g>');
}
function lights(c, x, y, r, col) {
  if (c.lvl < 3) return;
  add(c, '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + rad(c, [[0, hs(c, col, 0, .55)], [1, hs(c, col, 0, 0)]]) + '"/>');
}
function stalac(c, count, hmin, hmax, ri, fromTop) {
  var r = c.rs[ri == null ? 3 : ri], col = lcol(c, 0, 3, 0), W = c.W, s = '';
  for (var k = 0; k < count; k++) {
    var x = (k + .2 + r() * .6) * W / count, h = hmin + r() * (hmax - hmin), w = h * (.22 + r() * .12);
    var P = fromTop ? [[x - w, -2], [x, h], [x + w, -2]] : [[x - w, c.H + 2], [x, c.H - h], [x + w, c.H + 2]];
    s += '<polygon points="' + pts(P) + '" fill="' + hs(c, col, c.lvl === 3 ? -2 : 0) + '"/>';
    if (c.lvl >= 1) s += '<polygon points="' + pts([P[1], P[2], [x, P[0][1]]]) + '" fill="' + hs(c, col, -10) + '" opacity=".6"/>';
    if (fromTop && c.lvl >= 2 && k < (c.lvl === 3 ? 4 : 2)) s += '<ellipse class="drip" cx="' + n1(x) + '" cy="' + n1(h + 2) + '" rx="1.6" ry="2.4" fill="' + hs(c, [190, 80, 82]) + '" style="animation-delay:' + n1(-k * 1.3) + 's"/>';
  }
  add(c, s);
}
function pool(c, y, col, rx) {
  var cx = [220, 640, 980][Math.floor(c.rs[6]() * 3)];
  if (c.lvl === 1) add(c, '<polygon points="' + pts([[cx - rx, y + 8], [cx - rx * .6, y], [cx + rx * .6, y], [cx + rx, y + 8], [cx + rx * .6, y + 16], [cx - rx * .6, y + 16]]) + '" fill="' + hs(c, col) + '"/>');
  else add(c, '<ellipse cx="' + cx + '" cy="' + (y + 8) + '" rx="' + rx + '" ry="9" fill="' + (c.lvl === 3 ? rad(c, [[0, hs(c, col, 12)], [.7, hs(c, col, 0, .9)], [1, hs(c, col, -6, .0)]]) : hs(c, col)) + '"/>');
  if (c.lvl === 3) add(c, '<ellipse cx="' + cx + '" cy="' + (y + 4) + '" rx="' + rx * 2.2 + '" ry="40" fill="' + rad(c, [[0, hs(c, col, 0, .35)], [1, hs(c, col, 0, 0)]]) + '"/>');
}
function column(c, x, y, w, h, col) {
  var lit = fv(c, col, 8, -6), dark = hs(c, col, -12), cap = hs(c, col, 6);
  var s = '<rect x="' + n1(x - w / 2) + '" y="' + n1(y - h) + '" width="' + w + '" height="' + h + '" fill="' + lit + '"/><rect x="' + n1(x) + '" y="' + n1(y - h) + '" width="' + n1(w / 2) + '" height="' + h + '" fill="' + dark + '" opacity=".45"/>';
  s += '<rect x="' + n1(x - w * .75) + '" y="' + n1(y - h - 5) + '" width="' + n1(w * 1.5) + '" height="6" fill="' + cap + '"/><rect x="' + n1(x - w * .75) + '" y="' + n1(y - 4) + '" width="' + n1(w * 1.5) + '" height="5" fill="' + cap + '"/>';
  add(c, s);
}
function embers(c, x, y, h) {
  var N = c.lvl === 3 ? 3 : 1, k, s = '';
  for (k = 0; k < N; k++) s += '<circle class="ember" cx="' + n1(x + (k - 1) * h * .12) + '" cy="' + n1(y - h) + '" r="' + (c.lvl === 3 ? 1.3 : 2.2) + '" fill="' + hs(c, [44, 100, 72]) + '" style="--ex:' + (k - 1) * 9 + 'px;animation-delay:' + n1(-k * .9 - (x % 7) * .13) + 's"/>';
  add(c, s);
}
function flame(c, x, y, h) { flame0(c, x, y, h); if (c.lvl >= 2) embers(c, x, y, h); }
function flame0(c, x, y, h) {
  var o = c.M.glow || [30, 100, 58];
  if (c.lvl === 1) add(c, '<g class="flick"><polygon points="' + pts([[x - h * .3, y], [x - h * .1, y - h * .6], [x, y - h], [x + h * .15, y - h * .55], [x + h * .3, y]]) + '" fill="' + hs(c, o) + '"/><polygon points="' + pts([[x - h * .12, y], [x, y - h * .5], [x + h * .14, y]]) + '" fill="' + hs(c, [48, 100, 70]) + '"/></g>');
  else if (c.lvl === 2) add(c, '<g class="flick"><path d="M' + n1(x - h * .3) + ',' + y + ' Q' + n1(x - h * .25) + ',' + n1(y - h * .5) + ' ' + n1(x) + ',' + n1(y - h) + ' Q' + n1(x + h * .3) + ',' + n1(y - h * .45) + ' ' + n1(x + h * .3) + ',' + y + ' Z" fill="' + hs(c, o) + '"/><path d="M' + n1(x - h * .13) + ',' + y + ' Q' + n1(x) + ',' + n1(y - h * .6) + ' ' + n1(x + h * .14) + ',' + y + ' Z" fill="' + hs(c, [48, 100, 70]) + '"/></g>');
  else add(c, '<circle class="pulse" cx="' + x + '" cy="' + n1(y - h * .4) + '" r="' + n1(h * 1.2) + '" fill="' + rad(c, [[0, hs(c, o, 0, .35)], [1, hs(c, o, 0, 0)]]) + '"/><g class="flick"><path d="M' + n1(x - h * .3) + ',' + y + ' C' + n1(x - h * .36) + ',' + n1(y - h * .5) + ' ' + n1(x - h * .05) + ',' + n1(y - h * .55) + ' ' + n1(x) + ',' + n1(y - h) + ' C' + n1(x + h * .1) + ',' + n1(y - h * .55) + ' ' + n1(x + h * .38) + ',' + n1(y - h * .5) + ' ' + n1(x + h * .3) + ',' + y + ' Z" fill="' + lin(c, [[0, 'hsl(48,100%,72%)'], [.5, hs(c, o)], [1, hs(c, o, -14)]]) + '"/></g>');
}
function crystals(c, count, ri) {
  var r = c.rs[ri == null ? 4 : ri], col = [190, 60, 78], W = c.W;
  for (var k = 0; k < count; k++) {
    var x = (k + .3 + r() * .4) * W / count, h = 34 + r() * 60, w = 12 + r() * 14, y = c.H + 2;
    var s = '<polygon points="' + pts([[x - w, y], [x - w * .5, y - h * .8], [x, y - h], [x + w * .6, y - h * .7], [x + w, y]]) + '" fill="' + (c.lvl === 1 ? hs(c, col) : lin(c, [[0, hs(c, col, 10)], [1, hs(c, col, -12)]])) + '"/>';
    s += '<polygon points="' + pts([[x, y - h], [x + w * .6, y - h * .7], [x + w, y], [x, y]]) + '" fill="' + hs(c, col, -14) + '" opacity=".55"/>';
    s += '<polygon points="' + pts([[x - w * .5, y - h * .8], [x, y - h], [x - w * .1, y - h * .5]]) + '" fill="#fff" opacity=".6"/>';
    add(c, s);
  }
}
function tomb(c, x, y, w, h, col) {
  var f = hs(c, col, 2), d = hs(c, col, -12);
  if (c.lvl === 1) add(c, '<polygon points="' + pts([[x - w / 2, y], [x - w / 2, y - h * .8], [x - w * .2, y - h], [x + w * .2, y - h], [x + w / 2, y - h * .8], [x + w / 2, y]]) + '" fill="' + f + '"/><rect x="' + n1(x) + '" y="' + n1(y - h) + '" width="' + n1(w / 2) + '" height="' + h + '" fill="' + d + '"/>');
  else add(c, '<path d="M' + n1(x - w / 2) + ',' + y + ' L' + n1(x - w / 2) + ',' + n1(y - h * .7) + ' Q' + n1(x - w / 2) + ',' + n1(y - h) + ' ' + n1(x) + ',' + n1(y - h) + ' Q' + n1(x + w / 2) + ',' + n1(y - h) + ' ' + n1(x + w / 2) + ',' + n1(y - h * .7) + ' L' + n1(x + w / 2) + ',' + y + ' Z" fill="' + (c.lvl === 3 ? fv(c, col, 8, -8) : f) + '"/><rect x="' + n1(x - w * .1) + '" y="' + n1(y - h * .8) + '" width="' + n1(w * .2) + '" height="' + n1(h * .45) + '" fill="' + d + '" opacity=".5"/>');
}
function deadTree(c, x, y, h, col) {
  var d = hs(c, col, -6), s = '<path d="M' + x + ',' + y + ' L' + n1(x - 3) + ',' + n1(y - h * .5) + ' L' + n1(x - 24) + ',' + n1(y - h * .8) + ' M' + n1(x - 3) + ',' + n1(y - h * .5) + ' L' + n1(x + 4) + ',' + n1(y - h) + ' M' + n1(x - 2) + ',' + n1(y - h * .62) + ' L' + n1(x + 26) + ',' + n1(y - h * .85) + '" stroke="' + d + '" stroke-width="' + (c.lvl === 1 ? 6 : 5) + '" stroke-linecap="' + (c.lvl === 1 ? 'butt' : 'round') + '" fill="none"/>';
  add(c, s);
}
function blobs(c, count, ri, col) {
  var r = c.rs[ri == null ? 5 : ri], W = c.W;
  for (var k = 0; k < count; k++) {
    var x = (k + .2 + r() * .6) * W / count, y = 40 + r() * 80, rr = 22 + r() * 34;
    if (c.lvl === 1) { var P = []; for (var j = 0; j < 6; j++) { var a = j * Math.PI / 3; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .8]); } add(c, '<polygon points="' + pts(P) + '" fill="' + hs(c, col, k % 2 ? 4 : -4) + '"/>'); }
    else add(c, '<ellipse cx="' + n1(x) + '" cy="' + n1(y) + '" rx="' + n1(rr) + '" ry="' + n1(rr * .8) + '" fill="' + (c.lvl === 3 ? rad(c, [[0, hs(c, col, 14)], [1, hs(c, col, -10)]]) : hs(c, col, k % 2 ? 4 : -4)) + '"/>');
  }
}

/* ---------- item-tab props: generic racks, benches, shelves and trinkets, all invented ---------- */
function shieldAt(c, x, y, r, col) {
  var rim = [40, 18, 66], s;
  if (c.lvl === 1) {
    s = '<polygon points="' + pts([[x - r, y - r], [x + r, y - r], [x + r, y + r * .2], [x + r * .55, y + r * .95], [x, y + r * 1.3], [x - r * .55, y + r * .95], [x - r, y + r * .2]]) + '" fill="' + hs(c, rim) + '"/>' +
      '<polygon points="' + pts([[x - r * .72, y - r * .72], [x + r * .72, y - r * .72], [x + r * .72, y + r * .1], [x, y + r * .95], [x - r * .72, y + r * .1]]) + '" fill="' + hs(c, col) + '"/>' +
      '<polygon points="' + pts([[x, y - r * .72], [x + r * .72, y - r * .72], [x + r * .72, y + r * .1], [x, y + r * .95]]) + '" fill="' + hs(c, col, -12) + '"/>';
  } else {
    var P = function (k) { return 'M' + n1(x - r * k) + ',' + n1(y - r * k * .96) + ' L' + n1(x + r * k) + ',' + n1(y - r * k * .96) + ' L' + n1(x + r * k) + ',' + n1(y + r * .15) + ' Q' + n1(x + r * k) + ',' + n1(y + r * .9 * k) + ' ' + x + ',' + n1(y + r * (.3 + k)) + ' Q' + n1(x - r * k) + ',' + n1(y + r * .9 * k) + ' ' + n1(x - r * k) + ',' + n1(y + r * .15) + ' Z'; };
    s = '<path d="' + P(1) + '" fill="' + fv(c, rim, 10, -10) + '"/><path d="' + P(.76) + '" fill="' + fv(c, col, 8, -10) + '"/>' +
      '<rect x="' + n1(x - r * .1) + '" y="' + n1(y - r * .7) + '" width="' + n1(r * .2) + '" height="' + n1(r * 1.4) + '" fill="' + hs(c, rim, 6) + '" opacity=".85"/><circle cx="' + x + '" cy="' + n1(y - r * .05) + '" r="' + n1(r * .24) + '" fill="' + hs(c, rim, 10) + '"/>';
    if (c.lvl === 3) s += '<path d="M' + n1(x - r * .6) + ',' + n1(y - r * .6) + ' L' + n1(x - r * .6) + ',' + n1(y + r * .1) + '" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>';
  }
  add(c, s);
}
function swordAt(c, x, y, len, ang, col) {
  var w = len * .07, bl = [[x, y - len], [x + w, y - len * .9], [x + w, y - 10], [x - w, y - 10], [x - w, y - len * .9]], s = '<g transform="rotate(' + ang + ' ' + x + ' ' + y + ')">';
  s += '<polygon points="' + pts(bl) + '" fill="' + hs(c, [215, 16, 78]) + '"/><polygon points="' + pts([[x, y - len], [x + w, y - len * .9], [x + w, y - 10], [x, y - 10]]) + '" fill="' + hs(c, [215, 16, 58]) + '"/>';
  s += '<rect x="' + n1(x - w * 2.8) + '" y="' + (y - 12) + '" width="' + n1(w * 5.6) + '" height="5" fill="' + hs(c, col) + '"/><rect x="' + n1(x - w * .7) + '" y="' + (y - 8) + '" width="' + n1(w * 1.4) + '" height="20" fill="' + hs(c, [24, 40, 28]) + '"/>';
  s += c.lvl === 1 ? '<rect x="' + n1(x - w) + '" y="' + (y + 10) + '" width="' + n1(w * 2) + '" height="5" fill="' + hs(c, col) + '"/>' : '<circle cx="' + x + '" cy="' + (y + 13) + '" r="' + n1(w * 1.2) + '" fill="' + hs(c, col, 6) + '"/>';
  add(c, s + '</g>');
}
function tunicAt(c, x, y, s, col) {
  var P = [[x - s * .42, y], [x + s * .42, y], [x + s, y + s * .35], [x + s * .72, y + s * .62], [x + s * .42, y + s * .5], [x + s * .42, y + s * 1.25], [x - s * .42, y + s * 1.25], [x - s * .42, y + s * .5], [x - s * .72, y + s * .62], [x - s, y + s * .35]];
  var o = '<polygon points="' + pts(P) + '" fill="' + fv(c, col, 6, -8) + '"/>';
  o += '<rect x="' + n1(x - s * .42) + '" y="' + n1(y + s * .72) + '" width="' + n1(s * .84) + '" height="' + n1(s * .12) + '" fill="' + hs(c, [30, 40, 34]) + '"/>';
  o += c.lvl === 1 ? '<polygon points="' + pts([[x - s * .2, y], [x, y + s * .22], [x + s * .2, y]]) + '" fill="' + hs(c, col, -22) + '"/>' : '<path d="M' + n1(x - s * .2) + ',' + y + ' Q' + x + ',' + n1(y + s * .3) + ' ' + n1(x + s * .2) + ',' + y + ' Z" fill="' + hs(c, col, -22) + '"/>';
  add(c, '<line x1="' + x + '" y1="' + (y - 8) + '" x2="' + x + '" y2="' + y + '" stroke="' + hs(c, [30, 20, 30]) + '" stroke-width="2"/>' + o);
}
function bootAt(c, x, y, s, col) {
  add(c, '<polygon points="' + pts([[x - s * .3, y - s], [x + s * .22, y - s], [x + s * .22, y - s * .3], [x + s * .85, y - s * .12], [x + s * .85, y], [x - s * .3, y]]) + '" fill="' + fv(c, col, 6, -8) + '"/><rect x="' + n1(x - s * .34) + '" y="' + n1(y - s * 1.08) + '" width="' + n1(s * .6) + '" height="' + n1(s * .18) + '" fill="' + hs(c, col, 12) + '"/><rect x="' + n1(x - s * .3) + '" y="' + n1(y - s * .08) + '" width="' + n1(s * 1.15) + '" height="' + n1(s * .1) + '" fill="' + hs(c, [24, 30, 18]) + '"/>');
}
function bottleAt(c, x, y, h, col) {
  var w = h * .34, s = '';
  if (c.lvl === 1) s = '<polygon points="' + pts([[x - w * .3, y - h], [x + w * .3, y - h], [x + w * .3, y - h * .7], [x + w, y - h * .45], [x + w, y], [x - w, y], [x - w, y - h * .45], [x - w * .3, y - h * .7]]) + '" fill="' + hs(c, col) + '"/><polygon points="' + pts([[x, y - h * .7], [x + w, y - h * .45], [x + w, y], [x, y]]) + '" fill="' + hs(c, col, -12) + '"/><rect x="' + n1(x - w * .36) + '" y="' + n1(y - h * 1.12) + '" width="' + n1(w * .72) + '" height="' + n1(h * .14) + '" fill="' + hs(c, [30, 40, 50]) + '"/>';
  else s = '<path d="M' + n1(x - w * .3) + ',' + n1(y - h) + ' L' + n1(x + w * .3) + ',' + n1(y - h) + ' L' + n1(x + w * .3) + ',' + n1(y - h * .72) + ' Q' + n1(x + w) + ',' + n1(y - h * .6) + ' ' + n1(x + w) + ',' + n1(y - h * .3) + ' L' + n1(x + w) + ',' + y + ' L' + n1(x - w) + ',' + y + ' L' + n1(x - w) + ',' + n1(y - h * .3) + ' Q' + n1(x - w) + ',' + n1(y - h * .6) + ' ' + n1(x - w * .3) + ',' + n1(y - h * .72) + ' Z" fill="' + fv(c, col, 10, -10) + '"/><rect x="' + n1(x - w * .38) + '" y="' + n1(y - h * 1.14) + '" width="' + n1(w * .76) + '" height="' + n1(h * .16) + '" rx="2" fill="' + hs(c, [30, 40, 50]) + '"/><path d="M' + n1(x - w * .62) + ',' + n1(y - h * .5) + ' L' + n1(x - w * .62) + ',' + n1(y - h * .14) + '" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>';
  add(c, s);
  if (c.lvl === 3) add(c, '<circle class="pulse" cx="' + x + '" cy="' + n1(y - h * .3) + '" r="' + n1(h * .8) + '" fill="' + rad(c, [[0, hs(c, col, 10, .35)], [1, hs(c, col, 10, 0)]]) + '"/>');
}
function sackAt(c, x, y, s, col) {
  var d = c.lvl === 1 ?
    '<polygon points="' + pts([[x - s * .5, y], [x - s * .72, y - s * .5], [x - s * .4, y - s * .88], [x - s * .22, y - s * .95], [x + s * .22, y - s * .95], [x + s * .4, y - s * .88], [x + s * .72, y - s * .5], [x + s * .5, y]]) + '" fill="' + hs(c, col) + '"/><polygon points="' + pts([[x, y], [x, y - s * .95], [x + s * .4, y - s * .88], [x + s * .72, y - s * .5], [x + s * .5, y]]) + '" fill="' + hs(c, col, -12) + '"/>' :
    '<path d="M' + n1(x - s * .5) + ',' + y + ' C' + n1(x - s * .86) + ',' + n1(y - s * .3) + ' ' + n1(x - s * .6) + ',' + n1(y - s * .8) + ' ' + n1(x - s * .24) + ',' + n1(y - s * .94) + ' L' + n1(x + s * .24) + ',' + n1(y - s * .94) + ' C' + n1(x + s * .6) + ',' + n1(y - s * .8) + ' ' + n1(x + s * .86) + ',' + n1(y - s * .3) + ' ' + n1(x + s * .5) + ',' + y + ' Z" fill="' + fv(c, col, 10, -10) + '"/>';
  d += '<rect x="' + n1(x - s * .3) + '" y="' + n1(y - s * 1.02) + '" width="' + n1(s * .6) + '" height="' + n1(s * .13) + '" fill="' + hs(c, [28, 36, 30]) + '"/><polygon points="' + pts([[x - s * .24, y - s * 1.02], [x - s * .32, y - s * 1.16], [x - s * .08, y - s * 1.06]]) + '" fill="' + hs(c, col, -4) + '"/><polygon points="' + pts([[x + s * .24, y - s * 1.02], [x + s * .4, y - s * 1.16], [x + s * .08, y - s * 1.06]]) + '" fill="' + hs(c, col, -4) + '"/>';
  add(c, d);
}
function coinAt(c, x, y, r) {
  if (c.lvl === 1) add(c, '<rect x="' + n1(x - r) + '" y="' + n1(y - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" fill="' + hs(c, [46, 90, 56]) + '"/>');
  else add(c, '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r + '" ry="' + n1(r * .5) + '" fill="' + hs(c, [44, 90, 52]) + '"/><ellipse cx="' + x + '" cy="' + n1(y - 1.4) + '" rx="' + r + '" ry="' + n1(r * .5) + '" fill="' + hs(c, [48, 96, 68]) + '"/>');
}
function boulderAt(c, x, y, r, col) {
  if (c.lvl === 1) { var P = []; for (var j = 0; j < 8; j++) { var a = j * Math.PI / 4 + .3; P.push([x + Math.cos(a) * r * (j % 2 ? .92 : 1.05), y + Math.sin(a) * r * .86]); } add(c, '<polygon points="' + pts(P) + '" fill="' + hs(c, col) + '"/><polygon points="' + pts([[x, y - r * .8], P[0], P[1], P[2], P[3], [x - r * .2, y + r * .2]]) + '" fill="' + hs(c, col, -12) + '"/>'); return; }
  add(c, '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r + '" ry="' + n1(r * .86) + '" fill="' + (c.lvl === 3 ? rad(c, [[0, hs(c, col, 16)], [.7, hs(c, col, 0)], [1, hs(c, col, -16)]]) : hs(c, col)) + '"/><path d="M' + n1(x - r * .5) + ',' + n1(y - r * .5) + ' Q' + n1(x - r * .1) + ',' + n1(y - r * .85) + ' ' + n1(x + r * .4) + ',' + n1(y - r * .6) + '" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M' + n1(x + r * .1) + ',' + n1(y - r * .1) + ' l-' + n1(r * .2) + ',' + n1(r * .3) + ' l' + n1(r * .15) + ',' + n1(r * .3) + '" stroke="' + hs(c, col, -22) + '" stroke-width="2" fill="none" stroke-linejoin="round"/>');
}
function discAt(c, x, y, r, col) {
  add(c, '<g class="bob b' + (Math.round(x) % 4) + '">');
  if (c.lvl === 3) add(c, '<circle class="pulse" cx="' + x + '" cy="' + y + '" r="' + r * 2.6 + '" fill="' + rad(c, [[0, hs(c, col, 10, .5)], [1, hs(c, col, 10, 0)]]) + '"/>');
  if (c.lvl === 1) add(c, '<polygon points="' + pts([[x, y - r], [x + r, y], [x, y + r], [x - r, y]]) + '" fill="' + hs(c, [46, 70, 56]) + '"/><polygon points="' + pts([[x, y - r * .62], [x + r * .62, y], [x, y + r * .62], [x - r * .62, y]]) + '" fill="' + hs(c, col) + '"/>');
  else add(c, '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fv(c, [44, 80, 62], 12, -12) + '"/><circle cx="' + x + '" cy="' + y + '" r="' + n1(r * .68) + '" fill="' + (c.lvl === 3 ? rad(c, [[0, hs(c, col, 22)], [1, hs(c, col, -4)]]) : hs(c, col)) + '"/><path d="M' + n1(x - r * .4) + ',' + n1(y - r * .2) + ' Q' + n1(x - r * .2) + ',' + n1(y - r * .5) + ' ' + n1(x + r * .1) + ',' + n1(y - r * .5) + '" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none" stroke-linecap="round"/>');
  add(c, '</g>');
}
function noteAt(c, x, y, up, col) {
  col = col || [44, 80, 80];
  var s = c.lvl === 1 ?
    '<rect x="' + n1(x - 8) + '" y="' + n1(y - 5) + '" width="16" height="10" fill="' + hs(c, col) + '"/>' : '<ellipse cx="' + x + '" cy="' + y + '" rx="8.6" ry="6" transform="rotate(-20 ' + x + ' ' + y + ')" fill="' + (c.lvl === 3 ? rad(c, [[0, hs(c, col, 22)], [1, hs(c, col, -4)]]) : hs(c, col)) + '"/>';
  var sx = up ? x + 7.4 : x - 7.4;
  s += '<rect x="' + n1(sx - 1.5) + '" y="' + (up ? y - 34 : y) + '" width="3" height="34" fill="' + hs(c, col) + '"/>';
  add(c, '<g class="bob b' + (Math.round(x) % 4) + '">' + (c.lvl === 3 ? '<g class="twk t' + (Math.round(x) % 4) + '">' + s + '</g>' : s) + '</g>');
}

/* ---------- scenes ---------- */
/* ---------- life: grass, wind-blown leaves, fireflies, butterflies, rain, snow, dust (handhelds get a little, Switch 2 gets a lot) ---------- */
var GRASSY = { field: 1, ranch: 1, forest: 1, woods: 1, village: 1, graves: 1, mountain: 1, valley: 1, deku: 1 };
var LEAFY = { field: 1, ranch: 1, forest: 1, woods: 1, village: 1, mountain: 1, water: 1, deku: 1, valley: 1 };
var OUTD = { field: 1, ranch: 1, forest: 1, woods: 1, village: 1, graves: 1, lake: 1, deku: 1, town: 1, mountain: 1 };
function grass(c) {
  var r = c.rs[6], W = c.W, H = c.H, three = c.lvl === 3, s = '', k, pass;
  var fl = [[0, 0, 100], [330, 80, 80], [48, 100, 66], [280, 60, 80]];
  var hue = [(c.A.h + 8) % 360, Math.min(100, Math.max(34, c.A.s)), 0];
  /* two rows on Switch 2: a lighter, shorter row behind and a darker taller one in front */
  for (pass = three ? 0 : 1; pass < 2; pass++) {
    var N = three ? (pass ? 64 : 52) : 22, base = [hue[0], hue[1], clamp(30 + c.M.L * .6 + (pass ? -6 : 4), 12, 52)];
    for (k = 0; k < N; k++) {
      var x = (k + r()) * W / N, h = three ? (pass ? 14 + r() * 22 : 9 + r() * 14) : 10 + r() * 9, d = (r() - .5) * 8, w = three ? 2.4 : 5, tone = hs(c, base, (k % 3 - 1) * 6 + r() * 8), b;
      b = three ? '<path d="M' + n1(x - w) + ',' + (H + 2) + ' Q' + n1(x - w * .4) + ',' + n1(H - h * .55) + ' ' + n1(x + d) + ',' + n1(H - h) + ' Q' + n1(x + w * .5) + ',' + n1(H - h * .5) + ' ' + n1(x + w) + ',' + (H + 2) + ' Z" fill="' + tone + '"/>' :
        '<polygon points="' + pts([[x - w, H + 2], [x + d, H - h], [x + w, H + 2]]) + '" fill="' + tone + '"/>';
      if (three && pass && k % 6 === 3) { var f = fl[(k / 6 | 0) % 4]; b += '<circle cx="' + n1(x + d) + '" cy="' + n1(H - h) + '" r="2.2" fill="' + hs(c, f) + '"/><circle cx="' + n1(x + d) + '" cy="' + n1(H - h) + '" r=".8" fill="#ffe27a"/>'; }
      /* four neighbouring blades sway as one clump, which keeps the number of moving parts down */
      if (k % 16 === 0 && pass) s += '<g class="sway" style="--sk:' + (three ? n1(5 + r() * 5) : 5) + 'deg;--sp:' + n1(2.6 + r() * 1.6) + 's;animation-delay:' + ph(c, x) + 's">';
      s += b;
      if (pass && (k % 16 === 15 || k === N - 1)) s += '</g>';
    }
  }
  add(c, s);
}
function leaves(c) {
  var r = c.rs[4], N = c.lvl === 3 ? 7 : 3, s = '', k, cols = c.M.stars ? [[100, 40, 30], [80, 36, 34]] : c.A.m === 'dusk' ? [[24, 80, 50], [40, 86, 52], [10, 70, 44]] : [[96, 56, 44], [80, 58, 50], [44, 86, 56], [120, 44, 36]];
  for (k = 0; k < N; k++) {
    var y0 = 10 + r() * 70, y1 = y0 + 18 + r() * 40, sz = 4.5 + r() * 4, col = cols[k % cols.length], shape;
    shape = c.lvl === 3 ? '<path d="M0,0 Q' + n1(sz * .5) + ',' + n1(-sz * .8) + ' ' + n1(sz * 1.6) + ',0 Q' + n1(sz * .5) + ',' + n1(sz * .8) + ' 0,0 Z" fill="' + hs(c, col) + '"/><path d="M0,0 L' + n1(sz * 1.4) + ',0" stroke="' + hs(c, col, -16) + '" stroke-width=".6"/>' :
      '<polygon points="' + pts([[0, 0], [sz * .8, -sz * .7], [sz * 1.6, 0], [sz * .8, sz * .7]]) + '" fill="' + hs(c, col) + '"/>';
    s += '<g class="lf" style="--y0:' + n1(y0) + 'px;--y1:' + n1(y1) + 'px;animation-duration:' + n1(15 + r() * 14) + 's;animation-delay:' + n1(-r() * 26) + 's"><g class="wob" style="animation-delay:' + n1(-r() * 3) + 's"><g class="tumble" style="animation-duration:' + n1(2.2 + r() * 3) + 's">' + shape + '</g></g></g>';
  }
  add(c, s);
}
function wisps(c) {
  var r = c.rs[5], N = c.lvl === 3 ? 12 : 5, s = '', k, col = c.A.m === 'arcane' ? [280, 90, 78] : [64, 100, 68], g = c.lvl === 3 ? rad(c, [[0, hs(c, col, 0, .6)], [1, hs(c, col, 0, 0)]]) : '';
  for (k = 0; k < N; k++) {
    var x = r() * c.W, y = 44 + r() * 80, dx = (r() - .5) * 70, dy = -(8 + r() * 24);
    s += '<g transform="translate(' + n1(x) + ' ' + n1(y) + ')"><g class="wisp" style="--wx:' + n1(dx) + 'px;--wy:' + n1(dy) + 'px;animation-duration:' + n1(9 + r() * 8) + 's;animation-delay:' + n1(-r() * 12) + 's">' + (g ? '<circle r="9" fill="' + g + '"/>' : '') + '<circle class="twk t' + (k % 4) + '" r="' + (c.lvl === 3 ? 1.9 : 3) + '" fill="' + hs(c, col, 10) + '"/></g></g>';
  }
  add(c, s);
}
function bflies(c) {
  if (c.lvl < 3) return;
  var r = c.rs[3], cols = [[330, 90, 72], [38, 100, 62], [200, 90, 70]], s = '', k;
  for (k = 0; k < 3; k++) {
    var x = 160 + r() * 880, y = 66 + r() * 40, col = cols[k];
    s += '<g transform="translate(' + n1(x) + ' ' + n1(y) + ')"><g class="wisp" style="--wx:' + n1((r() - .5) * 90) + 'px;--wy:-16px;animation-duration:' + n1(11 + r() * 6) + 's;animation-delay:' + n1(-r() * 10) + 's"><g class="flap" style="animation-delay:' + n1(-r()) + 's"><ellipse cx="-2.6" cy="-1.6" rx="2.6" ry="3.4" fill="' + hs(c, col) + '"/><ellipse cx="2.6" cy="-1.6" rx="2.6" ry="3.4" fill="' + hs(c, col) + '"/><ellipse cx="-1.8" cy="2" rx="1.8" ry="2.2" fill="' + hs(c, col, -8) + '"/><ellipse cx="1.8" cy="2" rx="1.8" ry="2.2" fill="' + hs(c, col, -8) + '"/></g><rect x="-.4" y="-3.4" width=".8" height="6.4" rx=".4" fill="#2a2030"/></g></g>';
  }
  add(c, s);
}
function rain(c) {
  var r = c.rs[2], N = c.lvl === 3 ? 44 : 12, s = '', k;
  for (k = 0; k < N; k++) { var x = r() * (c.W + 80), y = -10 + r() * 90, l = 8 + r() * 10; s += '<line x1="' + n1(x) + '" y1="' + n1(y) + '" x2="' + n1(x - l * .3) + '" y2="' + n1(y + l) + '"/>'; }
  add(c, '<g class="rain" stroke="#cfe0ff" stroke-opacity="' + (c.lvl === 3 ? .5 : .7) + '" stroke-width="' + (c.lvl === 3 ? 1 : 1.8) + '" stroke-linecap="round"><g>' + s + '</g><g transform="translate(21 -70)">' + s + '</g></g>');
}
function snow(c) {
  var r = c.rs[6], N = c.lvl === 3 ? 30 : 8, s = '', k;
  for (k = 0; k < N; k++) { var x = r() * c.W, z = r(); s += '<circle class="snowf" cx="' + n1(x) + '" cy="-6" r="' + n1(c.lvl === 3 ? 1 + z * 1.8 : 2.6) + '" fill="#fff" opacity="' + n1(.5 + z * .5) + '" style="--sx:' + n1((r() - .5) * 40) + 'px;animation-duration:' + n1(6 + (1 - z) * 6) + 's;animation-delay:' + n1(-r() * 12) + 's"/>'; }
  add(c, s);
}
function dust(c) {
  var r = c.rs[7], N = c.lvl === 3 ? 12 : 4, s = '', k;
  for (k = 0; k < N; k++) { var y = 60 + r() * 76, l = 30 + r() * 70; s += '<line class="dust" x1="0" y1="' + n1(y) + '" x2="' + n1(l) + '" y2="' + n1(y + (r() - .5) * 6) + '" stroke="' + hs(c, [38, 60, 84]) + '" stroke-opacity=".5" stroke-width="' + (c.lvl === 3 ? 1.4 : 2.6) + '" stroke-linecap="round" style="animation-duration:' + n1(5 + r() * 6) + 's;animation-delay:' + n1(-r() * 10) + 's"/>'; }
  add(c, s);
}
function life(c) {
  var k = c.A.k;
  if (c.lvl < 2) return;
  if (GRASSY[k]) grass(c);
  if (LEAFY[k]) leaves(c);
  if (OUTD[k] && (c.M.stars || c.M.L < -12)) wisps(c);
  else if (c.M.orb && (k === 'field' || k === 'ranch' || k === 'forest' || k === 'lake' || k === 'village')) bflies(c);
  if (k === 'castle') rain(c);
  if (k === 'ice') snow(c);
  if (k === 'desert') dust(c);
}

var SC = {
  /* item-tab scenes */
  armory: function (c) {
    sky(c);
    var k, cols = [[8, 56, 40], [212, 50, 40], [42, 70, 46], [140, 38, 34], [276, 36, 40]];
    for (k = 0; k < 8; k++) column(c, 60 + k * 154, 128, 20, 96, lcol(c, 1, 3, 0));
    for (k = 0; k < 4; k++) { swordAt(c, 280 + k * 213, 112, 76, -38, [42, 70, 50]); swordAt(c, 280 + k * 213, 112, 76, 38, [42, 70, 50]); }
    for (k = 0; k < 5; k++) shieldAt(c, 175 + k * 212, 60, 25, cols[k]);
    ground(c, 2, 3, 124);
    flame(c, 36, 96, 22); flame(c, 1164, 96, 22); lights(c, 36, 84, 70, c.M.glow); lights(c, 1164, 84, 70, c.M.glow);
    fog(c, 90, 40, .3); parts(c, 14, [40, 90, 66], 20, 110);
  },
  wardrobe: function (c) {
    sky(c);
    var rail = hs(c, [28, 36, 30]), k, tc = [[128, 46, 38], [4, 56, 44], [214, 56, 46], [128, 46, 38], [270, 34, 44], [38, 62, 46]];
    add(c, '<rect x="60" y="22" width="1080" height="5" fill="' + rail + '"/><rect x="60" y="22" width="5" height="116" fill="' + rail + '"/><rect x="1135" y="22" width="5" height="116" fill="' + rail + '"/>');
    for (k = 0; k < 6; k++) tunicAt(c, 170 + k * 172, 32, 40, tc[k]);
    ground(c, 2, 3, 120);
    for (k = 0; k < 5; k++) { bootAt(c, 130 + k * 224, 124, 30, [26, 36, 30 + (k % 2) * 8]); bootAt(c, 176 + k * 224, 124, 30, [26, 36, 30 + (k % 2) * 8]); }
    fog(c, 96, 36, .25); parts(c, 12, [40, 80, 70], 30, 110);
  },
  bench: function (c) {
    sky(c);
    var k, wood = lcol(c, 2, 3, 0), r = c.rs[2], s = '', y = 98;
    add(c, '<rect x="0" y="' + y + '" width="' + c.W + '" height="' + (c.H - y + 1) + '" fill="' + fv(c, [28, 44, 34], 6, -10) + '"/><rect x="0" y="' + y + '" width="' + c.W + '" height="4" fill="' + hs(c, [28, 44, 52]) + '"/>');
    /* hammer, bombs, a boomerang, a rope coil and a bundle of arrows lying along the bench */
    add(c, '<g transform="rotate(-14 320 ' + y + ')"><rect x="314" y="48" width="12" height="50" fill="' + hs(c, [28, 44, 42]) + '"/><rect x="286" y="36" width="68" height="22" fill="' + hs(c, [215, 12, 58]) + '"/><rect x="318" y="36" width="36" height="22" fill="' + hs(c, [215, 12, 44]) + '"/></g>');
    [440, 506, 940].forEach(function (x, i) {
      add(c, c.lvl === 1 ? '<polygon points="' + pts([[x - 18, y - 4], [x - 22, y - 22], [x - 8, y - 36], [x + 8, y - 36], [x + 22, y - 22], [x + 18, y - 4]]) + '" fill="' + hs(c, [220, 10, 22]) + '"/>' : '<circle cx="' + x + '" cy="' + (y - 20) + '" r="20" fill="' + (c.lvl === 3 ? rad(c, [[0, hs(c, [220, 10, 44])], [1, hs(c, [220, 10, 14])]]) : hs(c, [220, 10, 26])) + '"/>');
      add(c, '<rect x="' + (x - 6) + '" y="' + (y - 46) + '" width="12" height="12" fill="' + hs(c, [28, 30, 34]) + '"/><polyline points="' + x + ',' + (y - 46) + ' ' + (x + 8) + ',' + (y - 56) + ' ' + (x + 16) + ',' + (y - 52) + '" fill="none" stroke="' + hs(c, [36, 40, 66]) + '" stroke-width="3"/>');
      if (i === 0) flame(c, x + 16, y - 52, 12);
    });
    add(c, '<polyline points="640,' + (y - 46) + ' 662,' + (y - 18) + ' 716,' + (y - 12) + '" fill="none" stroke="' + hs(c, [30, 50, 36]) + '" stroke-width="11" stroke-linecap="' + (c.lvl === 1 ? 'butt' : 'round') + '" stroke-linejoin="' + (c.lvl === 1 ? 'miter' : 'round') + '"/>');
    add(c, '<g fill="none" stroke="' + hs(c, [34, 36, 62]) + '" stroke-width="5"><ellipse cx="800" cy="' + (y - 14) + '" rx="30" ry="12"/><ellipse cx="800" cy="' + (y - 14) + '" rx="18" ry="6"/></g>');
    for (k = 0; k < 6; k++) s += '<line x1="' + (1010 + k * 6) + '" y1="' + (y - 4 - k) + '" x2="' + (1110 + k * 6) + '" y2="' + (y - 32 + k * 2) + '" stroke="' + hs(c, [34, 34, 60]) + '" stroke-width="3"/>';
    add(c, s);
    lights(c, 600, 40, 120, [44, 90, 70]); fog(c, 70, 30, .2); parts(c, 14, [44, 90, 70], 20, 90);
  },
  magic: function (c) {
    sky(c); parts(c, 26, c.M.o, 10, 120);
    var k, cx = 600, cy = 100, s = '', cols = [[128, 80, 56], [4, 80, 60], [214, 80, 64]];
    ridge(c, 1, 3, 126, 8);
    for (k = 0; k < 3; k++) {
      var rx = 300 - k * 80, ry = 30 - k * 7;
      s += c.lvl === 1 ? '<polygon points="' + pts([[cx - rx, cy], [cx - rx * .5, cy - ry], [cx + rx * .5, cy - ry], [cx + rx, cy], [cx + rx * .5, cy + ry], [cx - rx * .5, cy + ry]]) + '" fill="none" stroke="' + hs(c, [280, 70, 70]) + '" stroke-width="4"/>' : '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + hs(c, [280, 80, 74]) + '" stroke-width="' + (c.lvl === 3 ? 2.4 : 3) + '" opacity="' + (.9 - k * .15) + '"/>';
    }
    add(c, '<g class="pulse">' + s + '</g>');
    for (k = 0; k < 3; k++) { var ox = 420 + k * 180, oy = 56 - (k % 2) * 8; add(c, '<g class="bob b' + k + '">'); if (c.lvl === 3) add(c, '<circle cx="' + ox + '" cy="' + oy + '" r="46" fill="' + rad(c, [[0, hs(c, cols[k], 8, .55)], [1, hs(c, cols[k], 8, 0)]]) + '"/>'); add(c, c.lvl === 1 ? '<polygon points="' + pts([[ox, oy - 15], [ox + 15, oy], [ox, oy + 15], [ox - 15, oy]]) + '" fill="' + hs(c, cols[k]) + '"/>' : '<circle cx="' + ox + '" cy="' + oy + '" r="14" fill="' + (c.lvl === 3 ? rad(c, [[0, '#fff'], [.5, hs(c, cols[k], 14)], [1, hs(c, cols[k], -6)]]) : hs(c, cols[k])) + '"/>'); add(c, '</g>'); }
    s = '';
    for (k = 0; k < 5; k++) { var ax = 140 + k * 232, ay = 30 + (k % 3) * 24; s += '<line x1="' + (ax - 50) + '" y1="' + (ay + 16) + '" x2="' + ax + '" y2="' + ay + '" stroke="' + hs(c, [44, 90, 80]) + '" stroke-width="' + (c.lvl === 1 ? 4 : 2.4) + '"' + (c.lvl === 3 ? ' opacity=".9"' : '') + '/><polygon points="' + pts([[ax + 8, ay - 3], [ax - 4, ay - 7], [ax - 3, ay + 4]]) + '" fill="' + hs(c, [214, 20, 84]) + '"/>'; }
    add(c, s);
  },
  trial: function (c) {
    sky(c); orb(c, 930, 34, 17); clouds(c);
    peaks(c, 0, 3, 100, 4, 56, 84, 1, 0); ridge(c, 1, 3, 112, 8);
    boulderAt(c, 520, 106, 44, [24, 14, 52]); boulderAt(c, 690, 112, 28, [24, 14, 46]); boulderAt(c, 400, 114, 24, [24, 14, 44]); boulderAt(c, 330, 116, 16, [24, 14, 48]);
    pines(c, 2, 3, 124, 8, 18, 30, 2);
    waves(c, 116, 30, 2, 3); fog(c, 90, 30, .3);
  },
  stall: function (c) {
    sky(c); orb(c, 150, 70, 14); clouds(c);
    var k, s = '', y = 104, N = 14, aw = c.W / N;
    ridge(c, 0, 3, 90, 12);
    add(c, '<rect x="0" y="' + y + '" width="' + c.W + '" height="' + (c.H - y + 1) + '" fill="' + fv(c, [30, 40, 36], 6, -10) + '"/><rect x="0" y="' + y + '" width="' + c.W + '" height="4" fill="' + hs(c, [30, 40, 54]) + '"/>');
    var sc = [[352, 50, 44], [140, 28, 40], [214, 40, 44], [30, 56, 52], [100, 30, 38], [352, 50, 44]];
    for (k = 0; k < 6; k++) sackAt(c, 150 + k * 190, y, 36 + (k % 3) * 8, sc[k]);
    for (k = 0; k < 4; k++) { coinAt(c, 990 + k * 3, y - 6 - k * 6, 11); }
    for (k = 0; k < N; k++) s += '<polygon points="' + pts([[k * aw, 0], [(k + 1) * aw, 0], [(k + 1) * aw - 4, 40], [k * aw + 4, 40]]) + '" fill="' + hs(c, k % 2 ? [44, 30, 92] : [8, 60, 50]) + '"/>' + (c.lvl === 1 ? '<polygon points="' + pts([[k * aw + 4, 40], [(k + 1) * aw - 4, 40], [k * aw + aw / 2, 52]]) + '" fill="' + hs(c, k % 2 ? [44, 30, 92] : [8, 60, 50]) + '"/>' : '<path d="M' + n1(k * aw + 4) + ',40 Q' + n1(k * aw + aw / 2) + ',58 ' + n1((k + 1) * aw - 4) + ',40 Z" fill="' + hs(c, k % 2 ? [44, 30, 92] : [8, 60, 50]) + '"/>');
    add(c, s + (c.lvl === 1 ? '' : '<rect x="0" y="0" width="' + c.W + '" height="6" fill="' + hs(c, [8, 40, 30]) + '"/>'));
    fog(c, 80, 30, .2);
  },
  shelf: function (c) {
    sky(c);
    var k, wood = [28, 42, 38], cols = [[350, 70, 50], [130, 60, 46], [210, 70, 52], [48, 90, 56], [280, 50, 46], [190, 40, 70], [350, 70, 50]];
    for (k = 0; k < 2; k++) {
      var y = 62 + k * 52;
      for (var j = 0; j < 12; j++) bottleAt(c, 90 + j * 90 + (k ? 40 : 0), y, 34 + ((j + k) % 3) * 6, cols[(j * 3 + k * 2) % 7]);
      add(c, '<rect x="0" y="' + y + '" width="' + c.W + '" height="7" fill="' + fv(c, wood, 8, -10) + '"/><rect x="0" y="' + y + '" width="' + c.W + '" height="2" fill="' + hs(c, wood, 14) + '"/>');
    }
    lights(c, 600, 70, 180, [44, 90, 70]); fog(c, 80, 40, .22); parts(c, 16, [44, 90, 70], 10, 120);
  },
  relics: function (c) {
    sky(c);
    var k, cols = [[128, 60, 50], [4, 70, 52], [214, 70, 54], [30, 84, 54], [280, 50, 52], [52, 90, 56]];
    column(c, 70, 132, 24, 110, lcol(c, 1, 3, 0)); column(c, 1130, 132, 24, 110, lcol(c, 1, 3, 0));
    for (k = 0; k < 6; k++) { var a = Math.PI * (.1 + .8 * k / 5); discAt(c, 600 - Math.cos(a) * 330, 100 - Math.sin(a) * 70, 17, cols[k]); }
    add(c, '<polygon points="' + pts([[560, 128], [572, 100], [628, 100], [640, 128]]) + '" fill="' + fv(c, lcol(c, 2, 3, 0), 8, -8) + '"/><rect x="552" y="124" width="96" height="8" fill="' + hs(c, lcol(c, 2, 3, 0), 6) + '"/>');
    discAt(c, 600, 88, 12, [48, 96, 66]);
    ground(c, 2, 3, 132); fog(c, 86, 40, .35); parts(c, 20, c.M.o, 20, 120);
  },
  songs: function (c) {
    sky(c); if (!c.M.stars) { orb(c, 990, 36, 16); clouds(c); }
    ridge(c, 0, 3, 112, 10); ridge(c, 1, 3, 126, 7);
    var k, s = '', r = c.rs[2], night = !!c.M.stars, ink = night ? [44, 40, 86] : [26, 30, 26], nc = night ? [44, 86, 76] : [22, 40, 22];
    for (k = 0; k < 5; k++) s += '<rect x="0" y="' + (38 + k * 13) + '" width="' + c.W + '" height="' + (c.lvl === 1 ? 3 : 1.8) + '" fill="' + hs(c, ink) + '" opacity="' + (c.lvl === 3 ? .7 : .85) + '"/>';
    add(c, s);
    for (k = 0; k < 9; k++) { var y = 38 + Math.floor(r() * 9) * 6.5; noteAt(c, 100 + k * 125 + (r() - .5) * 20, y, y > 62, nc); }
    ridge(c, 2, 3, 136, 5); fog(c, 90, 36, .3);
  },
  field: function (c) {
    sky(c); orb(c, c.M.orb && c.A.m === 'dawn' ? 170 : 250, c.A.m === 'dawn' ? 82 : 34, 17); clouds(c);
    ridge(c, 0, 4, 90, 14); ridge(c, 1, 4, 102, 12);
    pine(c, 880, 112, 46, lcol(c, 2, 4, 6));
    ridge(c, 2, 4, 118, 9); ridge(c, 3, 4, 133, 5); fog(c, 84, 36, .4);
  },
  ranch: function (c) {
    sky(c); orb(c, 960, c.A.m === 'dusk' ? 78 : 34, 16); clouds(c);
    ridge(c, 0, 3, 98, 12);
    var col = lcol(c, 1, 3, 0);
    house(c, 250, 116, 70, 34, [8, 40, 40], 1); tower(c, 360, 116, 18, 52, [30, 12, 62], 12);
    ridge(c, 1, 3, 122, 8);
    var s = ''; for (var k = 0; k < 18; k++) s += '<rect x="' + (40 + k * 64) + '" y="116" width="4" height="16" fill="' + hs(c, col, -16) + '"/>';
    add(c, s + '<rect x="0" y="120" width="' + c.W + '" height="3" fill="' + hs(c, col, -16) + '"/><rect x="0" y="127" width="' + c.W + '" height="3" fill="' + hs(c, col, -16) + '"/>');
    ridge(c, 2, 3, 136, 5); fog(c, 88, 40, .35);
  },
  forest: function (c) {
    sky(c); orb(c, 900, 34, 18); clouds(c);
    ridge(c, 0, 4, 84, 12); pines(c, 1, 4, 100, 26, 22, 34, 1); ridge(c, 2, 4, 114, 9);
    pines(c, 3, 4, 150, 9, 70, 100, 3); fog(c, 76, 40, .45);
  },
  woods: function (c) {
    sky(c);
    pines(c, 0, 4, 120, 30, 36, 60, 1); fog(c, 60, 50, .55);
    trunks(c, 1, 3, 11, 12, 2); fog(c, 80, 40, .35); trunks(c, 2, 3, 6, 18, 3);
    ground(c, 2, 3, 128); parts(c, 18, [70, 90, 60], 40, 120);
  },
  town: function (c) {
    sky(c); orb(c, 190, 36, 16); clouds(c);
    ridge(c, 0, 3, 100, 10);
    var col = [226, 18, c.A.m === 'dusk' ? 32 : 62];
    tower(c, 560, 118, 34, 66, col, 26); tower(c, 640, 118, 44, 90, col, 36); tower(c, 730, 118, 34, 62, col, 26);
    add(c, '<rect x="540" y="96" width="210" height="24" fill="' + hs(c, col, -6) + '"/>');
    for (var k = 0; k < 7; k++) house(c, 60 + k * 150, 122, 40, 22, [226 - k * 6, 20, 46], 1);
    ridge(c, 2, 3, 134, 6);
  },
  castle: function (c) {
    sky(c); parts(c, 8, [50, 100, 70], 20, 100);
    ridge(c, 0, 3, 112, 12);
    var col = [275, 14, 18];
    tower(c, 470, 120, 30, 70, col, 40); tower(c, 560, 120, 40, 104, col, 50); tower(c, 650, 120, 52, 124, col, 62); tower(c, 745, 120, 40, 96, col, 46); tower(c, 830, 120, 28, 62, col, 34);
    add(c, '<rect x="470" y="86" width="360" height="40" fill="' + hs(c, col, -4) + '"/>');
    if (c.lvl === 3) add(c, '<path class="flash" d="M300,0 L284,34 L302,34 L278,80" stroke="#fff" stroke-width="2" fill="none" stroke-linejoin="round" opacity=".85"/>');
    else if (c.lvl === 2) add(c, '<path class="flash" d="M300,0 L284,34 L302,34 L278,80" stroke="#fff" stroke-width="2.6" fill="none" stroke-linejoin="round" opacity="0"/>');
    else add(c, '<polygon class="flash" points="' + pts([[300, 0], [284, 34], [300, 34], [278, 80], [304, 30], [288, 30]]) + '" fill="#fff" opacity="0"/>');
    ridge(c, 2, 3, 136, 7); fog(c, 90, 40, .4);
  },
  village: function (c) {
    sky(c); orb(c, 150, 82, 20);
    ridge(c, 0, 3, 98, 14);
    var k, hc = [22, 36, 40];
    for (k = 0; k < 6; k++) house(c, 330 + k * 82, 124, 44, 24 + (k % 3) * 6, [20 + k * 5, 38, 38 + (k % 2) * 6], 1);
    var mx = 960, mc = [30, 24, 34];
    tower(c, mx, 124, 26, 60, mc, 0);
    var bl = '<g stroke="' + hs(c, mc, -10) + '" stroke-width="' + (c.lvl === 1 ? 5 : 4) + '" stroke-linecap="' + (c.lvl === 1 ? 'butt' : 'round') + '"><line x1="' + mx + '" y1="68" x2="' + (mx - 34) + '" y2="34"/><line x1="' + mx + '" y1="68" x2="' + (mx + 34) + '" y2="102"/><line x1="' + mx + '" y1="68" x2="' + (mx + 34) + '" y2="34"/><line x1="' + mx + '" y1="68" x2="' + (mx - 34) + '" y2="102"/></g>';
    add(c, '<g class="spin">' + bl + '</g>');
    ridge(c, 2, 3, 136, 7); fog(c, 86, 40, .35);
  },
  graves: function (c) {
    sky(c); orb(c, 930, 36, 17); clouds(c);
    ridge(c, 0, 3, 100, 10);
    var col = lcol(c, 1, 3, 0), r = c.rs[2];
    deadTree(c, 220, 120, 70, lcol(c, 2, 3, 0));
    ridge(c, 1, 3, 118, 6);
    for (var k = 0; k < 16; k++) tomb(c, (k + .4 + r() * .3) * 74, 130 + (k % 3) * 2, 18 + r() * 8, 22 + r() * 16, [270, 14, 36 + (k % 3) * 6]);
    fog(c, 92, 48, .6);
  },
  mountain: function (c) {
    sky(c); clouds(c);
    peaks(c, 0, 4, 112, 4, 70, 100, 1, 0); peaks(c, 1, 4, 118, 5, 46, 70, 1, 1);
    ridge(c, 2, 4, 122, 8); pines(c, 3, 4, 142, 12, 22, 34, 3); fog(c, 76, 40, .4);
  },
  crater: function (c) {
    sky(c);
    peaks(c, 0, 3, 114, 3, 80, 110, 0, 0); ridge(c, 1, 3, 124, 8);
    var o = c.M.glow;
    if (c.lvl === 3) add(c, '<ellipse cx="640" cy="120" rx="340" ry="52" fill="' + rad(c, [[0, hs(c, o, 0, .65)], [1, hs(c, o, 0, 0)]]) + '"/>');
    pool(c, 124, o, 120); parts(c, 24, [34, 100, 62], 20, 120);
    for (var k = 0; k < 6; k++) flame(c, 120 + k * 190, 140, 24);
  },
  cave: function (c) {
    sky(c); stalac(c, 9, 26, 62, 3, true);
    ridge(c, 1, 3, 122, 7);
    var g = c.M.glow; pool(c, 124, g, 150);
    if (c.A.m === 'fire' || c.A.m === 'murk') for (var k = 0; k < 5; k++) flame(c, 100 + k * 240, 140, 16);
    else stalac(c, 8, 18, 40, 4, false);
    parts(c, 24, g, 20, 120); fog(c, 90, 40, .3);
  },
  water: function (c) {
    sky(c); orb(c, 980, 34, 16); clouds(c);
    ridge(c, 0, 3, 80, 14); pines(c, 1, 3, 94, 18, 18, 30, 1);
    waves(c, 98, 40, 2, 3);
    ridge(c, 1, 3, 138, 14, 4); fog(c, 82, 30, .4);
  },
  lake: function (c) {
    sky(c); orb(c, 300, 36, 18); clouds(c);
    ridge(c, 0, 3, 84, 8);
    waves(c, 90, 50, 2, 3);
    add(c, c.lvl === 3 ? '<path d="M760,100 Q800,70 850,100 Z" fill="' + hs(c, lcol(c, 1, 3), -4) + '"/>' : '<polygon points="' + pts([[740, 100], [790, 76], [850, 100]]) + '" fill="' + hs(c, lcol(c, 1, 3)) + '"/>');
    fog(c, 80, 24, .35);
  },
  fountain: function (c) {
    sky(c); clouds(c);
    peaks(c, 0, 3, 100, 6, 34, 60, 1, 0);
    waves(c, 98, 40, 2, 3); crystals(c, 5, 4); fog(c, 80, 34, .5);
  },
  valley: function (c) {
    sky(c); orb(c, 600, 52, 22);
    var wl = lcol(c, 0, 3), wr = lcol(c, 1, 3), W = c.W, H = c.H, N = [5, 10, 22][c.lvl - 1], L = [], R = [], k, f = prof(c, 2);
    for (k = 0; k <= N; k++) { L.push([k * 330 / N, 28 + 66 * (k / N) * (k / N) + (f(k * 40) - .5) * 14]); R.push([W - k * 330 / N, 20 + 70 * (k / N) * (k / N) + (f(k * 55) - .5) * 14]); }
    var LP = [[0, 0]].concat(L).concat([[330, H], [0, H]]), RP = [[W, 0]].concat(R).concat([[W - 330, H], [W, H]]);
    add(c, '<polygon points="' + pts(LP) + '" fill="' + fv(c, wl, 6, -8) + '"/><polygon points="' + pts(RP) + '" fill="' + fv(c, wr, 6, -8) + '"/>');
    waves(c, 120, 20, 2, 3);
    var s = '<rect x="330" y="86" width="540" height="6" fill="' + hs(c, [24, 30, 22]) + '"/>'; for (k = 0; k < 14; k++) s += '<rect x="' + (338 + k * 38) + '" y="76" width="4" height="12" fill="' + hs(c, [24, 30, 22]) + '"/>';
    add(c, s); fog(c, 70, 40, .4);
  },
  desert: function (c) {
    sky(c); orb(c, 880, 40, 24); clouds(c);
    ridge(c, 0, 3, 96, 10, 0);
    var r = c.rs[2], s = '', col = lcol(c, 1, 3, 0);
    for (var k = 0; k < 4; k++) { var x = 120 + k * 300 + r() * 80, h = 40 + r() * 30; s += '<polygon points="' + pts([[x - 14, 112], [x - 6, 112 - h], [x + 6, 112 - h], [x + 14, 112]]) + '" fill="' + hs(c, col, -10) + '"/>'; }
    add(c, s);
    ridge(c, 1, 3, 116, 10, 3); ridge(c, 2, 3, 132, 8, 5); fog(c, 90, 40, .3);
  },
  deku: function (c) {
    sky(c);
    var col = lcol(c, 2, 3, 0), s = '', k;
    trunks(c, 0, 3, 7, 14, 1);
    trunk(c, 600, 148, 70, 170, lcol(c, 2, 3, 10));
    for (k = 0; k < 7; k++) { var cx = 380 + k * 70, cy = 10 + (k % 2) * 12; s += c.lvl === 1 ? '<polygon points="' + pts([[cx - 50, cy + 26], [cx - 30, cy - 14], [cx + 30, cy - 14], [cx + 50, cy + 26]]) + '" fill="' + hs(c, lcol(c, 1, 3, 8), k % 2 ? 4 : -4) + '"/>' : '<ellipse cx="' + cx + '" cy="' + cy + '" rx="58" ry="30" fill="' + (c.lvl === 3 ? rad(c, [[0, hs(c, lcol(c, 1, 3, 8), 12)], [1, hs(c, lcol(c, 1, 3, 8), -6)]]) : hs(c, lcol(c, 1, 3, 8), k % 2 ? 4 : -4)) + '"/>'; }
    add(c, s);
    if (c.lvl === 3) add(c, '<polygon points="520,0 640,0 780,140 380,140" fill="' + lin(c, [[0, 'hsla(70,90%,80%,.35)'], [1, 'hsla(70,90%,80%,0)']]) + '"/>');
    ground(c, 2, 3, 126); parts(c, 20, [70, 90, 70], 40, 120);
  },
  dodongo: null, goron: null,
  jabu: function (c) {
    sky(c); blobs(c, 9, 5, [332, 40, 40]);
    ground(c, 1, 2, 120); fog(c, 70, 50, .4); parts(c, 18, [190, 80, 70], 30, 120);
  },
  columns: function (c) {
    sky(c); orb(c, 600, 40, 20);
    var col = lcol(c, 1, 3, 0), r = c.rs[2], k;
    ridge(c, 0, 3, 112, 8);
    for (k = 0; k < 8; k++) column(c, 90 + k * 148, 126, 22, 78 + (k % 2) * 12, col);
    if (c.A.m === 'cave') waves(c, 122, 20, 2, 3);
    else ground(c, 2, 3, 124);
    fog(c, 76, 44, .4); parts(c, 14, c.M.o, 30, 110);
  },
  flames: function (c) {
    sky(c); peaks(c, 0, 3, 120, 4, 70, 100, 0, 0);
    var k; for (k = 0; k < 9; k++) flame(c, 70 + k * 138 + (k % 2) * 20, 140, 28 + (k % 3) * 10);
    ridge(c, 2, 3, 138, 6); parts(c, 24, [34, 100, 62], 20, 120);
  },
  ice: function (c) {
    sky(c); stalac(c, 8, 22, 50, 3, true); crystals(c, 8, 4); fog(c, 80, 40, .5); parts(c, 24, [190, 100, 92], 20, 120);
  }
};
SC.dodongo = SC.cave; SC.goron = SC.cave;

/* ---------- tab icons: one picture per tab, two ages, three levels of detail ----------
   Child art until the Master Sword is taken, adult art after (the skulltula keeps one picture).
   1 = N64: flat facets with a hard dark outline, no gradients.
   2 = 3DS: smooth shapes with gradients, a thin outline and a gloss highlight.
   3 = Switch 2: layered gradients, soft glow, specular streaks and a little life.
   All of them are original drawings of generic objects. */
var icN = 0;
function icId() { return 'ic' + (icN++) + '_'; }
function icSvg(lvl, defs, body) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" focusable="false"' + (lvl === 1 ? ' shape-rendering="crispEdges"' : '') + '>' + (defs ? '<defs>' + defs + '</defs>' : '') + body + '</svg>';
}
function icLin(id, a, b, c, x1, y1, x2, y2) {
  return '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '"><stop offset="0" stop-color="' + a + '"/>' + (c ? '<stop offset=".55" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/>' : '<stop offset="1" stop-color="' + b + '"/>') + '</linearGradient>';
}
function icRad(id, stops, cx, cy, r) {
  return '<radialGradient id="' + id + '" cx="' + (cx == null ? .5 : cx) + '" cy="' + (cy == null ? .5 : cy) + '" r="' + (r == null ? .5 : r) + '">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>';
}
function star4(x, y, r, cls, fill) {
  return '<path class="' + (cls || '') + '" d="M' + x + ',' + (y - r) + ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y + r) + ' Q' + x + ',' + y + ' ' + (x - r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y - r) + ' Z" fill="' + (fill || '#fff') + '"/>';
}
/* a small toolkit so every drawing is written once and comes out at all three levels */
function kit(lvl) {
  var i = icId(), defs = [], n = 0, K = { lvl: lvl };
  /* s = [light, mid, dark]: flat mid colour on N64, two stops on 3DS, three on Switch 2 */
  K.id = function () { return i + (n++); };
  K.lin = function (s, x1, y1, x2, y2) {
    if (lvl === 1) return s[1];
    var id = i + (n++), st = function (o, c) { return '<stop offset="' + o + '" stop-color="' + c + '"/>'; };
    if (lvl === 2) {
      /* handheld: three flat cel bands instead of a smooth blend */
      defs.push('<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + st(0, s[0]) + st(.32, s[0]) + st(.32, s[1]) + st(.68, s[1]) + st(.68, s[2]) + st(1, s[2]) + '</linearGradient>');
    } else defs.push(icLin(id, s[0], s[1], s[2], x1, y1, x2, y2));
    return 'url(#' + id + ')';
  };
  K.gloss = function () {
    if (!K._gl) { K._gl = i + 'gl'; defs.push('<linearGradient id="' + K._gl + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'); }
    return 'url(#' + K._gl + ')';
  };
  K.rad = function (stops, cx, cy, r) { var id = i + (n++); defs.push(icRad(id, stops, cx, cy, r)); return 'url(#' + id + ')'; };
  K.sk = function (col, w) { return ' stroke="' + col + '" stroke-width="' + (lvl === 1 ? w * 2 : lvl === 2 ? w : w * .85) + '" stroke-linejoin="round" stroke-linecap="round"'; };
  K.def = function (s) { defs.push(s); };
  K.defs = function () { return defs.join(''); };
  K.glow = function (x, y, r, col, a) { return lvl === 3 ? '<circle class="pulse" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + K.rad([[0, col, a == null ? .5 : a], [1, col, 0]]) + '"/>' : ''; };
  K.hi = function (d, w, op) { return lvl === 1 ? '' : '<path d="' + d + '" fill="none" stroke="#fff" stroke-opacity="' + (op == null ? .8 : op) + '" stroke-width="' + (w || 1.6) + '" stroke-linecap="round"/>'; };
  K.tw = function (x, y, r, cls, fill) { return lvl === 3 ? star4(x, y, r, 'twk ' + (cls || ''), fill) : ''; };
  K.shadow = function (cx, cy, rx) { return lvl === 1 ? '' : '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="1.6" fill="#000" opacity="' + (lvl === 2 ? .16 : .2) + '"/>'; };
  /* S = { d: smooth path, p: low-poly points for N64 } */
  K.shp = function (S, fill, ol, w, extra) {
    var a = ' fill="' + fill + '"' + (ol ? K.sk(ol, w || 1) : '') + (extra || ''), o = lvl === 1 && S.p ? '<polygon points="' + S.p + '"' + a + '/>' : '<path d="' + S.d + '"' + a + '/>';
    /* Switch 2: a wet gloss over the top half of every solid shape */
    if (lvl === 3 && S.g !== 0 && fill.indexOf('url(') === 0) o += '<path d="' + S.d + '" fill="' + K.gloss() + '" stroke="none"/>';
    return o;
  };
  /* a flat shaded facet that only the N64 version shows (the others get gradients instead) */
  K.facet = function (p, fill) { return lvl === 1 ? '<polygon points="' + p + '" fill="' + fill + '"/>' : ''; };
  K.dot = function (x, y, r, fill, ol) {
    return lvl === 1 ? '<rect x="' + n1(x - r) + '" y="' + n1(y - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" fill="' + fill + '"/>' : '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' + (ol ? ' stroke="' + ol + '" stroke-width=".6"' : '') + '/>';
  };
  K.svg = function (body) { return icSvg(lvl, K.defs(), lvl === 3 ? '<g class="flt">' + body + '</g>' : body); };
  return K;
}

var ICONS = {};

/* ----- main quest: child = a clay ocarina on a cord, adult = a glazed one with gold trim ----- */
ICONS.main = function (lvl, adult) {
  var K = kit(lvl), b = '';
  var BODY = { d: 'M7,29 C5,19 15,12 27,13 C38,14 44,22 42,31 C40,40 31,44 22,42 C13,40 8,36 7,29 Z', p: '7,29 10,19 18,14 28,13 38,16 43,24 42,32 37,40 28,43 20,42 12,38' };
  var MP = { d: 'M12.5,19 L7.6,11.4 Q7,9 9.4,8 L11.4,7.4 Q13,7.4 14,8.8 L19,14.5 Z', p: '12,19 7,11 10,7 14,8 19,14' };
  var P = adult ?
    { body: ['#a6f4e0', '#22a89f', '#0d4f6c'], mp: ['#a6f4e0', '#1c9a96', '#0d4f6c'], ol: '#06303f', hole: '#052431', rim: '#ffe9a0', lo: '#3fe0cf', hi: '#0b8a8a', lt: '#7cf0e0' } :
    { body: ['#f6bd8c', '#cf7743', '#8d4828'], mp: ['#eeb07a', '#b86a3a', '#7d4020'], ol: '#3a1a0a', hole: '#3b1c0e', rim: '#f6cfa0', lo: '#ffb070', hi: '#a6552a', lt: '#ffd9b0' };
  b += K.glow(24, 28, 26, P.lo, adult ? .5 : .4) + K.shadow(24, 45.6, 15);
  if (!adult && lvl > 1) b += '<path d="M40,18 C45,13 46.4,21 42,26" fill="none" stroke="#6e4120" stroke-width="1.5" stroke-linecap="round"/>';
  b += K.shp(MP, K.lin(P.mp, 0, 0, 1, 1), P.ol, 1);
  if (adult) b += lvl === 1 ? '<polygon points="10,16 15,11 17,13 12,18" fill="#e6b83c"/>' : '<path d="M10.2,15.2 L15.8,10.8" stroke="' + P.rim + '" stroke-width="2.4" stroke-linecap="round"/><path d="M10.2,15.2 L15.8,10.8" stroke="#8a5a10" stroke-opacity=".5" stroke-width=".6"/>';
  b += K.shp(BODY, K.lin(P.body, .1, 0, .9, 1), P.ol, 1);
  b += K.facet('28,13 38,16 43,24 42,32 37,40 28,43 26,30', P.hi) + K.facet('10,19 18,14 28,13 26,22 14,26', P.lt);
  b += lvl === 1 ? '<polygon points="16,18 20,18 20,20 16,20" fill="' + P.hole + '"/>' : '<ellipse cx="17.6" cy="19.2" rx="2.7" ry="1.6" transform="rotate(38 17.6 19.2)" fill="' + P.hole + '"/>';
  [[22, 25, 2.1], [28.5, 23.6, 2.1], [35, 25.2, 2.1], [24.5, 32.5, 1.9], [31.5, 31.4, 1.9]].forEach(function (h) {
    if (lvl > 1) b += '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="' + (h[2] + .7) + '" fill="' + P.rim + '" opacity="' + (adult ? .95 : .55) + '"/>';
    b += K.dot(h[0], h[1], lvl === 1 ? h[2] + .4 : h[2], P.hole);
  });
  if (lvl > 1) b += adult ? star4(28, 17.4, 2.8, '', '#ffe9a0') : '<path d="M14,37.6 L17.5,39.6 L21,37.6 L24.5,39.8 L28,37.6 L31.5,39.4 L35,37.4" fill="none" stroke="#f6dcae" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" opacity=".9"/>';
  if (lvl === 1 && adult) b += '<rect x="27" y="16" width="3" height="3" fill="#ffe9a0"/>';
  b += K.hi('M11,27 C10,21 15,16.4 21,15.6', 2, adult ? .85 : .6);
  if (lvl === 3) b += '<path d="M39,36 C37,39.6 33,41.6 29,42" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.3" stroke-linecap="round"/>';
  b += K.tw(38, 10, adult ? 3 : 2.2, '', '#fff') + (adult ? K.tw(9, 36, 2, 't2', '#e8fffa') : '');
  return K.svg(b);
};

/* ----- skulltulas: a golden spider (same picture in both ages) ----- */
ICONS.skull = function (lvl) {
  var K = kit(lvl), b = '', dk = '#3a2206', legsR = [['31,24 38,16 44,20'], ['32,28 42,25 46,31'], ['32,32 42,33 45,40'], ['30,36 37,41 39,46']];
  function legSet(sw, col, ex) {
    var o = '';
    legsR.forEach(function (L) {
      var p = L[0].split(' ').map(function (v) { return v.split(',').map(Number); });
      o += '<polyline points="' + p.map(function (v) { return v[0] + ',' + v[1]; }).join(' ') + '" />';
      o += '<polyline points="' + p.map(function (v) { return (48 - v[0]) + ',' + v[1]; }).join(' ') + '" />';
    });
    return '<g fill="none" stroke="' + col + '" stroke-width="' + sw + '" stroke-linecap="' + (lvl === 1 ? 'butt' : 'round') + '" stroke-linejoin="' + (lvl === 1 ? 'miter' : 'round') + '"' + (ex || '') + '>' + o + '</g>';
  }
  var GOLD = ['#fff1b0', '#f2b92f', '#a8700f'];
  var AB = { d: 'M24,17 C32,17 35,24 34,31 C33,38 29,42 24,42 C19,42 15,38 14,31 C13,24 16,17 24,17 Z', p: '24,17 31,19 34,26 33,35 29,41 24,43 19,41 15,35 14,26 17,19' };
  var HD = { d: 'M24,10 C27.6,10 29.8,12.4 29.8,15.4 C29.8,18.6 27.4,20.6 24,20.6 C20.6,20.6 18.2,18.6 18.2,15.4 C18.2,12.4 20.4,10 24,10 Z', p: '24,10 28,11 30,15 28,19 24,21 20,19 18,15 20,11' };
  b += K.glow(24, 28, 24, '#ffd45a', .5) + K.shadow(24, 46.4, 12);
  b += legSet(4.2, dk) + legSet(lvl === 1 ? 1.5 : 2.3, lvl === 1 ? '#f2b92f' : K.lin(['#f9cf55', '#d99a22', '#a86c0e'], 0, 0, 1, 1));
  if (lvl > 1) legsR.forEach(function (L) { var p = L[0].split(' ').map(function (v) { return v.split(','); }); b += '<circle cx="' + p[1][0] + '" cy="' + p[1][1] + '" r="1.5" fill="#8a5a0c"/><circle cx="' + (48 - p[1][0]) + '" cy="' + p[1][1] + '" r="1.5" fill="#8a5a0c"/>'; });
  b += K.shp(AB, lvl === 3 ? K.rad([[0, '#fff1b0'], [.35, '#f6c23a'], [.8, '#b97c12'], [1, '#7a4b08']], .36, .28, .85) : K.lin(GOLD, .2, 0, .8, 1), dk, 1);
  b += K.facet('24,17 31,19 34,26 33,35 29,41 24,43', '#d49b1c');
  /* three nested chevrons on the back, and a small gem near the top */
  b += lvl === 1 ?
    '<polygon points="17,26 24,32 31,26 31,28 24,34 17,28" fill="' + dk + '"/><polygon points="18,32 24,38 30,32 30,34 24,40 18,34" fill="' + dk + '"/>' :
    '<path d="M17.4,26 L24,32 L30.6,26 M18.6,32 L24,37.6 L29.4,32" fill="none" stroke="' + dk + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
  b += lvl === 1 ? '<rect x="22" y="21" width="4" height="4" fill="#ff8a3a" stroke="' + dk + '" stroke-width="1"/>' : '<circle cx="24" cy="22.6" r="2" fill="' + K.rad([[0, '#fff'], [.5, '#ffb04a'], [1, '#d4601a']], .4, .35, .7) + '" stroke="' + dk + '" stroke-width=".7"/>';
  b += K.shp(HD, lvl === 3 ? K.rad([[0, '#fff1b0'], [.5, '#eeb42c'], [1, '#9a6410']], .4, .3, .8) : K.lin(GOLD, .2, 0, .8, 1), dk, 1);
  b += lvl === 1 ?
    '<rect x="21" y="13" width="2" height="2" fill="' + dk + '"/><rect x="25" y="13" width="2" height="2" fill="' + dk + '"/><rect x="22" y="16" width="1" height="1" fill="' + dk + '"/><rect x="25" y="16" width="1" height="1" fill="' + dk + '"/>' :
    '<circle cx="22" cy="14" r="1.1" fill="' + dk + '"/><circle cx="26" cy="14" r="1.1" fill="' + dk + '"/><circle cx="22.8" cy="16.4" r=".8" fill="' + dk + '"/><circle cx="25.2" cy="16.4" r=".8" fill="' + dk + '"/>' +
    (lvl === 3 ? '<circle cx="21.6" cy="13.6" r=".4" fill="#fff"/><circle cx="25.6" cy="13.6" r=".4" fill="#fff"/>' : '');
  b += lvl === 1 ? '<polygon points="22,20 24,23 26,20" fill="' + dk + '"/>' : '<path d="M22.4,19.8 L22.1,22.2 L23.7,20.4 Z M25.6,19.8 L25.9,22.2 L24.3,20.4 Z" fill="' + dk + '"/>';
  b += K.hi('M17.4,24 C16.4,29 17.4,34 19.6,37', 2, .55);
  b += K.tw(38, 9, 3, '', '#fff6c8') + K.tw(8, 38, 2.2, 't2', '#fff6c8');
  return K.svg(b);
};

/* ----- hearts: child = one loose quarter of a heart, adult = a whole plump heart.
   (original drawings of generic hearts; the game's own models can't be copied) ----- */
var HEART = { d: 'M24,43 C11,33 3.5,25.5 3.5,16.5 C3.5,9.8 8.6,5 14.8,5 C19,5 22.2,7.4 24,11 C25.8,7.4 29,5 33.2,5 C39.4,5 44.5,9.8 44.5,16.5 C44.5,25.5 37,33 24,43 Z', p: '24,44 12,34 4,25 3,16 8,8 15,5 21,7 24,11 27,7 33,5 40,8 45,16 44,25 36,34' };
/* the top-left quarter, cut on a vertical and a horizontal line through the heart's middle */
var QUAD = { d: 'M24,25 L24,11 C22.2,7.4 19,5 14.8,5 C8.6,5 3.5,9.8 3.5,16.5 C3.5,19.8 4.6,22.6 6.4,25 Z', p: '24,25 24,11 21,7 15,5 8,8 3,16 4,21 6,25' };
ICONS.heart = function (lvl, adult) {
  var K = kit(lvl), b = '', dk = '#4a0a16';
  var RED = lvl === 3 ? ['#ff9cab', '#ec3a52', '#98142a'] : ['#ff8d9d', '#e0314a', '#9a1630'];
  if (!adult) {
    /* a heart in four quarters: three are faint, empty slots, the top-left one is the bright piece you hold */
    var QS = [[0, 0, 24, 25], [24, 0, 24, 25], [0, 25, 24, 23], [24, 25, 24, 23]], cp = [], q;
    QS.forEach(function (r) { var id = K.id(); K.def('<clipPath id="' + id + '"><rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '"/></clipPath>'); cp.push(id); });
    var sh = [[-2.6, -2.6], [1.2, -1], [-1, 1.2], [1.2, 1.2]];
    b += K.glow(16, 16, 20, '#ff6b7e', .6) + K.shadow(24, 46, 14);
    for (q = 3; q >= 1; q--) {
      b += '<g transform="translate(' + sh[q][0] + ' ' + sh[q][1] + ')" clip-path="url(#' + cp[q] + ')"><path d="' + HEART.d + '" fill="' + (lvl === 1 ? '#efdde0' : 'rgba(255,255,255,.6)') + '" stroke="#b96a7a" stroke-width="' + (lvl === 1 ? 2.4 : 1.6) + '" stroke-linejoin="round"/></g>';
    }
    b += '<g transform="translate(' + sh[0][0] + ' ' + sh[0][1] + ')" clip-path="url(#' + cp[0] + ')">';
    b += K.shp(HEART, K.lin(RED, .2, 0, .8, 1), dk, 2);
    b += K.facet('3,16 8,8 15,5 21,7 24,11 24,25 6,25', '#ff6f84') + K.facet('6,25 24,25 24,16 14,20', '#c42a42');
    if (lvl > 1) b += K.hi('M8.4,17.4 C8,11.6 11.6,8 16.4,8', 2.4, lvl === 3 ? .95 : .85);
    if (lvl === 2) b += '<path d="M6.4,25 L24,25 L24,22 L7.4,22 Z" fill="#7a1022" fill-opacity=".35"/>';
    b += '<path d="M24,10 L24,25 L5.6,25" fill="none" stroke="' + dk + '" stroke-width="' + (lvl === 1 ? 3 : 1.6) + '" stroke-linejoin="round" stroke-linecap="round"/>';
    b += '</g>' + K.tw(40, 8, 3.2, '', '#fff') + K.tw(8, 40, 2.2, 't2', '#ffd9df');
    return K.svg(b);
  }
  /* adult: one whole, plump heart sitting in the middle of the tile */
  b += K.glow(24, 25, 26, '#ff6b7e', .55) + K.shadow(24, 46.4, 14);
  b += K.shp(HEART, K.lin(RED, .2, 0, .8, 1), dk, 1.2);
  b += K.facet('3,16 8,8 15,5 21,7 24,11 24,25 6,25', '#ff6f84') + K.facet('24,11 27,7 33,5 40,8 45,16 44,25 36,34 24,44', '#b81f38');
  if (lvl === 1) b += '<polygon points="8,10 14,8 14,12 10,14" fill="#ffc9d1"/>';
  if (lvl === 2) b += '<path d="M8.4,17 C8,11.4 11.6,8 16.2,8 C14,9.4 12.6,12 12.6,15.6 Z" fill="#fff" fill-opacity=".75"/><path d="M24,43 C37,33 44.5,25.5 44.5,16.5 C44.5,15 44.2,13.6 43.6,12.2 C41,28 33,36 24,43 Z" fill="#7a1022" fill-opacity=".4"/>';
  if (lvl === 3) b += K.hi('M8.4,17.4 C8,11.6 11.6,8 16.4,8', 2.8, .95) + '<path d="M36,12 C39.4,12.6 41.6,15 41.8,18.4" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" stroke-linecap="round"/><path d="M12,28 C16,34 20,37.6 24,40" fill="none" stroke="#ff9cab" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/>';
  b += K.tw(39, 10, 3.2, '', '#fff') + K.tw(9, 36, 2.2, 't2', '#ffe9ee');
  return K.svg(b);
};

/* ----- side quests: child = a carved wooden mask, adult = a white hen ----- */
ICONS.side = function (lvl, adult) {
  var K = kit(lvl), b = '';
  if (!adult) {
    var W = ['#f4d9a2', '#c8924f', '#7d4f24'], ol = '#3a210c', ink = '#2a1608';
    var FACE = { d: 'M24,4.5 C35,4.5 41,12.5 40,23 C39,35 32,43.5 24,43.5 C16,43.5 9,35 8,23 C7,12.5 13,4.5 24,4.5 Z', p: '24,4 34,6 40,14 40,26 35,38 28,44 20,44 13,38 8,26 8,14 14,6' };
    b += K.glow(24, 24, 24, '#ffc070', .35) + K.shadow(24, 46, 13);
    b += K.shp(FACE, K.lin(W, .15, 0, .85, 1), ol, 1.1);
    b += K.facet('24,4 34,6 40,14 40,26 35,38 28,44 24,44 24,20', '#a8702f');
    /* forehead notches, brows, almond eyes, nose ridge and mouth */
    b += lvl === 1 ?
      '<polygon points="19,9 21,13 23,9" fill="#8a3a22"/><polygon points="25,9 27,13 29,9" fill="#8a3a22"/><polygon points="12,19 17,16 22,18 17,20" fill="' + ink + '"/><polygon points="36,19 31,16 26,18 31,20" fill="' + ink + '"/><polygon points="22,18 22,32 26,32 26,18" fill="#9a6230"/><rect x="18" y="38" width="12" height="2" fill="' + ink + '"/><rect x="11" y="28" width="5" height="2" fill="#c0482f"/><rect x="32" y="28" width="5" height="2" fill="#c0482f"/>' :
      '<path d="M20.4,9 L22,13 L23.6,9 Z M24.4,9 L26,13 L27.6,9 Z" fill="#8a3a22"/><path d="M12,15.6 Q17,12.4 22,15.6 M36,15.6 Q31,12.4 26,15.6" fill="none" stroke="' + ol + '" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M13.5,21 Q17.2,17.6 21.4,21.4 Q17.4,24.2 13.5,21 Z M34.5,21 Q30.8,17.6 26.6,21.4 Q30.6,24.2 34.5,21 Z" fill="' + ink + '"/>' +
      '<path d="M24,18 L21.4,32 Q24,34.8 26.6,32 Z" fill="' + K.lin(['#e2b072', '#b27c3f', '#7d4f24'], 0, 0, 1, 0) + '" stroke="' + ol + '" stroke-width=".8" stroke-linejoin="round"/>' +
      '<path d="M18.6,38 Q24,41 29.4,38" fill="none" stroke="' + ol + '" stroke-width="1.5" stroke-linecap="round"/><path d="M11.6,28.4 L16.6,30.6 M36.4,28.4 L31.4,30.6" stroke="#c0482f" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="9.6" cy="22" r="1" fill="' + ink + '"/><circle cx="38.4" cy="22" r="1" fill="' + ink + '"/>';
    if (lvl === 3) b += '<path d="M15,9 Q13.6,24 17,40 M33,9 Q34.4,24 31,40 M20,6 Q18.6,12 19.4,16" fill="none" stroke="#7d4f24" stroke-opacity=".28" stroke-width=".8"/>';
    b += K.hi('M11,20 C10.6,14 14,8.6 19,6.8', 2, .7) + K.tw(38, 8, 2.6, '', '#fff6d8');
    return K.svg(b);
  }
  var WH = ['#8db4f8', '#4b80e8', '#2a4a96'], ol2 = '#16224f', red = ['#ff9a8a', '#e23a30', '#9a1a18'], yel = ['#ffe58a', '#f2b33a', '#b8741a'];
  var BODY = { d: 'M10,30 C10,22 18,18 26,19 C35,20 40,26 38,33 C36,40 28,42 21,41 C14,40 10,36 10,30 Z', p: '10,30 13,23 20,19 28,19 36,23 39,30 36,38 28,42 20,41 13,37' };
  var WING = { d: 'M17,28 C22,24 30,25 33,31 C29,35 21,35 17,28 Z', p: '17,28 22,25 30,25 33,31 28,35 21,34' };
  b += K.glow(24, 28, 24, '#7fa8ff', .45) + K.shadow(24, 46.4, 14);
  /* legs, then tail feathers, then body */
  b += '<g fill="none" stroke="' + ol2 + '" stroke-width="' + (lvl === 1 ? 4 : 3.4) + '" stroke-linecap="round" stroke-linejoin="round"><path d="M21,40 L20.4,45 M28,40 L28.8,45 M17.4,46 L20.4,45 L23,46.2 M26,46.2 L28.8,45 L31.6,46"/></g><g fill="none" stroke="#f2b33a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21,40 L20.4,45 M28,40 L28.8,45 M17.4,46 L20.4,45 L23,46.2 M26,46.2 L28.8,45 L31.6,46"/></g>';
  b += K.shp({ d: 'M34,31 C35,22 39,16 44,13 C45,18 45,22 43.4,25 C46,24 47.2,24 47.6,24 C46.6,30 42,35 36,36 Z', p: '34,31 36,22 40,16 44,13 45,19 44,24 47,24 45,31 40,35 36,36' }, K.lin(WH, 0, 0, 1, 1), ol2, 1);
  b += K.shp(BODY, K.lin(WH, .2, 0, .8, 1), ol2, 1);
  b += K.facet('28,19 36,23 39,30 36,38 28,42 24,30', '#3a62b8');
  b += K.shp(WING, K.lin(['#6f9cf2', '#3a6fd6', '#1f3a82'], 0, 0, 1, 1), ol2, .8);
  if (lvl > 1) b += '<path d="M20,30.4 Q25,28.6 30,30.2 M21.6,33 Q25.6,31.6 29,32.6" fill="none" stroke="#15296a" stroke-opacity=".55" stroke-width=".8" stroke-linecap="round"/>';
  /* comb behind the head, head, beak, wattle, eye */
  b += lvl === 1 ?
    '<polygon points="9,13 10,9 12,12 14,8 16,12 18,9 18,14" fill="#e23a30" stroke="' + ol2 + '" stroke-width="1.6"/>' :
    '<g fill="' + K.lin(red, 0, 0, 0, 1) + '" stroke="' + ol2 + '" stroke-width=".9"><circle cx="10.4" cy="12.8" r="2.3"/><circle cx="13.4" cy="11.4" r="2.6"/><circle cx="16.4" cy="12.8" r="2.2"/></g>';
  b += K.shp({ d: 'M13,13.4 C16.6,13.4 19,16 19,19.2 C19,22.6 16.4,25 13,25 C9.6,25 7.4,22.4 7.4,19.2 C7.4,16 9.6,13.4 13,13.4 Z', p: '13,13 17,14 19,19 17,24 13,25 9,24 7,19 9,14' }, K.lin(WH, 0, 0, 1, 1), ol2, 1);
  b += lvl === 1 ? '<polygon points="8,17 3,19 8,22" fill="#f2b33a" stroke="' + ol2 + '" stroke-width="1.4"/><rect x="8" y="24" width="3" height="3" fill="#e23a30"/><rect x="11" y="17" width="2" height="2" fill="' + ol2 + '"/>' :
    '<path d="M8.2,17.4 L3.2,19.6 L8.2,22 Z" fill="' + K.lin(yel, 0, 0, 0, 1) + '" stroke="' + ol2 + '" stroke-width=".9" stroke-linejoin="round"/><ellipse cx="9.2" cy="24.4" rx="1.5" ry="2.2" fill="#e23a30" stroke="' + ol2 + '" stroke-width=".7"/><circle cx="11.8" cy="17.8" r="1.15" fill="' + ol2 + '"/>' + (lvl === 3 ? '<circle cx="11.4" cy="17.4" r=".4" fill="#fff"/>' : '');
  b += K.hi('M20,24 C23,21 28,20.6 32,22.6', 1.8, .9) + K.tw(40, 9, 2.6, '', '#fff') + K.tw(6, 34, 1.8, 't2', '#e8f0ff');
  return K.svg(b);
};

/* ----- items: child = a wooden slingshot, adult = a bow with an arrow ----- */
ICONS.items = function (lvl, adult) {
  var K = kit(lvl), b = '', ol = '#3a210c', WOOD = ['#e2ac6a', '#a8672f', '#5e3414'], LEA = ['#f08a70', '#b3432e', '#6e2416'];
  if (!adult) {
    var FORK = { d: 'M21,45 L27,45 L27.6,30 C28,26 31,22 36,11 C37,8 34,6 32.4,8.6 C29,14 26,20 24,24 C22,20 19,14 15.6,8.6 C14,6 11,8 12,11 C17,22 20,26 20.4,30 Z', p: '21,45 27,45 27,30 31,22 36,11 33,8 29,14 24,23 19,14 15,8 12,11 17,22 21,30' };
    b += K.glow(24, 26, 24, '#ffc070', .35) + K.shadow(24, 46.4, 9);
    b += K.shp(FORK, K.lin(WOOD, 0, 0, 1, 0), ol, 1.1) + K.facet('27,45 27,30 31,22 36,11 33,8 29,14 24,23 24,30 24,45', '#6a3d17');
    /* the band, the leather pad and a pebble */
    b += lvl === 1 ? '<polyline points="12,10 24,26 36,10" fill="none" stroke="' + ol + '" stroke-width="4.6"/><polyline points="12,10 24,26 36,10" fill="none" stroke="#e8d49a" stroke-width="2"/>' :
      '<path d="M12.6,9.6 Q24,31 35.4,9.6" fill="none" stroke="' + ol + '" stroke-width="3.4" stroke-linecap="round"/><path d="M12.6,9.6 Q24,31 35.4,9.6" fill="none" stroke="#e8d49a" stroke-width="1.7" stroke-linecap="round"/>';
    b += K.shp({ d: 'M19.6,25.6 C19.6,23.6 21.6,22.4 24,22.4 C26.4,22.4 28.4,23.6 28.4,25.6 C28.4,27.6 26.4,28.8 24,28.8 C21.6,28.8 19.6,27.6 19.6,25.6 Z', p: '19,25 21,23 27,23 29,25 27,28 21,28' }, K.lin(LEA, 0, 0, 0, 1), ol, .9);
    b += lvl === 1 ? '<rect x="22" y="19" width="4" height="4" fill="#c9ccd4" stroke="' + ol + '" stroke-width="1.2"/>' : '<circle cx="24" cy="21.2" r="2.9" fill="' + K.rad([[0, '#fff'], [.5, '#c4c9d4'], [1, '#6c7488']], .35, .3, .75) + '" stroke="' + ol + '" stroke-width=".8"/>';
    b += lvl === 1 ? '<rect x="20" y="33" width="8" height="6" fill="#b3432e" stroke="' + ol + '" stroke-width="1.6"/>' : '<rect x="20.2" y="33" width="7.6" height="6" rx="1.4" fill="' + K.lin(LEA, 0, 0, 0, 1) + '" stroke="' + ol + '" stroke-width="1"/><path d="M20.6,35 H27.4 M20.6,37 H27.4" stroke="#4a1208" stroke-opacity=".4" stroke-width=".7"/>';
    b += K.hi('M13.2,11 C16,17 19.4,22 21.4,27', 1.2, .65) + K.tw(38, 20, 2.6, '', '#fff') + K.tw(9, 30, 1.8, 't2', '#fff2d0');
    return K.svg(b);
  }
  /* adult: the bow and arrow are drawn upright and the whole picture is tilted */
  var LIMB = 'M33,5 C13,10 9,38 33,43';
  b += K.glow(24, 24, 24, '#ffc070', .35) + K.shadow(24, 46.4, 11);
  b += '<g transform="rotate(-38 24 24)">';
  if (lvl === 1) {
    b += '<polygon points="33,4 24,6 16,12 12,20 11,28 14,36 22,42 33,44 33,41 25,38 19,33 17,28 17,22 20,16 26,10 33,7" fill="#a8672f" stroke="' + ol + '" stroke-width="2.2"/><polygon points="33,4 24,6 16,12 12,20 11,28 14,36 22,42 33,44 33,41 25,38 19,33 17,28 17,22 20,16 26,10 33,7" fill="#a8672f"/><polygon points="12,20 11,28 14,36 17,34 17,28 17,22" fill="#6a3d17"/>' +
      '<line x1="33" y1="5" x2="33" y2="43" stroke="#6b5a45" stroke-width="1.2"/><rect x="9" y="20" width="6" height="9" fill="#b3432e" stroke="' + ol + '" stroke-width="1.6"/>' +
      '<rect x="6" y="22.4" width="28" height="3" fill="#d9b57a" stroke="' + ol + '" stroke-width="1.6"/><polygon points="1,24 8,19 8,29" fill="#d4dae6" stroke="' + ol + '" stroke-width="1.6"/><polygon points="34,24 38,19 40,19 37,24 40,29 38,29" fill="#e23a30" stroke="' + ol + '" stroke-width="1.2"/>';
  } else {
    b += '<path d="' + LIMB + '" fill="none" stroke="' + ol + '" stroke-width="6.6" stroke-linecap="round"/><path d="' + LIMB + '" fill="none" stroke="' + K.lin(WOOD, 0, 0, 1, 0) + '" stroke-width="4.4" stroke-linecap="round"/>' +
      '<path d="M31.4,7 C16,11.6 12.6,35 31.4,41" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1" stroke-linecap="round"/>' +
      '<path d="M33,5 L33,43" stroke="#6b5a45" stroke-width="1.1"/>' +
      '<path d="M13.6,19 L13.6,29" stroke="' + ol + '" stroke-width="6.4" stroke-linecap="round"/><path d="M13.6,19 L13.6,29" stroke="' + K.lin(LEA, 0, 0, 1, 0) + '" stroke-width="4.4" stroke-linecap="round"/><path d="M11.8,21.4 H15.4 M11.8,24 H15.4 M11.8,26.6 H15.4" stroke="#4a1208" stroke-opacity=".4" stroke-width=".7"/>' +
      '<path d="M37,24 L9,24" stroke="' + ol + '" stroke-width="3.4" stroke-linecap="round"/><path d="M37,24 L9,24" stroke="#e2c088" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M1.6,24 L9.4,20 L9.4,28 Z" fill="' + K.lin(['#ffffff', '#cfd6e4', '#7d88a0'], 0, 0, 0, 1) + '" stroke="' + ol + '" stroke-width="1" stroke-linejoin="round"/>' +
      '<path d="M38.6,24 L34.4,19.4 L32,19.4 L35,24 L32,28.6 L34.4,28.6 Z" fill="' + K.lin(['#ff9a8a', '#e23a30', '#9a1a18'], 0, 0, 0, 1) + '" stroke="' + ol + '" stroke-width=".8" stroke-linejoin="round"/>';
  }
  b += '</g>' + K.tw(40, 36, 2.6, '', '#fff') + K.tw(8, 9, 2, 't2', '#fff2d0');
  return K.svg(b);
};

/* ---------- public API ---------- */
var cache = {}, seq = 0;
function svgFor(key, ver) {
  var ck = key + '|' + ver;
  if (cache[ck]) return cache[ck];
  var c = Ctx(key, ver);
  (SC[c.A.k] || SC.field)(c);
  life(c);
  var root = c.lvl === 1 ? ' shape-rendering="crispEdges"' : '';
  var body = c.o.join(''), extra = '', defs = c.defs.join('');
  if (c.lvl === 1) {
    /* low resolution: the whole picture is sampled into chunky blocks, like a 320x240 screen stretched up */
    defs += '<filter id="§px" x="0" y="0" width="100%" height="100%"><feFlood x="6" y="6" height="2" width="2"/><feComposite width="12" height="12"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="6"/></filter>';
    body = '<g filter="url(#§px)">' + body + '</g>';
  }
  if (c.lvl === 2) {
    /* handheld: clean and bright with a glossy sheen on top and a soft layered edge below */
    defs += '<linearGradient id="§gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="§sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2a4a" stop-opacity="0"/><stop offset="1" stop-color="#0a2a4a" stop-opacity=".3"/></linearGradient>';
    extra = '<rect y="104" width="1200" height="36" fill="url(#§sh)"/>';
  }
  if (c.lvl === 3) {
    /* console: soft light shafts, bloom and a vignette, with far layers blurred */
    defs += '<filter id="§dof" x="-2%" y="-10%" width="104%" height="120%"><feGaussianBlur stdDeviation="1.8"/></filter>' +
      '<radialGradient id="§vg" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></radialGradient>' +
      '<linearGradient id="§sf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="§bl" cx=".16" cy="0" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
    if (c.M.orb) extra += '<g class="drift d2"><polygon points="150,0 230,0 470,140 330,140" fill="url(#§sf)"/><polygon points="300,0 340,0 640,140 560,140" fill="url(#§sf)" opacity=".7"/><polygon points="520,0 560,0 900,140 800,140" fill="url(#§sf)" opacity=".5"/></g>';
    extra += '<rect width="1200" height="140" fill="url(#§bl)"/><rect width="1200" height="140" fill="url(#§vg)"/>';
  }
  var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 140" preserveAspectRatio="xMidYMid slice" focusable="false"' + root + '><defs>' + defs + '</defs>' + body + extra + '</svg>';
  cache[ck] = out;
  return out;
}

/* ---------- system bar: clock, signal and battery, drawn in each console's own style ---------- */
function pad2(n) { return n < 10 ? '0' + n : '' + n; }
function clock() { var d = new Date(), h = d.getHours(), ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + pad2(d.getMinutes()) + ' ' + ap; }
function wifi(ver) {
  var bars = ver === '3ds' ? [[1, 9, 3, 3], [5, 6, 3, 6], [9, 3, 3, 9], [13, 0, 3, 12]] : [[0, 7, 3, 5], [5, 4, 3, 8], [10, 1, 3, 11]];
  return '<svg class="sb-wifi" viewBox="0 0 16 12" width="16" height="12" focusable="false">' + bars.map(function (b) { return '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="' + (ver === '3ds' ? 0 : 1.4) + '" fill="currentColor"/>'; }).join('') + '</svg>';
}
function battery(ver, pct) {
  var w = Math.max(1.5, 16 * pct);
  return '<svg class="sb-bat" viewBox="0 0 24 12" width="24" height="12" focusable="false"><rect x=".6" y=".6" width="19.8" height="10.8" rx="' + (ver === '3ds' ? 2 : 3.6) + '" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="2.4" y="2.4" width="' + n1(w) + '" height="7.2" rx="' + (ver === '3ds' ? 1 : 2) + '" fill="currentColor"/><rect x="21.4" y="3.8" width="2" height="4.4" rx="1" fill="currentColor"/></svg>';
}
function status(ver) {
  /* no clock, signal or battery: the 3DS gets no bar at all, the Switch 2 keeps just its title */
  if (ver !== 'sw2') return '';
  return '<span class="sb-l"><span class="sb-title">Ocarina of Time tracker</span></span>';
}

window.OOTTheme = {
  years: YEARS,
  areas: AREAS,
  keyFor: keyFor,
  attrs: function (name) {
    var k = keyFor(name), A = AREAS[k];
    return 'data-area="' + k + '" style="--h:' + A.h + ';--s:' + A.s + '"';
  },
  banner: function (name, ver) {
    var svg = svgFor(keyFor(name), ver).replace(/§/g, 'u' + (seq++) + '_');
    return '<span class="banner" aria-hidden="true">' + svg + '</span>';
  },
  icon: function (k, ver, adult) { var f = ICONS[k]; return f ? f(LV[ver] || 3, !!adult).replace(/§/g, '') : ''; },
  status: status,
  svgFor: svgFor,
  bannerURL: function (name, ver) { return bannerURL(name, ver); }
};
})();
