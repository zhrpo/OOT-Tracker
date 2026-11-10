"""Unified test runner (finding F-002). One command, one pass/fail exit status.

    python audit/scripts/run_all.py              # privacy guard, build + hash check, then every test
    python audit/scripts/run_all.py --list       # show the manifest
    python audit/scripts/run_all.py --only test_ver,graph_check
    python audit/scripts/run_all.py --fast       # skip tests slower than ~60 s (test_overflow, test_cards, ...)
    python audit/scripts/run_all.py --self-test  # prove the runner itself fails on injected failures

How a result is decided (the legacy scripts mostly print their verdict and exit 0 even on failure):
  FAIL      exit status != 0, or a printed verdict line reports a failure (FAILS: [...] not empty, BELOW 4.5: not empty,
            "failing N" with N > 0, errors: [...] not empty)
  TIMEOUT   the script ran past its timeout (counts as failure)
  XFAIL     the script is on the expected-failure list (an open audit finding) and failed with the recorded exit status (ok)
  XPASS     an expected-failure script passed: the finding may be fixed, update the manifest (counts as failure)
  PASS      exit 0 and at least one positive verdict was printed (or the script is an audit script that exits non-zero by design)
  UNCHECKED exit 0 but the script prints no verdict (or only a page-error list). NOT a pass. Reported, does not fail the run
            unless --strict-unchecked is given.
The runner exits 1 if there is any FAIL, TIMEOUT or XPASS, or if the privacy guard or the build hash check fails.

Everything is run serially, one script at a time, from the right directory, with UTF-8 output. Results are written to
.scratch/run_all_results.json (git-ignored). Audit scripts write their evidence files into a scratch copy of audit/testlogs
(OOT_LOGS), so a run never modifies the committed evidence.
"""
import argparse, hashlib, json, os, re, shutil, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'lib'))
import oot_env as _env  # noqa: E402

ROOT = _env.ROOT
EXPECTED_SHA256 = 'd9f96a343e7b0f6182cb5db1d8b8d11bb39595271d0b580bbcdeab557016a9ac'  # shipped out/themed2.html (live artifact version 1794245267-84a7)

# ---- manifest -------------------------------------------------------------------------------------------------------
# kind: legacy (proj/, run from proj/), audit (audit/scripts/, exit status is the verdict)
# verdict: fails | below | overflow | errors | none | exit
# expect_exit: set only for scripts that fail on purpose while a finding is open
LEGACY = [
    # name, verdict, timeout, note
    ('test', 'fails', 120, 'F-001 repaired in Phase 0'),
    ('test_cards', 'below', 300, ''),
    ('test_contrast', 'below', 120, 'F-001 repaired in Phase 0'),
    ('test_contrast2', 'below', 120, ''),
    ('test_db', 'errors', 120, ''),
    ('test_desk', 'errors', 120, ''),
    ('test_dg', 'fails', 180, ''),
    ('test_final', 'fails', 240, ''),
    ('test_gate', 'fails', 180, ''),
    ('test_overflow', 'overflow', 900, '375 states, about 2 minutes on Linux'),
    ('test_paths', 'fails', 300, ''),
    ('test_play', 'fails', 120, ''),
    ('test_r12', 'fails', 180, ''),
    ('test_r14', 'fails', 180, ''),
    ('test_r3', 'fails', 240, ''),
    ('test_r6', 'fails', 180, ''),
    ('test_r7', 'fails', 180, ''),
    ('test_r8', 'fails', 180, ''),
    ('test_r9', 'fails', 180, ''),
    ('test_resp', 'errors', 120, ''),
    ('test_side', 'errors', 120, ''),
    ('test_t2', 'none', 300, 'prints counts only'),
    ('test_tools', 'fails', 60, ''),
    ('test_two', 'fails', 120, ''),
    ('test_ui', 'errors', 120, ''),
    ('test_ver', 'errors', 120, ''),
]
AUDIT = [
    # name, verdict, timeout, expect_exit, note
    ('graph_check', 'exit', 300, None, ''),
    ('build_audit', 'exit', 300, None, 'B1-B8'),
    ('build_mutation', 'exit', 900, None, '7 mutations'),
    ('test_progression_s4', 'exit', 600, None, 'P1-P5, 27 checks'),
    ('test_engine', 'exit', 900, 1, 'F-009, F-010, F-011, F-012 open (44/50)'),
    ('test_sync', 'exit', 900, 1, 'F-013, F-019, F-020 open (8/26)'),
    ('test_sync_s4', 'exit', 600, 1, 'F-022, F-012 open (0/6)'),
    ('data_audit_s5', 'exit', 300, 1, 'F-029..F-032 open (7/16)'),
    ('data_audit_s5b', 'exit', 300, 1, 'F-030, F-031, F-032, F-042 open'),
    ('data_audit_s5c', 'exit', 300, 1, 'F-045 open'),
    ('security_s5', 'exit', 600, None, 'F-038 observation S3 recorded, exit 0'),
    ('a11y_s5c', 'exit', 600, None, 'tab-label contrast'),
    ('a11y_s5', 'none', 600, None, 'records only'),
    ('a11y_s5b', 'none', 900, None, 'records only'),
    ('net_check', 'none', 300, None, 'prints request/console counts'),
    ('probe1', 'none', 300, None, 'measurement probe'),
    ('f009_probe', 'none', 600, None, 'measurement: builds a disposable copy'),
]
SLOW = {'test_overflow', 'test_cards', 'test_t2', 'build_mutation', 'test_sync', 'test_engine', 'a11y_s5b', 'a11y_s5', 'test_paths', 'f009_probe'}


