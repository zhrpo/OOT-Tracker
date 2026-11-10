import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import sys, os
from playwright.sync_api import sync_playwright
FILE = os.environ.get("F", "themed2.html")
PFX = os.environ.get("P", "o")
URL = _env.OUT_URL + "/" + FILE
errs = []
jobs = [("n64","phone","light","mainquest"),("3ds","phone","dark","hearts"),("sw2","phone","light","sidequests"),("sw2","desktop","dark","items"),("n64","desktop","light","skulltulas"),("3ds","desktop","light","mainquest")]
SZ = {"phone": (390, 844, 2), "desktop": (1440, 900, 1)}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    for v, size, scheme, tab in jobs:
        w, h, dsf = SZ[size]
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dsf, color_scheme=scheme)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
        pg.goto(URL + "#" + tab + "/" + v)
        pg.wait_for_selector(".row")
        pg.evaluate("localStorage.clear()")
        pg.reload(); pg.wait_for_selector(".row")
        pg.wait_for_timeout(250)
        pg.screenshot(path=f"{PFX}_{v}_{size}_{scheme}_{tab}.png")
        ctx.close()
    print("errors:", errs)
    b.close()
