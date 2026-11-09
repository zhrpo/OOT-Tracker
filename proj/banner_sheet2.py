from playwright.sync_api import sync_playwright
js = open("/home/claude/build/theme2.js").read()
css = open("/home/claude/build/theme2.css").read()
import sys
areas = sys.argv[1].split("|") if len(sys.argv)>1 else ["Kokiri Forest"]
html = "<html><head><style>" + css + "body{margin:0;padding:8px;background:#ddd;font:12px sans-serif}.r{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px}.banner{height:100px;margin:0}</style></head><body><div id=o></div><script>" + js + """
var A=%s, vs=['n64','3ds','sw2'], o=document.getElementById('o');
A.forEach(function(a){ var r=document.createElement('div'); r.className='r'; vs.forEach(function(v){ var d=document.createElement('div'); d.innerHTML=OOTTheme.banner(a,v); r.appendChild(d.firstChild); }); o.appendChild(r); });
</script></body></html>""" % str(areas)
open("/tmp/banners.html","w").write(html)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 1380, "height": 900}, device_scale_factor=1)
    errs=[]
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file:///tmp/banners.html"); pg.wait_for_timeout(int(sys.argv[2]) if len(sys.argv)>2 else 500)
    pg.screenshot(path="/tmp/bsheet.png", full_page=True); print(errs)
    b.close()
