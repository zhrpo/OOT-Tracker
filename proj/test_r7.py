# Round 7: quest-prize hearts live in their location groups, age-aware tab art, hide-later bar, N64 notched cards
import os, re
os.environ.setdefault("OPEN", "1")
import pwpatch  # noqa: opens every card so rows are reachable
from playwright.sync_api import sync_playwright
F = os.environ.get("F", "themed2.html")
URL = "file:///home/claude/audit/out/" + F
fails = []
def check(name, cond, info=""):
    print(("PASS " if cond else "FAIL ") + name + (" " + str(info) if info and not cond else ""))
    if not cond: fails.append(name)
def norm(s): return re.sub(r"ic\d+_", "ic_", s or "")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    def page(w=390, h=844, scheme="light"):
        ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=scheme)
        pg = ctx.new_page(); pg.errs = []
        pg.on("pageerror", lambda e: pg.errs.append(str(e)))
        pg.on("console", lambda m: pg.errs.append(m.text) if m.type == "error" else None)
        return ctx, pg
    for ver in ("n64", "3ds", "sw2"):
        ctx, pg = page()
        pg.goto(URL + "#hearts/" + ver); pg.wait_for_selector(".row")
        # ---- hearts: quest prizes inside location groups
        n = pg.locator(".tag.prize").count()
        check(ver + " 12 quest-prize hearts are tagged", n == 12, n)
        names = pg.evaluate("[...document.querySelectorAll('.grp')].map(g => g.querySelector('.gname').textContent)")
        check(ver + " no 'Earned through side quests' group", not any("Earned" in x for x in names), names)
        check(ver + " Lost Woods group is back", "Lost Woods" in names, names)
        check(ver + " 36 hearts in total", pg.locator("[data-row^='HP-']").count() == 36, pg.locator("[data-row^='HP-']").count())
        # two-way ticking with a single-heart quest
        row = pg.locator("[data-row='HP-1']")
        goto = row.locator(".chips [data-goto^='SQ-']")
        check(ver + " prize heart has a link to its quest", goto.count() >= 1)
        qid = goto.first.get_attribute("data-goto")
        pg.locator("[data-row='HP-1'] input >> nth=0").check()
        g = pg.evaluate("__oot.got()")
        check(ver + " ticking the heart ticks the quest", (ver + ":" + qid) in g, [x for x in g if "SQ" in x])
        pg.locator("[data-row='HP-1'] input >> nth=0").uncheck()
        g = pg.evaluate("__oot.got()")
        check(ver + " unticking the heart unticks the quest", (ver + ":" + qid) not in g)
        # link goes to the quest tab
        goto.first.click(); pg.wait_for_timeout(250)
        check(ver + " link opens the quests tab", pg.evaluate("__oot.state.tab") == "side", pg.evaluate("__oot.state.tab"))
        check(ver + " quest row is on screen", pg.locator("[data-row='%s']" % qid).count() == 1)
        pg.locator("[data-row='%s'] input >> nth=0" % qid).check(); pg.wait_for_timeout(100)
        pg.click("#tab-heart"); pg.wait_for_timeout(150)
        check(ver + " ticking the quest ticks the heart", pg.locator("[data-row='HP-1'] input >> nth=0").is_checked())
        check(ver + " no console errors", not pg.errs, pg.errs)
        ctx.close()
    # ---- tab art follows the story
    for ver in ("n64", "3ds", "sw2"):
        ctx, pg = page()
        pg.goto(URL + "#mainquest/" + ver); pg.wait_for_selector(".grp")
        icon = lambda t: norm(pg.evaluate("document.querySelector('#tab-%s .tic').innerHTML" % t))
        before = {t: icon(t) for t in ("main", "skull", "heart", "side", "items")}
        adult_id = pg.evaluate("__oot.adultId ? __oot.adultId() : null")
        check(ver + " test hook for the Master Sword exists", bool(adult_id), adult_id)
        pg.evaluate("__oot.tick(%r); __oot.render()" % adult_id); pg.wait_for_timeout(200)
        after = {t: icon(t) for t in before}
        for t in ("main", "heart", "side", "items"):
            check(ver + " " + t + " icon changes to the adult picture", before[t] != after[t])
        check(ver + " skulltula icon stays the same", before["skull"] == after["skull"])
        check(ver + " every icon is a real drawing", all(len(v) > 400 for v in after.values()))
        check(ver + " no console errors", not pg.errs, pg.errs)
        ctx.close()
    # ---- the visible way to hide later steps again
    ctx, pg = page()
    pg.goto(URL + "#mainquest/sw2"); pg.wait_for_selector(".grp")
    pg.click(".laterbtn[data-showall]"); pg.wait_for_timeout(200)
    check("later steps showing after the tap", pg.evaluate("__oot.state.showAll") is True)
    check("a bar appears where the hidden steps begin", pg.locator(".later.showing [data-hideall]").count() == 1)
    check("and a chip near the top", pg.locator(".chip[data-hideall]").count() >= 1)
    pg.locator(".later.showing [data-hideall]").click(); pg.wait_for_timeout(200)
    check("tapping the bar hides them again", pg.evaluate("__oot.state.showAll") is False)
    check("the show button is back", pg.locator("[data-showall]").count() >= 1)
    ctx.close()
    # ---- N64 cards are notched, the others are not
    for ver, want in (("n64", True), ("3ds", False), ("sw2", False)):
        ctx, pg = page()
        pg.goto(URL + "#items/" + ver); pg.wait_for_selector(".grp")
        cp = pg.evaluate("getComputedStyle(document.querySelector('.grp')).clipPath")
        check(ver + " card clip-path " + ("cut corners" if want else "none"), (cp.startswith("polygon") if want else cp == "none"), cp)
        ctx.close()
    b.close()
print("FAILS:", fails)
