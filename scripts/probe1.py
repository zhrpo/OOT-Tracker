from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    for v in ('n64','sw2'):
        c=b.new_context(); c.add_init_script("window.__ootNoAsk=true;window.__ootDefVer='%s';"%v); pg=c.new_page()
        pg.goto('file:///home/claude/audit/out/themed2.html#main-'+v); pg.wait_for_selector('.grp')
        print(v, pg.evaluate("""()=>{const o=__oot,M=o.rowMap(); o.clear(); o.tick('MQ-41');
          const childLocked=['KF-1','LLR-3','HP-8','SQ-6'].map(i=>[i, JSON.stringify(o.unmet(M[i]))]);
          const pend=o.pending('MQ-41');
          o.clear(); o.tick('MQ-34'); const a=o.got().filter(k=>/MQ-22$/.test(k)).length;
          o.clear(); o.tick('MQ-30'); const b=o.got().filter(k=>/MQ-22$/.test(k)).length;
          return {childLocked, pendingIncludesMQ22: pend.indexOf('MQ-22')>=0, spiritChildImpliesPrelude:a, wellImpliesPrelude:b};}"""))
        # SQ-27 with locks off then reload
        pg.evaluate("()=>{const o=__oot; o.clear(); o.tick('SQ-27'); localStorage.setItem('oot-tracker-v1', JSON.stringify({got:o.got(),ver:'%s'}));}"%v)
        before=pg.evaluate("()=>__oot.got().filter(k=>/IT-16$/.test(k)).length")
        pg.reload(); pg.wait_for_selector('.grp')
        after=pg.evaluate("()=>__oot.got().filter(k=>/IT-16$/.test(k)).length")
        print(v,'SQ-27 only: hookshot before reload',before,'after reload',after)
        c.close()
    b.close()
