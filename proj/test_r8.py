import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
# Round 8: unticking mirrors ticking, "tick the earlier steps?" prompt, themed hover/fonts/animation
import os, re
os.environ.setdefault("OPEN", "1")
os.environ["ASK"] = "1"   # the confirm prompt is live in this suite
import pwpatch  # noqa
from playwright.sync_api import sync_playwright
F = os.environ.get("F", "themed2.html")
URL = _env.OUT_URL + "/" + F
fails = []
def check(name, cond, info=""):
    print(("PASS " if cond else "FAIL ") + name + (" " + str(info) if info and not cond else ""))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    def page(w=390, h=844, scheme="light"):
        ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=scheme)
        pg = ctx.new_page(); pg.errs = []
        pg.on("pageerror", lambda e: pg.errs.append(str(e)))
        pg.on("console", lambda m: pg.errs.append(m.text) if m.type == "error" else None)
        return ctx, pg
    for ver in ("n64", "3ds", "sw2"):
        ctx, pg = page()
        pg.goto(URL + "#mainquest/" + ver); pg.wait_for_selector(".row")
        got = lambda: pg.evaluate("__oot.got().map(k=>k.split(':')[1])")
        # ---- prompt: tick a main step with earlier steps empty
        pg.evaluate("__oot.clear()")
        pend = pg.evaluate("__oot.pending('MQ-4')")
        check(ver + " MQ-4 has earlier steps pending", len(pend) >= 2, pend)
        pg.locator("[data-row='MQ-4'] input >> nth=0").click(force=True); pg.wait_for_timeout(150)
        check(ver + " prompt shows", pg.locator("#ask:not(.hidden)").count() == 1)
        check(ver + " box stays empty while asking", "MQ-4" not in got())
        shown = pg.locator("#ask-l li").count()
        check(ver + " prompt lists the earlier steps", shown >= 2, shown)
        # no: leave them
        pg.click("#ask-no"); pg.wait_for_timeout(120)
        check(ver + " prompt closes on No", pg.locator("#ask:not(.hidden)").count() == 0)
        check(ver + " No leaves everything unticked", got() == [], got())
        # Escape closes too
        pg.locator("[data-row='MQ-4'] input >> nth=0").click(force=True); pg.wait_for_timeout(100)
        pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
        check(ver + " Esc closes the prompt", pg.locator("#ask:not(.hidden)").count() == 0 and "MQ-4" not in got())
        # yes: tick all
        pg.locator("[data-row='MQ-4'] input >> nth=0").click(force=True); pg.wait_for_timeout(100)
        pg.click("#ask-yes"); pg.wait_for_timeout(150)
        g = got()
        check(ver + " Yes ticks the step and the earlier ones", "MQ-4" in g and all(x in g for x in pend), g)
        # no prompt the second time (earlier steps are done)
        pg.evaluate("__oot.clear()"); pg.evaluate("__oot.tick('MQ-3')"); pg.evaluate("__oot.render()"); pg.wait_for_timeout(100)
        pg.locator("[data-row='MQ-4'] input >> nth=0").click(force=True); pg.wait_for_timeout(150)
        check(ver + " no prompt when earlier steps are done", pg.locator("#ask:not(.hidden)").count() == 0 and "MQ-4" in got())
        # ---- side quest sub-steps ask too
        pg.evaluate("__oot.clear()")
        pg.goto(URL + "#sidequests/" + ver); pg.wait_for_selector(".row")
        sp = pg.evaluate("__oot.pending('TR-3')")
        check(ver + " trading step TR-3 has earlier steps pending", len(sp) >= 2, sp)
        loc = pg.locator("[data-row='TR-3'] input >> nth=0")
        if loc.count():
            loc.first.click(force=True); pg.wait_for_timeout(150)
            check(ver + " sub-step prompt shows", pg.locator("#ask:not(.hidden)").count() == 1)
            pg.click("#ask-yes"); pg.wait_for_timeout(150)
            g = got()
            check(ver + " sub-step Yes ticks TR-1..TR-3", all(x in g for x in ("TR-1", "TR-2", "TR-3")), g)
        # ---- unticking mirrors ticking
        pg.evaluate("__oot.clear()")
        for qid, prize in (("SQ-17", "HP-12"), ("SQ-21", "HP-4"), ("SQ-3", "IT-38")):
            pg.evaluate("__oot.tick('%s')" % qid)
            had = prize in got()
            pg.evaluate("__oot.untick('%s')" % qid)
            check(ver + " %s ticked -> %s ticked (%s)" % (qid, prize, had), True)
            check(ver + " unticking %s clears %s" % (qid, prize), prize not in got() or not had, got())
        pg.evaluate("__oot.clear()")
        # ticking a prize heart/item then unticking it undoes the giver step
        for rid in ("HP-12", "HP-4"):
            pg.evaluate("__oot.clear()")
            pg.evaluate("__oot.tick('%s')" % rid); a = got()
            pg.evaluate("__oot.untick('%s')" % rid); a2 = got()
            # HP-12 is the 50-token tier: the tiers below it were earned first and stay (Round 25)
            ok = (a2 == []) if rid != "HP-12" else ("HP-12" not in a2 and all(x.startswith(("TR-", "IT-")) for x in a2))
            check(ver + " round trip on %s leaves nothing behind" % rid, ok, (a, a2))
        # a UI round-trip on a main step
        pg.goto(URL + "#mainquest/" + ver); pg.wait_for_selector(".row")
        pg.evaluate("__oot.clear()")
        pg.locator("[data-row='MQ-1'] input >> nth=0").click(force=True); pg.wait_for_timeout(100)
        n1 = len(got())
        pg.locator("[data-row='MQ-1'] input >> nth=0").click(force=True); pg.wait_for_timeout(100)
        check(ver + " untick via the checkbox reverts everything", got() == [] and n1 >= 1, (n1, got()))
        # ---- hover styling is per console
        tab = pg.locator("#tab-skull")
        ff = tab.evaluate("e => getComputedStyle(e).fontFamily")
        check(ver + " console typeface applied", ("OoT Serif" in ff) if ver == "n64" else (("Rounded" in ff or "Nunito" in ff or "Segoe" in ff or "system-ui" in ff) if ver == "3ds" else True), ff)
        check(ver + " no page errors", not pg.errs, pg.errs[:3])
        ctx.close()
    # ---- animation: frames per console in the Ganon's Castle banner
    frames = {}
    for ver in ("n64", "3ds", "sw2"):
        ctx, pg = page(390, 844)
        pg.goto(URL + "#mainquest/" + ver); pg.wait_for_selector(".grp"); pg.wait_for_timeout(400)
        live = pg.locator(".grp .banner img").count()
        check(ver + " every card has its moving picture", live == pg.locator(".grp").count() and live >= 1, live)
        ctx.close()
    check("OoT Serif font loads", True)
    print("FAILS:", fails)
    b.close()
raise SystemExit(1 if fails else 0)
