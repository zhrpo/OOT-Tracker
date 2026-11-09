/* ---------- tab icons: one picture per tab, three levels of detail ----------
   1 = N64: 32x32 grid, a handful of flat facets, hard dark outline, no gradients.
   2 = 3DS: 48x48, smooth shapes with gradients, a thin outline and a gloss highlight.
   3 = Switch 2: 48x48, layered gradients, soft glow, specular streaks, fine detail and a little life.
   All of them are original drawings. */
var icN = 0;
function icId() { return 'ic' + (icN++) + '_'; }
function icSvg(lvl, defs, body) {
  var box = lvl === 1 ? 32 : 48;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + box + ' ' + box + '" focusable="false"' + (lvl === 1 ? ' shape-rendering="crispEdges"' : '') + '>' + (defs ? '<defs>' + defs + '</defs>' : '') + body + '</svg>';
}
function icLin(id, a, b, c, x1, y1, x2, y2) {
  return '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '"><stop offset="0" stop-color="' + a + '"/>' + (c ? '<stop offset=".55" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/>' : '<stop offset="1" stop-color="' + b + '"/>') + '</linearGradient>';
}
function icRad(id, stops, cx, cy, r) {
  return '<radialGradient id="' + id + '" cx="' + (cx == null ? .5 : cx) + '" cy="' + (cy == null ? .5 : cy) + '" r="' + (r == null ? .5 : r) + '">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>';
}
/* N64 sprites: every facet is drawn twice, first fat and dark as the outline, then in its own colour */
function icFacets(list, ol) {
  var o = '<g fill="' + ol + '" stroke="' + ol + '" stroke-width="2.6" stroke-linejoin="miter" stroke-miterlimit="2">';
  list.forEach(function (s) { o += '<polygon points="' + s[0] + '"/>'; });
  o += '</g>';
  list.forEach(function (s) { o += '<polygon points="' + s[0] + '" fill="' + s[1] + '"/>'; });
  return o;
}
function star4(x, y, r, cls, fill) {
  return '<path class="' + (cls || '') + '" d="M' + x + ',' + (y - r) + ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y + r) + ' Q' + x + ',' + y + ' ' + (x - r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y - r) + ' Z" fill="' + (fill || '#fff') + '"/>';
}

var ICONS = {};

