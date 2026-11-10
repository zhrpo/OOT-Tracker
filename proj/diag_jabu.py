import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import json
from playwright.sync_api import sync_playwright
got = json.loads(open(_env.TMP + "/got.json").read())
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 390, "height": 844})
    pg.goto(_env.OUT_URL + "/themed2.html#items/sw2"); pg.wait_for_selector(".row")
    pg.evaluate("(g) => { localStorage.setItem('oot-tracker-v1', JSON.stringify({got: g, ver: 'sw2'})); }", got)
    pg.reload(); pg.wait_for_selector(".row")
    r = pg.evaluate("""() => {
      const O = window.__oot, rm = O.rowMap(), out = [], need = {};
      const got = new Set(O.got());
      const stepIds = Object.keys(rm).filter(k => k.startsWith('MQ-'));
      Object.keys(rm).forEach(id => {
        if (id.startsWith('MQ-')) return;
        if (!got.has('sw2:' + id) && !got.has(id)) return;
        const row = rm[id]; const why = [];
        const gv = O.GIVER[id]; if (gv) why.push('given by ' + gv);
        O.reqOf(row).forEach(c => { if (c.length !== 1) return; c[0].forEach(x => { if (x.indexOf('MQ-') === 0) why.push('needs ' + x); else if (O.GIVER[x]) why.push('needs ' + x + ' (given by ' + O.GIVER[x] + ')'); }); });
        if (why.length) out.push([id, row.name || row.where || '', why]);
      });
      return {inferred: O.inferSteps(), out: out, steps: stepIds.map(s => [s, rm[s].name || rm[s].short])};
    }""")
    print("inferred:", r["inferred"])
    for o in r["out"]:
        if any(("MQ-1" in w and not any(("MQ-%d" % i) in w and True for i in range(1,0))) for w in o[2]): pass
        print(o[0], "|", o[1][:50], "|", o[2])
    print([s for s in r["steps"]][:45])
    b.close()
