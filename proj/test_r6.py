# Round 6: collapsed-by-default cards, art stays visible, landing page + last tab, locked rows cannot be ticked, area order
import os, json
from playwright.sync_api import sync_playwright
F = os.environ.get("F", "themed2.html")
URL = "file:///home/claude/audit/out/" + F
fails = []
def check(name, cond, info=""):
    print(("PASS " if cond else "FAIL ") + name + (" " + str(info) if info and not cond else ""))
    if not cond: fails.append(name)
ORDER = ['Kokiri Forest','Lost Woods','Sacred Forest Meadow','Great Deku Tree','Forest Temple','Hyrule Field','Lon Lon Ranch','Hyrule Castle Town','Hyrule Castle','Kakariko Village','Kakariko Graveyard','Bottom of the Well','Shadow Temple','Death Mountain Trail','Goron City',"Dodongo's Cavern",'Death Mountain Crater','Fire Temple',"Zora's River","Zora's Domain","Jabu-Jabu's Belly","Zora's Fountain",'Ice Cavern','Lake Hylia','Water Temple','Gerudo Valley','Gerudo Fortress','Haunted Wasteland','Desert Colossus','Spirit Temple',"Ganon's Castle"]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    def page(w=390, h=844, scheme="light"):
        ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=scheme)
        pg = ctx.new_page(); pg.errs = []
        pg.on("pageerror", lambda e: pg.errs.append(str(e)))
        pg.on("console", lambda m: pg.errs.append(m.text) if m.type == "error" else None)
        return ctx, pg
    # ---- first visit: Main quest on the N64
    ctx, pg = page()
    pg.goto(URL); pg.wait_for_selector(".grp")
    check("first visit lands on Main quest", pg.evaluate("__oot.state.tab") == "main")
    check("first visit is the N64 game", pg.evaluate("__oot.state.ver") == "n64")
    check("main tab: the current chapter is open, the rest shut", pg.locator(".grp:not(.coll)").count() == 1, pg.locator(".grp:not(.coll)").count())
    ctx.close()
    # ---- last tab and game come back
    ctx, pg = page()
    pg.goto(URL + "#skulltulas/sw2"); pg.wait_for_selector(".grp")
    pg.click("#tab-heart"); pg.wait_for_timeout(300)
    pg.goto("about:blank"); pg.goto(URL); pg.wait_for_selector(".grp")
    check("last tab restored", pg.evaluate("__oot.state.tab") == "heart", pg.evaluate("__oot.state.tab"))
    check("last game restored", pg.evaluate("__oot.state.ver") == "sw2")
    ctx.close()
    # ---- skulltulas: all areas shut, art still there, order is the one asked for
    ctx, pg = page()
    pg.goto(URL + "#skulltulas/sw2"); pg.wait_for_selector(".grp")
    n = pg.locator(".grp").count()
    check("31 skulltula areas", n == 31, n)
    check("every area starts shut", pg.locator(".grp.coll").count() == n)
    check("no rows while shut", pg.locator(".row").count() == 0)
    check("every shut card shows art", pg.locator(".grp.coll .gh .banner :is(svg,img)").count() == n)
    names = pg.evaluate("[...document.querySelectorAll('.gh .gname')].map(e=>e.textContent)")
    check("area order", names == ORDER, [x for x in zip(names, ORDER) if x[0] != x[1]][:3])
    check("hearts have no combined areas", not any(("Castle town" in x or " and " in x) for x in pg.evaluate("[...document.querySelectorAll('.gh .gname')].map(e=>e.textContent)")))
    # card geometry: the title bar is the art itself, so its box equals the card's inside
    bad = pg.evaluate("""() => [...document.querySelectorAll('.grp.coll')].map(g => {
        const gr = g.getBoundingClientRect(), h = g.querySelector('h2').getBoundingClientRect(), a = g.querySelector('.banner').getBoundingClientRect(), cs = getComputedStyle(g), bw = parseFloat(cs.borderLeftWidth);
        return [Math.abs(h.left - (gr.left + bw)), Math.abs(h.right - (gr.right - bw)), Math.abs(h.top - (gr.top + bw)), Math.abs(h.bottom - (gr.bottom - bw)), Math.abs(a.width - h.width), Math.abs(a.height - h.height)].some(v => v > 1.01);
      }).filter(Boolean).length""")
    check("shut card: title bar fills the card exactly", bad == 0, bad)
    # open one: banner stays, rows appear, title sticks
    pg.click('button.gh[data-gi="1"]')
    check("opening shows rows", pg.locator('#g1 .row').count() == 3)
    check("open card keeps its art", pg.locator("#g1 .banner :is(svg,img)").count() == 1)
    check("aria-expanded flips", pg.get_attribute('button.gh[data-gi="1"]', "aria-expanded") == "true")
    pg.click('button.gh[data-gi="1"]')
    check("tap again shuts it", pg.locator('#g1.coll').count() == 1)
    # expand all / collapse all
    pg.click("#collapse")
    check("Expand all opens everything", pg.locator(".grp.coll").count() == 0)
    pg.click("#collapse")
    check("Collapse all shuts everything", pg.locator(".grp.coll").count() == n)
    # search opens matches
    pg.fill("#q", "Hookshot"); pg.wait_for_timeout(300)
    check("search shows matching rows", pg.locator(".row").count() > 0)
    pg.fill("#q", ""); pg.wait_for_timeout(300)
    # jump via areas select opens the area
    opts = pg.locator("#jump option").all_inner_texts()
    pg.select_option("#jump", label=[o for o in opts if o.startswith("Lake Hylia")][0]); pg.wait_for_timeout(700)
    check("jump opens the area", pg.locator("#g23:not(.coll)").count() == 1)
    # sticky title while scrolling an open area
    pg.evaluate("document.querySelector('#g23').scrollIntoView()")
    pg.evaluate("window.scrollBy(0, 120)"); pg.wait_for_timeout(200)
    r = pg.evaluate("""() => { const h = document.querySelector('#g23 h2').getBoundingClientRect(), t = document.querySelector('.top').getBoundingClientRect(); return [h.top, h.bottom, t.bottom]; }""")
    check("open title strip stays under the header", abs(r[1] - r[2] - float(pg.evaluate("getComputedStyle(document.querySelector('#g23')).getPropertyValue('--bar')").replace('px', ''))) < 2 and r[1] > r[2], r)
    ctx.close()
    # ---- locked rows cannot be ticked
    ctx, pg = page()
    pg.goto(URL + "#skulltulas/sw2"); pg.wait_for_selector(".grp")
    pg.click('button.gh[data-gi="0"]')
    dis = pg.locator('[data-row="KF-1"] input').is_disabled()
    check("locked row checkbox is disabled", dis)
    pg.evaluate("document.querySelector('[data-row=\"KF-1\"] input').click()")
    check("clicking a locked row does nothing", "sw2:KF-1" not in pg.evaluate("__oot.got()"))
    # forced change event is refused too
    pg.evaluate("""() => { const i = document.querySelector('[data-row="KF-1"] input'); i.disabled = false; i.checked = true; i.dispatchEvent(new Event('change', {bubbles: true})); }""")
    check("a forced tick is refused", "sw2:KF-1" not in pg.evaluate("__oot.got()") and not pg.locator('[data-row="KF-1"] input').is_checked())
    pg.evaluate("__oot.tick('IT-1')")
    pg.click('#tab-main'); pg.click('#tab-skull'); pg.wait_for_selector(".grp")
    check("an area you opened stays open when you come back", pg.locator('#g0:not(.coll)').count() == 1)
    check("unlocks once the sword is ticked", not pg.locator('[data-row="KF-1"] input').is_disabled())
    pg.locator('[data-row="KF-1"] input').check()
    check("an unlocked row can be ticked", "sw2:KF-1" in pg.evaluate("__oot.got()"))
    pg.evaluate("__oot.untick('IT-1')")
    pg.click('#tab-main'); pg.click('#tab-skull'); pg.wait_for_selector(".grp")
    check("an area you opened stays open when you come back", pg.locator('#g0:not(.coll)').count() == 1)
    # ticked rows never lock, so a done row can always be unticked
    pg.locator('[data-row="KF-1"] input').uncheck()
    check("ticked rows can still be unticked", "sw2:KF-1" not in pg.evaluate("__oot.got()"))
    pg.click("#lockon")
    check("Locks off enables every box", pg.locator('[data-row] input:disabled').count() == 0)
    check("no console errors", not pg.errs, pg.errs)
    ctx.close()
    # ---- every themed area has its own art (no fallbacks)
    ctx, pg = page()
    pg.goto(URL + "#skulltulas/sw2"); pg.wait_for_selector(".grp")
    areas = pg.evaluate("[...document.querySelectorAll('.grp')].map(g => [g.querySelector('.gname').textContent, g.getAttribute('data-area')])")
    d = {}
    for nme, ar in areas: d.setdefault(ar, []).append(nme)
    check("no area falls back to the field scene by accident", d.get("field") == ["Hyrule Field"], d.get("field"))
    check("each area name gets its own key", all(len(v) == 1 for v in d.values()), {k: v for k, v in d.items() if len(v) > 1})
    ctx.close()
    # ---- the items, quests and hearts tabs have art of their own too
    ctx, pg = page()
    for h in ("items", "sidequests", "hearts"):
        pg.goto(URL + "#" + h + "/sw2"); pg.wait_for_selector(".grp")
        ar = pg.evaluate("[...document.querySelectorAll('.grp')].map(g => [g.querySelector('.gname').textContent, g.getAttribute('data-area')])")
        bad = [x for x in ar if x[1] == "field" and x[0] != "Hyrule Field"]
        check(h + " groups never fall back to the field scene", not bad, bad)
    ctx.close()
    b.close()
print("FAILS:", fails)