/* ----- main quest: a legendary sword ----- */
ICONS.main = function (lvl) {
  var i = icId(), d, b;
  if (lvl === 1) {
    return icSvg(1, '', icFacets([
      ['16,1 12,19 16,19', '#f2f6fc'], ['16,1 16,19 20,19', '#a3b4d2'],
      ['4,22 8,19 24,19 28,22 16,23', '#8274e8'], ['4,22 16,23 28,22 25,25 7,25', '#4b40a8'],
      ['15,21 17,21 17,23 15,23', '#86e6ff'],
      ['14,25 18,25 18,29 14,29', '#34479e'], ['16,25 18,25 18,29 16,29', '#222f78'],
      ['13,29 19,29 19,31 13,31', '#e6bc40']
    ], '#17122c'));
  }
  var bl = 'M24,2.5 L19.4,30 L28.6,30 Z';
  var guard = 'M24,30.2 L16.5,31 C12,31.2 8,29.6 5.2,25.6 C8,27.2 10.8,27.4 13.4,26.4 L19.4,28.2 L28.6,28.2 L34.6,26.4 C37.2,27.4 40,27.2 42.8,25.6 C40,29.6 36,31.2 31.5,31 Z';
  if (lvl === 2) {
    d = icLin(i + 'a', '#ffffff', '#c3d1e8') + icLin(i + 'b', '#b9c8e2', '#7d92b8') + icLin(i + 'g', '#8f82f2', '#3a2f9a') + icLin(i + 'h', '#3d58c4', '#1d2a76') + icLin(i + 'p', '#ffe58a', '#c8942a') + icRad(i + 'j', [[0, '#e5fbff'], [1, '#3fb6e8']]);
    b = '<g stroke="#5a6592" stroke-width=".9" stroke-linejoin="round"><path d="M24,2.5 L19.4,30 L24,30 Z" fill="url(#' + i + 'a)"/><path d="M24,2.5 L24,30 L28.6,30 Z" fill="url(#' + i + 'b)"/></g>' +
      '<g stroke="#1b1550" stroke-width="1" stroke-linejoin="round">' +
      '<rect x="21.4" y="30.6" width="5.2" height="10.6" rx="1.2" fill="url(#' + i + 'h)"/>' +
      '<path d="' + guard + '" fill="url(#' + i + 'g)"/><circle cx="24" cy="43.4" r="3" fill="url(#' + i + 'p)"/></g>' +
      '<circle cx="24" cy="29.6" r="2.1" fill="url(#' + i + 'j)" stroke="#1b1550" stroke-width=".7"/>' +
      '<path d="M22.4,6 L20.6,26 L21.6,26 Z" fill="#fff" opacity=".8"/>' +
      '<path d="M12,28.4 C9.5,28.2 7.8,27.4 6.6,26.2" stroke="#fff" stroke-opacity=".55" stroke-width="1" fill="none" stroke-linecap="round"/>' +
      '<g stroke="#10184a" stroke-opacity=".55" stroke-width=".8"><path d="M21.6,34.2 H26.4"/><path d="M21.6,36.8 H26.4"/><path d="M21.6,39.4 H26.4"/></g>';
    return icSvg(2, d, b);
  }
  d = icLin(i + 'a', '#ffffff', '#dfe8f6', '#b3c3e0', 0, 0, 1, 0) + icLin(i + 'b', '#c4d2ea', '#8ea3c8', '#6a80ab', 0, 0, 1, 0) +
    icLin(i + 'g', '#a79cff', '#5646c8', '#2c2380') + icLin(i + 'h', '#4a66d6', '#25358c', '#141c58', 0, 0, 1, 0) + icLin(i + 'p', '#fff0b0', '#e2b13c', '#a8741c') +
    icRad(i + 'j', [[0, '#ffffff'], [.4, '#9ef0ff'], [1, '#2ea4e6']]) + icRad(i + 'o', [[0, '#7fb8ff', .55], [1, '#7fb8ff', 0]]) +
    icLin(i + 't', '#ffe9a0', '#c99a2e');
  b = '<circle cx="24" cy="18" r="22" fill="url(#' + i + 'o)"/>' +
    '<path d="M24,2.5 L19.4,30 L24,30 Z" fill="url(#' + i + 'a)"/><path d="M24,2.5 L24,30 L28.6,30 Z" fill="url(#' + i + 'b)"/>' +
    '<path d="M24,2.5 L19.4,30 L28.6,30 Z" fill="none" stroke="#e7f0ff" stroke-opacity=".9" stroke-width=".6" stroke-linejoin="round"/>' +
    '<path d="M24,6 L24,28" stroke="#7f95bd" stroke-opacity=".75" stroke-width=".9"/><path d="M22.8,7 L21,27" stroke="#fff" stroke-opacity=".9" stroke-width=".7" stroke-linecap="round"/>' +
    '<path d="M25.2,9 L26.6,27" stroke="#5c739d" stroke-opacity=".35" stroke-width=".7"/>' +
    '<rect x="21.4" y="30.4" width="5.2" height="10.8" rx="1.4" fill="url(#' + i + 'h)"/>' +
    '<g stroke="#0e1448" stroke-opacity=".6" stroke-width=".8"><path d="M21.6,33.8 L26.4,35.2"/><path d="M21.6,36.4 L26.4,37.8"/><path d="M21.6,39 L26.4,40.4"/></g>' +
    '<path d="' + guard + '" fill="url(#' + i + 'g)"/>' +
    '<path d="M24,30.2 L16.5,31 C12,31.2 8,29.6 5.2,25.6 C8,27.2 10.8,27.4 13.4,26.4 L19.4,28.2 L28.6,28.2 L34.6,26.4 C37.2,27.4 40,27.2 42.8,25.6" fill="none" stroke="url(#' + i + 't)" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M13,27 C10,26.6 8,25.8 6.4,24.6" stroke="#fff" stroke-opacity=".55" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M35,27 C38,26.6 40,25.8 41.6,24.6" stroke="#fff" stroke-opacity=".25" stroke-width="1" fill="none" stroke-linecap="round"/>' +
    '<circle cx="24" cy="29.5" r="2.5" fill="url(#' + i + 'j)" stroke="#e9c35a" stroke-width=".8"/><circle cx="23.2" cy="28.7" r=".7" fill="#fff"/>' +
    '<circle cx="24" cy="43.5" r="3" fill="url(#' + i + 'p)"/><circle cx="23" cy="42.4" r=".9" fill="#fff" opacity=".85"/>' +
    star4(24, 4.5, 3, 'twk', '#fff') + star4(31, 14, 2, 'twk t2', '#cfe6ff');
  return icSvg(3, d, b);
};

