# OoT Tracker: repository and session rules

This repository (`zhrpo/OOT-Tracker`) is the **permanent source repository** for "Ocarina of Time Tracker: The Adventure Edition"
(owner decision D-1, Session 6). It also holds the pre-release audit.

| Folder | What it is |
|---|---|
| `proj/` | Application source and build (`build.py`), the legacy test scripts (`proj/test*.py`) and scratch tools |
| `out/themed2.html` | The one shipped page, built from `proj/`. Hash must match the value recorded in `audit/NEXT_SESSION.md` unless an approved phase changed the tracker |
| `audit/` | The audit: findings, progress, tests, verification, remediation plan, scope documents, `scripts/` (audit tests and `run_all.py`), `testlogs/` (committed evidence), `fixtures/` (synthetic data only), `lib/oot_env.py` (path helper) |
| `.venv/`, `.scratch/` | Local only, git-ignored (Python environment; screenshots, scratch copies, runner output) |

## Audit governance (permanent; applies to every audit or remediation session)
The owner's original Comprehensive Pre-Release Audit (`audit/MASTER_AUDIT_SPEC.md`) is the ultimate standard for whether the application is ready for public release. Nothing in the remediation plan, any phase or any report supersedes it.

Before doing any work, in this order:
1. Read `audit/README.md` (document hierarchy and reading rules).
2. Read `audit/MASTER_AUDIT_SPEC.md`.
3. Read `audit/APPROVED_REMEDIATION_PLAN.md` (what is authorised, deferred, awaiting approval, prohibited).
4. Read `audit/AUDIT_TRACEABILITY.md` (what has actually been verified).
5. Read the relevant parts of `audit/AUDIT_PROGRESS.md`, `audit/AUDIT_FINDINGS.md`, `audit/AUDIT_VERIFICATION.md`, `audit/AUDIT_TESTS.md` (and `audit/NEXT_SESSION.md`, noting its outdated parts listed in the README).
6. Confirm the current branch, commit and project state (`git branch --show-current`, `git rev-parse HEAD`, `git status`, the remote head).
7. State the exact authorised task before beginning. If it is not in the approved plan or the owner's current instruction, stop and ask.

Order of authority (higher governs; conflicts are recorded in `audit/README.md`, never silently resolved): 1 `MASTER_AUDIT_SPEC.md`; 2 `APPROVED_REMEDIATION_PLAN.md`; 3 `AUDIT_TRACEABILITY.md`; 4 `AUDIT_FINDINGS.md`; 5 `AUDIT_PROGRESS.md`, `AUDIT_VERIFICATION.md`, `AUDIT_TESTS.md`; 6 phase reports (execution records, not substitutes for the master audit).

Keep four things separate: **investigated** (examined), **remediated** (an approved change was made), **verified** (evidence establishes the specific requirement over its whole scope) and **independently verified after remediation** (a separate verification effort, not the implementing session, confirmed it). Reading a file, tracing a function, a narrower or sampled test, a defect found, a fix made or no defect found never makes a requirement Verified. Use only the seven statuses in the matrix; do not invent others.

When work is completed, update the appropriate audit records and the affected `audit/AUDIT_TRACEABILITY.md` rows (evidence, related findings, remaining work, and status only with new evidence), then report.

Never treat completion of an implementation phase as automatic completion of the master audit requirements it touches. Implementation is not verification: a requirement rises in the matrix only after the corrected behaviour has been tested against the relevant scenarios and the evidence is recorded. Never mark a requirement Verified because a fix was made, a test passed, a file was inventoried, a topic was discussed or no defect was found. Never alter `MASTER_AUDIT_SPEC.md` (its integrity hash is in `audit/README.md`).

Two different permissions must not be confused. The master specification makes the **initial investigation strictly read-only**; that restriction still governs all audit examination. The owner's **remediation authorisation** (Session 6 Scope v3, recorded in `audit/APPROVED_REMEDIATION_PLAN.md`) permits only the listed changes, one phase at a time, each started by the owner's explicit approval. Remediation does not end the investigation, and the investigation's read-only rule does not forbid the approved remediation.

