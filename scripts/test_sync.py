"""Audit session 3 — synchronization scenarios against the app's REAL sync code (initRemote/flush/schedule/normalize,
app.js L1123-1212) with a LOCAL stand-in for the platform database.

Isolation: pages load from file://; every non-file request is aborted; window.claude is a stub defined here, so the
app cannot reach any real database (production or otherwise). The stand-in "server" is a Python dict in this process.
Same-account multi-device = separate browser contexts (separate localStorage), same synthetic user id.

The stand-in gives the test full control of ordering: a page's ref.set() only queues a request; the scenario decides
when it reaches the server, whether it fails, and when snapshots reach each device. Two delivery models are covered:
  M1  writes fail while offline (promise rejects), no local echo
  M2  Firestore-like: a local echo snapshot with hasPendingWrites=true on each set; offline writes stay queued and are
      sent on reconnect (the platform's real behaviour is NOT known; see AUDIT_VERIFICATION.md)
Exit code 1 if any scenario loses or reverts a deliberate change. Results: audit/testlogs/sync_results.json"""
import json, sys
from playwright.sync_api import sync_playwright

URL = 'file:///home/claude/audit/out/themed2.html'
PATH = 'data/users/u_synthetic_1/oot_tracker'
RESULTS = []

STUB = r"""
(() => {
  window.__ootNoAsk = true; window.__ootNoVeil = true; window.__ootOpen = true; window.__ootDefVer = 'sw2';
  const dev = window.__dev = { subs: [], out: [], nid: 0, pend: {}, echo: false, offline: false, log: [] };
  function snap(exists, data, meta){ return { exists, data: () => data ? JSON.parse(JSON.stringify(data)) : undefined, metadata: meta || {} }; }
  const db = { doc(path){ return {
    set(data){
      return new Promise((res, rej) => {
        const id = ++dev.nid, copy = JSON.parse(JSON.stringify(data));
        dev.out.push({ id, path, data: copy }); dev.pend[id] = { res, rej }; dev.log.push(['set', id, copy.got.length]);
        if (dev.echo) dev.subs.forEach(s => s.path === path && s.cb(snap(true, copy, { hasPendingWrites: true, fromCache: true })));
      });
    },
    onSnapshot(cb, err){ dev.subs.push({ path, cb, err }); }
  }; } };
  window.claude = { use: async (n) => n === 'db' ? db : n === 'user' ? { id: async () => 'u_synthetic_1' } : null };
  window.__deliver = (path, exists, data, meta) => { dev.log.push(['snap', exists ? data.got.length : -1]);
    dev.subs.forEach(s => s.path === path && s.cb(snap(exists, data, meta || { fromCache: false, hasPendingWrites: false }))); };
  window.__settle = (id, ok) => { const p = dev.pend[id]; if (!p) return; delete dev.pend[id]; ok ? p.res() : p.rej(new Error('stand-in failure')); };
})();
"""

class Server:
    def __init__(self, got=None):
        self.doc = None if got is None else {'v': 2, 'got': sorted('sw2:' + g for g in got), 'ver': 'sw2', 'tab': 'skull'}
        self.version = 0 if got is None else 1
        self.writes = []
    def apply(self, data, who):
        self.doc = data; self.version += 1; self.writes.append((who, sorted(data['got'])))