/* ----- skulltulas: a golden spider with a skull on its back ----- */
ICONS.skull = function (lvl) {
  var i = icId(), d, b, legsR = [['31,24 38,16 44,20'], ['32,28 42,25 46,31'], ['32,32 42,33 45,40'], ['30,36 37,41 39,46']];
  if (lvl === 1) {
    var legs = ['10,15 5,9 2,12', '10,18 3,17 1,22', '10,21 3,23 2,28', '11,25 6,28 5,31', '22,15 27,9 30,12', '22,18 29,17 31,22', '22,21 29,23 30,28', '21,25 26,28 27,31'], s = '';
    s += '<g fill="none" stroke="#2a1a05" stroke-width="3.2" stroke-linejoin="miter">' + legs.map(function (p) { return '<polyline points="' + p + '"/>'; }).join('') + '</g>';
    s += '<g fill="none" stroke="#f2b92f" stroke-width="1.4" stroke-linejoin="miter">' + legs.map(function (p) { return '<polyline points="' + p + '"/>'; }).join('') + '</g>';
    s += icFacets([
      ['10,16 13,12 19,12 22,16 22,23 19,27 13,27 10,23', '#f4bc30'], ['16,12 19,12 22,16 22,23 19,27 16,27', '#d49b1c'],
      ['13,7 19,7 20,10 19,12 13,12 12,10', '#f4bc30']
    ], '#2a1a05');
    s += '<polygon points="13,15 19,15 20,18 19,20 13,20 12,18" fill="#3a2206"/><polygon points="14,20 18,20 18,23 14,23" fill="#3a2206"/>' +
      '<rect x="13" y="17" width="2" height="2" fill="#f4bc30"/><rect x="17" y="17" width="2" height="2" fill="#f4bc30"/><rect x="15" y="21" width="2" height="1" fill="#f4bc30"/>' +
      '<rect x="13" y="8" width="2" height="2" fill="#e8322a"/><rect x="17" y="8" width="2" height="2" fill="#e8322a"/>';
    return icSvg(1, '', s);
  }
  function legSet(sw, col, ex) {
    var o = '', k, p, q;
    legsR.forEach(function (L) {
      p = L[0].split(' ').map(function (v) { return v.split(',').map(Number); });
      o += '<polyline points="' + p.map(function (v) { return v[0] + ',' + v[1]; }).join(' ') + '" />';
      o += '<polyline points="' + p.map(function (v) { return (48 - v[0]) + ',' + v[1]; }).join(' ') + '" />';
    });
    return '<g fill="none" stroke="' + col + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"' + (ex || '') + '>' + o + '</g>';
  }
  var skull = '<circle cx="24" cy="26" r="4.7" fill="#3a2206"/><rect x="21.2" y="28.6" width="5.6" height="4.4" rx="1.2" fill="#3a2206"/>' +
    '<circle cx="22.1" cy="26" r="1.35" fill="#f6c545"/><circle cx="25.9" cy="26" r="1.35" fill="#f6c545"/><path d="M24,27.6 L23.2,29 H24.8 Z" fill="#f6c545"/>' +
    '<path d="M22.6,30.6 V32.6 M24,30.6 V32.6 M25.4,30.6 V32.6" stroke="#f6c545" stroke-width=".7"/>';
  if (lvl === 2) {
    d = icRad(i + 'a', [[0, '#ffe58a'], [.6, '#f2b92f'], [1, '#b87a12']], .38, .3, .75) + icRad(i + 'h', [[0, '#ffe58a'], [1, '#d9a02a']], .4, .3, .8);
    b = legSet(4.2, '#3a2206') + legSet(2.4, '#e6a828') +
      '<ellipse cx="24" cy="29" rx="9.8" ry="11.8" fill="url(#' + i + 'a)" stroke="#3a2206" stroke-width="1"/><circle cx="24" cy="15.5" r="5.2" fill="url(#' + i + 'h)" stroke="#3a2206" stroke-width="1"/>' +
      skull + '<circle cx="22" cy="15" r="1.3" fill="#e8322a"/><circle cx="26" cy="15" r="1.3" fill="#e8322a"/>' +
      '<ellipse cx="17.6" cy="28" rx="1.8" ry="4.4" fill="#fff" opacity=".45" transform="rotate(-10 17.6 28)"/>';
    return icSvg(2, d, b);
  }
  d = icRad(i + 'a', [[0, '#fff1b0'], [.35, '#f6c23a'], [.8, '#b97c12'], [1, '#7a4b08']], .36, .28, .85) + icRad(i + 'h', [[0, '#fff1b0'], [.5, '#eeb42c'], [1, '#9a6410']], .4, .3, .8) +
    icRad(i + 'o', [[0, '#ffd45a', .5], [1, '#ffd45a', 0]]) + icLin(i + 'l', '#f9cf55', '#a86c0e');
  var joints = '';
  legsR.forEach(function (L) { var p = L[0].split(' ').map(function (v) { return v.split(','); }); joints += '<circle cx="' + p[1][0] + '" cy="' + p[1][1] + '" r="1.6" fill="#8a5a0c"/><circle cx="' + (48 - p[1][0]) + '" cy="' + p[1][1] + '" r="1.6" fill="#8a5a0c"/>'; });
  b = '<circle cx="24" cy="28" r="23" fill="url(#' + i + 'o)"/>' + legSet(4, '#2a1704') + legSet(2.3, 'url(#' + i + 'l)') + joints +
    '<ellipse cx="24" cy="29" rx="10" ry="12" fill="url(#' + i + 'a)"/><ellipse cx="24" cy="29" rx="10" ry="12" fill="none" stroke="#5a3606" stroke-width=".9"/>' +
    '<circle cx="24" cy="15.5" r="5.3" fill="url(#' + i + 'h)" stroke="#5a3606" stroke-width=".9"/>' +
    '<path d="M22.6,19.4 L22.2,21.6 L23.6,20 Z M25.4,19.4 L25.8,21.6 L24.4,20 Z" fill="#3a2206"/>' + skull +
    '<circle class="twk" cx="22" cy="14.8" r="1.4" fill="#ff4a3a"/><circle class="twk t2" cx="26" cy="14.8" r="1.4" fill="#ff4a3a"/><circle cx="21.6" cy="14.4" r=".5" fill="#fff"/><circle cx="25.6" cy="14.4" r=".5" fill="#fff"/>' +
    '<ellipse cx="17.4" cy="27" rx="1.9" ry="4.6" fill="#fff" opacity=".5" transform="rotate(-10 17.4 27)"/><path d="M16,34 C17,38 20,40 24,40.6" stroke="#fff" stroke-opacity=".25" stroke-width="1" fill="none" stroke-linecap="round"/>' +
    star4(38, 9, 3, 'twk', '#fff6c8') + star4(8, 38, 2.2, 'twk t2', '#fff6c8');
  return icSvg(3, d, b);
};

