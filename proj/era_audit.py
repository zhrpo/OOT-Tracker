import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import json, sys
from playwright.sync_api import sync_playwright
F = _env.OUT_URL + "/themed2.html"
JS = r"""
(ver) => {
  const O = window.__oot;
  O.state.ver = ver;
  const m = O.rowMap();
  const out = [];
  const adultOnly = id => { const r = m[id]; return r && r.age === 'Adult'; };
  const childOnly = id => { const r = m[id]; return r && r.age === 'Child'; };
  Object.keys(m).forEach(id => {
    const r = m[id];
    if (!r.q || !r.q.length) return;
    if (/^MQ-/.test(id)) return;
    const need = [];   // clauses that can only be met by adult-obtained leaves
    const needChild = [];
    r.q.forEach(c => {
      // every option in the clause has at least one leaf only an adult can get
      const optAdult = c.map(o => o.filter(adultOnly));
      if (c.length && optAdult.every(a => a.length)) need.push(c.map(o => o.filter(adultOnly).map(x => x + ' ' + (m[x] && m[x].name || '')).join(' + ')).join(' | '));
      const optChild = c.map(o => o.filter(childOnly));
      if (c.length && optChild.every(a => a.length)) needChild.push(c.map(o => o.filter(childOnly).map(x => x + ' ' + (m[x] && m[x].name || '')).join(' + ')).join(' | '));
    });
    out.push({ id, age: r.age, name: (r.name || r.title || '').slice(0, 50), adultNeeds: need, childNeeds: needChild, ages: !!r.ages });
  });
  return out;
}
"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    pg = b.new_context(viewport={"width": 1000, "height": 800}).new_page()
    pg.goto(F + "#skulltulas/sw2"); pg.wait_for_selector(".row")
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_selector(".row")
    for ver in (sys.argv[1:] or ["sw2"]):
        res = pg.evaluate(JS, ver)
        print("=====", ver, len(res), "rows with requirements")
        print("-- rows by age that need ADULT-obtained things")
        for x in res:
            if x["adultNeeds"] and x["age"] != "Adult":
                print("%-7s %-6s %-48s ages=%s | %s" % (x["id"], x["age"], x["name"], x["ages"], " ; ".join(x["adultNeeds"])))
        print("-- rows by age that need CHILD-obtained things but are Adult")
        for x in res:
            if x["childNeeds"] and x["age"] == "Adult":
                print("%-7s %-6s %-48s ages=%s | %s" % (x["id"], x["age"], x["name"], x["ages"], " ; ".join(x["childNeeds"])))
    b.close()
