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
  if (c.lvl === 3) add(c, '<circle cx="' + x + '" cy="' + n1(y - h * .3) + '" r="' + n1(h * .8) + '" fill="' + rad(c, [[0, hs(c, col, 10, .35)], [1, hs(c, col, 10, 0)]]) + '"/>');
}
function sackAt(c, x, y, s, col) {
  var d = c.lvl === 1 ?
    '<polygon points="' + pts([[x - s * .5, y], [x - s * .72, y - s * .5], [x - s * .4, y - s * .88], [x - s * .22, y - s * .95], [x + s * .22, y - s * .95], [x + s * .4, y - s * .88], [x + s * .72, y - s * .5], [x + s * .5, y]]) + '" fill="' + hs(c, col) + '"/><polygon points="' + pts([[x, y], [x, y - s * .95], [x + s * .4, y - s * .88], [x + s * .72, y - s * .5], [x + s * .5, y]]) + '" fill="' + hs(c, col, -12) + '"/>' :
    '<path d="M' + n1(x - s * .5) + ',' + y + ' C' + n1(x - s * .86) + ',' + n1(y - s * .3) + ' ' + n1(x - s * .6) + ',' + n1(y - s * .8) + ' ' + n1(x - s * .24) + ',' + n1(y - s * .94) + ' L' + n1(x + s * .24) + ',' + n1(y - s * .94) + ' C' + n1(x + s * .6) + ',' + n1(y - s * .8) + ' ' + n1(x + s * .86) + ',' + n1(y - s * .3) + ' ' + n1(x + s * .5) + ',' + y + ' Z" fill="' + fv(c, col, 10, -10) + '"/>';
  d += '<rect x="' + n1(x - s * .3) + '" y="' + n1(y - s * 1.02) + '" width="' + n1(s * .6) + '" height="' + n1(s * .13) + '" fill="' + hs(c, [28, 36, 30]) + '"/><polygon points="' + pts([[x - s * .24, y - s * 1.02], [x - s * .4, y - s * 1.28], [x - s * .08, y - s * 1.06]]) + '" fill="' + hs(c, col, -4) + '"/><polygon points="' + pts([[x + s * .24, y - s * 1.02], [x + s * .4, y - s * 1.28], [x + s * .08, y - s * 1.06]]) + '" fill="' + hs(c, col, -4) + '"/>';
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
  if (c.lvl === 3) add(c, '<circle cx="' + x + '" cy="' + y + '" r="' + r * 2.6 + '" fill="' + rad(c, [[0, hs(c, col, 10, .5)], [1, hs(c, col, 10, 0)]]) + '"/>');
  if (c.lvl === 1) add(c, '<polygon points="' + pts([[x, y - r], [x + r, y], [x, y + r], [x - r, y]]) + '" fill="' + hs(c, [46, 70, 56]) + '"/><polygon points="' + pts([[x, y - r * .62], [x + r * .62, y], [x, y + r * .62], [x - r * .62, y]]) + '" fill="' + hs(c, col) + '"/>');
  else add(c, '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fv(c, [44, 80, 62], 12, -12) + '"/><circle cx="' + x + '" cy="' + y + '" r="' + n1(r * .68) + '" fill="' + (c.lvl === 3 ? rad(c, [[0, hs(c, col, 22)], [1, hs(c, col, -4)]]) : hs(c, col)) + '"/><path d="M' + n1(x - r * .4) + ',' + n1(y - r * .2) + ' Q' + n1(x - r * .2) + ',' + n1(y - r * .5) + ' ' + n1(x + r * .1) + ',' + n1(y - r * .5) + '" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none" stroke-linecap="round"/>');
}
function noteAt(c, x, y, up) {
  var s = c.lvl === 1 ?
    '<rect x="' + n1(x - 8) + '" y="' + n1(y - 5) + '" width="16" height="10" fill="' + hs(c, [44, 80, 80]) + '"/>' : '<ellipse cx="' + x + '" cy="' + y + '" rx="8.6" ry="6" transform="rotate(-20 ' + x + ' ' + y + ')" fill="' + (c.lvl === 3 ? rad(c, [[0, '#fff6c8'], [1, hs(c, [44, 90, 62])]]) : hs(c, [44, 86, 74])) + '"/>';
  var sx = up ? x + 7.4 : x - 7.4;
  s += '<rect x="' + n1(sx - 1.5) + '" y="' + (up ? y - 34 : y) + '" width="3" height="34" fill="' + hs(c, [44, 80, 80]) + '"/>';
  add(c, c.lvl === 3 ? '<g class="twk t' + (Math.round(x) % 4) + '">' + s + '</g>' : s);
}