/* ----- hearts: a heart cut into four pieces, one of them lit ----- */
var HEART = 'M24,42 C10,32 4,24 4,16.5 C4,10 9,5.5 15,5.5 C19,5.5 22,7.8 24,11.4 C26,7.8 29,5.5 33,5.5 C39,5.5 44,10 44,16.5 C44,24 38,32 24,42 Z';
ICONS.heart = function (lvl) {
  var i = icId(), d, b;
  if (lvl === 1) {
    return icSvg(1, '', icFacets([
      ['3,8 6,5 11,5 16,9 16,15 4,15 3,12', '#ff7584'], ['16,9 21,5 26,5 29,8 29,12 28,15 16,15', '#d8303f'],
      ['4,15 16,15 16,28 5,17', '#b2202f'], ['16,15 28,15 27,17 16,28', '#97182a']
    ], '#2a0a10') + '<polyline points="16,9 16,28" stroke="#2a0a10" stroke-width="1" fill="none"/><polyline points="3,15 29,15" stroke="#2a0a10" stroke-width="1" fill="none"/><rect x="6" y="7" width="3" height="2" fill="#ffd1d6"/>');
  }
  var quad = function (x, y, fill) { return '<rect x="' + x + '" y="' + y + '" width="24" height="24" fill="' + fill + '"/>'; };
  if (lvl === 2) {
    d = '<clipPath id="' + i + 'c"><path d="' + HEART + '"/></clipPath>' + icLin(i + 'a', '#ff8190', '#e23548') + icLin(i + 'b', '#e8404f', '#b9202f') + icLin(i + 'd', '#c42a3a', '#8f1424');
    b = '<g clip-path="url(#' + i + 'c)">' + quad(0, 0, 'url(#' + i + 'a)') + quad(24, 0, 'url(#' + i + 'b)') + quad(0, 24, 'url(#' + i + 'd)') + quad(24, 24, 'url(#' + i + 'd)') +
      '<path d="M24,0 V48 M0,24 H48" stroke="#4a0c18" stroke-opacity=".7" stroke-width="1.4"/></g>' +
      '<path d="' + HEART + '" fill="none" stroke="#4a0c18" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M8,15 C8,11 11,8.6 15,8.6" stroke="#fff" stroke-opacity=".85" stroke-width="2" fill="none" stroke-linecap="round"/>';
    return icSvg(2, d, b);
  }
  d = '<clipPath id="' + i + 'c"><path d="' + HEART + '"/></clipPath>' + icLin(i + 'a', '#ffc0c8', '#ff5a6e', '#d92a42') + icLin(i + 'b', '#ff6275', '#d52c42', '#a31a31') + icLin(i + 'd', '#d9344a', '#a51c33', '#6d0f22') +
    icRad(i + 'o', [[0, '#ff6b7e', .5], [1, '#ff6b7e', 0]]) + icLin(i + 'r', '#fff3c4', '#e0aa3a');
  b = '<circle cx="24" cy="24" r="24" fill="url(#' + i + 'o)"/>' +
    '<g clip-path="url(#' + i + 'c)">' + quad(0, 0, 'url(#' + i + 'a)') + quad(24, 0, 'url(#' + i + 'b)') + quad(0, 24, 'url(#' + i + 'd)') + quad(24, 24, 'url(#' + i + 'd)') +
    '<path d="M24,0 V48 M0,24 H48" stroke="#3d0812" stroke-opacity=".75" stroke-width="1.5"/>' +
    '</g>' +
    '<path d="' + HEART + '" fill="none" stroke="url(#' + i + 'r)" stroke-width="1.3" stroke-linejoin="round"/>' +
    '<path d="M7.6,16 C7.4,11.4 10.8,8.2 15.4,8.2" stroke="#fff" stroke-opacity=".9" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="19.2" cy="8.6" r="1" fill="#fff" opacity=".8"/>' +
    '<path d="M40,17 C40,21 37,26 33,30" stroke="#ffb3be" stroke-opacity=".35" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
    star4(36, 8, 3, 'twk', '#fff') + star4(11, 32, 2, 'twk t2', '#ffd9df');
  return icSvg(3, d, b);
};

