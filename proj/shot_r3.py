import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import json, sys
from playwright.sync_api import sync_playwright
mine = json.load(open(_env.AUDIT + "/fixtures/synthetic_progress.json"))["got"]  # Phase 0: synthetic fixture (was a real save snapshot, removed)
URL = _env.OUT_URL + "/themed2.html"
def shot(pg, tab, rid, out, ver="sw2", w=390, scroll_sub=None):
    pg.goto(URL)
    pg.evaluate("(a)=>localStorage.setItem('oot-tracker-v1', JSON.stringify({got:a, ver:'%s', tab:'%s'}))" % (ver, tab), mine if ver == "sw2" else [])
    pg.set_viewport_size({"width": w, "height": 900})
    pg.goto(URL + "#" + {"items":"items","side":"sidequests","skull":"skulltulas","heart":"hearts","main":"mainquest"}[tab] + "/" + ver)
    pg.reload(); pg.wait_for_selector(".row")
    pg.evaluate("(i)=>__oot.goRow(i)", rid)
    pg.wait_for_timeout(300)
    n = pg.locator("[data-row='%s']" % rid)
    n.scroll_into_view_if_needed()
    n.screenshot(path=out)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    pg = b.new_page()
    shot(pg, "side", "SQ-13", _env.SCRATCH + "/s_sq13.png")
    shot(pg, "items", "IT-36", _env.SCRATCH + "/s_it36.png")
    shot(pg, "skull", "DT-4", _env.SCRATCH + "/s_dt4.png")
    shot(pg, "heart", "HP-18", _env.SCRATCH + "/s_hp18.png")
    shot(pg, "side", "SQ-29", _env.SCRATCH + "/s_sq29.png", ver="n64")
    shot(pg, "side", "SQ-13", _env.SCRATCH + "/s_sq13_n64.png", ver="n64")
    shot(pg, "side", "SQ-13", _env.SCRATCH + "/s_sq13_3ds.png", ver="3ds")
    b.close()
