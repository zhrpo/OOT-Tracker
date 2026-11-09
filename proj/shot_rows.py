import os
from playwright.sync_api import sync_playwright
F = os.environ.get("F", "index.html"); W = int(os.environ.get("W", "390"))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": W, "height": 900}, device_scale_factor=1)
    pg = ctx.new_page()
    pg.goto("file:///home/claude/audit/out/" + F)
    pg.evaluate("localStorage.setItem('oot-tracker-v1', JSON.stringify({got:['sw2:MQ-1','sw2:MQ-2','sw2:MQ-3'], ver:'sw2', tab:'side'}))")
    pg.reload(); pg.wait_for_selector(".row")
    def shot(tab, rid, name):
        pg.click("#tab-" + tab); pg.wait_for_selector(".row")
        loc = pg.locator("[data-row='%s']" % rid)
        loc.scroll_into_view_if_needed()
        loc.screenshot(path="/home/claude/build/" + name)
    shot("side", "SQ-1", "rw_sq1.png")
    shot("side", "SQ-19", "rw_sq19.png")
    shot("heart", "HP-15", "rw_hp15.png")
    shot("heart", "HP-14", "rw_hp14.png")
    shot("skull", "LW-3", "rw_lw3.png")
    shot("items", "IT-6", "rw_it6.png")
    shot("main", "MQ-4", "rw_mq4.png")
    b.close()
