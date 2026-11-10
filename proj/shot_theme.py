import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import sys
from playwright.sync_api import sync_playwright
FILE = "themed2.html"
URL = _env.OUT_URL + "/" + FILE
errs = []
jobs = [(v, size, scheme) for v in ("n64", "3ds", "sw2") for size in ("phone", "desktop") for scheme in ("light", "dark")]
SZ = {"phone": (390, 844, 2), "desktop": (1440, 900, 1)}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    for v, size, scheme in jobs:
        w, h, dsf = SZ[size]
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dsf, color_scheme=scheme)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
        pg.goto(URL + "#skulltulas/" + v)
        pg.wait_for_selector(".row")
        pg.evaluate("localStorage.clear()")
        pg.reload(); pg.wait_for_selector(".row")
        if pg.locator("#legacy:not(.hidden) button[data-claim='%s']" % v).count():
            pg.locator("#legacy button[data-claim='%s']" % v).click()
        pg.wait_for_timeout(250)
        pg.screenshot(path=f"t_{v}_{size}_{scheme}.png")
        ctx.close()
    print("errors:", errs)
    b.close()
