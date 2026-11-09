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
    add(c, '<g transform="rotate(-14 260 ' + y + ')"><rect x="254" y="48" width="12" height="50" fill="' + hs(c, [28, 44, 42]) + '"/><rect x="226" y="36" width="68" height="22" fill="' + hs(c, [215, 12, 58]) + '"/><rect x="258" y="36" width="36" height="22" fill="' + hs(c, [215, 12, 44]) + '"/></g>');
    [440, 506, 940].forEach(function (x, i) {
      add(c, c.lvl === 1 ? '<polygon points="' + pts([[x - 18, y - 4], [x - 22, y - 22], [x - 8, y - 36], [x + 8, y - 36], [x + 22, y - 22], [x + 18, y - 4]]) + '" fill="' + hs(c, [220, 10, 22]) + '"/>' : '<circle cx="' + x + '" cy="' + (y - 20) + '" r="20" fill="' + (c.lvl === 3 ? rad(c, [[0, hs(c, [220, 10, 44])], [1, hs(c, [220, 10, 14])]]) : hs(c, [220, 10, 26])) + '"/>');
      add(c, '<rect x="' + (x - 6) + '" y="' + (y - 46) + '" width="12" height="12" fill="' + hs(c, [28, 30, 34]) + '"/><polyline points="' + x + ',' + (y - 46) + ' ' + (x + 8) + ',' + (y - 56) + ' ' + (x + 16) + ',' + (y - 52) + '" fill="none" stroke="' + hs(c, [36, 40, 66]) + '" stroke-width="3"/>');
      if (i === 0) flame(c, x + 16, y - 52, 12);
    });
    add(c, '<polygon points="' + pts([[620, y - 4], [660, y - 46], [680, y - 40], [650, y - 4]]) + '" fill="' + hs(c, [30, 50, 40]) + '"/><polygon points="' + pts([[650, y - 4], [680, y - 40], [720, y - 4], [700, y - 4], [680, y - 24]]) + '" fill="' + hs(c, [30, 50, 30]) + '"/>');
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
    add(c, s);
    for (k = 0; k < 3; k++) { var ox = 420 + k * 180, oy = 56 - (k % 2) * 8; if (c.lvl === 3) add(c, '<circle cx="' + ox + '" cy="' + oy + '" r="46" fill="' + rad(c, [[0, hs(c, cols[k], 8, .55)], [1, hs(c, cols[k], 8, 0)]]) + '"/>'); add(c, c.lvl === 1 ? '<polygon points="' + pts([[ox, oy - 15], [ox + 15, oy], [ox, oy + 15], [ox - 15, oy]]) + '" fill="' + hs(c, cols[k]) + '"/>' : '<circle cx="' + ox + '" cy="' + oy + '" r="14" fill="' + (c.lvl === 3 ? rad(c, [[0, '#fff'], [.5, hs(c, cols[k], 14)], [1, hs(c, cols[k], -6)]]) : hs(c, cols[k])) + '"/>'); }
    s = '';
    for (k = 0; k < 5; k++) { var ax = 140 + k * 232, ay = 30 + (k % 3) * 24; s += '<line x1="' + (ax - 50) + '" y1="' + (ay + 16) + '" x2="' + ax + '" y2="' + ay + '" stroke="' + hs(c, [44, 90, 80]) + '" stroke-width="' + (c.lvl === 1 ? 4 : 2.4) + '"' + (c.lvl === 3 ? ' opacity=".9"' : '') + '/><polygon points="' + pts([[ax + 8, ay - 3], [ax - 4, ay - 7], [ax - 3, ay + 4]]) + '" fill="' + hs(c, [214, 20, 84]) + '"/>'; }
    add(c, s);
  },
  trial: function (c) {
    sky(c); orb(c, 930, 34, 17); clouds(c);
    peaks(c, 0, 3, 100, 4, 56, 84, 1, 0); ridge(c, 1, 3, 112, 8);
    boulderAt(c, 250, 106, 44, [24, 14, 52]); boulderAt(c, 420, 112, 28, [24, 14, 46]); boulderAt(c, 150, 114, 24, [24, 14, 44]);
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
    var k, s = '', r = c.rs[2];
    for (k = 0; k < 5; k++) s += '<rect x="0" y="' + (38 + k * 13) + '" width="' + c.W + '" height="' + (c.lvl === 1 ? 3 : 1.8) + '" fill="' + hs(c, [44, 40, 86]) + '" opacity="' + (c.lvl === 3 ? .7 : .85) + '"/>';
    add(c, s);
    for (k = 0; k < 9; k++) { var y = 38 + Math.floor(r() * 9) * 6.5; noteAt(c, 100 + k * 125 + (r() - .5) * 20, y, y > 62); }
    ridge(c, 2, 3, 136, 5); fog(c, 90, 36, .3);
  },
