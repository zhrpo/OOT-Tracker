import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'audit', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
# builds the art preview page: every dropdown scene at N64 / 3DS / Switch 2, plus the tab icons
import json, re
js = open('theme2.js').read()
mark = '/* ---------- public API ---------- */'
assert mark in js
js = js.replace(mark, open('scenes3.js').read() + '\n' + mark)
icons3 = open('models5_toolkit.js').read() + '\n' + open('models5.js').read()
js = js.replace(mark, icons3 + '\n' + mark)
css = open('theme2.css').read() + open('scenes3.css').read()
# the banner timing rules key off the page's console; the preview shows all three at once
extra = '\n'.join(l.replace('body[data-ver="3ds"]', '.cv-3ds').replace('body[data-ver="n64"]', '.cv-n64') for l in css.split('\n') if ('body[data-ver="3ds"] .banner' in l or 'body[data-ver="n64"] .banner' in l))
names = json.load(open(_env.TMP + '/names.json'))
html = '''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ocarina tracker: art preview</title><style>''' + css + extra + '''
body{margin:0;background:#15171c;color:#eef0f4;font:15px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:800px;margin:0 auto;padding:18px 14px 60px}
h1{font-size:22px;margin:4px 0 4px}h2{font-size:18px;margin:34px 0 4px;padding-top:10px;border-top:1px solid #333}
.lead{color:#b9bfca;margin:0 0 10px}
.place{margin:20px 0 6px}.place h3{margin:0;font-size:16px}.place .u{color:#9aa2b0;font-size:12.5px;margin:2px 0 8px}
.trio{display:grid;grid-template-columns:1fr;gap:8px;max-width:760px}
.cell{position:relative;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:5.2}
.cell .banner{position:absolute;inset:0;height:100%}
.cell b{position:absolute;left:8px;top:7px;z-index:2;font:700 11px/1 system-ui;letter-spacing:.06em;text-transform:uppercase;background:rgba(0,0,0,.55);padding:4px 7px;border-radius:6px}
.cell:not(.live) .banner *{animation-play-state:paused}
.icons{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:10px 0}
.icons div{background:#22252c;border-radius:12px;padding:8px 4px 6px;text-align:center;font-size:11.5px;color:#b9bfca}
.icons svg{display:block;width:100%;max-width:84px;height:auto;margin:0 auto 4px}
.icrow h3{font-size:14px;margin:14px 0 0}
.icons div:hover svg{animation:none}
</style></head><body><main>
<h1>Dropdown and tab art: preview</h1>
<p class="lead">Every place, drawn three times: Nintendo 64, 3DS, Switch 2. The pictures move here just as they will in the tracker. Nothing in your tracker has changed yet.</p>
<div id="ic"></div><div id="o"></div></main><script>''' + js + '''
var NAMES = ''' + json.dumps(names) + ''';
var TABN = {main:'Main quest', skull:'Skulltulas', heart:'Hearts', side:'Side quests', items:'Items'};
var used = {}, order = [];
['main','skull','heart','side','items'].forEach(function(t){ NAMES[t].forEach(function(n){ var k = OOTTheme.keyFor(n); if(!used[k]){ used[k] = []; order.push([k, t, n]); } used[k].push(TABN[t] + ': ' + n); }); });
var o = document.getElementById('o'), sec = '', V = [['n64','Nintendo 64'],['3ds','3DS'],['sw2','Switch 2']];
var heads = {main:'Main quest', skull:'Skulltulas and Hearts (the places)', side:'Side quests (by stage of the game)', items:'Items'};
order.forEach(function(e){
  if (heads[e[1]] && sec !== e[1]) { sec = e[1]; var h = document.createElement('h2'); h.textContent = heads[e[1]]; o.appendChild(h); }
  var d = document.createElement('div'); d.className = 'place';
  var seen = {}, u = used[e[0]].filter(function(x){ if(seen[x]) return 0; seen[x]=1; return 1; });
  d.innerHTML = '<h3>' + e[2].replace(/</g,'&lt;') + '</h3><div class="u">' + (u.length > 1 ? 'Used for ' + u.join(' · ') : '') + '</div><div class="trio">' + V.map(function(v){ return '<div class="cell cv-' + v[0] + '" data-k="' + e[2].replace(/"/g,'&quot;') + '" data-v="' + v[0] + '"><b>' + v[1] + '</b></div>'; }).join('') + '</div>';
  o.appendChild(d);
});
var io = new IntersectionObserver(function(es){ es.forEach(function(x){ var c = x.target; if (x.isIntersecting && !c.dataset.done) { c.insertAdjacentHTML('beforeend', OOTTheme.banner(c.dataset.k, c.dataset.v)); c.dataset.done = 1; } c.classList.toggle('live', x.isIntersecting); }); }, { rootMargin: '200px 0px' });
document.querySelectorAll('.cell').forEach(function(c){ io.observe(c); });
var ic = document.getElementById('ic'), ks = [['main','Main'],['skull','Skulls'],['heart','Hearts'],['side','Quests'],['items','Items']];
var h2 = document.createElement('h2'); h2.textContent = 'Tab icons (child art, then adult art)'; ic.appendChild(h2);
V.forEach(function(v){ [0,1].forEach(function(ad){ var w = document.createElement('div'); w.className = 'icrow cv-' + v[0]; w.innerHTML = '<h3>' + v[1] + (ad ? ', adult' : ', child') + '</h3><div class="icons">' + ks.map(function(k){ return '<div class="tic">' + OOTTheme.icon(k[0], v[0], ad) + k[1] + '</div>'; }).join('') + '</div>'; ic.appendChild(w); }); });
</script></body></html>'''
open(_env.OUT + '/preview.html', 'w').write(html)
print(len(html))
