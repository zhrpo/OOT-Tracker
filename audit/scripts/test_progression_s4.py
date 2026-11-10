import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Audit session 4 — progression tests in the running app (out/themed2.html), all three versions.
Throwaway browser contexts, file://, every non-file request aborted, synthetic progress only (state built with the
app's own __oot.tick on a cleared set). Exit 1 on any failure. Results: testlogs/progression_s4.json

P1  OR requirements, every clause with 2+ options on every row and checklist step, every version:
     P1a  with nothing ticked the clause is unmet                                   (no premature unlock)
     P1b  ticking only that option's leaves satisfies the clause                     (each option alone is enough)
     P1c  options naming a row missing in this version can never satisfy it          (F-017 rule)
     P1d  that option + the first live option of every other clause (+ the Prelude of Light if the row is a child row
          and the option made Link adult) -> the row has no unmet requirement        (row-level unlock)
     Cascades are recorded, not failed: if ticking one option's leaves also satisfies a sibling option (a story step gives
     both), the case is listed as "not isolable".
P2  runtime requirements == generated data: for every row/step in every version, rowMap()[id].q equals the payload row
    resolved for that version (resolveRow uses the version override), and reqOf() adds exactly the Master Sword clause
    to Adult/Both rows and nothing else when Link is not stuck as adult.
P3  day/night labels per version: a row's Day/Night/Day + night tag matches its resolved time in that version.
P4  day/night filter (Quests tab): Day hides only Night rows, Night hides only Day rows; Any/Mixed always shown;
    the filter is hidden on other tabs and does not hide rows there (e.g. sw2 HF-1/HC-1 Night tokens); the choice
    persists across a reload.
