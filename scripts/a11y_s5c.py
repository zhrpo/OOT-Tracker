"""Audit session 5 part 2 - pixel-based contrast of the five tab labels (the DOM-colour probe in a11y_s5b.py cannot see the themed
panels drawn over the buttons, so its contrast numbers are not used). Worst case = ratio of the label colour to the brightest
(light scheme: darkest) of the most common pixel colour in the label box (approximation: the dominant background, not the lightest pixel). Results: testlogs/a11y_s5c.json. Exit 1 if any < 4.5."""
import io, json, sys
from collections import Counter
from PIL import Image
from playwright.sync_api import sync_playwright
def lum(c):
    f=lambda v:(v/255)/12.92 if v/255<=.03928 else ((v/255+.055)/1.055)**2.4
    return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])
def ratio(a,b):
    l1,l2=lum(a),lum(b); return (max(l1,l2)+.05)/(min(l1,l2)+.05)
out={}; bad=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    for ver in ('n64','3ds','sw2'):
        for scheme in ('light','dark'):
            c=b.new_context(viewport={'width':390,'height':900},color_scheme=scheme,device_scale_factor=2); pg=c.new_page(); pg.goto('file:///home/claude/audit/out/themed2.html#skulltulas-'+ver); pg.wait_for_selector('.grp')
            for t in ('main','skull','heart','side','items'):
                for sel_state in (0,):
                    el=pg.locator('#tab-%s .ts'%t)
                    if not el.is_visible():
                        out['%s/%s/%s'%(ver,scheme,t)]='label not visible'; continue
                    col=pg.evaluate("(t)=>getComputedStyle(document.querySelector('#tab-'+t+' .ts')).color",t)
                    fg=tuple(int(x) for x in col[col.index('(')+1:col.index(')')].split(',')[:3])
                    im=Image.open(io.BytesIO(el.screenshot())).convert('RGB'); px=list(im.getdata())  # noqa
                    near=[q for q in px if ratio(q,fg)>1.5]            # pixels clearly not text colour
                    cnt=Counter(near).most_common(1); r=min(ratio(fg,q) for q,_ in cnt) if cnt else None
                    sel=pg.get_attribute('#tab-%s'%t,'aria-selected'); k='%s/%s/%s/%s'%(ver,scheme,t,'selected' if sel=='true' else 'idle')
                    out[k]=round(r,2) if r else None
                    if r is not None and r<4.5: bad.append((k,round(r,2)))
            c.close()
    b.close()
json.dump(out,open('/home/claude/audit/testlogs/a11y_s5c.json','w'),indent=1)
print('states',len(out),'min',min(v for v in out.values() if isinstance(v,float)),'below 4.5:',bad[:8],len(bad)); sys.exit(1 if bad else 0)