def manifest():
    m = []
    for name, verdict, to, note in LEGACY:
        m.append(dict(name=name, kind='legacy', path=os.path.join(ROOT, 'proj', name + '.py'), cwd=os.path.join(ROOT, 'proj'), verdict=verdict,
                      timeout=to, expect_exit=None, note=note))
    for name, verdict, to, ee, note in AUDIT:
        m.append(dict(name=name, kind='audit', path=os.path.join(ROOT, 'audit', 'scripts', name + '.py'), cwd=os.path.join(ROOT, 'audit', 'scripts'),
                      verdict=verdict, timeout=to, expect_exit=ee, note=note))
    return m


# ---- verdict parsing --------------------------------------------------------------------------------------------------
EMPTY = {'', '[]', '0', 'none', 'None', '{}', '[ ]'}


def parse_verdict(out, kind):
    """Return ('pass' | 'fail' | 'info' | None, detail). 'info' = a page-error check only (not counted as a pass)."""
    if kind in ('fails', 'below'):
        key = r'^\s*FAILS:' if kind == 'fails' else r'^\s*BELOW 4\.5:'
        vals = [re.sub(key, '', l).strip() for l in out.splitlines() if re.match(key, l)]
        if not vals:
            return None, 'no %s line printed' % ('FAILS' if kind == 'fails' else 'BELOW 4.5')
        bad = [v for v in vals if not all(t in EMPTY for t in v.split())]  # 'FAILS: []', 'BELOW 4.5: 0 []' are both empty
        return ('fail', '; '.join(bad)[:300]) if bad else ('pass', '%d verdict line(s), all empty' % len(vals))
    if kind == 'overflow':
        m = re.findall(r'failing\s+(\d+)', out)
        if not m:
            return None, 'no "failing N" line printed'
        return ('fail', 'failing %s' % m[-1]) if any(int(x) for x in m) else ('pass', 'failing 0')
    if kind == 'errors':
        vals = [re.sub(r'^\s*errors:', '', l).strip() for l in out.splitlines() if re.match(r'^\s*errors:', l)]
        if not vals:
            return None, 'no errors line printed'
        bad = [v for v in vals if not all(t in EMPTY for t in v.split())]
        return ('fail', '; '.join(bad)[:300]) if bad else ('info', 'page errors: none (this is the only check the script makes)')
    return None, 'no verdict line (measurement script)'


def classify(entry, rc, timed_out, out):
    if timed_out:
        return 'TIMEOUT', 'exceeded %ss' % entry['timeout']
    v, detail = parse_verdict(out, entry['verdict'])
    ee = entry.get('expect_exit')
    if ee is not None:
        if rc == ee:
            return 'XFAIL', 'failed as expected (exit %s): %s' % (rc, entry.get('note', ''))
        if rc == 0:
            return 'XPASS', 'expected failure (%s) now passes: update the manifest' % entry.get('note', '')
        return 'FAIL', 'unexpected exit status %s (expected %s)' % (rc, ee)
    if rc != 0:
        return 'FAIL', 'exit status %s' % rc
    if v == 'fail':
        return 'FAIL', 'verdict line reports: ' + detail
    if entry['verdict'] == 'exit':
        return 'PASS', 'exit 0 (audit script; non-zero on failure by design)'
    if v == 'pass':
        return 'PASS', detail
    return 'UNCHECKED', detail


