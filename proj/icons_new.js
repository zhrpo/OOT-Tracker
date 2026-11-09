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
  K.lin = function (s, x1, y1, x2, y2) {
    if (lvl === 1) return s[1];
    var id = i + (n++);
    defs.push(lvl === 2 ? icLin(id, s[0], s[2], 0, x1, y1, x2, y2) : icLin(id, s[0], s[1], s[2], x1, y1, x2, y2));
    return 'url(#' + id + ')';
  };
  K.rad = function (stops, cx, cy, r) { var id = i + (n++); defs.push(icRad(id, stops, cx, cy, r)); return 'url(#' + id + ')'; };
  K.sk = function (col, w) { return ' stroke="' + col + '" stroke-width="' + (lvl === 1 ? w * 2 : lvl === 2 ? w : w * .85) + '" stroke-linejoin="round" stroke-linecap="round"'; };
  K.defs = function () { return defs.join(''); };
  K.glow = function (x, y, r, col, a) { return lvl === 3 ? '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + K.rad([[0, col, a == null ? .5 : a], [1, col, 0]]) + '"/>' : ''; };
  K.hi = function (d, w, op) { return lvl === 1 ? '' : '<path d="' + d + '" fill="none" stroke="#fff" stroke-opacity="' + (op == null ? .8 : op) + '" stroke-width="' + (w || 1.6) + '" stroke-linecap="round"/>'; };
  K.tw = function (x, y, r, cls, fill) { return lvl === 3 ? star4(x, y, r, 'twk ' + (cls || ''), fill) : ''; };
  K.shadow = function (cx, cy, rx) { return lvl === 1 ? '' : '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="1.6" fill="#000" opacity="' + (lvl === 2 ? .16 : .2) + '"/>'; };
  /* S = { d: smooth path, p: low-poly points for N64 } */
  K.shp = function (S, fill, ol, w, extra) {
    var a = ' fill="' + fill + '"' + (ol ? K.sk(ol, w || 1) : '') + (extra || '');
    return lvl === 1 && S.p ? '<polygon points="' + S.p + '"' + a + '/>' : '<path d="' + S.d + '"' + a + '/>';
  };
  /* a flat shaded facet that only the N64 version shows (the others get gradients instead) */
  K.facet = function (p, fill) { return lvl === 1 ? '<polygon points="' + p + '" fill="' + fill + '"/>' : ''; };
  K.dot = function (x, y, r, fill, ol) {
    return lvl === 1 ? '<rect x="' + n1(x - r) + '" y="' + n1(y - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" fill="' + fill + '"/>' : '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' + (ol ? ' stroke="' + ol + '" stroke-width=".6"' : '') + '/>';
  };
  K.svg = function (body) { return icSvg(lvl, K.defs(), body); };
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
  if (lvl > 1) b += adult ? star4(28, 17.4, 2.8, '', '#ffe9a0') : '<path d="M10,34 C18,29 30,29 41,34" fill="none" stroke="#f6dcae" stroke-width="1.3" stroke-dasharray="2 2.4" opacity=".9"/>';
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

/* ----- hearts: child = one loose quarter of a heart, adult = a whole heart in a gold ring ----- */
var HEART = { d: 'M24,42 C10,32 4,24 4,16.5 C4,10 9,5.5 15,5.5 C19,5.5 22,7.8 24,11.4 C26,7.8 29,5.5 33,5.5 C39,5.5 44,10 44,16.5 C44,24 38,32 24,42 Z', p: '24,43 10,33 4,24 4,14 9,7 16,6 21,8 24,12 27,8 32,6 39,7 44,14 44,24 38,33' };
var QUAD = { d: 'M24,24 L24,11.4 C22,7.8 19,5.5 15,5.5 C9,5.5 4,10 4,16.5 C4,19.2 4.8,21.8 6,24 Z', p: '24,24 24,12 21,8 16,6 9,7 4,14 4,18 6,24' };
ICONS.heart = function (lvl, adult) {
  var K = kit(lvl), b = '', RED = ['#ff9aa8', '#e23548', '#8f1424'], dk = '#4a0c18';
  if (!adult) {
    b += K.glow(14, 14, 18, '#ff6b7e', .45);
    /* the heart it was cut from, faint, with the empty space where the piece used to sit */
    b += lvl === 1 ? '<polygon points="' + HEART.p + '" fill="none" stroke="#c98591" stroke-width="1.4"/>' : '<path d="' + HEART.d + '" fill="' + (lvl === 3 ? 'rgba(226,53,72,.1)' : 'rgba(226,53,72,.08)') + '" stroke="#c46f7e" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="3 2.6" stroke-linejoin="round"/>';
    b += K.shadow(24, 45.6, 12);
    b += '<g transform="translate(-1.6 -2) rotate(-7 14 14)">';
    b += K.shp(QUAD, lvl === 3 ? K.lin(['#ffc0c8', '#ff5a6e', '#c4243b'], 0, 0, 1, 1) : K.lin(RED, 0, 0, 1, 1), dk, 1.2);
    b += K.facet('24,24 24,12 21,8 16,6 9,7 4,14 12,15', '#ff7584') + K.hi('M7,18 C6.6,12.4 10,8.6 15.4,8.6', 2.2, .9);
    if (lvl > 1) b += '<path d="M9.4,23 C13,23.6 19,24.2 23.4,22.4" stroke="#7a1022" stroke-opacity=".35" stroke-width="1.1" fill="none"/>';
    b += '</g>' + K.tw(35, 8, 3, '', '#fff') + K.tw(36, 34, 2, 't2', '#ffd9df');
    return K.svg(b);
  }
  var G = ['#fff3c4', '#e6b13c', '#9a6410'], c = '24';
  b += K.glow(24, 24, 24, '#ff6b7e', .5) + K.shadow(24, 46.4, 14);
  if (lvl === 1) {
    b += '<polygon points="24,3 38,9 45,24 38,39 24,45 10,39 3,24 10,9" fill="#5a1626" stroke="#2a0a10" stroke-width="6"/><polygon points="24,3 38,9 45,24 38,39 24,45 10,39 3,24 10,9" fill="none" stroke="#e6b13c" stroke-width="3"/>';
  } else {
    b += '<circle cx="24" cy="24" r="20" fill="' + K.rad([[0, '#8a2236'], [1, '#3a0a16']], .5, .4, .7) + '"/><circle cx="24" cy="24" r="20" fill="none" stroke="' + dk + '" stroke-width="5.2"/><circle cx="24" cy="24" r="20" fill="none" stroke="' + K.lin(G, 0, 0, 1, 1) + '" stroke-width="3.2"/>';
    if (lvl === 3) b += '<circle cx="24" cy="24" r="21.4" fill="none" stroke="#fff6d0" stroke-opacity=".7" stroke-width=".6"/>';
  }
  [[24, 3.6], [44.4, 24], [24, 44.4], [3.6, 24]].forEach(function (g) {
    b += lvl === 1 ? '<rect x="' + (g[0] - 2.6) + '" y="' + (g[1] - 2.6) + '" width="5.2" height="5.2" fill="#ff5a6e" stroke="#2a0a10" stroke-width="1.4"/>' : '<circle cx="' + g[0] + '" cy="' + g[1] + '" r="2.7" fill="' + K.rad([[0, '#ffd0d6'], [.5, '#ff4a60'], [1, '#a31a31']], .4, .35, .7) + '" stroke="#e6b13c" stroke-width=".9"/>';
  });
  b += '<g transform="translate(24 25.6) scale(.64) translate(-24 -24)">';
  b += K.shp(HEART, lvl === 3 ? K.lin(['#ffc0c8', '#ff5a6e', '#a31a31'], 0, 0, 1, 1) : K.lin(RED, 0, 0, 1, 1), '#2a0a10', 1.6);
  b += K.facet('4,14 9,7 16,6 21,8 24,12 24,24 6,24', '#ff7584') + K.facet('24,12 27,8 32,6 39,7 44,14 44,24 38,33 24,43', '#b2202f') + K.hi('M8.4,17 C8,11.6 11.6,8 16.4,8', 2.6, .9);
  b += '</g>';
  b += K.tw(36, 11, 2.8, '', '#fff') + K.tw(12, 37, 2, 't2', '#ffe9ee');
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
  var WH = ['#ffffff', '#f1f3f8', '#b5c0d4'], ol2 = '#3a4358', red = ['#ff9a8a', '#e23a30', '#9a1a18'], yel = ['#ffe58a', '#f2b33a', '#b8741a'];
  var BODY = { d: 'M10,30 C10,22 18,18 26,19 C35,20 40,26 38,33 C36,40 28,42 21,41 C14,40 10,36 10,30 Z', p: '10,30 13,23 20,19 28,19 36,23 39,30 36,38 28,42 20,41 13,37' };
  var WING = { d: 'M17,28 C22,24 30,25 33,31 C29,35 21,35 17,28 Z', p: '17,28 22,25 30,25 33,31 28,35 21,34' };
  b += K.glow(24, 28, 24, '#cfe0ff', .45) + K.shadow(24, 46.4, 14);
  /* legs, then tail feathers, then body */
  b += '<g fill="none" stroke="' + ol2 + '" stroke-width="' + (lvl === 1 ? 4 : 3.4) + '" stroke-linecap="round" stroke-linejoin="round"><path d="M21,40 L20.4,45 M28,40 L28.8,45 M17.4,46 L20.4,45 L23,46.2 M26,46.2 L28.8,45 L31.6,46"/></g><g fill="none" stroke="#f2b33a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21,40 L20.4,45 M28,40 L28.8,45 M17.4,46 L20.4,45 L23,46.2 M26,46.2 L28.8,45 L31.6,46"/></g>';
  b += K.shp({ d: 'M34,31 C35,22 39,16 44,13 C45,18 45,22 43.4,25 C46,24 47.2,24 47.6,24 C46.6,30 42,35 36,36 Z', p: '34,31 36,22 40,16 44,13 45,19 44,24 47,24 45,31 40,35 36,36' }, K.lin(WH, 0, 0, 1, 1), ol2, 1);
  b += K.shp(BODY, K.lin(WH, .2, 0, .8, 1), ol2, 1);
  b += K.facet('28,19 36,23 39,30 36,38 28,42 24,30', '#cfd6e4');
  b += K.shp(WING, K.lin(['#ffffff', '#dfe6f2', '#9fb0cc'], 0, 0, 1, 1), ol2, .8);
  if (lvl > 1) b += '<path d="M20,30.4 Q25,28.6 30,30.2 M21.6,33 Q25.6,31.6 29,32.6" fill="none" stroke="#8a9bb8" stroke-opacity=".7" stroke-width=".8" stroke-linecap="round"/>';
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

