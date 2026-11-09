import pwpatch
import os, sys, json
from playwright.sync_api import sync_playwright
F = os.environ.get("F", "themed2.html")
URL = "file:///home/claude/audit/out/" + F
WIDTHS = [int(x) for x in os.environ.get("W", "280,320,360,390,430,480,540,560,561,600,640,680,720,760,800,860,920,1000,1019,1020,1080,1180,1280,1440,1920").split(",")]
HEIGHTS = [int(x) for x in os.environ.get("H", "900").split(",")]
VERS = os.environ.get("V", "n64,3ds,sw2").split(",")
TABS = os.environ.get("T", "main,skull,heart,side,items").split(",")
HASH = {"main": "mainquest", "skull": "skulltulas", "heart": "heartpieces", "side": "sidequests", "items": "items"}
JS = r"""
() => {
  const bad = [];
  const sel = 'button, .pill, .tag, .chip, .an, summary, .seg button, .vtab, .tab, label.chk, .linkbtn, .field';
  const seen = new Set();
  document.querySelectorAll(sel).forEach(e => {
    if (seen.has(e)) return; seen.add(e);
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    // skip things inside collapsed details / hidden guides / off-screen sticky
    if (e.closest('[hidden], .hidden, details:not([open]) > :not(summary)')) return;
    const why = [];
    // real text poking out of (or crowding) the button: measure the text nodes themselves
    const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      const pe = n.parentElement;
      if (!pe || pe.closest('svg')) continue;
      const pc = getComputedStyle(pe);
      if (pc.display === 'none' || pc.visibility === 'hidden') continue;
      let abs = false; for (let q = pe; q && q !== e.parentElement; q = q.parentElement) { if (getComputedStyle(q).position === 'absolute' && q.tagName === 'SMALL') abs = true; }
      if (abs) continue;
      let ell = false; for (let q = pe; q && q !== e.parentElement; q = q.parentElement) { const qc = getComputedStyle(q); if (qc.textOverflow === 'ellipsis' && qc.overflowX === 'hidden') ell = true; }
      if (ell) { const q2 = pe; if (q2.scrollWidth > q2.clientWidth + 1) { why.push('ELLIPSIS truncating "' + n.nodeValue.trim().slice(0, 14) + '"'); } continue; }
      const rg = document.createRange(); rg.selectNodeContents(n);
      const tr = rg.getBoundingClientRect();
      if (tr.width < 1) continue;
      const pad = parseFloat(cs.paddingLeft) || 0;
      if (tr.right > r.right + 0.5 || tr.left < r.left - 0.5) { why.push('TEXT out "' + n.nodeValue.trim().slice(0, 14) + '" [' + Math.round(tr.left - r.left) + ',' + Math.round(tr.right - r.right) + ']'); break; }
      if (e.matches('.tab,.vtab') && (r.right - tr.right < 3 || tr.left - r.left < 3)) { why.push('TEXT touches edge "' + n.nodeValue.trim().slice(0, 14) + '" [' + Math.round(tr.left - r.left) + ',' + Math.round(tr.right - r.right) + ']'); break; }
    }
    // icon / child boxes (not decorative pseudo-elements) escaping horizontally
    for (const k of e.querySelectorAll('*')) {
      const kc = getComputedStyle(k);
      if (kc.display === 'none' || kc.visibility === 'hidden') continue;
      if (kc.position === 'absolute') continue;
      if (k.closest('svg') && k.tagName !== 'svg') continue;
      const kr = k.getBoundingClientRect();
      if (kr.width < 1 || kr.height < 1) continue;
      if (kr.right > r.right + 1.5 || kr.left < r.left - 1.5) { why.push('child ' + k.tagName + '.' + (k.className && k.className.baseVal === undefined ? k.className : '') + ' [' + Math.round(kr.left - r.left) + ',' + Math.round(kr.right - r.right) + ']'); break; }
    }
    // text clipped by ellipsis
    if (cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1) why.push('ellipsis-clipped');
    if (e.matches('.tab') && cs.overflowX !== 'visible') {}
    // wide off the viewport
    if (r.right > innerWidth + 1 && !e.closest('.tabs')) why.push('off-right ' + Math.round(r.right - innerWidth));
    if (why.length) bad.push({ el: (e.id ? '#' + e.id : e.tagName.toLowerCase()) + '.' + String(e.className && e.className.baseVal === undefined ? e.className : '').split(' ').join('.'), txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40), why: why.join('; '), w: Math.round(r.width) });
  });
  document.querySelectorAll('.an .nm').forEach(n => { if (n.offsetParent && n.scrollHeight > n.clientHeight + 1) bad.push({ el: 'an.nm', txt: n.innerText.slice(0, 40), why: 'nav name clipped (3 lines)', w: n.clientWidth }); });
  // page-level horizontal scroll
  const hs = document.documentElement.scrollWidth > innerWidth + 1;
  // tabs themselves
  const tabs = document.querySelector('.tabs');
  const tabInfo = tabs ? { sw: tabs.scrollWidth, cw: tabs.clientWidth } : null;
  return { bad, hs, sw: document.documentElement.scrollWidth, iw: innerWidth, tabInfo };
}
"""
fails = 0; total = 0
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for H in HEIGHTS:
      for W in WIDTHS:
        ctx = b.new_context(viewport={"width": W, "height": H})
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL + "#skulltulas/n64"); pg.wait_for_selector(".grp")
        pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_selector(".grp")
        if pg.locator("#legacy:not(.hidden)").count():
            try: pg.locator("#legacy button[data-claim='n64']").click()
            except Exception: pass
        pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important}")
        for v in VERS:
            for t in TABS:
                pg.evaluate("location.hash='%s/%s'" % (HASH[t], v))
                pg.wait_for_timeout(120)
                # verify the tab is selected; fall back to clicking
                try:
                    if pg.locator("#tab-%s" % t).get_attribute("aria-selected") != "true":
                        pg.locator("#tab-%s" % t).click(); pg.wait_for_timeout(80)
                    if pg.locator("body").get_attribute("data-ver") != v:
                        pg.locator(".vtab[data-ver='%s']:visible" % v).first.click(); pg.wait_for_timeout(80)
                except Exception as ex:
                    pass
                res = pg.evaluate(JS)
                total += 1
                if res["bad"] or res["hs"] or errs:
                    fails += 1
                    print("FAIL %dx%d %s/%s hscroll=%s %s" % (W, H, v, t, res["hs"], "ERR:" + str(errs[:1]) if errs else ""))
                    for x in res["bad"][:6]:
                        print("    ", x)
        ctx.close()
    b.close()
print("checked", total, "states; failing", fails)
