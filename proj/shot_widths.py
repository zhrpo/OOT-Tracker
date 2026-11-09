import sys
from playwright.sync_api import sync_playwright
from PIL import Image
V = sys.argv[1]; widths = [int(x) for x in sys.argv[2].split(",")]
imgs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for W in widths:
        pg = b.new_context(viewport={"width": W, "height": 700}).new_page()
        pg.goto("file:///home/claude/audit/out/themed2.html#skulltulas/%s" % V); pg.wait_for_selector(".row")
        pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_selector(".row")
        pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important}")
        pg.wait_for_timeout(250)
        h = pg.evaluate("document.querySelector('.top').getBoundingClientRect().bottom") + 6
        pg.screenshot(path="/tmp/w%d.png" % W, clip={"x": 0, "y": 0, "width": W, "height": int(h)})
        imgs.append(Image.open("/tmp/w%d.png" % W))
    b.close()
H = sum(i.height for i in imgs) + 10 * len(imgs); Wm = max(i.width for i in imgs)
out = Image.new("RGB", (Wm, H), (120, 120, 120)); y = 0
for i in imgs: out.paste(i, (0, y)); y += i.height + 10
out.save("/tmp/widths_%s.png" % V); print(out.size)
