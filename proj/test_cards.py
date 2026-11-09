# contrast of the white title and count on the area art (worst case = the lightest pixel behind the text, shadows ignored)
import io, os
from playwright.sync_api import sync_playwright
from PIL import Image
URL = "file:///home/claude/audit/out/" + os.environ.get("F", "themed2.html")
def lum(c):
    r = []
    for v in c[:3]:
        v /= 255
        r.append(v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4)
    return .2126 * r[0] + .7152 * r[1] + .0722 * r[2]
fails = []; worst = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for ver in ("n64", "3ds", "sw2"):
        pg = b.new_context(viewport={"width": 390, "height": 900}, color_scheme="light", device_scale_factor=1).new_page()
        for tab in ("mainquest", "skulltulas", "hearts", "sidequests", "items"):
            pg.goto(URL + "#%s/%s" % (tab, ver)); pg.wait_for_selector(".grp")
            pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important}.gh .gname,.gh .cnt{color:transparent!important;text-shadow:none!important}.gh .cnt::before{color:transparent!important}.gh .chev::before{border-color:transparent!important}.top,.fab,.toast{visibility:hidden!important}")
            pg.evaluate("document.querySelectorAll('.grp:not(.coll) .gh').forEach(b=>b.click())")  # shut anything open
            n = pg.locator(".gh").count()
            for i in range(n):
                for sel, minr in ((".gname", 4.5), (".cnt", 4.5)):
                    el = pg.locator(".gh").nth(i).locator(sel)
                    png = el.screenshot()
                    im = Image.open(io.BytesIO(png)).convert("RGB")
                    mx = max(lum(px) for px in im.get_flattened_data())
                    ratio = 1.05 / (mx + .05)
                    key = (ver, tab, sel)
                    if key not in worst or ratio < worst[key][0]:
                        worst[key] = (round(ratio, 2), pg.locator(".gh").nth(i).locator(".gname").inner_text())
                    if ratio < minr: fails.append((ver, tab, sel, round(ratio, 2), pg.locator(".gh").nth(i).locator(".gname").inner_text()))
        pg.context.close()
    b.close()
print("lowest ratio per kind:", sorted((v[0], k, v[1]) for k, v in worst.items())[:6])
print("BELOW 4.5:", len(fails), fails[:8])
