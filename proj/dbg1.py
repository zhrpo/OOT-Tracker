import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    pg = b.new_context(viewport={"width":390,"height":800}).new_page()
    pg.on("console", lambda m: print("CONSOLE", m.type, m.text))
    pg.on("pageerror", lambda e: print("PAGEERR", e))
    pg.goto(_env.OUT_URL + "/themed2.html#skulltulas/sw2")
    pg.wait_for_timeout(800)
    print(pg.evaluate("location.hash"), pg.evaluate("document.querySelector('.tab[aria-selected=true]') && document.querySelector('.tab[aria-selected=true]').id"))
    print(pg.evaluate("document.querySelectorAll('.grp').length"), pg.evaluate("document.querySelectorAll('.grp.coll').length"))
    b.close()
