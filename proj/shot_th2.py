import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import sys
from playwright.sync_api import sync_playwright
ver = sys.argv[1]; scheme = sys.argv[2]; W = int(sys.argv[3]); H = int(sys.argv[4]); tab = sys.argv[5] if len(sys.argv) > 5 else "skulltulas"
out = sys.argv[6] if len(sys.argv) > 6 else _env.TMP + "/th_%s_%s_%d.png" % (ver, scheme, W)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    pg = b.new_context(viewport={"width": W, "height": H}, color_scheme=scheme, device_scale_factor=1).new_page()
    pg.goto(_env.OUT_URL + "/themed2.html#%s/%s" % (tab, ver)); pg.wait_for_selector(".row")
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_selector(".row")
    pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important}")
    pg.wait_for_timeout(500)
    pg.screenshot(path=out)
    b.close()
print(out)
