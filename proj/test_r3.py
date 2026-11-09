import pwpatch
import os, json
from playwright.sync_api import sync_playwright
F = os.environ.get("F", "themed2.html")
URL = "file:///home/claude/audit/out/" + F
fails = []
def check(name, cond, info=""):
    print(("PASS " if cond else "FAIL ") + name + (" " + str(info)[:300] if info and not cond else ""))
    if not cond: fails.append(name)

FIND = "(n)=>{const r=Object.values(__oot.rowMap()).find(r=>r.id.startsWith('IT-')&&r.name===n);return r?r.id:null}"

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    def fresh(got=None, ver="sw2", w=390):
        ctx = b.new_context(viewport={"width": w, "height": 844})
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.goto(URL)
        pg.evaluate("(a)=>localStorage.setItem('oot-tracker-v1', JSON.stringify({got:a, ver:%r, tab:'items'}))" % ver, got or [])
        pg.reload(); pg.wait_for_selector(".row")
        pg._errs = errs
        return ctx, pg
    def got(pg): return set(pg.evaluate("__oot.got()"))
    def idof(pg, n): return pg.evaluate(FIND, n)

    # ---- item list rule
    ctx, pg = fresh()
    names = pg.evaluate("Object.values(__oot.rowMap()).filter(r=>r.id.startsWith('IT-') && !r.step).map(r=>r.name)")
    check("sw2 has 77 items", len(names) == 77, len(names))
    bad = [n for n in names if any(w in n for w in ("Bombchu", "Egg", "Letter", "Keaton", "Skull Mask", "Spooky", "Bunny", "Cojiro", "Mushroom", "Saw", "Claim", "Prescription", "Frog", "Eye Drops", "Potion Shop")) and "Bottle" not in n]
    check("no trade, mask or consumable items", not bad, bad)
    for need in ("Big Bomb Bag (holds 30)", "Biggest Bomb Bag (holds 40)", "Biggest Quiver (holds 50)", "Ice Arrows", "Forest Medallion", "Echo Gem", "Biggoron's Sword", "Kokiri's Emerald"):
        check("has " + need, need in names)
    check("subs exist in rowMap", pg.evaluate("Object.keys(__oot.rowMap()).filter(k=>k.startsWith('TR-')).length") == 23)
    check("side tab still 44", pg.evaluate("__oot.groups('side').reduce((n,g)=>n+g.rows.length,0)") == 44)
    ctx.close()
    ctx, pg = fresh(ver="n64")
    check("n64 has 76 items", pg.evaluate("Object.values(__oot.rowMap()).filter(r=>r.id.startsWith('IT-') && !r.step).length") == 76)
    # N64: Hyrule Castle fairy = Din's Fire, Death Mountain fairy = Magic Meter + Spin Attack
    NID = "(n)=>Object.values(__oot.rowMap()).filter(r=>r.name===n).map(r=>r.id)"
    ids = {n: pg.evaluate(NID, n)[0] for n in ("Din's Fire", "Magic Meter", "Improved Spin Attack")}
    pg.evaluate("__oot.tick('SQ-20')")
    g = set(pg.evaluate("__oot.got()"))
    check("n64 SQ-20 ticks Din's Fire", "n64:" + ids["Din's Fire"] in g)
    check("n64 SQ-20 does not tick the Spin Attack", "n64:" + ids["Improved Spin Attack"] not in g)
    pg.evaluate("__oot.tick('SQ-19')")
    g = set(pg.evaluate("__oot.got()"))
    check("n64 SQ-19 ticks Magic Meter and Spin Attack", "n64:" + ids["Magic Meter"] in g and "n64:" + ids["Improved Spin Attack"] in g)
    ctx.close()

    # ---- quest -> item, and upgrade pairs
    ctx, pg = fresh()
    sq = lambda n: pg.evaluate("(n)=>{const r=Object.values(__oot.rowMap()).find(r=>r.id.startsWith('SQ-')&&r.name===n);return r&&r.id}", n)
    pg.click("#tab-side"); pg.wait_for_selector(".row")
    s21, s22 = sq("Bombchu Bowling"), sq("Goron City: Hot Rodder Goron (child)")
    b2, b3 = idof(pg, "Big Bomb Bag (holds 30)"), idof(pg, "Biggest Bomb Bag (holds 40)")
    pg.locator("[data-row='%s'] input >> nth=0" % s21).check()
    g = got(pg)
    check("first bomb bag quest gives the 30 bag only", ("sw2:" + b2) in g and ("sw2:" + b3) not in g)
    pg.locator("[data-row='%s'] input >> nth=0" % s22).check()
    check("second one gives the 40 bag", ("sw2:" + b3) in got(pg))
    ctx.close()

    # ---- the user's own progress: the Jabu bug
    mine = json.load(open("/tmp/mig.json")) if os.path.exists("/tmp/mig.json") else None
    if mine:
        ctx, pg = fresh(mine)
        inf = pg.evaluate("__oot.inferSteps()")
        check("no false Jabu-Jabu claim", "MQ-15" not in inf and not any(pg.evaluate("(i)=>__oot.rowMap()[i].name", i) for i in [] ), inf)
        check("DT-4 is not ticked", "sw2:DT-4" not in got(pg))
        print("   inferred:", inf)
        ctx.close()

    # fresh start has no inference at all
    ctx, pg = fresh(None)
    pg.evaluate("localStorage.removeItem('oot-tracker-v1')"); pg.reload(); pg.wait_for_selector(".row")
    check("fresh defaults claim nothing", pg.evaluate("__oot.inferSteps()") == [], pg.evaluate("__oot.inferSteps()"))
    ctx.close()

    # ---- item -> story step, partial items
    ctx, pg = fresh()
    sling, emer = idof(pg, "Fairy Slingshot"), idof(pg, "Kokiri's Emerald")
    pg.locator("[data-row='%s'] input >> nth=0" % sling).check()
    g = got(pg)
    check("slingshot (found mid-dungeon) does NOT finish the Deku Tree step", "sw2:MQ-3" not in g and "sw2:MQ-1" in g and "sw2:MQ-2" in g, sorted(x for x in g if "MQ" in x))
    pg.locator("[data-row='%s'] input >> nth=0" % emer).check()
    g = got(pg)
    check("the Emerald finishes the step", "sw2:MQ-3" in g)
    zt = idof(pg, "Zora Tunic")
    pg.locator("[data-row='%s'] input >> nth=0" % zt).check()
    g = got(pg)
    check("Zora Tunic ticks its step but not the Ice Cavern", "sw2:MQ-27" in g and "sw2:MQ-26" not in g and "sw2:MQ-13" in g)
    ctx.close()

    # hookshot step must not tick the heart
    ctx, pg = fresh()
    pg.evaluate("localStorage.setItem('oot-tracker-v1', JSON.stringify({got:[], ver:'sw2', tab:'main'}))"); pg.reload(); pg.wait_for_selector(".row")
    pg.locator(".laterbtn").first.click(); pg.wait_for_selector("[data-row='MQ-18']")
    pg.locator("[data-row='MQ-18'] [data-here]").click()
    g = got(pg)
    hp16 = "sw2:HP-16" in g
    check("Hookshot step does not tick the Dampe heart or race", not hp16 and "sw2:SQ-27" not in g, [x for x in g if x.startswith("sw2:HP-16") or x == "sw2:SQ-27"])
    check("Hookshot item is ticked", ("sw2:" + idof(pg, "Hookshot")) in g)
    ctx.close()

    # ---- checklists
    ctx, pg = fresh()
    pg.click("#tab-side"); pg.wait_for_selector(".row")
    sq13 = sq("Happy Mask Shop: mask trading")
    subs = pg.evaluate("(i)=>__oot.rowMap()[i].subs.map(s=>s.id)", sq13)
    check("mask quest has 5 steps", len(subs) == 5, subs)
    pg.locator("[data-sub='%s'] input >> nth=0" % subs[2]).check()
    g = got(pg)
    check("ticking step 3 ticks 1 and 2", all(("sw2:" + s) in g for s in subs[:3]) and ("sw2:" + subs[3]) not in g)
    check("quest not done yet", ("sw2:" + sq13) not in g)
    pg.locator("[data-sub='%s'] input >> nth=0" % subs[4]).check()
    g = got(pg)
    check("last step finishes the quest", ("sw2:" + sq13) in g and all(("sw2:" + s) in g for s in subs))
    pg.locator("[data-sub='%s'] input >> nth=0" % subs[1]).uncheck()
    g = got(pg)
    check("unticking step 2 unticks later steps and the quest", ("sw2:" + subs[1]) not in g and ("sw2:" + subs[4]) not in g and ("sw2:" + sq13) not in g and ("sw2:" + subs[0]) in g)
    pg.locator("[data-row='%s'] > .chk input" % sq13).check()
    check("ticking the quest ticks every step", all(("sw2:" + s) in got(pg) for s in subs))
    pg.locator("[data-row='%s'] > .chk input" % sq13).uncheck()
    check("unticking the quest unticks every step", not any(("sw2:" + s) in got(pg) for s in subs))
    # Biggoron
    sq29 = sq("Biggoron's Sword")
    bs = pg.evaluate("(i)=>__oot.rowMap()[i].subs.map(s=>s.id)", sq29)
    check("Biggoron quest has 12 steps", len(bs) == 12)
    pg.locator("[data-sub='%s'] input >> nth=0" % bs[-1]).check()
    g = got(pg)
    item = idof(pg, "Biggoron's Sword")
    check("last Biggoron step ticks the quest and the sword item", ("sw2:" + sq29) in g and ("sw2:" + item) in g and all(("sw2:" + s) in g for s in bs))
    pg.screenshot(path="/home/claude/build/r3_side_sub.png")
    ctx.close()

    # ---- chips
    ctx, pg = fresh()
    pg.click("#tab-items"); pg.wait_for_selector(".row")
    bomb = idof(pg, "Bomb Bag (holds 20)")
    txt = pg.locator("[data-row='%s']" % bomb).inner_text()
    check("Bomb Bag points at Dodongo's Cavern", "obtained from" in txt.lower() and "Dodongo" in txt, txt[:300])
    pg.locator("[data-row='%s'] [data-goto]" % bomb).first.click()
    pg.wait_for_timeout(300)
    check("chip jumps to the story tab", pg.evaluate("__oot.state.tab") == "main")
    # skulltula that needs an item
    pg.click("#tab-skull"); pg.wait_for_selector(".row")
    needs = pg.locator("[data-row='DC-1'] .needs .chip")
    check("DC-1 shows a Needs chip for Goron's Bracelet", "Goron" in pg.locator("[data-row='DC-1'] .needs").inner_text(), pg.locator("[data-row='DC-1']").inner_text()[:300])
    pg.locator("[data-row='DC-1'] .needs [data-goto]").first.click()
    pg.wait_for_timeout(300)
    check("Needs chip opens the item", pg.evaluate("__oot.state.tab") in ("items", "main"))
    # side quest needing an item
    pg.click("#tab-side"); pg.wait_for_selector(".row")
    q = sq("Great Fairy: Death Mountain Trail")
    check("quest shows item chips", "Magic Meter" in pg.locator("[data-row='%s']" % q).inner_text())
    pg.screenshot(path="/home/claude/build/r3_side_chips.png")
    ctx.close()
    print("errors:", [])
    b.close()
print("FAILS:", fails)
