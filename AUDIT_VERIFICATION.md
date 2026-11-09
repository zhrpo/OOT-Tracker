# Game-data verification matrix

Status values: Verified (independent, version-specific source) · Verified-other-version (source covers a different version only) · Conflicting (sources disagree) · Incorrect · Unverified.
Developer research notes (`proj/research/`, `audit_notes.md`) and earlier corrections are **not** counted as independent verification; every entry must be re-checked against a cited source in this document.

## Version identity (to establish first — session 2+)
| Version | Identity to confirm | Status |
|---|---|---|
| N64 | The Legend of Zelda: Ocarina of Time (1998), normal quest | Unverified |
| 3DS | Ocarina of Time 3D (2011), normal quest (Master Quest excluded by the tracker) | Unverified |
| Switch 2 | Ocarina of Time for Nintendo Switch 2, released 2026-11-05 | Unverified |

## Coverage (session 1)
| Category | Entries per version | Verified | Verified-other-version | Conflicting | Incorrect | Unverified |
|---|---|---|---|---|---|---|
| Story steps | 40 | 0 | 0 | 0 | 0 | 40 ×3 |
| Gold Skulltulas | 100 | 0 | 0 | 0 | 0 | 100 ×3 |
| Pieces of Heart | 36 (+1 sw2) | 0 | 0 | 0 | 0 | all |
| Side quests | 44 (43 n64/3ds) | 0 | 0 | 0 | 0 | all |
| Items/songs | 77 (76 n64/3ds) | 0 | 0 | 0 | 0 | all |
| Walkthrough steps | 180 | 0 | 0 | 0 | 0 | all |
| Sub-checklists (masks, Biggoron, House of Skulltula) | 27 | 0 | 0 | 0 | 0 | all |

No entries have been verified yet in this audit. Nothing here is a pass.

## Entry records
(none yet)

---
## Application behavior verification (session 2)

Evidence ids refer to `testlogs/engine_results.json` and `scripts/graph_check.py`.

| Behavior | Status | Evidence | Limits |
|---|---|---|---|
| Later story step ticks its prerequisite steps | Verified | S1a ×3 | prerequisites are what `after` lists say; correctness of the lists is game data (audit C) |
| Story steps imply going back to child where needed | **Incorrect** | S1b ×3, F-009 | — |
| Step gives its rewards | Verified (sample) | S2 ×3 | one step tested directly; others via random runs |
| Full links stay in sync both ways | Verified | S3, R (I4) ×3 | — |
| "Up" links one way only | Verified on tick; **inconsistent on reload** | S3, N1b, F-010 | — |
| Checklist parent ⇔ steps, version-only steps | Verified | S4/S5, R (I2) | dungeon "free" lists included in R |
| Untick reverses dependants | Verified (story chain) | S6, R | items/side rows are not unticked when a prerequisite goes (F-015, by design) |
| Untick leaves unrelated progress | Verified | S7 | — |
| Locks stop ticks in the UI | Verified | S10 | locks are UI-only (F-015) |
| OR requirements | Verified (static) | graph_check check 2; R uses real `unmetAny` | no per-row runtime OR test yet (e.g. GV-3 sw2) |
| AND requirements | Verified (static + R) | graph_check, R | — |
| Version isolation | Verified | S17 ×3 | — |
| Child/adult lock rule | Verified | S18 ×3 | — |
| Reachability of every row | Verified (static) | graph_check check 3 | ignores age-switch delay |
| Undo restores state | Verified | R (undo-log reversal every tick) | toast UI not clicked |
| Malformed saves don't break start-up | Verified | N3 ×5 | sw2 only |
| Progress-code import validation | Verified | N5 | sw2 only |
| Settings persistence across migrating load | **Incorrect** | N2, F-011 | — |
| New-player initial state | **Incorrect** | N4, F-012 | — |
| Remote sync | Unverified | — | F-013, D1 |
| Day/night logic | Not applicable | code read: no time logic in the engine | time is a tag + Quests-tab filter |

## Synchronization verification (session 3, 2026-11-09)

**Isolation decision (D1).** Real-database testing was **not** performed. A fully isolated stand-in was used instead.
- Why no real DB test: (1) no signed-in viewer runtime here — the artifact emulator bootstrap stopped ("no session token file … cannot run here"), and no browser or device bridge is available; (2) a separate test artifact would need publishing a test build, which the session-3 rules forbid; (3) the tool-level `db_write` requires `ifVersion` and does not exercise the page SDK's `ref.set`, so it would not test the app.
- Why the stand-in is isolated: the page loads from `file://`; all other requests are aborted at the browser context; `window.claude` is defined by the test, so `claude.use('db')` returns an in-memory object; the "server" is a Python dict; the synthetic uid differs from production; no production data was read into the harness.
- Production safety: zero `db_write` calls in this audit. Production doc before: version 1521, updatedAt 2026-11-09T17:55:57.011426Z. After: version 1521, same updatedAt (read-only `db_get`). Live artifact version `1794245267-84a7`, index.html sha256 `d9f96a34…16a9ac` — unchanged and equal to the audit build.

