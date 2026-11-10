# NEXT_SESSION.md — handoff for Session 6 (written at the end of Session 5, 2026-11-09)

> **Layout change, Session 6 Phase 0 (2026-11-09).** The audit documents, `scripts/`, `testlogs/` and `DEPENDENCY_MAP.*` now live under `audit/`
> (paths in these documents were updated; older sessions' text still says `/home/claude/audit`, which is the old Linux workspace).
> Application source stays in `proj/`; the one shipped page is `out/themed2.html` (the two unshipped pages are no longer built).
> Run everything with `audit/scripts/run_all.py` (F-002). Details and results: `audit/PHASE_0_REPORT.md`.
> Statements below about the repository being private, or about pushing to `main`, are superseded by `CLAUDE.md`
> (the repository is public, `main` is protected, all changes go through pull requests). A full update of this file is a separate, later change.

Written 2026-11-09, at the end of Session 4. A new conversation cannot see earlier chats or their workspaces. Everything needed is in the GitHub repo **`zhrpo/oot-tracker`** (private). From Session 5 on, the repo replaces the handoff zips. Attach it, clone it, and follow `CLAUDE.md`.

## Contents of the repo (top level = the audit folder)
- `NEXT_SESSION.md` (this file), `AUDIT_PROGRESS.md`, `AUDIT_FINDINGS.md`, `AUDIT_TESTS.md`, `AUDIT_VERIFICATION.md`: the source of truth. Read this file first, then the four docs in full.
- `REMEDIATION_PLAN.md` (new in s4): the plan for F-013/F-019/F-020/F-022, F-009 and F-012. Not implemented.
- `DEPENDENCY_MAP.md` / `.json`: Session 2 dependency map.
- `audit/scripts/`: session 2–3 scripts (`graph_check.py`, `test_engine.py`, `test_sync.py`, `net_check.py`, `probe1.py`) and session 4 scripts (`dump_build_state.py`, `build_audit.py`, `build_mutation.py`, `f009_probe.py`, `test_progression_s4.py`, `test_sync_s4.py`).
- `audit/testlogs/`: all results from sessions 1–4.
- `proj/`: the isolated audit copy of the project source. It holds sources only: no images, no `.bak` files, no `__pycache__`, and `check_user.py` is excluded because it embeds a real save (F-006).
- `out/themed2.html`: the audit build, sha256 `d9f96a343e7b0f6182cb5db1d8b8d11bb39595271d0b580bbcdeab557016a9ac`.
  - This equals live artifact `573b4659-23ad-4fdc-b76d-0801cdf31f91`, version `1794245267-84a7`, as of the end of Session 4.

## Setup
1. Clone to `/home/claude/oot-tracker` and run `ln -sfn /home/claude/oot-tracker /home/claude/audit` (the scripts hard-code `/home/claude/audit`; disposable copies go to `/tmp/s4mut`).
2. Rebuild:
   ```
   cd /home/claude/audit/proj
   python3 build.py
   sha256sum ../out/themed2.html
   ```
   The hash must equal the one above. If it differs, the sources changed after Session 4: diff `proj/` before any other work.
3. Requirements: Python 3, Playwright, and Chrome at `/usr/bin/google-chrome`. Network installs may be disabled.
4. Optional, read-only: `get_artifact` / `list_files` on the live slug. Its version or hash only changes if the owner republished.

## State at end of Session 4
- **Sessions 1–4 complete.** Category B (progression engine and requirement compiler) is complete.
- Expected exit codes on unchanged sources:

  | Script | Exit | Result |
  |---|---|---|
  | `build_audit.py` | 0 | 8/8 |
  | `build_mutation.py` | 0 | 7/7 caught by the audit, 5 accepted by the build |
  | `test_progression_s4.py` | 0 | 27/27 |
  | `graph_check.py` | 0 | — |
  | `test_engine.py` | 1 | 44/50 (F-009, F-010, F-011, F-012) |
  | `test_sync.py` | 1 | 8/26 |
  | `test_sync_s4.py` | 1 | 0/6 |

  The exit-1 results are expected while those findings are open.
- **Release-blocking (audit recommendation):**
  - F-013 (High), F-022 (High, new), F-009 (High), F-019 (Medium) and F-012 (Medium, impact extended).
  - F-021 is a release gate: real-provider sync must be verified after the fix.
  - Full ranked register: end of AUDIT_FINDINGS.md.
- Production:
  - Database not read or written in s4. The last known version is 1521 (s3 read). The owner plays, so it may rise; a higher version does not mean the audit wrote to it.
  - Live artifact unchanged.

## Owner decisions (as of end of Session 5)
- Q3, Q4, Q5: **answered** (details in AUDIT_PROGRESS.md "Owner decisions recorded in session 5" and REMEDIATION_PLAN.md §7). Q5 allows a separate test artifact only under the D1 isolation conditions, with a stop if isolation cannot be proved. Not exercised yet.
- Q2: whether `index.html` / `themed.html` are still wanted: still open.
- Owner process: finish the remaining audit areas, then one consolidated remediation plan, then implementation (explicit authorization needed).

## Rules that still apply
- No production DB writes.
- Do not read the owner's progress into tests. Use synthetic data only.
- Do not publish anything, and do not modify the live artifact. Exception: only if the owner explicitly approves Q5, publish a *new* test artifact; never the production slug.
- Implement no fixes during audit sessions. Fixes start only when the owner opens an implementation session.
- Preserve finding IDs; next new ID is **F-046**. Item IDs never renumber. DG/TR ids are append-only; DG-1..41 are retired.
- Every test must have a pass/fail result and a nonzero exit code on failure.
- Test harness seeding: guard on "no save exists", not on `sessionStorage` (AUDIT_TESTS.md §7.3, L-3).

## State at end of Session 5 (final)
- **Sessions 1–5 complete. Session 6 is the implementation session and must not start without the owner's explicit approval.** Findings F-001..F-045; next new ID **F-046**.
- Read `REMEDIATION_PLAN.md` §8 first: confirmed defects with severity, release blockers, dependencies, order, regression tests, owner decisions (§8.6), real-provider items (§8.7), audit limitations (§8.8).
- Release blockers (audit recommendation): F-013, F-022, F-009, F-019, F-012; release gate F-021. Recommended order: Phase 0 runner/repo → 1 F-011+F-009+data batch → 2 F-012 → 3 sync redesign → 4 real-provider test (Q5) → 5 owner publishes.
- **Expected exit codes on unchanged sources** (the Session 4 table still applies to its scripts):

  | Script | Exit | Result |
  |---|---|---|
  | `data_audit_s5.py` | 1 | 7/16 (F-029..F-032 open) |
  | `data_audit_s5b.py` | 1 | open defects F-030/31/32/42 |
  | `data_audit_s5c.py` | 1 | F-045 open |
  | `security_s5.py` | 0 | — |
  | `a11y_s5c.py` | 0 | min contrast 7.58 |
  | `a11y_s5.py`, `a11y_s5b.py` | record only | DOM contrast numbers unreliable |
- **Legacy tests** (`proj/test*.py`): run from `proj/`, WITHOUT `-I` (they `import pwpatch`), serially. 24/26 pass; `test.py` and `test_contrast.py` fail (F-001). Any `-I` result is invalid. Afterwards: `git clean -fq -- 'proj/*.png'`. Unified runner recommended, not built.
- **Not verified (explicit; do not describe as verified):** F-036 (176 dungeon steps, 44 side quests, remaining prices, 19 unmapped Heart Pieces, Switch 2 data; 37 benign token differences were judged, not verified); real screen reader, browser zoom, body-text contrast, day/night filter (F-041); real sync-provider rules, cross-account isolation, host CSP (F-040/F-021).
- **Owner decisions still open:** Q2; F-033 rule; clock mechanism confirmation; Q4 migration rule; Q5 timing; F-042/F-043 handling; F-045/F-029 save-impact release note; F-004 repo location; F-016; F-028 (full list §8.6).
- Q3/Q4/Q5 answered earlier (AUDIT_PROGRESS.md, REMEDIATION_PLAN §7). Q5 not exercised; no test artifact exists.
- Production: untouched in Session 5 (no DB read/write, no publish).
