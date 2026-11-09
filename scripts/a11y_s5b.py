"""Audit session 5 part 2 - accessibility, all tabs and versions (read-only; file:// page; nothing saved).
Per version x tab (main, skull, heart, side, items; dungeons are inside main): all groups expanded, then
 - checkboxes: count, size (box and clickable label), accessible name from the browser accessibility tree (CDP)
 - tab / button / link names, roles; rows' accessible structure
 - text contrast: every visible text node, computed fg vs first opaque ancestor background (WCAG ratio), AA 4.5 (3.0 large)
 - 200 % text size (root font-size 200 %) at 640 and 320 px: horizontal overflow and clipped text
Results: testlogs/a11y_s5b.json. Exit 1 only if the probe cannot run."""
import json
from playwright.sync_api import sync_playwright
URL = 'file:///home/claude/audit/out/themed2.html'
HASH = {'main': 'mainquest', 'skull': 'skulltulas', 'heart': 'heartpieces', 'side': 'sidequests', 'items': 'items'}
JS_CON = r"""()=>{
 const lum=c=>{const a=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]};
 const parse=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
 const over=(f,b)=>({r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a),a:1});
 const bgOf=e=>{let stack=[];for(let x=e;x;x=x.parentElement){const s=getComputedStyle(x);const c=parse(s.backgroundColor);if(s.backgroundImage&&s.backgroundImage!=='none')return null;if(c&&c.a>0){stack.push(c);if(c.a>=1)break}}
   let base={r:255,g:255,b:255,a:1};for(let i=stack.length-1;i>=0;i--)base=over(stack[i],base);return base};
 const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){const t=n.nodeValue.trim();if(!t)continue;const e=n.parentElement;if(!e||e.closest('script,style,[hidden],.hidden'))continue;
  const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)continue;const r=e.getBoundingClientRect();if(r.width<1||r.height<1)continue;
  let fg=parse(s.color);if(!fg)continue;const bg=bgOf(e);if(!bg){out.push({t:t.slice(0,30),skip:'image background'});continue}
  fg=over({...fg,a:fg.a*(+s.opacity||1)},bg);const L1=lum([fg.r,fg.g,fg.b]),L2=lum([bg.r,bg.g,bg.b]);const ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  const px=parseFloat(s.fontSize),bold=parseInt(s.fontWeight)>=700;const large=px>=24||(px>=18.66&&bold);
  out.push({t:t.slice(0,30),ratio:Math.round(ratio*100)/100,need:large?3:4.5,cls:(e.className||e.tagName).toString().slice(0,30)})}
 return out}"""
res = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for ver in ('n64', '3ds', 'sw2'):
        for tab, h in HASH.items():
            for scheme in ('light', 'dark'):
                c = b.new_context(viewport={'width': 390, 'height': 900}, color_scheme=scheme)
                c.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
                pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
                pg.goto('%s#%s-%s' % (URL, h, ver)); pg.wait_for_selector('.grp'); pg.wait_for_timeout(200)
                pg.evaluate("()=>{document.querySelectorAll('button.gh').forEach(b=>{if(b.getAttribute('aria-expanded')==='false')b.click()});document.querySelectorAll('details').forEach(d=>d.open=true)}")
                pg.wait_for_timeout(200)
                k = '%s/%s/%s' % (ver, tab, scheme); r = {'pageErrors': errs}
                r['checkboxes'] = pg.evaluate("""()=>{const c=[...document.querySelectorAll('#list input[type=checkbox]')].filter(e=>e.getBoundingClientRect().width>0);
                   const m=c.map(e=>{const l=e.closest('label')||e.parentElement;const a=l.getBoundingClientRect(),k=e.getBoundingClientRect();return [Math.round(k.width),Math.round(k.height),Math.round(a.width),Math.round(a.height)]});
                   return {n:c.length,minBox:m.length?Math.min(...m.map(x=>Math.min(x[0],x[1]))):null,minLabel:m.length?Math.min(...m.map(x=>Math.min(x[2],x[3]))):null}}""")
                cdp = c.new_cdp_session(pg); cdp.send('Accessibility.enable')
                nodes = cdp.send('Accessibility.getFullAXTree')['nodes']
                cb = [n for n in nodes if n.get('role', {}).get('value') == 'checkbox' and not n.get('ignored')]
                r['axCheckboxes'] = len(cb); r['axCheckboxesUnnamed'] = len([n for n in cb if not (n.get('name', {}).get('value') or '').strip()])
                r['axSampleNames'] = [n['name']['value'][:40] for n in cb[:2] if n.get('name')]
                for role in ('button', 'link', 'tab'):
                    ns = [n for n in nodes if n.get('role', {}).get('value') == role and not n.get('ignored')]
                    r['ax_' + role] = len(ns); r['ax_%s_unnamed' % role] = len([n for n in ns if not (n.get('name', {}).get('value') or '').strip()])
                cons = pg.evaluate(JS_CON); chk = [x for x in cons if 'ratio' in x]
                low = sorted([x for x in chk if x['ratio'] < x['need']], key=lambda x: x['ratio'])
                r['contrast'] = {'texts': len(chk), 'skipped_image_bg': len(cons) - len(chk), 'below': len(low), 'worst': low[:4]}
                out = {}
                for w in (640, 320):
                    pg.set_viewport_size({'width': w, 'height': 900}); pg.evaluate("()=>{document.documentElement.style.fontSize='200%'}"); pg.wait_for_timeout(150)
                    out[w] = pg.evaluate("""()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
                       clipped:[...document.querySelectorAll('button,.tab,.vtab,.an,label')].filter(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return r.width>0&&(s.overflow==='hidden'||s.overflowX==='hidden')&&e.scrollWidth>e.clientWidth+1}).length})""")
                r['text200'] = out; res[k] = r; c.close()
    b.close()
json.dump(res, open('/home/claude/audit/testlogs/a11y_s5b.json', 'w'), indent=1)
print(len(res), 'states written')
