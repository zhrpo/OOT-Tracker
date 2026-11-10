import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Many random playthroughs per version. After every action, check that the Ready list only holds things that can
really be done at that moment, and that two-Link rows behave (child part, adult part, the locked stretch as adult)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); os.environ.setdefault('OPEN', '0')
import pwpatch
from playwright.sync_api import sync_playwright
RUNS = int(os.environ.get('RUNS', '60'))
JS = r"""([v, runs]) => {
 const o=__oot, M=o.rowMap(), ids=Object.keys(M), adult=o.adultId();
 const mains=ids.filter(i=>/^MQ-/.test(i)).sort((a,b)=>+a.slice(3)-+b.slice(3));
 const G=()=>new Set(o.got().map(k=>k.split(':')[1]));
 const rows=ids.filter(i=>!/^MQ-/.test(i) && !M[i].step && !/^TR-/.test(i) && !/^DG-/.test(i));
 const two=rows.filter(i=>(M[i].subs||[]).length && M[i].subs[0].step);
 let seed=1; const rnd=()=>{ seed=(seed*1103515245+12345)%2147483648; return seed/2147483648; };
 const bad={}; let states=0;
 function flag(k,x){ (bad[k]=bad[k]||[]); if(bad[k].length<6) bad[k].push(x); }
 function ages(g){ if(!g.has(adult)) return 'child'; if(!g.has('MQ-22')) return 'adult'; return 'both'; }
 function check(tag){
   states++; const g=G(), A=ages(g);
   for(const i of rows){
     const r=M[i], ready=o.rowReady(i);
     const st=(r.subs||[]).filter(s=>!g.has(s.id));
     const na= st.length ? st[0].age : r.age;
     if(ready && i!==adult && ((na==='Child' && A==='adult') || (na==='Adult' && A==='child'))) flag('ready for the wrong age',[v,tag,i,na,A]);
     if(r.subs && r.subs.length){
       const all=r.subs.every(s=>g.has(s.id));
       if(g.has(i) && !all) flag('row ticked but a step is not',[v,tag,i]);
       if(all && !g.has(i)) flag('all steps ticked but row is not',[v,tag,i]);
       for(let k=1;k<r.subs.length;k++) if(g.has(r.subs[k].id) && !g.has(r.subs[k-1].id)) flag('later step ticked before earlier',[v,tag,r.subs[k].id]);
     }
   }
   // two-Link rows: the child half must be on offer whenever child Link can do it, and hidden while he cannot
   for(const i of two){
     if(g.has(i)) continue;
     const r=M[i], nx=r.subs.filter(s=>!g.has(s.id))[0]; if(!nx) continue;
     const own=o.unmet(nx).filter(c=>!(c.length===1&&c[0].length===1&&(c[0][0]==='MQ-22'||c[0][0]===adult)));
     if(nx.age==='Child' && A!=='adult' && !own.length && !o.rowReady(i)) flag('child part doable but not shown as ready',[v,tag,i]);
     if(nx.age==='Adult' && A!=='child' && !own.length && !o.rowReady(i)) flag('adult part doable but not shown as ready',[v,tag,i]);
   }
 }
 for(let run=0; run<runs; run++){
   seed=run*7919+13; o.clear(); check('run'+run+':start');
   let m=0;
   while(m<mains.length){
     // some side actions, chosen at random among what is ready (a row, or the next step of a two-Link row)
     const k=Math.floor(rnd()*6);
     for(let n=0;n<k;n++){
       const g=G(); const pool=rows.filter(i=>!g.has(i) && o.rowReady(i) && !o.GIVER[i]);
       if(!pool.length) break;
       const i=pool[Math.floor(rnd()*pool.length)], r=M[i];
       const st=(r.subs||[]).filter(s=>!g.has(s.id));
       const pick = st.length ? st[0].id : i;
       if(rnd()<0.15 && st.length){ o.tick(i); check('run'+run+':row '+i); }      // sometimes tick a whole row at once
       else { o.tick(pick); check('run'+run+':'+pick); }
       if(rnd()<0.05){ o.untick(pick); check('run'+run+':untick '+pick); }       // and sometimes take one back
     }
     o.tick(mains[m]); check('run'+run+':'+mains[m]); m++;
   }
 }
 return {states, bad};
}"""
F = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    for v in ('n64', '3ds', 'sw2'):
        pg = b.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(_env.OUT_URL + "/themed2.html#skull-" + v); pg.wait_for_selector(".grp")
        if not pg.evaluate("__oot.state.lock"): pg.click("#lockon")
        r = pg.evaluate(JS, [v, RUNS])
        print(v, 'states checked:', r['states'])
        for k, x in r['bad'].items():
            print('  FAIL', k, x); F.append(v + ': ' + k)
        if errs: print('  errors', errs[:3]); F.append(v + ': page errors')
    b.close()
print('FAILS:', F)
