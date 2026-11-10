import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Audit session 5 - UX/accessibility probes (read-only, file:// page, synthetic state). Results: testlogs/a11y_s5.json
Measures, per version (n64, 3ds, sw2) on the skull tab at 390 px wide: html lang, viewport zoom lock, live region on #sync,
unnamed buttons/inputs, checkbox hit size (<44 px side), duplicate ids, tabs without aria-selected, focus-ring presence,
horizontal overflow at 320/390/768/1280, prefers-reduced-motion rule. Exit 1 only if a probe cannot run; defects are recorded."""
import json, sys
from playwright.sync_api import sync_playwright
URL = _env.OUT_URL + '/themed2.html'
out = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=['--no-sandbox'])
    for ver in ('n64', '3ds', 'sw2'):
        c = b.new_context(viewport={'width': 390, 'height': 800}); c.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto(URL + '#skulltulas-' + ver); pg.wait_for_selector('.grp')
        r = pg.evaluate("""()=>{
          const q=s=>Array.from(document.querySelectorAll(s));
          const name=e=>(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.textContent||e.title||'').trim();
          const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
          const btn=q('button').filter(vis).filter(e=>!name(e));
          const inp=q('input').filter(e=>e.type!=='hidden').filter(e=>!(e.labels&&e.labels.length)&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby'));
          const cbs=q('input[type=checkbox]').filter(vis);
          const small=cbs.filter(e=>{const l=e.closest('label')||e;const r=l.getBoundingClientRect();return Math.min(r.width,r.height)<44});
          const ids={};q('[id]').forEach(e=>ids[e.id]=(ids[e.id]||0)+1);
          const sync=document.getElementById('sync');
          const tabs=q('[role=tab]');
          return {lang:document.documentElement.lang,viewport:(document.querySelector('meta[name=viewport]')||{}).content,
            syncLive:sync?(sync.getAttribute('aria-live')||(sync.closest('[aria-live],[role=status]')?'ancestor':null)):'missing',
            unnamedButtons:btn.length,unlabelledInputs:inp.length,checkboxes:cbs.length,smallHitTargets:small.length,
            duplicateIds:Object.keys(ids).filter(k=>ids[k]>1),tabs:tabs.length,tabsNoSelected:tabs.filter(t=>!t.hasAttribute('aria-selected')).length,
            tablist:q('[role=tablist]').length,h1:q('h1').length,landmarks:q('main,nav,header,[role=main],[role=navigation]').length,
            reducedMotionRule:Array.from(document.styleSheets).some(s=>{try{return Array.from(s.cssRules).some(r=>r.conditionText&&r.conditionText.includes('prefers-reduced-motion'))}catch(e){return false}}),
            focusOutlineNone:Array.from(document.styleSheets).reduce((n,s)=>{try{return n+Array.from(s.cssRules).filter(r=>r.style&&/outline:\\s*(none|0)/.test(r.cssText)).length}catch(e){return n}},0),
            focusVisibleRules:Array.from(document.styleSheets).reduce((n,s)=>{try{return n+Array.from(s.cssRules).filter(r=>(r.selectorText||'').includes('focus-visible')).length}catch(e){return n}},0)}}""")
        ov = {}
        for w in (320, 390, 768, 1280):
            pg.set_viewport_size({'width': w, 'height': 800}); pg.wait_for_timeout(150)
            ov[w] = pg.evaluate("()=>document.documentElement.scrollWidth-document.documentElement.clientWidth")
        r['overflowPx'] = ov; r['pageErrors'] = errs
        # keyboard: Tab through 25 stops, record whether the focused element shows an outline/box-shadow and has a name
        pg.set_viewport_size({'width': 390, 'height': 800}); pg.keyboard.press('Tab'); stops = []
        for i in range(25):
            pg.keyboard.press('Tab')
            stops.append(pg.evaluate("""()=>{const e=document.activeElement;if(!e||e===document.body)return null;const s=getComputedStyle(e);
              return {tag:e.tagName,name:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30),ring:(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0)||s.boxShadow!=='none'}}"""))
        r['tabStops'] = len([s for s in stops if s]); r['tabStopsWithoutRing'] = len([s for s in stops if s and not s['ring']])
        out[ver] = r; print(ver, json.dumps(r)[:900]); c.close()
    b.close()
json.dump(out, open(_env.LOGS + '/a11y_s5.json', 'w'), indent=1)
