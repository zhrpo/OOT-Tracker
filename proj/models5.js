/* ================= item models, edition 5 =================
   Every tab icon and every Items-tab picture is built from these models, drawn from scratch so each object reads as
   the familiar game item by its shape, colours and materials (my own drawings: no game models, crests or emblems).
   Each model lives in a 48 x 48 box and is rendered by the toolkit at the N64, 3DS or Switch 2 level. */
var M5 = {};
function m5rr(x, y, w, h, r, n) { /* rounded rectangle ring */
  var P = [], q = n || 4, cs = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
  cs.forEach(function (c) { for (var i = 0; i <= q; i++) { var a = c[2] + i / q * Math.PI / 2; P.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } });
  return P;
}
/* ---- ocarinas: the pale clay Fairy Ocarina and the deep-blue Ocarina with a silver mouthpiece ---- */
M5.ocarina = function (K, adult) {
  var b = '', col = adult ? [218, 78, 42] : [32, 44, 70], hole = adult ? [222, 70, 12] : [26, 40, 26];
  var body = i4ring(function (t) { var x = Math.sin(t) * 16.5, y = -Math.cos(t) * 12.5; if (x > 0) y *= 1 - x / 80; return [x, y]; }, 40);
  body = i4xf(body, 22, 29, .32);
  b += K.part(i4xf(m5rr(-3.2, -10, 6.4, 13, 3), 34.4, 20.6, .95), adult ? [210, 10, 84] : [30, 40, 62], { n: 6, ex: [.8, 1] });
  b += K.part(body, col, { n: 10, ex: [1.4, 2] });
  if (adult) b += K.part(i4xf(m5rr(-4, -1.6, 8, 3.2, 1.4), 32.2, 23.4, .95), [210, 14, 88], { n: 4, w: .9 });
  [[13.6, 24.2, 2.1], [19.4, 23, 2.2], [25.4, 24.4, 2.2], [31, 27.6, 2], [17.6, 31.4, 2], [24.6, 33, 2]].forEach(function (h) { b += K.hole(h[0], h[1], h[2], hole); });
  if (K.lvl >= 2) b += '<path d="M9,33 Q20,41.4 34,36" stroke="' + K.H(adult ? [214, 40, 82] : [26, 40, 52]) + '" stroke-width="' + (K.lvl === 3 ? 1 : 1.4) + '" fill="none" stroke-linecap="round" opacity=".8"/>';
  b += K.spec(15, 21.6, 4.4, 1.8, 14);
  return b;
};
/* ---- the gold spider: round gold body with a dark skull face on its back, arched legs, red eyes ---- */
M5.gspider = function (K) {
  var b = '', g = [46, 92, 54], dk = [26, 64, 20];
  [[[18, 25], [10, 13], [4, 19]], [[17, 28], [7, 21], [2, 29]], [[17, 32], [7, 31], [3, 40]], [[19, 35], [11, 40], [9, 47]]].forEach(function (L) {
    b += K.tube(L, K.lvl === 1 ? 2.4 : 2, g, { straight: 1 }) + K.tube(L.map(function (p) { return [48 - p[0], p[1]]; }), K.lvl === 1 ? 2.4 : 2, g, { straight: 1 });
  });
  b += K.part(i4ell(24, 31, 11.5, 12.5, 0, 36), g, { n: 9, ex: [.8, 1.2] });
  b += K.part(i4ell(24, 15.6, 6.4, 5.4, 0, 24), g, { n: 7 });
  b += K.part([[16.6, 28], [18, 22.6], [24, 20.6], [30, 22.6], [31.4, 28], [29.6, 33.4], [27.4, 34], [27.4, 38.2], [20.6, 38.2], [20.6, 34], [18.4, 33.4]], dk, { n: 11, flat: 1, w: .7, noRim: 1 });
  b += K.part(i4ell(20.8, 27.6, 2.6, 2.9, 0, 14), g, { n: 6, flat: 1, w: .5, noRim: 1 }) + K.part(i4ell(27.2, 27.6, 2.6, 2.9, 0, 14), g, { n: 6, flat: 1, w: .5, noRim: 1 });
  b += K.part([[24, 30.4], [25.2, 33], [22.8, 33]], g, { n: 3, flat: 1, w: .4, noRim: 1 });
  if (K.lvl >= 2) b += '<path d="M22.4,34.4 V37.6 M24,34.4 V37.8 M25.6,34.4 V37.6" stroke="' + K.H(g) + '" stroke-width=".7"/>';
  b += K.hole(21.6, 15, 1.3, [0, 80, 46]) + K.hole(26.4, 15, 1.3, [0, 80, 46]);
  b += K.spec(18.6, 24, 3.4, 1.4, -30);
  return b;
};
/* ---- heart pieces: a thick glassy quarter of a heart, and a whole heart container with a clear rim ---- */
M5.heartPiece = function (K) {
  var cx0 = 27, cy0 = 30, H0 = i4heart(cx0, cy0, 26, 160), Q = [], i;
  H0.forEach(function (p, j) { if (p[0] <= cx0 + .01 && p[1] <= cy0) Q.push([p, j]); });
  Q.sort(function (a, b) { return a[1] - b[1]; });
  var k0 = 0; for (i = 1; i < Q.length; i++) if (Q[i][1] - Q[i - 1][1] > 1) k0 = i;
  Q = Q.slice(k0).concat(Q.slice(0, k0)).map(function (q) { return q[0]; });
  var last = Q[Q.length - 1], first = Q[0];
  for (i = 1; i <= 5; i++) Q.push([cx0, last[1] + (cy0 - last[1]) * i / 5]);
  Q.push([cx0 - .2, cy0]);
  for (i = 1; i < 5; i++) Q.push([cx0 + (first[0] - cx0) * i / 5, cy0]);
  Q = i4xf(Q, 4, 6, 0, cx0, cy0);
  return K.part(Q, [350, 86, 58], { n: 9, ex: [3, 3.6], c: [21, 22] }) + K.part(i4xf(Q.map(function (p) { return [cx0 + 4 + (p[0] - cx0 - 4) * .55, cy0 + 7 + (p[1] - cy0 - 7) * .55]; }), -2.4, -2.4), [350, 90, 74], { n: 6, flat: K.lvl === 1, noRim: 1, w: .6 }) + K.spec(13.4, 21, 3.8, 1.8, -40);
};
M5.heartContainer = function (K) {
  var b = '';
  b += K.part(i4heart(24, 24.6, 21.5, 56), [350, 80, 56], { n: 12, ex: [1.6, 2.4], c: [20, 18] });
  b += K.part(i4heart(24, 24, 15, 40), [352, 86, 44], { n: 8, noRim: 1, w: .8 });
  b += K.part(i4heart(22.4, 21.6, 7.4, 24), [350, 90, 66], { n: 5, flat: K.lvl === 1, noRim: 1, w: .5 });
  b += K.spec(12.8, 13.4, 4.6, 2.2, -36) + K.spec(34.6, 12.6, 2, 1.1, 30);
  return b;
};
/* ---- the truth mask: a round pale stone mask with side fins, a heavy brow and one great open eye ---- */
M5.truthMask = function (K) {
  var b = '', st = [96, 12, 70], dk = [96, 20, 30];
  [[[7, 18], [1.6, 26], [8, 31]], [[41, 18], [46.4, 26], [40, 31]]].forEach(function (F) { b += K.part(F, [96, 14, 58], { n: 3, w: 1 }); });
  b += K.part(i4ell(24, 25, 17, 18.5, 0, 40), st, { n: 10, ex: [1, 1.6] });
  b += K.part([[9.4, 16.4], [24, 9.6], [38.6, 16.4], [37.4, 19.6], [24, 14.4], [10.6, 19.6]], [96, 12, 56], { n: 6, w: 1 });
  b += K.part(i4ring(function (t) { var x = Math.sin(t) * 11, y = -Math.cos(t) * 6.4 * Math.abs(Math.cos(t * .5) * .3 + .75); return [24 + x, 26 + y]; }, 28), [40, 30, 96], { n: 8, w: 1, noRim: 1 });
  b += K.part(i4ell(24, 26, 4.6, 4.6, 0, 18), [8, 70, 40], { n: 6, w: .7, noRim: 1 }) + K.hole(24, 26, 2.2, [0, 0, 6]);
  b += K.part([[19, 37], [24, 39], [29, 37], [24, 37.8]], dk, { n: 4, flat: 1, w: .6, noRim: 1 });
  if (K.lvl === 3) b += '<path d="M12,32 Q11,24 13,18 M36,32 Q37,24 35,18" stroke="' + K.H(dk) + '" stroke-opacity=".3" stroke-width=".7" fill="none"/>';
  b += K.spec(14.6, 21.6, 2.6, 1.4, -60) + (K.lvl >= 2 ? '<circle cx="22.8" cy="24.8" r=".9" fill="#fff"/>' : '');
  return b;
};
/* ---- the blue hen (the colours of your picture), facing right this time ---- */
M5.blueHen = function (K) {
  var b = '', bl = [221, 70, 56], md = [222, 51, 41], dk = [224, 54, 28], red = [2, 80, 52], yel = [44, 94, 56];
  b += K.tube([[21, 40], [20, 45.4]], 1.8, yel, { straight: 1 }) + K.tube([[27, 40], [28, 45.4]], 1.8, yel, { straight: 1 });
  b += K.tube([[17.4, 46], [20, 45.4], [22.6, 46.2]], 1.1, yel, { straight: 1 }) + K.tube([[25.4, 46.2], [28, 45.4], [30.6, 46]], 1.1, yel, { straight: 1 });
  [[[13, 30], [3, 12], [6.6, 11], [16, 27]], [[12.6, 33], [1.4, 21], [4, 19], [15, 30]], [[14, 35.4], [3, 30], [4.6, 27], [16, 33]]].forEach(function (F, i) { b += K.part(F, [222, 60, 40 + i * 6], { n: 4, w: .9 }); });
  b += K.part(i4ell(23, 31, 13.6, 10.6, .08, 36), bl, { n: 10, ex: [.8, 1.2] });
  b += K.part(i4xf(i4ell(0, 0, 8.4, 5.2, 0, 22), 20.6, 31.6, .22), md, { n: 6, w: .9 });
  if (K.lvl >= 2) b += '<path d="M15.6,30.4 Q20,28.6 26.6,30.8 M16.2,33.2 Q20.6,32 25.6,33.4" stroke="' + K.H(dk) + '" stroke-opacity=".7" stroke-width=".7" fill="none"/>';
  [[31.6, 11.4, 2], [34.4, 9.8, 2.4], [37.2, 11.2, 2]].forEach(function (c) { b += K.part(i4ell(c[0], c[1], c[2], c[2], 0, 12), red, { n: 5, w: .8 }); });
  b += K.part(i4ell(34.4, 17.6, 6.4, 6.2, 0, 26), bl, { n: 8 });
  b += K.part([[40, 16.2], [45.8, 18.4], [40, 20.6]], yel, { n: 3, w: .9 });
  b += K.part(i4ell(39, 23.4, 1.6, 2.6, 0, 12), red, { n: 4, w: .7 });
  b += K.hole(36.4, 16.4, 1.2, [0, 0, 6]) + (K.lvl >= 2 ? '<circle cx="36.8" cy="16" r=".45" fill="#fff"/>' : '');
  b += K.spec(28.6, 24.6, 4, 1.5, 12);
  return b;
};
/* ---- the wooden slingshot, band drawn back with a seed in the pouch ---- */
M5.slingshot = function (K) {
  var b = '', wood = [30, 58, 46], lea = [16, 50, 36];
  b += K.tube([[26, 46], [25, 29]], 5, wood, { straight: 1 });
  b += K.tube([[25, 30], [20, 21], [15, 8]], 3.8, wood) + K.tube([[25, 30], [31, 21], [37, 9]], 3.8, wood);
  b += K.part(i4ell(15, 7.2, 2.6, 2.6, 0, 12), wood, { n: 5, w: .8 }) + K.part(i4ell(37, 8.2, 2.6, 2.6, 0, 12), wood, { n: 5, w: .8 });
  b += K.tube([[25.6, 34], [25.2, 43]], 5.8, lea, { straight: 1 });
  if (K.lvl >= 2) b += '<path d="M22.8,36 L28.4,35.4 M22.8,38.6 L28.4,38 M22.8,41.2 L28.4,40.6" stroke="' + K.H(lea, -26) + '" stroke-width=".7"/>';
  b += '<path d="M15.6,8.6 L11,19 M36.4,9.6 L11,19" stroke="' + K.H([4, 50, 34]) + '" stroke-width="' + (K.lvl === 1 ? 2 : 1.3) + '" fill="none" stroke-linecap="round"/>';
  b += K.part(i4ell(10.6, 19.4, 3.6, 2.8, -.4, 16), lea, { n: 5, w: .9 }) + K.part(i4ell(10.4, 18.4, 2, 2, 0, 12), [96, 40, 46], { n: 5, w: .7 });
  b += K.spec(23.6, 33, .9, 3.4, 0);
  return b;
};
/* ---- the wooden bow, drawn, with an arrow nocked: silver head, red feathers ---- */
M5.bow = function (K) {
  var b = '', wood = [28, 56, 44], lea = [36, 30, 70];
  b += K.tube([[18, 2.6], [14, 4.4], [8.4, 13], [6.4, 24], [8.4, 35], [14, 43.6], [18, 45.4]], 3.8, wood);
  b += K.tube([[6.6, 21], [6.6, 27]], 4.8, lea, { straight: 1 });
  b += '<path d="M17.6,3.4 L23,24 L17.6,44.6" stroke="' + K.H([40, 20, 88]) + '" stroke-width="' + (K.lvl === 1 ? 1.4 : .9) + '" fill="none"/>';
  b += K.tube([[23, 24], [41, 24]], K.lvl === 1 ? 2.2 : 1.7, [34, 40, 64], { straight: 1 });
  b += K.part([[47, 24], [40.4, 20.6], [41.6, 24], [40.4, 27.4]], [210, 10, 82], { n: 4, w: .9 });
  b += K.part([[23.4, 23.4], [26, 18.6], [31.4, 18.6], [29.4, 23.4]], [0, 76, 50], { n: 4, w: .8 }) + K.part([[23.4, 24.6], [29.4, 24.6], [31.4, 29.4], [26, 29.4]], [0, 70, 44], { n: 4, w: .8 });
  return b;
};
/* ---- swords and shields ---- */
M5.sword = function (K, kind) { /* 0 = the short forest sword, 1 = the long blade with the blue grip, 2 = the giant's knife */
  var b = '', len = [26, 32, 38][kind], bl = [210, 12, 80], top = 24 - len / 2 - 4, gy = top + len;
  b += K.part([[22, gy], [22, top + 4], [24, top], [26, top + 4], [26, gy]], bl, { n: 5, w: 1, m: 'h' });
  if (K.lvl >= 2) b += '<path d="M24,' + n1(top + 5) + ' V' + n1(gy - 1) + '" stroke="' + K.H(bl, -16) + '" stroke-width=".7"/>';
  var gc = kind === 1 ? [44, 70, 56] : kind === 0 ? [210, 30, 50] : [30, 20, 40];
  b += K.part(kind === 1 ? [[14, gy - 2], [18, gy], [24, gy + 1], [30, gy], [34, gy - 2], [32, gy + 2], [24, gy + 3], [16, gy + 2]] : m5rr(17, gy - 1, 14, 3.2, 1.2), gc, { n: 8, w: .9 });
  b += K.tube([[24, gy + 3], [24, gy + 10]], 3.4, kind === 1 ? [240, 50, 40] : [26, 40, 34], { straight: 1 });
  b += K.part(i4ell(24, gy + 11.4, 2.4, 2.2, 0, 12), kind === 1 ? [44, 70, 56] : [30, 20, 60], { n: 5, w: .7 });
  b += K.spec(23, top + 9, .7, 4, 0);
  return b;
};
M5.shield = function (K, kind) { /* 0 = round wooden, 1 = blue kite with silver rim, 2 = mirror */
  var b = '';
  if (kind === 0) {
    b += K.part(i4ell(24, 24, 18, 18, 0, 36), [210, 6, 56], { n: 10, ex: [1, 1.4] });
    b += K.part(i4ell(24, 24, 15, 15, 0, 32), [28, 50, 42], { n: 9, noRim: 1 });
    if (K.lvl >= 2) b += '<path d="M14,13 V35 M19,10 V38 M24,9 V39 M29,10 V38 M34,13 V35" stroke="' + K.H([28, 50, 24]) + '" stroke-width=".8" opacity=".7"/>';
    b += K.part(i4ell(24, 24, 4, 4, 0, 16), [210, 8, 70], { n: 6 });
    return b + K.spec(16, 15, 3.6, 1.6, -40);
  }
  var kite = [[8, 8], [24, 4], [40, 8], [39, 24], [24, 45], [9, 24]];
  var Kp = []; for (var i = 0; i < kite.length; i++) { var a = kite[i], c2 = kite[(i + 1) % kite.length]; for (var j = 0; j < 4; j++) Kp.push([a[0] + (c2[0] - a[0]) * j / 4, a[1] + (c2[1] - a[1]) * j / 4]); }
  b += K.part(Kp, kind === 1 ? [210, 12, 78] : [0, 70, 46], { n: 6, ex: [1, 1.4] });
  b += K.part(Kp.map(function (p) { return [24 + (p[0] - 24) * .8, 23 + (p[1] - 23) * .8]; }), kind === 1 ? [218, 64, 40] : [200, 14, 86], { n: 6, noRim: 1 });
  if (kind === 1 && K.lvl >= 2) b += '<path d="M24,10 V38 M13,20 H35" stroke="' + K.H([210, 12, 80]) + '" stroke-width="' + (K.lvl === 3 ? 1.6 : 2) + '"/>';
  if (kind === 2 && K.lvl >= 2) b += '<path d="M15,12 L33,32 M19,10 L35,26" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>';
  return b + K.spec(16, 12, 3.4, 1.4, -30);
};
/* ---- clothes ---- */
M5.tunic = function (K, col) {
  var b = '', P = [[16, 6], [32, 6], [44, 15], [39, 22], [33, 18], [34, 44], [14, 44], [15, 18], [9, 22], [4, 15]];
  var R = []; for (var i = 0; i < P.length; i++) { var a = P[i], c2 = P[(i + 1) % P.length]; for (var j = 0; j < 3; j++) R.push([a[0] + (c2[0] - a[0]) * j / 3, a[1] + (c2[1] - a[1]) * j / 3]); }
  b += K.part(R, col, { n: 10, ex: [.8, 1] });
  b += K.part(m5rr(14.6, 27, 19, 4, 1.4), [30, 46, 30], { n: 4, w: .9 }) + K.part(m5rr(21.6, 26.4, 5, 5, 1, 2), [44, 70, 60], { n: 4, w: .7 });
  b += K.part([[19, 6], [24, 12], [29, 6]], [col[0], col[1], col[2] - 16], { n: 3, flat: 1, w: .7 });
  return b + K.spec(18, 12, 2.6, 1.2, -20);
};
M5.boot = function (K, kind) { /* 0 = the heavy iron boot, 1 = the floating boot with little wings */
  var b = '', col = kind ? [28, 50, 44] : [215, 8, 44];
  b += K.part([[12, 6], [26, 6], [27, 28], [41, 33], [42, 42], [11, 42]], col, { n: 6, ex: [1, 1.2] });
  b += K.part(m5rr(10.4, 4, 17.6, 5, 1.4), kind ? [36, 60, 60] : [215, 8, 60], { n: 4, w: .9 });
  if (!kind) b += K.part(m5rr(9.4, 38.6, 34, 6, 1.4), [215, 10, 30], { n: 4, w: .9 }) + K.hole(16, 23, 1.2, [215, 8, 70]) + K.hole(22, 23, 1.2, [215, 8, 70]);
  else b += K.part([[8, 22], [1, 14], [6, 16], [3, 9], [9, 14], [9, 8], [13, 18]], [48, 92, 62], { n: 7, w: .8 });
  return b + K.spec(15, 14, 1.4, 4, 0);
};
/* ---- tools ---- */
M5.boomerang = function (K) {
  var b = '';
  b += K.part([[6, 12], [24, 30], [42, 12], [44, 18], [24, 38], [4, 18]], [214, 60, 48], { n: 6, ex: [1, 1.4] });
  b += K.part([[4, 12], [10, 10], [11, 17], [5, 18]], [0, 76, 52], { n: 4, w: .8 }) + K.part([[44, 12], [38, 10], [37, 17], [43, 18]], [0, 76, 52], { n: 4, w: .8 });
  b += K.part(i4ell(24, 32, 3, 3, 0, 12), [48, 92, 60], { n: 5, w: .7 });
  return b + K.spec(14, 18, 4, 1.2, 40);
};
M5.hookshot = function (K) {
  var b = '';
  b += K.tube([[10, 30], [10, 44]], 6, [24, 40, 34], { straight: 1 });
  b += K.part(m5rr(4, 22, 26, 10, 3), [210, 10, 56], { n: 6, ex: [1, 1.2] });
  b += K.part([[30, 24], [36, 22], [36, 32], [30, 30]], [210, 10, 66], { n: 4, w: .9 });
  if (K.lvl >= 2) for (var i = 0; i < 3; i++) b += '<ellipse cx="' + (38.6 + i * 2.6) + '" cy="' + (22 - i * 3) + '" rx="1.6" ry="1" fill="none" stroke="' + K.H([210, 8, 60]) + '" stroke-width=".9"/>';
  b += K.part([[45, 9], [40, 12], [42, 14], [38, 16], [44, 14], [45, 18], [47, 12]], [210, 10, 74], { n: 6, w: .9 });
  return b + K.spec(10, 24.6, 4, 1, 0);
};
M5.hammer = function (K) {
  var b = '';
  b += K.tube([[24, 46], [24, 20]], 3.4, [28, 46, 40], { straight: 1 });
  b += K.part(m5rr(6, 6, 36, 16, 3), [215, 10, 46], { n: 6, ex: [1.2, 1.6] });
  b += K.part(m5rr(4, 8, 6, 12, 2), [8, 60, 46], { n: 4, w: .9 }) + K.part(m5rr(38, 8, 6, 12, 2), [8, 60, 46], { n: 4, w: .9 });
  b += K.part(i4ell(24, 14, 3.4, 3.4, 0, 14), [44, 80, 58], { n: 6 });
  return b + K.spec(16, 9.6, 4, 1, 0);
};
M5.bomb = function (K) {
  var b = '';
  b += K.part(i4ell(24, 28, 15, 15, 0, 36), [224, 50, 24], { n: 10, ex: [.8, 1] });
  b += K.part(m5rr(19, 9, 10, 6, 1.6), [36, 20, 56], { n: 4, w: .9 });
  b += '<path d="M24,9 Q26,4 30,4" stroke="' + K.H([36, 40, 60]) + '" stroke-width="' + (K.lvl === 1 ? 2 : 1.4) + '" fill="none"/>';
  b += '<circle class="twk" cx="31" cy="3.6" r="' + (K.lvl === 1 ? 2.4 : 1.8) + '" fill="#ffd25a"/>';
  return b + K.spec(17.6, 20, 4.6, 2.2, -40);
};
/* ---- magic: arrows with elemental heads, three spell crystals, a magic jar ---- */
M5.arrow = function (K, el) { /* 0 fire, 1 ice, 2 light */
  var b = '', tip = [[16, 100, 54], [190, 90, 70], [48, 100, 64]][el];
  b += K.tube([[6, 42], [36, 12]], K.lvl === 1 ? 2.4 : 1.8, [34, 40, 66], { straight: 1 });
  b += K.part([[6, 42], [4, 34], [8, 36], [12, 40], [14, 44]], [0, 70, 54], { n: 5, w: .8 });
  b += K.part([[44, 4], [32, 12], [36, 16]], tip, { n: 3, w: .9 });
  b += K.glow(40, 8, 12, tip, .8);
  b += '<circle class="flick" cx="40" cy="8" r="' + (K.lvl === 1 ? 4 : 3) + '" fill="' + K.H(tip, 18) + '" opacity=".9"/>';
  return b;
};
M5.spell = function (K, el) { /* 0 red flame crystal, 1 green wind crystal, 2 blue diamond */
  var col = [[4, 80, 52], [130, 66, 46], [214, 80, 56]][el], b = '';
  var P = el === 2 ? [[24, 4], [38, 20], [24, 44], [10, 20]] : el === 1 ? [[24, 4], [34, 18], [34, 32], [24, 44], [14, 32], [14, 18]] : i4ell(24, 24, 14, 18, 0, 24);
  b += K.part(P, col, { n: el === 0 ? 8 : P.length, ex: [1, 1.2] });
  b += K.part(P.map(function (p) { return [24 + (p[0] - 24) * .5, 22 + (p[1] - 24) * .5]; }), [col[0], col[1], col[2] + 18], { n: el === 0 ? 6 : P.length, noRim: 1, w: .5 });
  return b + K.spec(18, 14, 2.6, 1.2, -40);
};
M5.jar = function (K) {
  var b = '';
  b += K.part(m5rr(18, 4, 12, 6, 1.6), [30, 40, 44], { n: 4, w: .9 });
  b += K.part(i4ell(24, 28, 13, 16, 0, 32), [130, 70, 46], { n: 9, ex: [.8, 1] });
  return b + K.spec(17, 20, 3, 1.4, -40);
};
/* ---- strength, swimming, defense ---- */
M5.gauntlet = function (K, col) {
  var b = '';
  b += K.part([[12, 44], [12, 26], [10, 16], [14, 14], [16, 22], [17, 8], [21, 8], [22, 20], [23, 6], [27, 6], [28, 20], [29, 8], [33, 8], [34, 22], [38, 18], [41, 20], [36, 30], [36, 44]], col, { n: 9, ex: [1, 1.2] });
  b += K.part(m5rr(10, 34, 28, 8, 2), [col[0], col[1], col[2] - 12], { n: 4, w: .9 });
  return b + K.spec(16, 26, 1.4, 5, 0);
};
M5.bracelet = function (K) {
  var b = '';
  b += K.part(i4ell(24, 26, 18, 12, 0, 36), [24, 40, 34], { n: 10, ex: [.8, 1] });
  b += K.part(i4ell(24, 26, 12, 7, 0, 28), [24, 30, 14], { n: 8, flat: 1, noRim: 1 });
  [[10, 24], [16, 33], [24, 36], [32, 33], [38, 24]].forEach(function (s) { b += K.part(i4ell(s[0], s[1], 2.2, 2.2, 0, 10), [44, 70, 60], { n: 5, w: .6 }); });
  return b + K.spec(14, 18, 4, 1.2, -16);
};
M5.scale = function (K, col) {
  var b = '', P = i4ring(function (t) { var x = Math.sin(t) * 15, y = -Math.cos(t) * 18; if (y < 0) x *= 1 - (-y) / 40; return [24 + x, 26 + y]; }, 32);
  b += K.part(P, col, { n: 8, ex: [.8, 1.2] });
  if (K.lvl >= 2) for (var i = 0; i < 3; i++) b += '<path d="M' + (14 + i * 2) + ',' + (30 - i * 7) + ' Q24,' + (36 - i * 7) + ' ' + (34 - i * 2) + ',' + (30 - i * 7) + '" stroke="' + K.H(col, -18) + '" stroke-width=".9" fill="none"/>';
  return b + K.spec(17, 16, 2.6, 1.4, -40);
};
/* ---- bags and money ---- */
M5.pouch = function (K, col) {
  var b = '';
  b += K.part(i4ring(function (t) { var x = Math.sin(t) * 15, y = -Math.cos(t) * 15; if (y < 0) x *= .55 + .45 * (1 + y / 15); return [24 + x, 28 + y]; }, 32), col, { n: 9, ex: [.8, 1.2] });
  b += K.part(m5rr(17, 12, 14, 4, 1.4), [30, 40, 30], { n: 4, w: .9 });
  b += K.part([[19, 13], [16, 6], [24, 10], [32, 6], [29, 13]], col, { n: 5, w: .9 });
  return b + K.spec(16, 26, 2.4, 4, -10);
};
M5.quiver = function (K) {
  var b = '';
  for (var i = 0; i < 4; i++) b += K.tube([[18 + i * 4, 18], [16 + i * 4.4, 3]], 1.4, [34, 40, 66], { straight: 1 }) + K.part([[14.6 + i * 4.4, 2], [17.4 + i * 4.4, 2], [16 + i * 4.4, 7]], [0, 70, 54], { n: 3, w: .6 });
  b += K.part(m5rr(13, 14, 22, 32, 4), [24, 54, 36], { n: 6, ex: [1, 1.2] });
  b += K.part(m5rr(12, 14, 24, 4, 1.4), [36, 50, 56], { n: 4, w: .9 }) + K.part(m5rr(12, 38, 24, 4, 1.4), [36, 50, 56], { n: 4, w: .9 });
  return b + K.spec(17, 26, 1.4, 6, 0);
};
M5.rupee = function (K, col) {
  var b = '', P = [[24, 3], [33, 12], [33, 36], [24, 45], [15, 36], [15, 12]];
  b += K.part(P, col, { n: 6, ex: [1, 1.2] });
  b += K.part([[24, 11], [28, 15], [28, 33], [24, 37], [20, 33], [20, 15]], [col[0], col[1], col[2] + 16], { n: 6, noRim: 1, w: .6 });
  return b + K.spec(19, 15, 1, 4, 0);
};
/* ---- bottles ---- */
M5.bottle = function (K, fill) { /* fill: [h,s,l] liquid, 'fairy', 'milk' or null */
  var b = '', glass = [196, 30, 86];
  b += K.part(m5rr(19, 2, 10, 6, 1.6), [30, 44, 50], { n: 4, w: .9 });
  var P = [[20, 8], [28, 8], [28, 16], [36, 24], [36, 44], [12, 44], [12, 24], [20, 16]], R = [];
  for (var i = 0; i < P.length; i++) { var a = P[i], c2 = P[(i + 1) % P.length]; for (var j = 0; j < 3; j++) R.push([a[0] + (c2[0] - a[0]) * j / 3, a[1] + (c2[1] - a[1]) * j / 3]); }
  b += K.part(R, glass, { n: 8, w: 1 });
  if (fill === 'fairy') { b += K.glow(24, 32, 14, [190, 90, 86], .9) + '<circle class="twk" cx="24" cy="32" r="' + (K.lvl === 1 ? 4 : 3) + '" fill="#fff"/>' + (K.lvl >= 2 ? '<ellipse class="flap" cx="20.6" cy="30" rx="3" ry="1.6" fill="#fff" opacity=".7"/><ellipse class="flap" cx="27.4" cy="30" rx="3" ry="1.6" fill="#fff" opacity=".7"/>' : ''); }
  else if (fill) { var lc = fill === 'milk' ? [40, 30, 96] : fill; b += K.part([[13, 30], [35, 30], [35, 43], [13, 43]], lc, { n: 4, w: .7, noRim: 1 }); if (fill === 'milk' && K.lvl >= 2) b += '<rect x="16" y="33" width="16" height="6" rx="1" fill="' + K.H([4, 60, 54]) + '"/>'; }
  return b + K.spec(16, 30, 1.2, 8, 0);
};
/* ---- quest relics: medallions and the three gemstones ---- */
M5.medallion = function (K, col) {
  var b = '';
  b += K.part(i4ell(24, 24, 18, 18, 0, 36), [44, 72, 54], { n: 10, ex: [1, 1.2] });
  b += K.part(i4ell(24, 24, 12.6, 12.6, 0, 32), col, { n: 8, noRim: 1 });
  b += K.part(i4ell(24, 24, 5, 5, 0, 16), [col[0], col[1], col[2] + 20], { n: 6, noRim: 1, w: .6 });
  return b + K.spec(16, 14, 3.6, 1.4, -40);
};
M5.stone = function (K, kind) { /* 0 green forest stone, 1 red fire stone, 2 blue water stone */
  var b = '', col = [[136, 70, 42], [356, 76, 48], [212, 80, 54]][kind], metal = kind === 2 ? [210, 10, 82] : [44, 76, 56];
  if (kind === 0) b += K.part([[24, 4], [36, 18], [30, 40], [18, 40], [12, 18]], col, { n: 5, ex: [1, 1.2] });
  else if (kind === 1) b += K.part(i4ell(24, 22, 14, 16, 0, 32), col, { n: 8, ex: [1, 1.2] });
  else b += K.part([[24, 4], [38, 16], [24, 38], [10, 16]], col, { n: 4, ex: [1, 1.2] });
  b += K.part(m5rr(14, 36, 20, 6, 1.6), metal, { n: 4, w: .9 });
  b += K.tube([[14, 39], [9, 30], [11, 22]], 2, metal) + K.tube([[34, 39], [39, 30], [37, 22]], 2, metal);
  return b + K.spec(19, 14, 2.6, 1.4, -40);
};
M5.harp = function (K) {
  var b = '', g = [44, 80, 56];
  b += K.tube([[12, 44], [8, 26], [12, 8], [20, 4]], 3.6, g) + K.tube([[36, 44], [40, 26], [36, 8], [28, 4]], 3.6, g);
  b += K.tube([[12, 44], [36, 44]], 3.6, g, { straight: 1 });
  if (K.lvl >= 2) for (var i = 0; i < 5; i++) b += '<line x1="' + (16 + i * 4) + '" y1="' + (8 + Math.abs(i - 2)) + '" x2="' + (16 + i * 4) + '" y2="42" stroke="#fff" stroke-opacity=".75" stroke-width=".6"/>';
  return b;
};

