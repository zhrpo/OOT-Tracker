import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
from playwright.sync_api import sync_playwright
URL = _env.OUT_URL + "/themed2.html"
errs = []
shots = [
  ("hearts_n64_desktop", "hearts/n64", 1440, 900, 1, "light", 900),
  ("side_3ds_desktop", "sidequests/3ds", 1440, 900, 1, "light", 300),
  ("side_sw2_phone", "sidequests/sw2", 390, 844, 2, "dark", 300),
  ("skull_n64_phone_dark", "skulltulas/n64", 390, 844, 2, "dark", 1600),
  ("skull_3ds_desktop_dark", "skulltulas/3ds", 1440, 900, 1, "dark", 2600),
  ("skull_sw2_laptop", "skulltulas/sw2", 1100, 760, 1, "light", 3000),
  ("hearts_n64_tablet", "hearts/n64", 820, 1100, 1, "light", 600),
]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    for name, hsh, w, h, dsf, scheme, sy in shots:
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dsf, color_scheme=scheme)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL + "#" + hsh); pg.wait_for_selector(".row")
        pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_selector(".row")
        if pg.locator("#legacy:not(.hidden)").count():
            pg.locator("#legacy button[data-claim='later']").click()
        if name.startswith("side_3ds"):
            pg.locator("#vpanel summary").click()
            pg.locator("[data-reveal]").first.click()
        pg.evaluate("window.scrollTo(0,%d)" % sy); pg.wait_for_timeout(350)
        pg.screenshot(path="t2_%s.png" % name)
        ctx.close()
    print("errors", errs)
    b.close()
