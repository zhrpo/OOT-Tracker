"""Audit session 4 — mutation tests for the requirement compiler's own guards.

Each mutation copies audit/proj to a disposable folder under /tmp/s4mut/<name>, appends a small source mistake to the
copy's fix4.py (the override file), points the copy's output at /tmp/s4mut/<name>/out, and runs its build.py.
Then scripts/build_audit.py runs on the mutated output. audit/proj and audit/out are never touched.

For each mutation the test records: did build.py catch it (non-zero exit)? did build_audit.py catch it?
A mutation PASSES this test only if at least one of the two catches it. "build_caught" = False is the evidence for
"the build accepts this mistake silently".
Exit 1 if any mutation is caught by neither. Writes testlogs/build_mutation.json."""
import json, os, shutil, subprocess, sys

SRC = '/home/claude/audit/proj'
ROOT = '/tmp/s4mut'
AUD = '/home/claude/audit/scripts'

MUT = {
    # a GATE_V entry for an item row: attach() is never called for items, so the override is dropped
    'M1_gatev_on_item_row': 'GATE_V[("sw2", "IT-13")] = ["i_hookshot"]\n',
    # a GATE_V entry whose row id is mistyped: attach() never matches it, so it is dropped
    'M2_gatev_typo_id': 'GATE_V[("sw2", "HF-9")] = ["i_bombs"]\n',
    # an OV text override whose row id is mistyped
    'M3_ov_typo_id': 'ov("HF-9", "sw2", how="mutated")\n',
    # a version key typo in an override
    'M4_ov_version_typo': 'ov("HF-1", "switch2", how="mutated")\n',
    # build reachability ignores link versions: remove the Switch 2 Spin Attack source and make IT-77 unobtainable on sw2
    'M5_link_version_leak': (
        'LINKS[:] = [l for l in LINKS if not (l[0] == "i_spin" and l[1] == "SQ-20")]\n'
        'import extra as _x\n'
        'for _g in list(_x.ITEMS) + list(_x.SONGS):\n'
        '    for _r in _g[2]:\n'
        '        if _r["key"] == "i_spin":\n'
        '            _r.setdefault("v", {}).setdefault("sw2", {})["_req"] = ["i_spin"]\n'),
    # an OV age that BOTH_V overwrites (same pattern as HP-6/HP-7/HP-17 today), on a new row
    'M6_ov_age_overwritten': 'ov("HF-1", "sw2", age="Adult")\nBOTH_V[("sw2", "HF-1")] = "Child first: x. Adult second: y."\n',
    # a requirement token that names nothing
    'M7_unknown_token': 'GATE["KF-1"] = ["i_swrod"]\n',
}

results = []
os.makedirs(ROOT, exist_ok=True)
for name, code in MUT.items():
    d = os.path.join(ROOT, name)
    shutil.rmtree(d, ignore_errors=True)
    shutil.copytree(SRC, os.path.join(d, 'proj'), ignore=shutil.ignore_patterns('research', '*.png', '__pycache__'))
    P = os.path.join(d, 'proj')
    b = open(os.path.join(P, 'build.py')).read().replace('outdir = "/home/claude/audit/out"', 'outdir = "%s/out"' % d)
    assert '%s/out' % d in b
    open(os.path.join(P, 'build.py'), 'w').write(b)
    with open(os.path.join(P, 'fix4.py'), 'a') as f:
        f.write('\n# ---- SESSION 4 MUTATION ' + name + '\n' + code)
    br = subprocess.run([sys.executable, 'build.py'], cwd=P, capture_output=True, text=True)
    build_caught = br.returncode != 0
    audit_caught, audit_fail = None, []
    if not build_caught:
        sj = os.path.join(d, 'state.json')
        subprocess.run([sys.executable, os.path.join(AUD, 'dump_build_state.py'), P, sj], check=True, capture_output=True)
        ar = subprocess.run([sys.executable, os.path.join(AUD, 'build_audit.py'), os.path.join(d, 'out', 'themed2.html'), sj],
                            capture_output=True, text=True)
        audit_fail = [l[:220] for l in ar.stdout.splitlines() if l.startswith('FAIL')]
        i1 = [l for l in ar.stdout.splitlines() if l.startswith('INFO I1')]
        audit_caught = ar.returncode != 0 or (name == 'M6_ov_age_overwritten' and 'HF-1' in ''.join(i1))
        if name == 'M6_ov_age_overwritten':
            audit_fail += i1
    ok = build_caught or bool(audit_caught)
    rec = dict(mutation=name, code=code, build_exit=br.returncode, build_caught=build_caught,
               build_error=(br.stderr.strip().splitlines() or [''])[-1][:240], audit_caught=audit_caught, audit_fail=audit_fail,
               result='PASS' if ok else 'FAIL')
    results.append(rec)
    print(('PASS ' if ok else 'FAIL ') + name + '  build_caught=%s audit_caught=%s %s' % (build_caught, audit_caught, rec['build_error'] if build_caught else ''))
    # the audit copy itself must stay untouched (sanity: the mutated file lives only under /tmp)
    assert 'SESSION 4 MUTATION' not in open(os.path.join(SRC, 'fix4.py')).read()

json.dump(results, open('/home/claude/audit/testlogs/build_mutation.json', 'w'), indent=1)
nf = sum(r['result'] == 'FAIL' for r in results)
print('%d mutations, %d silently accepted by build.py, %d caught by neither' % (len(results), sum(not r['build_caught'] for r in results), nf))
sys.exit(1 if nf else 0)