/* ---------- tab icons ---------- */
function icon5(lvl, glowCol, sh, body) {
  var K = IK(lvl), d = body(K);
  return K.svg(K.glow(24, 26, 22, glowCol, .5) + K.shadow(24, 45.4, sh) + d + K.tw(40, 9, 2.8) + K.tw(8, 38, 2, 't2'));
}
ICONS.main = function (lvl, adult) { return icon5(lvl, adult ? [214, 90, 66] : [34, 90, 70], 15, function (K) { return M5.ocarina(K, adult); }); };
ICONS.skull = function (lvl) { return icon5(lvl, [46, 100, 60], 14, function (K) { return M5.gspider(K); }); };
ICONS.heart = function (lvl, adult) { return icon5(lvl, [350, 90, 66], 14, function (K) { return adult ? M5.heartContainer(K) : M5.heartPiece(K); }); };
ICONS.side = function (lvl, adult) { return icon5(lvl, adult ? [221, 90, 66] : [96, 50, 70], 14, function (K) { return adult ? M5.blueHen(K) : M5.truthMask(K); }); };
ICONS.items = function (lvl, adult) { return icon5(lvl, [36, 90, 66], 12, function (K) { return adult ? M5.bow(K) : M5.slingshot(K); }); };

/* ---------- placing a model in a banner ---------- */
function put(c, name, x, y, s, a, o) {
  o = o || {};
  var K = IK(c.lvl, '§m'), body = M5[name](K, a);
  c.defs.push(K.defsStr());
  var inner = '<g transform="translate(' + n1(x - 24 * s) + ' ' + n1(y - 24 * s) + ') scale(' + s + ')' + (o.rot ? ' rotate(' + o.rot + ' 24 24)' : '') + '">' + body + '</g>';
  if (o.glow) glow(c, x, y, 34 * s, o.glow, .6);
  if (o.shadow !== 0) cshadow(c, x, y + 22 * s, 13 * s);
  A(c, o.cls ? '<g class="' + o.cls + '"' + (o.st ? ' style="' + o.st + '"' : '') + '>' + inner + '</g>' : inner);
}
/* a dark display room: back wall with panels, a shelf or table, spotlights (Switch 2), flat light cones (3DS) */
function room(c, wall, floorY, spots) {
  sky(c);
  A(c, shp(c, box(-10, 0, 1220, floorY), wall, { m: 'v', ol: 0, nogl: 1 }));
  if (c.lvl >= 2) for (var i = 0; i < 9; i++) A(c, shp(c, box(40 + i * 140, 14, 110, floorY - 30), [wall[0], wall[1], wall[2] + 4], { ol: c.lvl === 2 ? 1.2 : 0, nogl: 1, flat: c.lvl === 2 }));
  A(c, shp(c, box(-10, floorY, 1220, 140 - floorY + 4), [wall[0], wall[1] + 10, wall[2] - 6], { m: 'v', ol: 0, nogl: 1 }));
  A(c, shp(c, box(-10, floorY - 3, 1220, 5), [wall[0], wall[1] + 10, wall[2] + 12], { ol: 1.2, nogl: 1 }));
  (spots || []).forEach(function (x) { beams(c, [x - 40], [44, 80, 86], 14); });
}
function stand(c, x, y, w) { A(c, shp(c, [[x - w / 2, y], [x - w * .4, y - 8], [x + w * .4, y - 8], [x + w / 2, y]], [30, 20, 40], { ol: 1.5 })); }