P5  child two-Link step while stuck as adult: the "Child second" step of a Both row is locked behind the Prelude of
    Light, like a plain child row (one row per version)."""
import json, re, sys
from playwright.sync_api import sync_playwright

URL = _env.OUT_URL + '/themed2.html'
VERS = ['n64', '3ds', 'sw2']
RESULTS = []

def rec(name, ver, ok, detail, counts=None):
    RESULTS.append(dict(test=name, ver=ver, result='PASS' if ok else 'FAIL', counts=counts or {}, detail=detail))
    print(('PASS ' if ok else 'FAIL ') + '%s [%s] %s' % (name, ver, json.dumps(counts or {})) + ('' if ok else '  -> ' + json.dumps(detail)[:500]))

h = open(_env.OUT + '/themed2.html', encoding='utf-8').read()
D = json.loads(re.search(r'<script id="data" type="application/json">(.*?)</script>', h, re.S).group(1).replace('<\\/', '</').replace('<\\!--', '<!--'))

def resolve(r, v):
    if r.get('only') and v not in r['only']:
        return None
    o = (r.get('v') or {}).get(v)
    if o and o.get('hide'):
        return None
    x = {k: y for k, y in r.items() if k not in ('v', 'only')}
    x.update(o or {})
    if x.get('subs'):
        x['subs'] = [s for s in x['subs'] if not s.get('only') or v in s['only']]
    return x

def payload_view(v):
    out = {}
    for t in D['lists']:
        for g in D['lists'][t]:
            for r in g['rows']:
                rv = resolve(r, v)
                if rv is None:
                    continue
                out[rv['id']] = dict(tab=t, q=rv.get('q') or [], age=rv.get('age'), time=rv.get('time'))
                for s in rv.get('subs') or []:
                    out[s['id']] = dict(tab=t, q=s.get('q') or [], age=s.get('age'), time=s.get('time'), sub=1)
    return out

INIT = "window.__ootOpen=true; window.__ootNoAsk=true; window.__ootNoVeil=true; window.__ootDefVer='%s';"

P1_JS = r"""
(ver) => {
  const o = __oot, st = o.state, D = JSON.parse(document.getElementById('data').textContent);
  st.ver = ver; st.lock = true; o.render();
  const M = () => o.rowMap();
  const ADULT = o.adultId(), BACK = 'MQ-22';
  const skulls = Object.keys(M()).filter(id => { const r = M()[id]; return r && r.where !== undefined && /^[A-Z]+-\d+$/.test(id) && !/^(HP|SQ|IT|MQ|TR|DG)-/.test(id); });
  const pre = ver + ':';
  const hasId = id => o.got().indexOf(pre + id) >= 0;
  function tickLeaf(x){
    if (x.indexOf('GS:') === 0) { skulls.slice(0, +x.slice(3)).forEach(s => o.tick(s)); return; }
    o.tick(x);
  }
  const e = () => o.eff();
  const leafOk = (x) => x.indexOf('GS:') === 0 ? e().gs >= +x.slice(3) : !!e().s[x];
  const optOk = (opt) => opt.every(leafOk);
  const sig = c => JSON.stringify(c);
  const live = opt => opt.every(x => x.indexOf('GS:') === 0 || !!M()[x]);
  const res = { cases: 0, P1a: [], P1b: [], P1c: [], P1d: [], notIsolable: [], rows: 0 };
  const ids = Object.keys(M());
  ids.forEach(id => {
    const r = M()[id];
    if (!r || !r.q) return;
    const tabMain = false;
    r.q.forEach((c, ci) => {
      if (c.length < 2) return;
      res.rows++;
      // P1a
      o.clear();
      if (!o.unmet(r).some(u => sig(u) === sig(c))) res.P1a.push([id, ci]);
      c.forEach((opt, oi) => {
        res.cases++;
        o.clear();
        if (!live(opt)) {
          opt.forEach(x => { if (M()[x] || x.indexOf('GS:') === 0) tickLeaf(x); });
          if (optOk(opt)) res.P1c.push([id, ci, oi, opt]);
          return;
        }
        opt.forEach(tickLeaf);
        if (!optOk(opt)) { res.P1b.push([id, ci, oi, opt]); return; }
        const sib = c.map((x, k) => k !== oi && live(x) && optOk(x) ? k : -1).filter(k => k >= 0);
        if (sib.length) res.notIsolable.push([id, ci, oi, sib]);
        // P1d: complete the other clauses with their first live option
        r.q.forEach((c2, cj) => { if (cj === ci) return; const f = c2.find(live); if (f) f.forEach(tickLeaf); });
        if ((r.age === 'Adult' || r.age === 'Both') && id !== ADULT) o.tick(ADULT);
        if (r.age === 'Child' && hasId(ADULT) && !hasId(BACK)) o.tick(BACK);
        if (hasId(id)) return;   // ticking requirements already ticked the row itself (linked prize): not applicable
        const U = o.unmet(r);
        if (U.length) res.P1d.push([id, ci, oi, U]);
      });
    });
  });
  o.clear();
  return res;
}
"""

P2_JS = r"""
(ver) => {
  const o = __oot, st = o.state; st.ver = ver; o.clear(); o.render();
  const M = o.rowMap(), ADULT = o.adultId(), out = {};
  Object.keys(M).forEach(id => { const r = M[id]; out[id] = { q: r.q || [], age: r.age, time: r.time, req: o.reqOf(r) }; });
  return { rows: out, adult: ADULT };
}
"""

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=['--no-sandbox'])
    def page(ver, storage=None):
        ctx = b.new_context()
        ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        ctx.add_init_script(INIT % ver)
        if storage is not None:
            # seed only when no save exists yet (a sessionStorage guard is not reliable across reloads of a file:// page)
            ctx.add_init_script("if(!localStorage.getItem('oot-tracker-v1')){localStorage.setItem('oot-tracker-v1',%s);}" % json.dumps(json.dumps(storage)))
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL + '#story-' + ver); pg.wait_for_selector('.grp')
        return ctx, pg, errs

    for v in VERS:
        ctx, pg, errs = page(v, storage={'got': [], 'ver': v})
        # ---------------- P1 ----------------
        r1 = pg.evaluate(P1_JS, v)
        cnt = dict(clauses=r1['rows'], options=r1['cases'], not_isolable=len(r1['notIsolable']))
        rec('P1a OR clause unmet with nothing ticked', v, not r1['P1a'], r1['P1a'], cnt)
        rec('P1b each OR option alone satisfies its clause', v, not r1['P1b'], r1['P1b'], cnt)
        rec('P1c options naming a row missing in this version never satisfy', v, not r1['P1c'], r1['P1c'])
        rec('P1d each OR option + other clauses unlocks the row', v, not r1['P1d'], r1['P1d'][:20], dict(failures=len(r1['P1d'])))
        RESULTS[-1]['not_isolable'] = r1['notIsolable']

        # ---------------- P2 ----------------
        r2 = pg.evaluate(P2_JS, v)
        pv = payload_view(v)
        bad = []
        if set(pv) != set(r2['rows']):
            bad.append(dict(only_payload=sorted(set(pv) - set(r2['rows']))[:20], only_runtime=sorted(set(r2['rows']) - set(pv))[:20]))
        for i, x in r2['rows'].items():
            if i not in pv:
                continue
            if x['q'] != pv[i]['q'] or x['age'] != pv[i]['age'] or x['time'] != pv[i]['time']:
                bad.append(dict(id=i, runtime=x, payload=pv[i])); continue
            extra = x['req'][len(x['q']):]
            want = [[[r2['adult']]]] if (x['age'] in ('Adult', 'Both') and i != r2['adult']) else []
            if x['req'][:len(x['q'])] != x['q'] or extra != want:
                bad.append(dict(id=i, reqOf=x['req'], q=x['q']))
        rec('P2 runtime requirements/age/time == generated data for the version', v, not bad, bad[:10], dict(rows=len(r2['rows'])))

        # ---------------- P3 labels ----------------
        bad = []
        pg.evaluate("()=>{ __oot.state.status='all'; __oot.state.age='all'; __oot.state.time='all'; }")
        for t, hashname in (('skull', 'skulltulas'), ('heart', 'hearts'), ('side', 'quests'), ('items', 'items')):
            pg.evaluate("(t)=>{ __oot.state.tab=t; __oot.render(); }", t)
            tags = pg.evaluate("""()=>{ const o={}; document.querySelectorAll('[data-row]').forEach(el=>{
                const id=el.getAttribute('data-row'); const own=[...el.querySelectorAll('.tag')].filter(x=>!x.closest('.sub'));
                o[id]=own.filter(x=>/night|day|mixed/.test(x.className)).map(x=>x.className.replace('tag ','')).join(','); }); return o; }""")
            if not tags:
                bad.append(dict(tab=t, problem='no rows found to check')); continue
            for i, tg in tags.items():
                if i not in pv or pv[i].get('sub'):
                    continue
                want = {'Night': 'night', 'Day': 'day', 'Mixed': 'mixed'}.get(pv[i]['time'], '')
                if tg != want:
                    bad.append(dict(tab=t, id=i, tag=tg, time=pv[i]['time']))
        rec('P3 day/night tags match the version\'s time label', v, not bad, bad[:10])

        # ---------------- P4 filter ----------------
        bad = []
        def visible(tab):
            pg.evaluate("(t)=>{ __oot.state.tab=t; __oot.render(); }", tab)
            return pg.evaluate("""()=>[...document.querySelectorAll('[data-row]')].filter(e=>e.offsetParent!==null||e.getClientRects().length).map(e=>e.getAttribute('data-row'))""")
        pg.evaluate("()=>{ __oot.state.tab='side'; __oot.render(); }")
        seg_visible_side = pg.evaluate("()=>!document.getElementById('seg-time').classList.contains('hidden')")
        sides = {i: x for i, x in pv.items() if x['tab'] == 'side' and not x.get('sub')}
        for mode in ('all', 'day', 'night'):
            pg.click('#seg-time button[data-v="%s"]' % mode)
            vis = set(visible('side'))
            for i, x in sides.items():
                hide = (mode == 'day' and x['time'] == 'Night') or (mode == 'night' and x['time'] == 'Day')
                if hide == (i in vis):
                    bad.append(dict(mode=mode, id=i, time=x['time'], visible=i in vis))
        # night still selected: other tabs must ignore it and hide the control
        pg.evaluate("()=>{ __oot.state.tab='skull'; __oot.render(); }")
        seg_hidden_skull = pg.evaluate("()=>document.getElementById('seg-time').classList.contains('hidden')")
        vis = set(visible('skull'))
        skulls = [i for i, x in pv.items() if x['tab'] == 'skull' and not x.get('sub')]
        hidden_sk = [i for i in skulls if i not in vis and pv[i]['time'] == 'Day']
        if hidden_sk:
            bad.append(dict(problem='night filter leaked onto Skulltulas tab', rows=hidden_sk))
        if not seg_visible_side or not seg_hidden_skull:
            bad.append(dict(seg_visible_on_side=seg_visible_side, seg_hidden_on_skull=seg_hidden_skull))
        # persistence: tick something to trigger saveLocal, reload, filter still night
        pg.evaluate("()=>{ __oot.state.tab='side'; __oot.render(); }")
        pg.evaluate("()=>{ document.querySelector('#seg-time button[data-v=\"night\"]').click(); }")
        stored_before = json.loads(pg.evaluate("()=>localStorage.getItem('oot-tracker-v1')") or 'null')
        pg.reload(); pg.wait_for_selector('.grp')
        tsaved = pg.evaluate("()=>__oot.state.time")
        stored_after = json.loads(pg.evaluate("()=>localStorage.getItem('oot-tracker-v1')") or 'null')
        if tsaved != 'night':
            bad.append(dict(problem='time filter not kept across reload', after=tsaved,
                            stored_before={k: x for k, x in (stored_before or {}).items() if k != 'got'}, got_before=(stored_before or {}).get('got'),
                            stored_after_keys=sorted((stored_after or {}).keys()), got_after=(stored_after or {}).get('got')))
        counts = {m: sum(1 for x in sides.values() if x['time'] == m) for m in ('Any', 'Day', 'Night', 'Mixed')}
        rec('P4 day/night filter on Quests tab; ignored elsewhere; persisted', v, not bad, bad[:10], counts)

        # ---------------- P5 ----------------
        pick = {'n64': 'HP-20', '3ds': 'HP-20', 'sw2': 'HP-6'}[v]
        r5 = pg.evaluate("""([v,id])=>{ const o=__oot; o.state.ver=v; o.state.lock=true; o.clear(); o.render();
            const r=o.rowMap()[id]; const child=(r.subs||[]).find(s=>s.age==='Child');
            o.tick(o.adultId());
            const stuck=o.unmet(child).some(c=>JSON.stringify(c)==='[["MQ-22"]]');
            o.tick('MQ-22');
            const after=o.unmet(child).some(c=>JSON.stringify(c)==='[["MQ-22"]]');
            o.clear(); return {child: child && child.id, stuck, after}; }""", [v, pick])
        rec('P5 child half of a two-Link row waits for the Prelude while stuck as adult', v,
            bool(r5['child']) and r5['stuck'] and not r5['after'], r5)

        rec('no page errors', v, not errs, errs[:3])
        ctx.close()
    b.close()

json.dump(RESULTS, open(_env.LOGS + '/progression_s4.json', 'w'), indent=1)
F = [r for r in RESULTS if r['result'] == 'FAIL']
print('\n%d tests, %d passed, %d failed' % (len(RESULTS), len(RESULTS) - len(F), len(F)))
sys.exit(1 if F else 0)
