import json
from playwright.sync_api import sync_playwright
mapped = json.load(open("/tmp/mapped.json"))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 390, "height": 844})
    pg.goto("file:///home/claude/audit/out/themed2.html")
    pg.evaluate("(g)=>localStorage.setItem('oot-tracker-v1', JSON.stringify({got:g, ver:'sw2'}))", mapped)
    pg.reload(); pg.wait_for_selector(".row")
    start = set(pg.evaluate("__oot.got()"))
    ids = sorted({k.split(":")[1] for k in mapped})
    log = []
    for i in ids:
        log += pg.evaluate("(i)=>__oot.tick(i)", i)
    end = set(pg.evaluate("__oot.got()"))
    names = pg.evaluate("Object.fromEntries(Object.entries(__oot.rowMap()).map(([k,r])=>[k,r.name||r.short||r.where]))")
    print("mapped", len(mapped), "after load", len(start), "after closure", len(end))
    for k in sorted(end - set(mapped)):
        i = k.split(":")[1]
        print("  +", i, "|", (names.get(i) or "")[:60])
    print("inferred:", pg.evaluate("__oot.inferSteps()"))
    json.dump(sorted(end), open("/tmp/mig.json", "w"))
    b.close()
