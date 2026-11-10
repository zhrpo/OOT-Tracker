import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Session 4 — F-009 impact probe (no fix applied to audit/proj).
Builds a disposable copy (/tmp/s4mut/F009_probe) where the Bottom of the Well step also comes after the Prelude of
Light (main.py: well after=["storms", "prelude"]), then diffs the generated requirements and story ancestors per version
against the shipped build. Output: testlogs/f009_probe.json. Exit 0 (measurement only; exit 1 only if the probe build fails)."""
import json, os, re, shutil, subprocess, sys
D0 = _env.TMP + '/s4mut/F009_probe'
shutil.rmtree(D0, ignore_errors=True)
shutil.copytree(_env.PROJ, D0 + '/proj', ignore=shutil.ignore_patterns('research', '*.png', '__pycache__'))
P = D0 + '/proj'
assert 'OOT_OUT' in open(P + '/build.py').read()  # Phase 0: the copy's output folder is set with OOT_OUT
m = open(P + '/main.py').read()
old = 'after=["storms"], gives=["i_lens"]'
assert m.count(old) == 1
open(P + '/main.py', 'w').write(m.replace(old, 'after=["storms", "prelude"], gives=["i_lens"]'))
r = subprocess.run([sys.executable, 'build.py'], cwd=P, capture_output=True, text=True, env=dict(os.environ, OOT_OUT=D0 + '/out'))
if r.returncode:
    print(r.stderr[-800:]); sys.exit(1)
def load(p):
    h = open(p, encoding='utf-8').read()
    return json.loads(re.search(r'<script id="data" type="application/json">(.*?)</script>', h, re.S).group(1).replace('<\\/', '</').replace('<\\!--', '<!--'))
A, B = load(_env.OUT + '/themed2.html'), load(D0 + '/out/themed2.html')
def view(Dx, v):
    out = {}
    for t in Dx['lists']:
        for g in Dx['lists'][t]:
            for r0 in g['rows']:
                if r0.get('only') and v not in r0['only']: continue
                o = (r0.get('v') or {}).get(v) or {}
                r = dict(r0, **o)
                out[r['id']] = dict(q=r.get('q'), after=r.get('after'), age=r.get('age'), ages=r.get('ages'))
                for s in r.get('subs') or []:
                    out[s['id']] = dict(q=s.get('q'), after=s.get('after'), age=s.get('age'))
    return out
res = {}
for v in ('n64', '3ds', 'sw2'):
    a, b2 = view(A, v), view(B, v)
    res[v] = {i: dict(before=a[i], after=b2[i]) for i in a if a[i] != b2.get(i)}
# story ancestors that newly include MQ-22
def anc(Dx):
    steps = [r for g in Dx['lists']['main'] for r in g['rows']]
    af = {r['id']: r['after'] for r in steps}
    memo = {}
    def go(i):
        if i not in memo:
            s = set()
            for p in af[i]: s |= {p} | go(p)
            memo[i] = s
        return memo[i]
    return {i: go(i) for i in af}
aa, ab = anc(A), anc(B)
newly = sorted((i for i in ab if 'MQ-22' in ab[i] and 'MQ-22' not in aa[i]), key=lambda x: int(x[3:]))
out = dict(changed_rows=res, steps_now_after_prelude=newly, build_stdout=r.stdout.splitlines()[-3:])
json.dump(out, open(_env.LOGS + '/f009_probe.json', 'w'), indent=1)
print('steps that newly require MQ-22:', newly)
for v in res:
    print(v, 'changed rows:', sorted(res[v]))
print('\n'.join(out['build_stdout']))
