# Test execution records

## 1. Baseline run — session 1 (2026-11-09)

Environment: isolated copy `proj/`, output `out/`, headless Chrome via Playwright, `file://` pages, default harness flags from `pwpatch.py` (areas open, spoiler veil off, confirm prompts off, default version sw2) unless a script sets its own.

| Script | Exit | Time | Result line | Notes |
|---|---|---|---|---|
| test.py | 1 | 32s | crash (timeout on KF-1) | stale: no harness, targets index.html (F-001) |
| test_cards.py | 0 | 48s | BELOW 4.5: 0 | contrast of card titles on art |
| test_contrast.py | 1 | 31s | crash (no .row) | stale: targets themed.html (F-001) |
| test_contrast2.py | 0 | 7s | BELOW 4.5: [] | |
| test_db.py | 0 | 5s | errors: [] | prints only |
| test_desk.py | 0 | 7s | errors: [] | prints only |
| test_dg.py | 0 | 8s | FAILS: [] | |
| test_final.py | 0 | 26s | FAILS: [] | |
| test_gate.py | 0 | 7s | FAILS: [] | |
| test_overflow.py | 0 | 120s | 375 states; failing 0 | |
| test_paths.py | 0 | 20s | FAILS: [] | 60 seeded random runs per version (LCG, seed = run*7919+13: reproducible) |
| test_play.py | 0 | 3s | FAILS: [] | allow-list of rows that never become ready: HP-16, SQ-7, IT-51, IT-44, TR-26, TR-27 — to be reviewed (audit B) |
| test_r12.py | 0 | 12s | FAILS: [] | |
| test_r14.py | 0 | 9s | FAILS: [] | |
| test_r3.py | 0 | 22s | FAILS: [] | |
| test_r6.py | 0 | 10s | FAILS: [] | |
| test_r7.py | 0 | 14s | FAILS: [] | |
| test_r8.py | 0 | 11s | FAILS: [] | |
| test_r9.py | 0 | 5s | FAILS: [] | |
| test_resp.py | 0 | 8s | errors: [] | prints only |
| test_side.py | 0 | 5s | errors: [] | |
| test_t2.py | 0 | 33s | prints counts | checks nothing (F-002) |
| test_tools.py | 0 | 1s | FAILS: 0 | text-vs-requirement consistency |
| test_two.py | 0 | 2s | FAILS: [] | |
| test_ui.py | 0 | 6s | errors: [] | |
| test_ver.py | 0 | 7s | errors: [] | |
| check_user.py | 0 | 1s | lists normalize additions | uses an embedded real-save snapshot (F-006) |

Totals: 27 discovered, 27 executed, 25 completed with no reported failure, 2 crashed (stale), 0 skipped.
Caveat: "no reported failure" ≠ pass in a strict sense — scripts never exit non-zero on assertion failure (F-002), and several only print values. A per-script evaluation of what each actually proves is pending (audit G).

## 2. Audit scripts added (in `scripts/`, not in the project)
| Script | Session | Purpose | Result |
|---|---|---|---|
| net_check.py | 1 | Clean context per version: external requests, console errors/warnings, page errors | none (F-008) |

## 3. Known limitations
- L-1: Remote database sync cannot be exercised from `file://`. Testing it safely needs a separate test artifact with its own database (owner approval needed). Until then, sync behavior is "Unverified".
- L-2: Only headless Chromium is available; no Firefox/Safari/WebKit. Browser-compatibility claims will be limited to Chromium.

## 4. Recommended new tests (to design in later sessions)
- Suite runner with a single pass/fail exit status.
- Property tests over the dependency engine: tick/untick reversibility, version isolation, OR-alternative unlocking, no premature unlocks, seed recorded and replayable.
- Save-migration fixtures (old ids, retired ids, legacy un-versioned keys) — synthetic.
- Progress-code fuzzing (malformed, oversized, foreign versions).
- Accessibility checks (keyboard order, focus visibility, ARIA states) at the eight required widths.

## 5. Session 2 tests (2026-11-09)

All in `scripts/`, run against `out/themed2.html`, fresh throwaway browser contexts, synthetic progress only. No project files, no production data, no database.

### 5.1 `graph_check.py` — static dependency analysis
Command: `python3 scripts/graph_check.py` · Exit code: 0 · Output: `DEPENDENCY_MAP.json`
| Check | n64 | 3ds | sw2 |
|---|---|---|---|
| after-refs exist and point earlier (no cycles, no startup crash) | pass | pass | pass |
| no requirement clause made only of rows missing in the version | pass | pass | pass |
| every row completable (fixpoint) | 538/538 | 538/538 | 548/548 |
| checklist step weaker than parent | 0 | 0 | 0 |
| OR options that name a row missing in the version (informational) | 14 | 14 | 0 |

