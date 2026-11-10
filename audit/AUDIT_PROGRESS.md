# Audit progress — Ocarina of Time Tracker: The Adventure Edition

> **Session 6, Phase 0 (2026-11-09):** repository promoted to the permanent source; history purged of two real-progress files; audit material moved under `audit/`;
> unified runner and privacy guard added; F-001 and F-002 addressed. See `audit/PHASE_0_REPORT.md`. No tracker behaviour was changed.

Isolated workspace: `/home/claude/audit/`
- `proj/` — full copy of `/home/claude/build` (taken 2026-11-09 12:10 CT). Only change made to the copy: every hard-coded output path `/home/claude/tracker` was rewritten to `/home/claude/audit/out` (55 `.py` files, `sed`), so builds and tests never touch the real output.
- `out/` — build output of the copy.
- `audit/testlogs/` — one log per existing test script.
- `audit/scripts/` — audit-only scripts (new tests live here, never in `proj/`).
- `REMEDIATION_PLAN.md` (s4): the plan for F-013/F-019/F-020/F-022, F-009 and F-012. Nothing in it is implemented.
- Session 4 note: sessions run in separate cloud workspaces. From session 4 on, the workspace is restored from the handoff zip into `/home/claude/audit`; the original `/home/claude/build` and `/home/claude/tracker` are not present in later workspaces, so `proj/` is the only copy of the source the audit can see.

Production safety (session 1): the original project, the published artifact and the player's database document were not modified. No publish was made. The live artifact was only read (`list_files`). Tests run against `file://` pages with throwaway browser storage; the remote database code path is not reachable from `file://` (see AUDIT_TESTS.md, limitation L-1).

---

## Session log

### Session 1 — 2026-11-09 — Inventory and baseline (status: complete)

Done:
1. Project inventory (below).
2. Baseline build in the isolated copy: success, deterministic. `out/themed2.html` sha256 `d9f96a34…a9ac` = local production build = live artifact (version `1794245267-84a7`, `list_files` read at session time). See F-007 (verified).
3. Ran all 27 existing test scripts (25 `test_*.py`, `test.py`, `check_user.py`). 25 completed, 2 crashed. Details: AUDIT_TESTS.md §1.
4. Clean-context load of the built page for all three versions: no external requests, no console errors or warnings, no page errors (F-008).
5. First findings recorded: F-001 … F-008 (AUDIT_FINDINGS.md).

Not done in session 1 (by design): line-by-line source reading, dependency-engine tracing, game-data verification, UX/accessibility, sync/persistence, security.

---

### Session 2 — 2026-11-09 (started 12:33 CT) — Application logic, progression engine, state integrity (status: complete)

Start checks:
- Read all four audit documents; Session 1 findings F-001…F-008, D1 and Q2 carried forward.
- Working copy: `/home/claude/audit/proj` (output `/home/claude/audit/out`). All 22 shipped source files are byte-identical to the originals (path rewrite excluded) — no source changes since Session 1.
- Live artifact unchanged: version `1794245267-84a7`, sha256 `d9f96a34…a9ac` (read-only `list_files`). No database reads or writes by the audit this session (D1: no DB writes before audit E).

Objectives: read all of app.js; trace eff/touch/reqOf/unmetAny/stepReady/rowReady/nextStep/tickOn/tickOff/normalize and their callers; audit completion, prerequisite and state-integrity behavior; build a dependency map with automated graph checks; create deterministic tests with exit codes.

