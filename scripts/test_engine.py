"""Audit session 2 — progression engine and state-integrity tests (deterministic + seeded random).
Runs against the isolated build (audit/out/themed2.html) in throwaway browser contexts. Synthetic progress only.
Exit code 1 if any test fails. Writes audit/testlogs/engine_results.json with one record per test.
Usage: python3 test_engine.py [--seeds N]   (random runs use seeds 1..N, default 40, per version)"""
import json, sys, os
from playwright.sync_api import sync_playwright

URL = 'file:///home/claude/audit/out/themed2.html'
SEEDS = int(sys.argv[sys.argv.index('--seeds') + 1]) if '--seeds' in sys.argv else 40
RESULTS = []

def rec(name, behavior, initial, action, expected, actual, ok, refs):
    RESULTS.append(dict(test=name, behavior=behavior, initial=initial, action=action, expected=expected,
                        actual=actual, result='PASS' if ok else 'FAIL', refs=refs))
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else '  -> ' + str(actual)[:300]))

INIT = "window.__ootOpen=true; window.__ootNoAsk=true; window.__ootNoVeil=true; window.__ootDefVer='%s';"

# helpers injected into the page
HELP = r"""
window.__A = (function(){
  const o = __oot, D = JSON.parse(document.getElementById('data').textContent);
  const st = o.state;
  function setVer(v){ st.ver = v; o.render(); }
  function G(){ return new Set(o.got()); }
  function has(id){ return o.got().indexOf(st.ver + ':' + id) >= 0; }
  function M(){ return o.rowMap(); }
  const SUBS = o.subs, SUBOF = {};
  Object.keys(SUBS).forEach(p => SUBS[p].forEach(s => SUBOF[s.id] = p));
  function vsubs(p){ const r = M()[p]; return (r && r.subs) ? r.subs.map(s => s.id) : []; }
  function links(){ return D.links.filter(l => !l.v || l.v.indexOf(st.ver) >= 0); }
  function check(){
    const m = M(), bad = [];
    const g = G(), pre = st.ver + ':';
    const h = id => g.has(pre + id);
    // I1: a ticked story/dungeon/checklist node has all its ancestors that exist in this version ticked
    Object.keys(m).forEach(id => { if (!h(id) || !o.ANCL[id]) return;
      o.ANCL[id].forEach(a => { if (m[a] && !h(a)) bad.push(['I1-ancestor', id, a]); }); });
    // I2: a row with a checklist is ticked exactly when all of its (version) steps are
    Object.keys(SUBS).forEach(p => { if (!m[p]) return; const L = vsubs(p); if (!L.length) return;
      const all = L.every(h);
      if (h(p) && !all) bad.push(['I2-parent-without-steps', p, L.filter(x => !h(x))]);
      if (!h(p) && all) bad.push(['I2-steps-without-parent', p]); });
    // I4: full links: quest ticked => its existing full prizes ticked; all existing full prizes ticked => quest ticked
    const byQ = {};
    links().forEach(l => { if (l.m !== 'full' || !m[l.q] || !m[l.r]) return; (byQ[l.q] = byQ[l.q] || []).push(l.r); });
    Object.keys(byQ).forEach(q => { const P = byQ[q];
      if (h(q) && !P.every(h)) bad.push(['I4-quest-without-prize', q, P.filter(x => !h(x))]);
      if (!h(q) && P.every(h)) bad.push(['I4-prizes-without-quest', q]); });
    return bad;
  }
  function others(v){ return o.got().filter(k => k.indexOf(v + ':') !== 0).sort(); }
  // lcg rng with explicit seed
  function rng(seed){ let s = seed >>> 0; return () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return s / 4294967296; }; }
  return { o, D, st, setVer, G, has, M, SUBS, SUBOF, vsubs, check, others, rng, links };
})();
"""

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])

    def page(ver='sw2', storage=None, extra_init=''):
        ctx = b.new_context()
        ctx.add_init_script(INIT % ver + extra_init)
        if storage is not None:
            ctx.add_init_script("try{ if(!sessionStorage.getItem('__seeded')){ localStorage.setItem('oot-tracker-v1', %s); sessionStorage.setItem('__seeded','1'); } }catch(e){}" % json.dumps(storage))
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL + '#main-' + ver); pg.wait_for_selector('.grp')
        pg.evaluate(HELP)
        return ctx, pg, errs

    for V in ('n64', '3ds', 'sw2'):
        ctx, pg, errs = page(V)
        ev = lambda js, *a: pg.evaluate(js, *a)

        # S1: a later story step completes every preceding step
        r = ev("""()=>{const A=__A; A.o.clear(); A.o.tick('MQ-41'); const m=A.M(); return (A.o.ANCL['MQ-41']||[]).filter(i=>m[i]&&!A.has(i));}""")
        rec(V+' S1a later step ticks all of its prerequisite steps', 'tickOn ancestor propagation', 'empty', 'tick MQ-41', 'every ANCL ancestor ticked', r, r == [], 'app.js tickOn L291-304, ANCL L60-69')
        r = ev("""()=>{const A=__A,o=A.o; o.clear(); o.tick('MQ-41'); const a=o.unmet(A.M()['KF-1']); o.clear(); o.tick('MQ-34'); const b2=A.has('MQ-22'); return {child_row_lock_after_finishing:a, child_spirit_implies_prelude:b2};}""")
        rec(V+' S1b finishing the game (or the child Spirit Temple) does not leave child rows locked', 'BACK rule vs story ancestors',
            'empty', 'tick MQ-41; check KF-1. tick MQ-34; check MQ-22', 'KF-1 not locked; MQ-34 implies MQ-22 (going back to child needs the Prelude)',
            r, r['child_row_lock_after_finishing'] == [] and r['child_spirit_implies_prelude'], 'reqOf L209-213 BACK=MQ-22; main.py after-lists of well/spiritchild')

        # S2: a step grants its rewards
        r = ev("""()=>{const A=__A; A.o.clear(); A.o.tick('MQ-21'); return ['IT-13','IT-58'].filter(x=>!A.has(x));}""")
        rec(V+' S2 Forest Temple gives Fairy Bow and Forest Medallion', 'gives propagation', 'empty', 'tick MQ-21', 'IT-13, IT-58 ticked', r, r == [], 'tickOn L307')

        # S3: full link both ways (HP-1 <-> SQ-1), up link one way (SQ-27 -> IT-16 only)
        r = ev("""()=>{const A=__A, o=A.o; o.clear(); o.tick('HP-1'); const a=A.has('SQ-1'); o.clear(); o.tick('SQ-1'); const b2=A.has('HP-1');
                  o.clear(); o.tick('MQ-17'); o.tick('IT-16'); const c=A.has('SQ-27'); o.clear(); o.tick('MQ-17'); o.tick('SQ-27'); const d=A.has('IT-16'); return [a,b2,c,d];}""")
        rec(V+' S3 linked rows: full both ways, up one way', 'link propagation', 'empty', 'tick HP-1; tick SQ-1; tick IT-16; tick SQ-27',
            '[true,true,false,true]', r, r == [True, True, False, True], 'tickOn L310, L334-338')

        # S4/S5: checklist children -> parent, parent -> children (version steps only)
        r = ev("""()=>{const A=__A,o=A.o; const out={}; ['SQ-13','SQ-29','SQ-17','MQ-3','MQ-21','HF-2'].forEach(p=>{ if(!A.M()[p]) return;
                  const L=A.vsubs(p); if(!L.length) return; o.clear(); L.forEach(s=>o.tick(s)); const up=A.has(p);
                  o.clear(); o.tick(p); const down=L.every(s=>A.has(s)); const foreign=(A.SUBS[p]||[]).map(s=>s.id).filter(s=>L.indexOf(s)<0&&A.has(s));
                  out[p]=[up,down,foreign.length]; }); return out;}""")
        ok = all(v[0] and v[1] and v[2] == 0 for v in r.values())
        rec(V+' S4/S5 checklist steps <-> parent', 'SUBS/SUBOF propagation, version-filtered', 'empty',
            'tick every step; then tick parent', 'parent ticked; all version steps ticked; no other-version step stored', r, ok, 'tickOn L312-313, subsV L54')

        # S6: unticking a step reverses dependants (untick Master Sword step MQ-17 -> every adult story step goes)
        r = ev("""()=>{const A=__A,o=A.o; o.clear(); o.tick('MQ-41'); o.untick('MQ-17'); return Object.keys(A.M()).filter(i=>/^MQ-/.test(i)&&A.has(i)&&o.ANCL[i]&&o.ANCL[i].indexOf('MQ-17')>=0);}""")
        rec(V+' S6 unticking a step unticks every step after it', 'tickOff DESC', 'story finished', 'untick MQ-17', 'no later step ticked', r, r == [], 'tickOff L359')

        # S7: unticking something unrelated leaves everything else
        r = ev("""()=>{const A=__A,o=A.o; o.clear(); o.tick('MQ-21'); ['KF-1','KF-2','HP-1'].forEach(x=>o.tick(x)); const before=o.got().filter(k=>k.indexOf(':KF-1')<0).sort();
                  o.untick('KF-1'); const after=o.got().sort(); return JSON.stringify(before)===JSON.stringify(after);}""")
        rec(V+' S7 unticking an unrelated row removes nothing else', 'tickOff scope', 'MQ-21 + KF-1,KF-2,HP-1', 'untick KF-1', 'only KF-1 removed', r, r is True, 'tickOff')

        # S10: a locked checkbox cannot be ticked through the UI while locks are on
        r = ev("""()=>{const A=__A,o=A.o; o.clear(); o.render(); const id='FT-1'; o.goRow(id); const inp=document.querySelector('input[data-id="'+id+'"]');
                  if(!inp) return 'no input'; const dis=inp.disabled; inp.disabled=false; inp.checked=true; inp.dispatchEvent(new Event('change',{bubbles:true}));
                  return [dis, A.has(id)];}""")
        rec(V+' S10 locked row refuses a tick even if the checkbox is forced', 'UI lock guard', 'empty, locks on', 'force change event on FT-1',
            '[true,false]', r, r == [True, False], 'change handler L1241-1248')

        # S17: actions in one version never touch another version's keys
        r = ev("""(V)=>{const A=__A,o=A.o; o.clear(); const vs=['n64','3ds','sw2'];
                  vs.forEach(v=>{ A.st.ver=v; o.tick('MQ-10'); });
                  A.st.ver=V; const snap=A.others(V); o.tick('MQ-41'); o.untick('MQ-3'); o.tick('SQ-29'); o.untick('IT-16');
                  const same=JSON.stringify(snap)===JSON.stringify(A.others(V)); A.st.ver=V; return same;}""", V)
        rec(V+' S17 version isolation', 'keys are ver:ID; tick/untick use state.ver', 'MQ-10 ticked in all versions', 'tick/untick in '+V,
            'other versions unchanged', r, r is True, 'key() L183, setOn L290')

        # S18: child rows lock while stuck as adult (Master Sword taken, Prelude not yet), unlock after Prelude
        r = ev("""()=>{const A=__A,o=A.o; o.clear(); o.tick('MQ-17'); const a=o.unmet(A.M()['KF-1']).length>0; o.tick('MQ-22'); const b2=o.unmet(A.M()['KF-1']).length>0; return [a,b2];}""")
        rec(V+' S18 child row locked while stuck as adult, open after Prelude', 'reqOf BACK rule', 'MQ-17 ticked', 'check KF-1, then tick MQ-22',
            '[true,false]', r, r == [True, False], 'reqOf L209-213, stuckAdult L208')

        # S19: rapid repeated tick/untick of the same rows ends consistent and reversible
        r = ev("""()=>{const A=__A,o=A.o; o.clear(); o.tick('MQ-10'); const base=o.got().sort().join();
                  for(let i=0;i<60;i++){ o.tick('SQ-21'); o.untick('SQ-21'); o.tick('IT-36'); o.untick('IT-36'); }
                  return [base===o.got().sort().join(), A.check()];}""")
        rec(V+' S19 rapid tick/untick churn', 'idempotence', 'MQ-10', '60x tick/untick SQ-21, IT-36', 'state back to MQ-10 only; invariants hold',
            r, r[0] is True and r[1] == [], 'tickOn/tickOff')

        # R: seeded random action sequences; after every action check invariants I1, I2, I4 and that undo restores state
        r = ev("""([V,N])=>{const A=__A,o=A.o; const fails=[]; A.st.ver=V;
          for(let seed=1; seed<=N; seed++){
            const R=A.rng(seed*7919+V.length); o.clear(); const ids=Object.keys(A.M());
            for(let step=0; step<120; step++){
              const g0=o.got().sort(); let id, act;
              if(R()<0.7){ const cand=ids.filter(i=>!A.has(i) && !o.unmet(A.M()[i]).length); if(!cand.length) break; id=cand[Math.floor(R()*cand.length)]; act='tick';
                const log=o.tick(id); if(!A.has(id)) fails.push([seed,step,'tick-did-not-tick',id]);
                // undo restores exactly
                const c=new Set(o.got()); for(let k=log.length-1;k>=0;k--){ if(log[k][1]) c.delete(log[k][0]); else c.add(log[k][0]); }
                if(JSON.stringify(Array.from(c).sort())!==JSON.stringify(g0)) fails.push([seed,step,'undo-log-does-not-restore',id]);
              } else { const on=o.got().filter(k=>k.indexOf(V+':')===0).map(k=>k.slice(V.length+1)).filter(i=>A.M()[i]); if(!on.length) continue;
                id=on[Math.floor(R()*on.length)]; act='untick'; o.untick(id); if(A.has(id)) fails.push([seed,step,'untick-did-not-untick',id]); }
              const bad=A.check(); if(bad.length){ fails.push([seed,step,act,id,bad.slice(0,3)]); break; }
            }
          }
          return fails;}""", [V, SEEDS])
        rec(V+' R random sequences keep invariants (%d seeds x 120 actions)' % SEEDS, 'I1 ancestors, I2 checklist parity, I4 full-link parity, tick/untick effect',
            'empty', 'random lock-respecting ticks (70%%) and unticks (30%%), seed = seed*7919+len(ver)', 'no invariant broken', r[:5], r == [], 'tickOn, tickOff')

        rec(V+' no page errors during tests', 'runtime errors', '-', 'all of the above', 'none', errs[:3], errs == [], 'app.js')
        ctx.close()

    # ---------- persistence / normalize tests (fresh context each, synthetic storage) ----------
    # N1: normalize gives 'up' prizes unconditionally on load, while tickOn only gives them when the prize's own
    #     requirement is met -> state after reload differs from state before reload.
    ctx, pg, errs = page('sw2')
    r = pg.evaluate("""()=>{const A=__A,o=A.o; o.clear(); o.tick('MQ-21'); o.tick('SQ-28'); o.tick('SQ-33'); const before=A.has('IT-51');
                       localStorage.setItem('oot-tracker-v1', JSON.stringify({got:o.got(), ver:'sw2'})); return before;}""")
    pg.reload(); pg.wait_for_selector('.grp'); pg.evaluate(HELP)
    r2 = pg.evaluate("()=>__A.has('IT-51')")
    rec('sw2 N1 an "up" prize stays as tickOn left it after a reload', 'normalize link catch-up vs tickOn reqMet',
        'sw2: Forest Temple, Epona, no bottle', 'tick SQ-33 (Big Poes); reload', 'IT-51 same before and after reload',
        {'before_reload': r, 'after_reload': r2}, r == r2, 'tickOn L310 vs normalize L468-473')
    ctx.close()

    # N1b: same, with Dampe's race ticked while the Master Sword is not (possible with Locks off)
    ctx, pg, errs = page('sw2')
    r = pg.evaluate("()=>{const o=__oot; o.clear(); o.tick('SQ-27'); const b=__oot.got().some(k=>/:IT-16$/.test(k)); localStorage.setItem('oot-tracker-v1', JSON.stringify({got:o.got(),ver:'sw2'})); return b;}")
    pg.reload(); pg.wait_for_selector('.grp')
    r2 = pg.evaluate("()=>__oot.got().some(k=>/:IT-16$/.test(k))")
    rec('sw2 N1b reload does not add a prize that tickOn withheld', 'normalize up-link catch-up ignores reqMet',
        'empty, Locks off (o.tick bypasses locks)', 'tick SQ-27; reload', 'IT-16 identical before and after reload',
        {'before_reload': r, 'after_reload': r2}, r == r2, 'tickOn L310 (reqMet) vs normalize L472 (unconditional)')
    ctx.close()

    # D1: documented design — unticking an item a story step gave keeps the step when later steps lean on it
    ctx, pg, errs = page('sw2')
    r = pg.evaluate("()=>{const o=__oot,h=i=>o.got().indexOf('sw2:'+i)>=0; o.clear(); o.tick('MQ-41'); o.untick('IT-13'); return {forest:h('MQ-21'), bow:h('IT-13'), fireArrowsStep:h('MQ-36')};}")
    rec('sw2 D1 (design) untick Fairy Bow after finishing: step stays, bow goes', 'tickOff GIVER rule L386-390',
        'story finished', 'untick IT-13', 'recorded as observed (design: later steps lean on MQ-21)', r, r['forest'] and not r['bow'], 'tickOff L386-390')
    ctx.close()

    # N2: normalize writes only {got, ver} when it changes something on load -> other saved settings are lost
    store = json.dumps({'got': ['sw2:MQ-14', 'sw2:MQ-1'], 'ver': 'sw2', 'tab': 'skull', 'status': 'todo', 'lock': False, 'dg': {'MQ-3': True}})
    ctx, pg, errs = page('sw2', storage=store)
    saved = json.loads(pg.evaluate("()=>localStorage.getItem('oot-tracker-v1')"))
    pg.reload(); pg.wait_for_selector('.grp')
    st = pg.evaluate("()=>({lock:__oot.state.lock, status:__oot.state.status, dg:__oot.state.dg, tab:__oot.state.tab})")
    rec('N2 settings survive a load that migrates old progress', 'normalize() save at L489',
        'saved: lock off, status todo, tab skull, MQ-3 walkthrough open, plus retired MQ-14', 'load page (normalize drops MQ-14 and saves), then reload',
        'stored save still holds lock, status, tab and walkthrough settings', {'stored_after_first_load_keys': sorted(saved.keys()), 'state_after_reload': st},
        all(k in saved for k in ('lock', 'status', 'tab', 'dg')), 'app.js L489 vs saveLocal L1126')
    ctx.close()

    # N3: malformed saved data never breaks start-up
    for label, raw in [('not json', '{oops'), ('got not array', json.dumps({'got': 'x'})), ('got objects', json.dumps({'got': [{'a': 1}, 5, None, 'sw2:KF-1']})),
                       ('unknown ids', json.dumps({'got': ['sw2:ZZ-999', 'nope', 'sw2:MQ-1'], 'ver': 'sw2'})), ('bad ver/tab', json.dumps({'got': [], 'ver': 'x', 'tab': '<b>'}))]:
        ctx, pg, errs = page('sw2', storage=raw)
        n = pg.locator('.grp').count()
        rec('N3 start-up with malformed save: ' + label, 'load path L116-136', raw[:60], 'load', 'page renders, no page error',
            {'groups': n, 'errors': errs[:2]}, n > 0 and not errs, 'app.js L116-136')
        ctx.close()

    # N4: a brand-new user (no storage) starts with pre-ticked rows not tied to a game
    ctx, pg, errs = page('sw2')
    r = pg.evaluate("()=>({legacy: __oot.got().filter(k=>k.indexOf(':')<0), banner: !document.getElementById('legacy').classList.contains('hidden')})")
    rec('N4 a brand-new user starts with nothing ticked', 'D.defaults at L136', 'no saved data', 'first load', 'no checkmarks, no prompt', r,
        r['legacy'] == [] and not r['banner'], 'app.js L136, build defaults')
    ctx.close()

    # N5: progress-code import rejects malformed or hostile input and accepts a valid code
    ctx, pg, errs = page('sw2')
    pg.click('#xfer summary') if pg.locator('#xfer summary').count() else None
    cases = {'not a code': 'hello', 'bad base64': 'OOT1.@@@', 'not array': 'OOT1.' + __import__('base64').b64encode(b'{"a":1}').decode(),
             'html id': 'OOT1.' + __import__('base64').b64encode(json.dumps(['sw2:<img src=x onerror=alert(1)>']).encode()).decode(),
             'valid': 'OOT1.' + __import__('base64').b64encode(json.dumps(['sw2:KF-1', 'sw2:MQ-1']).encode()).decode()}
    out = {}
    for k, code in cases.items():
        pg.fill('#xin', code); pg.click('#xapply'); out[k] = pg.inner_text('#xmsg2')
    got = pg.evaluate("()=>__oot.got()")
    ok = ('not look' in out['not a code'] and 'could not be read' in out['bad base64'] and 'could not be read' in out['not array']
          and 'Nothing new' in out['html id'] and 'Added' in out['valid'] and 'sw2:KF-1' in got and not any('<' in g for g in got) and not errs)
    rec('N5 progress code import validation', 'xapply handler L1526-1541', 'empty', 'import 5 codes', 'invalid rejected, html rejected, valid added',
        {'messages': out, 'errors': errs[:2]}, ok, 'app.js L1526-1541')
    ctx.close()
    b.close()

json.dump(RESULTS, open('/home/claude/audit/testlogs/engine_results.json', 'w'), indent=1)
F = [r for r in RESULTS if r['result'] == 'FAIL']
print('\n%d tests, %d passed, %d failed' % (len(RESULTS), len(RESULTS) - len(F), len(F)))
sys.exit(1 if F else 0)