### 5.2 `test_engine.py` — engine and state-integrity tests
Command: `python3 scripts/test_engine.py --seeds 40` · Exit code: **1** (6 failures, all mapped to findings) · Records: `testlogs/engine_results.json` (behavior, initial state, action, expected, actual, result, source refs per test) · Summary table: `testlogs/engine_table.md`
Randomized test R: per version, seeds 1..40, rng = LCG with seed `seed*7919 + len(version)`; 120 actions per run (70% lock-respecting tick of a random unlocked row, 30% untick of a random ticked row). After every action: I1 (ticked node ⇒ ancestors ticked), I2 (checklist parent ⇔ all version steps), I4 (full-link quest ⇔ all existing prizes), tick/untick took effect, and the action's log reversed restores the previous state exactly (undo). Re-run any seed with `--seeds N`.

Results: 50 tests, 44 passed, 6 failed.
| Test | Versions | Result | Finding |
|---|---|---|---|
| S1a later step ticks its prerequisites | n64, 3ds, sw2 | PASS | — |
| S1b finishing does not leave child rows locked | n64, 3ds, sw2 | **FAIL** | F-009 |
| S2 step gives its rewards | all | PASS | — |
| S3 full links both ways, up link one way | all | PASS | — |
| S4/S5 checklist steps ⇔ parent, version-only steps | all | PASS | — |
| S6 untick a step unticks later steps | all | PASS | — |
| S7 untick unrelated row removes nothing else | all | PASS | — |
| S10 forced tick on a locked row refused | all | PASS | F-015 |
| S17 version isolation | all | PASS | — |
| S18 child lock while adult, open after Prelude | all | PASS | — |
| S19 rapid tick/untick churn | all | PASS | — |
| R random sequences (40 seeds × 120 actions) | all | PASS | F-018 |
| no page errors | all | PASS | — |
| N1 "up" prize stable across reload (SQ-33, sw2) | sw2 | PASS | — |
| N1b same, SQ-27 with locks off | sw2 | **FAIL** | F-010 |
| D1 (design record) untick bow after finishing | sw2 | PASS (observed) | F-015 |
| N2 settings survive a migrating load | sw2 | **FAIL** | F-011 |
| N3 ×5 malformed saves start up | sw2 | PASS | — |
| N4 new player starts empty | sw2 | **FAIL** | F-012 |
| N5 progress code import validation | sw2 | PASS | — |

### 5.3 Probes
`probe1.py` — confirms F-009 (unmet `[[MQ-22]]` on KF-1, LLR-3, HP-8, SQ-6 after ticking MQ-41) and F-010 (IT-16 appears only after reload).

### 5.4 Existing-suite notes from session 2
- `test_play.py` allow-list (HP-16, SQ-7, IT-51, IT-44, TR-26, TR-27 "never ready"): the static fixpoint shows all of them completable; they are ticked as side-effects (links/upgrade pairs) before the greedy loop sees them ready, or (TR-26/27) need all 100 tokens. The allow-list weakens the test: a genuinely unreachable row with one of these ids would pass. Recommend replacing it with the fixpoint check.
- `test.py`: replace (see F-001 update). `test_contrast.py`: retire after audit G confirms coverage.

### 5.5 Not tested in session 2
Remote sync (F-013, deferred to the D1 test artifact); day/night (no engine logic; labels and a filter only); UI rendering states beyond the lock guard; the "I'm here" and inferred-steps buttons with locks off.

## 6. Session 3 tests (2026-11-09) — synchronization

`scripts/test_sync.py` — runs the shipped page (`out/themed2.html`, same sha256 as live) in headless Chrome with `window.claude` replaced by a local stand-in database held in the test process. Every non-`file:` request is aborted. Synthetic user `u_synthetic_1`, synthetic ids only (KF-1, KF-2, LW-1, MKT-1). Real UI ticks (row checkbox click → app change handler → `schedule()` → `flush()`). The test decides when each save reaches the server, fails, or is delayed, and when each device receives a snapshot. Deterministic: no randomness; fixed order per scenario. Exit code 1 on any failure.

Models: **M1** writes rejected while offline, no local echo. **M2** Firestore-like: local echo with `hasPendingWrites`, offline writes queued and replayed.

