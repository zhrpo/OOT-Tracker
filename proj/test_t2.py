import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import pwpatch
import os
from playwright.sync_api import sync_playwright
F = os.environ.get("F", "themed2.html")
URL = _env.OUT_URL + "/" + F
TABS = ["mainquest", "skulltulas", "hearts", "sidequests", "items"]
out = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    for (w, h) in [(360, 740), (390, 844), (820, 1000), (1440, 900)]:
        for scheme in ("light", "dark"):
            ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=scheme)
            pg = ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            for v in ("n64", "3ds", "sw2"):
                for t in TABS:
                    pg.goto(URL + "#" + t + "/" + v); pg.wait_for_selector(".row")
                    pg.wait_for_timeout(60)
                    r = pg.evaluate("""() => ({sw: document.documentElement.scrollWidth, iw: innerWidth, top: Math.round(document.querySelector('.top').getBoundingClientRect().height),
                      tabs: Array.from(document.querySelectorAll('.tab')).map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; }),
                      tabsw: document.querySelector('.tabs').scrollWidth - document.querySelector('.tabs').clientWidth})""")
                    flag = ""
                    if r["sw"] > r["iw"]: flag += " HSCROLL"
                    if r["tabsw"] > 2: flag += " TABS-OVERFLOW"
                    out.append((w, scheme, v, t, r["top"], flag))
            if errs: out.append((w, scheme, "ERR", errs[:2], 0, ""))
            ctx.close()
    b.close()
bad = [o for o in out if o[5] or o[2] == "ERR"]
print("checked", len(out), "bad", bad[:12])
for w in (390, 1440):
    print(w, {v: sorted(set(o[4] for o in out if o[0] == w and o[2] == v)) for v in ("n64", "3ds", "sw2")})
