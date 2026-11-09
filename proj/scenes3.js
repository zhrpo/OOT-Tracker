/* ================= scenes, edition 3: every dropdown is a real place from the game =================
   One description per place, drawn three ways from the same points:
   N64     = few vertices (every 3rd point), two flat facets per shape, chunky pixels, a handful of 4-frame animations.
   3DS     = every vertex, three hard cel bands and a dark outline, more props, animation in steps.
   Switch 2= smooth curves through the points, soft gradients, gloss, rim light, depth of field, lots of smooth life.
   All drawings are original; no game assets are copied and no characters are drawn. */

MOODS.deep = { t: [204, 60, 34], b: [214, 70, 12], L: -14, o: [190, 80, 84], fog: [198, 60, 40], orb: 0, stars: 0, glow: [180, 90, 70] };
MOODS.belly = { t: [340, 44, 22], b: [350, 50, 12], L: -16, o: [330, 80, 80], fog: [340, 40, 34], orb: 0, stars: 0, glow: [330, 80, 70] };
MOODS.temple = { t: [216, 22, 16], b: [220, 26, 30], L: -12, o: [48, 100, 86], fog: [210, 20, 40], orb: 0, stars: 0, glow: [48, 100, 80] };
(function () {
  var own = ['forest', 'woods', 'field', 'ranch', 'town', 'village', 'graves', 'mountain', 'goron', 'crater', 'river', 'domain', 'fountain', 'lake', 'valley', 'desert', 'deku', 'dodongo', 'jabu', 'ftemple', 'fire', 'wtemple', 'shadow', 'spirit', 'well', 'ice', 'meadow', 'hcastle', 'ganon', 'fortress', 'waste', 'e1', 'e2', 'e3', 'e4', 'e5', 'relics', 'shelf', 'songc', 'songa'];
  own.forEach(function (k) { if (AREAS[k]) AREAS[k].k = k; });
  AREAS.tot = { h: 214, s: 24, k: 'tot', m: 'temple' };
  AREAS.wtemple.m = 'deep'; AREAS.jabu.m = 'belly'; AREAS.ftemple.m = 'dusk'; AREAS.spirit.m = 'hall';
  AREAS.goron.m = 'hall'; AREAS.domain.m = 'cave'; AREAS.e1.m = 'dawn'; AREAS.e3.m = 'dusk';
  KEYS.unshift([/door of time|temple of time/i, 'tot']);
})();