**Category A — same account, multiple devices:** app-side behavior verified against the stand-in; data loss reproduced (F-013, F-019, F-020). The real provider's delivery, offline queueing and error semantics are unverified — M1/M2 bracket the likely behaviors, and both lose data.

**Category B — cross-account isolation:** **Unverified at runtime.** Supported only by platform documentation (per-artifact DB; `data/users/<id>/` private even from the owner; `db_rules_get` = `[]`, i.e. defaults) and by code (path built from `user.id()`). No independent authenticated identities were available.

## Requirement compiler and progression verification (session 4, 2026-11-09)

Game-data entries: still **none verified** (audit C not started). F-026 lists 32 text/requirement mismatches to check first.

| Behavior | Status | Evidence | Limits |
|---|---|---|---|
| Generated requirements = source definitions (gate + fix4 + extra, base and per version) | **Verified** | build_audit B1, B2, B3 | Says the build does what the sources say, not that the sources are right about the game |
| Override tables reference real rows/versions | Verified (today) | B8 | The build itself does not check this (F-023) |
| Requirement labels | Verified | B4 | — |
| Version-aware completability (app semantics) | Verified | B7: 538/538/548 | Ignores the age-switch delay (as F-018) |
| Two-Link child half has no adult-only equipment | Verified | B6 | Adult-learned songs are allowed (correct in game) |
| OR requirements at runtime, every clause, every option | **Verified** | P1a–d ×3 versions | 7/7/9 options not isolable (story cascade) |
| Runtime requirements/age/time = generated data | Verified | P2 ×3 | — |
| Day/night labels per version | Verified | P3 ×3 | Label values themselves are game data (unverified) |
| Day/night filter (Quests tab only, persisted) | Verified (by design) | P4 ×3 | Not offered on other tabs (F-028) |
| Child two-Link step locked while stuck as adult | Verified | P5 ×3 | — |
| Story steps imply going back to child | **Incorrect** (unchanged) | S1b; root cause in main.py; fix measured in f009_probe | F-009 |

## Synchronization verification — session 4 additions

| Scenario | Status | Evidence |
|---|---|---|
| First connect with no account document and local progress | **Incorrect** (F-022) | H1/H1b, M1 and M2 |
| New player's first save | **Incorrect** (F-012: unprefixed defaults uploaded) | H2, M1 and M2 |

Production safety (session 4): the live artifact was read only with `get_artifact` and `list_files` (version `1794245267-84a7`, index.html sha256 `d9f96a34…16a9ac`, unchanged). The production database was **not read** this session (no `db_get`), at the owner's instruction, and not written. No publish.


## Game-data verification (session 5, 2026-11-09)

| Area | Status | Evidence / note |
|---|---|---|
| Token count, all versions (100) and hearts (36) | **Verified** | C4 |
| Switch 2 token counts per region group | **Verified** against Questfern (one source) | C5 |
| N64/3DS night tags, 100 tokens | **Verified** against randomizer logic | C2 |
| N64/3DS age tags, tokens and 17 hearts | **Verified** against randomizer logic | C3, C7 |
| F-026 text/tool pairs (32) | **Resolved**: 1 defect, rest not defects | C6, F-034 |
| Light Medallion source and gate | **Incorrect** | F-029 |
| GAN-1 gate | **Incorrect** | F-030 |
| DMT-1, HF-2, HC-2, IC-3, HP-15 requirements | **Incorrect** (missing tool) | F-031 |
| ZR-1, GV-3, GF-2, CL-2 requirements (n64/3ds) | **Incorrect** (over-locked) | F-032 |
| Remaining 91 token requirement sets, N64 | Read in full; no mismatch found in the cases checked against the randomizer's region rules; not a full formal comparison | F-036 |
| Heart Piece tools, other than HP-15 | **Unverified** | F-036 |
| Side-quest and item rows (names, rewards, order) | Read in full; consistent with the dependency map; not source-checked | F-036 |
| Dungeon walkthrough steps (180) | **Unverified** | F-036 |
| Main-quest order and gives | Read in full; consistent with F-018 | — |
| Switch 2 overrides | **Unverified** beyond counts; sources are secondary guides; 8 rows disputed | F-035 |
| 3DS differences | Unverified (assumed same as N64 as the tracker states) | — |

Production safety (session 5): the live artifact was not touched; no database read or write; nothing published. All work ran on the audit copy and on public web pages. Q5 (test artifact) was approved by the owner but not exercised in this session.
