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
  e1:       { h: 140, s: 44, k: 'field',    m: 'dawn' },
  e2:       { h: 14,  s: 42, k: 'mountain', m: 'day' },
  e3:       { h: 262, s: 30, k: 'town',     m: 'dusk' },
  e4:       { h: 34,  s: 54, k: 'ranch',    m: 'dusk' },
  e5:       { h: 285, s: 30, k: 'castle',   m: 'storm' }
};
var KEYS = [
  [/^child: early/i, 'e1'], [/^child: after/i, 'e2'], [/^adult: right after/i, 'e3'], [/^adult: after/i, 'e4'], [/^adult: late/i, 'e5'],
  [/deku tree/i, 'deku'], [/dodongo/i, 'dodongo'], [/jabu/i, 'jabu'], [/forest temple/i, 'ftemple'], [/fire temple/i, 'fire'],
  [/water temple/i, 'wtemple'], [/shadow temple/i, 'shadow'], [/spirit temple/i, 'spirit'], [/bottom of the well/i, 'well'], [/ice cavern/i, 'ice'],
  [/lost woods/i, 'woods'], [/kokiri/i, 'forest'], [/hyrule field/i, 'field'], [/lon lon/i, 'ranch'], [/castle town|market/i, 'town'],
  [/graveyard/i, 'graves'], [/kakariko/i, 'village'], [/crater/i, 'crater'], [/death mountain/i, 'mountain'], [/goron/i, 'goron'],
  [/zora.s river/i, 'river'], [/zora.s domain/i, 'domain'], [/zora.s fountain/i, 'fountain'], [/lake hylia/i, 'lake'],
  [/gerudo valley/i, 'valley'], [/gerudo|desert|wasteland/i, 'desert']
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
  var l = a[2] + (dl || 0);
  if (c.lvl === 1) l = Math.round(l / 8) * 8;
  l = clamp(Math.round(l), 3, 96);
  return al == null ? 'hsl(' + Math.round(a[0]) + ',' + Math.round(a[1]) + '%,' + l + '%)' : 'hsla(' + Math.round(a[0]) + ',' + Math.round(a[1]) + '%,' + l + '%,' + al + ')';
}
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
  if (c.lvl === 1) return hs(c, col);
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
    var r = c.rs[9], N = [8, 22, 44][c.lvl - 1];
    for (var i = 0; i < N; i++) {
      var x = r() * W, y = r() * H * .6, s = r();
      if (c.lvl === 1) add(c, '<rect x="' + Math.round(x) + '" y="' + Math.round(y) + '" width="3" height="3" fill="#fff" opacity=".85"/>');
      else add(c, '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(.6 + s * (c.lvl === 3 ? 1.5 : 1)) + '" fill="#fff" opacity="' + n1(.35 + s * .55) + '"/>');
    }
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
    add(c, '<circle cx="' + x + '" cy="' + y + '" r="' + r * 5 + '" fill="' + rad(c, [[0, hs(c, o, 0, .55)], [.35, hs(c, o, 0, .16)], [1, hs(c, o, 0, 0)]]) + '"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + rad(c, [[0, '#fff'], [.6, hs(c, o, 6)], [1, hs(c, o, -4)]]) + '"/>');
  }
}
function clouds(c) {
  if (c.M.stars || c.M.L < -20) return;
  var r = c.rs[8], W = c.W, tone = c.M.fog;
  for (var i = 0; i < 4; i++) {
    var x = r() * W, y = 14 + r() * 36, w = 70 + r() * 70, h = 12 + r() * 8;
    if (c.lvl === 1) add(c, '<polygon points="' + pts([[x - w, y + h], [x - w * .6, y], [x - w * .1, y - h * .3], [x + w * .4, y], [x + w, y + h]]) + '" fill="' + mix(tone, [0, 0, 100], .5) + '" opacity=".85"/>');
    else if (c.lvl === 2) add(c, '<g fill="#fff" opacity=".8"><ellipse cx="' + n1(x) + '" cy="' + n1(y + h * .6) + '" rx="' + n1(w) + '" ry="' + n1(h * .55) + '"/><ellipse cx="' + n1(x - w * .3) + '" cy="' + n1(y + h * .3) + '" rx="' + n1(w * .45) + '" ry="' + n1(h * .55) + '"/><ellipse cx="' + n1(x + w * .25) + '" cy="' + n1(y + h * .2) + '" rx="' + n1(w * .4) + '" ry="' + n1(h * .6) + '"/></g>');
    else add(c, '<g class="drift d' + (i % 3) + '"><ellipse cx="' + n1(x) + '" cy="' + n1(y + h * .6) + '" rx="' + n1(w * 1.2) + '" ry="' + n1(h * .8) + '" fill="' + rad(c, [[0, '#fff', .75], [1, '#fff', 0]]) + '"/></g>');
  }
}
function ridge(c, i, n, base, amp, pf) {
  var f = prof(c, pf == null ? i : pf), N = [6, 14, 30][c.lvl - 1], W = c.W, H = c.H, P = [], k;
  for (k = 0; k <= N; k++) { var x = k * W / N; P.push([x, base - amp * (f(x) - .5) * 2]); }
  var col = lcol(c, i, n);
  if (c.lvl === 3) { add(c, '<path d="' + smooth(P, H) + '" fill="' + fv(c, col, 10, -6) + '"/>'); return; }
  add(c, '<polygon points="' + pts(P) + ' ' + W + ',' + H + ' 0,' + H + '" fill="' + hs(c, col) + '"/>');
  for (k = 1; k < P.length - 1; k++) {
    if (P[k][1] < P[k - 1][1] && P[k][1] <= P[k + 1][1]) {
      add(c, '<polygon points="' + pts([P[k], P[k - 1], [P[k - 1][0], H], [P[k][0], H]]) + '" fill="' + hs(c, col, c.lvl === 1 ? 8 : 5) + '"/>');
    }
  }
}
function ground(c, i, n, y) {
  var col = lcol(c, i, n);
  add(c, '<rect x="0" y="' + y + '" width="' + c.W + '" height="' + (c.H - y + 1) + '" fill="' + fv(c, col, 4, -8) + '"/>');
}
function fog(c, y, h, a) {
  if (c.lvl === 1) return;
  var col = c.M.fog;
  add(c, '<rect x="0" y="' + y + '" width="' + c.W + '" height="' + h + '" fill="' + lin(c, [[0, hs(c, col, 0, 0)], [.6, hs(c, col, 0, a * (c.lvl === 3 ? 1 : .7))], [1, hs(c, col, 0, 0)]]) + '"/>');
}
function parts(c, n, col, ymin, ymax) {
  var N = [0, Math.round(n * .35), n][c.lvl - 1], r = c.rs[7];
  for (var i = 0; i < N; i++) {
    var x = r() * c.W, y = ymin + r() * (ymax - ymin), s = r();
    add(c, '<circle class="' + (c.lvl === 3 ? 'twk t' + (i % 4) : '') + '" cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(1.2 + s * 1.8) + '" fill="' + hs(c, col) + '" opacity="' + n1(.5 + s * .5) + '"/>');
  }
}
function pine(c, x, y, h, col, bold) {
  var w = h * .46, dark = hs(c, col, -10), mid = fv(c, col, 6, -4);
  if (c.lvl === 1) {
    add(c, '<polygon points="' + pts([[x, y - h], [x - w, y - h * .12], [x + w, y - h * .12]]) + '" fill="' + hs(c, col) + '"/><polygon points="' + pts([[x, y - h], [x, y - h * .12], [x + w, y - h * .12]]) + '" fill="' + dark + '"/><rect x="' + n1(x - h * .05) + '" y="' + n1(y - h * .14) + '" width="' + n1(h * .1) + '" height="' + n1(h * .14) + '" fill="' + dark + '"/>');
    return;
  }
  var tiers = c.lvl === 2 ? 3 : 4, s = '';
  s += '<rect x="' + n1(x - h * .04) + '" y="' + n1(y - h * .2) + '" width="' + n1(h * .08) + '" height="' + n1(h * .2) + '" fill="' + dark + '"/>';
  for (var t = 0; t < tiers; t++) {
    var top = y - h + t * h * (.62 / tiers), bot = y - h * .16 - (tiers - 1 - t) * h * .1, ww = w * (.45 + .55 * (t + 1) / tiers);
    s += '<polygon points="' + pts([[x, top], [x - ww, bot], [x + ww, bot]]) + '" fill="' + mid + '"' + (c.lvl === 3 ? ' stroke="' + mid + '" stroke-width="1.5" stroke-linejoin="round"' : '') + '/>';
    s += '<polygon points="' + pts([[x, top], [x, bot], [x + ww, bot]]) + '" fill="' + dark + '" opacity="' + (c.lvl === 3 ? .35 : .5) + '"/>';
  }
  add(c, s);
}
function pines(c, i, n, y, count, hmin, hmax, ri) {
  var r = c.rs[ri == null ? i : ri], col = lcol(c, i, n, 6);
  for (var k = 0; k < count; k++) pine(c, (k + .2 + r() * .6) * c.W / count, y + r() * 6, hmin + r() * (hmax - hmin), col);
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
    add(c, s);
  });
}
function waves(c, y, h, i, n) {
  var col = lcol(c, i, n, 0), W = c.W, H = c.H, N = [10, 24, 60][c.lvl - 1], P = [], f = prof(c, 5);
  for (var k = 0; k <= N; k++) { var x = k * W / N; P.push([x, y + (c.lvl === 1 ? (k % 2 ? 4 : -4) : Math.sin(k * 1.3 + f(x) * 6) * (c.lvl === 2 ? 3 : 2.2))]); }
  if (c.lvl === 3) {
    add(c, '<path d="' + smooth(P, H) + '" fill="' + lin(c, [[0, hs(c, col, 14)], [1, hs(c, col, -14)]]) + '"/>');
    add(c, '<g class="drift d1" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"><path d="M60,' + (y + 14) + ' q40,-5 80,0 t80,0"/><path d="M420,' + (y + 24) + ' q40,-5 80,0 t80,0"/><path d="M820,' + (y + 12) + ' q40,-5 80,0 t80,0"/><path d="M1000,' + (y + 28) + ' q40,-5 80,0 t80,0"/></g>');
  } else {
    add(c, '<polygon points="' + pts(P) + ' ' + W + ',' + H + ' 0,' + H + '" fill="' + hs(c, col) + '"/>');
    if (c.lvl === 1) add(c, '<polygon points="' + pts([[0, y + 22], [140, y + 14], [260, y + 22], [140, y + 28]]) + '" fill="' + hs(c, col, 10) + '"/><polygon points="' + pts([[700, y + 30], [860, y + 22], [960, y + 30], [860, y + 36]]) + '" fill="' + hs(c, col, 10) + '"/>');
    else add(c, '<path d="M80,' + (y + 14) + ' q30,-5 60,0 t60,0 M520,' + (y + 26) + ' q30,-5 60,0 t60,0 M860,' + (y + 16) + ' q30,-5 60,0 t60,0" stroke="#fff" stroke-opacity=".4" stroke-width="2" fill="none"/>');
  }
}
function house(c, x, y, w, h, col, lit) {
  var body = hs(c, col, 2), roof = hs(c, col, -12), s = '';
  if (c.lvl === 3) s += '<rect x="' + n1(x) + '" y="' + n1(y - h) + '" width="' + w + '" height="' + h + '" fill="' + fv(c, col, 6, -6) + '"/><polygon points="' + pts([[x - w * .1, y - h], [x + w / 2, y - h - w * .5], [x + w * 1.1, y - h]]) + '" fill="' + fv(c, col, -4, -16) + '" stroke="' + roof + '" stroke-linejoin="round" stroke-width="1.5"/>';
  else s += '<rect x="' + n1(x) + '" y="' + n1(y - h) + '" width="' + w + '" height="' + h + '" fill="' + body + '"/><polygon points="' + pts([[x - w * .1, y - h], [x + w / 2, y - h - w * .5], [x + w * 1.1, y - h]]) + '" fill="' + roof + '"/>';
  if (lit && c.lvl >= 2) s += '<rect x="' + n1(x + w * .3) + '" y="' + n1(y - h * .7) + '" width="' + n1(w * .22) + '" height="' + n1(w * .22) + '" fill="hsl(46,100%,' + (c.lvl === 3 ? 72 : 66) + '%)"/>';
  else if (lit) s += '<rect x="' + n1(x + w * .3) + '" y="' + n1(y - h * .7) + '" width="' + n1(w * .24) + '" height="' + n1(w * .24) + '" fill="hsl(48,100%,64%)"/>';
  add(c, s);
}
function tower(c, x, y, w, h, col, roofH) {
  var body = fv(c, col, 6, -6), dark = hs(c, col, -12), s = '';
  s += '<rect x="' + n1(x - w / 2) + '" y="' + n1(y - h) + '" width="' + w + '" height="' + h + '" fill="' + body + '"/>';
  if (roofH) s += '<polygon points="' + pts([[x - w * .62, y - h], [x, y - h - roofH], [x + w * .62, y - h]]) + '" fill="' + dark + '"/>';
  else for (var k = 0; k < 3; k++) s += '<rect x="' + n1(x - w / 2 + k * w / 3) + '" y="' + n1(y - h - 5) + '" width="' + n1(w / 5) + '" height="6" fill="' + body + '"/>';
  add(c, s);
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
function flame(c, x, y, h) {
  var o = c.M.glow || [30, 100, 58];
  if (c.lvl === 1) add(c, '<polygon points="' + pts([[x - h * .3, y], [x - h * .1, y - h * .6], [x, y - h], [x + h * .15, y - h * .55], [x + h * .3, y]]) + '" fill="' + hs(c, o) + '"/><polygon points="' + pts([[x - h * .12, y], [x, y - h * .5], [x + h * .14, y]]) + '" fill="' + hs(c, [48, 100, 70]) + '"/>');
  else if (c.lvl === 2) add(c, '<path d="M' + n1(x - h * .3) + ',' + y + ' Q' + n1(x - h * .25) + ',' + n1(y - h * .5) + ' ' + n1(x) + ',' + n1(y - h) + ' Q' + n1(x + h * .3) + ',' + n1(y - h * .45) + ' ' + n1(x + h * .3) + ',' + y + ' Z" fill="' + hs(c, o) + '"/><path d="M' + n1(x - h * .13) + ',' + y + ' Q' + n1(x) + ',' + n1(y - h * .6) + ' ' + n1(x + h * .14) + ',' + y + ' Z" fill="' + hs(c, [48, 100, 70]) + '"/>');
  else add(c, '<circle cx="' + x + '" cy="' + n1(y - h * .4) + '" r="' + n1(h * 1.2) + '" fill="' + rad(c, [[0, hs(c, o, 0, .35)], [1, hs(c, o, 0, 0)]]) + '"/><g class="flick"><path d="M' + n1(x - h * .3) + ',' + y + ' C' + n1(x - h * .36) + ',' + n1(y - h * .5) + ' ' + n1(x - h * .05) + ',' + n1(y - h * .55) + ' ' + n1(x) + ',' + n1(y - h) + ' C' + n1(x + h * .1) + ',' + n1(y - h * .55) + ' ' + n1(x + h * .38) + ',' + n1(y - h * .5) + ' ' + n1(x + h * .3) + ',' + y + ' Z" fill="' + lin(c, [[0, 'hsl(48,100%,72%)'], [.5, hs(c, o)], [1, hs(c, o, -14)]]) + '"/></g>');
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

/* ---------- scenes ---------- */
var SC = {
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
    else if (c.lvl === 2) add(c, '<path d="M300,0 L284,34 L302,34 L278,80" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>');
    else add(c, '<polygon points="' + pts([[300, 0], [284, 34], [300, 34], [278, 80], [304, 30], [288, 30]]) + '" fill="#fff" opacity=".85"/>');
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
    add(c, c.lvl === 3 ? '<g class="spin">' + bl + '</g>' : bl);
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

/* ---------- public API ---------- */
var cache = {}, seq = 0;
function svgFor(key, ver) {
  var ck = key + '|' + ver;
  if (cache[ck]) return cache[ck];
  var c = Ctx(key, ver);
  (SC[c.A.k] || SC.field)(c);
  var root = c.lvl === 1 ? ' shape-rendering="crispEdges"' : '';
  var extra = '';
  if (c.lvl === 1) extra = '<rect width="1200" height="140" fill="url(#§dz)"/>';
  if (c.lvl === 3) extra = '<rect width="1200" height="140" fill="url(#§vg)"/>';
  var defs = c.defs.join('');
  if (c.lvl === 1) defs += '<pattern id="§dz" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#000" opacity=".07"/><rect x="3" y="3" width="3" height="3" fill="#000" opacity=".07"/></pattern>';
  if (c.lvl === 3) defs += '<radialGradient id="§vg" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>';
  var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 140" preserveAspectRatio="xMidYMid slice" focusable="false"' + root + '><defs>' + defs + '</defs>' + c.o.join('') + extra + '</svg>';
  cache[ck] = out;
  return out;
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
    return '<div class="banner" aria-hidden="true">' + svg + '</div>';
  },
  svgFor: svgFor
};
})();
