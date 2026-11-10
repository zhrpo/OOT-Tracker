import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import pwpatch
from playwright.sync_api import sync_playwright

MOCK = """
(function(){
  var store = window.__store = {};   // path -> data
  var subs = {};
  function snap(path, pending){
    var d = store[path];
    return { exists: d !== undefined, data: function(){ return d ? JSON.parse(JSON.stringify(d)) : undefined; },
             metadata: { fromCache: false, hasPendingWrites: !!pending } };
  }
  var db = { doc: function(path){ return {
      onSnapshot: function(next, err){ (subs[path] = subs[path] || []).push(next); setTimeout(function(){ next(snap(path)); }, 50); return function(){}; },
      set: function(data){ return new Promise(function(res){ setTimeout(function(){
          store[path] = JSON.parse(JSON.stringify(data)); window.__writes = (window.__writes||0)+1;
          (subs[path]||[]).forEach(function(n){ n(snap(path, false)); }); res(); }, 80); }); }
  }; } };
  var user = { id: function(){ return Promise.resolve('u_test'); } };
  window.claude = { use: function(n){ return Promise.resolve(n === 'db' ? db : n === 'user' ? user : null); } };
})();
"""

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 390, "height": 844})
    ctx.add_init_script(MOCK)
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(_env.OUT_URL + "/" + __import__("os").environ.get("F", "themed2.html") + "#skulltulas")
    pg.wait_for_selector(".row")
    pg.wait_for_timeout(400)
    print("sync text:", pg.inner_text("#sync"))
    # rapid ticks
    for i in ["KF-1", "KF-2", "LW-1"]:
        pg.locator(f"input[data-id='{i}']").check()
        pg.wait_for_timeout(60)
    pg.locator("input[data-id='DT-1']").uncheck()
    pg.wait_for_timeout(1200)
    print("sync text after ticks:", pg.inner_text("#sync"))
    print("stored:", pg.evaluate("window.__store['data/users/u_test/oot_tracker']"))
    print("writes:", pg.evaluate("window.__writes"))
    print("UI count:", pg.inner_text("#sumtext"))
    # simulate another device writing: remote adds GY-1
    pg.evaluate("""() => { var s = window.__store['data/users/u_test/oot_tracker']; s.got.push('GY-1'); }""")
    # fire remote snapshot via a harmless set from 'other device' is not exposed; reload instead
    pg.reload()
    pg.wait_for_selector(".row")
    pg.wait_for_timeout(500)
    print("after reload GY-1:", pg.locator("input[data-id='GY-1']").is_checked(), "DT-1:", pg.locator("input[data-id='DT-1']").is_checked(), pg.inner_text("#sumtext"))
    print("errors:", errs)
    b.close()
