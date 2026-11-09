/* drawing toolkit shared by the tab icons and the item pictures (one model, three renderings) */
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
function IK(lvl, px) {
  var K = { lvl: lvl }, defs = [], n = 0, pre = (px || 'i5') + (icN++) + '_';
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
  /* inside the place pictures (px given) no SVG filters: the whole picture is blurred once instead */
  function blur() { if (px) return 'none'; if (!blurF) { blurF = id(); defs.push('<filter id="' + blurF + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".7"/></filter>'); } return 'url(#' + blurF + ')'; }
  function soft() { if (px) return 'none'; if (!softF) { softF = id(); defs.push('<filter id="' + softF + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>'); } return 'url(#' + softF + ')'; }
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
  K.defsStr = function () { return defs.join(''); };
  K.svg = function (body) {
    var b = lvl === 3 ? '<g class="flt">' + body + '</g>' : body;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" focusable="false">' + (defs.length ? '<defs>' + defs.join('') + '</defs>' : '') + b + '</svg>';
  };
  return K;
}

