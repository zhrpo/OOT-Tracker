import sys
from playwright.sync_api import sync_playwright
ver, scheme, W = sys.argv[1], sys.argv[2], int(sys.argv[3])
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    pg = b.new_context(viewport={"width": W, "height": 900}, color_scheme=scheme, device_scale_factor=2).new_page()
    pg.goto("file:///home/claude/audit/out/themed2.html#skulltulas/" + ver); pg.wait_for_selector(".grp")
    pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important}")
    pg.click('button.gh[data-gi="1"]'); pg.wait_for_timeout(300)
    box = pg.evaluate("(()=>{const a=document.querySelector('#g0').getBoundingClientRect(), b=document.querySelector('#g2').getBoundingClientRect(); return [a.left-8,a.top-8,a.width+16,b.bottom-a.top+16]})()")
    pg.screenshot(path=sys.argv[4], clip={"x": box[0], "y": box[1], "width": box[2], "height": box[3]})
    b.close()