Result: **26 runs, 8 pass, 18 fail, exit 1.** Full per-run request order, device state and final server state: `testlogs/sync_results.json`; table: `testlogs/sync_table.md`.

| Scenario | M1 | M2 |
|---|---|---|
| A normal tick / untick / reload | PASS | PASS |
| B1 simultaneous, different rows (A first) | FAIL | FAIL |
| B2 simultaneous, different rows (B first) | FAIL | FAIL |
| B3 overlapping add/remove | FAIL | FAIL |
| C offline on A, B plays, reconnect | FAIL | FAIL |
| D1 failed save, page reopened | FAIL | FAIL |
| D2 failed save, then successful unrelated save | PASS | PASS |
| D3 failed save, other device's update arrives | FAIL | FAIL |
| E1 rapid changes during an outstanding save | PASS | PASS |
| E2 stale snapshot delivered late | FAIL | FAIL |
| F1 reload during outstanding save | FAIL | FAIL |
| F2 earlier offline progress, reopened online | FAIL | FAIL |
| G1 version keys separate through sync | PASS | PASS |

Notes: scenario labels give the intended landing order; the harness records the actual order (`server_writes`), which sometimes includes a leftover empty setup save. Losses occur in both orders, so the conclusion does not depend on it. Harness bugs found and fixed before the final run: unprefixed seed keys; follow-up saves from `flush()`'s `again` loop not drained.

Skipped / blocked: real-provider runs (no signed-in runtime); hang-forever and timeout-retry (app has no retry path to test); cross-account (no independent identities).

## 7. Session 4 tests (2026-11-09) — requirement compiler, progression, sync branches

All scripts are in `scripts/` and use synthetic data only. The production database was not read and nothing was published. Environment: Python 3.11, Playwright with `/usr/bin/google-chrome` (headless), file:// pages, every non-file request aborted. Paths are hard-coded to `/home/claude/audit` (unzip the handoff so it lands there).

Start check: `cd proj && python3 build.py` exited 0; `out/themed2.html` sha256 `d9f96a343e7b0f6182cb5db1d8b8d11bb39595271d0b580bbcdeab557016a9ac` (equal to the session 3 hash and to the live artifact). Log: `testlogs/build_s4.log`.

| Script | Command | Exit | Result | Records |
|---|---|---|---|---|
| dump_build_state.py | `python3 scripts/dump_build_state.py [proj] [out.json]` | 0 | runs `build.py` unchanged via runpy, dumps KEY2ID, GATE/GATE_V/BOTH/BOTH_V/OV/ONLY, LINKS, ITEMS, STEPS, ERA, plus pristine pre-`fix4` gate/links | `testlogs/build_state.json` |
| build_audit.py | `python3 scripts/build_audit.py [html] [state.json]` | **0** | 8 checks, 8 pass (B1–B8); informational I1–I3 | `testlogs/build_audit.json`, `.log` |
| build_mutation.py | `python3 scripts/build_mutation.py` | **0** | 7 mutations: 5 silently accepted by `build.py` (F-023), 0 missed by `build_audit.py` | `testlogs/build_mutation.json`, `.log` |
| f009_probe.py | `python3 scripts/f009_probe.py` | 0 (measurement) | the F-009 data fix builds clean; 10 changed rows per version; MQ-30…41 gain MQ-22 | `testlogs/f009_probe.json` |
| test_progression_s4.py | `python3 scripts/test_progression_s4.py` | **0** | 27 tests (9 × 3 versions), 27 pass; run twice, same result | `testlogs/progression_s4.json`, `test_progression_s4.log` |
| test_sync_s4.py | `python3 scripts/test_sync_s4.py` | **1** (expected while F-013/F-022/F-012 are open) | 6 runs (H1, H1b, H2 × M1/M2), 0 pass | `testlogs/sync_s4_results.json`, `test_sync_s4.log` |

### 7.1 build_audit.py checks
B1 skull/heart/side requirements = independent re-compile (base + per version) · B2 same for items/songs · B3 every GATE_V/BOTH_V/BOTH entry reaches the output · B4 every requirement leaf has a label (as `chipText()` resolves it) · B5 no clause made only of rows missing in the version · B6 the child half of a two-Link row needs no adult-only equipment (adult-learned songs allowed) · B7 version-aware fixpoint with app semantics (link versions, conditional up-links, checklist steps; 538/538/548) · B8 every table key is a real row and version. Informational: I1 OV ages overwritten by BOTH/BOTH_V (HP-6, HP-7, HP-17 sw2 → F-024) · I2 text names a tool not required (32 pairs → F-026) · I3 time-label counts and per-version differences (HF-1, HC-1 → Night on sw2; LH-3 → Any on sw2).

