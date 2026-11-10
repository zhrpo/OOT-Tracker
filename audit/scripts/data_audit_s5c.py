import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Session 5 part 2 - audit C, dungeon walkthrough steps (DG-42..DG-221), INTERNAL consistency only (this is NOT a source check).
For every DG step and every version: each tool named in the step's own text must already be held by the time the step is reached, i.e. its item row
must be in the step's closure (story ancestors + what they give, data_audit_s5.closure) or in the step's own requirements. Words checked:
Slingshot, Bow, Boomerang, Hammer, Hookshot (Longshot also counts), Longshot, Lens of Truth, Din's Fire, Fire/Ice/Light Arrows, Iron/Hover Boots, Mirror Shield,
Goron/Zora Tunic, Silver/Golden Gauntlets. Output testlogs/data_audit_s5c.json. Exit 1 if any hit is not in the reviewed list."""
import json, re, sys, os
A = _env.ROOT  # repository root
sys.argv = ['x', A]
exec(open(A + '/audit/scripts/data_audit_s5.py').read().split('def check(')[0])
W = [('Slingshot', 'IT-12'), ('Fairy Bow|\\bBow\\b', 'IT-13'), ('Boomerang', 'IT-14'), ('Megaton Hammer|\\bHammer\\b', 'IT-15'), ('Hookshot', 'IT-16'), ('Longshot', 'IT-17'),
     ('Lens of Truth|\\bLens\\b', 'IT-18'), ("Din.s Fire", 'IT-22'), ('Fire Arrow', 'IT-26'), ('Ice Arrow', 'IT-27'), ('Light Arrow', 'IT-28'), ('Iron Boots', 'IT-10'),
     ('Hover Boots', 'IT-11'), ('Mirror Shield', 'IT-7'), ('Goron Tunic', 'IT-8'), ('Zora Tunic', 'IT-9'), ('Silver Gauntlets', 'IT-30'), ('Golden Gauntlets', 'IT-31')]
hits = {}; nrows = {}
for v in VERS:
    T = table(v); nrows[v] = 0
    for k in sorted((k for k in T if k.startswith('DG-')), key=lambda x: int(x[3:])):
        nrows[v] += 1; r = T[k]
        txt = ' '.join([r.get('name') or '', r.get('start') or '', r.get('reward') or ''] + list(r.get('guide') or []) + [r.get('v') if isinstance(r.get('v'), str) else ''])
        held = closure(T, k) | {i for c in (r.get('q') or []) for o in c for i in o}
        # an item handed over by an earlier step of the same dungeon (its name or reward text names the item) is held from then on
        for a in list(held | {k}):
            if a.startswith('DG-') and a in T:
                rw = ' '.join([T[a].get('name') or '', T[a].get('reward') or ''])
                for pat, iid in W:
                    if re.search(pat, rw): held.add(iid)
        if 'IT-17' in held: held.add('IT-16')
        # items an item row hands over come from ancestors that are MQ steps; also treat the parent dungeon step's own 'gives' as not yet held
        for pat, iid in W:
            if re.search(pat, txt) and iid not in held and iid in T:
                if iid == 'IT-16' and re.search('Longshot', txt) and not re.search('Hookshot', txt): continue
                hits.setdefault(k, {}).setdefault('items', set()).add(iid); hits[k].setdefault('vers', set()).add(v); hits[k]['dungeon'] = r.get('_sub')
                hits[k]['text'] = txt[:160]
out = {k: {'items': sorted(v['items']), 'vers': sorted(v['vers']), 'parent': v['dungeon'], 'text': v['text']} for k, v in hits.items()}
json.dump({'rows_checked': nrows, 'hits': out}, open(_env.LOGS + '/data_audit_s5c.json', 'w'), indent=1)
REV = json.load(open(_env.LOGS + '/data_audit_s5c_reviewed.json')) if os.path.exists(_env.LOGS + '/data_audit_s5c_reviewed.json') else {}
print('rows checked', nrows, '| steps naming a tool not yet held:', len(out))
for k, v in sorted(out.items(), key=lambda x: int(x[0][3:])): print(k, v['parent'], v['items'], v['vers'], '|', v['text'][:110])
new = sorted(set(out) - set(REV)); dfc = sorted(k for k in out if REV.get(k, {}).get('class') == 'defect')
print('unreviewed:', new, '| open defect steps:', dfc); sys.exit(1 if (new or dfc) else 0)   # exit 1 while a confirmed defect is open
