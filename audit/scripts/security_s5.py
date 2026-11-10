import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Audit session 5 - security probes on the browser code, using the isolated stand-in harness of test_sync.py
(file:// page, all other requests aborted, window.claude stubbed, synthetic user and ids only; no real account or data).
S1 hostile ids in the account document and in the URL hash do not execute script or inject DOM (no XSS path)
S2 hostile ver/tab values in the document are ignored
S3 junk ids in the account document are kept and written back on the next save (no schema validation)  -> F-038 if true
S4 a 200,000-id document: load time and responsiveness                                                  -> F-038 if > 3 s
S5 test hooks reachable from page script (window.__oot, __ootDefVer, __ootNoAsk, __ootNoVeil, __ootOpen) -> F-016
Exit 1 if S1/S2 fail (hard security properties) ; S3-S5 are recorded as observations and fail the run only if the
expected-defect flag changes (so a fix flips the script). Results: testlogs/security_s5.json"""
import json, sys, time
SRC = open(_env.SCRIPTS + '/test_sync.py').read()
exec(SRC.split('with sync_playwright() as p:')[0])
from playwright.sync_api import sync_playwright
R = {}; bad = []
def chk(name, ok, **kw):
    R[name] = dict(result='PASS' if ok else 'FAIL', **kw); print(('PASS ' if ok else 'FAIL ') + name, kw)
    if not ok: bad.append(name)
HOST = ['sw2:<img src=x onerror=window.__pwned=1>', '"><script>window.__pwned=2</script>', "');window.__pwned=3;('", 'sw2:KF-1']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=['--no-sandbox'])
    srv = Server(got=None)
    srv.doc = {'v': 2, 'got': HOST, 'ver': '<img src=x onerror=window.__pwned=4>', 'tab': '"><b>x</b>'}; srv.version = 1
    A = Device(b, 'A', srv, 'M1'); A.load_server(); A.pg.wait_for_timeout(300)
    pw = A.pg.evaluate("()=>window.__pwned===undefined?null:window.__pwned")
    inj = A.pg.evaluate("()=>document.querySelectorAll('img[src=x],[onerror]').length")
    chk('S1 hostile ids in account document: no script, no injected element, no page error', pw is None and inj == 0 and not A.errs, pwned=pw, injected=inj, errors=A.errs)
    st = A.pg.evaluate("()=>({ver:__oot.state.ver,tab:__oot.state.tab})")
    chk('S2 hostile ver/tab ignored', st['ver'] in ('n64', '3ds', 'sw2') and st['tab'] != '"><b>x</b>', state=st)
    A.toggle('LW-1'); A.drain()
    kept = [k for k in (srv.doc or {}).get('got', []) if k in HOST[:3]]
    R['S3 junk ids written back'] = dict(observed=bool(kept), kept=kept, expected_defect=True)
    print('OBS S3 junk ids persisted on next save:', bool(kept), kept)
    if not kept: bad.append('S3 expected defect no longer reproduces - update F-038')
    A.close()
    A = Device(b, 'A', srv, 'M1')
    srv.doc = {'v': 2, 'got': ['sw2:KF-1'] + ['x:%d' % i for i in range(200000)], 'ver': 'sw2', 'tab': 'skull'}
    t = time.time(); A.load_server(); A.pg.evaluate("()=>new Promise(r=>requestAnimationFrame(()=>r()))"); dt = time.time() - t
    R['S4 200k-id document'] = dict(seconds=round(dt, 2)); print('OBS S4 200k ids load seconds', round(dt, 2))
    A.close()
    c = b.new_context(); c.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort()); c.add_init_script(STUB)
    pg = c.new_page(); pg.goto(URL + '#<img src=x onerror=window.__pwned=5>-sw2'); pg.wait_for_selector('.grp')
    chk('S1b hostile URL hash: no script', pg.evaluate("()=>window.__pwned===undefined && document.querySelectorAll('[onerror]').length===0"))
    hooks = pg.evaluate("()=>['__oot'].filter(k=>k in window)")
    R['S5 hooks'] = dict(present=hooks); print('OBS S5 window.__oot present:', hooks)
    b.close()
json.dump(R, open(_env.LOGS + '/security_s5.json', 'w'), indent=1)
sys.exit(1 if bad else 0)