/* ---------- the Items dropdowns: the familiar objects themselves, on display ---------- */
SC.armory = function (c) {
  room(c, [26, 26, 26], 122, [600]);
  put(c, 'shield', 270, 60, 1.5, 0, { shadow: 0 }); put(c, 'shield', 500, 58, 1.45, 1, { shadow: 0 }); put(c, 'shield', 705, 58, 1.45, 2, { shadow: 0 });
  put(c, 'sword', 385, 70, 1.95, 0); put(c, 'sword', 820, 64, 2.15, 2);
  stand(c, 600, 122, 80); put(c, 'sword', 600, 62, 2.35, 1, { glow: [48, 100, 80], cls: 'bob b1' });
  flame(c, 140, 104, 22); flame(c, 1060, 104, 22); parts(c, 14, [44, 90, 70], 20, 110);
};
SC.wardrobe = function (c) {
  room(c, [30, 24, 28], 122, [430, 820]);
  A(c, shp(c, box(220, 14, 760, 4), [28, 30, 50], { ol: 1 }));
  [[300, [118, 58, 36]], [430, [4, 70, 46]], [560, [212, 66, 46]]].forEach(function (t, i) { A(c, '<g class="sway" style="--sk:1.4deg;--sp:' + (4 + i * .5) + 's">'); put(c, 'tunic', t[0], 54, 1.75, t[1], { shadow: 0 }); A(c, '</g>'); });
  put(c, 'boot', 700, 92, 1.35, 0); put(c, 'boot', 770, 94, 1.35, 0);
  put(c, 'boot', 890, 86, 1.35, 1, { cls: 'bob b2', glow: [190, 90, 80] });
  parts(c, 12, [40, 80, 70], 30, 110);
};
SC.bench = function (c) {
  room(c, [28, 28, 28], 108, [600]);
  A(c, shp(c, box(-10, 102, 1220, 10), [28, 50, 40], { ol: 1.5 }));
  put(c, 'hammer', 290, 62, 1.85, 0, { rot: -18 }); put(c, 'boomerang', 450, 68, 1.55, 0, { cls: 'bob b0' });
  put(c, 'hookshot', 605, 64, 1.75, 0); put(c, 'bomb', 745, 76, 1.35, 0); put(c, 'bomb', 815, 84, 1.05, 0); put(c, 'slingshot', 925, 60, 1.7, 0, { rot: 18 });
  parts(c, 14, [44, 90, 70], 20, 90);
};
SC.magic = function (c) {
  room(c, [272, 30, 20], 124, []);
  parts(c, 26, c.M.o, 10, 120);
  [[285, 0], [385, 1], [485, 2]].forEach(function (a, i) { put(c, 'arrow', a[0], 64, 1.8, a[1], { shadow: 0, cls: 'bob b' + i }); });
  [[680, 0, [4, 90, 60]], [800, 1, [130, 80, 56]], [920, 2, [214, 90, 66]]].forEach(function (a, i) { put(c, 'spell', a[0], 60, 1.35, a[1], { glow: a[2], cls: 'bob b' + (i + 1) }); });
  put(c, 'jar', 580, 92, 1.05, 0);
};
SC.trial = function (c) {
  room(c, [100, 12, 30], 122, [600]);
  [[270, 'bracelet', 0], [390, 'gauntlet', [210, 8, 76]], [510, 'gauntlet', [44, 84, 56]], [640, 'scale', [200, 12, 82]], [760, 'scale', [44, 88, 60]]].forEach(function (a, i) { stand(c, a[0], 122, 66); put(c, a[1], a[0], 78, 1.4, a[2], { cls: 'bob b' + (i % 4) }); });
  put(c, 'heartContainer', 900, 72, 1.45, 0, { glow: [350, 90, 66], cls: 'bob b3' });
  parts(c, 14, [44, 90, 70], 20, 110);
};
SC.stall = function (c) {
  sky(c); orb(c, 150, 70, 14); clouds(c);
  A(c, shp(c, box(200, 22, 800, 80), [30, 30, 30], { ol: 2 }));
  var aw = ''; for (var i = 0; i < 10; i++) aw += shp(c, [[200 + i * 80, 14], [280 + i * 80, 14], [280 + i * 80, 30], [240 + i * 80, 38], [200 + i * 80, 30]], i % 2 ? [40, 20, 92] : [356, 60, 48], { ol: 1.4 });
  A(c, aw);
  A(c, shp(c, box(180, 100, 840, 12), [28, 46, 38], { ol: 1.5 }));
  put(c, 'pouch', 285, 70, 1.35, [34, 50, 46]); put(c, 'quiver', 400, 66, 1.4, 0); put(c, 'pouch', 515, 72, 1.25, [16, 40, 34]);
  put(c, 'pouch', 625, 74, 1.1, [100, 30, 36]); put(c, 'pouch', 730, 70, 1.3, [280, 30, 40]);
  [[830, [140, 70, 46]], [885, [214, 80, 54]], [940, [356, 80, 50]]].forEach(function (r, k) { put(c, 'rupee', r[0], 76, 1, r[1], { cls: 'bob b' + k, glow: r[1] }); });
  floor(c, 112, [30, 30, 44]);
};
SC.shelf = function (c) {
  room(c, [28, 30, 24], 120, [600]);
  var fills = [[0, 80, 50], [130, 70, 44], [214, 80, 54], 'milk', 'fairy', null, [0, 80, 50], [214, 80, 54]];
  for (var k = 0; k < 2; k++) {
    var y = 62 + k * 50;
    A(c, shp(c, box(-10, y, 1220, 7), [28, 42, 38], { ol: 1.5, m: 'v' }));
    for (var j = 0; j < 6; j++) put(c, 'bottle', 270 + j * 130 + (k ? 60 : 0), y - 23, 1, fills[(j + k * 3) % fills.length], { shadow: 0 });
  }
  parts(c, 16, [44, 90, 70], 10, 120);
};
SC.relics = function (c) {
  room(c, [250, 20, 18], 120, [600]);
  var cols = [[128, 60, 50], [4, 70, 52], [214, 70, 54], [30, 84, 54], [280, 50, 52], [52, 90, 56]];
  for (var k = 0; k < 6; k++) { var a = Math.PI * (.08 + .84 * k / 5); put(c, 'medallion', 600 - Math.cos(a) * 350, 98 - Math.sin(a) * 66, .95, cols[k], { shadow: 0, cls: 'bob b' + (k % 4), glow: cols[k] }); }
  [[510, 0], [600, 1], [690, 2]].forEach(function (g, i) { stand(c, g[0], 120, 62); put(c, 'stone', g[0], 84, 1.25, g[1], { cls: 'bob b' + i, glow: [[136, 80, 50], [356, 80, 56], [212, 90, 60]][g[1]] }); });
  parts(c, 20, c.M.o, 20, 120);
};
function songs5(c, adult) {
  sky(c); if (!c.M.stars) { orb(c, 990, 36, 16); clouds(c); }
  ridge(c, 0, 3, 112, 10); ridge(c, 1, 3, 126, 7);
  var k, s = '', r = c.rs[2], ink = adult ? [44, 40, 86] : [26, 30, 26], nc = adult ? [44, 86, 76] : [22, 40, 22];
  for (k = 0; k < 5; k++) s += '<rect x="0" y="' + (24 + k * 11) + '" width="1200" height="' + (c.lvl === 1 ? 3 : 1.6) + '" fill="' + hs(c, ink) + '" opacity="' + (c.lvl === 3 ? .7 : .85) + '"/>';
  A(c, s);
  for (k = 0; k < LOD(c, 6, 9, 12); k++) { var y = 24 + Math.floor(r() * 9) * 5.5; A(c, '<g class="bob b' + (k % 4) + '">'); noteAt(c, 60 + k * (1080 / LOD(c, 6, 9, 12)) + (r() - .5) * 20, y, y > 46, nc); A(c, '</g>'); }
  put(c, 'ocarina', adult ? 510 : 600, 92, 1.6, adult, { cls: 'bob b2', glow: adult ? [214, 90, 66] : [34, 90, 70] });
  if (adult) put(c, 'harp', 700, 86, 1.5, 0, { cls: 'bob b1', glow: [44, 100, 70] });
  ridge(c, 2, 3, 136, 5); fog(c, 90, 36, .3);
}
SC.songc = function (c) { songs5(c, false); };
SC.songa = function (c) { songs5(c, true); };
