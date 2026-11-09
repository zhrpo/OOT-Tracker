# NEXT_SESSION.md — handoff for Session 5

Written 2026-11-09, at the end of Session 4. A new conversation cannot see earlier chats or their workspaces. Everything needed is in the GitHub repo **`zhrpo/oot-tracker`** (private). From Session 5 on, the repo replaces the handoff zips. Attach it, clone it, and follow `CLAUDE.md`.

## Contents of the repo (top level = the audit folder)
- `NEXT_SESSION.md` (this file), `AUDIT_PROGRESS.md`, `AUDIT_FINDINGS.md`, `AUDIT_TESTS.md`, `AUDIT_VERIFICATION.md`: the source of truth. Read this file first, then the four docs in full.
- `REMEDIATION_PLAN.md` (new in s4): the plan for F-013/F-019/F-020/F-022, F-009 and F-012. Not implemented.
- `DEPENDENCY_MAP.md` / `.json`: Session 2 dependency map.
- `scripts/`: session 2–3 scripts (`graph_check.py`, `test_engine.py`, `test_sync.py`, `net_check.py`, `probe1.py`) and session 4 scripts (`dump_build_state.py`, `build_audit.py`, `build_mutation.py`, `f009_probe.py`, `test_progression_s4.py`, `test_sync_s4.py`).
- `testlogs/`: all results from sessions 1–4.
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

## Open owner decisions (needed before implementation)
- Q3 sync conflict policy ("latest intent per row wins").
- Q4 F-012 cleanup of the four unprefixed defaults.
- Q5 approval to publish a separate test artifact for real-provider sync tests (D1 conditions).
- Q2 (from s1) whether `index.html`/`themed.html` are still wanted.

## Rules that still apply
- No production DB writes.
- Do not read the owner's progress into tests. Use synthetic data only.
- Do not publish anything, and do not modify the live artifact. Exception: only if the owner explicitly approves Q5, publish a *new* test artifact; never the production slug.
- Implement no fixes during audit sessions. Fixes start only when the owner opens an implementation session.
- Preserve finding IDs; next new ID is **F-029**. Item IDs never renumber. DG/TR ids are append-only; DG-1..41 are retired.
- Every test must have a pass/fail result and a nonzero exit code on failure.
- Test harness seeding: guard on "no save exists", not on `sessionStorage` (AUDIT_TESTS.md §7.3, L-3).

## Recommended Session 5 objectives (the owner chooses)
- **Option A — start implementation** (separate implementation session, on a git repository per F-004): follow REMEDIATION_PLAN.md §5.
  1. F-011 + F-009 (data), re-run all suites.
  2. F-012.
  3. Sync redesign with regression suite §1.5.
  4. Real-provider verification (needs Q5).
- **Option B — continue the audit:**
  1. Audit C game data, starting with the 32 F-026 pairs and the Switch 2 overrides in `fix4.py`, with cited version-specific sources.
  2. Audit F UX/accessibility at the eight widths (keyboard, focus, ARIA; `#sync` live region).
  3. Audit G per-script evaluation of the 27 existing tests and a single suite runner (F-002).
  4. Read the remaining data modules in full (`data.py`, `side.py`, `extra.py`, `dungeons.py`, `vers.py`, `vnew.py`).
