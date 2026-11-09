import sys, os
from playwright.sync_api import sync_playwright
FILE = os.environ.get("F", "themed2.html"); PFX = os.environ.get("P", "n")
URL = "file:///home/claude/audit/out/" + FILE
JOBS = os.environ.get("J", "n64:phone:light:mainquest,3ds:phone:light:hearts,sw2:phone:light:sidequests,sw2:desktop:dark:items,3ds:desktop:light:skulltulas,n64:desktop:light:hearts").split(",")
SZ = {"phone": (390, 844, 2), "tablet": (820, 1000, 1), "desktop": (1440, 900, 1)}
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for j in JOBS:
        v, size, scheme, tab = j.split(":")
        w, h, dsf = SZ[size]
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dsf, color_scheme=scheme)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
        pg.goto(URL + "#" + tab + "/" + v)
        pg.wait_for_selector(".row")
        pg.evaluate("localStorage.clear()")
        pg.reload(); pg.wait_for_selector(".row")
        if pg.locator("#legacy:not(.hidden) button[data-claim='%s']" % v).count():
            pg.locator("#legacy button[data-claim='%s']" % v).click()
        pg.wait_for_timeout(300)
        pg.screenshot(path=f"{PFX}_{v}_{size}_{scheme}_{tab}.png")
        ctx.close()
    print("errors:", errs)
    b.close()
