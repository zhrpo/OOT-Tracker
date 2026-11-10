import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import json, re, sys
from playwright.sync_api import sync_playwright
F = _env.OUT_URL + "/themed2.html"
JS = r"""
(ver) => {
  const O = window.__oot; O.state.ver = ver; const m = O.rowMap(); const out = [];
  Object.keys(m).forEach(id => { const r = m[id];
    const txt = [r.where, r.start, r.how, r.note, r.avail, r.reward, r.guide && (Array.isArray(r.guide) ? r.guide.join(' ') : r.guide)].filter(Boolean).join(' || ');
    out.push({ id, age: r.age, name: (r.name || r.title || '').slice(0, 44), txt, ages: r.ages || '' });
  });
  return out;
}
"""
c = re.compile(r"(as a child|child link|young link|\bchild:|as child)", re.I)
a = re.compile(r"(as an adult|adult link|\badult:|as adult|grown-up)", re.I)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    pg = b.new_context(viewport={"width": 1000, "height": 800}).new_page()
    pg.goto(F + "#skulltulas/sw2"); pg.wait_for_selector(".row")
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_selector(".row")
    for ver in sys.argv[1:] or ["sw2"]:
        print("=====", ver)
        res = pg.evaluate(JS, ver)
        eith = [x for x in res if x["age"] == "Either"]
        print("EITHER rows (%d):" % len(eith))
        for x in eith: print("  %-7s %s" % (x["id"], x["name"]))
        print("NON-Both rows whose text mentions both eras:")
        for x in res:
            if x["age"] != "Both" and c.search(x["txt"]) and a.search(x["txt"]):
                print("  %-7s %-6s %s" % (x["id"], x["age"], x["name"]))
    b.close()