/* ---------- geometry ---------- */
function dec(P, k) { if (k <= 1 || P.length <= 4) return P; var o = []; for (var i = 0; i < P.length; i += k) o.push(P[i]); return o.length < 3 ? P : o; }
function lpath(P) { return 'M' + P.map(function (p) { return n1(p[0]) + ',' + n1(p[1]); }).join(' L') + ' Z'; }
function cpath(P) {
  var n = P.length, d = 'M' + n1(P[0][0]) + ',' + n1(P[0][1]);
  for (var k = 0; k < n; k++) {
    var p0 = P[(k - 1 + n) % n], p1 = P[k], p2 = P[(k + 1) % n], p3 = P[(k + 2) % n];
    d += ' C' + n1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + n1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + n1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + n1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + n1(p2[0]) + ',' + n1(p2[1]);
  }
  return d + ' Z';
}
function blob(cx, cy, rx, ry, n, j, r) {
  var P = [];
  for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2 - Math.PI / 2, k = 1 + (r ? (r() - .5) * 2 * j : 0); P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return P;
}
function box(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
function LOD(c, a, b, d) { return [a, b, d][c.lvl - 1]; }

/* ---------- shading: two facets / three cel bands / a smooth light ---------- */
function moodCol(c, col, lit) { return lit ? col : [col[0], col[1], clamp(col[2] + c.M.L * .42, 4, 94)]; }
function shd(c, col, m) {
  c.gc = c.gc || {};
  var key = col.join(',') + '|' + (m || 'd');
  if (c.gc[key]) return c.gc[key];
  var d = m === 'v' ? [0, 0, 0, 1] : m === 'h' ? [0, 0, 1, 0] : [0, 0, .8, 1], st;
  if (c.lvl === 1) st = [[0, hs(c, col, 8)], [.5, hs(c, col, 8)], [.5, hs(c, col, -8)], [1, hs(c, col, -8)]];
  else if (c.lvl === 2) st = [[0, hs(c, col, 11)], [.34, hs(c, col, 11)], [.34, hs(c, col, 0)], [.72, hs(c, col, 0)], [.72, hs(c, col, -13)], [1, hs(c, col, -13)]];
  else st = [[0, hs(c, col, 15)], [.5, hs(c, col, 1)], [1, hs(c, col, -16)]];
  return (c.gc[key] = lin(c, st, d[0], d[1], d[2], d[3]));
}
function gl3(c) { c.gc = c.gc || {}; return c.gc.gl || (c.gc.gl = lin(c, [[0, '#fff', .2], [.45, '#fff', .03], [1, '#fff', 0]])); }
/* o: sm = smooth curve on Switch 2, k = N64 decimation, ol = 3DS outline width (0 = none), flat, lit (ignores the night), m = light direction, op, cls */
function shp(c, P, col, o) {
  o = o || {};
  col = moodCol(c, col, o.lit);
  var f = o.fill || (o.flat ? hs(c, col) : shd(c, col, o.m)), s;
  if (c.lvl === 1) s = '<polygon points="' + pts(dec(P, o.k || (P.length > 8 ? 3 : 1))) + '" fill="' + f + '"/>';
  else if (c.lvl === 2) s = '<polygon points="' + pts(dec(P, o.k2 || 1)) + '" fill="' + f + '"' + (o.ol === 0 ? '' : ' stroke="' + hs(c, col, -32) + '" stroke-width="' + (o.ol || 2) + '" stroke-linejoin="round"') + '/>';
  else {
    var d = o.sm ? cpath(P) : lpath(P);
    s = '<path d="' + d + '" fill="' + f + '"' + (o.ol === 0 || o.fill ? '' : ' stroke="' + hs(c, col, -22) + '" stroke-opacity=".45" stroke-width=".9" stroke-linejoin="round"') + '/>' + (o.nogl || o.flat ? '' : '<path d="' + d + '" fill="' + gl3(c) + '"/>');
  }
  if (o.op != null) s = '<g opacity="' + o.op + '">' + s + '</g>';
  if (o.cls) s = '<g class="' + o.cls + '"' + (o.st ? ' style="' + o.st + '"' : '') + '>' + s + '</g>';
  return s;
}
function A(c, s) { add(c, s); }
/* draw into a string instead of the picture (for reflections) */
function cap(c, fn) { var o = c.o; c.o = []; fn(); var r = c.o.join(''); c.o = o; return r; }
/* a soft contact shadow under things that stand on the ground (handhelds get a flat one) */
function cshadow(c, x, y, w) {
  if (c.lvl === 1) return;
  if (c.lvl === 2) { A(c, '<ellipse cx="' + n1(x) + '" cy="' + n1(y) + '" rx="' + n1(w) + '" ry="' + n1(Math.max(2, w * .1)) + '" fill="#000" opacity=".18"/>'); return; }
  A(c, '<ellipse cx="' + n1(x) + '" cy="' + n1(y) + '" rx="' + n1(w * 1.1) + '" ry="' + n1(Math.max(2.4, w * .13)) + '" fill="' + rad(c, [[0, '#000', .42], [1, '#000', 0]]) + '"/>');
}
/* mirror what fn draws in the water below y */
function reflect(c, y, fn) {
  if (c.lvl === 1) return;
  var src = cap(c, fn);
  if (!c.reflN) { c.reflN = 1; c.defs.push('<clipPath id="§rc"><rect x="-50" y="' + y + '" width="1300" height="200"/></clipPath>'); if (c.lvl === 3) c.defs.push('<filter id="§rb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.2 .6"/></filter>'); }
  A(c, '<g clip-path="url(#§rc)"><g opacity="' + (c.lvl === 3 ? .38 : .28) + '"' + '' + '><g class="' + (c.lvl === 3 ? 'drift d1' : '') + '" style="--dx:3px"><g transform="translate(0 ' + (2 * y) + ') scale(1 -1)">' + src + '</g></g></g></g>');
}
/* soft glow (Switch 2 only), a lit window, a flame on a post */
function glow(c, x, y, r, col, a) { if (c.lvl === 3) A(c, '<circle class="pulse" cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(r) + '" fill="' + rad(c, [[0, hs(c, col, 0, a == null ? .5 : a)], [1, hs(c, col, 0, 0)]]) + '"/>'); }
function win(c, x, y, w, h, on) {
  var col = on ? [44, 100, 66] : [220, 20, 16];
  if (c.lvl === 1) return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" fill="' + hs(c, col) + '"/>';
  return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" rx="' + (c.lvl === 3 ? 1.5 : 0) + '" fill="' + hs(c, col) + '"' + (c.lvl === 2 ? ' stroke="#1a1208" stroke-width="1.4"' : '') + '/>' +
    (c.lvl === 3 && on ? '<rect class="pulse" x="' + n1(x - w) + '" y="' + n1(y - h) + '" width="' + n1(w * 3) + '" height="' + n1(h * 3) + '" fill="' + rad(c, [[0, 'hsla(44,100%,70%,.45)'], [1, 'hsla(44,100%,70%,0)']]) + '"/>' : '');
}
function torch(c, x, y, h, col) {
  A(c, shp(c, box(x - 2.5, y - h, 5, h), [28, 30, 22], { ol: 1 }));
  if (col) { var o = c.M.glow; c.M.glow = col; flame(c, x, y - h, 14); c.M.glow = o; } else flame(c, x, y - h, 14);
  glow(c, x, y - h - 6, 40, col || [30, 100, 60], .5);
}

/* ---------- landmarks ---------- */
function tree(c, x, y, h, col, cls) {
  cshadow(c, x, y, h * .3);
  var r = c.rs[2], s = '', tw = h * .085, cr = h * .36, cy = y - h * .62, n = LOD(c, 7, 13, 18);
  s += shp(c, [[x - tw * 1.4, y], [x - tw * .7, y - h * .5], [x + tw * .7, y - h * .5], [x + tw * 1.4, y]], [26, 36, 26], { m: 'h', nogl: 1, ol: 1.5 });
  s += shp(c, blob(x, cy, cr * 1.15, cr, n, .14, r), col, { sm: 1, k: 1 });
  if (c.lvl >= 2) s += shp(c, blob(x - cr * .5, cy + cr * .3, cr * .62, cr * .5, n - 3, .16, r), col, { sm: 1, k: 1 }) + shp(c, blob(x + cr * .55, cy + cr * .25, cr * .6, cr * .5, n - 3, .16, r), col, { sm: 1, k: 1 });
  if (c.lvl === 3) s += shp(c, blob(x - cr * .25, cy - cr * .4, cr * .55, cr * .36, 12, .2, r), [col[0], col[1], col[2] + 12], { sm: 1, op: .8 });
  A(c, c.lvl >= 2 ? '<g class="sway" style="--sk:' + (c.lvl === 3 ? 2.6 : 3) + 'deg;--sp:' + n1(4.6 + (x % 3) * .6) + 's;animation-delay:' + ph(c, x) + 's">' + s + '</g>' : s);
}
function rock(c, x, y, w, h, col) {
  var r = c.rs[5];
  cshadow(c, x, y, w * .55);
  A(c, shp(c, [[x - w / 2, y], [x - w * .46, y - h * .5], [x - w * .2, y - h * (.9 + r() * .1)], [x + w * .15, y - h], [x + w * .44, y - h * .55], [x + w / 2, y]], col || [24, 14, 40], { sm: c.lvl === 3 ? 1 : 0 }));
}
/* a Kokiri house: a hollow stump with a round door, a lit window and a leafy cap */
function stumpHouse(c, x, y, w, h, ladder) {
  cshadow(c, x, y, w * .7);
  var bark = [24, 38, 34], s = '';
  s += shp(c, [[x - w / 2, y], [x - w * .5, y - h * .8], [x - w * .42, y - h], [x + w * .42, y - h], [x + w * .5, y - h * .8], [x + w / 2, y]], bark, { m: 'h', ol: 2 });
  if (c.lvl === 3) s += '<path d="M' + n1(x - w * .25) + ',' + n1(y - h * .9) + ' Q' + n1(x - w * .3) + ',' + n1(y - h * .4) + ' ' + n1(x - w * .22) + ',' + y + ' M' + n1(x + w * .2) + ',' + n1(y - h * .95) + ' Q' + n1(x + w * .28) + ',' + n1(y - h * .5) + ' ' + n1(x + w * .18) + ',' + y + '" stroke="' + hs(c, bark, -16) + '" stroke-width="1.2" fill="none" opacity=".7"/>';
  s += shp(c, [[x - w * .14, y], [x - w * .14, y - h * .32], [x - w * .08, y - h * .42], [x + w * .08, y - h * .42], [x + w * .14, y - h * .32], [x + w * .14, y]], [20, 30, 12], { flat: 1, ol: 1.5 });
  s += win(c, x + w * .2, y - h * .66, w * .14, w * .12, 1);
  s += shp(c, blob(x, y - h - h * .12, w * .72, h * .3, LOD(c, 6, 12, 16), .12, c.rs[3]), [104, 50, 36], { sm: 1, k: 1 });
  if (ladder && c.lvl >= 2) for (var i = 0; i < 4; i++) s += '<rect x="' + n1(x - w * .62) + '" y="' + n1(y - h * .2 * (i + 1)) + '" width="' + n1(w * .14) + '" height="2" fill="' + hs(c, [30, 40, 50]) + '"/>';
  if (ladder && c.lvl >= 2) s += '<rect x="' + n1(x - w * .63) + '" y="' + n1(y - h * .85) + '" width="2" height="' + n1(h * .85) + '" fill="' + hs(c, [30, 40, 44]) + '"/><rect x="' + n1(x - w * .49) + '" y="' + n1(y - h * .85) + '" width="2" height="' + n1(h * .85) + '" fill="' + hs(c, [30, 40, 44]) + '"/>';
  A(c, s);
}
/* a house with a gable roof; o: wall, roof, win (count), smoke, door */
function bld(c, x, y, w, h, wall, roof, o) {
  o = o || {};
  var s = '', rh = o.rh || w * .42, ov = w * .1;
  cshadow(c, x + w / 2, y, w * .62);
  s += shp(c, box(x, y - h, w, h), wall, { m: 'h', ol: 2 });
  if (c.lvl === 3) { var wl = moodCol(c, wall); for (var pl = 1; pl < 4; pl++) s += '<line x1="' + x + '" y1="' + n1(y - h + pl * h / 4) + '" x2="' + (x + w) + '" y2="' + n1(y - h + pl * h / 4) + '" stroke="' + hs(c, wl, -12) + '" stroke-width=".7" opacity=".55"/>'; s += '<rect x="' + x + '" y="' + n1(y - h) + '" width="' + w + '" height="' + n1(h * .22) + '" fill="#000" opacity=".18"/>'; }
  if (c.lvl === 2) s += '<rect x="' + x + '" y="' + n1(y - h) + '" width="' + w + '" height="' + n1(h * .16) + '" fill="#000" opacity=".2"/>';
  if (o.flatRoof) s += shp(c, box(x - ov * .5, y - h - 5, w + ov, 6), roof, { ol: 1.5 });
  else s += shp(c, [[x - ov, y - h + 2], [x + w / 2, y - h - rh], [x + w + ov, y - h + 2]], roof, { ol: 2 });
  if (c.lvl === 3 && !o.flatRoof) {
    s += '<path d="M' + n1(x - ov) + ',' + n1(y - h + 2) + ' L' + n1(x + w / 2) + ',' + n1(y - h - rh) + '" stroke="#fff" stroke-opacity=".3" stroke-width="1.2"/>';
    var rl = moodCol(c, roof); for (var sh = 1; sh < 4; sh++) { var t = sh / 4, yy = y - h - rh + rh * t + 2 * t; s += '<line x1="' + n1(x + w / 2 - (w / 2 + ov) * t) + '" y1="' + n1(yy) + '" x2="' + n1(x + w / 2 + (w / 2 + ov) * t) + '" y2="' + n1(yy) + '" stroke="' + hs(c, rl, -14) + '" stroke-width=".8" opacity=".6"/>'; }
  }
  if (c.lvl === 2 && !o.flatRoof) s += '<path d="M' + n1(x + w / 2) + ',' + n1(y - h - rh) + ' L' + n1(x + w / 2) + ',' + n1(y - h + 2) + '" stroke="' + hs(c, moodCol(c, roof), -18) + '" stroke-width="1.2" opacity=".6"/>';
  var nw = o.win == null ? LOD(c, 1, 2, 2) : o.win;
  for (var i = 0; i < nw; i++) s += win(c, x + w * (i + .6) / (nw + .4) - w * .07, y - h * .7, w * .14, h * .22, (i + Math.round(x)) % 3 !== 1);
  if (o.door !== 0) s += shp(c, box(x + w * .42, y - h * .42, w * .16, h * .42), [24, 30, 16], { flat: 1, ol: 1.2 });
  A(c, s);
  if (o.smoke && c.lvl >= 2) {
    var sx = x + w * .78, sy = y - h - rh * .45;
    A(c, shp(c, box(sx - 3, sy - 8, 6, 12), roof, { ol: 1.2 }));
    for (var q = 0; q < LOD(c, 0, 2, 3); q++) A(c, '<circle class="smoke" cx="' + n1(sx) + '" cy="' + n1(sy - 10) + '" r="' + (c.lvl === 3 ? 3.4 : 4) + '" fill="' + (c.lvl === 3 ? 'rgba(235,235,240,.55)' : '#e6e8ee') + '" style="animation-delay:' + n1(-q * 1.7) + 's"/>');
  }
}
/* a round tower with a pointed roof */
function rtower(c, x, y, w, h, wall, roof, fl) {
  cshadow(c, x, y, w * .8);
  var s = shp(c, [[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]], wall, { m: 'h', ol: 2 });
  if (roof) s += shp(c, [[x - w * .66, y - h + 1], [x, y - h - w * 1.3], [x + w * .66, y - h + 1]], roof, { m: 'h', ol: 2 });
  else for (var k = 0; k < 3; k++) s += shp(c, box(x - w / 2 + k * w * .4, y - h - 6, w * .22, 7), wall, { ol: 1.2 });
  if (c.lvl === 3) { var wl = moodCol(c, wall); for (var bq = 1; bq < Math.floor(h / 9); bq++) s += '<line x1="' + n1(x - w / 2) + '" y1="' + n1(y - bq * 9) + '" x2="' + n1(x + w / 2) + '" y2="' + n1(y - bq * 9) + '" stroke="' + hs(c, wl, -10) + '" stroke-width=".6" opacity=".5"/>'; s += '<rect x="' + n1(x + w * .18) + '" y="' + n1(y - h) + '" width="' + n1(w * .32) + '" height="' + h + '" fill="#000" opacity=".12"/>';
    if (roof) { var rl = moodCol(c, roof); for (var rq = 1; rq < 4; rq++) { var t = rq / 4; s += '<line x1="' + n1(x - w * .66 * t) + '" y1="' + n1(y - h - w * 1.3 * (1 - t)) + '" x2="' + n1(x + w * .66 * t) + '" y2="' + n1(y - h - w * 1.3 * (1 - t)) + '" stroke="' + hs(c, rl, -14) + '" stroke-width=".7" opacity=".6"/>'; } } }
  if (c.lvl === 2) s += '<rect x="' + n1(x + w * .2) + '" y="' + n1(y - h) + '" width="' + n1(w * .3) + '" height="' + h + '" fill="#000" opacity=".14"/>';
  for (var i = 0; i < LOD(c, 1, 2, 3); i++) s += win(c, x - w * .08, y - h * (.3 + i * .22), w * .16, h * .1, i === 0);
  A(c, s);
  if (fl && c.lvl >= 2) flag(c, x, y - h - (roof ? w * 1.3 : 6) + 1);
}
function cwall(c, x0, x1, y, h, col) {
  var s = shp(c, box(x0, y - h, x1 - x0, h), col, { m: 'v', ol: 2 }), n = Math.round((x1 - x0) / LOD(c, 30, 18, 14));
  for (var k = 0; k < n; k += 2) s += shp(c, box(x0 + k * (x1 - x0) / n, y - h - 6, (x1 - x0) / n, 7), col, { ol: 1.2, nogl: 1 });
  if (c.lvl === 3) for (var r = 1; r < 3; r++) s += '<path d="M' + x0 + ',' + n1(y - h + r * h / 3) + ' H' + x1 + '" stroke="' + hs(c, moodCol(c, col), -14) + '" stroke-width=".8" opacity=".5"/>';
  A(c, s);
}
/* Death Mountain: a tall cone with the ring of cloud around its top */
function volcano(c, cx, base, w, h, col, fire) {
  var r = c.rs[1], P = [[cx - w, base]], n = LOD(c, 4, 10, 18), k;
  for (k = 1; k < n; k++) { var t = k / n; P.push([cx - w + t * (w - 26), base - h * Math.pow(t, .8) + (r() - .5) * 8]); }
  P.push([cx - 24, base - h], [cx - 8, base - h + 7], [cx + 10, base - h + 6], [cx + 26, base - h]);
  for (k = n - 1; k > 0; k--) { var t2 = k / n; P.push([cx + w - t2 * (w - 26), base - h * Math.pow(t2, .8) + (r() - .5) * 8]); }
  P.push([cx + w, base]);
  A(c, shp(c, P, col, { m: 'h', k: 1, ol: 2.4 }));
  if (c.lvl >= 2) A(c, '<path d="M' + n1(cx - 20) + ',' + n1(base - h + 4) + ' L' + n1(cx - w * .45) + ',' + n1(base - h * .2) + ' M' + n1(cx + 8) + ',' + n1(base - h + 6) + ' L' + n1(cx + w * .2) + ',' + n1(base - h * .1) + '" stroke="' + hs(c, moodCol(c, col), -14) + '" stroke-width="' + (c.lvl === 3 ? 1.4 : 2.4) + '" fill="none" opacity=".7"/>');
  if (fire) { glow(c, cx, base - h, 60, [20, 100, 56], .8); A(c, shp(c, [[cx - 22, base - h + 1], [cx, base - h - 4], [cx + 24, base - h + 1], [cx, base - h + 6]], [20, 100, 56], { lit: 1, flat: 1, ol: 0, cls: 'pulse' })); }
  /* the ring */
  var ry = base - h - 16, rw = 74, s = '';
  if (c.lvl === 1) s = '<polygon points="' + pts([[cx - rw, ry], [cx - rw * .5, ry - 12], [cx + rw * .5, ry - 12], [cx + rw, ry], [cx + rw * .5, ry + 12], [cx - rw * .5, ry + 12]]) + '" fill="none" stroke="#e8e4f0" stroke-width="12"/>';
  else if (c.lvl === 2) s = '<ellipse cx="' + cx + '" cy="' + ry + '" rx="' + rw + '" ry="13" fill="none" stroke="#33303a" stroke-width="15"/><ellipse cx="' + cx + '" cy="' + ry + '" rx="' + rw + '" ry="13" fill="none" stroke="#f2f0f6" stroke-width="11"/><ellipse cx="' + cx + '" cy="' + (ry - 3) + '" rx="' + (rw - 6) + '" ry="9" fill="none" stroke="#fff" stroke-width="3"/>';
  else { for (k = 0; k < 22; k++) { var a = k / 22 * Math.PI * 2, px = cx + Math.cos(a) * rw, py = ry + Math.sin(a) * 13, rr = 9 + (k % 3) * 2.4; s += '<circle cx="' + n1(px) + '" cy="' + n1(py) + '" r="' + n1(rr) + '" fill="' + rad(c, [[0, '#fff', .95], [.6, '#f0eef6', .8], [1, '#dcd8e8', 0]]) + '"/>'; } }
  A(c, '<g class="' + (c.lvl === 1 ? 'drift d2' : 'bob b1') + '">' + s + '</g>');
}
function waterfall(c, x, y0, y1, w, col) {
  col = col || [196, 70, 74];
  A(c, shp(c, box(x - w / 2, y0, w, y1 - y0), col, { m: 'h', ol: c.lvl === 2 ? 1.5 : 0, lit: 1 }));
  var s = '', n = LOD(c, 2, 4, 9);
  for (var i = 0; i < n; i++) { var lx = x - w / 2 + w * (i + .5) / n; s += '<line class="fall" x1="' + n1(lx) + '" y1="' + y0 + '" x2="' + n1(lx) + '" y2="' + y1 + '" stroke="#fff" stroke-opacity="' + (c.lvl === 3 ? .55 : .8) + '" stroke-width="' + LOD(c, 6, 2.6, 1.4) + '" stroke-dasharray="' + (c.lvl === 1 ? '20 20' : '14 26') + '" style="animation-delay:' + n1(-i * .37) + 's"/>'; }
  A(c, s);
  if (c.lvl >= 2) for (var q = 0; q < LOD(c, 0, 2, 5); q++) A(c, '<circle class="smoke" cx="' + n1(x - w / 2 + (q + .5) * w / LOD(c, 1, 2, 5)) + '" cy="' + y1 + '" r="' + (c.lvl === 3 ? 6 : 6) + '" fill="#fff" opacity=".6" style="animation-delay:' + n1(-q * .9) + 's;animation-duration:2.6s"/>');
}
function lava(c, y, h) {
  var col = [18, 100, 50];
  A(c, '<rect x="0" y="' + y + '" width="1200" height="' + (h || 140 - y + 2) + '" fill="' + (c.lvl === 1 ? hs(c, col) : lin(c, [[0, hs(c, [44, 100, 66])], [.3, hs(c, col)], [1, hs(c, [4, 90, 30])]])) + '"/>');
  if (c.lvl >= 2) { var r = c.rs[6], s = ''; for (var i = 0; i < LOD(c, 0, 5, 14); i++) s += '<circle class="twk t' + (i % 4) + '" cx="' + n1(r() * 1200) + '" cy="' + n1(y + 4 + r() * 18) + '" r="' + (c.lvl === 3 ? 2.6 : 3.5) + '" fill="' + hs(c, [48, 100, 76]) + '"/>'; A(c, s); }
  if (c.lvl === 3) A(c, '<rect class="pulse" x="0" y="' + (y - 50) + '" width="1200" height="60" fill="' + lin(c, [[0, 'hsla(24,100%,60%,0)'], [1, 'hsla(24,100%,60%,.45)']]) + '"/>');
}
function bridge(c, x0, x1, y, sag, col) {
  col = col || [30, 40, 40];
  var n = LOD(c, 6, 14, 26), s = '', P = [];
  for (var i = 0; i <= n; i++) { var t = i / n; P.push([x0 + (x1 - x0) * t, y + Math.sin(t * Math.PI) * sag]); }
  for (i = 0; i < n; i++) s += '<rect x="' + n1(P[i][0]) + '" y="' + n1(P[i][1] - 2) + '" width="' + n1((x1 - x0) / n - (c.lvl === 1 ? 0 : 1.6)) + '" height="' + LOD(c, 6, 4, 3.4) + '" fill="' + hs(c, moodCol(c, col), (i % 2) * 6) + '"/>';
  var rope = 'M' + P.map(function (p) { return n1(p[0]) + ',' + n1(p[1] - 12); }).join(' L');
  s += '<path d="' + rope + '" stroke="' + hs(c, moodCol(c, col), -14) + '" stroke-width="' + LOD(c, 3, 1.8, 1.2) + '" fill="none"/>';
  if (c.lvl >= 2) for (i = 0; i <= n; i += LOD(c, 3, 2, 3)) s += '<line x1="' + n1(P[i][0]) + '" y1="' + n1(P[i][1] - 12) + '" x2="' + n1(P[i][0]) + '" y2="' + n1(P[i][1]) + '" stroke="' + hs(c, moodCol(c, col), -14) + '" stroke-width="1"/>';
  A(c, s);
}
function palm(c, x, y, h) {
  var s = '', tk = [30, 36, 34], lf = [100, 50, 34];
  s += shp(c, [[x - 4, y], [x - 1, y - h * .5], [x + 6, y - h], [x + 10, y - h], [x + 4, y - h * .5], [x + 4, y]], tk, { m: 'h', ol: 1.5, sm: 0 });
  var fr = LOD(c, 4, 6, 8);
  for (var i = 0; i < fr; i++) {
    var a = -Math.PI + i / (fr - 1) * Math.PI, ex = x + 8 + Math.cos(a) * h * .45, ey = y - h + Math.sin(a) * h * .18 + h * .14;
    s += shp(c, [[x + 8, y - h], [x + 8 + Math.cos(a) * h * .25, y - h + Math.sin(a) * h * .2 - 3], [ex, ey], [x + 8 + Math.cos(a) * h * .25, y - h + Math.sin(a) * h * .2 + 3]], lf, { sm: 0, ol: 1.2 });
  }
  A(c, c.lvl >= 2 ? '<g class="sway" style="--sk:2.4deg;--sp:5s;animation-delay:' + ph(c, x) + 's">' + s + '</g>' : s);
}
function horse(c, x, y, s, col, run) {
  col = col || [26, 50, 34];
  var P = [[0, 0], [2, -9], [8, -12], [26, -12], [32, -16], [36, -22], [42, -21], [40, -15], [34, -9], [34, 0], [31, 0], [30, -7], [12, -7], [10, 0], [7, 0], [6, -7]];
  P = P.map(function (p) { return [x + p[0] * s, y + p[1] * s]; });
  var g = shp(c, P, col, { ol: 1.2 }) + (c.lvl >= 2 ? '<path d="M' + n1(x + 34 * s) + ',' + n1(y - 21 * s) + ' Q' + n1(x + 28 * s) + ',' + n1(y - 18 * s) + ' ' + n1(x + 26 * s) + ',' + n1(y - 12 * s) + '" stroke="#f4ead8" stroke-width="' + n1(2 * s) + '" fill="none"/>' : '');
  A(c, run ? '<g class="fly f1" style="animation-duration:' + (c.lvl === 1 ? 30 : 22) + 's"><g class="hop">' + g + '</g></g>' : g);
}
function bubbles(c, n) {
  var r = c.rs[4], s = '';
  for (var i = 0; i < LOD(c, 3, 8, n || 22); i++) s += '<circle class="bub" cx="' + n1(r() * 1200) + '" cy="' + n1(110 + r() * 30) + '" r="' + n1(c.lvl === 1 ? 4 : 1.4 + r() * 2.4) + '" fill="none" stroke="#dff6ff" stroke-width="' + (c.lvl === 1 ? 3 : 1) + '" style="animation-duration:' + n1(4 + r() * 4) + 's;animation-delay:' + n1(-r() * 8) + 's"/>';
  A(c, s);
}
function beams(c, xs, col, w) {
  if (c.lvl === 1) return;
  var s = '';
  xs.forEach(function (x, i) { s += '<polygon points="' + pts([[x - (w || 20), 0], [x + (w || 20), 0], [x + 110, 140], [x + 30, 140]]) + '" fill="' + (c.lvl === 3 ? lin(c, [[0, hs(c, col, 0, .4)], [1, hs(c, col, 0, 0)]]) : hs(c, col, 0, .22)) + '"/>'; });
  A(c, '<g class="pulse">' + s + '</g>');
}
function fairies(c, n, col) {
  var r = c.rs[5], s = '', N = Math.min(LOD(c, 2, 4, n || 9), LOD(c, 2, 4, 7));
  col = col || [190, 90, 86];
  for (var i = 0; i < N; i++) {
    var x = 200 + r() * 800, y = 30 + r() * 70;
    s += '<g transform="translate(' + n1(x) + ' ' + n1(y) + ')"><g class="wisp" style="--wx:' + n1((r() - .5) * 90) + 'px;--wy:' + n1(-10 - r() * 20) + 'px;animation-duration:' + n1(8 + r() * 6) + 's;animation-delay:' + n1(-r() * 10) + 's">' +
      (c.lvl === 3 ? '<circle r="12" fill="' + rad(c, [[0, hs(c, col, 0, .7)], [1, hs(c, col, 0, 0)]]) + '"/><ellipse cx="-3" cy="-2" rx="3" ry="1.6" fill="#fff" opacity=".7"/><ellipse cx="3" cy="-2" rx="3" ry="1.6" fill="#fff" opacity=".7"/>' : '') +
      '<circle class="twk t' + (i % 4) + '" r="' + LOD(c, 5, 3.2, 2.2) + '" fill="' + (c.lvl === 1 ? hs(c, col) : '#fff') + '"' + (c.lvl === 2 ? ' stroke="' + hs(c, col, -10) + '" stroke-width="2"' : '') + '/></g></g>';
  }
  A(c, s);
}
function lightning(c, x) {
  if (c.lvl === 1) A(c, '<polygon class="flash" points="' + pts([[x, 0], [x - 16, 34], [x, 34], [x - 22, 80], [x + 6, 30], [x - 10, 30]]) + '" fill="#fff" opacity="0"/>');
  else A(c, '<g class="flash" opacity="0"><path d="M' + x + ',0 L' + (x - 16) + ',34 L' + (x + 2) + ',34 L' + (x - 22) + ',80 L' + (x - 12) + ',52 L' + (x - 30) + ',62" stroke="#fff" stroke-width="' + (c.lvl === 3 ? 2 : 3) + '" fill="none" stroke-linejoin="round"/>' + (c.lvl === 3 ? '<rect width="1200" height="140" fill="#e9e4ff" opacity=".25"/>' : '') + '</g>');
}
function floor(c, y, col, tiles) {
  A(c, shp(c, box(-10, y, 1220, 140 - y + 4), col, { m: 'v', ol: 0, nogl: 1 }));
  if (tiles && c.lvl >= 2) { var s = ''; for (var i = 0; i < 16; i++) s += '<line x1="' + (i * 80 + 40) + '" y1="' + y + '" x2="' + (i * 80 + 40 + (i * 80 + 40 - 600) * .8) + '" y2="140" stroke="' + hs(c, moodCol(c, col), -12) + '" stroke-width="1" opacity=".6"/>'; A(c, s); }
}
/* Switch 2: big out-of-focus leaves at the top corners, swaying (depth in front of the scene) */
function frameLeaves(c, col) {
  if (c.lvl < 3) return;
  var s = '';
  [[40, -10, 1], [1160, -14, -1], [230, -26, 1], [960, -24, -1]].forEach(function (p, i) {
    var x = p[0], y = p[1], d = p[2], L = [];
    for (var k = 0; k < 5; k++) L.push(shp(c, blob(x + d * k * 22, y + 16 + (k % 2) * 12, 26, 14, 10, .1, c.rs[3]), col || [110, 50, 20], { sm: 1, nogl: 1 }));
    s += '<g class="sway" style="--sk:3deg;--sp:' + (5 + i) + 's">' + L.join('') + '</g>';
  });
  A(c, '<g opacity=".8">' + s + '</g>');
}
function hills(c, i, n, base, amp, pf) { ridge(c, i, n, base, amp, pf); }

/* ---------- the places ---------- */
var SC3 = {
  /* Kokiri Forest: stump houses, the shop, tall trees all round, fairies */
  forest: function (c) {
    sky(c); orb(c, 980, 30, 16); clouds(c);
    pines(c, 0, 4, 92, 26, 50, 80, 0); trunks(c, 1, 4, 5, 18, 1);
    ridge(c, 2, 4, 116, 6);
    stumpHouse(c, 300, 124, 64, 50, 1); stumpHouse(c, 520, 120, 76, 56, 0); stumpHouse(c, 760, 122, 60, 46, 1); stumpHouse(c, 930, 126, 54, 40, 0);
    tree(c, 640, 132, 70, [110, 46, 34]); tree(c, 160, 132, 80, [116, 44, 30]); tree(c, 1060, 134, 84, [104, 46, 32]);
    ridge(c, 3, 4, 136, 4); fairies(c, 10); frameLeaves(c, [116, 46, 22]); fog(c, 70, 30, .3);
  },
  /* Lost Woods: huge trunks, the hollow log tunnel, a stump, mist */
  woods: function (c) {
    sky(c); pines(c, 0, 4, 120, 30, 46, 70, 1); fog(c, 70, 50, .5);
    trunks(c, 1, 4, 9, 14, 2);
    var lc = [26, 36, 26];
    A(c, shp(c, blob(600, 104, 120, 30, LOD(c, 6, 14, 22), .04), lc, { sm: 1, k: 1, m: 'v' }));
    A(c, shp(c, blob(494, 104, 14, 24, LOD(c, 6, 12, 18), 0), [20, 20, 8], { sm: 1, k: 1, flat: 1 }));
    if (c.lvl >= 2) for (var i = 0; i < LOD(c, 0, 3, 6); i++) A(c, '<path d="M' + (520 + i * 36) + ',80 Q' + (530 + i * 36) + ',104 ' + (520 + i * 36) + ',128" stroke="' + hs(c, moodCol(c, lc), -12) + '" stroke-width="1.2" fill="none" opacity=".6"/>');
    A(c, shp(c, [[820, 128], [822, 104], [880, 104], [882, 128]], lc, { ol: 2 }) + shp(c, blob(851, 104, 30, 6, 10, 0), [34, 30, 44], { sm: 1, k: 1 }));
    ground(c, 3, 4, 128); trunks(c, 3, 4, 4, 24, 3); fairies(c, 12, [80, 90, 70]); fog(c, 96, 40, .4);
  },
  /* Sacred Forest Meadow: the hedge maze, the stone stair, the ruined arch above */
  meadow: function (c) {
    sky(c); orb(c, 260, 70, 15); clouds(c);
    pines(c, 0, 4, 90, 24, 40, 70, 0);
    var st = [200, 8, 60], hd = [118, 44, 30];
    ridge(c, 1, 4, 112, 6); A(c, shp(c, [[470, 128], [520, 40], [680, 40], [730, 128]], [110, 40, 40], { ol: 2 }));
    A(c, shp(c, box(560, 10, 14, 30), st, { ol: 1.5 }) + shp(c, box(626, 10, 14, 30), st, { ol: 1.5 }) + shp(c, [[552, 12], [600, -4], [648, 12], [648, 18], [552, 18]], st, { ol: 1.5 }));
    A(c, shp(c, box(586, 18, 28, 22), [140, 20, 10], { flat: 1, ol: 0 }));
    for (var i = 0; i < 6; i++) A(c, shp(c, box(560 - i * 8, 74 + i * 9, 80 + i * 16, 9), st, { ol: 1.2, m: 'v' }));
    for (i = 0; i < 7; i++) { var hx = 80 + i * 160 + (i > 2 ? 140 : 0); if (hx > 1180) break; A(c, shp(c, box(hx, 92 + (i % 2) * 8, 110, 40), hd, { m: 'v', ol: 2 })); }
    ridge(c, 3, 4, 136, 4); fairies(c, 6, [60, 90, 80]); frameLeaves(c); fog(c, 80, 30, .35);
  },
  /* Great Deku Tree: one giant gnarled tree, roots everywhere, light shafts */
  deku: function (c) {
    sky(c); pines(c, 0, 3, 110, 22, 50, 80, 0);
    beams(c, [380, 820], [70, 90, 80], 26);
    var bk = [28, 30, 32], r = c.rs[3];
    A(c, shp(c, [[470, 140], [500, 100], [520, 40], [510, 0], [690, 0], [680, 40], [700, 100], [730, 140]], bk, { m: 'h', ol: 2.5, sm: c.lvl === 3 ? 1 : 0 }));
    var roots = [[470, 140, 380, 132], [500, 118, 420, 140], [700, 116, 790, 140], [730, 140, 840, 130]];
    roots.forEach(function (q) { A(c, shp(c, [[q[0], q[1] - 8], [q[2], q[3] - 4], [q[2], q[3] + 4], [q[0], q[1] + 8]], bk, { m: 'v', ol: 2 })); });
    if (c.lvl >= 2) { var s = ''; for (var i = 0; i < LOD(c, 0, 5, 10); i++) { var x0 = 520 + i * 16; s += '<path d="M' + x0 + ',0 Q' + (x0 + (r() - .5) * 30) + ',70 ' + (x0 + (r() - .5) * 20) + ',140" stroke="' + hs(c, moodCol(c, bk), -14) + '" stroke-width="' + (c.lvl === 3 ? 1.4 : 2) + '" fill="none" opacity=".6"/>'; } A(c, s); }
    A(c, shp(c, blob(600, 6, 380, 34, LOD(c, 8, 18, 30), .14, r), [96, 50, 30], { sm: 1, k: 1 }));
    if (c.lvl === 3) A(c, shp(c, blob(520, 0, 200, 22, 20, .2, r), [96, 50, 42], { sm: 1, op: .7 }));
    stumpHouse(c, 220, 130, 56, 40, 1); stumpHouse(c, 1000, 132, 56, 42, 0);
    ground(c, 2, 3, 132); fairies(c, 12, [70, 90, 80]); parts(c, 14, [70, 90, 70], 30, 120); frameLeaves(c, [96, 50, 18]);
  },
  /* Forest Temple: the ruined mansion, broken stair, and the four coloured torches */
  ftemple: function (c) {
    sky(c); pines(c, 0, 4, 100, 26, 50, 80, 0);
    var st = [140, 10, 46];
    A(c, shp(c, box(400, 30, 400, 86), st, { m: 'v', ol: 2 }));
    A(c, shp(c, [[380, 32], [600, -6], [820, 32]], [150, 18, 34], { ol: 2 }));
    for (var i = 0; i < 6; i++) A(c, shp(c, box(426 + i * 66, 40, 16, 76), [140, 8, 60], { m: 'h', ol: 1.5 }));
    A(c, shp(c, [[566, 116], [566, 66], [600, 48], [634, 66], [634, 116]], [140, 20, 10], { flat: 1, ol: 1.5 }));
    if (c.lvl >= 2) { var v = ''; for (i = 0; i < LOD(c, 0, 5, 10); i++) v += '<path class="sway" style="--sk:4deg;--sp:5s;animation-delay:-' + i + 's" d="M' + (420 + i * 38) + ',32 q-6,20 2,40 q6,16 -2,30" stroke="' + hs(c, moodCol(c, [110, 50, 34])) + '" stroke-width="' + (c.lvl === 3 ? 2 : 3) + '" fill="none"/>'; A(c, v); }
    [[300, [0, 90, 56]], [380, [220, 90, 60]], [820, [120, 80, 50]], [900, [280, 80, 60]]].forEach(function (t) { torch(c, t[0], 122, 28, t[1]); });
    for (i = 0; i < 4; i++) A(c, shp(c, box(470 + i * 18 - (i % 2) * 6, 116 + i * 6, 260 - i * 36, 6), [140, 8, 54], { ol: 1 }));
    ground(c, 3, 4, 134); fog(c, 90, 40, .45); frameLeaves(c);
  },
  /* Hyrule Field: rolling hills, a lone tree, the castle and the ranch far off */
  field: function (c) {
    sky(c); orb(c, c.A.m === 'dawn' ? 180 : 250, c.A.m === 'dawn' ? 80 : 34, 17); clouds(c);
    ridge(c, 0, 4, 84, 12);
    var cc = [226, 14, 70];
    rtower(c, 760, 82, 10, 26, cc, [220, 40, 40]); rtower(c, 790, 82, 14, 40, cc, [220, 40, 40]); rtower(c, 818, 82, 10, 22, cc, [220, 40, 40]);
    A(c, shp(c, box(330, 80, 40, 10), [6, 50, 50], { ol: 1 }) + shp(c, [[326, 80], [350, 70], [374, 80]], [8, 40, 30], { ol: 1 }));
    ridge(c, 1, 4, 100, 12);
    tree(c, 900, 118, 62, [104, 46, 34]);
    ridge(c, 2, 4, 116, 9);
    A(c, '<path d="M560,140 Q600,120 700,110 T940,96" stroke="' + hs(c, moodCol(c, [34, 40, 66])) + '" stroke-width="' + LOD(c, 14, 10, 8) + '" fill="none" opacity=".7"/>');
    ridge(c, 3, 4, 134, 5); fog(c, 80, 36, .35);
  },
  /* Lon Lon Ranch: the barn, the silo, the round corral and its horses */
  ranch: function (c) {
    sky(c); orb(c, 960, c.A.m === 'dusk' ? 80 : 32, 16); clouds(c);
    ridge(c, 0, 3, 92, 12);
    bld(c, 240, 112, 110, 44, [8, 56, 44], [16, 30, 26], { win: 1, rh: 34 });
    rtower(c, 380, 112, 34, 66, [36, 14, 74], [8, 40, 34]);
    bld(c, 860, 108, 70, 30, [36, 30, 70], [10, 50, 40], { smoke: 1 });
    ridge(c, 1, 3, 116, 6);
    var s = '', fc = [26, 40, 30];
    for (var k = 0; k <= LOD(c, 8, 16, 24); k++) { var a = k / LOD(c, 8, 16, 24) * Math.PI, fx = 600 - Math.cos(a) * 230, fy = 118 + Math.sin(a) * 10; s += '<rect x="' + n1(fx - 2) + '" y="' + n1(fy - 14) + '" width="' + LOD(c, 6, 4, 3.4) + '" height="18" fill="' + hs(c, moodCol(c, fc)) + '"/>'; }
    s += '<path d="M370,108 Q600,124 830,108 M370,114 Q600,130 830,114" stroke="' + hs(c, moodCol(c, fc)) + '" stroke-width="' + LOD(c, 4, 2.6, 2) + '" fill="none"/>';
    A(c, s);
    horse(c, 520, 120, 1.1, [26, 52, 36]); horse(c, 640, 122, 1, [30, 20, 82]);
    if (c.lvl >= 2) horse(c, 100, 126, .9, [24, 40, 24], 1);
    ridge(c, 2, 3, 136, 4); fog(c, 88, 40, .3);
  },
  /* Castle Town market: houses packed round the square, bunting, the castle above */
  town: function (c) {
    sky(c); orb(c, 190, 36, 16); clouds(c);
    var cc = [226, 14, 72], rc = [222, 44, 40];
    rtower(c, 560, 70, 18, 40, cc, rc, 1); rtower(c, 610, 70, 26, 58, cc, rc, 1); rtower(c, 660, 70, 18, 40, cc, rc, 1);
    A(c, shp(c, box(540, 54, 140, 18), cc, { ol: 1.5 }));
    var cols = [[30, 30, 76], [40, 26, 70], [20, 20, 80], [200, 14, 72]], roofs = [[6, 54, 42], [214, 40, 40], [30, 46, 36], [120, 30, 34]];
    for (var i = 0; i < 9; i++) { var x = 30 + i * 128 + (i > 3 ? 40 : 0); if (i === 4) continue; bld(c, x, 128, 84, 40 + (i % 3) * 8, cols[i % 4], roofs[(i + 1) % 4], { smoke: i % 3 === 0 }); }
    A(c, shp(c, blob(600, 122, 54, 9, LOD(c, 6, 12, 18), 0), [210, 10, 70], { sm: 1, k: 1 }) + shp(c, box(594, 96, 12, 24), [210, 10, 70], { ol: 1.5 }));
    if (c.lvl >= 2) { var b = ''; [[60, 520], [680, 1140]].forEach(function (p) { b += '<path d="M' + p[0] + ',72 Q' + ((p[0] + p[1]) / 2) + ',92 ' + p[1] + ',72" stroke="#5a4630" stroke-width="1" fill="none"/>'; for (var k = 1; k < 9; k++) { var t = k / 9, fx = p[0] + (p[1] - p[0]) * t, fy = 72 + Math.sin(t * Math.PI) * 10; b += '<polygon class="flag" points="' + pts([[fx, fy], [fx + 8, fy], [fx + 4, fy + 10]]) + '" fill="' + hs(c, [[0, 70, 54], [48, 90, 56], [210, 70, 54]][k % 3]) + '"/>'; } }); A(c, b); }
    floor(c, 128, [32, 20, 60]); fog(c, 90, 30, .2);
  },
  /* Hyrule Castle: the keep and its blue-roofed towers on the hill, the moat, the drawbridge */
  hcastle: function (c) {
    sky(c); orb(c, 980, 78, 18); clouds(c);
    ridge(c, 0, 3, 100, 12);
    var cc = [226, 12, 74], rc = [220, 46, 38];
    A(c, shp(c, [[300, 140], [380, 100], [820, 96], [900, 140]], [100, 34, 30], { m: 'v', ol: 2, sm: 0 }));
    var keep = function () {
      cwall(c, 430, 770, 100, 30, cc);
      rtower(c, 460, 100, 30, 70, cc, rc, 1); rtower(c, 740, 100, 30, 66, cc, rc, 1);
      rtower(c, 560, 72, 34, 56, cc, rc, 1); rtower(c, 640, 72, 40, 76, cc, rc, 1);
      A(c, shp(c, box(530, 46, 160, 30), cc, { ol: 2 }));
    };
    keep();
    A(c, shp(c, [[586, 100], [586, 84], [600, 76], [614, 84], [614, 100]], [24, 20, 14], { flat: 1, ol: 1.5 }));
    A(c, shp(c, [[586, 100], [614, 100], [622, 122], [578, 122]], [28, 40, 34], { ol: 1.5 }));
    waves(c, 120, 20, 2, 3);
    if (c.lvl >= 2) for (var i = 0; i < LOD(c, 0, 3, 6); i++) A(c, '<g class="fly f' + (i % 3) + '" style="animation-duration:' + (30 + i * 9) + 's;animation-delay:-' + i * 7 + 's"><path d="M0,' + (24 + i * 7) + ' q5,-5 10,0 q5,-5 10,0" stroke="#2a2a3a" stroke-width="1.3" fill="none"/></g>');
    fog(c, 96, 30, .3);
  },
  /* Kakariko: wooden houses on the slope, the windmill, the lookout tower, Death Mountain behind */
  village: function (c) {
    sky(c); orb(c, 150, 82, 20);
    volcano(c, 640, 100, 260, 64, [14, 34, 36]);
    ridge(c, 0, 3, 104, 8);
    rtower(c, 300, 116, 22, 60, [30, 36, 40], [24, 40, 30]);
    for (var k = 0; k < 5; k++) bld(c, 350 + k * 86, 124 - (k % 2) * 6, 58, 26 + (k % 3) * 6, [36, 40, 74], [22, 40, 32], { smoke: k % 2 === 0 });
    var mx = 880, mc = [30, 30, 50];
    A(c, shp(c, [[mx - 18, 128], [mx - 12, 60], [mx + 12, 60], [mx + 18, 128]], mc, { m: 'h', ol: 2 }));
    var bl = ''; for (var i = 0; i < 4; i++) { var a = i * Math.PI / 2; bl += '<polygon points="' + pts([[mx, 60], [mx + Math.cos(a - .12) * 44, 60 + Math.sin(a - .12) * 44], [mx + Math.cos(a + .12) * 44, 60 + Math.sin(a + .12) * 44]]) + '" fill="' + hs(c, moodCol(c, [36, 30, 76])) + '"' + (c.lvl === 2 ? ' stroke="#3a2a18" stroke-width="1.6"' : '') + '/>'; }
    A(c, '<g class="spin">' + bl + '</g>');
    A(c, shp(c, blob(640, 130, 22, 6, LOD(c, 6, 10, 16), 0), [30, 10, 60], { sm: 1, k: 1 }));
    ridge(c, 2, 3, 136, 4); fog(c, 86, 40, .3);
  },
  /* Graveyard: rows of headstones, the big royal stone, the keeper's hut, ghost lights */
  graves: function (c) {
    sky(c); orb(c, 930, 32, 17); clouds(c);
    ridge(c, 0, 3, 98, 10);
    bld(c, 180, 116, 70, 30, [30, 20, 40], [20, 20, 26], { win: 1, smoke: 1 });
    A(c, shp(c, box(560, 50, 90, 62), [250, 8, 50], { m: 'v', ol: 2 }) + shp(c, box(574, 60, 62, 6), [250, 8, 36], { flat: 1, ol: 0 }));
    deadTree(c, 360, 118, 70, lcol(c, 2, 3, 0)); deadTree(c, 1040, 120, 64, lcol(c, 2, 3, 0));
    ridge(c, 1, 3, 116, 4);
    var r = c.rs[2];
    for (var k = 0; k < LOD(c, 8, 14, 20); k++) { var x = 260 + k * (720 / LOD(c, 8, 14, 20)), y = 124 + (k % 3) * 5, w = 16 + r() * 8, h = 18 + r() * 12; A(c, shp(c, [[x, y], [x, y - h * .8], [x + w * .2, y - h], [x + w * .8, y - h], [x + w, y - h * .8], [x + w, y]], [260, 10, 66], { ol: 1.5 })); }
    fairies(c, 8, [200, 80, 76]); fog(c, 92, 48, .6);
  },
  /* Bottom of the Well: looking down a stone shaft, moonlight from the opening, wet bricks */
  well: function (c) {
    sky(c);
    var st = [92, 10, 36], s = '';
    for (var row = 0; row < LOD(c, 5, 9, 14); row++) { var y = row * 140 / LOD(c, 5, 9, 14), hh = 140 / LOD(c, 5, 9, 14); for (var k = 0; k < 16; k++) s += shp(c, box(k * 80 - (row % 2) * 40, y, 78, hh - 2), [92, 10, 30 + ((k + row) % 3) * 3], { ol: 1, nogl: 1 }); }
    A(c, s);
    A(c, shp(c, blob(600, 70, 170, 64, LOD(c, 8, 18, 30), 0), [100, 20, 6], { sm: 1, k: 1, flat: 1 }));
    A(c, shp(c, blob(600, 70, 170, 64, LOD(c, 8, 18, 30), 0), st, { sm: 1, k: 1, fill: 'none' }).replace('fill="none"', 'fill="none" stroke="' + hs(c, st, 8) + '" stroke-width="' + LOD(c, 10, 6, 5) + '"'));
    beams(c, [600], [200, 40, 84], 34);
    A(c, shp(c, blob(600, 116, 120, 12, LOD(c, 6, 12, 20), 0), [100, 30, 22], { sm: 1, k: 1 }));
    for (var i = 0; i < LOD(c, 0, 4, 8); i++) A(c, '<ellipse class="drip" cx="' + (420 + i * 50) + '" cy="20" rx="1.6" ry="2.6" fill="#b8ddd0" style="animation-delay:-' + i * .8 + 's"/>');
    fairies(c, 6, [96, 60, 70]);
  },
  /* Shadow Temple: a purple void, floating platforms, swinging blades, violet torches */
  shadow: function (c) {
    sky(c); parts(c, 18, [286, 60, 70], 10, 130);
    var st = [280, 14, 30];
    for (var i = 0; i < 4; i++) A(c, shp(c, box(140 + i * 270, 104 - (i % 2) * 16, 150, 16), st, { m: 'v', ol: 2 }));
    for (i = 0; i < LOD(c, 2, 3, 4); i++) { var bx = 300 + i * 220, bl = shp(c, box(bx - 1.5, -4, 3, 60), [220, 10, 50], { ol: 1 }) + shp(c, [[bx - 26, 56], [bx + 26, 56], [bx + 18, 74], [bx - 18, 74]], [220, 12, 70], { m: 'h', ol: 1.5, lit: 1 }); A(c, c.lvl >= 2 ? '<g class="swing" style="animation-delay:-' + i * .8 + 's">' + bl + '</g>' : bl); }
    [[160, 104], [420, 88], [700, 104], [960, 88]].forEach(function (p) { torch(c, p[0] + 20, p[1], 22, [276, 90, 64]); });
    fog(c, 90, 50, .5); fairies(c, 6, [286, 70, 80]);
  },
  /* Death Mountain Trail: red rock slopes, boulders, the ring of cloud on the summit */
  mountain: function (c) {
    sky(c); clouds(c);
    volcano(c, 620, 124, 300, 88, [14, 36, 40]);
    peaks(c, 1, 4, 124, 3, 30, 46, 0, 1);
    rock(c, 300, 128, 50, 34); rock(c, 880, 130, 40, 28); rock(c, 470, 132, 30, 20);
    ridge(c, 3, 4, 140, 6);
    if (c.lvl >= 2) for (var i = 0; i < LOD(c, 0, 1, 2); i++) A(c, '<g class="fly f' + i + '" style="animation-duration:' + (14 + i * 6) + 's"><circle class="tumble" cx="0" cy="' + (118 + i * 6) + '" r="' + (c.lvl === 3 ? 7 : 8) + '" fill="' + hs(c, [16, 24, 30]) + '"/></g>');
    fog(c, 70, 40, .3);
  },
  /* Goron City: tiers of rock ledges round a cavern, rope bridges, the big spinning urn */
  goron: function (c) {
    sky(c);
    var rc = [20, 40, 30];
    for (var t = 0; t < 4; t++) A(c, shp(c, blob(600, 40 + t * 26, 560 - t * 90, 14, LOD(c, 8, 16, 28), .02), [22, 46, 34 + t * 8], { sm: 1, k: 1, m: 'v' }));
    glow(c, 600, 118, 200, [30, 100, 60], .5);
    for (t = 0; t < 3; t++) for (var k = 0; k < 4; k++) { var dx = 200 + k * 240 + t * 20; if (c.lvl >= 2 || k % 2) A(c, shp(c, [[dx, 56 + t * 26], [dx, 44 + t * 26], [dx + 8, 38 + t * 26], [dx + 16, 44 + t * 26], [dx + 16, 56 + t * 26]], [20, 30, 10], { flat: 1, ol: 1 })); }
    bridge(c, 300, 560, 66, 10); bridge(c, 660, 920, 92, 8);
    var urn = shp(c, [[580, 128], [566, 112], [570, 96], [584, 88], [616, 88], [630, 96], [634, 112], [620, 128]], [28, 60, 50], { m: 'h', ol: 2 }) + (c.lvl >= 2 ? '<path d="M570,104 H630" stroke="' + hs(c, [0, 60, 40]) + '" stroke-width="3"/>' : '');
    A(c, c.lvl >= 2 ? '<g class="spin" style="animation-duration:6s">' + urn + '</g>' : urn);
    [[180, 62], [1020, 62], [300, 110], [900, 110]].forEach(function (p) { torch(c, p[0], p[1], 16); });
    floor(c, 128, [20, 40, 20]);
  },
  /* Dodongo's Cavern: the giant fossil skull with glowing eyes at the mountain's foot */
  dodongo: function (c) {
    sky(c);
    volcano(c, 600, 120, 520, 86, [14, 34, 30], 1);
    var bn = [40, 20, 72];
    A(c, shp(c, [[440, 140], [450, 100], [490, 66], [560, 54], [640, 54], [710, 66], [750, 100], [760, 140]], bn, { sm: c.lvl === 3 ? 1 : 0, ol: 2.4 }));
    A(c, shp(c, [[530, 140], [540, 104], [600, 92], [660, 104], [670, 140]], [10, 30, 8], { flat: 1, ol: 2 }));
    if (c.lvl >= 2) { var tt = ''; for (var i = 0; i < 6; i++) tt += '<polygon points="' + pts([[546 + i * 20, 104 - (i > 0 && i < 5 ? 6 : 0)], [556 + i * 20, 104 - (i > 0 && i < 5 ? 6 : 0)], [551 + i * 20, 118]]) + '" fill="' + hs(c, bn) + '"/>'; A(c, tt); }
    [[540, 80], [660, 80]].forEach(function (e) { A(c, shp(c, blob(e[0], e[1], 22, 12, LOD(c, 5, 10, 16), 0), [10, 20, 8], { sm: 1, k: 1, flat: 1 }) + '<circle class="pulse" cx="' + e[0] + '" cy="' + e[1] + '" r="' + LOD(c, 7, 6, 5) + '" fill="' + hs(c, [4, 100, 56]) + '"/>'); glow(c, e[0], e[1], 30, [4, 100, 56], .8); });
    rock(c, 300, 134, 70, 40); rock(c, 920, 134, 80, 44);
    lava(c, 132); parts(c, 20, [30, 100, 60], 30, 130);
  },
  /* Death Mountain Crater: a lava lake, the rope bridge, the temple gate at the back */
  crater: function (c) {
    sky(c);
    peaks(c, 0, 3, 112, 4, 70, 100, 0, 0);
    A(c, shp(c, box(560, 50, 80, 64), [10, 20, 18], { m: 'v', ol: 2 }) + shp(c, [[576, 114], [576, 76], [600, 64], [624, 76], [624, 114]], [14, 60, 30], { flat: 1, ol: 1.5 }));
    glow(c, 600, 90, 50, [20, 100, 56], .6);
    lava(c, 112);
    rock(c, 200, 140, 200, 40, [10, 20, 16]); rock(c, 1000, 140, 220, 44, [10, 20, 16]);
    bridge(c, 280, 920, 116, 14, [26, 36, 30]);
    for (var k = 0; k < LOD(c, 2, 4, 6); k++) flame(c, 120 + k * (960 / LOD(c, 2, 4, 6)), 140, 22);
    parts(c, 26, [34, 100, 62], 10, 130);
  },
  /* Fire Temple: obsidian pillars, hanging cages, jets of flame over lava */
  fire: function (c) {
    sky(c);
    var ob = [8, 20, 14];
    for (var i = 0; i < 6; i++) A(c, shp(c, box(80 + i * 210, 0, 40, 120), ob, { m: 'h', ol: 2 }));
    for (i = 0; i < LOD(c, 2, 3, 4); i++) { var cx = 220 + i * 260, cg = '<line x1="' + cx + '" y1="0" x2="' + cx + '" y2="40" stroke="' + hs(c, [30, 10, 40]) + '" stroke-width="' + LOD(c, 4, 2, 1.6) + '"' + (c.lvl >= 2 ? ' stroke-dasharray="4 2"' : '') + '/>' + shp(c, box(cx - 14, 40, 28, 30), [30, 14, 36], { fill: 'none' }).replace('fill="none"', 'fill="none" stroke="' + hs(c, [30, 14, 40]) + '" stroke-width="' + LOD(c, 5, 3, 2) + '"'); if (c.lvl >= 2) for (var b = 1; b < 4; b++) cg += '<line x1="' + (cx - 14 + b * 7) + '" y1="40" x2="' + (cx - 14 + b * 7) + '" y2="70" stroke="' + hs(c, [30, 14, 40]) + '" stroke-width="1.4"/>'; A(c, c.lvl >= 2 ? '<g class="swing" style="animation-duration:5s;animation-delay:-' + i + 's">' + cg + '</g>' : cg); }
    lava(c, 118);
    for (i = 0; i < LOD(c, 3, 5, 8); i++) flame(c, 140 + i * (920 / LOD(c, 3, 5, 8)), 140, 40 + (i % 2) * 20);
    parts(c, 30, [34, 100, 62], 10, 130);
  },
  /* Zora's River: a canyon, the river running at you, the waterfall into the domain at the back */
  river: function (c) {
    sky(c); orb(c, 980, 30, 16); clouds(c);
    var cl = [30, 26, 50];
    A(c, shp(c, [[-10, 0], [430, 0], [470, 60], [500, 140], [-10, 140]], cl, { m: 'h', ol: 2.4 }));
    A(c, shp(c, [[1210, 0], [770, 0], [730, 60], [700, 140], [1210, 140]], cl, { m: 'h', ol: 2.4 }));
    A(c, shp(c, [[430, 0], [770, 0], [730, 60], [470, 60]], [30, 26, 40], { flat: 1, ol: 0 }));
    waterfall(c, 600, 2, 62, 90);
    A(c, shp(c, [[470, 60], [730, 60], [760, 140], [440, 140]], [196, 60, 48], { m: 'v', ol: 0, lit: 0 }));
    var s = ''; for (var i = 0; i < LOD(c, 2, 4, 8); i++) s += '<path class="fall" d="M' + (520 + i * 22) + ',66 L' + (480 + i * 34) + ',140" stroke="#fff" stroke-opacity=".6" stroke-width="' + LOD(c, 4, 2, 1.2) + '" stroke-dasharray="14 26"/>'; A(c, s);
    if (c.lvl >= 2) { var sv = ''; for (var q = 1; q < LOD(c, 0, 4, 8); q++) { var yy = q * 140 / LOD(c, 0, 4, 8); sv += '<path d="M0,' + n1(yy) + ' L' + n1(430 + yy * .5) + ',' + n1(yy) + ' M' + n1(770 - yy * .5) + ',' + n1(yy) + ' L1200,' + n1(yy) + '" stroke="' + hs(c, moodCol(c, cl), -12) + '" stroke-width="1.2" opacity=".55"/>'; } A(c, sv); }
    tree(c, 330, 30, 40, [110, 46, 34]); tree(c, 880, 26, 44, [110, 46, 34]);
    rock(c, 520, 120, 30, 16, [30, 10, 50]); rock(c, 690, 130, 36, 18, [30, 10, 50]);
    if (c.lvl === 3) A(c, '<rect x="430" y="0" width="340" height="70" fill="' + lin(c, [[0, 'rgba(0,0,0,.25)'], [1, 'rgba(0,0,0,0)']]) + '"/>');
    fog(c, 60, 30, .3);
  },
  /* Zora's Domain: a blue cavern, the great waterfall into the pool, ledges round it */
  domain: function (c) {
    sky(c);
    var cv = [210, 30, 34];
    A(c, shp(c, [[-10, 0], [1210, 0], [1210, 140], [880, 140], [860, 40], [600, 14], [340, 40], [320, 140], [-10, 140]], cv, { m: 'v', ol: 2 }));
    waterfall(c, 600, 14, 116, 140, [196, 80, 80]);
    for (var t = 0; t < 3; t++) { A(c, shp(c, box(120 - t * 30, 50 + t * 28, 200, 10), [204, 30, 50], { ol: 1.5 })); A(c, shp(c, box(880 + t * 30, 50 + t * 28, 200, 10), [204, 30, 50], { ol: 1.5 })); }
    A(c, shp(c, blob(600, 126, 360, 16, LOD(c, 8, 16, 28), .02), [196, 70, 52], { sm: 1, k: 1, lit: 1 }));
    glints(c, 116, 20); bubbles(c, 16); glow(c, 600, 100, 160, [190, 90, 70], .4);
  },
  /* Jabu-Jabu's Belly: ribbed pink walls that pulse, bubbles, a membrane door */
  jabu: function (c) {
    sky(c);
    var fl = [344, 50, 46];
    var s = ''; for (var i = 0; i < LOD(c, 4, 7, 10); i++) { var x = i * 1200 / (LOD(c, 4, 7, 10) - 1); s += shp(c, [[x - 30, 140], [x - 20, 40], [x + 60, 6], [x + 80, 14], [x + 10, 50], [x, 140]], fl, { sm: c.lvl === 3 ? 1 : 0, ol: 2 }); }
    A(c, '<g class="beat">' + s + '</g>');
    A(c, '<g class="beat" style="animation-delay:-.5s">' + shp(c, blob(600, 76, 50, 46, LOD(c, 6, 14, 24), .04), [330, 40, 30], { sm: 1, k: 1 }) + shp(c, blob(600, 76, 30, 30, LOD(c, 6, 12, 20), .04), [350, 60, 60], { sm: 1, k: 1, op: .8 }) + '</g>');
    floor(c, 124, [346, 44, 40]); bubbles(c, 24); glow(c, 600, 76, 120, [330, 80, 70], .3); parts(c, 12, [330, 60, 80], 20, 120);
  },
  /* Zora's Fountain: high cliffs, open water, ice floes and the big fish resting by the shore */
  fountain: function (c) {
    sky(c); clouds(c);
    peaks(c, 0, 3, 96, 5, 40, 70, 1, 0);
    waves(c, 94, 46, 2, 3);
    A(c, shp(c, [[300, 108], [330, 84], [420, 70], [520, 80], [570, 100], [540, 116], [360, 118]], [210, 20, 64], { sm: 1, k: 1, ol: 2 }));
    A(c, shp(c, blob(440, 92, 7, 6, 8, 0), [0, 0, 10], { flat: 1, sm: 1, k: 1 }));
    for (var i = 0; i < LOD(c, 2, 3, 5); i++) A(c, shp(c, [[640 + i * 110, 112], [652 + i * 110, 102], [690 + i * 110, 100], [700 + i * 110, 112]], [196, 30, 90], { ol: 1.5, cls: 'bob b' + i }));
    fog(c, 80, 30, .4);
  },
  /* Ice Cavern: icicles, ice crystals, blue fire, falling snow */
  ice: function (c) {
    sky(c); stalac(c, LOD(c, 6, 10, 14), 22, 50, 3, true);
    A(c, shp(c, [[-10, 140], [-10, 60], [160, 30], [300, 70], [260, 140]], [200, 40, 60], { m: 'h', ol: 2 }) + shp(c, [[1210, 140], [1210, 50], [1040, 26], [900, 70], [940, 140]], [200, 40, 60], { m: 'h', ol: 2 }));
    crystals(c, LOD(c, 4, 7, 10), 4);
    [[360, 128], [840, 128]].forEach(function (p) { torch(c, p[0], p[1], 20, [200, 100, 62]); });
    floor(c, 128, [196, 40, 82]); fog(c, 80, 40, .5); parts(c, 20, [190, 100, 92], 20, 120);
  },
  /* Lake Hylia: the long bridges out to the island with its single tree, the lab on the shore */
  lake: function (c) {
    sky(c); orb(c, 300, 34, 18); clouds(c);
    ridge(c, 0, 3, 82, 8);
    waves(c, 88, 52, 2, 3);
    var isl = function () { A(c, shp(c, blob(760, 98, 60, 9, LOD(c, 6, 12, 20), .04), [100, 40, 40], { sm: 1, k: 1 })); tree(c, 760, 98, 56, [104, 44, 34]); };
    reflect(c, 100, isl); isl();
    bridge(c, 470, 700, 102, 2); bridge(c, 820, 1060, 104, 2);
    bld(c, 290, 104, 70, 28, [30, 20, 74], [214, 30, 40], { win: 2 });
    A(c, shp(c, blob(350, 74, 16, 12, LOD(c, 5, 10, 16), 0).filter(function (p) { return p[1] <= 76; }).concat([[366, 76], [334, 76]]), [214, 30, 60], { sm: 0, ol: 1.5 }));
    if (c.lvl === 3) A(c, '<g class="fly f2" style="animation-duration:9s"><path d="M0,110 q20,-24 40,0" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/></g>');
    fog(c, 80, 24, .3);
  },
  /* Water Temple: under the lake, a stone tower, the water line above, bubbles and light ripples */
  wtemple: function (c) {
    sky(c);
    var st = [204, 30, 40];
    for (var i = 0; i < 6; i++) A(c, shp(c, box(80 + i * 200, 30, 34, 110), st, { m: 'h', ol: 2 }));
    A(c, shp(c, box(530, 10, 140, 130), [204, 34, 46], { m: 'h', ol: 2.4 }) + shp(c, [[574, 140], [574, 96], [600, 80], [626, 96], [626, 140]], [210, 40, 14], { flat: 1, ol: 1.5 }));
    A(c, shp(c, [[560, 40], [600, 26], [640, 40], [630, 56], [570, 56]], [200, 30, 60], { ol: 1.5 }));
    if (c.lvl >= 2) A(c, '<g class="drift d1"><path d="M0,18 Q150,10 300,18 T600,18 T900,18 T1200,18" stroke="#cdeeff" stroke-width="' + (c.lvl === 3 ? 1.6 : 2.6) + '" fill="none" opacity=".7"/></g>');
    beams(c, [220, 600, 980], [190, 80, 80], 16);
    bubbles(c, 26); floor(c, 128, [204, 30, 32]);
  },
  /* Gerudo Valley: the canyon, the rope bridge over the gorge, the waterfall, the carpenters' tents */
  valley: function (c) {
    sky(c); orb(c, 600, 40, 20);
    var cl = [24, 50, 50];
    A(c, shp(c, [[-10, 30], [200, 40], [420, 62], [470, 140], [-10, 140]], cl, { m: 'h', ol: 2.4 }));
    A(c, shp(c, [[1210, 26], [1000, 40], [780, 60], [730, 140], [1210, 140]], cl, { m: 'h', ol: 2.4 }));
    waterfall(c, 600, 70, 140, 40, [196, 70, 70]);
    bridge(c, 420, 780, 62, 10, [30, 40, 46]);
    [[120, 40, [0, 60, 50]], [220, 46, [36, 70, 60]]].forEach(function (t) { A(c, shp(c, [[t[0] - 22, t[1]], [t[0], t[1] - 22], [t[0] + 22, t[1]]], t[2], { ol: 1.5 })); });
    rock(c, 300, 140, 120, 30, [24, 40, 40]);
    fog(c, 90, 40, .3);
  },
  /* Gerudo Fortress: sandstone halls cut into the cliff, ladders, torches, flags */
  fortress: function (c) {
    sky(c); orb(c, 260, 80, 18);
    ridge(c, 0, 3, 90, 10);
    var ss = [30, 46, 58];
    A(c, shp(c, [[260, 140], [270, 40], [520, 20], [800, 24], [940, 44], [950, 140]], ss, { m: 'h', ol: 2.4 }));
    for (var row = 0; row < 3; row++) for (var k = 0; k < 5; k++) { var dx = 330 + k * 120 + row * 20, dy = 70 + row * 28; A(c, shp(c, [[dx, dy + 18], [dx, dy + 4], [dx + 10, dy - 4], [dx + 20, dy + 4], [dx + 20, dy + 18]], [20, 30, 12], { flat: 1, ol: 1 })); }
    for (k = 0; k < LOD(c, 2, 4, 6); k++) { var lx = 380 + k * 100, ls = '<rect x="' + lx + '" y="40" width="2" height="40" fill="' + hs(c, [30, 40, 30]) + '"/><rect x="' + (lx + 10) + '" y="40" width="2" height="40" fill="' + hs(c, [30, 40, 30]) + '"/>'; for (var rr = 0; rr < 5; rr++) ls += '<rect x="' + lx + '" y="' + (44 + rr * 8) + '" width="12" height="1.6" fill="' + hs(c, [30, 40, 30]) + '"/>'; if (c.lvl >= 2) A(c, ls); }
    [[300, 40], [920, 46]].forEach(function (p) { torch(c, p[0], p[1] + 100, 18); flag(c, p[0], p[1]); });
    ridge(c, 2, 3, 138, 4); dust(c);
  },
  /* Haunted Wasteland: a sandstorm, the line of flag poles, the river of sand */
  waste: function (c) {
    sky(c); orb(c, 900, 50, 20);
    ridge(c, 0, 3, 90, 12, 0); ridge(c, 1, 3, 108, 10, 3);
    A(c, '<path d="M0,120 Q300,110 600,122 T1200,118 L1200,128 Q900,132 600,130 T0,130 Z" fill="' + hs(c, [36, 50, 46]) + '"/>');
    if (c.lvl >= 2) A(c, '<g class="drift d0"><path d="M0,124 Q300,116 600,126 T1200,122" stroke="' + hs(c, [40, 60, 70]) + '" stroke-width="1.4" fill="none" stroke-dasharray="20 14"/></g>');
    for (var k = 0; k < 6; k++) { var x = 160 + k * 180, y = 112 - (k % 2) * 8; A(c, '<rect x="' + x + '" y="' + (y - 40) + '" width="' + LOD(c, 4, 2.6, 2) + '" height="40" fill="' + hs(c, [30, 30, 30]) + '"/>'); flag(c, x + 1, y - 40 + 17); }
    ridge(c, 2, 3, 138, 6, 5);
    dust(c); dust(c);
    if (c.lvl >= 2) A(c, '<rect class="pulse" width="1200" height="140" fill="' + hs(c, [40, 60, 70], 0, c.lvl === 3 ? .18 : .12) + '"/>');
  },
  /* Desert Colossus: the giant seated statue, palms at the oasis, dunes */
  desert: function (c) {
    sky(c); orb(c, 900, 34, 22); clouds(c);
    ridge(c, 0, 3, 98, 8, 0);
    statue(c, 600, 130, .8);
    palm(c, 300, 124, 50); palm(c, 360, 128, 40); palm(c, 880, 126, 46);
    A(c, shp(c, blob(330, 128, 60, 6, 10, 0), [196, 60, 56], { sm: 1, k: 1, lit: 1 }));
    ridge(c, 2, 3, 136, 6, 5); dust(c);
  },
  /* Spirit Temple: inside the statue, a sunbeam bouncing off mirrors */
  spirit: function (c) {
    sky(c);
    var ss = [30, 40, 46];
    for (var i = 0; i < 5; i++) A(c, shp(c, box(60 + i * 260, 0, 60, 140), ss, { m: 'h', ol: 2 }));
    statue(c, 600, 140, .9);
    [[330, 60], [870, 60]].forEach(function (m) { A(c, shp(c, blob(m[0], m[1], 22, 22, LOD(c, 6, 12, 20), 0), [48, 30, 80], { sm: 1, k: 1, lit: 1 })); glow(c, m[0], m[1], 30, [48, 100, 80], .7); });
    A(c, '<g class="pulse"><path d="M1200,0 L870,60 L600,74 L330,60" stroke="' + (c.lvl === 1 ? '#ffe9a0' : hs(c, [50, 100, 82])) + '" stroke-width="' + LOD(c, 8, 4, 3) + '" fill="none"/></g>');
    floor(c, 126, [30, 40, 38], 1); parts(c, 20, [44, 100, 76], 10, 130);
  },
  /* Ganon's Castle: the tower over a lava pit, the rainbow bridge, the storm and its lightning */
  ganon: function (c) {
    sky(c); parts(c, 8, [50, 100, 70], 20, 100);
    lightning(c, 300); if (c.lvl === 3) lightning(c, 1000);
    var gc = [275, 14, 18];
    glow(c, 600, 130, 220, [20, 100, 50], .55);
    A(c, shp(c, [[440, 112], [470, 70], [730, 70], [760, 112], [600, 132]], [10, 20, 16], { ol: 2 }));
    rtower(c, 520, 80, 28, 60, gc, [280, 20, 12]); rtower(c, 600, 80, 44, 90, gc, [280, 20, 12]); rtower(c, 680, 80, 28, 56, gc, [280, 20, 12]);
    A(c, shp(c, box(500, 54, 200, 28), gc, { ol: 2 }));
    var rb = [[0, 90, 60], [30, 100, 60], [54, 100, 62], [120, 70, 50], [200, 90, 60], [270, 70, 62]], s = '';
    rb.forEach(function (col, i) { s += '<path d="M' + (220 - i * 2) + ',' + (132 + i * 2) + ' Q350,' + (64 + i * 3) + ' 480,' + (100 + i * 2) + '" stroke="' + hs(c, col, 0) + '" stroke-width="' + LOD(c, 4, 3, 2.6) + '" fill="none"' + (c.lvl === 3 ? ' opacity=".85"' : '') + '/>'; });
    A(c, c.lvl >= 2 ? '<g class="pulse">' + s + '</g>' : s);
    lava(c, 128, 14); rain(c); fog(c, 90, 40, .4);
  },
  /* Temple of Time: the hall, tall windows, light falling on the pedestal and the open door */
  tot: function (c) {
    sky(c);
    var wl = [214, 10, 70];
    A(c, shp(c, box(-10, 0, 1220, 120), wl, { m: 'v', ol: 0 }));
    for (var i = 0; i < 6; i++) { var wx = 120 + i * 200 - (i > 2 ? 0 : 0); if (i === 2 || i === 3) continue; A(c, shp(c, [[wx, 100], [wx, 30], [wx + 20, 10], [wx + 40, 30], [wx + 40, 100]], [214, 30, 30], { flat: 1, ol: 2 })); if (c.lvl >= 2) A(c, shp(c, [[wx + 6, 96], [wx + 6, 32], [wx + 20, 16], [wx + 34, 32], [wx + 34, 96]], [200, 60, 64], { lit: 1, ol: 1 })); }
    A(c, shp(c, [[530, 120], [530, 30], [600, -4], [670, 30], [670, 120]], [214, 14, 50], { m: 'h', ol: 2 }) + shp(c, [[550, 120], [550, 40], [600, 14], [650, 40], [650, 120]], [48, 90, 84], { lit: 1, ol: 1 }));
    beams(c, [240, 600, 960], [48, 100, 86], 22);
    floor(c, 120, [214, 10, 46], 1);
    A(c, shp(c, box(580, 108, 40, 14), [214, 10, 76], { ol: 1.5 }) + shp(c, [[598, 108], [598, 80], [600, 74], [602, 80], [602, 108]], [200, 20, 86], { lit: 1, ol: 1 }) + shp(c, box(592, 86, 16, 3), [44, 60, 50], { ol: 0 }));
    glow(c, 600, 96, 50, [48, 100, 86], .7); parts(c, 18, [48, 100, 86], 10, 120);
  },
  /* side quests by era: the world changes as you go */
  e1: function (c) { SC3.field(c); fairies(c, 4); },
  e2: function (c) { SC3.village(c); },
  e3: function (c) {
    sky(c); orb(c, 300, 40, 14); ridge(c, 0, 3, 96, 10);
    var cc = [226, 8, 30];
    rtower(c, 600, 74, 30, 60, cc, [280, 20, 14]);
    for (var i = 0; i < 7; i++) { var x = 60 + i * 160; bld(c, x, 126, 90, 30 + (i % 2) * 10, [20, 10, 30], [10, 10, 20], { win: 0, door: 0 }); A(c, shp(c, [[x + 20, 126 - 30], [x + 50, 126 - 50 - (i % 2) * 10], [x + 70, 126 - 32]], [10, 10, 10], { flat: 1, ol: 0 })); flame(c, x + 45, 128, 18); }
    floor(c, 126, [20, 10, 24]); parts(c, 20, [24, 100, 60], 30, 130); fog(c, 80, 40, .4);
  },
  e4: function (c) { SC3.ranch(c); },
  e5: function (c) {
    sky(c); lightning(c, 900);
    ridge(c, 0, 3, 100, 10);
    var gc = [275, 14, 14];
    rtower(c, 600, 96, 34, 70, gc, [280, 20, 10]); rtower(c, 560, 96, 18, 40, gc, [280, 20, 10]); rtower(c, 640, 96, 18, 44, gc, [280, 20, 10]);
    glow(c, 600, 100, 120, [20, 100, 50], .5);
    ridge(c, 2, 3, 130, 8); rain(c); fog(c, 90, 40, .4);
  },
  /* items: medallions on a ring and the three stones */
  relics: function (c) {
    sky(c);
    column(c, 70, 132, 24, 110, lcol(c, 1, 3, 0)); column(c, 1130, 132, 24, 110, lcol(c, 1, 3, 0));
    var cols = [[128, 60, 50], [4, 70, 52], [214, 70, 54], [30, 84, 54], [280, 50, 52], [52, 90, 56]];
    for (var k = 0; k < 6; k++) { var a = Math.PI * (.1 + .8 * k / 5); A(c, '<g class="bob b' + (k % 4) + '">'); discAt(c, 600 - Math.cos(a) * 330, 100 - Math.sin(a) * 70, 17, cols[k]); A(c, '</g>'); }
    [[520, [130, 80, 46]], [600, [354, 80, 50]], [680, [210, 90, 56]]].forEach(function (g, i) {
      A(c, '<g class="bob b' + i + '">' + shp(c, [[g[0], 70], [g[0] + 16, 84], [g[0] + 10, 108], [g[0] - 10, 108], [g[0] - 16, 84]], g[1], { lit: 1, ol: 2 }) + shp(c, box(g[0] - 14, 106, 28, 8), [44, 70, 50], { ol: 1.5 }) + '</g>');
      glow(c, g[0], 90, 34, g[1], .6);
    });
    floor(c, 124, lcol(c, 2, 3, 0)); fog(c, 86, 40, .35); parts(c, 20, c.M.o, 20, 120);
  },
  /* bottles: a shop shelf of potions, milk and a bottled fairy */
  shelf: function (c) {
    sky(c);
    var wood = [28, 42, 38], cols = [[0, 80, 50], [130, 60, 46], [214, 80, 54], [48, 10, 94], [190, 60, 80], [280, 50, 50]];
    for (var k = 0; k < 2; k++) {
      var y = 62 + k * 52;
      for (var j = 0; j < 12; j++) { bottleAt(c, 90 + j * 90 + (k ? 40 : 0), y, 34 + ((j + k) % 3) * 6, cols[(j * 3 + k * 2) % 6]); if ((j + k) % 5 === 2) { glow(c, 90 + j * 90 + (k ? 40 : 0), y - 16, 22, [190, 90, 86], .8); A(c, '<circle class="twk t' + (j % 4) + '" cx="' + (90 + j * 90 + (k ? 40 : 0)) + '" cy="' + (y - 16) + '" r="' + LOD(c, 4, 3, 2.4) + '" fill="#fff"/>'); } }
      A(c, shp(c, box(-10, y, 1220, 7), wood, { ol: 1.5, m: 'v' }));
    }
    lights(c, 600, 70, 180, [44, 90, 70]); fog(c, 80, 40, .22); parts(c, 16, [44, 90, 70], 10, 120);
  },
  /* songs: a stave over Hyrule, notes drifting along it, an ocarina (child) or a harp (adult) */
  songc: function (c) { songsScene(c, 0); },
  songa: function (c) { songsScene(c, 1); }
};
function songsScene(c, adult) {
  sky(c); if (!c.M.stars) { orb(c, 990, 36, 16); clouds(c); }
  ridge(c, 0, 3, 112, 10); ridge(c, 1, 3, 126, 7);
  var k, s = '', r = c.rs[2], ink = adult ? [44, 40, 86] : [26, 30, 26], nc = adult ? [44, 86, 76] : [22, 40, 22];
  for (k = 0; k < 5; k++) s += '<rect x="0" y="' + (30 + k * 12) + '" width="1200" height="' + (c.lvl === 1 ? 3 : 1.6) + '" fill="' + hs(c, ink) + '" opacity="' + (c.lvl === 3 ? .7 : .85) + '"/>';
  A(c, s);
  for (k = 0; k < LOD(c, 6, 9, 12); k++) { var y = 30 + Math.floor(r() * 9) * 6; A(c, '<g class="bob b' + (k % 4) + '">'); noteAt(c, 60 + k * (1080 / LOD(c, 6, 9, 12)) + (r() - .5) * 20, y, y > 54, nc); A(c, '</g>'); }
  if (!adult) {
    A(c, '<g class="bob b2">' + shp(c, blob(600, 104, 30, 18, LOD(c, 6, 14, 22), 0), [200, 70, 50], { sm: 1, k: 1, ol: 2 }) + shp(c, [[574, 96], [556, 86], [560, 82], [580, 92]], [200, 70, 46], { ol: 1.5 }) + [[592, 100], [604, 98], [616, 102], [598, 110], [610, 112]].map(function (h) { return '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="' + LOD(c, 3, 2.4, 2) + '" fill="' + hs(c, [210, 60, 18]) + '"/>'; }).join('') + '</g>');
    glow(c, 600, 104, 60, [200, 90, 70], .5);
  } else {
    var hp = shp(c, [[576, 126], [572, 80], [590, 70], [624, 76], [630, 92], [620, 126]], [44, 70, 50], { fill: 'none' }).replace('fill="none"', 'fill="none" stroke="' + hs(c, [44, 80, 58]) + '" stroke-width="' + LOD(c, 6, 4, 3.4) + '"');
    for (k = 0; k < LOD(c, 3, 5, 7); k++) hp += '<line x1="' + (582 + k * 6) + '" y1="' + (80 + k) + '" x2="' + (582 + k * 6) + '" y2="122" stroke="#fff" stroke-opacity=".8" stroke-width="' + LOD(c, 2, 1.2, .8) + '"/>';
    A(c, '<g class="bob b1">' + hp + '</g>'); glow(c, 600, 100, 60, [44, 100, 70], .5);
  }
  ridge(c, 2, 3, 136, 5); fog(c, 90, 36, .3);
}
/* the Desert Colossus statue: seated, hands on knees, a headdress (simple blocks, no face) */
function statue(c, cx, base, s) {
  var st = [32, 40, 56], P = function (L) { return L.map(function (p) { return [cx + p[0] * s, base + p[1] * s]; }); };
  A(c, shp(c, P([[-90, 0], [-90, -20], [90, -20], [90, 0]]), st, { ol: 2 }));
  A(c, shp(c, P([[-70, -20], [-70, -56], [-20, -60], [-20, -20]]), st, { m: 'h', ol: 2 }) + shp(c, P([[20, -20], [20, -60], [70, -56], [70, -20]]), st, { m: 'h', ol: 2 }));
  A(c, shp(c, P([[-40, -60], [-44, -100], [44, -100], [40, -60]]), st, { m: 'h', ol: 2 }));
  A(c, shp(c, P([[-44, -98], [-66, -70], [-60, -60], [-38, -82]]), st, { ol: 1.6 }) + shp(c, P([[44, -98], [66, -70], [60, -60], [38, -82]]), st, { ol: 1.6 }));
  A(c, shp(c, P([[-18, -100], [-20, -124], [-6, -134], [6, -134], [20, -124], [18, -100]]), st, { m: 'h', ol: 2 }));
  A(c, shp(c, P([[-30, -112], [-26, -140], [0, -150], [26, -140], [30, -112], [18, -124], [-18, -124]]), [40, 60, 46], { ol: 1.6 }));
  A(c, shp(c, P([[-12, 0], [-12, -14], [0, -20], [12, -14], [12, 0]]), [20, 30, 10], { flat: 1, ol: 1.5 }));
}


/* tunics: the forest green, the fire red and the water blue, with the heavy and the floating boots */
SC.wardrobe = function (c) {
  sky(c);
  var rail = [28, 36, 30], k, tc = [[120, 54, 36], [4, 66, 46], [212, 64, 48]];
  A(c, shp(c, box(60, 22, 1080, 5), rail, { ol: 1 }) + shp(c, box(60, 22, 5, 116), rail, { ol: 1 }) + shp(c, box(1135, 22, 5, 116), rail, { ol: 1 }));
  for (k = 0; k < 6; k++) { A(c, '<g class="sway" style="--sk:1.6deg;--sp:' + (4 + k * .4) + 's;transform-origin:50% 0">'); tunicAt(c, 170 + k * 172, 32, 40, tc[k % 3]); A(c, '</g>'); }
  ground(c, 2, 3, 120);
  for (k = 0; k < 5; k++) {
    var hov = k % 2 === 1, col = hov ? [30, 50, 50] : [220, 8, 40];
    bootAt(c, 130 + k * 224, 124, 30, col); bootAt(c, 176 + k * 224, 124, 30, col);
    if (hov) { A(c, '<g class="bob b' + (k % 4) + '">' + shp(c, [[150 + k * 224, 100], [130 + k * 224, 88], [150 + k * 224, 94], [170 + k * 224, 86]], [48, 90, 60], { ol: 1.2, lit: 1 }) + '</g>'); glow(c, 152 + k * 224, 116, 34, [190, 90, 80], .5); }
  }
  fog(c, 96, 36, .25); parts(c, 12, [40, 80, 70], 30, 110);
};
/* strength, swimming and defense: a silver boulder to lift, the diving lake with a scale glinting, the stone mask of the bracelet */
SC.trial = function (c) {
  sky(c); orb(c, 930, 34, 17); clouds(c);
  peaks(c, 0, 3, 100, 4, 56, 84, 1, 0); ridge(c, 1, 3, 112, 8);
  pines(c, 2, 3, 112, 8, 18, 30, 2);
  A(c, shp(c, blob(780, 122, 150, 14, LOD(c, 8, 16, 26), .03), [204, 64, 50], { sm: 1, k: 1, lit: 1, ol: 2 })); glints(c, 112, 20);
  A(c, shp(c, blob(420, 104, 70, 46, LOD(c, 7, 14, 24), .08, c.rs[2]), [220, 10, 72], { sm: 1, k: 1, ol: 2.4, lit: 1 }));
  if (c.lvl >= 2) A(c, '<path d="M380,80 Q420,64 462,82" stroke="#fff" stroke-opacity=".6" stroke-width="' + (c.lvl === 3 ? 2 : 3) + '" fill="none"/>');
  cshadow(c, 420, 140, 60);
  var sc = shp(c, [[780, 98], [796, 104], [790, 120], [776, 124], [768, 110]], [48, 90, 58], { ol: 1.5, lit: 1 });
  A(c, '<g class="bob b2">' + sc + '</g>'); glow(c, 782, 110, 40, [48, 100, 70], .7);
  A(c, '<g class="spin" style="animation-duration:12s">' + shp(c, blob(640, 60, 26, 26, LOD(c, 6, 14, 22), 0), [36, 80, 52], { sm: 1, k: 1, fill: 'none' }).replace('fill="none"', 'fill="none" stroke="' + hs(c, [40, 80, 56]) + '" stroke-width="' + LOD(c, 8, 6, 5) + '"') + '</g>');
  fog(c, 90, 30, .3);
};

/* every place in the list draws its own scene */
Object.keys(SC3).forEach(function (k) { SC[k] = SC3[k]; });
/* the world's small life also knows the new places */
GRASSY = { field: 1, ranch: 1, forest: 1, woods: 1, graves: 1, meadow: 1, deku: 1, e1: 1, e4: 1, ftemple: 1 };
LEAFY = { field: 1, ranch: 1, forest: 1, woods: 1, meadow: 1, deku: 1, ftemple: 1, e1: 1, e4: 1, lake: 1 };
OUTD = { field: 1, ranch: 1, forest: 1, woods: 1, village: 1, graves: 1, lake: 1, meadow: 1, town: 1, e1: 1, e4: 1 };
function life(c) {
  var k = c.A.k;
  if (c.lvl < 2) return;
  if (GRASSY[k]) grass(c);
  if (LEAFY[k]) leaves(c);
  if (OUTD[k] && (c.M.stars || c.M.L < -12)) wisps(c);
  else if (c.M.orb && (k === 'field' || k === 'ranch' || k === 'meadow' || k === 'lake' || k === 'e1')) bflies(c);
  if (k === 'ice') snow(c);
  if (k === 'desert' || k === 'valley') dust(c);
}

/* Switch 2 haze is lighter so the detail reads through it */
var fog0 = fog;
fog = function (c, y, h, a) { fog0(c, y, h, c.lvl === 3 ? a * .5 : a); };


/* ---------- each picture as a self-contained image ----------
   The picture's motion rules are copied from the page's stylesheet into the image itself (for this console only), so the
   image animates on its own and the page holds a single element per picture instead of hundreds. */
var bannerCSS = {}, bannerURLs = {};
function collectBannerCSS(ver) {
  if (bannerCSS[ver]) return bannerCSS[ver];
  var out = [];
  function tr(sel) {
    var res = [];
    sel.split(',').forEach(function (p) {
      p = p.trim();
      var m = p.match(/^body\[data-ver="(\w+)"\]\s+(.*)$/), m2 = p.match(/^body:not\(\[data-ver="(\w+)"\]\)\s+(.*)$/);
      if (m) { if (m[1] !== ver) return; p = m[2]; }
      else if (m2) { if (m2[1] === ver) return; p = m2[2]; }
      if (p.indexOf('.banner') !== 0 || /^\.banner\s+(svg|img)\b/.test(p)) return;
      /* N64: sparkles, glows, drifting bits and smoke hold still (only a few big things move) */
      if (ver === 'n64' && /\.(twk|pulse|wisp|lf|wob|tumble|ember|smoke)\b/.test(p)) return;
      res.push(p === '.banner' ? 'svg' : p.replace(/^\.banner\s+/, ''));
    });
    return res.length ? res.join(',') : null;
  }
  function walk(rules, into) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.type === 1) { var t = tr(r.selectorText); if (t) into.push(t + '{' + r.style.cssText + '}'); }
      else if (r.type === 7) into.push(r.cssText);
      else if (r.type === 4) { var inner = []; walk(r.cssRules, inner); if (inner.length) into.push('@media ' + r.conditionText + '{' + inner.join('') + '}'); }
    }
  }
  for (var k = 0; k < document.styleSheets.length; k++) { try { walk(document.styleSheets[k].cssRules, out); } catch (e) {} }
  return (bannerCSS[ver] = out.join('\n'));
}
function bannerURL(name, ver) {
  /* an image can't see the reduce-motion setting itself, so it is decided here */
  var rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var key = keyFor(name), ck = key + '|' + ver + (rm ? '|still' : '');
  if (bannerURLs[ck]) return bannerURLs[ck];
  var s = svgFor(key, ver).replace(/§/g, 'b_');
  var css = collectBannerCSS(ver);
  if (rm) css = css.replace(/animation[a-z-]*\s*:[^;}]*;?/g, '');
  s = s.replace(/(<svg[^>]*>)/, '$1<style><![CDATA[' + css + ']]></style>');
  var url;
  try { url = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' })); }
  catch (e) { url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); }
  return (bannerURLs[ck] = url);
}
