import sys
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    pg = ctx.new_page()
    errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file:///home/claude/audit/out/" + __import__("os").environ.get("F", "index.html") + "")
    pg.wait_for_selector(".row")
    n = pg.locator(".row").count()
    chk = pg.locator("input[data-id]:checked").count()
    print("skull rows", n, "pre-checked", chk, pg.inner_text("#tab-skull").replace("\n", " "))
    # tick one
    pg.locator("input[data-id='KF-1']").check()
    print("after tick", pg.inner_text("#sumtext"), pg.inner_text("#tab-skull").replace("\n", " "))
    # reload -> persisted
    pg.reload()
    pg.wait_for_selector(".row")
    print("after reload KF-1 checked:", pg.locator("input[data-id='KF-1']").is_checked(), "DT-1 checked:", pg.locator("input[data-id='DT-1']").is_checked())
    pg.screenshot(path="/home/claude/build/shot_skull_mobile.png")
    # filters
    pg.click("#seg-status button[data-v='todo']")
    print("remaining rows", pg.locator(".row").count())
    pg.click("#seg-age button[data-v='adult']")
    print("remaining adult-can rows", pg.locator(".row").count())
    pg.click("#seg-status button[data-v='all']")
    pg.click("#seg-age button[data-v='all']")
    pg.fill("#q", "Hookshot")
    pg.wait_for_timeout(300)
    print("search Hookshot rows", pg.locator(".row").count())
    pg.fill("#q", "")
    pg.wait_for_timeout(300)
    # hearts tab
    pg.click("#tab-heart")
    pg.wait_for_selector(".row")
    print("heart rows", pg.locator(".row").count(), pg.inner_text("#tab-heart").replace("\n", " "))
    pg.locator("input[data-id='HP-1']").check()
    print("heart after tick", pg.inner_text("#sumtext"))
    pg.screenshot(path="/home/claude/build/shot_heart_mobile.png")
    # desktop
    pg2 = b.new_context(viewport={"width": 1100, "height": 800}).new_page()
    pg2.goto("file:///home/claude/audit/out/" + __import__("os").environ.get("F", "index.html") + "")
    pg2.wait_for_selector(".row")
    pg2.screenshot(path="/home/claude/build/shot_skull_desktop.png")
    print("errors:", errs)
    b.close()
