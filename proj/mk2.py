import re
src = open("theme.js", encoding="utf-8").read()
head, tail = src.split("/* ---------- public API ---------- */")

def rep(s, old, new, count=1):
    assert old in s, old[:60]
    return s.replace(old, new, count)

# 1. colour grading per console: N64 = few chunky colours, 3DS = clean and bright, Switch 2 = filmic contrast
head = rep(head, """function hs(c, a, dl, al) {
  var l = a[2] + (dl || 0);
  if (c.lvl === 1) l = Math.round(l / 8) * 8;
  l = clamp(Math.round(l), 3, 96);
  return al == null ? 'hsl(' + Math.round(a[0]) + ',' + Math.round(a[1]) + '%,' + l + '%)' : 'hsla(' + Math.round(a[0]) + ',' + Math.round(a[1]) + '%,' + l + '%,' + al + ')';
}""", """function hs(c, a, dl, al) {
  var l = a[2] + (dl || 0), s = a[1], h = a[0];
  if (c.lvl === 1) { l = Math.round(l / 10) * 10; s = Math.round(s / 14) * 14; h = Math.round(h / 20) * 20; }
  else if (c.lvl === 2) { s = s * .92; if (l < 70) l += 3; }
  else { l = l + (l - 50) * .14; s = Math.min(100, s * 1.1); }
  l = clamp(Math.round(l), 3, 96);
  return al == null ? 'hsl(' + Math.round(h) + ',' + Math.round(s) + '%,' + l + '%)' : 'hsla(' + Math.round(h) + ',' + Math.round(s) + '%,' + l + '%,' + al + ')';
}
/* far layers on Switch 2 are softly out of focus */
function far(c, s) { return c.lvl === 3 ? '<g filter="url(#§dof)">' + s + '</g>' : s; }""")

# 2. depth of field on the furthest ridge and peaks
head = rep(head, """  if (c.lvl === 3) { add(c, '<path d="' + smooth(P, H) + '" fill="' + fv(c, col, 10, -6) + '"/>'); return; }""",
 """  if (c.lvl === 3) { var rp = '<path d="' + smooth(P, H) + '" fill="' + fv(c, col, 10, -6) + '"/>'; add(c, i === 0 ? far(c, rp) : rp); return; }""")
head = rep(head, """    add(c, s);
  });
}
function waves(""", """    add(c, i === 0 ? far(c, s) : s);
  });
}
function waves(""")

# 3. denser forests on Switch 2, sparser on N64
head = rep(head, "  var r = c.rs[ri == null ? i : ri], col = lcol(c, i, n, 6);\n  for (var k = 0; k < count; k++) pine(",
                 "  var r = c.rs[ri == null ? i : ri], col = lcol(c, i, n, 6);\n  count = Math.round(count * [.7, 1, 1.45][c.lvl - 1]);\n  for (var k = 0; k < count; k++) pine(")

tail_new = r"""/* ---------- public API ---------- */
var cache = {}, seq = 0;
function svgFor(key, ver) {
  var ck = key + '|' + ver;
  if (cache[ck]) return cache[ck];
  var c = Ctx(key, ver);
  (SC[c.A.k] || SC.field)(c);
  var root = c.lvl === 1 ? ' shape-rendering="crispEdges"' : '';
  var body = c.o.join(''), extra = '', defs = c.defs.join('');
  if (c.lvl === 1) {
    /* low resolution: the whole picture is sampled into chunky blocks, like a 320x240 screen stretched up */
    defs += '<filter id="§px" x="0" y="0" width="100%" height="100%"><feFlood x="4" y="4" height="2" width="2"/><feComposite width="8" height="8"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="4"/></filter>';
    body = '<g filter="url(#§px)">' + body + '</g>';
  }
  if (c.lvl === 2) {
    /* handheld: clean and bright with a glossy sheen on top and a soft layered edge below */
    defs += '<linearGradient id="§gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="§sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2a4a" stop-opacity="0"/><stop offset="1" stop-color="#0a2a4a" stop-opacity=".3"/></linearGradient>';
    extra = '<rect width="1200" height="70" fill="url(#§gl)"/><rect y="104" width="1200" height="36" fill="url(#§sh)"/>';
  }
  if (c.lvl === 3) {
    /* console: soft light shafts, bloom and a vignette, with far layers blurred */
    defs += '<filter id="§dof" x="-2%" y="-10%" width="104%" height="120%"><feGaussianBlur stdDeviation="1.8"/></filter>' +
      '<radialGradient id="§vg" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></radialGradient>' +
      '<linearGradient id="§sf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="§bl" cx=".16" cy="0" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
    if (c.M.orb) extra += '<g class="drift d2" style="mix-blend-mode:screen"><polygon points="150,0 230,0 470,140 330,140" fill="url(#§sf)"/><polygon points="300,0 340,0 640,140 560,140" fill="url(#§sf)" opacity=".7"/><polygon points="520,0 560,0 900,140 800,140" fill="url(#§sf)" opacity=".5"/></g>';
    extra += '<rect width="1200" height="140" fill="url(#§bl)" style="mix-blend-mode:screen"/><rect width="1200" height="140" fill="url(#§vg)"/>';
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
function status(ver, pct) {
  if (ver !== '3ds' && ver !== 'sw2') return '';
  var pc = Math.round(pct * 100) + '%';
  if (ver === '3ds') return '<span class="sb-l">' + wifi(ver) + '</span><span class="sb-time">' + clock() + '</span><span class="sb-r"><span class="sb-pc">' + pc + '</span>' + battery(ver, pct) + '</span>';
  return '<span class="sb-l"><span class="sb-user"><svg viewBox="0 0 24 24" width="22" height="22" focusable="false"><circle cx="12" cy="9" r="4.2" fill="currentColor"/><path d="M3.6,21 C4.4,16 8,14 12,14 C16,14 19.6,16 20.4,21 Z" fill="currentColor"/></svg></span><span class="sb-title">Ocarina of Time tracker</span></span><span class="sb-r"><span class="sb-time">' + clock() + '</span>' + wifi(ver) + '<span class="sb-pc">' + pc + '</span>' + battery(ver, pct) + '</span>';
}
setInterval(function () { var t = clock(), a = document.querySelectorAll('.sb-time'); for (var i = 0; i < a.length; i++) a[i].textContent = t; }, 20000);

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
  icon: function (k, ver) { var f = ICONS[k]; return f ? f(LV[ver] || 3).replace(/§/g, '') : ''; },
  status: status,
  svgFor: svgFor
};
})();
"""
icons = open("t2_icons.js", encoding="utf-8").read()
open("theme2.js", "w", encoding="utf-8").write(head + icons + "\n" + tail_new)
print("theme2.js", len(head + icons + tail_new))