class Device:
    def __init__(self, browser, name, server, model, seed_local=None):
        self.name, self.server, self.model = name, server, model
        self.ctx = browser.new_context()
        self.ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        self.ctx.add_init_script(STUB)
        if seed_local is not None:
            self.ctx.add_init_script("if(!sessionStorage.getItem('s')){localStorage.setItem('oot-tracker-v1',%s);sessionStorage.setItem('s','1');}" % json.dumps(json.dumps(seed_local)))
        self.errs = []
        self.open()
    def open(self):
        self.pg = self.ctx.new_page()
        self.pg.on('pageerror', lambda e: self.errs.append(str(e)))
        self.pg.goto(URL + '#skulltulas-sw2'); self.pg.wait_for_selector('.grp')
        self.pg.evaluate("()=>{ window.__dev.echo = %s; }" % ('true' if self.model == 'M2' else 'false'))
        self.pg.wait_for_function("()=>window.__dev.subs.length>0", timeout=5000)
    def reload(self):
        self.pg.close(); self.open()
    def load_server(self):
        """deliver the server's current document (first or later snapshot)"""
        d = self.server.doc
        self.pg.evaluate("([p,e,d])=>window.__deliver(p,e,d)", [PATH, d is not None, d])
        self.pg.wait_for_timeout(50)
    def lock_off(self):
        if self.pg.evaluate("()=>__oot.state.lock"): self.pg.click('#lockon')
    def toggle(self, rid):
        """a real UI tick/untick (change handler -> tickOn/tickOff -> finish -> saveLocal + schedule)"""
        self.lock_off()
        self.pg.evaluate("(id)=>__oot.goRow(id)", rid)
        box = self.pg.locator('input[data-id="%s"]' % rid).first
        box.click()
        self.pg.wait_for_timeout(420)   # schedule() debounce is 350 ms
    def pending(self):
        return self.pg.evaluate("()=>window.__dev.out.splice(0)")
    def settle(self, req, ok=True):
        if ok: self.server.apply(req['data'], self.name)
        self.pg.evaluate("([i,o])=>window.__settle(i,o)", [req['id'], ok]); self.pg.wait_for_timeout(60)
    def drain(self, ok=True, rounds=6):
        """settle every request the page sends, including follow-ups flush() issues after a settle"""
        n = 0
        for _ in range(rounds):
            reqs = self.pending()
            if not reqs: break
            for r in reqs: self.settle(r, ok); n += 1
            self.pg.wait_for_timeout(120)
        return n
    def got(self):
        return sorted(x.split(':', 1)[1] for x in self.pg.evaluate("()=>__oot.got()") if x.startswith('sw2:') and '-' in x)
    def local(self):
        raw = self.pg.evaluate("()=>localStorage.getItem('oot-tracker-v1')")
        return sorted(x.split(':', 1)[1] for x in json.loads(raw)['got'] if x.startswith('sw2:')) if raw else None
    def status(self):
        return self.pg.inner_text('#sync')
    def close(self): self.ctx.close()

def server_ids(s):
    return sorted(x.split(':', 1)[1] for x in (s.doc or {}).get('got', []) if x.startswith('sw2:'))

def record(name, model, initial, steps, expect_keep, expect_gone, server, devices, notes=''):
    final = server_ids(server)
    fin_dev = {d.name: d.got() for d in devices}
    lost = [x for x in expect_keep if x not in final]
    revived = [x for x in expect_gone if x in final]
    dev_lost = {n: [x for x in expect_keep if x not in g] for n, g in fin_dev.items()}
    ok = not lost and not revived and not any(dev_lost.values()) and not any(d.errs for d in devices)
    RESULTS.append(dict(scenario=name, model=model, initial=initial, steps=steps, server_writes=server.writes,
                        final_server=final, final_devices=fin_dev, expected_kept=expect_keep, expected_removed=expect_gone,
                        lost_on_server=lost, wrongly_present=revived, lost_on_device=dev_lost, page_errors=[e for d in devices for e in d.errs][:3],
                        status_text={d.name: d.status() for d in devices}, notes=notes, result='PASS' if ok else 'FAIL'))
    print(('PASS ' if ok else 'FAIL ') + '[%s] %s' % (model, name) + ('' if ok else '  lost=%s revived=%s device_lost=%s' % (lost, revived, dev_lost)))

