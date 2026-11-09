# Round 9: Din's Fire step folded into the Shadow Temple, per-console tab hover, icon hover effects, banner life by console
import os
os.environ.setdefault("OPEN", "1")
import pwpatch  # noqa
from playwright.sync_api import sync_playwright
URL = "file:///home/claude/audit/out/" + os.environ.get("F", "themed2.html")
fails = []
def check(name, cond, info=""):
    print(("PASS " if cond else "FAIL ") + name + (" " + str(info) if info and not cond else ""))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    # a save that still holds the retired step
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_init_script("try{ if(!sessionStorage.getItem('seeded')){ localStorage.setItem('oot-tracker-v1', JSON.stringify({got:['sw2:MQ-1','sw2:MQ-14','sw2:MQ-15'], ver:'sw2'})); sessionStorage.setItem('seeded','1'); } }catch(e){}")
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL + "#mainquest/sw2"); pg.wait_for_selector(".row")
    g = pg.evaluate("__oot.got()")
    check("retired MQ-14 dropped from a saved game", "sw2:MQ-14" not in g and "sw2:MQ-15" in g, g)
    M = pg.evaluate("Object.keys(__oot.rowMap()).filter(k=>k.startsWith('MQ-'))")
    check("40 story steps, numbers kept (13 and 15 still there)", len(M) == 40 and "MQ-13" in M and "MQ-15" in M and "MQ-14" not in M, len(M))
    pg.evaluate("__oot.clear()"); pg.click(".laterbtn[data-showall]") if pg.locator(".laterbtn[data-showall]").count() else None
    pg.evaluate("__oot.render()"); pg.wait_for_timeout(200)
    sh = pg.locator("[data-row='MQ-31']")
    check("Shadow Temple lists what it needs", sh.locator(".needs.sn .chip").count() == 2 and "Din" in sh.locator(".needs.sn").inner_text(), sh.locator(".needs.sn").count())
    check("Shadow Temple guide says where Din's Fire comes from", "Great Fair" in pg.evaluate("JSON.stringify(__oot.rowMap()['MQ-31'].guide)"))
    # hover: console tabs keep their own motion on every page
    for page_ver in ("n64", "sw2"):
        pg.goto(URL + "#mainquest/" + page_ver); pg.wait_for_selector(".row"); pg.wait_for_timeout(200)
        t = pg.locator(".vtab[data-ver='3ds']:visible").first
        t.hover(); pg.wait_for_timeout(250)
        an = t.evaluate("e => getComputedStyle(e).animationName")
        check(page_ver + " page: 3DS console tab uses the 3DS hover", "ds3dt" in an, an)
        t2 = pg.locator(".vtab[data-ver='n64']:visible").first; t2.hover(); pg.wait_for_timeout(250)
        an2 = t2.evaluate("e => getComputedStyle(e).animationName")
        check(page_ver + " page: N64 console tab uses the N64 hop", "n64hop" in an2, an2)
    pg.goto(URL + "#mainquest/sw2"); pg.wait_for_selector(".row")
    pg.hover("#tab-heart"); pg.wait_for_timeout(200)
    check("Switch 2 tab art wiggles on hover", "joy" in pg.locator("#tab-heart .tic svg").evaluate("e => getComputedStyle(e).animationName"))
    pg.goto(URL + "#mainquest/3ds"); pg.wait_for_selector(".row")
    pg.hover("#tab-heart"); pg.wait_for_timeout(200)
    check("3DS tab art gets the 3D tilt on hover", "ds3d" in pg.locator("#tab-heart .tic svg").evaluate("e => getComputedStyle(e).animationName"))
    check("no page errors", not errs, errs[:2])
    ctx.close()
    # banner life by console
    ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page()
    pg.goto(URL + "#mainquest/sw2"); pg.wait_for_selector(".grp")
    cnt = pg.evaluate("""() => { const o = {}; for (const v of ['n64','3ds','sw2']) { const d = document.createElement('div'); d.innerHTML = OOTTheme.banner('Kokiri Forest', v); o[v] = ['sway','flut','lf','wisp'].map(c => d.querySelectorAll('.'+c).length); } return o; }""")
    check("N64 forest has no wind", cnt["n64"][0] == 0 and cnt["n64"][2] == 0, cnt)
    check("3DS forest sways but has no fluttering branches", cnt["3ds"][0] > 0 and cnt["3ds"][1] == 0, cnt)
    check("Switch 2 forest has the most going on", cnt["sw2"][0] > cnt["3ds"][0] and cnt["sw2"][2] > cnt["3ds"][2] and cnt["sw2"][3] > cnt["3ds"][3], cnt)
    ctx.close()
    print("FAILS:", fails)
    b.close()
raise SystemExit(1 if fails else 0)