# ---- running ------------------------------------------------------------------------------------------------------------
def run_entry(entry, env):
    t0 = time.time()
    try:
        p = subprocess.run([sys.executable, entry['path']] + entry.get('args', []), cwd=entry['cwd'], env=env, capture_output=True,
                           timeout=entry['timeout'])
        rc, timed_out = p.returncode, False
        out = p.stdout.decode('utf-8', 'replace') + p.stderr.decode('utf-8', 'replace')
    except subprocess.TimeoutExpired as e:
        rc, timed_out = None, True
        out = ((e.stdout or b'').decode('utf-8', 'replace') if isinstance(e.stdout, (bytes, bytearray)) else (e.stdout or ''))
    status, detail = classify(entry, rc, timed_out, out)
    return dict(name=entry['name'], status=status, detail=detail, exit=rc, seconds=round(time.time() - t0, 1), tail=out.strip().splitlines()[-4:])


def child_env(logs_dir):
    env = dict(os.environ)
    env.update(PYTHONUTF8='1', PYTHONIOENCODING='utf-8', OOT_LOGS=logs_dir)
    return env


# ---- privacy guard ------------------------------------------------------------------------------------------------------
ID = re.compile(r'(?:(?:n64|3ds|sw2):)?(?:[A-Z]{1,5}|hs\d+)-?\d+(?:\.\d+)?')
PREFIXED_LIST = re.compile(r"\[(?:\s*['\"](?:n64|3ds|sw2):[A-Za-z]{1,5}-?\d+(?:\.\d+)?['\"]\s*,?){10,}\s*\]")
SAVE_NAMES = re.compile(r'(^|/)(got_[^/]*|mig_[^/]*|[^/]*save[^/]*|[^/]*progress[^/]*)$', re.I)
TEXT_EXT = ('.py', '.js', '.md', '.txt', '.log', '.html', '.json', '.csv')


def tracked_and_untracked(root):
    a = subprocess.run(['git', '-C', root, 'ls-files'], capture_output=True, text=True).stdout.split('\n')
    b = subprocess.run(['git', '-C', root, 'ls-files', '--others', '--exclude-standard'], capture_output=True, text=True).stdout.split('\n')
    return sorted({x for x in a + b if x})


def privacy_findings(root, files=None):
    """Return a list of problems. A real player save must never be committed, and fixtures must say they are synthetic."""
    problems = []
    for rel in (files if files is not None else tracked_and_untracked(root)):
        p = os.path.join(root, rel)
        if not os.path.isfile(p):
            continue
        in_fixtures = rel.startswith('audit/fixtures/')
        base = os.path.basename(rel)
        if base == 'check_user.py':
            problems.append('%s: this script embeds a real save (F-006) and must not be committed' % rel)
        elif SAVE_NAMES.search(rel) and rel.lower().endswith(('.json', '.txt', '.csv', '.log', '.progress', '.sav')) and not in_fixtures and not rel.startswith('audit/'):
            problems.append('%s: data file name looks like a save snapshot' % rel)
        if not rel.lower().endswith(TEXT_EXT):
            continue
        try:
            raw = open(p, 'rb').read()
            text = raw.decode('utf-8', 'replace')
        except OSError:
            continue
        if rel.lower().endswith('.json'):
            try:
                j = json.loads(text)
            except ValueError:
                j = None
            idlist = False
            if isinstance(j, list) and len(j) >= 10 and all(isinstance(x, str) for x in j) and sum(1 for x in j if ID.fullmatch(x)) >= 0.8 * len(j):
                idlist = True
            if isinstance(j, dict) and isinstance(j.get('got'), list) and len(j['got']) >= 10:
                idlist = True
            if idlist and not (in_fixtures and isinstance(j, dict) and j.get('synthetic') is True):
                problems.append('%s: JSON list of 10+ row ids (looks like a player save); fixtures must be in audit/fixtures/ with "synthetic": true' % rel)
            if in_fixtures and not (isinstance(j, dict) and j.get('synthetic') is True):
                problems.append('%s: fixture without "synthetic": true' % rel)
        if not in_fixtures and PREFIXED_LIST.search(text):
            problems.append('%s: a single list of 10+ version-prefixed row ids (looks like a player save)' % rel)
    return problems


