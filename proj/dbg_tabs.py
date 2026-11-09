import sys, os
from playwright.sync_api import sync_playwright
W = int(sys.argv[1]); V = sys.argv[2]; T = sys.argv[3] if len(sys.argv) > 3 else "skulltulas"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    pg = b.new_context(viewport={"width": W, "height": 900}).new_page()
    pg.goto("file:///home/claude/audit/out/themed2.html#%s/%s" % (T, V)); pg.wait_for_selector(".row")
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_selector(".row")
    pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important}")
    pg.wait_for_timeout(300)
    print(pg.evaluate("""() => { const t=document.querySelector('.tabs'); const o=[['tabs',t.getBoundingClientRect().width|0, getComputedStyle(t).gap]]; document.querySelectorAll('.tab').forEach(e=>{const r=e.getBoundingClientRect(); const tn=e.querySelector('.tn'); const tr=tn?tn.getBoundingClientRect():null; o.push([e.id, r.width|0, e.getAttribute('aria-selected'), tn?[getComputedStyle(tn).display, tr.width|0]:null, getComputedStyle(e).flexGrow, getComputedStyle(e).minWidth]);}); return JSON.stringify(o);}"""))
    pg.screenshot(path="/tmp/dbg_%d_%s.png" % (W, V), clip={"x": 0, "y": 0, "width": W, "height": 220})
    b.close()
