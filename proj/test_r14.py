import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Round 14: two-Link checklists, upgrade items ticking their quests, frog song game."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("OPEN", "1"); os.environ["ASK"] = "1"
import pwpatch
from playwright.sync_api import sync_playwright
URL = _env.OUT_URL + "/themed2.html"
F = []
def check(n, ok, extra=""):
    print(("PASS " if ok else "FAIL ") + n, "" if ok else extra)
    if not ok: F.append(n)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL + "#skull-sw2"); pg.wait_for_selector(".grp")
    if not pg.evaluate("__oot.state.lock"): pg.click("#lockon")
    G = lambda: set(x.split(':')[1] for x in pg.evaluate("__oot.got()"))
    # adult already, bombs: HF-2 both halves open
    pg.evaluate("__oot.clear(); ['MQ-22','IT-35'].forEach(function(x){__oot.tick(x)}); __oot.render()")
    pg.evaluate("__oot.goRow('HF-2')"); pg.wait_for_timeout(500)
    check("second step waits for the first", pg.locator("input[data-id='HF-2.2']").is_disabled())
    check("the row itself can still be ticked in one go", not pg.locator("[data-row='HF-2'] input >> nth=0").is_disabled())
    pg.locator("input[data-id='HF-2.1']").tap(); pg.wait_for_timeout(300)
    check("first step ticks alone", "HF-2.1" in G() and "HF-2" not in G())
    pg.locator("input[data-id='HF-2.2']").tap(); pg.wait_for_timeout(300)
    g = G(); check("both steps and the row are ticked", {"HF-2.1", "HF-2.2", "HF-2"} <= g, g & {"HF-2.1","HF-2.2","HF-2"})
    pg.locator("input[data-id='HF-2.1']").tap(); pg.wait_for_timeout(300)
    if pg.locator("#ask:not(.hidden)").count(): pg.click("#ask-yes"); pg.wait_for_timeout(300)
    g = G(); check("unticking the first step undoes the row", not ({"HF-2.1", "HF-2.2", "HF-2"} & g), g)
    # child before adult: tag on the card
    pg.evaluate("__oot.clear(); __oot.tick('IT-35'); __oot.tick('HF-2.1'); __oot.render()"); pg.wait_for_timeout(300)
    pg.evaluate("__oot.goRow('HF-2')"); pg.wait_for_timeout(400)
    tags = pg.locator("[data-row='HF-2'] .tags").inner_text()
    check("card shows the child part as done", "Child part done" in tags, tags)
    check("second step is locked until adult", pg.locator("input[data-id='HF-2.2']").is_disabled())
    pg.evaluate("__oot.clear(); __oot.tick('IT-35'); __oot.render()"); pg.evaluate("__oot.goRow('HF-2')"); pg.wait_for_timeout(400)
    tags = pg.locator("[data-row='HF-2'] .tags").inner_text()
    check("a locked row with a doable first step says so", "Child part ready" in tags and "Locked" not in tags, tags)
    pg.click("#seg-status button[data-v='ready']"); pg.wait_for_timeout(300)
    check("Ready filter keeps the half-ready row", pg.locator("[data-row='HF-2']").count() == 1)
    pg.click("#seg-status button[data-v='all']"); pg.wait_for_timeout(200)
    # the song mirrors
    pg.evaluate("__oot.clear(); __oot.tick('MQ-17'); __oot.tick('IT-70')"); g = G()
    check("learning the Song of Storms ticks every 'learn it' first step", {"HC-2.1", "BW-1.1", "HP-23.1", "SQ-26.1", "IT-18.1"} <= g, g)
    check("...but not the rows themselves", not ({"HC-2", "BW-1", "HP-23", "SQ-26"} & g))
    pg.evaluate("__oot.clear(); __oot.tick('MQ-17'); __oot.tick('HC-2.1')"); g = G()
    check("ticking a 'learn the song' step ticks the song", "IT-70" in g)
    pg.evaluate("__oot.clear(); __oot.tick('HC-2')"); g = G()
    check("ticking the row ticks both steps and the song", {"HC-2.1", "HC-2.2", "IT-70"} <= g)
    # Scarecrow: quest and song share steps
    pg.evaluate("__oot.clear(); __oot.tick('SQ-12.1')"); g = G()
    check("Scarecrow quest step 1 ticks the song's step 1", "IT-69.1" in g and "IT-69" not in g)
    pg.evaluate("__oot.untick('IT-69.1')"); g = G()
    check("and unticks it again", "SQ-12.1" not in g)
    # frogs: the song game needs Storms; one frog heart does not finish the other
    pg.evaluate("__oot.clear(); ['IT-19','IT-64','IT-65','IT-66','IT-67','IT-68'].forEach(function(x){__oot.tick(x)})")
    rm = pg.evaluate("__oot.unmet(__oot.rowMap()['HP-24']).map(function(c){return JSON.stringify(c)})")
    check("frog song game stays locked without the Song of Storms", any("IT-70" in c for c in rm), rm)
    pg.evaluate("__oot.clear(); __oot.tick('HP-23')"); g = G()
    check("the Storms frog heart does not tick the song-game heart", "HP-24" not in g and "HP-24.1" in g)
    # upgrades
    pg.evaluate("__oot.clear(); __oot.tick('SQ-18'); __oot.tick('IT-45')"); g = G()
    check("biggest nut bag ticks the Forest Stage quest", "SQ-15" in g)
    pg.evaluate("__oot.clear(); __oot.tick('IT-35'); __oot.tick('TR-5'); __oot.tick('IT-44')"); g = G()
    check("middle nut bag with both quests open guesses nothing", not ({"SQ-15", "SQ-18"} & g), g)
    # stuck as adult: child steps wait for the Forest Temple and the Prelude of Light
    pg.evaluate("__oot.clear(); ['MQ-17','IT-35'].forEach(function(x){__oot.tick(x)})")
    u = pg.evaluate("__oot.unmet(__oot.rowMap()['HF-2.1']).map(JSON.stringify)")
    check("adult before the Forest Temple cannot do child steps", any("MQ-22" in x for x in u), u)
    pg.evaluate("__oot.tick('MQ-22')")
    check("after the Prelude of Light child steps open again", not pg.evaluate("__oot.unmet(__oot.rowMap()['HF-2.1']).length"))
    pg.evaluate("__oot.clear(); __oot.tick('IT-35')")
    check("a child who never grew up is not blocked", not pg.evaluate("__oot.unmet(__oot.rowMap()['HF-2.1']).length"))
    # versions: HF-2 steps only on Switch 2
    pg.evaluate("__oot.clear()")
    pg.goto(URL + "#skull-n64"); pg.wait_for_selector(".grp")
    check("N64 HF-2 has no two-Link steps", not pg.evaluate("!!__oot.rowMap()['HF-2.1']"))
    check("N64 LW-3 keeps them", pg.evaluate("!!__oot.rowMap()['LW-3.1']"))
    # progress code keeps step keys
    pg.goto(URL + "#skull-sw2"); pg.wait_for_selector(".grp")
    pg.evaluate("__oot.clear(); __oot.tick('IT-35'); __oot.tick('HF-2.1'); __oot.render()")
    pg.locator("#xfer summary").click(); code = pg.input_value("#xcode")
    pg.evaluate("__oot.clear(); __oot.render()")
    pg.fill("#xin", code); pg.locator("#xapply").click(); pg.wait_for_timeout(200)
    check("progress code carries step ticks", "HF-2.1" in G(), pg.inner_text("#xmsg2"))
    pg.reload(); pg.wait_for_selector(".grp")
    check("step ticks survive a reload", "HF-2.1" in G())
    check("no page errors", not errs, errs[:3])
    b.close()
print("FAILS:", F)