def privacy_guard(root):
    probs = privacy_findings(root)
    # self-check of the guard: it must flag a synthetic positive and accept the synthetic fixture
    d = tempfile.mkdtemp(prefix='oot_priv_')
    try:
        os.makedirs(os.path.join(d, 'proj'))
        open(os.path.join(d, 'proj', 'got_x.json'), 'w').write(json.dumps(['sw2:KF-%d' % i for i in range(1, 15)]))
        control = privacy_findings(d, ['proj/got_x.json'])
    finally:
        shutil.rmtree(d, ignore_errors=True)
    if not control:
        probs.append('privacy guard self-check failed: it did not flag a synthetic save-shaped file')
    return probs


# ---- build + hash --------------------------------------------------------------------------------------------------------
def build_and_hash(env):
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'proj', 'build.py')], cwd=os.path.join(ROOT, 'proj'), env=env, capture_output=True)
    if r.returncode != 0:
        return False, 'build.py exit %s: %s' % (r.returncode, r.stderr.decode('utf-8', 'replace')[-300:])
    h = hashlib.sha256(open(os.path.join(_env.OUT, 'themed2.html'), 'rb').read()).hexdigest()
    return h == EXPECTED_SHA256, 'themed2.html sha256 %s %s expected %s' % (h, '==' if h == EXPECTED_SHA256 else '!=', EXPECTED_SHA256)


# ---- self-test -----------------------------------------------------------------------------------------------------------
def self_test():
    d = tempfile.mkdtemp(prefix='oot_runner_selftest_')
    cases = [
        ('ok_with_verdict', "print('FAILS: []')", 'fails', 0, None, 'PASS'),
        ('exit_nonzero', "import sys; print('boom'); sys.exit(3)", 'fails', 0, None, 'FAIL'),
        ('prints_failure_exit_zero', "print(\"FAILS: ['x broke']\")", 'fails', 0, None, 'FAIL'),
        ('prints_below', "print('BELOW 4.5: [1.2]')", 'below', 0, None, 'FAIL'),
        ('below_zero_and_empty', "print('BELOW 4.5: 0 []')", 'below', 0, None, 'PASS'),
        ('overflow_fail', "print('375 states; failing 2')", 'overflow', 0, None, 'FAIL'),
        ('page_errors', "print('errors: [\"TypeError\"]')", 'errors', 0, None, 'FAIL'),
        ('no_verdict', "print('42 rows')", 'none', 0, None, 'UNCHECKED'),
        ('errors_only_empty', "print('errors: []')", 'errors', 0, None, 'UNCHECKED'),
        ('timeout', "import time; time.sleep(30)", 'fails', 0, None, 'TIMEOUT'),
        ('expected_failure', "import sys; sys.exit(1)", 'exit', 1, 1, 'XFAIL'),
        ('expected_failure_now_passes', "print('fine')", 'exit', 0, 1, 'XPASS'),
        ('audit_exit_ok', "print('fine')", 'exit', 0, None, 'PASS'),
    ]
    ok = True
    results = []
    for name, code, verdict, _, ee, want in cases:
        path = os.path.join(d, name + '.py')
        open(path, 'w').write(code)
        entry = dict(name=name, path=path, cwd=d, verdict=verdict, timeout=2 if name == 'timeout' else 30, expect_exit=ee, note='selftest')
        r = run_entry(entry, child_env(d))
        good = r['status'] == want
        ok &= good
        results.append((name, want, r['status'], good))
        print('%-4s %-28s wanted %-9s got %s' % ('ok' if good else 'BAD', name, want, r['status']))
    # the run as a whole must be a failure when any case fails: same rule as main()
    statuses = [r[2] for r in results]
    run_fails = any(s in ('FAIL', 'TIMEOUT', 'XPASS') for s in statuses)
    print('overall: injected failures present -> run would exit %d' % (1 if run_fails else 0))
    # privacy guard self-test on a temp tree
    d2 = tempfile.mkdtemp(prefix='oot_priv_selftest_')
    try:
        os.makedirs(os.path.join(d2, 'audit', 'fixtures')); os.makedirs(os.path.join(d2, 'proj'))
        open(os.path.join(d2, 'audit', 'fixtures', 'good.json'), 'w').write(json.dumps({'synthetic': True, 'got': ['sw2:KF-%d' % i for i in range(1, 15)]}))
        open(os.path.join(d2, 'audit', 'fixtures', 'bad.json'), 'w').write(json.dumps({'got': ['sw2:KF-%d' % i for i in range(1, 15)]}))
        open(os.path.join(d2, 'proj', 'x.json'), 'w').write(json.dumps(['sw2:KF-%d' % i for i in range(1, 15)]))
        open(os.path.join(d2, 'proj', 'y.py'), 'w').write('got = ' + json.dumps(['n64:KF-%d' % i for i in range(1, 15)]))
        open(os.path.join(d2, 'proj', 'got_old.json'), 'w').write('{}')
        flagged = {p.split(':')[0] for p in privacy_findings(d2, ['audit/fixtures/good.json', 'audit/fixtures/bad.json', 'proj/x.json', 'proj/y.py', 'proj/got_old.json'])}
        want = {'audit/fixtures/bad.json', 'proj/x.json', 'proj/y.py', 'proj/got_old.json'}
        pg = flagged == want
        print('%-4s privacy guard flags %s' % ('ok' if pg else 'BAD', sorted(flagged)))
        ok &= pg
    finally:
        shutil.rmtree(d2, ignore_errors=True)
    shutil.rmtree(d, ignore_errors=True)
    print('SELF-TEST', 'PASSED' if ok and run_fails else 'FAILED')
    return 0 if (ok and run_fails) else 1


