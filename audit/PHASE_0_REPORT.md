# Session 6, Phase 0 report (2026-11-09)

Scope: toolchain, repository layout, unified runner, stale tests, unshipped pages, player-data files, privacy guard, hash check.
**No tracker behaviour changed.** Phases 1 to 5 were not started. Branch: `fix/phase-0`, one local commit, not pushed (the commit hash is in `git log`; a document cannot contain its own hash).

## Baseline
- Clean clone of the rewritten remote, `main` = `8e5d4bdd7df1aa249cbcddb3d1b83668f7a0d21b` (9 commits), verified before the branch was created.
- 191 tracked files before. The two player-data files were already absent (history purge, V-1 to V-10 passed).

## Changes (191 files before, 196 after)
| Kind | Files |
|---|---|
| Moved byte-identical to `audit/` | 55 (testlogs, `DEPENDENCY_MAP.json`, scripts that needed no change) |
| Unchanged | 55 (`proj/` sources, `out/themed2.html`) |
| Edited | 79: 63 scripts (paths via `audit/lib/oot_env.py`, Chrome location), `proj/build.py` (output folder, LF output, two pages dropped), the 7 audit documents (path references), `CLAUDE.md`, `.gitignore`, repurposed `proj/test.py`, `proj/test_contrast.py`, the default page in 8 tests and 5 screenshot scripts |
| Created | `.gitattributes`, `requirements.txt`, `audit/lib/oot_env.py`, `audit/scripts/run_all.py`, `audit/fixtures/synthetic_progress.json`, `audit/PHASE_0_REPORT.md`, `audit/SESSION_6_IMPLEMENTATION_SCOPE.md`, `audit/PRE_PURGE_CHECKLIST.md` |
| Removed | `out/index.html`, `out/themed.html` |

The two prepared planning documents were copied unchanged from the old working copy (they still describe the pre-restructure layout and contain statements that are now outdated; see Deferred).

## Environment
Windows 11, Python 3.11.0 (`C:\Program Files\Python311`, not the Store stub), venv `.venv` inside the repository (git-ignored), `playwright==1.65.0`, `pillow==13.0.0`, `greenlet==3.5.6` (`requirements.txt` pins the first two). Browser: installed Google Chrome 156.0.8078.80, found automatically (override `OOT_CHROME`). Run with `PYTHONUTF8=1`. No Playwright browser download was needed.

## Build and hash (item 12)
`proj/build.py` reproduces `out/themed2.html` with sha256 `d9f96a343e7b0f6182cb5db1d8b8d11bb39595271d0b580bbcdeab557016a9ac`, equal to the live artifact version `1794245267-84a7`. Windows text mode used to write CRLF (hash `d8d95f40…`); `build.py` now writes LF (`newline="\n"`), which makes the hash identical on every OS. `.gitattributes` enforces LF in the repository and working trees.

## Unshipped pages (item 8, decision D-6)
Dependencies found by repository-wide search before removal:
- Build: `build.py` rendered both pages (`index.html`, `themed.html`; `themed.html` also used `theme.css` and `theme.js`).
- Runtime: none. Nothing in `app.js`, the template, `theme2.*`, `scenes3.*` or `models5_*` mentions either page.
- Tests defaulting to `index.html`: `test.py`, `test_db`, `test_desk`, `test_gate`, `test_resp`, `test_side`, `test_tools`, `test_ui`, `test_ver`. Test using `themed.html`: `test_contrast`. (Ten scripts.) Each of the eight index-default tests was run against `themed2.html` first and passed; their defaults now point to `themed2.html`. `test.py` and `test_contrast.py` were repaired (below).
- Screenshot scripts: `shot_review.py` (index), `shot_rows.py` (index default), `shot_th.py`, `shot_theme.py`, `shot_theme2.py` (themed). Five scripts, repointed to `themed2.html`.
- Sources kept: `theme.js` and `theme.css` stay in `proj/` because `contact.py`, `mk2.py` and `mk2css.py` read them. They are no longer built into anything (dead sources; deferred cleanup).
After the change the build produces only `themed2.html`, with the same hash.

