import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
from playwright.sync_api import sync_playwright
js = open(_env.PROJ + "/theme2.js").read()
html = "<html><body style='margin:0;background:#cfd6dd;font:12px sans-serif'><div id=o style='display:grid;grid-template-columns:repeat(10,96px);gap:8px;padding:8px'></div><style>.twk{animation:none}</style><script>" + js + """
var ks=['main','skull','heart','side','items'], vs=['n64','3ds','sw2'], o=document.getElementById('o');
vs.forEach(function(v){ [0,1].forEach(function(ad){ ks.forEach(function(k){ var d=document.createElement('div'); d.style.cssText='width:96px;height:96px;background:'+(v==='sw2'?'#e5e5ea':v==='3ds'?'#eef2f6':'#efe5c2')+';display:grid;place-items:center'; d.innerHTML='<div style="width:88px;height:88px">'+OOTTheme.icon(k,v,ad)+'</div>'; d.firstChild.firstChild.style.cssText='width:100%;height:100%'; o.appendChild(d); }); }); });
</script></body></html>"""
open(_env.TMP + "/icons.html","w").write(html)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 1040, "height": 340}, device_scale_factor=2)
    errs=[]
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file:///tmp/icons.html"); pg.wait_for_timeout(300)
    pg.screenshot(path="icons_sheet.png"); print(errs)
    b.close()
