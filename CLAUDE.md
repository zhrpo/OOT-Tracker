# OoT Tracker: repository and session rules

This repository (`zhrpo/OOT-Tracker`) is the **permanent source repository** for "Ocarina of Time Tracker: The Adventure Edition"
(owner decision D-1, Session 6). It also holds the pre-release audit.

| Folder | What it is |
|---|---|
| `proj/` | Application source and build (`build.py`), the legacy test scripts (`proj/test*.py`) and scratch tools |
| `out/themed2.html` | The one shipped page, built from `proj/`. Hash must match the value recorded in `audit/NEXT_SESSION.md` unless an approved phase changed the tracker |
| `audit/` | The audit: findings, progress, tests, verification, remediation plan, scope documents, `scripts/` (audit tests and `run_all.py`), `testlogs/` (committed evidence), `fixtures/` (synthetic data only), `lib/oot_env.py` (path helper) |
| `.venv/`, `.scratch/` | Local only, git-ignored (Python environment; screenshots, scratch copies, runner output) |

## Start of every session
1. Read `audit/NEXT_SESSION.md` first, then `audit/AUDIT_PROGRESS.md`, `audit/AUDIT_FINDINGS.md`, `audit/AUDIT_TESTS.md`, `audit/AUDIT_VERIFICATION.md`, and the current scope document (`audit/SESSION_6_IMPLEMENTATION_SCOPE.md`). They are the source of truth; earlier chats are not available.
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
