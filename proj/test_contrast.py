import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
# F-001 (Session 6, Phase 0): this script used to target themed.html (the old theme, no longer shipped) and crashed on a missing .row.
# It now checks the shipped page (themed2.html) with the area-opening harness and exits 1 when any text is below 4.5:1.
# Group names/counts sit on the art and are measured pixel by pixel in test_cards.py. test_contrast2.py is kept unchanged (prints only).
import pwpatch
from playwright.sync_api import sync_playwright
URL = _env.OUT_URL + "/themed2.html"
JS = r"""
() => {
  function parse(c){ const m=c.match(/rgba?\(([^)]+)\)/); if(!m) return null; const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; }
  function over(f,b){ return {r:f.r*f.a+b.r*(1-f.a), g:f.g*f.a+b.g*(1-f.a), b:f.b*f.a+b.b*(1-f.a), a:1}; }
  function lum(c){ const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}; return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b); }
  function ratio(a,b){ const l1=lum(a),l2=lum(b); return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05); }
  const probe=document.createElement('div'); probe.style.cssText='position:absolute;left:-99px;top:0;width:1px;height:1px'; document.body.appendChild(probe);
  function resolveVar(el,name){ probe.style.backgroundColor=''; el.appendChild(probe); probe.style.backgroundColor='var('+name+')'; const c=parse(getComputedStyle(probe).backgroundColor); el.removeChild(probe); return c; }
  function bgOf(el){
    // composite background colours up the tree; a panel's gradient is approximated by its --a2 tint
    const chain=[]; let e=el;
    while(e && e.nodeType===1){ chain.push(e); e=e.parentElement; }
    let base={r:255,g:255,b:255,a:1};
    for(let i=chain.length-1;i>=0;i--){
      const n=chain[i]; const cs=getComputedStyle(n); let c=parse(cs.backgroundColor);
      if(n.classList && n.classList.contains('grp')) c=resolveVar(n,'--a2');
      if(c && c.a>0) base=over(c,base);
    }
    return base;
  }
  const out=[]; const worst={};
  function check(label, el, bgEl){
    if(!el) return;
    const fg=parse(getComputedStyle(el).color); const bg=bgOf(bgEl||el);
    const r=ratio(over(fg,bg),bg);
    const key=label; if(!(key in worst) || r<worst[key].r) worst[key]={r:Math.round(r*100)/100, area:(el.closest('[data-area]')||{dataset:{}}).dataset.area};
  }
  document.querySelectorAll('.grp').forEach(g=>{
    const h2=g.querySelector('h2');
    // group name and count sit on the art: measured pixel by pixel in test_cards.py
    check('group note', g.querySelector('.note'), g);
    const row=g.querySelector('.row');
    if(row){ check('row id', row.querySelector('.id'), row); check('row where/name', row.querySelector('.where, .name'), row); check('row how', row.querySelector('.how, .meta'), row); }
  });
  document.querySelectorAll('.an').forEach(a=>{ check('nav name', a.querySelector('.nm'), a); check('nav count', a.querySelector('.ct'), a); });
  return worst;
}
"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=_env.CHROME, args=["--no-sandbox"])
    low = []
    for scheme in ("light", "dark"):
        ctx = b.new_context(viewport={"width": 1440, "height": 900}, color_scheme=scheme)
        pg = ctx.new_page()
        for ver in ("n64", "3ds", "sw2"):
            for tab in ("mainquest", "skulltulas", "hearts", "sidequests", "items"):
                pg.goto(URL + "#%s/%s" % (tab, ver)); pg.wait_for_selector(".row")
                res = pg.evaluate(JS)
                for k, v in res.items():
                    if v["r"] < 4.5:
                        low.append((scheme, ver, tab, k, v))
                mins = min(v["r"] for v in res.values())
                print(scheme, ver, tab, "min ratio", mins)
        ctx.close()
    print("BELOW 4.5:", low)
    b.close()
import sys
sys.exit(1 if low else 0)
