import pwpatch
import sys
from playwright.sync_api import sync_playwright
FILE = sys.argv[1] if len(sys.argv) > 1 else "index.html"
URL = "file:///home/claude/audit/out/" + FILE
TAG = FILE.split(".")[0]
errs = []
SIZES = {"phone": (390, 844), "tablet": (820, 1100), "laptop": (1100, 760), "desktop": (1440, 900), "wide": (1920, 1080)}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for name, (w, h) in SIZES.items():
        for scheme in ("light", "dark"):
            ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1 if w > 800 else 2, color_scheme=scheme)
            pg = ctx.new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
            pg.goto(URL + "#skulltulas/sw2")
            pg.wait_for_selector(".row")
            pg.evaluate("localStorage.clear()")
            pg.reload(); pg.wait_for_selector(".row")
            if pg.locator("#legacy button[data-claim='sw2']").count() and pg.locator("#legacy:not(.hidden)").count():
                pg.locator("#legacy button[data-claim='sw2']").click()
            ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
            railvis = pg.evaluate("getComputedStyle(document.querySelector('.areanav')).display")
            hh = pg.evaluate("document.querySelector('.top').offsetHeight")
            print(f"{name:8}{scheme:6} overflow={ov} areanav={railvis} header={hh}px")
            if scheme == "light" or name in ("desktop",):
                pg.screenshot(path=f"r_{TAG}_{name}_{scheme}.png")
            ctx.close()
    print("errors:", errs)
    b.close()
