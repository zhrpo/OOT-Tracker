import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Audit session 4 — requirement compiler audit (build.py, gate.py, fix4.py, links.py, era.py).

Static checks on the generated payload in audit/out/themed2.html against the source definitions dumped by
scripts/dump_build_state.py (testlogs/build_state.json). The requirement compiler is re-implemented here
independently (token grammar from gate.py's header) so the build's own clauses()/prune() are not trusted.

Checks (each PASS/FAIL; informational lists never fail):
  B1  every skull/heart/side row: generated q == independent compile of GATE (base) and GATE_V (per version)
  B2  every item row: generated q == independent compile of extra.py req / v._req per version
  B3  every GATE_V and BOTH_V key reaches the generated data for that version (no override silently dropped)
  B4  every leaf id in any requirement has a readable label (LAB, the row's short/name as chipText() uses, Master Sword or GS:)
  B5  every leaf id in a version's requirements exists in that version, unless another option of the clause does (F-017 rule)
  B6  age-step (two-Link) checklists: the child half asks for no adult-only gear when the parent row offers a child option
  B8  every GATE / GATE_V / BOTH / BOTH_V / OV / ONLY key names an existing row and version
  B7  version-aware reachability fixpoint on the generated data (app semantics: link versions, up-links, needs, checklists)
  I1  source conflicts: OV sets an age that BOTH/BOTH_V silently overwrites           (informational)
  I2  text names a tool that is not among the row's requirements, per version          (informational, for audit C)
  I3  time labels per version, and rows whose time differs between versions           (informational)
Exit 1 if any check fails. Writes testlogs/build_audit.json.
Usage: python3 build_audit.py [path/to/themed2.html] [path/to/build_state.json]"""
import json, re, sys

HTML = sys.argv[1] if len(sys.argv) > 1 else _env.OUT + '/themed2.html'
STATE = sys.argv[2] if len(sys.argv) > 2 else _env.LOGS + '/build_state.json'
VERS = ['n64', '3ds', 'sw2']

h = open(HTML, encoding='utf-8').read()
m = re.search(r'<script id="data" type="application/json">(.*?)</script>', h, re.S)
D = json.loads(m.group(1).replace('<\\/', '</').replace('<\\!--', '<!--'))
S = json.load(open(STATE))
K2I, ALIAS, BOTTLE, SA = S['KEY2ID'], S['ALIAS'], S['BOTTLE'], S['STEP_AFTER']
MQ = S['MQ']
ADULT = D['adult']
ROWIDS = set(K2I.values())
for t in ('skull', 'heart', 'side'):
    for g in D['lists'][t]:
        for r in g['rows']:
            ROWIDS.add(r['id'])

RESULTS, INFO = [], {}
def check(name, ok, detail):
    RESULTS.append(dict(check=name, result='PASS' if ok else 'FAIL', detail=detail))
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else '  -> ' + json.dumps(detail)[:600]))

# ---------------------------------------------------------------- independent compiler
def leaf(tok):
    t = ALIAS.get(tok, tok)
    if t.startswith('GS:'):
        return t
    if t in K2I:
        return K2I[t]
    if t in ROWIDS:
        return t
    raise KeyError(tok)

ANC = {}
def anc(k):
    if k not in ANC:
        a = set()
        for p in SA[k]:
            a |= {p} | anc(p)
        ANC[k] = a
    return ANC[k]
ID2KEY = {v: k for k, v in MQ.items()}

def compile_req(req):
    cl = []
    for term in req:
        if isinstance(term, list):
            cl.append([[leaf(x) for x in o.split('+')] for o in term])
        elif term == 'BOTTLE':
            cl.append([[K2I[b]] for b in BOTTLE])
        elif term.startswith('@'):
            k = ALIAS.get(term[1:], term[1:])
            cl += [[[MQ[p]]] for p in SA[k]]
        else:
            cl.append([[leaf(term)]])
    # drop single-step clauses implied by another required single step
    steps = {c[0][0] for c in cl if len(c) == 1 and len(c[0]) == 1 and c[0][0] in ID2KEY}
    implied = {MQ[a] for s in steps for a in anc(ID2KEY[s])}
    cl = [c for c in cl if not (len(c) == 1 and len(c[0]) == 1 and c[0][0] in implied)]
    return canon(cl)

def canon(cl):
    return sorted({json.dumps(sorted(json.dumps(sorted(o)) for o in c)) for c in (cl or [])})

def resolve(r, v):
    if r.get('only') and v not in r['only']:
        return None
    o = (r.get('v') or {}).get(v)
    if o and o.get('hide'):
        return None
    x = {k: y for k, y in r.items() if k not in ('v', 'only')}
    x.update(o or {})
    return x

ROWS = {t: [r for g in D['lists'][t] for r in g['rows']] for t in D['lists']}
BYID = {r['id']: (t, r) for t in ROWS for r in ROWS[t]}

# ---------------------------------------------------------------- B1
bad = []
for t in ('skull', 'heart', 'side'):
    for r in ROWS[t]:
        for v in VERS:
            rv = resolve(r, v)
            if rv is None:
                continue
            src = S['GATE_V'].get(v + '|' + r['id'], S['GATE'][r['id']])
            exp, got = compile_req(src), canon(rv.get('q'))
            if exp != got:
                bad.append(dict(id=r['id'], ver=v, expected=exp, generated=got))
check('B1 skull/heart/side requirements == source (base + per version)', not bad, bad)

# ---------------------------------------------------------------- B2
bad = []
IT = {i['id']: i for i in S['ITEMS']}
for r in ROWS['items']:
    src = IT[r['id']]
    for v in VERS:
        rv = resolve(r, v)
        if rv is None:
            continue
        req = ((src.get('v') or {}).get(v) or {}).get('_req', src['req'])
        exp, got = compile_req(req), canon(rv.get('q'))
        if exp != got:
            bad.append(dict(id=r['id'], ver=v, expected=exp, generated=got))
check('B2 item/song requirements == source (base + per version)', not bad, bad)

# ---------------------------------------------------------------- B3
bad = []
for k in S['GATE_V']:
    v, i = k.split('|')
    t, r = BYID.get(i, (None, None))
    if r is None or t not in ('skull', 'heart', 'side'):
        bad.append(dict(key=k, problem='GATE_V names a row the build never applies GATE_V to', tab=t)); continue
    if 'q' not in ((r.get('v') or {}).get(v) or {}) and compile_req(S['GATE_V'][k]) != canon(r.get('q')):
        bad.append(dict(key=k, problem='override missing from generated row'))
for k, hint in S['BOTH_V'].items():
    v, i = k.split('|')
    t, r = BYID.get(i, (None, None))
    rv = resolve(r, v) if r else None
    if rv is None or rv.get('age') != 'Both' or rv.get('ages') != hint:
        bad.append(dict(key=k, problem='BOTH_V not applied', tab=t))
for i, hint in S['BOTH'].items():
    t, r = BYID.get(i, (None, None))
    if r is None or r.get('age') != 'Both':
        bad.append(dict(key=i, problem='BOTH not applied', tab=t))
check('B3 every GATE_V / BOTH_V / BOTH entry reaches the generated data', not bad, bad)

# ---------------------------------------------------------------- per-version flat view (rows + checklist steps)
def flat(v):
    out = {}
    for t in ROWS:
        for r in ROWS[t]:
            rv = resolve(r, v)
            if rv is None:
                continue
            out[rv['id']] = (t, rv)
            for s in rv.get('subs') or []:
                if not s.get('only') or v in s['only']:
                    out[s['id']] = ('sub:' + rv['id'], s)
    return out

# ---------------------------------------------------------------- B4 / B5
lab_bad, ver_bad = [], []
for v in VERS:
    F = flat(v)
    for i, (t, r) in F.items():
        for c in r.get('q') or []:
            live = [o for o in c if all(x.startswith('GS:') or x in F for x in o)]
            if not live:
                ver_bad.append(dict(ver=v, id=i, clause=c))
            for o in c:
                for x in o:
                    # app chipText(): LAB[id] || row.short || row.name || id  (raw id only if none of these exist)
                    if not (x.startswith('GS:') or x == ADULT or x in D['lab'] or (x in F and (F[x][1].get('short') or F[x][1].get('name')))):
                        lab_bad.append(dict(ver=v, id=i, leaf=x))
check('B4 every requirement leaf has a label', not lab_bad, lab_bad)
check('B5 no requirement clause is made only of rows missing in the version', not ver_bad, ver_bad)

# ---------------------------------------------------------------- B6
AGE = {}
for v in VERS:
    for i, (t, r) in flat(v).items():
        # songs learned as adult can be played by child Link (Bolero, Requiem): only equipment is age-bound
        AGE[(v, i)] = None if (t == 'items' and 'song' in (r.get('kind') or '').lower()) else r.get('age')
b6 = []
for v in VERS:
    F = flat(v)
    for i, (t, r) in F.items():
        if t.startswith('sub:') or r.get('age') != 'Both':
            continue
        for s in r.get('subs') or []:
            if s.get('step') != 1 or s.get('age') != 'Child' or s.get('mir'):
                continue
            for c in s.get('q') or []:
                if all(any(AGE.get((v, x)) == 'Adult' for x in o) for o in c):
                    b6.append(dict(ver=v, row=i, step=s['id'], clause=c, labels=[[D['lab'].get(x, x) for x in o] for o in c]))
check('B6 child half of a two-Link row never needs adult-only gear', not b6, b6)

# ---------------------------------------------------------------- B7 version-aware fixpoint (app semantics)
def fixpoint(v):
    F = flat(v)
    links = [l for l in D['links'] if (not l.get('v') or v in l['v']) and l['r'] in F and l['q'] in F]
    rew = {}
    for l in links:
        rew.setdefault(l['q'], []).append(l)
    done = set()
    def leafok(x):
        if x.startswith('GS:'):
            return sum(1 for i in done if F.get(i, ('',))[0] == 'skull') >= int(x[3:])
        return x in done
    def sat(r):
        cl = list(r.get('q') or [])
        if r.get('age') in ('Adult', 'Both') and r['id'] != ADULT:
            cl.append([[ADULT]])
        return all(any(all(leafok(x) for x in o) for o in c) for c in cl)
    def after_ok(r):
        return all(a in done or a not in F for a in r.get('after') or [])
    changed = True
    while changed:
        changed = False
        for i, (t, r) in F.items():
            if i in done:
                continue
            ok = after_ok(r) if (t == 'main' or 'after' in r) else True
            ok = ok and (t == 'main' or sat(r))
            if ok:
                done.add(i); changed = True
                for g in r.get('gives') or []:
                    done.add(g)
                for l in rew.get(i, []):
                    if l['m'] == 'full' or sat(F[l['r']][1]):
                        done.add(l['r'])
    return sorted(set(F) - done), len(F)
b7 = {}
for v in VERS:
    miss, n = fixpoint(v)
    b7[v] = dict(rows=n, unreachable=miss)
check('B7 version-aware fixpoint: every row and checklist step completable', all(not x['unreachable'] for x in b7.values()), b7)

# ---------------------------------------------------------------- B8 override tables name real rows and versions
allids = set(BYID) | {s_['id'] for t in ROWS for r in ROWS[t] for s_ in (r.get('subs') or [])}
b8 = []
for tbl in ('GATE', 'BOTH', 'OV', 'ONLY'):
    for k in S[tbl]:
        if k not in allids:
            b8.append(dict(table=tbl, key=k))
for tbl in ('GATE_V', 'BOTH_V'):
    for k in S[tbl]:
        v, i = k.split('|')
        if i not in allids or v not in VERS:
            b8.append(dict(table=tbl, key=k))
for k, o in S['OV'].items():
    for v in o:
        if v not in VERS:
            b8.append(dict(table='OV', key=k, ver=v))
check('B8 every override/requirement table key names an existing row and version', not b8, b8)

# ---------------------------------------------------------------- I1 source conflicts
i1 = []
for k, o in S['OV'].items():
    for v, d in o.items():
        if 'age' in d and (v + '|' + k in S['BOTH_V'] or k in S['BOTH']) and d['age'] != 'Both':
            i1.append(dict(id=k, ver=v, ov_age=d['age'], final_age='Both', overwritten_by='BOTH_V' if v + '|' + k in S['BOTH_V'] else 'BOTH'))
INFO['I1_ov_age_overwritten'] = i1

# ---------------------------------------------------------------- I2 tool words in text vs requirements
TOOLS = {'Boomerang': ['IT-14'], 'Hookshot': ['IT-16', 'IT-17'], 'Longshot': ['IT-17'], 'Slingshot': ['IT-12'],
         'Lens of Truth': ['IT-18'], 'Hover Boots': ['IT-11'], 'Iron Boots': ['IT-10'], 'Hammer': ['IT-15'],
         "Din's Fire": ['IT-22'], 'Scarecrow': ['IT-69'], 'Song of Storms': ['IT-70'], 'Bomb': ['IT-35'], 'Bombchu': [],
         'Fairy Bow': ['IT-13'], 'Magic Bean': ['SQ-23']}
i2 = []
for v in VERS:
    for t in ('skull', 'heart'):
        for r in ROWS[t]:
            rv = resolve(r, v)
            if rv is None:
                continue
            txt = (rv.get('how') or '') + ' ' + (rv.get('where') or '')
            leaves = {x for c in rv.get('q') or [] for o in c for x in o}
            for w, ids in TOOLS.items():
                if re.search(r'\b' + re.escape(w), txt) and not (set(ids) & leaves):
                    if w == 'Bomb' and re.search(r'Bomb Flower|Bombchu', txt) and not re.search(r'\bBombs?\b(?! Flower)', txt):
                        continue
                    i2.append(dict(ver=v, id=r['id'], word=w))
INFO['I2_text_tool_not_required'] = i2
INFO['I2_count_by_version'] = {v: sum(1 for x in i2 if x['ver'] == v) for v in VERS}

# ---------------------------------------------------------------- I3 time labels
i3 = {v: {} for v in VERS}
tdiff = []
for t in ROWS:
    for r in ROWS[t]:
        times = {}
        for v in VERS:
            rv = resolve(r, v)
            if rv is None:
                continue
            times[v] = rv.get('time')
            i3[v].setdefault(t, {}).setdefault(rv.get('time'), 0)
            i3[v][t][rv.get('time')] += 1
        if len(set(times.values())) > 1:
            tdiff.append(dict(id=r['id'], tab=t, times=times))
INFO['I3_time_counts'] = i3
INFO['I3_time_differs_by_version'] = tdiff
sub_mixed = [s['id'] for t in ROWS for r in ROWS[t] for s in (r.get('subs') or []) if s.get('time') == 'Mixed']
INFO['I3_checklist_steps_with_Mixed_time'] = sub_mixed

json.dump(dict(results=RESULTS, info=INFO), open(_env.LOGS + '/build_audit.json', 'w'), indent=1)
print('INFO I1 OV age overwritten:', i1)
print('INFO I2 text names tool not required:', INFO['I2_count_by_version'])
print('INFO I3 time differs by version:', tdiff)
print('INFO I3 checklist steps with Mixed time:', sub_mixed)
nf = sum(1 for r in RESULTS if r['result'] == 'FAIL')
print('%d checks, %d pass, %d fail' % (len(RESULTS), len(RESULTS) - nf, nf))
sys.exit(1 if nf else 0)