Done (status: **complete**, ended 2026-11-09):
- Read `app.js` in full (L1–1556, 117 named functions). Traced call paths for: `eff`/`touch` (cache), `reqOf`/`reqMet`/`unmetAny`/`stuckAdult`, `stepReady`/`nextStep`/`rowReady`/`readyCount`, `tickOn`/`tickOff`/`setRaw`/`setOn`/`pendingEarlier`, `normalize` (start-up, remote load, code import), `syncLinks`/`rowMap`/`resolveRow`/`subsV`/`subsIn`, the change/ask/infer/"I'm here" handlers, undo, `saveLocal`, `schedule`/`flush`/`initRemote` (read only — not executed), progress-code export/import, legacy claim, version/tab switching.
- Dependency map: `DEPENDENCY_MAP.md` + `DEPENDENCY_MAP.json` (per version: requirements, after, gives, links, ancestors). Automated checks in `audit/scripts/graph_check.py`: 3 versions × (cycles, dangling refs, start-up order, dead clauses, reachability fixpoint, weak checklist steps).
- Tests: `audit/scripts/graph_check.py` (exit 0) and `audit/scripts/test_engine.py` (50 tests, 44 pass, 6 fail → exit 1); probe `audit/scripts/probe1.py`. Details AUDIT_TESTS.md §5.
- New findings F-009…F-018 (AUDIT_FINDINGS.md). Updated F-001 (recommendation per stale test) and F-002 (new tests meet the exit-code rule).
- Production safety: no project file, no live artifact, no database touched. Live artifact still `1794245267-84a7` / `d9f96a34…`. No database reads or writes.

Session 2 counts: functions read 117 (all of app.js); call paths traced 14 (listed above); dependency paths analysed: every row in 3 versions (538/538/548) with 1286/1286/1312 edges; tests created 2 scripts (+1 probe), 50 runtime test cases + 5 static checks × 3 versions; executed 50 + 15; passed 44 + 15; failed 6 (all mapped to F-009/F-010/F-011/F-012).

Files fully inspected so far: `app.js`. Partially: `build.py` (L660–692), `main.py` (after-lists), `gate.py`/`fix4.py`/`links.py` (entries referenced by findings), `check_user.py`, `test.py`, `test_contrast.py`, `test_play.py`, `pwpatch.py`.

### Session 3 — 2026-11-09 — synchronization, save integrity, recovery (COMPLETE)
- Isolation: real-DB testing blocked (no signed-in runtime; test publish forbidden); local stand-in harness used, fully isolated.
- `audit/scripts/test_sync.py`: 26 runs, 8 pass, 18 fail (exit 1). F-013 confirmed; F-019, F-020, F-021 added.
- Production untouched: DB version 1521 before and after; live sha256 unchanged; no writes.
- Stopped after session 3 per instructions.

### Session 4 — 2026-11-09 (started 13:05 CT) — requirement compiler, remaining progression, remediation plan (COMPLETE)
Start checks:
- New conversation. Context restored only from the handoff zip (`oot_audit_handoff.zip`), unzipped to `/home/claude/audit` (the path the scripts expect; no path constants changed). Read NEXT_SESSION.md and the four audit docs in full.
- Rebuild from `proj/`: exit 0, `out/themed2.html` sha256 `d9f96a34…16a9ac`, identical to session 3, so **no source change since session 3**.
- Live artifact `573b4659-…`: `get_artifact` + `list_files` only → version `1794245267-84a7`, index.html sha256 `d9f96a34…16a9ac`, unchanged. Production database **not read and not written** this session (owner instruction).

