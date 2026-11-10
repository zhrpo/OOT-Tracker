import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import pwpatch
from playwright.sync_api import sync_playwright

URL = _env.OUT_URL + "/" + __import__("os").environ.get("F", "themed2.html") + ""
SECRET = "Pay Ingo 10 rupees for a ride"          # a guide-only phrase (SQ-28)
SECRET2 = "Climb onto the empty stump across from him"  # guide-only phrase (SQ-1)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    pg = ctx.new_page()
    errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL)
    pg.wait_for_selector(".row")

    # three tabs, counts
    for t in ("skull", "heart", "side"):
        print("tab", t, "->", pg.inner_text("#tab-" + t).replace("\n", " "))

    # old tabs unaffected
    print("skull rows", pg.locator(".row").count(), "pre-checked", pg.locator("input[data-id]:checked").count())

    pg.click("#tab-side")
    pg.wait_for_selector(".row.sq")
    print("hash after click:", pg.evaluate("location.hash"))
    print("side rows", pg.locator(".row.sq").count(), "|", pg.inner_text("#sumtext"))
    print("status labels:", [pg.locator("#seg-status button").nth(i).inner_text() for i in range(3)])
    print("time seg visible:", pg.locator("#seg-time").is_visible())

    # spoilers hidden: guide text must not be in the visible text or DOM
    body = pg.evaluate("document.body.innerText")
    dom = pg.evaluate("document.getElementById('list').innerHTML")
    print("guide text in innerText:", SECRET in body or SECRET2 in body)
    print("guide text in list DOM:", SECRET in dom or SECRET2 in dom)
    print("spoiler buttons:", pg.locator("button.spoil").count(), "revealed guides:", pg.locator(".guide").count())

    # search must not match guide text
    pg.fill("#q", "stump across")
    pg.wait_for_timeout(300)
    print("search for guide-only text ->", pg.locator(".row.sq").count(), "rows (expect 0)")
    pg.fill("#q", "Epona")
    pg.wait_for_timeout(300)
    print("search Epona ->", pg.locator(".row.sq").count(), "rows")
    pg.fill("#q", "")
    pg.wait_for_timeout(300)

    # reveal one guide
    pg.locator("button[data-reveal='SQ-1']").click()
    print("SQ-1 revealed:", pg.locator("[data-gbox='SQ-1'] .guide").count() == 1, "| shows secret:", SECRET2 in pg.inner_text("[data-gbox='SQ-1']"))
    print("others still hidden:", pg.locator("button.spoil").count(), "(expect 42)")
    # survives a filter re-render
    pg.click("#seg-age button[data-v='child']")
    pg.wait_for_timeout(100)
    print("after filter, SQ-1 still revealed:", pg.locator("[data-gbox='SQ-1'] .guide").count() == 1)
    pg.click("#seg-age button[data-v='all']")
    # hide again
    pg.locator("button[data-hide='SQ-1']").click()
    print("SQ-1 re-hidden:", pg.locator("[data-gbox='SQ-1'] button.spoil").count() == 1)

    # multi-step guide renders as ordered list
    pg.locator("button[data-reveal='SQ-29']").click()
    print("SQ-29 steps:", pg.locator("[data-gbox='SQ-29'] li").count(), "(expect 12)")
    pg.locator("button[data-hide='SQ-29']").click()

    # checkbox + persistence
    pg.locator("input[data-id='SQ-5']").check()
    pg.locator("input[data-id='SQ-6']").check()
    print("after 2 ticks:", pg.inner_text("#sumtext"), "|", pg.inner_text("#tab-side").replace("\n", " "))
    pg.reload()
    pg.wait_for_selector(".row.sq")
    print("reload keeps tab via hash:", pg.locator(".row.sq").count() > 0)
    print("SQ-5 checked after reload:", pg.locator("input[data-id='SQ-5']").is_checked(), "| reveal state reset:", pg.locator("button.spoil").count() == 43)
    print("skull count unaffected:", pg.inner_text("#tab-skull").replace("\n", " "))

    # filters
    pg.click("#seg-status button[data-v='done']")
    print("Done filter rows:", pg.locator(".row.sq").count(), "(expect 2)")
    pg.click("#seg-status button[data-v='todo']")
    print("Remaining rows:", pg.locator(".row.sq").count(), "(expect 41)")
    pg.click("#seg-status button[data-v='all']")
    pg.click("#seg-age button[data-v='adult']")
    print("As adult rows:", pg.locator(".row.sq").count())
    pg.click("#seg-age button[data-v='child']")
    print("As child rows:", pg.locator(".row.sq").count())
    pg.click("#seg-age button[data-v='all']")
    pg.click("#seg-time button[data-v='night']")
    print("Night rows:", pg.locator(".row.sq").count(), "(Day-only hidden)")
    pg.click("#seg-time button[data-v='day']")
    print("Day rows:", pg.locator(".row.sq").count(), "(Night-only hidden)")
    pg.click("#seg-time button[data-v='all']")

    # jump select lists the 5 groups
    print("jump options:", pg.locator("#jump option").count() - 1)

    # time seg hides on other tabs and time filter is not applied there
    pg.click("#seg-time button[data-v='night']")
    pg.click("#tab-heart")
    pg.wait_for_selector(".row")
    print("time seg hidden on hearts:", not pg.locator("#seg-time").is_visible(), "| heart rows", pg.locator(".row").count(), "(expect 36)")
    print("status label on hearts:", pg.locator("#seg-status button").nth(2).inner_text())
    pg.click("#tab-side")
    pg.click("#seg-time button[data-v='all']")

    # screenshots
    pg.evaluate("window.scrollTo(0,0)")
    pg.locator("button[data-reveal='SQ-6']").click()
    pg.screenshot(path=_env.SCRATCH + "/shot_side_mobile.png")
    pg.locator("#g2").scroll_into_view_if_needed()
    pg.screenshot(path=_env.SCRATCH + "/shot_side_mobile2.png")

    pg2 = b.new_context(viewport={"width": 1100, "height": 900}).new_page()
    pg2.goto(URL + "#sidequests")
    pg2.wait_for_selector(".row.sq")
    pg2.locator("button[data-reveal='SQ-28']").click()
    pg2.screenshot(path=_env.SCRATCH + "/shot_side_desktop.png")

    # dark mode look
    pg3 = b.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark", device_scale_factor=2).new_page()
    pg3.goto(URL + "#sidequests")
    pg3.wait_for_selector(".row.sq")
    pg3.screenshot(path=_env.SCRATCH + "/shot_side_dark.png")

    print("errors:", errs)
    b.close()
