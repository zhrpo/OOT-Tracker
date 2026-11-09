/* ================= tab icons, edition 4: redrawn from scratch =================
   Each icon is one small "model" (rings of points for solid parts, centre lines for rods and legs),
   rendered three ways:
   N64      = the ring is cut to a few corners and filled as flat triangles fanned from the middle, each lit by
              which way it faces (a faceted low-poly model with a round blob shadow).
   3DS      = smooth outline, three hard cel bands, a dark ink line and a crisp white highlight.
   Switch 2 = smooth shading, a rim light, a soft specular glint, a soft contact shadow, glow and sparkle,
              and the whole thing floats.
   All are original drawings of generic objects. */
function i4ring(f, n) { var P = []; for (var i = 0; i < n; i++) P.push(f(i / n * Math.PI * 2)); return P; }
function i4ell(cx, cy, rx, ry, rot, n) {
  var c = Math.cos(rot || 0), s = Math.sin(rot || 0);
  return i4ring(function (t) { var x = Math.cos(t - Math.PI / 2) * rx, y = Math.sin(t - Math.PI / 2) * ry; return [cx + x * c - y * s, cy + x * s + y * c]; }, n || 32);
}
function i4xf(P, dx, dy, rot, cx, cy) {
  var c = Math.cos(rot || 0), s = Math.sin(rot || 0);
  return P.map(function (p) { var x = p[0] - (cx || 0), y = p[1] - (cy || 0); return [(cx || 0) + x * c - y * s + (dx || 0), (cy || 0) + x * s + y * c + (dy || 0)]; });
}
/* heart curve, centred on (cx, cy), about 2*sc wide */
function i4heart(cx, cy, sc, n) {
  return i4ring(function (t) {
    var x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [cx + x * sc / 16, cy - (y + 2) * sc / 16];
  }, n || 40);
}
function i4open(P) {
  var d = 'M' + n1(P[0][0]) + ',' + n1(P[0][1]);
  for (var k = 0; k < P.length - 1; k++) {
    var p0 = P[k - 1] || P[k], p1 = P[k], p2 = P[k + 1], p3 = P[k + 2] || p2;
    d += ' C' + n1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + n1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + n1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + n1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + n1(p2[0]) + ',' + n1(p2[1]);
  }
  return d;
}
function IK(lvl) {
  var K = { lvl: lvl }, defs = [], n = 0, pre = 'i4' + (icN++) + '_';
  function id() { return pre + (n++); }
  function H(c, dl, a) { var l = clamp(c[2] + (dl || 0), 2, 98); return a == null ? 'hsl(' + c[0] + ',' + c[1] + '%,' + l + '%)' : 'hsla(' + c[0] + ',' + c[1] + '%,' + l + '%,' + a + ')'; }
  K.H = H;
  function grad(stops, cx, cy, r) {
    var i = id();
    defs.push('<radialGradient id="' + i + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>');
    return 'url(#' + i + ')';
  }
  var rimG = null, blurF = null, softF = null;
  function rim() { if (!rimG) { rimG = id(); defs.push('<linearGradient id="' + rimG + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".75"/></linearGradient>'); } return 'url(#' + rimG + ')'; }
  function blur() { if (!blurF) { blurF = id(); defs.push('<filter id="' + blurF + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".7"/></filter>'); } return 'url(#' + blurF + ')'; }
  function soft() { if (!softF) { softF = id(); defs.push('<filter id="' + softF + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>'); } return 'url(#' + softF + ')'; }
  /* a solid part. o: n = N64 corners, c = N64 fan centre, w = 3DS ink width, flat, ex = [dx, dy] extrude for a side face */
  K.part = function (P, col, o) {
    o = o || {};
    var s = '';
    if (o.ex) s += K.part(i4xf(P, o.ex[0], o.ex[1]), [col[0], col[1], col[2] - 18], { n: o.n, flat: 1, w: o.w, noRim: 1 });
    if (lvl === 1) {
      var k = o.n || 8, Q = [], i;
      for (i = 0; i < k; i++) Q.push(P[Math.floor(i * P.length / k)]);
      var cx = 0, cy = 0; Q.forEach(function (p) { cx += p[0] / k; cy += p[1] / k; });
      if (o.c) { cx = o.c[0]; cy = o.c[1]; } else { cx -= 1.2; cy -= 1.6; }
      for (i = 0; i < k; i++) {
        var a = Q[i], b = Q[(i + 1) % k], mx = (a[0] + b[0]) / 2 - cx, my = (a[1] + b[1]) / 2 - cy, L = Math.sqrt(mx * mx + my * my) || 1;
        var d = o.flat ? 0 : -(mx / L * .62 + my / L * .78), f = H(col, Math.round(d * 4) * 4);
        s += '<polygon points="' + pts([[cx, cy], a, b]) + '" fill="' + f + '" stroke="' + f + '" stroke-width=".35" stroke-linejoin="round"/>';
      }
      return s;
    }
    var dd = cpath(P);
    if (lvl === 2) {
      var g = o.flat ? H(col) : grad([[0, H(col, 16)], [.36, H(col, 16)], [.36, H(col, 0)], [.76, H(col, 0)], [.76, H(col, -13)], [1, H(col, -13)]], .32, .26, .92);
      return s + '<path d="' + dd + '" fill="' + g + '" stroke="' + H(col, -36) + '" stroke-width="' + (o.w || 1.4) + '" stroke-linejoin="round"/>';
    }
    var g3 = o.flat ? H(col, -4) : grad([[0, H(col, 24)], [.42, H(col, 4)], [.84, H(col, -12)], [1, H(col, -20)]], .3, .24, .98);
    s += '<path d="' + dd + '" fill="' + g3 + '" stroke="' + H(col, -30) + '" stroke-opacity=".55" stroke-width=".7" stroke-linejoin="round"/>';
    if (!o.noRim && !o.flat) s += '<path d="' + dd + '" fill="none" stroke="' + rim() + '" stroke-width="1.3"/>';
    return s;
  };
  /* a rod along a centre line (legs, forks, bow limbs, cords) */
  K.tube = function (C, w, col, o) {
    o = o || {};
    var cap = ' stroke-linecap="' + (lvl === 1 ? 'butt' : 'round') + '" stroke-linejoin="' + (lvl === 1 ? 'miter' : 'round') + '" fill="none"';
    if (lvl === 1) {
      var pl = pts(C);
      return '<polyline points="' + pl + '" stroke="' + H(col, -12) + '" stroke-width="' + w + '"' + cap + '/><polyline points="' + pts(i4xf(C, -w * .18, -w * .22)) + '" stroke="' + H(col, 6) + '" stroke-width="' + n1(w * .5) + '"' + cap + '/>';
    }
    var d = o.straight ? 'M' + C.map(function (p) { return n1(p[0]) + ',' + n1(p[1]); }).join(' L') : i4open(C), dh = o.straight ? 'M' + i4xf(C, -w * .16, -w * .2).map(function (p) { return n1(p[0]) + ',' + n1(p[1]); }).join(' L') : i4open(i4xf(C, -w * .16, -w * .2));
    if (lvl === 2) return '<path d="' + d + '" stroke="' + H(col, -36) + '" stroke-width="' + n1(w + 2.2) + '"' + cap + '/><path d="' + d + '" stroke="' + H(col) + '" stroke-width="' + w + '"' + cap + '/><path d="' + dh + '" stroke="' + H(col, 18) + '" stroke-width="' + n1(w * .36) + '"' + cap + '/>';
    return '<path d="' + d + '" stroke="' + H(col, -30) + '" stroke-opacity=".7" stroke-width="' + n1(w + 1) + '"' + cap + '/><path d="' + d + '" stroke="' + H(col, -4) + '" stroke-width="' + w + '"' + cap + '/><path d="' + dh + '" stroke="' + H(col, 14) + '" stroke-width="' + n1(w * .5) + '"' + cap + '/><path d="' + dh + '" stroke="#fff" stroke-opacity=".7" stroke-width="' + n1(w * .16) + '"' + cap + '/>';
  };
  K.spec = function (x, y, rx, ry, rot) {
    if (lvl === 1) return '';
    var t = rot ? ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"' : '';
    if (lvl === 2) return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".9"' + t + '/>';
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".95" filter="' + blur() + '"' + t + '/><circle cx="' + n1(x - rx * .3) + '" cy="' + n1(y - ry * .2) + '" r="' + n1(Math.min(rx, ry) * .45) + '" fill="#fff"/>';
  };
  K.shadow = function (cx, cy, rx) {
    if (lvl === 1) return '<polygon points="' + pts(i4ell(cx, cy, rx, rx * .2, 0, 8)) + '" fill="#000" opacity=".28"/>';
    if (lvl === 2) return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + n1(rx * .16) + '" fill="#000" opacity=".2"/>';
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + n1(rx * .2) + '" fill="#000" opacity=".4" filter="' + soft() + '"/>';
  };
  K.glow = function (x, y, r, col, a) { return lvl === 3 ? '<circle class="pulse" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + grad([[0, H(col, 0, a == null ? .55 : a)], [1, H(col, 0, 0)]], .5, .5, .5) + '"/>' : ''; };
  K.tw = function (x, y, r, cls) { return lvl === 3 ? star4(x, y, r, 'twk ' + (cls || ''), '#fff') : ''; };
  /* a hole or eye: N64 hexagon, 3DS ring, Switch 2 a recessed hole with a lit lower lip */
  K.hole = function (x, y, r, col) {
    col = col || [20, 40, 10];
    if (lvl === 1) return '<polygon points="' + pts(i4ell(x, y, r, r, 0, 6)) + '" fill="' + H(col) + '"/>';
    if (lvl === 2) return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + H(col) + '"/>';
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + grad([[0, H(col, -4)], [.7, H(col, 2)], [1, H(col, 20)]], .5, .3, .7) + '"/><path d="M' + n1(x - r * .8) + ',' + n1(y + r * .5) + ' A' + r + ',' + r + ' 0 0 0 ' + n1(x + r * .8) + ',' + n1(y + r * .5) + '" stroke="#fff" stroke-opacity=".45" stroke-width=".6" fill="none"/>';
  };
  K.svg = function (body) {
    var b = lvl === 3 ? '<g class="flt">' + body + '</g>' : body;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" focusable="false">' + (defs.length ? '<defs>' + defs.join('') + '</defs>' : '') + b + '</svg>';
  };
  return K;
}

var ICONS4 = {};
/* main quest: the clay Fairy Ocarina (child), the blue Ocarina with its silver mouthpiece (adult) */
ICONS4.main = function (lvl, adult) {
  var K = IK(lvl), b = '', col = adult ? [208, 74, 48] : [22, 56, 50], mp = adult ? [212, 10, 78] : [22, 50, 44];
  var body = i4ring(function (t) { var x = Math.sin(t) * 17, y = -Math.cos(t) * 11.5; if (x < 0) x *= 1.08; y *= (1 - .12 * Math.sin(t)); return [x, y]; }, 36);
  body = i4xf(body, 25, 28, -.22);
  b += K.glow(24, 28, 24, adult ? [200, 90, 64] : [30, 90, 64]) + K.shadow(25, 44.6, 15);
  b += K.part(i4xf(i4ell(0, 0, 3.6, 7.2, 0, 16), 11, 14.5, -.72), mp, { n: 6, ex: [.8, 1] });
  if (adult) b += K.part(i4xf(i4ell(0, 0, 4.3, 1.6, 0, 12), 13.7, 18, -.72), [44, 80, 56], { n: 5 });
  b += K.part(body, col, { n: 9, ex: [1.1, 1.6] });
  [[21, 24.5, 2.2], [27.2, 23.2, 2.2], [33.2, 24.6, 2.1], [24.5, 31, 2], [30.6, 30.6, 2]].forEach(function (h) { b += K.hole(h[0], h[1], h[2], adult ? [216, 60, 14] : [16, 50, 14]); });
  if (lvl >= 2 && !adult) b += '<path d="M16,36 l3,1.6 l3,-1.6 l3,1.6 l3,-1.6 l3,1.6 l3,-1.6" stroke="' + K.H([30, 60, 82]) + '" stroke-width="' + (lvl === 3 ? .9 : 1.2) + '" fill="none" stroke-linejoin="round" opacity=".85"/>';
  if (adult && lvl >= 2) b += '<path d="M14,33 Q25,38.6 38,32" stroke="' + K.H([210, 20, 86]) + '" stroke-width="' + (lvl === 3 ? 1 : 1.4) + '" fill="none" opacity=".8"/>';
  b += K.spec(17.5, 21.5, 4, 1.8, -24);
  b += K.tw(39, 12, 2.8) + (adult ? K.tw(8, 36, 2, 't2') : '');
  return K.svg(b);
};
/* skulltulas: a golden spider with a skull pattern on its back */
ICONS4.skull = function (lvl) {
  var K = IK(lvl), b = '', g = [44, 88, 52], dk = [32, 70, 20];
  b += K.glow(24, 28, 24, [46, 100, 60]) + K.shadow(24, 45.4, 14);
  [[[17, 28], [9, 20], [4, 26]], [[16, 31], [7, 29], [3, 35]], [[17, 34], [9, 37], [6, 44]], [[19, 37], [14, 42], [13, 47]]].forEach(function (L) {
    b += K.tube(L, lvl === 1 ? 2.6 : 2.2, g, { straight: 1 }) + K.tube(L.map(function (p) { return [48 - p[0], p[1]]; }), lvl === 1 ? 2.6 : 2.2, g, { straight: 1 });
  });
  b += K.part(i4ell(24, 31, 10.5, 12, 0, 32), g, { n: 8, ex: [.6, 1] });
  b += K.part(i4ell(24, 15.5, 6, 5.4, 0, 24), g, { n: 6 });
  /* the skull marking */
  var sk = function (P, n) { return K.part(P, dk, { n: n, flat: 1, w: .6, noRim: 1 }); };
  b += sk(i4ell(20.2, 28.6, 2.6, 3, .3, 16), 5) + sk(i4ell(27.8, 28.6, 2.6, 3, -.3, 16), 5) + sk([[24, 31.4], [25.4, 34.4], [22.6, 34.4]], 3);
  if (lvl === 1) b += '<rect x="20" y="36.4" width="8" height="2" fill="' + K.H(dk) + '"/>';
  else b += '<path d="M19.6,37 H28.4 M21.8,35.8 V38.4 M24,35.8 V38.6 M26.2,35.8 V38.4" stroke="' + K.H(dk) + '" stroke-width="' + (lvl === 3 ? .8 : 1) + '" stroke-linecap="round"/>';
  b += K.hole(21.8, 14.6, 1.2, [0, 0, 6]) + K.hole(26.2, 14.6, 1.2, [0, 0, 6]);
  if (lvl >= 2) b += '<circle cx="21.4" cy="14.2" r=".4" fill="#fff"/><circle cx="25.8" cy="14.2" r=".4" fill="#fff"/>';
  b += K.spec(19.2, 23, 3.2, 1.6, -30) + K.tw(40, 9, 3) + K.tw(7, 40, 2, 't2');
  return K.svg(b);
};
/* hearts: one thick quarter piece (child), a whole glassy heart container (adult) */
ICONS4.heart = function (lvl, adult) {
  var K = IK(lvl), b = '', red = [352, 78, 54];
  if (!adult) {
    /* the top-left quarter of a heart, lifted out of the faint outline of the whole heart it belongs to */
    var cx0 = 25, cy0 = 26, H0 = i4heart(cx0, cy0, 20, 160), Q = [], i;
    H0.forEach(function (p, j) { if (p[0] <= cx0 + .01 && p[1] <= cy0) Q.push([p, j]); });
    /* keep the curve in the order it is drawn, starting from its lowest point on the left side */
    Q.sort(function (a, b) { return a[1] - b[1]; });
    var k0 = 0; for (i = 1; i < Q.length; i++) if (Q[i][1] - Q[i - 1][1] > 1) k0 = i;
    Q = Q.slice(k0).concat(Q.slice(0, k0)).map(function (q) { return q[0]; });
    var last = Q[Q.length - 1], first = Q[0];
    for (i = 1; i <= 5; i++) Q.push([cx0, last[1] + (cy0 - last[1]) * i / 5]);
    Q.push([cx0 - .3, cy0]);
    for (i = 1; i < 5; i++) Q.push([cx0 + (first[0] - cx0) * i / 5, cy0]);
    b += K.glow(20, 20, 19, [350, 90, 66]) + K.shadow(25, 45, 14);
    var outl = lvl === 1 ? pts(dec(H0, 16)) : null;
    b += lvl === 1 ? '<polygon points="' + outl + '" fill="#e9c9cf" opacity=".55"/>' : '<path d="' + cpath(H0) + '" fill="' + K.H([350, 60, 80], 0, lvl === 3 ? .35 : .4) + '" stroke="' + K.H([350, 40, 60]) + '" stroke-opacity=".6" stroke-width="1" stroke-dasharray="2.4 2"/>';
    b += '<g transform="translate(-2.6 -2.8)">' + K.part(Q, red, { n: 9, ex: [1.6, 2.2], c: [17, 17] }) + K.spec(11.6, 12.4, 3.4, 1.6, -40) + '</g>';
    b += K.tw(40, 10, 3) + K.tw(38, 38, 2, 't2');
    return K.svg(b);
  }
  var HT = i4heart(24, 25, 21, 48);
  b += K.glow(24, 25, 26, [350, 90, 66], .6) + K.shadow(24, 45.6, 15);
  b += K.part(HT, red, { n: 10, ex: [1.2, 1.8], c: [20, 19] });
  b += K.part(i4heart(22.6, 22.6, 11, 32), [350, 90, 72], { n: 6, flat: lvl === 1, noRim: 1, w: .8 });
  b += K.spec(13.4, 13.6, 4.4, 2.2, -38) + K.spec(33.4, 13, 1.8, 1, 30);
  b += K.tw(40, 9, 3) + K.tw(9, 37, 2.2, 't2');
  return K.svg(b);
};
/* side quests: a carved wooden mask (child), the blue hen (adult) */
ICONS4.side = function (lvl, adult) {
  var K = IK(lvl), b = '';
  if (!adult) {
    var wd = [32, 48, 58], ink = [24, 40, 14];
    b += K.glow(24, 24, 24, [36, 90, 64], .4) + K.shadow(24, 46, 13);
    var face = i4ring(function (t) { var x = Math.sin(t) * 15, y = -Math.cos(t) * 20; if (y > 0) x *= 1 - y / 70; return [24 + x, 24 + y]; }, 36);
    b += K.part(face, wd, { n: 9, ex: [1, 1.6] });
    b += K.part([[10.4, 13], [24, 7], [37.6, 13], [37, 16.6], [24, 12], [11, 16.6]], [8, 60, 44], { n: 6, w: 1 });
    b += K.part(i4xf(i4ell(0, 0, 4.6, 2.4, 0, 16), 17.4, 21.6, .18), ink, { n: 5, flat: 1, noRim: 1, w: .8 }) + K.part(i4xf(i4ell(0, 0, 4.6, 2.4, 0, 16), 30.6, 21.6, -.18), ink, { n: 5, flat: 1, noRim: 1, w: .8 });
    b += K.part([[24, 20], [21.6, 31], [26.4, 31]], [30, 46, 50], { n: 3, w: 1 });
    b += K.part([[18, 37], [24, 39.4], [30, 37], [24, 38.2]], ink, { n: 4, flat: 1, w: .8, noRim: 1 });
    [[15.6, 27], [32.4, 27]].forEach(function (p) { b += K.part([[p[0] - 2, p[1]], [p[0] + 2, p[1]], [p[0], p[1] + 5]], [4, 70, 48], { n: 3, flat: 1, w: .6, noRim: 1 }); });
    if (lvl === 3) b += '<path d="M14,16 Q13,26 16,38 M34,16 Q35,26 32,38 M20,8 Q19,13 19.6,17" stroke="' + K.H(wd, -22) + '" stroke-opacity=".45" stroke-width=".6" fill="none"/>';
    b += K.spec(15.6, 13.4, 3, 1.4, -50) + K.tw(40, 8, 2.6);
    return K.svg(b);
  }
  var bl = [221, 68, 54], dk = [224, 54, 30], red = [2, 76, 52], yel = [42, 92, 56];
  b += K.glow(24, 28, 24, [221, 90, 66], .5) + K.shadow(25, 45.8, 15);
  b += K.tube([[21, 40], [20.4, 45]], 1.8, yel, { straight: 1 }) + K.tube([[29, 40], [29.8, 45]], 1.8, yel, { straight: 1 });
  b += K.tube([[17.8, 45.6], [20.4, 45], [23, 45.8]], 1.2, yel, { straight: 1 }) + K.tube([[27, 45.8], [29.8, 45], [32.4, 45.6]], 1.2, yel, { straight: 1 });
  [[[34, 30], [40, 14], [43, 16], [38, 32]], [[36, 31], [45, 20], [46.6, 23], [39, 34]], [[35, 33], [44.6, 28], [45, 32], [38, 36]]].forEach(function (F, i) { b += K.part(F, [221, 64, 44 + i * 4], { n: 4, w: 1 }); });
  b += K.part(i4ell(26, 31, 14, 11, -.1, 32), bl, { n: 9, ex: [.8, 1.2] });
  b += K.part(i4xf(i4ell(0, 0, 8, 5, 0, 20), 27.6, 31.6, -.2), [222, 56, 40], { n: 6, w: .9 });
  if (lvl >= 2) b += '<path d="M22,31 Q27,29 33,30.6 M23,33.6 Q27.6,32.4 32,33.2" stroke="' + K.H(dk) + '" stroke-opacity=".6" stroke-width=".7" fill="none"/>';
  [[10.6, 12.2, 2], [13.2, 10.6, 2.3], [15.8, 12, 1.9]].forEach(function (c) { b += K.part(i4ell(c[0], c[1], c[2], c[2], 0, 12), red, { n: 5, w: .8 }); });
  b += K.part(i4ell(13.4, 18.4, 6.2, 6, 0, 24), bl, { n: 7 });
  b += K.part([[8, 17], [2.6, 19.4], [8, 21.6]], yel, { n: 3, w: .9 });
  b += K.part(i4ell(9, 24, 1.6, 2.4, 0, 12), red, { n: 4, w: .7 });
  b += K.hole(12, 17.4, 1.2, [0, 0, 6]) + (lvl >= 2 ? '<circle cx="11.6" cy="17" r=".4" fill="#fff"/>' : '');
  b += K.spec(20, 23.6, 4, 1.6, -18) + K.tw(40, 8, 2.6) + K.tw(6, 34, 1.8, 't2');
  return K.svg(b);
};
/* items: the wooden slingshot (child), the bow with an arrow (adult) */
ICONS4.items = function (lvl, adult) {
  var K = IK(lvl), b = '', wood = [28, 56, 44], lea = [10, 54, 40];
  if (!adult) {
    b += K.glow(24, 24, 24, [36, 90, 64], .4) + K.shadow(24, 46, 9);
    b += K.tube([[24, 44], [24, 27]], 5, wood, { straight: 1 });
    b += K.tube([[24, 28], [19, 21], [14.5, 9]], 4, wood) + K.tube([[24, 28], [29, 21], [33.5, 9]], 4, wood);
    b += K.tube([[24, 33], [24, 41]], 5.6, lea, { straight: 1 });
    if (lvl >= 2) b += '<path d="M21.4,35 H26.6 M21.4,37.6 H26.6 M21.4,40 H26.6" stroke="' + K.H(lea, -24) + '" stroke-width=".7"/>';
    b += '<path d="M14.6,9.6 Q24,19 33.4,9.6" stroke="' + K.H([4, 40, 30]) + '" stroke-width="' + (lvl === 1 ? 2 : 1.3) + '" fill="none"/>';
    b += K.part(i4ell(24, 14.4, 3.4, 2.6, 0, 16), lea, { n: 5, w: .9 });
    b += K.part(i4ell(24, 12, 2.2, 2.2, 0, 12), [210, 8, 70], { n: 5, w: .8 });
    b += K.spec(22.6, 31, .8, 3, 0) + K.tw(39, 36, 2.6) + K.tw(9, 8, 2, 't2');
    return K.svg(b);
  }
  b += K.glow(24, 24, 24, [36, 90, 64], .4) + K.shadow(24, 46, 15);
  var g = '';
  g += K.tube([[33, 3.6], [29, 6], [20, 13], [15.4, 24], [20, 35], [29, 42], [33, 44.4]], 3.8, wood);
  g += K.tube([[16, 21], [16, 27]], 4.6, lea, { straight: 1 });
  g += '<path d="M32.4,4.6 L32.4,43.4" stroke="' + K.H([40, 20, 84]) + '" stroke-width="' + (lvl === 1 ? 1.4 : .9) + '"/>';
  g += K.tube([[41, 24], [8, 24]], lvl === 1 ? 2.4 : 1.8, [36, 40, 66], { straight: 1 });
  g += K.part([[2, 24], [9, 20.2], [8, 24], [9, 27.8]], [210, 10, 80], { n: 4, w: .9 });
  g += K.part([[38, 24], [44.6, 19.2], [46, 20.6], [41.6, 24], [46, 27.4], [44.6, 28.8]], [2, 72, 50], { n: 6, w: .9 });
  b += '<g transform="rotate(-34 24 24) translate(24 24) scale(.88) translate(-24 -24)">' + g + '</g>';
  b += K.tw(40, 38, 2.6) + K.tw(8, 9, 2, 't2');
  return K.svg(b);
};
Object.keys(ICONS4).forEach(function (k) { ICONS[k] = ICONS4[k]; });