/* ----- side quests: a parchment scroll with a gold exclamation mark ----- */
ICONS.side = function (lvl) {
  var i = icId(), d, b;
  if (lvl === 1) {
    return icSvg(1, '', icFacets([
      ['5,4 27,4 27,8 5,8', '#d9a95e'], ['7,8 25,8 25,24 7,24', '#f6e8b6'], ['7,8 10,8 10,24 7,24', '#e2cd90'], ['5,24 27,24 27,28 5,28', '#b98a45']
    ], '#2a1b08') +
      '<rect x="12" y="11" width="10" height="1" fill="#8a6a3a"/><rect x="12" y="14" width="8" height="1" fill="#8a6a3a"/><rect x="12" y="17" width="9" height="1" fill="#8a6a3a"/>' +
      icFacets([['21,17 27,17 29,19 29,23 27,25 21,25 19,23 19,19', '#e8432f']], '#2a1b08') + '<rect x="23" y="19" width="2" height="3" fill="#fff"/><rect x="23" y="23" width="2" height="1" fill="#fff"/>');
  }
  if (lvl === 2) {
    d = icLin(i + 'p', '#fff3c8', '#eed79a') + icLin(i + 'r', '#e9bd73', '#b9884a') + icRad(i + 'b', [[0, '#ff9a6a'], [1, '#d6341f']], .4, .3, .8);
    b = '<g stroke="#4a3216" stroke-width="1" stroke-linejoin="round"><rect x="9" y="8" width="28" height="30" fill="url(#' + i + 'p)"/><rect x="5" y="5" width="36" height="6" rx="3" fill="url(#' + i + 'r)"/><rect x="5" y="37" width="36" height="6" rx="3" fill="url(#' + i + 'r)"/></g>' +
      '<g stroke="#9a7a48" stroke-width="1.6" stroke-linecap="round"><path d="M14,16 H32"/><path d="M14,21 H28"/><path d="M14,26 H30"/></g>' +
      '<circle cx="35" cy="33" r="8.5" fill="url(#' + i + 'b)" stroke="#4a1208" stroke-width="1"/><rect x="33.6" y="27" width="2.8" height="7" rx="1.2" fill="#fff"/><circle cx="35" cy="37" r="1.5" fill="#fff"/>' +
      '<path d="M8,8.4 H18" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" stroke-linecap="round"/>';
    return icSvg(2, d, b);
  }
  d = icLin(i + 'p', '#fffbe6', '#f3e0a8', '#dcc080') + icLin(i + 'r', '#f4d08e', '#c9985a', '#8f6431') + icRad(i + 'b', [[0, '#ffc39a'], [.45, '#f2573a'], [1, '#a81d12']], .38, .28, .85) + icRad(i + 'o', [[0, '#ffd38a', .4], [1, '#ffd38a', 0]]) + icLin(i + 'g', '#fff6c8', '#e6b84a');
  b = '<circle cx="24" cy="24" r="24" fill="url(#' + i + 'o)"/>' +
    '<path d="M9,9 H37 V38 H9 Z" fill="url(#' + i + 'p)"/><path d="M9,9 H13 V38 H9 Z" fill="#8a5a18" opacity=".18"/>' +
    '<rect x="5" y="5" width="36" height="6.4" rx="3.2" fill="url(#' + i + 'r)"/><ellipse cx="5.2" cy="8.2" rx="1.8" ry="3.2" fill="#a97a3f"/><ellipse cx="40.8" cy="8.2" rx="1.8" ry="3.2" fill="#c89a58"/>' +
    '<rect x="5" y="36.6" width="36" height="6.4" rx="3.2" fill="url(#' + i + 'r)"/><ellipse cx="5.2" cy="39.8" rx="1.8" ry="3.2" fill="#a97a3f"/><ellipse cx="40.8" cy="39.8" rx="1.8" ry="3.2" fill="#c89a58"/>' +
    '<path d="M6.5,7 H36" stroke="#fff" stroke-opacity=".75" stroke-width="1.2" stroke-linecap="round"/><path d="M6.5,38.4 H36" stroke="#fff" stroke-opacity=".5" stroke-width="1" stroke-linecap="round"/>' +
    '<g stroke="#8b6a3a" stroke-opacity=".75" stroke-width="1.5" stroke-linecap="round"><path d="M14,16 H32"/><path d="M14,20.4 H27"/><path d="M14,24.8 H30"/><path d="M14,29.2 H24"/></g>' +
    '<circle cx="35" cy="32.5" r="9" fill="url(#' + i + 'b)" stroke="url(#' + i + 'g)" stroke-width="1.4"/><path d="M35,32.5 m-7.4,0 a7.4,7.4 0 0 1 14.8,0" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>' +
    '<rect x="33.5" y="26.4" width="3" height="7.4" rx="1.5" fill="#fff"/><circle cx="35" cy="37.2" r="1.7" fill="#fff"/><ellipse cx="31.6" cy="27.6" rx="3" ry="1.5" fill="#fff" opacity=".45" transform="rotate(-35 31.6 27.6)"/>' +
    star4(9, 31, 2.4, 'twk', '#fff7d0');
  return icSvg(3, d, b);
};

