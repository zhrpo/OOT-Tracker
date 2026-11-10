import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Audit session 4 — two sync branches session 3 did not exercise. Same isolated stand-in harness as test_sync.py
(its classes are loaded from that file; nothing is changed there): file:// page, every other request aborted,
window.claude stubbed, synthetic user u_synthetic_1, synthetic ids only. Both delivery models M1/M2.

H1  The account has no document yet (first sign-in / first use on this account) but this device already holds progress
    in local storage. Expected: the device's progress reaches the account, and the status only says "Saved to your
    account" once it has. Code: initRemote() first-snapshot branch, app.js L1183-1194 (snap.exists false -> nothing sent).
H1b Same start, then a second device saves first and its document reaches A.
H2  A brand-new player (no local save, no document) ticks one row. Expected: the account holds only that tick.
    Code: app.js L136 seeds D.defaults (unprefixed ids, F-012); flush() sends Array.from(got) (L1145).
Exit 1 on any failure. Results: testlogs/sync_s4_results.json"""
import json, sys
SRC = open(_env.SCRIPTS + '/test_sync.py').read()
exec(SRC.split('with sync_playwright() as p:')[0])          # STUB, Server, Device, record, RESULTS, PATH, URL
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=['--no-sandbox'])
    for model in ('M1', 'M2'):
        # ---------------- H1 ----------------
        local = {'got': ['sw2:KF-1', 'sw2:KF-2'], 'ver': 'sw2'}
        srv = Server(got=None)                                   # no document on the account
        A = Device(b, 'A', srv, model, seed_local=local)
        A.load_server()                                          # first snapshot: exists = false, fromCache = false
        sent = A.drain()
        st = A.status()
        B = Device(b, 'B', srv, model)                           # second device on the same account
        B.load_server(); B.drain(); B.load_server()
        record('H1 no account document yet, device already has progress', model, 'server: no document; A local: KF-1, KF-2',
               ['A opens', 'first snapshot: document missing', 'B opens on the same account'],
               ['KF-1', 'KF-2'], [], srv, [A, B],
               notes='saves sent by A after the first snapshot: %d; A status: %r; server document exists: %s' % (sent, st, srv.doc is not None))
        RESULTS[-1]['status_after_first_snapshot'] = st
        RESULTS[-1]['saves_sent'] = sent
        if st == 'Saved to your account' and srv.doc is None:
            RESULTS[-1]['status_claims_saved_with_no_document'] = True
        A.close(); B.close()

        # ---------------- H1b: same start, but the other device saves first ----------------
        srv = Server(got=None)
        A = Device(b, 'A', srv, model, seed_local=local)
        A.load_server(); A.drain()
        B = Device(b, 'B', srv, model)
        B.load_server(); B.drain()
        B.toggle('LW-1'); B.drain()                              # B creates the document first
        A.load_server(); A.drain(); B.load_server()              # B's document reaches A (A is not dirty)
        record('H1b no account document, device has progress, other device saves first', model,
               'server: no document; A local: KF-1, KF-2', ['A opens (nothing sent)', 'B ticks LW-1 (creates document)', 'snapshot reaches A'],
               ['KF-1', 'KF-2', 'LW-1'], [], srv, [A, B], notes='A local storage after: %s' % A.local())
        A.close(); B.close()

        # ---------------- H2 ----------------
        srv = Server(got=None)
        A = Device(b, 'A', srv, model)
        A.load_server(); A.drain()
        A.toggle('LW-1'); A.drain()
        keys = sorted((srv.doc or {}).get('got', []))
        bare = [k for k in keys if ':' not in k]
        ok = keys == ['sw2:LW-1']
        RESULTS.append(dict(scenario='H2 new player: account receives only what was ticked', model=model, server_keys=keys,
                            unprefixed_on_server=bare, legacy_banner_visible=A.pg.evaluate("()=>!document.getElementById('legacy').classList.contains('hidden')"),
                            result='PASS' if ok else 'FAIL'))
        print(('PASS ' if ok else 'FAIL ') + '[%s] H2 new player: account receives only what was ticked  server=%s' % (model, keys))
        A.close()
    b.close()

json.dump(RESULTS, open(_env.LOGS + '/sync_s4_results.json', 'w'), indent=1)
F = [r for r in RESULTS if r['result'] == 'FAIL']
print('\n%d scenarios, %d passed, %d failed' % (len(RESULTS), len(RESULTS) - len(F), len(F)))
sys.exit(1 if F else 0)