## F-001 and F-002
- F-002: `audit/scripts/run_all.py`. One command; privacy guard first, then build and hash check, then 43 scripts serially (26 legacy, 17 audit). Results: FAIL (exit status or a printed verdict), TIMEOUT, XFAIL (expected failure while a finding is open), XPASS (expected failure now passes: counts as failure), PASS, UNCHECKED (no verdict: not a pass). `--self-test` injects 12 cases (pass, non-zero exit, printed failure with exit 0, below-contrast line, overflow failure, page errors, no verdict, timeout, XFAIL, XPASS, audit exit) plus privacy-guard cases; all classified correctly and the overall exit is 1 when failures are injected.
- F-001: `proj/test.py` rewritten for the shipped page (tick a Skulltula and a Heart in the UI, reload, filters, search, desktop view, no page errors; prints `FAILS:` and exits 1). `proj/test_contrast.py` points to `themed2.html`, loads the harness and exits 1 below 4.5:1. Injected failures in disposable pages (saves disabled; pale text) made both exit 1.

## Runner results on unchanged sources (final run)
`python audit/scripts/run_all.py`: **PASS 25, UNCHECKED 12, XFAIL 6, FAIL 0, TIMEOUT 0, XPASS 0 (total 43), exit status 0.**
- Legacy 26: 19 PASS, 7 UNCHECKED (`test_db`, `test_desk`, `test_resp`, `test_side`, `test_t2`, `test_ui`, `test_ver`: they print only measurements or only a page-error list).
- Audit 17: 6 PASS (`graph_check`, `build_audit` 8/8, `build_mutation` 7 mutations, `test_progression_s4` 27/27, `security_s5`, `a11y_s5c`), 6 XFAIL as documented (`test_engine` 44/50, `test_sync` 8/26, `test_sync_s4` 0/6, `data_audit_s5` 7/16, `data_audit_s5b`, `data_audit_s5c`), 5 UNCHECKED (`a11y_s5`, `a11y_s5b`, `net_check`, `probe1`, `f009_probe`: records only).
Counts equal the Session 5 table. Legacy suite: 24 of 26 passed in Session 5; now all 26 run, 19 give a verdict-based PASS and 7 are reported as unchecked instead of being counted as passes (the 24 earlier passes included those unchecked ones). The runs write evidence into a scratch copy (`OOT_LOGS`), so the committed evidence is unchanged (compared byte for byte).

## Player data and privacy (items 9 and 10)
- `proj/got_old.json` and `proj/mig_final.json` are absent from the working tree and from all history.
- `proj/shot_r3.py` no longer reads a real save; it loads `audit/fixtures/synthetic_progress.json` (10 invented ids, `"synthetic": true`).
- No real save and no production data were accessed during Phase 0.
- Privacy guard (`run_all.py`): fails on a JSON list or `got` array of 10 or more row ids outside a `"synthetic": true` fixture in `audit/fixtures/`; on a single list of 10 or more version-prefixed ids in any text file; on `check_user.py`; on save-like data-file names outside `audit/`. Passes on this tree; self-tested.

## Rules
`CLAUDE.md` rewritten: audit rules kept for `audit/`, implementation-session rules added (fix branches only, no direct push to `main`, owner reviews and merges, squash preferred, ruleset never touched, no old working copy, privacy rules).

## Remaining failures, limitations, deferred
- Expected failures remain: the open findings F-009 to F-013, F-019, F-020, F-022, F-029 to F-032, F-042 to F-045 (Phases 1 to 3).
- 12 scripts are UNCHECKED by construction (no verdict). Making them assert something is a later hygiene item.
- `proj/migrate.py` loads `extra.bak7.py`, which is not in the repository (dead one-off script, path now points into `proj/`).
- Dead sources `theme.js`/`theme.css` (see above). Scratch scripts in `proj/` that write PNGs write to `.scratch/` or, for tests that save in the working directory, to ignored `proj/*.png`.
- Documentation not yet reconciled (separate approved change): `audit/NEXT_SESSION.md` (private repository, push to `main`), `audit/SESSION_6_IMPLEMENTATION_SCOPE.md` v3 and `audit/PRE_PURGE_CHECKLIST.md` (private repo, force-push exception, tag and tag ruleset steps, `scripts/` paths, "merge" method note), `audit/REMEDIATION_PLAN.md`, F-004/F-016 statuses, and the ruleset's `allowed_merge_methods` listing "merge" while merge commits are disabled (owner review item; linear history already blocks them).
- Tested on Windows with Chrome 156 only (limitation L-2).

## Untouched
Remote `main` (`8e5d4bd…`), the live tracker, production data and database, GitHub settings, the ruleset, merge settings, repository visibility and deployment. Nothing was pushed, merged or published. The old working copy and `C:\oot-prepurge-backup\` and `C:\oot-purge-work\` were not deleted (a few helper files were added under `C:\oot-purge-work\p0\`).