## Start of every session
1. Do the audit-governance reading above first. `audit/SESSION_6_IMPLEMENTATION_SCOPE.md` is the long form of the Session 6 decisions.
2. Environment (Windows, tested): Python 3.11 (`"C:\Program Files\Python311\python.exe" -m venv .venv`), `.venv\Scripts\python.exe -m pip install -r requirements.txt`, and an installed Chrome (or set `OOT_CHROME`). Use `PYTHONUTF8=1`. The `python3` command on Windows is the Store stub: do not use it.
3. Build and hash: `cd proj && ..\.venv\Scripts\python.exe build.py`, then check `out/themed2.html` against the recorded hash (`audit/scripts/run_all.py` does this).
4. Run `audit/scripts/run_all.py` before and after any change; record the result.

## Workflow (applies to every change)
- **Never commit or push to `main`.** The ruleset `protect-main` (ID 26902224) requires a pull request, blocks force pushes and branch deletion, requires linear history and has no bypass. Never disable or edit it.
- All work happens on a `fix/*` branch (one phase or one topic per branch). Claude may prepare and open pull requests; **the owner reviews and merges** (squash merge preferred). Claude never merges, never enables auto-merge, never publishes.
- Commit and push only when the owner asks. Never push anything while it contains real player data (see the privacy rules below).
- One phase at a time. The owner's explicit approval starts each phase; stay inside the approved scope and list anything else as a proposal.
- Do not change repository visibility, rulesets, merge settings or other GitHub settings without the owner's explicit approval.
- Do not work in, pull into or reuse the old pre-purge working copy `C:\Users\harpz\Documents\GitHub\OOT-Tracker`, and do not delete `C:\oot-prepurge-backup\` or `C:\oot-purge-work\` unless the owner says so.

## End of every session
Update the audit documents that the work touches, then report. Commit only when asked, on the `fix/*` branch, with a message naming the session or phase.

## Rules (audit rules, kept for everything under `audit/`)
- Production is read-only. Live artifact `573b4659-23ad-4fdc-b76d-0801cdf31f91`: metadata/file list only. Never publish over it, never write to production data, never read the owner's saved progress into tests. **Synthetic data only.**
- Exception (owner Q5, 2026-11-09): a **separate** test artifact (new unique ID, separate database document/namespace) may be published for sync tests only after isolation is demonstrated before any database write (test copy cannot read or write the production save; production metadata recorded before and unchanged after). If isolation cannot be guaranteed, stop. Cross-account isolation stays "unverified" without genuinely independent authenticated accounts. Publishing even a test artifact needs the owner's approval on the day.
- Implement no fixes unless the owner opens an implementation session or phase. Phase 0 (toolchain, runner, repository layout) changes no tracker behaviour.
- Preserve finding IDs (next: see `audit/NEXT_SESSION.md`). Item IDs never renumber. New finding IDs only after owner acknowledgement.
- Every test exits non-zero on failure. `audit/scripts/run_all.py` is the single pass/fail entry point; a script that prints no verdict is "UNCHECKED", never a pass.
- Audit documents under `audit/` stay append-only except for corrections the owner approves.

## Privacy rules (D-25, D-26)
- No real player save, snapshot or progress export may be added to the repository, to a fixture or to a test. Fixtures live only in `audit/fixtures/`, are invented, and carry `"synthetic": true`.
- The privacy guard in `run_all.py` fails the run if a tracked or untracked file looks like a save (a JSON list of 10 or more row ids, a `got` array, a list of 10 or more version-prefixed ids, or a save-like file name outside `audit/`). Do not bypass or weaken it.
- The repository history was purged of two real-progress files on 2026-11-09 (remote `main` `8e5d4bdd7df1aa249cbcddb3d1b83668f7a0d21b`). Never reintroduce them; the offline backup that still holds them stays outside the repository and outside synchronized folders.

## Style
- Keep replies short.