Done:
1. Read in full: `build.py` (692 lines), `gate.py` (98), `fix4.py` (275), `links.py` (48), `era.py` (80), plus `regroup.py` (47) and the `app.js` consumers of the generated data (resolveRow, rowMap, syncLinks, FULLN/SUBPAIR, eff/reqOf/unmetAny, matches/time filter, needsHtml/chipText, subHtml, normalize, initRemote/flush, progress-code import).
2. Traced the compiler: `fix4` mutates the GATE/GATE_V/OV/BOTH dicts in place and replaces LINKS → `attach()` applies OV/BOTH/BOTH_V/GATE_V to skull/heart/side rows only → `clauses()`/`prune()` compile tokens (`@step` = the step's prerequisites, not the step) → `era.derive()` marks child rows needing adult-era progress as Both → two-Link checklists → payload JSON. The app resolves per version with `resolveRow()` and adds the Master Sword and Prelude clauses at runtime (`reqOf`).
3. Static audit `audit/scripts/build_audit.py`: 8/8 pass. Mutation tests `audit/scripts/build_mutation.py`: 5 of 7 source mistakes are silently accepted by `build.py` (F-023).
4. Runtime progression `audit/scripts/test_progression_s4.py`: 27/27 pass across n64/3ds/sw2 (OR requirements, runtime = generated, day/night labels and filter, child two-Link step while stuck).
5. Sync branches not covered in session 3, `audit/scripts/test_sync_s4.py`: 0/6 pass → new **F-022** (High) and new impact for F-012 (unprefixed defaults uploaded to the account).
6. F-009 impact probe in a disposable copy (`audit/scripts/f009_probe.py`): the data fix builds clean; 10 rows change per version.
7. Remediation plan for F-013 (+F-019/F-020/F-022), F-009 and F-012: `REMEDIATION_PLAN.md`.
8. New findings F-022…F-028; updates to F-009, F-012, F-013, F-018, F-019, F-020; consolidated prioritized register with release-blocking recommendation (AUDIT_FINDINGS.md, end).
9. No fixes implemented. `proj/` unchanged (mutations and probes ran only in `/tmp/s4mut/*` copies).

Session 4 counts: files read in full 6 (+ app.js consumer paths re-read); tests created 5 scripts (+1 dump helper); executed: 8 static checks, 7 mutations, 27 runtime tests, 6 sync runs, 1 probe; passed 8 + 7 (caught) + 27 + 0; failed 0 + 0 + 0 + 6 (all mapped to F-022/F-012/F-019).

### Session 5 — 2026-11-09 (resumed after a usage-limit interruption) — game-data accuracy, audit C part 1 (status: **partial**, see below)
Start: repo cloned from `zhrpo/oot-tracker` (read-only clone), `proj/` rebuilt, sha256 `d9f96a34…16a9ac` = Session 4. Owner decisions Q3–Q5 received at the start (recorded below). On resume the only uncommitted work was the first draft of `audit/scripts/data_audit_s5.py`, its log and the randomizer extract; nothing was in the docs. The interrupted task was triaging that script's first run (11 failures).

Done:
1. Dumped the shipped data per version (`out/themed2.html` payload) and read all 100 tokens (N64 in full, Switch 2 overrides), 36 hearts (N64 and Switch 2 overrides), all 44 side quests, all 77 items/songs, and all 40 main steps with the dungeon walkthrough text.
2. Cross-checked N64 tokens and hearts against OoT Randomizer glitchless logic (vendored extract), and Switch 2 against web guides (Game8, RPG Site, Questfern, Respec/VGC via search, TheGamer, Nintendo Life). Web sources named per finding.
3. Wrote `audit/scripts/data_audit_s5.py` (16 checks, 7 pass / 9 fail, exit 1). Triage dropped three of its own false positives (§8.1 of AUDIT_TESTS.md).
4. Findings F-029…F-036; F-026 resolved (32 pairs).
5. Documentation and the draft data-remediation section (REMEDIATION_PLAN.md §6) and the owner decisions (§7).

Not done (still open in audit C): the 180 dungeon steps and side-quest/trade text were not checked against a source; Heart Piece tools beyond HP-15; prices/timers (F-036). Audits F (UX/accessibility), G (per-script evaluation, suite runner) and Security were not started, and the consolidated remediation plan the owner asked for is **not yet written**: it waits for those audits.
No fix implemented; `proj/` unchanged. Production: live artifact, database and the owner's save untouched. Q5 not exercised.

Session 5, part 2 (resumed after the Part 1 verification; verification found nothing to correct): done: security review of the browser code with a runnable probe (`audit/scripts/security_s5.py`, F-038, F-040); accessibility spot-check (`audit/scripts/a11y_s5.py`, F-039, F-041); evaluation of the existing suite by running all 26 `proj/test*.py` (F-001/F-002 evidence extended, `audit/testlogs/existing_suite_s5.txt`); price/timer extraction and partial source check (F-037). Not done: dungeon steps (DG-42..221), side-quest/trade text beyond prices/timers, heart tools beyond HP-15, other 91 token rule sets (all F-036), the per-script root-cause of each failing legacy test (two examined), a single suite runner, colour contrast re-run, screen-reader testing, other tabs for accessibility. No fix implemented, no publish, production untouched.

Session 5 counts: sources read: 3 repo doc sets, ~14 web pages; tests: 1 script, 16 checks, 7 pass, 9 fail; findings 8 new.

#### Owner decisions recorded in session 5 (2026-11-09 16:11 CT message)
- **Q3** — approved: the most recent intentional tick or untick on a row wins across devices, **without trusting device clocks**: use a hybrid logical clock or a per-document revision, deterministic under concurrent and out-of-order updates; no silent loss of ticks or unticks. (Design implication: REMEDIATION_PLAN.md §7.1.)
- **Q4** — approved with conditions: remove the four unprefixed defaults (`DT-1`, `DT-2`, `DT-3`, `MKT-1`) only where they can be confidently identified as tracker defaults; never touch legitimate progress or unrelated settings; back up the original save first; reversible; otherwise leave them and document the limitation; new players must not receive them. (§7.2.)
- **Q5** — approved with conditions: a separate test artifact (unique ID, separate database document or namespace) may be published for sync tests only if complete isolation is demonstrated **before any database write**: test copy cannot read or write the production save, synthetic data only, production metadata unchanged, never publish over the live tracker, **stop immediately** if isolation cannot be guaranteed. Cross-account isolation stays **unverified** unless tested with genuinely independent authenticated accounts. (§7.3.) Not exercised in session 5.
- Process: finish the remaining audit areas before broad implementation; then a **consolidated remediation plan**; no implementation yet.

## Inventory

Total files in project directory: **322**
- 143 `.png` (development screenshots), 70 backup files (`*.bak*`), plus scratch/dev scripts, research notes.
- Not a git repository: no version history; backups are `.bak` copies (F-004).

### Files that make up the shipped application (in scope, must be read fully)

| File | Lines | Role |
|---|---|---|
| build.py | 692 | Build: ids, requirement compilation, version overrides, assertions, HTML assembly |
| main.py | 339 | 40 story steps |
| data.py | 384 | 100 Skulltulas + 36/37 Pieces of Heart |
| side.py | 372 | 44 side quests |
| extra.py | ~410 | 77 items/songs + sub-checklists (masks, Biggoron, House of Skulltula) |
| dungeons.py | 516 | 180 walkthrough steps (14 rows) |
| gate.py | 98 | Base requirements |
| links.py | 48 | Linked rows, either-order upgrades, two-Link hints |
| fix4.py | ~280 | Corrections + Switch 2 overrides (largest override file) |
| vers.py | 311 | Version overrides, version notes |
| vnew.py | 81 | Version-only rows |
| era.py | 80 | Derives "needs both Links" rows |
| regroup.py | 47 | Area order |
| areas.py | 20 | Side-quest location labels |
| app.js | 1556 | Entire runtime: state, logic, rendering, persistence, sync |
| template.html | 391 | Page shell + base CSS |
| theme2.js | 1143 | Console themes, icons, scene integration |
| theme2.css | 586 | Theme CSS |
| scenes3.js | 824 | Procedural SVG scene art |
| scenes3.css | 106 | Scene CSS |
| models5_toolkit.js | 107 | Item art toolkit (inlined into themed2) |
| models5_items.js | 393 | Item art (inlined into themed2) |

Also built but **not shipped**: `index.html` (plain) and `themed.html` (old theme, uses `theme.js`/`theme.css`) — F-003.

### Test scripts (27)
`test.py`, `check_user.py`, and 25 `test_*.py`. Plus harness `pwpatch.py`.

### Other files (out of scope for the shipped app; accounted for, not examined)
Backups (70), screenshots (143), scratch/diagnostic scripts (`dbg*.py`, `diag_jabu.py`, `dump_*.py`, `shot_*.py`, `patch*.py`, `migrate.py`, `mig_run.py`, `mk2*.py`, `banner_*.py`, `icons_sheet.py`, `contact.py`, `both_scan.py`, `era_audit.py`, `chk_text.py`, `preview.py`, `extra_head.py`), unused art sources (`icons3.js`, `icons_new.js`, `t2_icons.js`, `models5.js`, `scenes_items*.js`, `t2_*.css`, `theme2.new.css`, `template.new.html`, `oot_serif.b64`), data dumps (`got_old.json`, `mig_final.json`, `dump_sw2.txt`, `chk_text.out`), `research/`, `audit_notes.md`.

---

## Category status

| Category | Status |
|---|---|
| A Architecture & code quality | app.js (s2) and the requirement compiler (s4) read; theme2.js, scenes3.js, data modules (main, data, side, extra, dungeons, vers, vnew) not read in full |
| B Progression / dependency engine | **Complete** (s2 engine, s4 compiler + OR + day/night + runtime = generated). Open defect: F-009 |
| C Game-data accuracy | **Partial (s5).** F-026 resolved; tokens/hearts cross-checked (F-029…F-035, F-042…F-045); dungeon step wording, side-quest text and most prices still unverified against sources (F-036, owner decision needed) |
| D Version-specific correctness | Logic verified for all three versions (s2 S17, s4 B1–B8, P1–P5). Version game data not verified (part of C) |
| E Saving / sync / integrity | App-side logic tested against stand-in (s3 + s4 H-scenarios): F-013, F-019, F-020, F-022. Remediation designed (REMEDIATION_PLAN.md). Real provider + cross-account unverified (F-021) |
| F UX & accessibility | **Mostly done (s5).** All tabs, versions, schemes, 200 % text, accessibility tree (F-039, F-041). Not done: real screen reader, browser zoom, body-text contrast, day/night filter |
| G Testing & edge cases | **Done for the audit (s5).** All 26 legacy scripts run individually: 24 pass, 2 stale (F-001); 10 print FAILS without an exit code, 8 print only measurements (F-002); unified runner recommended (REMEDIATION_PLAN 6.1), not built |
| H Build & release integrity | Build reproducible (re-confirmed s4); build guards weak (F-023) |
| Security & privacy | **Partial (s5).** Browser code and stand-in sync: F-038, F-040. Real provider, server rules, cross-account, CSP unverified |

## Files: inspection status
- Fully inspected: `app.js` (s2), `build.py`, `gate.py`, `fix4.py`, `links.py`, `era.py`, `regroup.py` (s4).
- Partially inspected: `main.py` (story steps' after/gives, s2/s4), `template.html` (sync span, filter controls), `check_user.py`, `test.py`, `test_contrast.py`, `pwpatch.py` (harness only), `audit_notes.md` (s4, developer notes, not evidence).
- Not yet inspected in full: `data.py`, `side.py`, `extra.py`, `dungeons.py`, `vers.py`, `vnew.py`, `areas.py`, `theme2.js`, `theme2.css`, `scenes3.js`, `scenes3.css`, `models5_*.js`, `template.html`.
- Dependency map: `DEPENDENCY_MAP.md` / `DEPENDENCY_MAP.json`.

## Owner decisions
- D1 (2026-11-09 12:30 CT) — Sync testing approved, with conditions. When the synchronization audit (E) is reached, create a **separate test tracker**: its own new artifact ID and its own database document/namespace. Before any write:
  1. Verify isolation: the test artifact's slug differs from production (`573b4659-…`); its database paths resolve only inside the test artifact; a read of the production path through the test artifact returns nothing; the production document's `version` and `updatedAt` are recorded before testing and re-checked after (must be unchanged).
  2. Use synthetic data only (no copy of the real save).
  3. Exercise: simultaneous edits (multiple browser contexts), conflicts, offline progress, failed writes, delayed and out-of-order responses, recovery after reconnecting.
  4. If complete isolation cannot be guaranteed, do not test; keep sync "Unverified" and document exactly what blocks it.
  Known constraint to resolve at that point: I can act only as the owner's own signed-in identity, so "other accounts" may have to be simulated (role-level reads via `asLevel`, separate browser contexts as separate devices). Whether this is enough for the cross-user isolation check (Security §11) will be decided and recorded then.

## Unresolved questions
- Q1. Resolved by D1 (test tracker approved, with isolation preconditions).
- Q2. Are `index.html` / `themed.html` still wanted? If not, they can be dropped from the build (F-003).
- Q3–Q5: **answered in session 5** (see Session 5 log). Original text kept below.
- Q3 (s4). Sync conflict policy: is "the latest intent per row wins across devices" (an untick made later beats an earlier tick, and vice versa) the behavior you want? See REMEDIATION_PLAN.md §1.2.
- Q4 (s4). F-012 cleanup: may the fix remove the four unprefixed default ids (DT-1, DT-2, DT-3, MKT-1) from saves and account documents when they are the only legacy ids present? A genuine pre-version save with exactly those four would lose them.
- Q5 (s4). Real-provider sync verification needs a separate **test** artifact (D1). That requires publishing a test build, which the audit sessions so far forbid. Approve a test publish (new artifact, never the production slug) for Session 5 or later?

## Next recommended action (session 6, if the owner opens one)
Finish the remaining audit areas, then write the consolidated remediation plan: C part 2 (F-036: dungeon steps, side/trade text, heart tools), F UX/accessibility, G per-script test evaluation and a single suite runner (F-002), Security/privacy, remaining data modules. Then the consolidated plan over F-009…F-036 (REMEDIATION_PLAN.md §6–§7 are the starting drafts).

## (superseded) Next recommended action (session 5)
See NEXT_SESSION.md. In short: owner answers Q3–Q5; then either begin implementation following REMEDIATION_PLAN.md §5 (F-011 + F-009 → F-012 → sync redesign), or continue audit categories C (game data, starting with F-026), F (UX/accessibility) and G (per-script evaluation, suite runner).

## (superseded) Next recommended action (session 4)
Awaiting owner direction. Proposed: (1) decide whether to fix F-013/F-019 before release (design a merge-based save with retry and a visible unsynced state); (2) if a signed-in runtime becomes available, re-run `test_sync.py` scenarios against the real provider in an owner-approved isolated artifact; (3) continue remaining audit categories (UI/accessibility, data accuracy spot checks, F-009/F-012 remediation plan).

## (superseded) Next recommended action (session 3)
Audit E (sync) is blocked on nothing but setup, and F-013 is the largest open risk. Recommended Session 3: **synchronization audit under D1** — create the isolated test artifact, prove isolation before any write, then reproduce or rule out F-013 (failed write, offline progress, out-of-order and delayed responses, two devices). Alternative if the owner prefers: Audit A/B part 2 — read `build.py`, `gate.py`, `fix4.py`, `links.py`, `era.py` in full to verify the requirement compiler that produced the data the engine runs on.

## (superseded) Next recommended action (session 2)
Audit B, part 1: read `app.js` in full and trace `eff`, `touch`, `reqOf`, `unmetAny`, `stepReady`, `rowReady`, `nextStep`, `tickOn`, `tickOff`, `normalize` and the persistence/sync functions with their callers; record the execution model in AUDIT_FINDINGS.md before writing new property tests.

## Session 5 final status (2026-11-09 evening)
- **Session 5 complete.** Owner stopped the game-data source-checking at a defined cutoff (F-036 stays open, Informational). Findings F-001..F-045 preserved; next ID **F-046**.
- Delivered: game-data screens (F-029..F-036, F-042..F-045), security (F-040), accessibility (F-039, F-041), legacy-suite correction (24/26), consolidated remediation plan (REMEDIATION_PLAN.md §8), Session 6 handoff (NEXT_SESSION.md).
- Not verified (explicit): REMEDIATION_PLAN.md §8.8. Q5 was not exercised; no test artifact exists.
- No production, live-tracker, database or saved-progress change; nothing published or deployed.
- Next: wait for the owner's approval before Session 6 (implementation).
