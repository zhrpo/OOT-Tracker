import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'lib')); import oot_env as _env  # Phase 0: repo-relative paths
"""Session 4: run <proj>/build.py (default audit/proj) unchanged (via runpy) and dump its intermediate structures to testlogs/build_state.json.
build.py writes the same deterministic outputs to audit/out (sha256 is re-checked by the caller)."""
import runpy, json, sys, io, contextlib, os
P = sys.argv[1] if len(sys.argv) > 1 else _env.PROJ
OUTJ = sys.argv[2] if len(sys.argv) > 2 else _env.LOGS + '/build_state.json'
sys.path.insert(0, P)
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    g = runpy.run_path(os.path.join(P, 'build.py'), run_name='build')
import gate, links, vers, main, extra
# pristine (pre-fix4) copies are not recoverable after import: fix4 mutates in place. Re-read pristine by re-exec of gate/links source.
pristine = {}
for mod in ('gate', 'links'):
    ns = {}
    exec(compile(open(os.path.join(P, mod + '.py')).read(), mod, 'exec'), ns)
    pristine[mod] = {k: ns[k] for k in ('GATE', 'GATE_V', 'BOTH', 'BOTH_V', 'LINKS', 'ALIAS', 'BOTTLE', 'ADULT') if k in ns}
def j(x):
    if isinstance(x, dict):
        return {('|'.join(k) if isinstance(k, tuple) else k): j(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [j(v) for v in x]
    return x
out = dict(
    KEY2ID=g['KEY2ID'], STEP_AFTER=g['STEP_AFTER'], MQ=g['MQ'], ALIAS=gate.ALIAS, BOTTLE=gate.BOTTLE, ADULT=gate.ADULT,
    GATE=j(gate.GATE), GATE_V=j(gate.GATE_V), BOTH=j(links.BOTH), BOTH_V=j(links.BOTH_V), LINKS_FINAL=j(g['LINKS']),
    OV=j(vers.OV), ONLY=j(vers.ONLY), ERA_ROWS=sorted(g['ERA_ROWS']), AGESTEP_ROWS=g['AGESTEP_ROWS'],
    ERA={'|'.join(k): v for k, v in g['ERA'].items()},
    ITEMS=[dict(key=r['key'], id=g['KEY2ID'][r['key']], name=r['name'], age=r['age'], time=r['time'], req=r['req'], v=r.get('v'), only=r.get('only')) for r in g['ITEM_ROWS']],
    STEPS=[dict(key=s['key'], id=g['MQ'][s['key']], after=s['after'], gives=s['gives'], needs=s.get('needs'), age=s['age'], v=s.get('v')) for s in g['STEPS']],
    pristine=j(pristine), stdout=buf.getvalue())
json.dump(out, open(OUTJ, 'w'), indent=1, default=str)
print('dumped', len(out['KEY2ID']), 'keys')