# ---- main ----------------------------------------------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--only', help='comma-separated test names')
    ap.add_argument('--fast', action='store_true')
    ap.add_argument('--no-build', action='store_true', help='skip the build and hash check (not for release runs)')
    ap.add_argument('--strict-unchecked', action='store_true')
    ap.add_argument('--self-test', action='store_true')
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    m = manifest()
    if a.list:
        for e in m:
            print('%-22s %-7s verdict=%-8s timeout=%-4s expect_exit=%s %s' % (e['name'], e['kind'], e['verdict'], e['timeout'], e['expect_exit'], e['note']))
        return 0
    if a.only:
        want = set(a.only.split(','))
        unknown = want - {e['name'] for e in m}
        if unknown:
            print('unknown test names:', sorted(unknown)); return 2
        m = [e for e in m if e['name'] in want]
    elif a.fast:
        m = [e for e in m if e['name'] not in SLOW]

    failed_pre = False
    print('== privacy guard')
    probs = privacy_guard(ROOT)
    for p in probs:
        print('  PROBLEM', p)
    print('  ' + ('FAIL' if probs else 'PASS') + ' (%d problem(s))' % len(probs))
    failed_pre |= bool(probs)

    logs = os.path.join(_env.SCRATCH, 'logs')
    shutil.rmtree(logs, ignore_errors=True)
    shutil.copytree(os.path.join(ROOT, 'audit', 'testlogs'), logs)  # scratch copy: runs never rewrite the committed evidence
    env = child_env(logs)
    if not a.no_build:
        print('== build and hash check')
        ok, msg = build_and_hash(env)
        print('  ' + ('PASS ' if ok else 'FAIL ') + msg)
        failed_pre |= not ok
        if not ok:
            print('Stopping: the build or its hash is wrong, so every test result would be meaningless.')
            return 1
    results = []
    print('== tests (serial)')
    for e in m:
        r = run_entry(e, env)
        results.append(r)
        print('  %-9s %-22s %6.1fs  %s' % (r['status'], r['name'], r['seconds'], r['detail'][:120]))
    counts = {}
    for r in results:
        counts[r['status']] = counts.get(r['status'], 0) + 1
    bad = [r for r in results if r['status'] in ('FAIL', 'TIMEOUT', 'XPASS')]
    unchecked = [r['name'] for r in results if r['status'] == 'UNCHECKED']
    print('== summary: ' + ', '.join('%s %d' % kv for kv in sorted(counts.items())) + ' (total %d)' % len(results))
    if unchecked:
        print('   UNCHECKED (no verdict, not counted as pass): ' + ', '.join(unchecked))
    if bad:
        print('   FAILING: ' + ', '.join('%s=%s' % (r['name'], r['status']) for r in bad))
    os.makedirs(_env.SCRATCH, exist_ok=True)
    json.dump(dict(results=results, counts=counts, privacy_problems=probs, expected_sha256=EXPECTED_SHA256),
              open(os.path.join(_env.SCRATCH, 'run_all_results.json'), 'w'), indent=1)
    rc = 1 if (bad or failed_pre or (a.strict_unchecked and unchecked)) else 0
    print('exit status:', rc)
    return rc


if __name__ == '__main__':
    sys.exit(main())
