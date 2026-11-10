import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Every two-Link row, every version: at each age stage, which half is open (age-wise) and what the card says."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); os.environ.setdefault('OPEN', '0')
import pwpatch
from playwright.sync_api import sync_playwright
JS = r"""() => {
 const o=__oot, M=o.rowMap(), adult=o.adultId();
 const two=Object.keys(M).filter(i=>!M[i].step && (M[i].subs||[]).length && M[i].subs[0].step);
 const ageBlock=(s)=>o.unmet(s).filter(c=>c.length===1&&c[0].length===1&&(c[0][0]==='MQ-22'||c[0][0]===adult)).map(c=>c[0][0]);
 const out={}, bad=[];
 const stages=[['child','MQ-16'],['adult, before the Forest Temple','MQ-17'],['free to switch','MQ-22']];
 for(const [name,m] of stages){
   o.clear(); o.tick(m);
   for(const i of two){
     const r=M[i]; out[i]=out[i]||{first:r.subs[0].age, stages:{}};
     const blocks=r.subs.map(s=>ageBlock(s));
     out[i].stages[name]=r.subs.map((s,k)=>s.age[0]+(blocks[k].length?':locked':':open')).join(' ');
     r.subs.forEach((s,k)=>{
       const shouldOpen = name==='child' ? s.age==='Child' : name.startsWith('adult') ? s.age==='Adult' : true;
       const isOpen = !blocks[k].filter(x=>x===adult||x==='MQ-22').length;
       if(shouldOpen!==isOpen) bad.push([i,name,s.id,s.age,blocks[k]]);
     });
   }
 }
 return {out,bad,n:two.length};
}"""
F = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    for v in ('n64', '3ds', 'sw2'):
        pg = b.new_page(); pg.goto(_env.OUT_URL + "/themed2.html#skull-" + v); pg.wait_for_selector(".grp")
        r = pg.evaluate(JS)
        firsts = {}
        for i, x in r['out'].items(): firsts.setdefault(x['first'], []).append(i)
        print(v, r['n'], 'two-Link rows | child first:', sorted(firsts.get('Child', [])), '| adult first:', sorted(firsts.get('Adult', [])))
        if v == 'sw2':
            for i in ('HF-2', 'LW-3', 'HC-2', 'SQ-26'): print('   ', i, r['out'][i]['stages'])
        if r['bad']: print('  FAIL', r['bad'][:8]); F.append(v)
    b.close()
print('FAILS:', F)
