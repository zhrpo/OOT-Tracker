import pwpatch
import os
from playwright.sync_api import sync_playwright
F = os.environ.get("F", "index.html")
URL = "file:///home/claude/audit/out/" + F
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
    pg.goto(URL + "#skulltulas/sw2"); pg.wait_for_selector(".row")
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_selector(".row")
    if pg.locator("#legacy:not(.hidden)").count():
        pg.locator("#legacy button[data-claim='sw2']").click()
    # nav: counts, click, scroll spy
    items = pg.locator("#areanav .an")
    print("nav items:", items.count(), "| first:", items.first.inner_text().replace("\n", " "))
    items.nth(10).click()
    pg.wait_for_timeout(1100)
    on = pg.locator("#areanav .an.on .nm").inner_text()
    sec_top = pg.evaluate("document.querySelector('#g10').getBoundingClientRect().top")
    hh = pg.evaluate("document.querySelector('.top').offsetHeight")
    print("after nav click -> active:", on, "| section top:", round(sec_top), "| header:", hh)
    pg.evaluate("window.scrollBy(0, 1600)"); pg.wait_for_timeout(400)
    print("after scroll -> active:", pg.locator("#areanav .an.on .nm").inner_text(), "| fab shown:", pg.evaluate("document.getElementById('fab').classList.contains('show')"))
    pg.locator("#totop").click(); pg.wait_for_timeout(900)
    print("back to top -> scrollY:", pg.evaluate("window.scrollY"), "| active:", pg.locator("#areanav .an.on .nm").inner_text())
    # rail does not scroll away and nav is scrollable within itself
    pg.evaluate("window.scrollBy(0, 3000)"); pg.wait_for_timeout(300)
    r = pg.evaluate("(()=>{const r=document.querySelector('.rail').getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom)]})()")
    print("rail top/bottom while scrolled:", r, "| viewport h 900")
    # tick items, filter, export + import
    pg.evaluate("window.scrollTo(0,0)")
    for i in ("KF-1", "KF-2", "HF-1"):
        pg.locator("input[data-id='%s']" % i).check()
    pg.locator("#vtabs2 .vtab[data-ver='n64']").click(); pg.wait_for_timeout(200)
    pg.locator("input[data-id='DT-1']").check()
    print("n64 count after tick:", pg.locator("#tab-skull small").inner_text())
    pg.locator("#xfer summary").click()
    code = pg.input_value("#xcode")
    print("code:", code[:40], "... len", len(code))
    pg.evaluate("localStorage.clear()")
    pg.goto(URL + "#skulltulas/n64"); pg.reload(); pg.wait_for_selector(".row")
    if pg.locator("#legacy:not(.hidden)").count():
        pg.locator("#legacy button[data-claim='later']").click()
    print("after wipe:", pg.locator("#tab-skull small").inner_text())
    pg.locator("#xfer summary").click()
    pg.fill("#xin", "garbage")
    pg.locator("#xapply").click(); print("bad code msg:", pg.inner_text("#xmsg2"))
    pg.fill("#xin", code)
    pg.locator("#xapply").click(); print("apply msg:", pg.inner_text("#xmsg2"))
    print("n64 count after import:", pg.locator("#tab-skull small").inner_text())
    pg.locator("#vtabs2 .vtab[data-ver='sw2']").click(); pg.wait_for_timeout(200)
    print("sw2 count after import:", pg.locator("#tab-skull small").inner_text())
    pg.fill("#xin", code); pg.locator("#xapply").click(); print("re-apply msg:", pg.inner_text("#xmsg2"))
    # filters + none dimming in nav
    pg.locator("#seg-age button[data-v='adult']").click()
    print("dimmed nav items (no adult rows):", pg.locator("#areanav .an.none").count())
    # collapse all via rail
    pg.locator("#collapse").click(); pg.wait_for_timeout(200)
    print("collapsed rows:", pg.locator(".row").count(), "| button:", pg.inner_text("#collapse"))
    print("errors:", errs)
    b.close()
