# Audit (session 1): clean-context load of the built page; records non-local requests, console errors, page errors.
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    for v in ('n64','3ds','sw2'):
        ctx=b.new_context(); pg=ctx.new_page(); reqs=[]; errs=[]; warns=[]
        pg.on("request", lambda r: reqs.append(r.url[:90]) if not r.url.startswith(("file:","data:","blob:")) else None)
        pg.on("console", lambda m: (errs if m.type=="error" else warns).append(m.text[:120]) if m.type in ("error","warning") else None)
        pg.on("pageerror", lambda e: errs.append("PAGEERROR "+str(e)[:120]))
        pg.goto("file:///home/claude/audit/out/themed2.html#main-"+v); pg.wait_for_selector(".grp"); pg.wait_for_timeout(1500)
        print(v, "external requests:", reqs, "| errors:", errs, "| warnings:", warns[:3])
        ctx.close()
    b.close()
