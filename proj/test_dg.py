"""Dungeon walkthroughs (Round 22): per-version step lists, ticking in order, the row finishing with its last step,
unticking, the per-dungeon toggle in the dropdown, and no global pill."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); os.environ.setdefault('OPEN', '0')
import pwpatch
from playwright.sync_api import sync_playwright
JS = r"""(v) => {
 const o=__oot, M=o.rowMap(), bad=[], info={};
 const dg=Object.keys(M).filter(i=>!o.subs[i]?false:(M[i].subs||[]).length&&M[i].subs[0].dg);
 for(const p of dg){
   const L=M[p].subs; info[p]=L.length;
   if(L.some(s=>s.only&&s.only.indexOf(v)<0)) bad.push([p,'foreign step shown']);
   // tick every step in order: the row is done only after the last
   o.clear();
   L.forEach((s,k)=>{ o.tick(s.id); const done=o.got().indexOf(v+':'+p)>=0;
     if(k<L.length-1 && done && !L[0].free) bad.push([p,'row done early at',s.id]);
     if(k===L.length-1 && !done) bad.push([p,'row not done after last step']); });
   // ticking the row ticks exactly this version's steps
   o.clear(); o.tick(p);
   const g=o.got(); L.forEach(s=>{ if(g.indexOf(v+':'+s.id)<0) bad.push([p,'step not ticked with row',s.id]); });
   Object.keys(o.subs).forEach(q=>{ if(q!==p) return; o.subs[q].forEach(s=>{ if(s.only&&s.only.indexOf(v)<0&&g.indexOf(v+':'+s.id)>=0) bad.push([p,'foreign step stored',s.id]); }); });
   // ticking a middle step ticks the earlier ones of this version only
   if(!L[0].free){ o.clear(); const mid=L[Math.floor(L.length/2)]; o.tick(mid.id); const g2=o.got();
     L.slice(0,Math.floor(L.length/2)).forEach(s=>{ if(g2.indexOf(v+':'+s.id)<0) bad.push([p,'earlier step not ticked',s.id]); });
     // unticking the row's last step after finishing leaves the row open
     o.clear(); o.tick(p); o.untick(L[L.length-1].id); if(o.got().indexOf(v+':'+p)>=0) bad.push([p,'row still done after untick']); }
 }
 o.clear();
 return {bad,info,pill:!!document.getElementById('dsteps')};
}"""
F = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for v in ('n64', '3ds', 'sw2'):
        pg = b.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("file:///home/claude/audit/out/themed2.html#main-" + v); pg.wait_for_selector(".grp")
        r = pg.evaluate(JS, v)
        print(v, 'dungeons:', len(r['info']), 'steps:', sum(r['info'].values()), r['info'].get('MQ-3'), r['info'].get('MQ-21'))
        if r['pill']: r['bad'].append('global pill still there')
        # the toggle sits in the Deku Tree's dropdown and is per dungeon
        pg.evaluate("() => { __oot.state.lock=false; __oot.render(); }")
        pg.evaluate("() => __oot.goRow('MQ-3')"); pg.wait_for_timeout(300)
        row = pg.locator('[data-row="MQ-3"]')
        if row.locator('.sub').count(): r['bad'].append('steps showing before toggle')
        row.locator('button[data-dg]').click(); pg.wait_for_timeout(200)
        n = pg.locator('[data-row="MQ-3"] .sub').count()
        if n != r['info']['MQ-3']: r['bad'].append(('toggle shows', n))
        pg.evaluate("() => __oot.goRow('MQ-10')"); pg.wait_for_timeout(300)
        if pg.locator('[data-row="MQ-10"] .sub').count(): r['bad'].append('toggle leaked to Dodongo')
        pg.reload(); pg.wait_for_selector(".grp"); pg.evaluate("() => __oot.goRow('MQ-3')"); pg.wait_for_timeout(300)
        if pg.locator('[data-row="MQ-3"] .sub').count() != n: r['bad'].append('toggle not saved')
        pg.locator('[data-row="MQ-3"] button.dghide').click(); pg.wait_for_timeout(200)
        if pg.locator('[data-row="MQ-3"] .sub').count(): r['bad'].append('hide failed')
        if errs: r['bad'].append(errs[:2])
        if r['bad']: print('  FAIL', r['bad'][:10]); F.append(v)
        pg.close()
    b.close()
print('FAILS:', F)
