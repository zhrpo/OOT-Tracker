import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Session 5 - audit C (game-data accuracy). Read-only: reads out/themed2.html and a vendored extract of the
OoT Randomizer glitchless logic (testlogs/s5_rando_extract.json). Writes testlogs/data_audit_s5.json.
Exit 0 = all checks pass. Exit 1 = at least one check fails (expected while F-029..F-036 are open).
Usage: python3 data_audit_s5.py [audit_dir]"""
import json, re, sys, os
A = sys.argv[1] if len(sys.argv) > 1 else _env.ROOT  # repository root
html = open(os.path.join(A, 'out/themed2.html')).read()
D = json.loads(re.search(r'<script[^>]*id="data"[^>]*>(.*?)</script>', html, re.S).group(1))
R = json.load(open(_env.LOGS + '/s5_rando_extract.json'))
RL = R['locations']
VERS = ['n64', '3ds', 'sw2']

def res(r, ver):
    if r.get('only') and ver not in r['only']: return None
    o = (r.get('v') or {}).get(ver)
    if o and o.get('hide'): return None
    m = {k: v for k, v in r.items() if k not in ('v', 'only')}
    if o: m.update(o)
    if m.get('subs'): m['subs'] = [s for s in m['subs'] if not s.get('only') or ver in s['only']]
    return m

def table(ver):
    T = {}
    for tab, gs in D['lists'].items():
        for g in gs:
            for r in g['rows']:
                m = res(r, ver)
                if not m: continue
                m['_tab'] = tab; m['_area'] = g['name']; T[m['id']] = m
                for s in m.get('subs') or []:
                    s = dict(s); s['_tab'] = tab; s['_sub'] = m['id']; T.setdefault(s['id'], s)
    return T

def closure(T, rid):
    """ids a player must already hold when every single-option requirement of rid is met (story ancestors and
    what those steps give included). OR clauses are not expanded."""
    seen = set(); todo = []
    def push(i):
        if i not in seen and i in T: seen.add(i); todo.append(i)
    if T[rid].get('age') == 'Adult' and not rid.startswith('MQ-'): push('MQ-17')  # app adds the Master Sword clause to adult rows (reqOf)
    for c in T[rid].get('q') or []:
        if len(c) == 1:
            for i in c[0]: push(i)
    for i in T[rid].get('after') or []: push(i)
    while todo:
        r = T[todo.pop()]
        for i in r.get('after') or []: push(i)
        if r['id'].startswith('MQ-'):
            for i in r.get('gives') or []: push(i)
        for c in r.get('q') or []:
            if len(c) == 1:
                for i in c[0]: push(i)
    return seen

def opts(T, rid):
    return [sorted('+'.join(o) for o in c) for c in (T[rid].get('q') or [])]

GS = {  # tracker id -> randomizer location (N64 normal quest)
 'KF-1':'KF GS Know It All House','KF-2':'KF GS Bean Patch','KF-3':'KF GS House of Twins',
 'LW-1':'LW GS Bean Patch Near Bridge','LW-2':'LW GS Bean Patch Near Theater','LW-3':'LW GS Above Theater','SFM-1':'SFM GS',
 'DT-1':'Deku Tree GS Compass Room','DT-2':'Deku Tree GS Basement Vines','DT-3':'Deku Tree GS Basement Gate','DT-4':'Deku Tree GS Basement Back Room',
 'FT-1':'Forest Temple GS First Room','FT-2':'Forest Temple GS Lobby','FT-3':'Forest Temple GS Raised Island Courtyard','FT-4':'Forest Temple GS Level Island Courtyard','FT-5':'Forest Temple GS Basement',
 'HF-1':'HF GS Near Kak Grotto','HF-2':'HF GS Cow Grotto',
 'LLR-1':'LLR GS Tree','LLR-2':'LLR GS Rain Shed','LLR-3':'LLR GS House Window','LLR-4':'LLR GS Back Wall',
 'MKT-1':'Market GS Guard House','HC-1':'HC GS Tree','HC-2':'HC GS Storms Grotto',
 'KAK-1':'Kak GS Tree','KAK-2':'Kak GS Skulltula House','KAK-3':'Kak GS House Under Construction','KAK-4':'Kak GS Near Gate Guard','KAK-5':'Kak GS Watchtower','KAK-6':'Kak GS Above Impas House',
 'GY-1':'Graveyard GS Bean Patch','GY-2':'Graveyard GS Wall',
 'BW-1':'Bottom of the Well GS West Inner Room','BW-2':'Bottom of the Well GS East Inner Room','BW-3':'Bottom of the Well GS Like Like Cage',
 'ST-1':'Shadow Temple GS Invisible Blades Room','ST-2':'Shadow Temple GS Falling Spikes Room','ST-3':'Shadow Temple GS Single Giant Pot','ST-4':'Shadow Temple GS Near Ship','ST-5':'Shadow Temple GS Triple Giant Pot',
 'DMT-1':'DMT GS Bean Patch','DMT-2':'DMT GS Near Kak','DMT-3':'DMT GS Above Dodongos Cavern','DMT-4':'DMT GS Falling Rocks Path',
 'GC-1':'GC GS Boulder Maze','GC-2':'GC GS Center Platform',
 'DC-1':'Dodongos Cavern GS Vines Above Stairs','DC-2':'Dodongos Cavern GS Side Room Near Lower Lizalfos','DC-3':'Dodongos Cavern GS Back Room','DC-4':'Dodongos Cavern GS Alcove Above Stairs','DC-5':'Dodongos Cavern GS Scarecrow',
 'DMC-1':'DMC GS Crate','DMC-2':'DMC GS Bean Patch',
 'FIRE-1':'Fire Temple GS Song of Time Room','FIRE-2':'Fire Temple GS Boulder Maze','FIRE-3':'Fire Temple GS Scarecrow Climb','FIRE-4':'Fire Temple GS Scarecrow Top','FIRE-5':'Fire Temple GS Boss Key Loop',
 'ZR-1':'ZR GS Tree','ZR-2':'ZR GS Ladder','ZR-3':'ZR GS Near Raised Grottos','ZR-4':'ZR GS Above Bridge','ZD-1':'ZD GS Frozen Waterfall',
 'JB-1':'Jabu Jabus Belly GS Water Switch Room','JB-2':'Jabu Jabus Belly GS Lobby Basement Lower','JB-3':'Jabu Jabus Belly GS Lobby Basement Upper','JB-4':'Jabu Jabus Belly GS Near Boss',
 'ZF-1':'ZF GS Tree','ZF-2':'ZF GS Above the Log','ZF-3':'ZF GS Hidden Cave',
 'IC-1':'Ice Cavern GS Spinning Scythe Room','IC-2':'Ice Cavern GS Heart Piece Room','IC-3':'Ice Cavern GS Push Block Room',
 'LH-1':'LH GS Bean Patch','LH-2':'LH GS Lab Wall','LH-3':'LH GS Small Island','LH-4':'LH GS Lab Crate','LH-5':'LH GS Tree',
 'WT-1':'Water Temple GS Behind Gate','WT-2':'Water Temple GS River','WT-3':'Water Temple GS Falling Platform Room','WT-4':'Water Temple GS Central Pillar','WT-5':'Water Temple GS Near Boss Key Chest',
 'GV-1':'GV GS Small Bridge','GV-2':'GV GS Bean Patch','GV-3':'GV GS Behind Tent','GV-4':'GV GS Pillar',
 'GF-1':'GF GS Top Floor','GF-2':'GF GS Archery Range','HW-1':'Wasteland GS',
 'CL-1':'Colossus GS Bean Patch','CL-2':'Colossus GS Tree','CL-3':'Colossus GS Hill',
 'SP-1':'Spirit Temple GS Metal Fence','SP-2':'Spirit Temple GS Sun on Floor Room','SP-3':'Spirit Temple GS Hall After Sun Block Room','SP-4':'Spirit Temple GS Boulder Room','SP-5':'Spirit Temple GS Lobby',
 'GAN-1':'OGC GS'}
CHILD_REGIONS = ('Deku Tree','Jabu Jabus','Bottom of the Well','Child Spirit')
ADULT_REGIONS = ('Forest Temple','Fire Temple','Water Temple','Shadow Temple','Ice Cavern','Ganons Castle Grounds','Kak Impas Rooftop','GF Roof','GV Fortress Side','ZF Hidden Cave','LH Lab','Spirit Temple Boulder','Spirit Temple Central')
def split_or(rule):
    parts, d, cur = [], 0, ''
    for tok in re.split(r'(\(|\)| or )', rule):
        if tok == '(': d += 1
        elif tok == ')': d -= 1
        if tok == ' or ' and d == 0: parts.append(cur); cur = ''
        else: cur += tok
    parts.append(cur); return parts
def rando_age(name):
    """Age only when EVERY top-level alternative of the rule fixes the same age (or the region is a single-age dungeon)."""
    reg, rule = RL[name]['region'], RL[name]['rule']
    if reg.startswith(('Deku Tree', 'Jabu Jabus', 'Bottom of the Well')): return 'Child'
    ages = set()
    for alt in split_or(rule):
        if 'logic_' in alt and 'is_' not in alt: continue          # trick-only branch, glitchless logic ignores it
        a = 'Child' if re.search(r'is_child|can_plant_bugs|can_bonk', alt) else 'Adult' if 'is_adult' in alt else None
        if a is None: return None
        ages.add(a)
    return ages.pop() if len(ages) == 1 else None

results = []; info = {}
def check(cid, name, ok, detail, finding=None):
    results.append(dict(id=cid, name=name, result='PASS' if ok else 'FAIL', finding=finding, detail=detail))

T = {v: table(v) for v in VERS}

# C1 mapping
ids = [i for i, r in T['n64'].items() if r['_tab'] == 'skull' and '_sub' not in r]
miss = sorted(set(ids) ^ set(GS)); dup = len(set(GS.values())) != len(GS); unk = [n for n in GS.values() if n not in RL]
check('C1', 'every N64 Skulltula row maps to one distinct randomizer location (100)', not miss and not dup and not unk and len(ids) == 100, dict(count=len(ids), unmapped=miss, unknown=unk))

# C2 night tags (n64, 3ds)
bad = []
for v in ('n64', '3ds'):
    for i, n in GS.items():
        rn = 'at_night' in RL[n]['rule']; tn = T[v][i]['time'] == 'Night'
        if rn != tn: bad.append(dict(ver=v, id=i, tracker=T[v][i]['time'], rando=RL[n]['rule']))
check('C2', 'N64/3DS night-only tags equal the randomizer at_night rule for all 100 tokens', not bad, bad)

# C3 age
bad = []; und = []
for v in ('n64', '3ds'):
    for i, n in GS.items():
        ra = rando_age(n); ta = T[v][i]['age']
        if ra is None: und.append(i); continue
        if ta != ra and not (ta == 'Both' and ra in ('Child', 'Adult')): bad.append(dict(ver=v, id=i, tracker=ta, rando=ra, rule=RL[n]['rule'], region=RL[n]['region']))
info['C3_age_not_derivable'] = sorted(set(und))
check('C3', 'N64/3DS age tag agrees with the randomizer rule where the rule fixes an age', not bad, bad)

# C4 per-area counts
want = {'n64': 100, '3ds': 100, 'sw2': 100}
cnt = {v: sum(1 for r in T[v].values() if r['_tab'] == 'skull' and '_sub' not in r) for v in VERS}
hp = {v: sum(1 for r in T[v].values() if r['_tab'] == 'heart' and '_sub' not in r) for v in VERS}
check('C4', '100 tokens and 36 Pieces of Heart in every version', cnt == want and set(hp.values()) == {36}, dict(tokens=cnt, hearts=hp))
QF = {'Child dungeons': (['Great Deku Tree', "Dodongo's Cavern", "Jabu-Jabu's Belly", 'Bottom of the Well'], 16),
      'Kakariko + Graveyard': (['Kakariko Village', 'Kakariko Graveyard'], 8),
      'Field, Town, Castle, Ranch': (['Hyrule Field', 'Hyrule Castle Town', 'Hyrule Castle', 'Lon Lon Ranch', "Ganon's Castle"], 10),
      'Kokiri, Lost Woods, Meadow': (['Kokiri Forest', 'Lost Woods', 'Sacred Forest Meadow'], 7),
      'Death Mountain': (['Death Mountain Trail', 'Goron City', 'Death Mountain Crater'], 8),
      'Zora + Ice Cavern': (["Zora's River", "Zora's Domain", "Zora's Fountain", 'Ice Cavern'], 11),
      'Lake Hylia': (['Lake Hylia'], 5), 'Gerudo + desert': (['Gerudo Valley', 'Gerudo Fortress', 'Haunted Wasteland', 'Desert Colossus'], 10),
      'Adult temples': (['Forest Temple', 'Fire Temple', 'Water Temple', 'Shadow Temple', 'Spirit Temple'], 25)}
got = {k: sum(1 for r in T['sw2'].values() if r['_tab'] == 'skull' and '_sub' not in r and r['_area'] in a) for k, (a, n) in QF.items()}
check('C5', 'Switch 2 token counts per region group equal Questfern\'s Switch 2 list (9 groups)', all(got[k] == QF[k][1] for k in QF), got)

# Curated accuracy expectations. Each is a claim about the game with its source; FAIL = tracker data disagrees.
def has(v, rid, *any_of):
    # explicit only: project policy (audit_notes.md) is that every row lists the tools it truly needs, even when a story step implies them
    flat = {o for cl in opts(T[v], rid) for o in cl for o in o.split('+')}
    return any(a in flat for a in any_of)
EXP = [
 ('D1', 'F-029', 'Light Medallion (IT-63) comes from Rauru right after the Master Sword (MQ-17), not from the Light Arrows step',
  lambda v: 'IT-63' in (T[v]['MQ-17'].get('gives') or []) and 'IT-63' not in (T[v]['MQ-37'].get('gives') or []) and not ({'MQ-31', 'MQ-35'} & closure(T[v], 'IT-63')), VERS,
  'Zelda Dungeon wiki "Light Medallion"/"Medallion" (given by Rauru after the Master Sword); Zelda Wiki "Light Medallion"; tracker MQ-17 reward text says the same'),
 ('D2', 'F-030', 'GAN-1 (arch outside Ganon\'s Castle) does not need the Rainbow Bridge step',
  lambda v: 'MQ-38' not in closure(T[v], 'GAN-1'), VERS, 'randomizer: OGC GS in Ganons Castle Grounds (is_adult); StrategyWiki: Any/Adult/Hookshot; Questfern + Game8 (Switch 2): Adult, Hookshot'),
 ('D3', 'F-031', 'DMT-1 (soil at Dodongo\'s Cavern) needs the boulder cleared: Goron\'s Bracelet or bombs',
  lambda v: has(v, 'DMT-1', 'IT-29', 'IT-35', 'MQ-9', 'MQ-10'), VERS, 'randomizer: DMT GS Bean Patch = bugs and (explosives or strength); tracker sw2 note (Game8); RPG Site sw2 #15'),
 ('D4', 'F-031', 'HF-2 on N64/3DS (web grotto near Gerudo Valley) needs the Boomerang or Hookshot for the token',
  lambda v: has(v, 'HF-2', 'IT-14', 'IT-16', 'IT-17'), ['n64', '3ds'], 'randomizer: HF GS Cow Grotto = fire source and (Hookshot or Boomerang); CyricZ N64 guide; Zelda Dungeon'),
 ('D5', 'F-032', 'ZR-1 on N64/3DS (tree at the river entrance) is before the boulders: no bombs',
  lambda v: 'IT-35' not in {o for cl in opts(T[v], 'ZR-1') for o in cl}, ['n64', '3ds'], 'randomizer: ZR GS Tree in region ZR Front (Hyrule Field -> ZR Front: True)'),
 ('D6', 'F-032', 'GV-3, GF-2 and CL-2 on N64/3DS accept the plain Hookshot',
  lambda v: all('IT-17' not in {o for cl in opts(T[v], r) for o in cl if len(cl) == 1} for r in ('GV-3', 'GF-2', 'CL-2')), ['n64', '3ds'], 'randomizer: GV GS Behind Tent / GF GS Archery Range / Colossus GS Tree = can_use(Hookshot)'),
 ('D8', 'F-031', 'HP-15 (graveyard crate) shortcut needs the Longshot, not the Hookshot',
  lambda v: not any('IT-16' in cl and 'IT-17' not in cl for cl in opts(T[v], 'HP-15')), ['n64', '3ds'], 'randomizer: Graveyard Freestanding PoH = adult and (bean or Longshot)'),
 ('D9', 'F-031', 'HC-2 on N64/3DS requires the Boomerang to fetch the token (child, after the Song of Storms grotto)',
  lambda v: has(v, 'HC-2', 'IT-14'), ['n64', '3ds'], 'randomizer: HC GS Storms Grotto needs Boomerang or Hookshot; FinalBoss N64 guide ("Bombs and Boomerang"); Zelda Central'),
 ('D10', 'F-031', 'IC-3 (push-block room) requires a bottle for Blue Fire, like IC-2',
  lambda v: has(v, 'IC-3', 'IT-48', 'IT-49', 'IT-50', 'IT-51', 'IT-52'), VERS, 'randomizer: Ice Cavern GS Push Block Room is in region Ice Cavern Behind Ice Walls (Blue Fire); Questfern sw2 #71 "Blue Fire, Hookshot"; tracker DG-136 mentions red ice in this room'),
]
for cid, fid, name, fn, vs, src in EXP:
    per = {v: bool(fn(v)) for v in vs}
    check(cid, name, all(per.values()), dict(per_version=per, source=src), fid)


# C7: Heart Piece age tags vs randomizer rules (hand-derived from the glitchless rule text in the extract; 17 rows with a freestanding/graveyard/etc. location)
HPR = {'HP-8': ('LLR Freestanding PoH', {'Child'}), 'HP-17': ('DMT Freestanding PoH', {'Either', 'Both'}), 'HP-19': ('DMC Wall Freestanding PoH', {'Either', 'Both'}),
 'HP-20': ('DMC Volcano Freestanding PoH', {'Both'}), 'HP-21': ('ZR Near Open Grotto Freestanding PoH', {'Either', 'Both'}), 'HP-22': ('ZR Near Domain Freestanding PoH', {'Either', 'Both'}),
 'HP-29': ('ZF Iceberg Freestanding PoH', {'Adult'}), 'HP-28': ('LH Freestanding PoH', {'Both'}), 'HP-32': ('GV Waterfall Freestanding PoH', {'Either', 'Both'}),
 'HP-33': ('GV Crate Freestanding PoH', {'Either', 'Both'}), 'HP-36': ('Colossus Freestanding PoH', {'Both'}), 'HP-9': ('Kak Impas House Freestanding PoH', {'Either', 'Both'}),
 'HP-10': ('Kak Windmill Freestanding PoH', {'Either', 'Both'}), 'HP-13': ('Graveyard Heart Piece Grave Chest', {'Either', 'Both'}), 'HP-16': ('Graveyard Dampe Race Freestanding PoH', {'Adult'}),
 'HP-15': ('Graveyard Freestanding PoH', {'Both'}), 'HP-31': ('Ice Cavern Freestanding PoH', {'Adult'})}
bad = [dict(ver=v, id=i, tracker=T[v][i]['age'], allowed=sorted(a), rule=RL[n]['rule']) for v in ('n64', '3ds') for i, (n, a) in HPR.items() if n in RL and T[v][i]['age'] not in a]
check('C7', 'N64/3DS Heart Piece age tags agree with the randomizer rules (17 rows)', not bad and all(n in RL for n, _ in HPR.values()), bad)

# I1: F-026 pairs, each with a verdict
V = {('KF-1','Slingshot'):'alternative', ('FT-1','Hookshot'):'implied by MQ-18', ('FT-2','Hookshot'):'implied by MQ-18', ('FT-3','Hookshot'):'implied by MQ-18', ('FT-4','Hookshot'):'implied by MQ-18',
 ('KAK-5','Bombchu'):'alternative (untracked item)', ('ST-1','Lens of Truth'):'implied by MQ-30', ('ST-2','Lens of Truth'):'implied by MQ-30',
 ('DC-2','Bomb'):'Bomb Flowers (IT-29) or in-dungeon Bomb Bag', ('DC-3','Bomb'):'Bomb Flowers (IT-29) or in-dungeon Bomb Bag', ('ZR-3','Longshot'):'alternative', ('ZR-4','Longshot'):'alternative',
 ('WT-1','Bomb'):'implied by story (MQ-10)', ('CL-1','Magic Bean'):'tip for CL-3, not a requirement', ('SP-2','Bombchu'):'n64/3ds: place name. sw2: real need, Bombchus untracked (limitation)',
 ('HP-4','Bombchu'):'supplied by the game', ('HP-5','Lens of Truth'):'optional aid (1 in 32 without); design choice', ('HP-11','Longshot'):'alternative', ('HP-11','Hookshot'):'adult alternative to the child Cucco route',
 ('HP-15','Longshot'):'DEFECT F-031: shortcut needs Longshot, requirement accepts Hookshot', ('HP-16','Longshot'):'tip', ('HP-17','Hover Boots'):'alternative', ('HP-17','Magic Bean'):'alternative',
 ('HP-18','Bomb'):'alternative to Bomb Flower', ('HP-21','Boomerang'):'alternative', ('HP-21','Hover Boots'):'alternative', ('HP-22','Boomerang'):'alternative', ('HP-22','Hover Boots'):'alternative',
 ('HP-27','Iron Boots'):'negative mention', ('HP-33','Longshot'):'adult alternative', ('ZR-1','Magic Bean'):'place name', ('HP-10','Hookshot'):'prize of SQ-27, which is required'}
I2 = json.load(open(_env.LOGS + '/build_audit.json'))['info']['I2_text_tool_not_required']
pairs = sorted({(p['id'], p['word']) for p in I2}); nov = [p for p in pairs if p not in V]
info['F026_verdicts'] = [dict(id=i, word=w, verdict=V.get((i, w))) for i, w in pairs]
check('C6', 'every F-026 row/tool pair has a recorded verdict (32)', not nov and len(pairs) == 32, dict(pairs=len(pairs), without_verdict=nov))

# I2: quest/prize pairs with different requirements (information)
diff = []
for v in VERS:
    for l in D['links']:
        if l.get('m') != 'full' or l['r'] not in T[v] or l['q'] not in T[v]: continue
        if l.get('v') and v not in l['v']: continue
        a, b = closure(T[v], l['r']) - {l['q']}, closure(T[v], l['q']) - {l['r']}
        if a - b: diff.append(dict(ver=v, prize=l['r'], quest=l['q'], prize_only=sorted(a - b)))
info['full_link_prize_needs_more_than_quest'] = diff

# I3: documented source disagreements and design choices (information, not failures)
dis = []
for v in ('sw2',):
    for i, r in T[v].items():
        if r['_tab'] in ('skull', 'heart') and '_sub' not in r and re.search(r'disagree|differ|unconfirmed|Unconfirmed|Reported, not verified|unverified', (r.get('note') or '') + (r.get('how') or '')):
            dis.append(i)
info['sw2_rows_with_source_disagreement_text'] = sorted(dis)
info['not_defects'] = {'KAK-1 sw2 night': 'documented night-first policy (vnotes.skull.sw2); N64 randomizer rule is at_night; Game8 says Any for sw2',
  'ST-4 n64/3ds Longshot': 'randomizer: Shadow Temple GS Near Ship = Longshot. sw2 override (Hookshot or Longshot) follows VGC/RPG Site',
  'SP-5 Scarecrow': 'randomizer logic needs no Scarecrow, but Game8, RPG Site and Questfern all list it; left as is (source conflict)'}
out = dict(randomizer=R['source'], results=results, info=info)
json.dump(out, open(_env.LOGS + '/data_audit_s5.json', 'w'), indent=1)
for r in results: print(r['result'], r['id'], r['name'], '' if r['result'] == 'PASS' else json.dumps(r['detail'])[:600])
f = [r for r in results if r['result'] == 'FAIL']
print(f"{len(results) - len(f)}/{len(results)} pass; full-link requirement differences (info): {len(diff)}")
sys.exit(1 if f else 0)
