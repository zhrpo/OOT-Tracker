# Consistency checks across all three games: tool chips vs age vs text.
import os, json
from playwright.sync_api import sync_playwright
URL = "file:///home/claude/audit/out/" + os.environ.get("F", "index.html")
JS = """
(ver) => {
  __oot.state.ver = ver;
  const M = __oot.rowMap(), out = [];
  const lab = (x) => (M[x] && M[x].name) || x;
  for (const id of Object.keys(M)) {
    const r = M[id];
    if (!/^(KF|LW|SFM|HF|LLR|MKT|HC|GAN|KAK|GY|DMT|GC|DMC|ZR|ZD|ZF|LH|GV|GF|HW|CL|DT|DC|JB|FT|FIRE|WT|ST|SP|BW|IC|HP|SQ)-/.test(id)) continue;
    const q = __oot.reqOf(r);
    const leaves = new Set();
    q.forEach(c => c.forEach(o => o.forEach(x => leaves.add(x))));
    const names = [...leaves].map(lab);
    const txt = ((r.how || '') + ' ' + (r.where || '') + ' ' + (r.guide || []).join(' ') + ' ' + (r.start || '')).replace(/\\s+/g, ' ');
    out.push({ id, age: r.age, ages: r.ages || '', how: r.how || '', names, txt });
  }
  return out;
}
"""
fails = []
def bad(v, id, msg):
    fails.append((v, id, msg)); print("FAIL", v, id, msg)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    pg = b.new_page()
    pg.goto(URL); pg.wait_for_selector(".row")
    for v in ("n64", "3ds", "sw2"):
        rows = pg.evaluate(JS, v)
        for r in rows:
            n = " | ".join(r["names"])
            hook = ("Hookshot" in n) or ("Longshot" in n)
            if r["age"] == "Child" and hook:
                bad(v, r["id"], "Child row lists Hookshot/Longshot: " + n)
            if r["age"] == "Adult" and "Boomerang" in n:
                bad(v, r["id"], "Adult row lists Boomerang: " + n)
            how = r["how"]
            if r["age"] == "Child" and ("Hookshot" in how or "Longshot" in how) and "adult" not in how.lower():
                bad(v, r["id"], "Child row text mentions Hookshot/Longshot: " + how[:90])
            if r["age"] == "Adult" and "Boomerang" in how:
                bad(v, r["id"], "Adult row text mentions Boomerang: " + how[:90])
            if r["age"] in ("Child", "Either") and "Boomerang" in how and "Boomerang" not in n and "N64" not in how and "Cucco" not in how and "Hover" not in how:
                bad(v, r["id"], "text uses Boomerang but no Boomerang requirement: " + how[:90])
            if r["age"] == "Both" and not r["ages"]:
                bad(v, r["id"], "Both without ages hint")
            if "Slingshot" in how and "Fairy Slingshot" not in n and r["id"][:3] != "SQ-" and "KF-1" != r["id"]:
                bad(v, r["id"], "text uses Slingshot but no Slingshot requirement: " + how[:90])
        print(v, "rows checked", len(rows))
    b.close()
print("FAILS:", len(fails))
