# Final pass: keyboard, dialog focus, search, filters vs counts, persistence, routing, undo, rapid clicks, locks, errors everywhere
import os, time
os.environ.setdefault("OPEN", "1")
os.environ["ASK"] = "1"
import pwpatch  # noqa
from playwright.sync_api import sync_playwright
URL = "file:///home/claude/audit/out/" + os.environ.get("F", "themed2.html")
fails = []
def check(name, cond, info=""):
    print(("PASS " if cond else "FAIL ") + name + (" " + str(info) if info and not cond else ""))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    def page(w=390, h=844, scheme="light"):
        ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=scheme)
        pg = ctx.new_page(); pg.errs = []
        pg.on("pageerror", lambda e: pg.errs.append(str(e)))
        pg.on("console", lambda m: pg.errs.append(m.text) if m.type == "error" else None)
        return ctx, pg
    got = lambda pg: pg.evaluate("__oot.got().filter(k=>k.indexOf(':')>0).map(k=>k.split(':')[1])")
    # ---- errors in every tab x console x scheme x size
    errs = []
    for scheme in ("light", "dark"):
        for w, h in ((360, 780), (1440, 900)):
            ctx, pg = page(w, h, scheme)
            for v in ("n64", "3ds", "sw2"):
                for t in ("mainquest", "skulltulas", "hearts", "sidequests", "items"):
                    pg.goto(URL + "#%s/%s" % (t, v)); pg.wait_for_selector(".grp"); pg.wait_for_timeout(60)
            errs += pg.errs; ctx.close()
    check("no errors on any tab, console, scheme or size", not errs, errs[:3])
    # ---- keyboard: tick with Space, dialog focus and trap, Esc returns focus
    ctx, pg = page(1280, 900)
    pg.goto(URL + "#mainquest/sw2"); pg.wait_for_selector(".row"); pg.evaluate("__oot.clear(); __oot.render()")
    pg.focus("[data-row='MQ-4'] input >> nth=0"); pg.keyboard.press("Space"); pg.wait_for_timeout(150)
    check("Space on a later step opens the earlier-steps question", pg.locator("#ask:not(.hidden)").count() == 1)
    check("focus moves to the Yes button", pg.evaluate("document.activeElement.id") == "ask-yes")
    pg.keyboard.press("Tab"); pg.keyboard.press("Tab"); pg.keyboard.press("Tab")
    check("Tab stays inside the question", pg.evaluate("!!document.activeElement.closest('#ask')"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
    check("Esc closes it and leaves the box empty", pg.locator("#ask:not(.hidden)").count() == 0 and "MQ-4" not in got(pg))
    check("focus goes back to the checkbox", pg.evaluate("document.activeElement && document.activeElement.closest('[data-row]') && document.activeElement.closest('[data-row]').dataset.row") == "MQ-4")
    pg.focus("[data-row='MQ-1'] input >> nth=0"); pg.keyboard.press("Space"); pg.wait_for_timeout(120)
    check("Space ticks the first step without a question", "MQ-1" in got(pg) and pg.locator("#ask:not(.hidden)").count() == 0)
    # ---- undo after a multi-tick
    pg.evaluate("__oot.clear(); __oot.render()")
    pg.locator("[data-row='MQ-4'] input >> nth=0").click(force=True); pg.wait_for_timeout(100); pg.click("#ask-yes"); pg.wait_for_timeout(150)
    n1 = len(got(pg))
    check("Undo appears after ticking several things", pg.locator("#undo").count() == 1 and n1 > 3, n1)
    pg.click("#undo"); pg.wait_for_timeout(150)
    check("Undo puts everything back", got(pg) == [], got(pg))
    # ---- rapid clicking stays consistent
    pg.goto(URL + "#skulltulas/sw2"); pg.wait_for_selector(".row"); pg.evaluate("__oot.clear(); __oot.render()")
    pg.click("#lockon"); pg.wait_for_timeout(100)
    boxes = pg.locator(".row input[type=checkbox]:not(.sub *)")
    n = min(30, boxes.count())
    for i in range(n): boxes.nth(i).click(force=True)
    for i in range(0, n, 2): boxes.nth(i).click(force=True)
    pg.wait_for_timeout(200)
    ticked_dom = pg.evaluate("[...document.querySelectorAll('.row input[type=checkbox]')].filter(x=>x.checked && !x.closest('.sub')).length")
    model = pg.evaluate("__oot.got().filter(k=>/^sw2:[A-Z]+-\\d+$/.test(k) && !/^sw2:(MQ|IT|SQ|HP|TR|DG)/.test(k)).length")
    check("rapid ticking: boxes on screen match saved state", ticked_dom == model, (ticked_dom, model))
    check("no errors during rapid ticking", not pg.errs, pg.errs[:2])
    pg.click("#lockon")
    # ---- search
    pg.fill("#q", "hookshot"); pg.wait_for_timeout(300)
    check("search finds skulltulas mentioning the Hookshot", pg.locator(".row").count() > 0)
    pg.fill("#q", "zzzzqqq"); pg.wait_for_timeout(300)
    check("search with no hits says so", "Nothing matches" in pg.locator("#list").inner_text())
    pg.fill("#q", ""); pg.wait_for_timeout(300)
    # ---- filters agree with the counts
    pg.evaluate("__oot.clear(); __oot.tick('MQ-10'); __oot.render()"); pg.wait_for_timeout(100)
    pg.click("#seg-status button[data-v='ready']"); pg.wait_for_timeout(250)
    shown = pg.locator('#list .row').count()
    txt = pg.locator("#sumtext").inner_text()
    import re
    m = re.search(r"(\d+) ready", txt)
    check("Ready filter shows as many rows as the ready count", m and int(m.group(1)) == shown, (txt, shown))
    pg.click("#seg-status button[data-v='all']")
    # ---- persistence and routing
    pg.evaluate("__oot.clear(); __oot.tick('KF-1')"); pg.evaluate("__oot.render()")
    pg.wait_for_timeout(600)
    pg.goto(URL + "#items/n64"); pg.wait_for_selector(".grp"); pg.wait_for_timeout(200)
    check("link to #items/n64 opens Items on N64", pg.evaluate("[__oot.state.tab, __oot.state.ver]") == ["items", "n64"], pg.evaluate("[__oot.state.tab, __oot.state.ver]"))
    pg.goto(URL + "#skulltulas/sw2"); pg.wait_for_selector(".grp")
    check("progress survives a reload", "sw2:KF-1" in pg.evaluate("__oot.got()"))
    # ---- arrow keys move between tabs
    pg.focus("#tab-skull"); pg.keyboard.press("ArrowRight")
    check("arrow keys move along the tabs", pg.evaluate("document.activeElement.id") == "tab-heart", pg.evaluate("document.activeElement.id"))
    check("no errors", not pg.errs, pg.errs[:2])
    ctx.close()
    print("FAILS:", fails)
    b.close()
raise SystemExit(1 if fails else 0)
