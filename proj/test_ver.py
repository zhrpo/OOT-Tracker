import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import pwpatch
from playwright.sync_api import sync_playwright

URL = _env.OUT_URL + "/" + __import__("os").environ.get("F", "themed2.html") + ""
errs = []

MOCK = """
(function(){
  var store = window.__store = {};
  var subs = {};
  var seed = window.__seed || null;
  function snap(path, pending){
    var d = store[path];
    return { exists: d !== undefined, data: function(){ return d ? JSON.parse(JSON.stringify(d)) : undefined; },
             metadata: { fromCache: false, hasPendingWrites: !!pending } };
  }
  var db = { doc: function(path){ return {
      onSnapshot: function(next){ (subs[path] = subs[path] || []).push(next); setTimeout(function(){ next(snap(path)); }, 50); return function(){}; },
      set: function(data){ return new Promise(function(res){ setTimeout(function(){
          store[path] = JSON.parse(JSON.stringify(data)); window.__writes = (window.__writes||0)+1;
          (subs[path]||[]).forEach(function(n){ n(snap(path, false)); }); res(); }, 60); }); }
  }; } };
  var user = { id: function(){ return Promise.resolve('u_test'); } };
  window.claude = { use: function(n){ return Promise.resolve(n === 'db' ? db : n === 'user' ? user : null); } };
})();
"""


def tabtxt(pg, t):
    return pg.inner_text("#tab-" + t).replace("\n", " ")