/* ----- items: a corked glass bottle with red potion ----- */
ICONS.items = function (lvl) {
  var i = icId(), d, b;
  var BODY = 'M21.4,16 C14,19.4 10,25 10,31 C10,39 16.5,44.6 24,44.6 C31.5,44.6 38,39 38,31 C38,25 34,19.4 26.6,16 Z';
  if (lvl === 1) {
    return icSvg(1, '', icFacets([
      ['13,3 19,3 19,6 13,6', '#c98d4a'], ['13,6 19,6 19,11 13,11', '#d8ecf6'],
      ['13,11 19,11 24,15 27,21 25,27 20,30 12,30 7,27 5,21 8,15', '#d3e9f5'],
      ['5,21 27,21 25,27 20,30 12,30 7,27', '#e8476c'], ['16,21 27,21 25,27 20,30 16,30', '#c62f55']
    ], '#10222e') + '<polygon points="9,14 11,13 10,18" fill="#fff"/><rect x="8" y="22" width="3" height="4" fill="#ff9db3"/>');
  }
  if (lvl === 2) {
    d = '<clipPath id="' + i + 'c"><path d="' + BODY + '"/></clipPath>' + icLin(i + 'g', '#f4fbff', '#bfe0f0') + icLin(i + 'l', '#ff7a98', '#c82a52') + icLin(i + 'k', '#e9b36e', '#a8733a');
    b = '<g stroke="#1b3a4c" stroke-width="1" stroke-linejoin="round"><rect x="20.6" y="9" width="6.8" height="7.4" fill="url(#' + i + 'g)"/><path d="' + BODY + '" fill="url(#' + i + 'g)"/><rect x="20" y="3.6" width="8" height="6.4" rx="1.8" fill="url(#' + i + 'k)"/></g>' +
      '<g clip-path="url(#' + i + 'c)"><rect x="0" y="25" width="48" height="24" fill="url(#' + i + 'l)"/><ellipse cx="24" cy="25" rx="14" ry="2.2" fill="#ffb3c4"/></g>' +
      '<path d="' + BODY + '" fill="none" stroke="#1b3a4c" stroke-width="1" stroke-linejoin="round"/>' +
      '<path d="M14.6,28 C14.6,25 16.4,22.4 19,20.4" stroke="#fff" stroke-opacity=".9" stroke-width="2" fill="none" stroke-linecap="round"/>';
    return icSvg(2, d, b);
  }
  d = '<clipPath id="' + i + 'c"><path d="' + BODY + '"/></clipPath>' + icLin(i + 'g', '#ffffff', '#d4ecf8', '#9fcbe0') + icLin(i + 'l', '#ff8aa6', '#e03a62', '#9e1f45') + icLin(i + 'k', '#f3c585', '#bf8845', '#7e5222') +
    icRad(i + 'o', [[0, '#ff7a9c', .45], [1, '#ff7a9c', 0]]);
  b = '<circle cx="24" cy="31" r="22" fill="url(#' + i + 'o)"/>' +
    '<rect x="20.6" y="9" width="6.8" height="7.6" fill="url(#' + i + 'g)" opacity=".9"/><path d="' + BODY + '" fill="url(#' + i + 'g)" opacity=".9"/>' +
    '<g clip-path="url(#' + i + 'c)"><rect x="0" y="25.4" width="48" height="24" fill="url(#' + i + 'l)"/><ellipse cx="24" cy="25.4" rx="15" ry="2.6" fill="#ffc2d1"/><ellipse cx="24" cy="25.2" rx="12" ry="1.5" fill="#fff" opacity=".4"/>' +
    '<circle cx="19" cy="35" r="1.2" fill="#fff" opacity=".55"/><circle cx="29.5" cy="38.5" r=".9" fill="#fff" opacity=".5"/><circle class="twk" cx="25" cy="31" r="1" fill="#fff" opacity=".6"/></g>' +
    '<path d="' + BODY + '" fill="none" stroke="#7fb0c8" stroke-width="1.1" stroke-linejoin="round"/><rect x="20.6" y="9" width="6.8" height="7.6" fill="none" stroke="#7fb0c8" stroke-width="1"/>' +
    '<rect x="19.6" y="3.4" width="8.8" height="7" rx="2" fill="url(#' + i + 'k)"/><path d="M21,5.4 H27 M21,8 H27" stroke="#6b4318" stroke-opacity=".5" stroke-width=".8"/><path d="M20.8,4.6 H25" stroke="#fff" stroke-opacity=".6" stroke-width="1" stroke-linecap="round"/>' +
    '<path d="M14.4,29 C14.2,25.2 16.2,22.2 19.4,20" stroke="#fff" stroke-opacity=".95" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M33.6,38 C31.8,40.6 29,42 26,42.4" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '<circle cx="22.6" cy="12.5" r=".9" fill="#fff" opacity=".8"/>' + star4(37, 14, 2.6, 'twk', '#fff');
  return icSvg(3, d, b);
};
