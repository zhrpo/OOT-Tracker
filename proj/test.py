import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
# F-001 (Session 6, Phase 0): the original test.py crashed (it did not load the area-opening harness and it targeted index.html,
# which is no longer built). This replacement keeps its intent on the shipped page (themed2.html): tick a Skulltula and a Heart
# in the UI, reload, check persistence, exercise the filters and search, load a desktop viewport, and report page errors.
# It prints a FAILS: list and exits 1 on any failure.
import os, sys
import pwpatch  # opens the areas, switches the confirm prompts and the spoiler veil off
from playwright.sync_api import sync_playwright

FILE = os.environ.get("F", "themed2.html")
fails = []


def check(name, cond, detail=""):
    print(("ok   " if cond else "FAIL ") + name + ((" - " + str(detail)) if detail else ""))
    if not cond:
        fails.append(name)


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    pg = ctx.new_page()
    errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(_env.OUT_URL + "/" + FILE + "#skulltulas")
    pg.wait_for_selector(".row")
    n = pg.locator(".row").count()
    check("skull tab renders rows", n > 0, n)
    before = pg.locator("input[data-id='KF-1']:checked").count()
    check("KF-1 is not ticked on a fresh page of this test", before == 0)

    # tick one in the UI, reload, it must persist
    pg.locator("input[data-id='KF-1']").check()
    check("tick took effect", pg.locator("input[data-id='KF-1']").is_checked())
    pg.wait_for_timeout(600)  # the save is debounced
    pg.reload()
    pg.wait_for_selector(".row")
    check("tick survives a reload", pg.locator("input[data-id='KF-1']").is_checked())
    pg.screenshot(path=_env.SCRATCH + "/shot_skull_mobile.png")

    # status filter
    total = pg.locator(".row").count()
    pg.click("#seg-status button[data-v='todo']")
    todo = pg.locator(".row").count()
    check("'to do' filter hides the ticked row", todo < total, "%d -> %d" % (total, todo))
    pg.click("#seg-status button[data-v='all']")
    check("'all' filter restores the rows", pg.locator(".row").count() == total)

    # search
    pg.fill("#q", "Hookshot")
    pg.wait_for_timeout(300)
    found = pg.locator(".row").count()
    check("search for Hookshot finds some rows but not all", 0 < found < total, "%d of %d" % (found, total))
    pg.fill("#q", "")
    pg.wait_for_timeout(300)
    check("clearing the search restores the rows", pg.locator(".row").count() == total)

    # hearts tab: tick persists too
    pg.click("#tab-heart")
    pg.wait_for_selector(".row")
    check("hearts tab renders rows", pg.locator(".row").count() > 0)
    pg.locator("input[data-id='HP-1']").check()
    check("heart tick took effect", pg.locator("input[data-id='HP-1']").is_checked())
    pg.wait_for_timeout(600)
    pg.reload()
    pg.wait_for_selector(".row")
    pg.click("#tab-heart")
    pg.wait_for_selector(".row")
    check("heart tick survives a reload", pg.locator("input[data-id='HP-1']").is_checked())
    pg.screenshot(path=_env.SCRATCH + "/shot_heart_mobile.png")

    # desktop viewport
    pg2 = b.new_context(viewport={"width": 1100, "height": 800}).new_page()
    pg2.on("pageerror", lambda e: errs.append(str(e)))
    pg2.goto(_env.OUT_URL + "/" + FILE + "#skulltulas")
    pg2.wait_for_selector(".row")
    check("desktop viewport renders rows", pg2.locator(".row").count() > 0)
    pg2.screenshot(path=_env.SCRATCH + "/shot_skull_desktop.png")

    check("no page or console errors", not errs, errs[:3])
    b.close()

print("FAILS:", fails)
sys.exit(1 if fails else 0)