Corrections made to the audit script during the session (recorded, not hidden): B6 first flagged adult-learned songs (Bolero, Requiem), which child Link can play, so it was narrowed to equipment. B4 first flagged two-Link step ids (`LW-3.1`), but the app labels them by `short`/`name`. B8 was added after mutation M3 showed a gap in the audit itself.

### 7.2 build_mutation.py
Each mutation copies `proj/` to `/tmp/s4mut/<name>/proj`, points the output at `/tmp/s4mut/<name>/out`, and appends one mistake to the copy's `fix4.py`. `audit/proj` is asserted unchanged after every run.

| Mutation | build.py | build_audit.py |
|---|---|---|
| M1 GATE_V on an item row | accepted | caught (B3) |
| M2 GATE_V with a typo id | accepted | caught (B3/B8) |
| M3 OV with a typo id | accepted | caught (B8) |
| M4 OV with a bad version key | caught | — |
| M5 link-version leak (IT-77 unobtainable on sw2) | accepted | caught (B7) |
| M6 OV age overwritten by BOTH_V | accepted | caught (I1) |
| M7 unknown requirement token | caught | — |

### 7.3 test_progression_s4.py (per version: n64, 3ds, sw2)
| Test | n64 | 3ds | sw2 |
|---|---|---|---|
| P1a OR clause unmet with nothing ticked (34/34/39 clauses) | PASS | PASS | PASS |
| P1b each option alone satisfies its clause (110/110/122 options) | PASS | PASS | PASS |
| P1c options naming a missing row never satisfy | PASS | PASS | PASS |
| P1d option + other clauses unlocks the row | PASS | PASS | PASS |
| P2 runtime q/age/time/reqOf = generated (538/538/548 rows+steps) | PASS | PASS | PASS |
| P3 day/night tags match the version's label | PASS | PASS | PASS |
| P4 Quests time filter; ignored on other tabs; persists across reload | PASS | PASS | PASS |
| P5 child half of a two-Link row waits for the Prelude while stuck as adult | PASS | PASS | PASS |
| no page errors | PASS | PASS | PASS |
OR options that cannot be isolated because a story cascade also gives a sibling: n64/3ds 7 (HF-1, DC-4, HW-1, SP-5, HP-9, HP-10, SQ-42); sw2 9 (HF-3, KAK-5, ST-4, LH-2, HW-1, CL-2, SP-5, HP-9, SQ-42). Listed in `progression_s4.json`; not failures.

Harness bug found and fixed in this session: P4 first failed on 3ds/sw2 in some runs. The seeding init script's `sessionStorage` guard did not reliably survive `page.reload()` on a file:// page, so the seed `{got, ver}` was written again before the app loaded. Evidence: after the reload the save held exactly the seed's keys. The guard is now "seed only if no save exists"; two consecutive runs gave 27/27.

### 7.4 test_sync_s4.py (same stand-in as test_sync.py; its classes are loaded from that file unchanged)
| Scenario | M1 | M2 | Finding |
|---|---|---|---|
| H1 no account document, device has progress | FAIL (0 saves sent; status "Saved to your account"; server empty) | FAIL | F-022, F-019 |
| H1b same, second device saves first | FAIL (A loses KF-1, KF-2 on screen and in local storage) | FAIL | F-022 |
| H2 new player, first tick | FAIL (server: DT-1, DT-2, DT-3, MKT-1 unprefixed + sw2:LW-1) | FAIL | F-012 |

### 7.5 Limitations added in session 4
- L-3: `test_sync.py` (session 3) seeds local storage with the same `sessionStorage` guard as above. None of its seeded scenarios (F2 only) reloads the seeded device, so its results are unaffected. Any new scenario that reloads a seeded device must use the guard from 7.3.
- L-4: The OR tests build state with `__oot.tick` (lock-free, cascades as in the app). They prove the evaluator and the data, not that a player can click their way to each state; UI-path coverage is S10/S19/R from session 2.
- L-5: Real provider and cross-account isolation are still not exercised (L-1, F-021).

### 7.6 Not tested in session 4
Real-provider sync (blocked: needs an owner-approved isolated test artifact, Q5); game-data accuracy (audit C; F-026 is input for it); UI/accessibility (audit F); the existing 27-script suite was not re-run, because the sources are byte-identical to session 3 (sha256), so the session 1 results stand.


