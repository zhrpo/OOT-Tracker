import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    pg = b.new_context(viewport={"width": 400, "height": 900}, device_scale_factor=2).new_page()
    pg.goto(_env.OUT_URL + "/themed2.html#sidequests/sw2"); pg.wait_for_selector(".row")
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_selector(".row")
    pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important}")
    for rid, name in (("SQ-26", "frog"), ("SQ-12", "scare"), ("HP-23", "hp23"), ("BW-1", "bw1"), ("HP-27", "hp27")):
        pg.evaluate("window.__oot.goRow('%s')" % rid); pg.wait_for_timeout(900)
        el = pg.locator("[data-row='%s'], #r-%s, .row:has(input[data-id='%s'])" % (rid, rid, rid)).first
        try:
            el.scroll_into_view_if_needed(); el.screenshot(path=_env.TMP + "/era_%s.png" % name)
        except Exception as ex:
            print("fail", rid, ex)
    b.close()
