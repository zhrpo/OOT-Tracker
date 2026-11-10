import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import pwpatch
import sys, os
from playwright.sync_api import sync_playwright
# usage: shot_th3.py ver scheme W H tab out [open=0,2] [scroll=px] [full=1]
ver, scheme, W, H, tab, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5], sys.argv[6]
opts = dict(a.split("=", 1) for a in sys.argv[7:])
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    pg = b.new_context(viewport={"width": W, "height": H}, color_scheme=scheme, device_scale_factor=1).new_page()
    pg.on("pageerror", lambda e: print("PAGEERR", e))
    pg.goto(_env.OUT_URL + "/themed2.html#%s/%s" % (tab, ver)); pg.wait_for_selector(".grp")
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_selector(".grp")
    pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important}")
    for i in [x for x in opts.get("open", "").split(",") if x != ""]:
        pg.click('button.gh[data-gi="%s"]' % i)
    if "scroll" in opts:
        pg.evaluate("window.scrollTo(0,%s)" % opts["scroll"])
    pg.wait_for_timeout(400)
    pg.screenshot(path=out, full_page=opts.get("full") == "1")
    b.close()
print(out)