def fresh_pair(b, model, srv):
    A = Device(b, 'A', srv, model); B = Device(b, 'B', srv, model)
    A.load_server(); A.drain(); B.load_server(); B.drain()
    A.load_server(); B.load_server()
    return A, B

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for model in ('M1', 'M2'):
        # ---------------- A. normal synchronization ----------------
        srv = Server(got=[]); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-1')
        A.drain()
        A.load_server(); B.load_server()
        seen_on_B = 'KF-1' in B.got()
        A.toggle('KF-1')   # untick
        A.drain()
        A.load_server(); B.load_server()
        A.reload(); B.reload(); A.load_server(); B.load_server()
        record('A normal: tick on A shows on B, untick propagates, survives reload', model, 'server empty',
               ['A ticks KF-1', 'save ok', 'snapshot to A,B', 'A unticks KF-1', 'save ok', 'snapshot', 'reload both'],
               [], ['KF-1'], srv, [A, B], notes='KF-1 visible on B after first sync: %s' % seen_on_B)
        if not seen_on_B: RESULTS[-1]['result'] = 'FAIL'
        A.close(); B.close()

        # ---------------- B1. two devices edit different rows before either save lands (A's save first) ----------------
        srv = Server(got=[]); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-1'); B.toggle('LW-1')
        ra, rb = A.pending(), B.pending()
        for r in ra: A.settle(r)
        for r in rb: B.settle(r)
        A.drain(); B.drain()
        A.load_server(); B.load_server()
        record('B1 simultaneous edits, different rows (A lands first)', model, 'server empty',
               ['A ticks KF-1', 'B ticks LW-1', 'A save lands', 'B save lands', 'snapshots to both'],
               ['KF-1', 'LW-1'], [], srv, [A, B])
        A.close(); B.close()

        # ---------------- B2. same, reversed order ----------------
        srv = Server(got=[]); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-1'); B.toggle('LW-1')
        ra, rb = A.pending(), B.pending()
        for r in rb: B.settle(r)
        for r in ra: A.settle(r)
        A.drain(); B.drain()
        A.load_server(); B.load_server()
        record('B2 simultaneous edits, different rows (B lands first)', model, 'server empty',
               ['A ticks KF-1', 'B ticks LW-1', 'B save lands', 'A save lands', 'snapshots to both'],
               ['KF-1', 'LW-1'], [], srv, [A, B])
        A.close(); B.close()

        # ---------------- B3. overlapping edits to the same row ----------------
        srv = Server(got=['KF-1']); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-2'); B.toggle('KF-1')  # A adds KF-2, B removes KF-1
        ra, rb = A.pending(), B.pending()
        for r in ra: A.settle(r)
        for r in rb: B.settle(r)
        A.drain(); B.drain()
        A.load_server(); B.load_server()
        record('B3 overlapping edits: A adds KF-2 while B removes KF-1', model, 'server: KF-1',
               ['A ticks KF-2', 'B unticks KF-1', 'A lands', 'B lands', 'snapshots'], ['KF-2'], ['KF-1'], srv, [A, B])
        A.close(); B.close()

        # ---------------- C. offline progress on A while B keeps playing ----------------
        srv = Server(got=['MKT-1']); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-1'); A.toggle('KF-2')                     # offline: requests never reach the server yet
        ra = A.pending()
        if model == 'M1':
            for r in ra: A.settle(r, ok=False)                  # rejected while offline
        B.toggle('LW-1')
        B.drain()
        B.load_server()
        # reconnect A
        if model == 'M2':
            for r in ra: A.settle(r)                            # queued writes flush on reconnect (Firestore-like)
        A.load_server()
        A.drain()                                                # anything A sends after reconnecting
        A.load_server(); B.load_server()
        record('C offline progress on A, other progress on B, A reconnects', model, 'server: MKT-1',
               ['A offline ticks KF-1, KF-2', 'M1: A saves rejected / M2: queued', 'B ticks LW-1 (lands)', 'A reconnects', 'snapshots'],
               ['MKT-1', 'KF-1', 'KF-2', 'LW-1'], [], srv, [A, B])
        A.close(); B.close()

        # ---------------- D1. failed write, nothing else happens, page reopened later ----------------
        srv = Server(got=['MKT-1']); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-1')
        st_after_fail = None
        A.drain(ok=False)
        st_after_fail = A.status()
        local_before = A.local()
        A.reload(); A.load_server()
        A.drain()
        record('D1 failed save, then the page is reopened', model, 'server: MKT-1',
               ['A ticks KF-1', 'save rejected', 'status: %s' % st_after_fail, 'A reopened', 'server snapshot delivered'],
               ['MKT-1', 'KF-1'], [], srv, [A], notes='local save before reopening: %s' % local_before)
        A.close(); B.close()

        # ---------------- D2. failed write followed by a successful unrelated write ----------------
        srv = Server(got=[]); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-1')
        A.drain(ok=False)
        A.toggle('KF-2')
        A.drain()
        A.load_server(); B.load_server()
        record('D2 failed save, then an unrelated save succeeds', model, 'server empty',
               ['A ticks KF-1 (save rejected)', 'A ticks KF-2 (save ok)', 'snapshots'], ['KF-1', 'KF-2'], [], srv, [A, B])
        A.close(); B.close()

        # ---------------- D3. failed write, then another device's update arrives ----------------
        srv = Server(got=[]); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-1')
        A.drain(ok=False)
        B.toggle('LW-1')
        B.drain()
        A.load_server(); B.load_server()
        record('D3 failed save on A, then B\'s update reaches A', model, 'server empty',
               ['A ticks KF-1 (save rejected)', 'B ticks LW-1 (ok)', 'snapshot reaches A'], ['KF-1', 'LW-1'], [], srv, [A, B])
        A.close(); B.close()

        # ---------------- E1. several quick changes while a save is still out ----------------
        srv = Server(got=[]); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-1')
        first = A.pending()                 # first save outstanding
        A.toggle('KF-2'); A.toggle('LW-1')  # flush() sees writing=true -> sets again
        for r in first: A.settle(r)
        A.pg.wait_for_timeout(100)
        for _ in range(3):
            A.drain()
        A.load_server(); B.load_server()
        record('E1 rapid changes while an earlier save is outstanding', model, 'server empty',
               ['A ticks KF-1 (save 1 out)', 'A ticks KF-2, LW-1', 'save 1 lands', 'follow-up save(s)'], ['KF-1', 'KF-2', 'LW-1'], [], srv, [A, B],
               notes='requests from A: %s' % [w for w in srv.writes])
        A.close(); B.close()

        # ---------------- E2. an out-of-date snapshot arrives late, then the player keeps going ----------------
        srv = Server(got=[]); A, B = fresh_pair(b, model, srv)
        old = dict(srv.doc)
        A.toggle('KF-1')
        A.drain()
        A.pg.evaluate("([p,d])=>window.__deliver(p,true,d)", [PATH, old])   # stale snapshot (from before the write)
        A.pg.wait_for_timeout(50)
        A.toggle('KF-2')
        A.drain()
        A.load_server()
        record('E2 late, out-of-date snapshot followed by another change', model, 'server empty',
               ['A ticks KF-1 (ok)', 'stale snapshot (empty) delivered late', 'A ticks KF-2 (ok)'], ['KF-1', 'KF-2'], [], srv, [A],
               notes='depends on the provider delivering snapshots out of order, which Firestore-style listeners do not do')
        A.close(); B.close()

        # ---------------- F1. page reloaded while a save is still outstanding ----------------
        srv = Server(got=['MKT-1']); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-1')
        A.pending()            # request never lands (page goes away)
        A.reload(); A.load_server()
        A.drain()
        A.load_server()
        record('F1 reload during an outstanding save', model, 'server: MKT-1',
               ['A ticks KF-1', 'save outstanding', 'page reloaded', 'server snapshot (without KF-1)'], ['MKT-1', 'KF-1'], [], srv, [A],
               notes='with M2 a real provider might persist the queued write across reloads; the stand-in does not')
        A.close(); B.close()

        # ---------------- F2. progress made earlier with no connection, page reopened online ----------------
        local = {'got': ['sw2:MKT-1', 'sw2:KF-1', 'sw2:KF-2'], 'ver': 'sw2'}
        srv = Server(got=['MKT-1'])
        A = Device(b, 'A', srv, model, seed_local=local)
        A.load_server()
        A.drain()
        record('F2 offline-session progress in local storage, reopened online', model, 'server: MKT-1; device local: MKT-1, KF-1, KF-2',
               ['open page', 'server snapshot delivered'], ['MKT-1', 'KF-1', 'KF-2'], [], srv, [A])
        A.close()

        # ---------------- G1. versions stay separate and survive sync ----------------
        srv = Server(got=[]); A, B = fresh_pair(b, model, srv)
        A.toggle('KF-1')
        A.drain()
        A.pg.evaluate("()=>{document.querySelector('.vtab[data-ver=\"n64\"]').click();}"); A.pg.wait_for_timeout(100)
        A.lock_off(); A.pg.evaluate("()=>__oot.goRow('LW-1')"); A.pg.locator('input[data-id=\"LW-1\"]').first.click(); A.pg.wait_for_timeout(420)
        A.drain()
        B.load_server()
        keys = sorted(srv.doc['got'])
        okv = 'sw2:KF-1' in keys and 'n64:LW-1' in keys and 'sw2:LW-1' not in keys and 'n64:KF-1' not in keys
        bk = sorted(B.pg.evaluate("()=>__oot.got()"))
        okb = 'sw2:KF-1' in bk and 'n64:LW-1' in bk and 'sw2:LW-1' not in bk
        RESULTS.append(dict(scenario='G1 versions stay separate through sync', model=model, server_keys=keys, device_B_keys=bk,
                            result='PASS' if okv and okb else 'FAIL'))
        print(('PASS ' if okv and okb else 'FAIL ') + '[%s] G1 versions stay separate through sync' % model)
        A.close(); B.close()
    b.close()

json.dump(RESULTS, open('/home/claude/audit/testlogs/sync_results.json', 'w'), indent=1)
F = [r for r in RESULTS if r['result'] == 'FAIL']
print('\n%d scenarios, %d passed, %d failed' % (len(RESULTS), len(RESULTS) - len(F), len(F)))
sys.exit(1 if F else 0)
