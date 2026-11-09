import sys
from playwright.sync_api import sync_playwright
keys = None
start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
count = int(sys.argv[2]) if len(sys.argv) > 2 else 8
out = sys.argv[3] if len(sys.argv) > 3 else "contact.png"
js = open("/home/claude/build/theme.js", encoding="utf-8").read()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    pg = b.new_context(viewport={"width": 1800, "height": 900}).new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.set_content("<html><body style='margin:0;background:#222;color:#ddd;font:12px sans-serif'></body></html>")
    pg.add_script_tag(content=js)
    html = pg.evaluate("""([start,count]) => {
      const keys = Object.keys(OOTTheme.areas).slice(start, start+count);
      let h = '<style>.r{display:flex;gap:4px;margin:0 0 4px}.c{width:596px;position:relative;height:84px;overflow:hidden}.c svg{width:100%;height:100%;display:block}.c b{position:absolute;left:4px;top:2px;color:#fff;text-shadow:0 0 3px #000}</style>';
      let seq = 0;
      keys.forEach(k => { h += '<div class="r">'; ['n64','3ds','sw2'].forEach(v => { h += '<div class="c"><b>'+k+' '+v+'</b>' + OOTTheme.svgFor(k,v).replace(/§/g,'x'+(seq++)+'_') + '</div>'; }); h += '</div>'; });
      document.body.innerHTML = h; return keys.length;
    }""", [start, count])
    pg.wait_for_timeout(300)
    pg.screenshot(path=out, full_page=True)
    print("rendered", html, "errors", errs)
    b.close()
