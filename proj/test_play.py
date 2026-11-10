import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
import sys,os,json; sys.path.insert(0,_env.PROJ); os.environ['OPEN']='0'
import pwpatch
from playwright.sync_api import sync_playwright
JS=r"""(v)=>{
 const o=__oot; o.clear(); const M=o.rowMap(); const ids=Object.keys(M);
 const mains=ids.filter(i=>/^MQ-/.test(i)).sort((a,b)=>+a.slice(3)-+b.slice(3));
 const G=()=>new Set(o.got().map(k=>k.split(':')[1]));
 const first={}, ageIssues=[];
 const isGiven=i=>!!o.GIVER[i];
 function ages(g){ const ad=g.has(o.adultId()), back=g.has('MQ-22'); if(!ad) return 'child'; if(!back) return 'adult'; return 'both'; }
 function nextAge(r,g){ const st=(r.subs||[]).filter(s=>s.step && !g.has(s.id)); return st.length? st[0].age : r.age; }
 function sweep(cp){
   let changed=true, guard=0;
   while(changed && guard<60){ changed=false; guard++;
     const g=G(); const A=ages(g); const todo=[];
     for(const i of ids){
       if(/^MQ-/.test(i) || /^DG-/.test(i) || g.has(i)) continue;
       const r=M[i]; if(r.step) continue;
       if(!o.rowReady(i)) continue;
       if(!(i in first)){ first[i]=cp;
         const na=nextAge(r,g);
         if(i!==o.adultId() && ((na==='Child' && A==='adult') || (na==='Adult' && A==='child'))) ageIssues.push([i,cp,na,A]); }
       if(!isGiven(i)) todo.push(i);
     }
     for(const i of todo){ const g2=G(); if(g2.has(i)) continue; const r=M[i];
       const st=(r.subs||[]).filter(s=>!g2.has(s.id));
       o.tick(st.length? st[0].id : i); changed=true; }
   }
 }
 sweep('start');
 for(const m of mains){ o.tick(m); sweep(m); }
 const never=ids.filter(i=>!/^MQ-/.test(i) && !/^DG-/.test(i) && !M[i].step && !(i in first));
 return {first, ageIssues, never};
}"""
out={}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=_env.CHROME,args=["--no-sandbox"])
    for v in ('n64','3ds','sw2'):
        pg=b.new_page(); errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)))
        pg.goto(_env.OUT_URL + "/themed2.html#skull-"+v); pg.wait_for_selector(".grp")
        if not pg.evaluate("__oot.state.lock"): pg.click("#lockon")
        r=pg.evaluate(JS, v); out[v]=r
        print(v, 'rows first ready:', len(r['first']), 'age issues:', r['ageIssues'], 'never:', r['never'], errs[:2])
    b.close()
json.dump(out,open(_env.TMP + '/play.json','w'))
F=[]
def chk(n,ok,x=''):
    print(('PASS ' if ok else 'FAIL ')+n, '' if ok else x)
    if not ok: F.append(n)
pos=lambda cp: -1 if cp=='start' else int(cp[3:])
for v in out:
    r=out[v]; f=r['first']
    chk(v+': nothing ready for the wrong age at any point', not r['ageIssues'], r['ageIssues'])
    chk(v+': every row becomes ready at some point', set(r['never'])<= {'HP-16','SQ-7','IT-51','IT-44','TR-26','TR-27'}, r['never'])
    chk(v+': Mask of Truth nut bag waits for the three stones', pos(f.get('SQ-15','MQ-99'))>=15)
    chk(v+': Running Man race waits for the carpenters', pos(f.get('SQ-39','MQ-0'))>=32)
    chk(v+': Biggoron Sword waits for King Zora', pos(f.get('IT-4','MQ-0'))>=27)
    chk(v+': nothing outside the forest before leaving it', all(pos(f[i])>=3 for i in f if i[:2] not in ('KF','DT','IT','SQ','MQ','LW') and i not in ('HP-1','HP-2')), [i for i in f if pos(f[i])<3 and i[:2] not in ('KF','DT','IT','SQ','MQ','LW')])
print('FAILS:', F)