## 8. Session 5 tests (2026-11-09) — game-data accuracy

`scripts/data_audit_s5.py [audit_dir]` reads `out/themed2.html` (the shipped data payload) and `testlogs/s5_rando_extract.json`, writes `testlogs/data_audit_s5.json` and exits 1 if any check fails. Result on unchanged sources: **16 checks, 7 pass, 9 fail, exit 1** (expected while F-029…F-032 are open). It reads no production data and touches no network.

| Check | What it tests | Result | Finding |
|---|---|---|---|
| C1 | Each of the 100 N64 token rows maps to one distinct randomizer location | PASS | — |
| C2 | N64/3DS night-only tags equal the randomizer `at_night` rule (100 × 2 versions) | PASS | — |
| C3 | N64/3DS age tag matches the randomizer rule where the rule fixes an age | PASS | — |
| C4 | 100 tokens, 36 hearts in each version | PASS | — |
| C5 | Switch 2 counts per region group equal Questfern's list (9 groups) | PASS | — |
| C6 | All 32 F-026 pairs have a recorded verdict | PASS | F-034 |
| C7 | N64/3DS heart age tags vs randomizer rules (17 rows) | PASS | — |
| D1 | Light Medallion given at the Master Sword step | FAIL ×3 | F-029 |
| D2 | GAN-1 does not need the Rainbow Bridge | FAIL ×3 | F-030 |
| D3 | DMT-1 lists a boulder-clearing item | FAIL n64/3ds (sw2 pass) | F-031 |
| D4 | HF-2 lists Boomerang/Hookshot | FAIL n64/3ds | F-031 |
| D8 | HP-15 does not accept the plain Hookshot alone | FAIL n64/3ds | F-031 |
| D9 | HC-2 lists the Boomerang (n64/3ds) | FAIL | F-031 |
| D10 | IC-3 lists a bottle | FAIL ×3 | F-031 |
| D5 | ZR-1 needs no bombs (n64/3ds) | FAIL | F-032 |
| D6 | GV-3, GF-2, CL-2 accept the plain Hookshot (n64/3ds) | FAIL | F-032 |

Requirement checks (D3–D10) test **explicit** requirement options, following the project policy that every row lists the tools it truly needs even when a story step implies them. D1 and D2 use the full ancestor closure (with the Master Sword added to adult rows, as `reqOf` does).

### 8.1 Checks written and dropped during triage (not tests of the product)
Two first-draft checks were wrong and removed: a "KAK-1 not night on Switch 2" check (the night-first policy is documented) and an "ST-4/SP-5 need no Scarecrow's Song" check (the randomizer itself needs the Longshot for ST-4; SP-5 is a source conflict). A first age heuristic produced three false positives (FT-1, DC-1, SP-5) and was replaced by a conservative rule.

### 8.2 Limitations added in session 5
- The randomizer extract is glitchless logic for the **N64** game. It says nothing about the 3DS or the Switch 2.
- Web sources came from search results and fetched pages; several sites were not reachable from this workspace (VGC, Respec, Zelda Dungeon's main pages), so some evidence is from search snippets only. Each finding names its sources.
- Source agreement is not the same as game truth; where sources disagree the finding says so.

### 8.3 Not tested in session 5
The 180 dungeon steps' text; prices and timers; sync and UI (no change since s4).

### 8.4 Session 5, part 2 scripts
| Script | What | Result |
|---|---|---|
| `scripts/security_s5.py` | S1 hostile ids/hash execute nothing, S2 hostile ver/tab ignored, S3 junk ids written back (observation, expected defect F-038), S4 200k-id load time, S5 hook present. Same isolated stand-in as `test_sync.py`; synthetic ids only | exit 0; S1, S1b, S2 pass; S3 reproduces; S4 1.7 s |
| `scripts/a11y_s5.py` | structure, names, live region, hit size, overflow at 4 widths, 25 keyboard stops, per version | records only (exits non-zero only if a probe cannot run); F-039, F-041 |
| `testlogs/existing_suite_s5.txt` | each `proj/test*.py` run once, 45 s limit, 6 in parallel, no `-I` ambiguity (rerun without `-I` for 14 of them gave the same classes) | 19 exit 1, 5 exit 0 (no exit mechanism), 2 timeouts |
Limits: the suite run was parallel, so the two timeouts are not conclusive; causes of exit 1 were read for `test.py` (waits for a row that is not open) and `test_contrast.py` (selector timeout) only. The a11y probe sees only the skull tab with the groups that open by default.
