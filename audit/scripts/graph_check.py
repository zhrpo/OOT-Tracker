import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Audit session 2: static dependency-graph analysis of the built data, per game version.
Exit code 1 if any check that should never fail does fail. Writes audit/DEPENDENCY_MAP.json + prints a summary.
Reads only the isolated build output (audit/out/themed2.html)."""
import re, json, sys, collections

H = open(_env.OUT + '/themed2.html', encoding='utf-8').read()
D = json.loads(re.search(r'<script[^>]*id="data"[^>]*>(.*?)</script>', H, re.S).group(1))
VERS = [v['k'] for v in D['vers']]
TABS = [t['k'] for t in D['tabs']]
FAIL = []
NOTE = []

def fail(msg): FAIL.append(msg)

# ---- raw rows as the app sees them (BASE), and NODES order (STEPS then SUBS in insertion order) -------------
BASE, SUBS, SUBOF = {}, {}, {}
for t in TABS:
    for g in D['lists'][t]:
        for r in g['rows']:
            if r['id'] in BASE: fail('duplicate row id %s' % r['id'])
            BASE[r['id']] = (t, r, None)
            if r.get('subs'):
                SUBS[r['id']] = r['subs']
                for s in r['subs']:
                    if s['id'] in BASE: fail('duplicate sub id %s' % s['id'])
                    BASE[s['id']] = (t, s, r['id']); SUBOF[s['id']] = r['id']
            for vk, o in (r.get('v') or {}).items():
                if o.get('subs') and r['id'] not in SUBS:
                    SUBS[r['id']] = o['subs']
                    for s in o['subs']:
                        BASE[s['id']] = (t, s, r['id']); SUBOF[s['id']] = r['id']
                elif o.get('subs') and r['id'] in SUBS and o['subs'] is not SUBS[r['id']]:
                    NOTE.append('row %s has per-version subs for %s that the app ignores (only the first list is indexed)' % (r['id'], vk))

STEPS = [r for g in D['lists']['main'] for r in g['rows']]
NODES = [s['id'] for s in STEPS] + [s['id'] for p in SUBS for s in SUBS[p]]
POS = {n: i for i, n in enumerate(NODES)}

# ---- check 1: every 'after' reference exists and comes earlier in NODES (app.js builds ANCS in one pass: a later
#      reference makes Object.keys(undefined) throw at startup) ----------------------------------------------------
ANCS = {}
for n in NODES:
    row = BASE[n][1]
    a = set()
    for p in row.get('after') or []:
        if p not in POS: fail('after-ref %s -> %s does not exist' % (n, p)); continue
        if POS[p] >= POS[n]: fail('after-ref %s -> %s is not earlier in NODES (startup crash)' % (n, p)); continue
        a.add(p); a |= ANCS[p]
    ANCS[n] = a
# cycles are impossible if every ref points strictly earlier; record that fact
print('check 1 (after refs exist, point earlier, no cycles): %s' % ('ok' if not FAIL else 'FAIL'))

# ---- per-version resolution, like resolveRow ---------------------------------------------------------------
def resolve(r, v):
    if r.get('only') and v not in r['only']: return None
    o = (r.get('v') or {}).get(v)
    if o and o.get('hide'): return None
    m = {k: x for k, x in r.items() if k not in ('v', 'only')}
    if o: m.update(o)
    if m.get('subs'): m['subs'] = [s for s in m['subs'] if not s.get('only') or v in s['only']]
    return m

MAP = {}
for v in VERS:
    rows = {}
    for t in TABS:
        for g in D['lists'][t]:
            for r in g['rows']:
                m = resolve(r, v)
                if not m: continue
                rows[r['id']] = (t, m)
                for s in m.get('subs') or []: rows[s['id']] = (t, s)
    MAP[v] = rows

def reqof(r, tab):
    q = list(r.get('q') or [])
    if r.get('age') in ('Adult', 'Both') and r['id'] != D['adult']: q = q + [[[D['adult']]]]
    return q

# ---- check 2: every requirement leaf names a row that exists in that version (else the clause option is dead) --
dead = collections.defaultdict(list)
for v in VERS:
    rows = MAP[v]
    for i, (t, r) in rows.items():
        for c in reqof(r, t):
            live = [o for o in c if all(x.startswith('GS:') or x in rows for x in o)]
            missing = [x for o in c for x in o if not x.startswith('GS:') and x not in rows]
            if missing and not live: fail('%s %s: requirement clause has no live option (missing %s)' % (v, i, sorted(set(missing))))
            elif missing: dead[v].append((i, sorted(set(missing))))
print('check 2 (no clause made entirely of missing rows): %s' % ('ok' if not any('no live option' in f for f in FAIL) else 'FAIL'))

# ---- check 3: reachability fixpoint per version, mirroring the app's notion of 'done' --------------------------
# A row becomes doable when all its clauses are satisfied by the done set (age-change rule BACK ignored: it only delays).
# Doing a row also makes done: its ancestors (ANCS), what it gives, prizes linked to it (full/up), checklist parents.
LINKS = D['links']
def fixpoint(v):
    rows = MAP[v]
    done = set(); order = []
    tok_rows = [i for i, (t, r) in rows.items() if t == 'skull']
    changed = True
    while changed:
        changed = False
        gs = sum(1 for i in tok_rows if i in done)
        for i, (t, r) in rows.items():
            if i in done: continue
            ok = all(any(all((int(x[3:]) <= gs) if x.startswith('GS:') else (x in done) for x in o) for o in c) for c in reqof(r, t))
            after = all(a in done or (a in SUBOF and a not in rows) for a in (r.get('after') or []))
            if t == 'main' or i in SUBOF and BASE[i][0] == 'main':
                ok = after   # story steps and dungeon steps are not locked by requirements, only ordered
            else:
                ok = ok and after
            if not ok: continue
            new = {i} | {a for a in ANCS.get(i, ()) if a in rows}
            for g in r.get('gives') or []:
                if g in rows: new.add(g)
            for l in LINKS:
                if l['q'] == i and (not l.get('v') or v in l['v']) and l['r'] in rows: new.add(l['r'])
            for x in new:
                if x not in done: done.add(x); order.append(x); changed = True
            # a checklist parent is done once all its version steps are
        for p, L in SUBS.items():
            if p in rows and p not in done:
                Lv = [s['id'] for s in L if s['id'] in rows]
                if Lv and all(s in done for s in Lv): done.add(p); order.append(p); changed = True
    never = sorted(set(rows) - done)
    return done, order, never

REACH = {}
for v in VERS:
    done, order, never = fixpoint(v)
    REACH[v] = {'reachable': len(done), 'total': len(MAP[v]), 'never': never}
    if never: fail('%s: %d rows can never be completed: %s' % (v, len(never), never[:20]))
print('check 3 (every row reachable in every version): %s' % ('ok' if not any('never be completed' in f for f in FAIL) else 'FAIL'))

# ---- check 4: requirement leaves that point at story steps the row does not come after (cross-tab story deps) --
# informational: list, per version, rows whose locks depend on story steps (direct) – feeds the dependency map
cross = collections.defaultdict(list)
for v in VERS:
    for i, (t, r) in MAP[v].items():
        if t == 'main': continue
        for c in reqof(r, t):
            for o in c:
                for x in o:
                    if x.startswith('MQ-'): cross[v].append((i, x))

# ---- check 5: checklist steps whose own requirements are weaker than their parent's (Ready could show a step
#      of a parent that is itself locked). Two-Link steps are excluded (by design they unlock per age). -----------
weak = collections.defaultdict(list)
def clause_set(r, t): return {json.dumps(sorted(sorted(o) for o in c)) for c in reqof(r, t)}
for v in VERS:
    for p in SUBS:
        if p not in MAP[v]: continue
        t, pr = MAP[v][p]
        if t == 'main': continue
        for s in pr.get('subs') or []:
            if s.get('step'): continue
            # every parent leaf should be required by the step itself or by one of the step's ancestors
            need = set()
            for c in reqof(pr, t):
                if len(c) == 1: need |= set(c[0])
            have = set()
            chain = [s['id']] + [a for a in ANCS.get(s['id'], ()) if a in MAP[v]]
            for a in chain:
                ta, ra = MAP[v][a]
                for c in reqof(ra, ta):
                    if len(c) == 1: have |= set(c[0])
            gap = sorted(x for x in need - have if not x.startswith('GS:'))
            if gap: weak[v].append((s['id'], p, gap))

# ---- check 6: links point at rows that exist in the versions they apply to ---------------------------------------
for l in LINKS:
    for v in (l.get('v') or VERS):
        if l['r'] not in MAP[v] or l['q'] not in MAP[v]:
            NOTE.append('link %s->%s (%s) has a missing end in %s' % (l['r'], l['q'], l['m'], v))

# ---- write the dependency map -----------------------------------------------------------------------------------
out = {'nodes_order': NODES, 'story_ancestors': {n: sorted(ANCS[n]) for n in NODES},
       'per_version': {}}
for v in VERS:
    pv = {}
    for i, (t, r) in MAP[v].items():
        pv[i] = {'tab': t, 'age': r.get('age'), 'time': r.get('time'), 'requires': reqof(r, t),
                 'after': r.get('after') or [], 'gives': r.get('gives') or [],
                 'parent': SUBOF.get(i), 'linked_prizes': [l['r'] for l in LINKS if l['q'] == i and (not l.get('v') or v in l['v'])],
                 'linked_quests': [l['q'] + ':' + l['m'] for l in LINKS if l['r'] == i and (not l.get('v') or v in l['v'])]}
    out['per_version'][v] = {'rows': pv, 'reachability': REACH[v], 'dead_options': dead[v],
                             'weak_checklist_steps': weak[v], 'story_locks_count': len(cross[v])}
json.dump(out, open(_env.LOGS + '/../DEPENDENCY_MAP.json', 'w'), indent=1)

print('\nper version:')
for v in VERS:
    print(' ', v, 'rows', REACH[v]['total'], 'reachable', REACH[v]['reachable'], 'never', REACH[v]['never'][:10],
          '| dead OR-options', len(dead[v]), '| weak checklist steps', len(weak[v]), '| rows locked by story steps', len(set(i for i, _ in cross[v])))
for v in VERS:
    for w in weak[v][:12]: print('  weak', v, w)
for v in VERS:
    for d in dead[v][:12]: print('  dead-option', v, d)
for n in NOTE: print('  note:', n)
print('\nFAILS:', FAIL)
sys.exit(1 if FAIL else 0)