def rows(pg):
    return pg.locator("#list .row").count()


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])

    # ---------- local (no claude) ----------
    ctx = b.new_context(viewport={"width": 390, "height": 844})
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
    pg.goto(URL + "#skulltulas")
    pg.wait_for_selector(".row")
    print("default hash/ver pressed:", pg.locator("#vtabs .vtab[aria-selected=true]").inner_text())
    print("vtabs:", pg.locator("#vtabs .vtab").all_inner_texts())
    print("legacy visible:", pg.locator("#legacy").is_visible(), "|", pg.inner_text("#legacy").split("\n")[0])
    print("tabs before claim:", tabtxt(pg, "skull"), "|", tabtxt(pg, "heart"), "|", tabtxt(pg, "side"))
    pg.locator("#legacy button[data-claim='n64']").click()
    print("after claim N64 ->", pg.locator("#vtabs .vtab[aria-selected=true]").inner_text(), "| legacy visible:", pg.locator("#legacy").is_visible())
    print("tabs N64:", tabtxt(pg, "skull"), "|", tabtxt(pg, "heart"), "|", tabtxt(pg, "side"))
    print("DT-1 checked on N64:", pg.locator("input[data-id='DT-1']").is_checked())
    print("N64 skull rows:", rows(pg))
    print("no panel on N64:", pg.locator("#vpanel .vpanel").count())

    # switch to 3DS
    pg.locator("#vtabs .vtab[data-ver='3ds']").click()
    print("3DS tabs:", tabtxt(pg, "skull"), "|", tabtxt(pg, "heart"), "|", tabtxt(pg, "side"))
    print("3DS DT-1 checked (should be False):", pg.locator("input[data-id='DT-1']").is_checked())
    print("3DS panel lead:", pg.inner_text("#vpanel .vpanel .lead"))
    print("3DS hash:", pg.evaluate("location.hash"))
    pg.locator("#tab-side").click()
    print("3DS side rows:", rows(pg), "| SQ-17 note:", pg.locator("[data-row='SQ-17'] .vn").inner_text())
    print("3DS SQ-17 reward has Shard:", "Shard of Agony" in pg.locator("[data-row='SQ-17']").inner_text())
    print("3DS SQ-44 present (False):", pg.locator("[data-row='SQ-44']").count() > 0)

    # switch to Switch 2
    pg.locator("#vtabs .vtab[data-ver='sw2']").click()
    print("SW2 side rows:", rows(pg), "| tab", tabtxt(pg, "side"))
    print("SQ-44 present:", pg.locator("[data-row='SQ-44']").count() > 0, "| only tag:", pg.locator("[data-row='SQ-44'] .tag.only").inner_text())
    print("SQ-17 reward has Echo Gem:", "Echo Gem" in pg.locator("[data-row='SQ-17']").inner_text())
    body = pg.inner_text("#list")
    for phrase in ["Dampé follows you from spot", "purple glowing lanterns", "about 4 minutes instead of 3", "Follow his prompts to catch it"]:
        print("spoiler hidden:", phrase, phrase not in body, "| in DOM html:", phrase in pg.inner_html("#list"))
    # reveal SQ-33 on sw2
    pg.locator("button[data-reveal='SQ-33']").click()
    g = pg.locator("[data-gbox='SQ-33']").inner_text()
    print("SQ-33 revealed has lantern step:", "purple glowing lanterns" in g, "| steps:", pg.locator("[data-gbox='SQ-33'] li").count())
    pg.locator("#vtabs .vtab[data-ver='n64']").click()
    g2 = pg.locator("[data-gbox='SQ-33']").inner_text()
    print("N64 SQ-33 (revealed state kept, no lantern step):", "purple glowing lanterns" not in g2, "| steps:", pg.locator("[data-gbox='SQ-33'] li").count())
    pg.locator("#vtabs .vtab[data-ver='sw2']").click()

    # hearts on sw2
    pg.locator("#tab-heart").click()
    print("SW2 heart rows:", rows(pg), "| HP-31 present (False):", pg.locator("[data-row='HP-31']").count() > 0, "| HP-37:", pg.locator("[data-row='HP-37']").count() > 0)
    print("HP-6 vn:", pg.locator("[data-row='HP-6'] .vn").inner_text()[:90])
    print("HP-6 where:", pg.locator("[data-row='HP-6'] .where").inner_text()[:80])
    print("HP-17 tag:", pg.locator("[data-row='HP-17'] .tag.adult").count(), "(adult tag)")
    print("heart panel summary:", pg.inner_text("#vpanel summary"))
    print("diff rows on sw2 hearts:", pg.locator("#list .row.diff").count())
    pg.screenshot(path="shot_ver_sw2_hearts.png")
    # tick HP-6 on sw2
    pg.locator("input[data-id='HP-6']").check()
    print("sw2 hearts after tick:", tabtxt(pg, "heart"))
    pg.locator("#vtabs .vtab[data-ver='n64']").click()
    print("n64 hearts (should stay 0):", tabtxt(pg, "heart"), "| HP-6 where:", pg.locator("[data-row='HP-6'] .where").inner_text()[:60])
    print("N64 HP-31 present:", pg.locator("[data-row='HP-31']").count() > 0)
    # zora river group note on skull sw2
    pg.locator("#vtabs .vtab[data-ver='sw2']").click()
    pg.locator("#tab-skull").click()
    print("zora note on sw2:", "Magic Bean seller" in pg.inner_text("#list"))
    pg.locator("#vtabs .vtab[data-ver='n64']").click()
    print("zora note on n64 (False):", "Magic Bean seller" in pg.inner_text("#list"))

    # reload remembers version and tab via hash
    pg.locator("#vtabs .vtab[data-ver='sw2']").click()
    pg.reload()
    pg.wait_for_selector(".row")
    print("after reload ver:", pg.locator("#vtabs .vtab[aria-selected=true]").inner_text(), "| hash:", pg.evaluate("location.hash"))
    pg.goto(URL + "#hearts/3ds")
    pg.wait_for_selector(".row")
    print("hash #hearts/3ds ->", pg.locator("#vtabs .vtab[aria-selected=true]").inner_text(), pg.locator("#tab-heart").get_attribute("aria-selected"))
    # persisted checks: sw2 HP-6 ticked in LS
    ls = pg.evaluate("JSON.parse(localStorage.getItem('oot-tracker-v1'))")
    print("LS keys sample:", sorted(ls["got"])[:8], "ver:", ls["ver"])

    # ---- mobile screenshots ----
    pg.goto(URL + "#sidequests/sw2")
    pg.wait_for_selector(".row")
    pg.screenshot(path="shot_ver_sw2_side.png")
    pg.locator("#vpanel summary").click()
    pg.screenshot(path="shot_ver_sw2_side_open.png")
    ctx.close()

    # ---------- dark desktop ----------
    ctx = b.new_context(viewport={"width": 1100, "height": 900}, color_scheme="dark")
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL + "#hearts/sw2")
    pg.wait_for_selector(".row")
    pg.screenshot(path="shot_ver_desktop_dark.png")
    ctx.close()

    # ---------- with mock db: legacy v1 doc ----------
    ctx = b.new_context(viewport={"width": 390, "height": 844})
    ctx.add_init_script("window.__preload = {'data/users/u_test/oot_tracker': {v:1, got:['DT-1','KF-1','HP-3','SQ-5']}};" + MOCK.replace("var store = window.__store = {};", "var store = window.__store = window.__preload || {};"))
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL + "#skulltulas")
    pg.wait_for_selector(".row")
    pg.wait_for_timeout(500)
    print("DB legacy banner:", pg.inner_text("#legacy").split("\n")[0], "| sync:", pg.inner_text("#sync"))
    pg.locator("#legacy button[data-claim='sw2']").click()
    pg.wait_for_timeout(900)
    print("DB after claim sw2:", pg.evaluate("window.__store['data/users/u_test/oot_tracker']"))
    print("DB sync:", pg.inner_text("#sync"), "| tabs:", tabtxt(pg, "skull"), "|", tabtxt(pg, "heart"), "|", tabtxt(pg, "side"))
    pg.locator("#vtabs .vtab[data-ver='3ds']").click()
    pg.wait_for_timeout(700)
    print("DB after switching to 3ds ver field:", pg.evaluate("window.__store['data/users/u_test/oot_tracker'].ver"))
    pg.reload()
    pg.wait_for_selector(".row")
    pg.wait_for_timeout(500)
    print("DB reload keeps ver:", pg.locator("#vtabs .vtab[aria-selected=true]").inner_text(), "| legacy visible:", pg.locator("#legacy").is_visible())
    pg.locator("#vtabs .vtab[data-ver='sw2']").click()
    print("DB sw2 tabs after reload:", tabtxt(pg, "skull"), "|", tabtxt(pg, "heart"), "|", tabtxt(pg, "side"))
    ctx.close()
    b.close()

print("errors:", errs)
