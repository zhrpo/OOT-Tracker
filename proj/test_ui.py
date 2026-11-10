import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import pwpatch
from playwright.sync_api import sync_playwright
URL = _env.OUT_URL + "/" + __import__("os").environ.get("F", "themed2.html") + ""
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
    pg.goto(URL + "#skulltulas/sw2")
    pg.wait_for_selector(".row")
    pg.locator("#legacy button[data-claim='sw2']").click()
    print("header height:", pg.evaluate("document.querySelector('.top').offsetHeight"), "--hh:", pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--hh')"))
    print("h-overflow:", pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"))
    print("first row top (css px):", pg.evaluate("document.querySelector('.row').getBoundingClientRect().top"))
    print("stat:", pg.inner_text(".stat").replace("\n", " | "))
    pg.screenshot(path="ui1_top.png")
    # open the panel
    pg.locator("#vpanel summary").click()
    pg.screenshot(path="ui2_panel.png")
    pg.locator("#vpanel summary").click()
    # jump via FAB select
    opts = pg.locator("#jump option").all_inner_texts()
    print("jump options:", len(opts), opts[:4])
    pg.select_option("#jump", label=[o for o in opts if o.startswith("Lake Hylia")][0])
    pg.wait_for_timeout(900)
    print("scrollY after jump:", pg.evaluate("window.scrollY"), "| LH heading top:", pg.evaluate("document.querySelector('#g' + [...document.querySelectorAll('.gname')].findIndex(e=>e.textContent==='Lake Hylia') + ' h2').getBoundingClientRect().top"))
    pg.screenshot(path="ui3_jump.png")
    # scroll a bit more; sticky heading
    pg.evaluate("window.scrollBy(0, 330)")
    pg.wait_for_timeout(200)
    print("sticky h2 top:", pg.evaluate("[...document.querySelectorAll('.grp h2')].map(h=>Math.round(h.getBoundingClientRect().top)).filter(t=>t>=90&&t<=140)"))
    pg.screenshot(path="ui4_sticky.png")
    # tick a row and check count + jump label
    pg.locator("input[data-id='LH-1']").check()
    print("jump label LH:", [o for o in pg.locator("#jump option").all_inner_texts() if "Lake Hylia" in o])
    # filters: remaining + child, then persistence
    pg.locator("#seg-status button[data-v='todo']").click()
    pg.locator("#seg-age button[data-v='child']").click()
    print("stat filtered:", pg.inner_text(".stat").replace("\n", " | "))
    pg.reload()
    pg.wait_for_selector(".row")
    print("after reload pressed:", pg.locator("#seg-status button[aria-pressed=true]").inner_text(), "/", pg.locator("#seg-age button[aria-pressed=true]").inner_text(), "| rows:", pg.locator(".row").count())
    pg.screenshot(path="ui5_filtered.png")
    # collapse all
    pg.locator("#collapse").click()
    print("collapsed rows:", pg.locator(".row").count(), "| button:", pg.inner_text("#collapse"), "| page h:", pg.evaluate("document.body.scrollHeight"))
    pg.screenshot(path="ui6_collapsed.png")
    # expand one
    pg.locator("button.gh").nth(3).click()
    print("rows after expanding one:", pg.locator(".row").count())
    pg.locator("#collapse").click()
    print("button now:", pg.inner_text("#collapse"), "| rows:", pg.locator(".row").count() if False else "")
    # reset filters
    pg.locator("#seg-status button[data-v='all']").click()
    pg.locator("#seg-age button[data-v='all']").click()
    # side tab quick screenshot
    pg.locator("#tab-side").click()
    pg.wait_for_selector(".row")
    pg.screenshot(path="ui7_side.png")
    print("tabinfo side:", pg.inner_text("#tabinfo"))
    pg.locator("#tab-heart").click()
    pg.wait_for_selector(".row")
    pg.evaluate("window.scrollTo(0, 600)")
    pg.screenshot(path="ui8_heart.png")
    # persisted tab
    pg.goto(URL)
    pg.wait_for_selector(".row")
    print("reopened without hash -> tab:", pg.locator(".tab[aria-selected=true]").inner_text().split("\n")[0])
    # search ignores collapse
    pg.locator("#q").fill("tree")
    pg.wait_for_timeout(300)
    print("search rows:", pg.locator(".row").count())
    ctx.close()
    # desktop
    ctx = b.new_context(viewport={"width": 1100, "height": 900})
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL + "#skulltulas/sw2")
    pg.wait_for_selector(".row")
    pg.screenshot(path="ui9_desktop.png")
    ctx.close()
    ctx = b.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark", device_scale_factor=2)
    pg = ctx.new_page()
    pg.goto(URL + "#hearts/sw2")
    pg.wait_for_selector(".row")
    pg.evaluate("window.scrollTo(0, 500)")
    pg.screenshot(path="ui10_dark.png")
    ctx.close()
    b.close()
print("errors:", errs)
