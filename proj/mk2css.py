import re
old = open("theme.css", encoding="utf-8").read()
def cut(s, a, b=None):
    i = s.index(a); j = s.index(b, i) if b else len(s)
    return s[i:j]
n64vars = cut(old, 'body[data-ver="n64"]{', 'body[data-ver="3ds"]{')
n64dark = re.search(r'  body\[data-ver="n64"\]\{--bg:#17140a.*?\n(?=  body\[data-ver="3ds"\])', old, re.S).group(0)
areas = cut(old, '/* ----- area colours ----- */', '/* =============== N64')
n64 = cut(old, '/* =============== N64', '/* =============== 3DS')
tail = cut(old, '/* ----- the three game buttons')
tail = "\n".join(l for l in tail.split("\n") if 'data-ver="3ds"' not in l and 'data-ver="sw2"' not in l)
# the first three lines of the old tail are the section comment, .vtab base and small; keep everything else (n64 button, motion, phone, desktop)
head = '''/* ================= themed layer, edition 2 =================
   Each game wears its own console's interface. N64: chamfered plates and flat facets. 3DS: HOME Menu gloss and square app icons.
   Switch 2: HOME screen with flat white or black, rounded tiles and a colourful selection ring.
   Art detail rises with the hardware: few flat facets, then smooth shaded shapes, then layered light. */
@property --ang{syntax:'<angle>';inherits:false;initial-value:0deg}
body{--on:#fff;--rad:12px;--rad-t:12px 12px 0 0;--r2:12px;--hi:#fff;--lo:#9db6cf;--lo2:#eee;--edge:#ccc;--ring:var(--accent)}
''' + n64vars + '''body[data-ver="3ds"]{
  --bg:#e5ebf1;--card:#ffffff;--ink:#17222d;--mute:#4d5d6d;--line:#bac6d2;--soft:#eef2f6;--accent:#1c74bd;--accent2:#d6e8f8;
  --hi:#ffffff;--lo:#c8d1db;--lo2:#dfe6ed;--edge:#a3afbd;--on:#fff;--rad:14px;--rad-t:14px 14px 0 0;--r2:12px;
  font-family:ui-rounded,"SF Pro Rounded","Hiragino Maru Gothic ProN","Nunito","Segoe UI Variable","Segoe UI",system-ui,sans-serif;
  background-image:linear-gradient(rgba(255,255,255,.95),rgba(255,255,255,0) 300px),radial-gradient(circle,rgba(70,110,150,.12) 1.3px,transparent 1.7px);background-size:auto,16px 16px}
body[data-ver="sw2"]{
  --bg:#ebebeb;--card:#ffffff;--ink:#202020;--mute:#585858;--line:#d3d3d3;--soft:#f3f3f3;--accent:#0a6fa8;--accent2:#def0fa;
  --hi:#ffffff;--lo:#f0f0f0;--on:#fff;--rad:26px;--rad-t:26px 26px 0 0;--r2:18px;
  font-family:"SF Pro Display","Segoe UI Variable Display","Inter","Helvetica Neue",system-ui,sans-serif;background-image:none}
@media (prefers-color-scheme: dark){
''' + n64dark + '''  body[data-ver="3ds"]{--bg:#10161d;--card:#1a232d;--ink:#e7eef5;--mute:#a2b0be;--line:#32404d;--soft:#202b36;--accent:#63b8f2;--accent2:#173149;--hi:#2a3947;--lo:#3a4a5a;--lo2:#1c2630;--edge:#0a0f14;--on:#04121c;
    background-image:linear-gradient(rgba(120,180,240,.12),rgba(0,0,0,0) 300px),radial-gradient(circle,rgba(150,200,255,.06) 1.3px,transparent 1.7px)}
  body[data-ver="sw2"]{--bg:#2b2b2b;--card:#383838;--ink:#f3f3f3;--mute:#bdbdbd;--line:#4f4f4f;--soft:#303030;--accent:#52c8f5;--accent2:#223f4d;--hi:#444;--lo:#363636;--on:#06222d}
}

'''
css = head + areas + n64 + open("t2_3ds.css").read() + open("t2_sw2.css").read() + "\n" + tail + "\n" + open("t2_vtab.css").read() + \
  "\n@media (min-width:1020px){ .rail .vt-rail .vtab{padding:9px 14px;align-items:flex-start} .rail .vt-rail .vtab[data-ver=\"3ds\"]{border-radius:12px} .rail .vt-rail .vtab[data-ver=\"sw2\"]{border-radius:99px} }\n" + \
  open("t2_tabs.css").read()
open("theme2.css", "w", encoding="utf-8").write(css)
print("theme2.css", len(css))
