# Round 12: story spoiler cover, tap motion on touch screens, idle motion on the picked tab
import os, re
os.environ.setdefault("OPEN", "1")
os.environ["VEIL"] = "1"
import pwpatch  # noqa
from playwright.sync_api import sync_playwright
URL = "file:///home/claude/audit/out/" + os.environ.get("F", "themed2.html")
fails = []
def check(name, cond, info=""):
    print(("PASS " if cond else "FAIL ") + name + (" " + str(info) if info and not cond else ""))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for ver in ("n64", "3ds", "sw2"):
        ctx = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
        pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL + "#mainquest-" + ver); pg.wait_for_selector(".row")
        pg.evaluate("localStorage.removeItem('oot-reveal'); __oot.clear(); __oot.render()")
        pg.reload(); pg.wait_for_selector(".row"); pg.evaluate("__oot.clear(); __oot.render()"); pg.wait_for_timeout(150)
        ready = pg.evaluate("[...document.querySelectorAll('[data-row^=MQ-]')].filter(r=>!r.classList.contains('veil')).map(r=>r.dataset.row)")
        spoiled = pg.evaluate("[...document.querySelectorAll('.row.veil')].map(r=>r.dataset.row)")
        check(ver + " the steps you can do now are shown", "MQ-1" in ready and "MQ-2" in ready, ready)
        check(ver + " later steps in the open chapter are covered", "MQ-3" in spoiled and "MQ-4" in spoiled, spoiled)
        check(ver + " covered text is hidden from screen readers", pg.evaluate("document.querySelector(\"[data-row='MQ-4'] .name\").getAttribute('aria-hidden')") == "true")
        pg.tap("[data-row='MQ-4'] .spoilbtn"); pg.wait_for_timeout(250)
        check(ver + " tapping the cover shows the step", pg.locator("[data-row='MQ-4'].veil").count() == 0 and pg.locator("[data-row='MQ-4'] .name").is_visible())
        check(ver + " showing it does not tick it", "MQ-4" not in pg.evaluate("__oot.got().map(k=>k.split(':')[1])"))
        pg.locator("button[data-reveal='MQ-4']").click(); pg.wait_for_timeout(150)
        check(ver + " its spoiler guide still opens on its own", pg.locator("[data-gbox='MQ-4'] .guide").count() == 1)
        pg.reload(); pg.wait_for_selector(".row"); pg.evaluate("__oot.clear(); __oot.render()")
        check(ver + " a shown step stays shown after a reload", pg.locator("[data-row='MQ-4'].veil").count() == 0)
        pg.evaluate("__oot.tick('MQ-2'); __oot.tick('MQ-1'); __oot.render()"); pg.wait_for_timeout(100)
        check(ver + " finishing a step uncovers the next one", pg.locator("[data-row='MQ-3'].veil").count() == 0)
        pg.fill("#q", "Saria"); pg.wait_for_timeout(300)
        check(ver + " search results are never covered", pg.locator(".row.veil").count() == 0 and pg.locator(".row").count() > 0)
        pg.fill("#q", ""); pg.wait_for_timeout(250)
        # the checkbox still works on a covered row
        cov = pg.evaluate("(document.querySelector('.row.veil')||{}).dataset && document.querySelector('.row.veil').dataset.row")
        if cov:
            box = pg.locator("[data-row='%s'] .chk input" % cov)
            check(ver + " the box on a covered row can still be reached", box.is_visible() and box.is_enabled())
        # tap motion
        pg.tap("#tab-heart"); pg.wait_for_timeout(60)
        an = pg.evaluate("getComputedStyle(document.querySelector('#tab-heart')).animationName")
        check(ver + " tapping a tab plays its console's motion", an.split(",")[0].strip() in ("n64tap", "ds3tap", "sw2tap"), an)
        pg.wait_for_timeout(1000)
        sel = pg.evaluate("getComputedStyle(document.querySelector('#tab-heart .tic svg')).animationName")
        check(ver + " the picked tab keeps its idle motion", sel in ("selbob64", "ds3dsel", "sw2sel"), sel)
        vt = pg.locator(".vtab[data-ver='3ds']:visible").first
        vt.tap(); pg.wait_for_timeout(60)
        check(ver + " the 3DS console tab uses the 3DS tap motion", pg.evaluate("[...document.querySelectorAll('.vtab[data-ver=\"3ds\"]')].some(e=>getComputedStyle(e).animationName==='ds3tap')") or ver == "3ds")
        check(ver + " no errors", not errs, errs[:2])
        ctx.close()
    print("FAILS:", fails)
    b.close()
raise SystemExit(1 if fails else 0)
