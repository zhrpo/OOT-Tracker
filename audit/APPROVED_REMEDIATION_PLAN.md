# APPROVED REMEDIATION PLAN (Session 6, Scope v3 and later decisions)

This document records, in one place, what the owner has approved for remediation. It was assembled on 2026-11-09 from `SESSION_6_IMPLEMENTATION_SCOPE.md` (draft v3, which holds the longest form of each item), `REMEDIATION_PLAN.md` (sections 1 to 8, the Sessions 4 and 5 designs), `PHASE_0_REPORT.md`, `PRE_PURGE_CHECKLIST.md` and the owner's instructions given in the Session 6 conversation. Where a decision could not be reconstructed with confidence it is listed in section 12 and is **not** guessed here.

**This plan does not replace or reduce `MASTER_AUDIT_SPEC.md`.** The master specification remains the standard for release readiness. Completing any phase below does not complete the corresponding master audit requirements; progress against those is tracked only in `AUDIT_TRACEABILITY.md`, and a fix counts toward verification only after it has been tested against the relevant scenarios.

**Distinction that must not be lost.** The master specification says the first (investigation) phase is strictly read-only. The owner has since authorised remediation work, but only the work defined in this plan, one phase at a time. That authorisation is not a general end to the read-only investigation: audit examination outside an authorised phase stays read-only.

## 1. How work is classified in this plan

| Class | Meaning |
|---|---|
| **AUTHORIZED** | The owner approved it, and (where noted) approved starting it. Scope-limited |
| **DEFERRED** | The owner decided to postpone it; it stays documented and must not be done silently |
| **REQUIRES ADDITIONAL APPROVAL** | Decided in principle or proposed, but a separate explicit owner approval is still needed before it is done |
| **PROHIBITED** | Explicitly forbidden, either permanently or until the owner says otherwise |

"Authorized in principle" and "authorized to start" are different: each phase after Phase 0 needs its own start authorisation.

## 2. Current state (as of this document)

- Repository: `zhrpo/OOT-Tracker`, permanent source repository (D-1). **Public** (the owner set it back to public because GitHub Free does not support branch protection on private repositories). Ruleset `protect-main` (ID 26902224): active on `main`; pull request required (0 approvals); force pushes blocked; deletion blocked; linear history required; bypass list empty (verified with the authenticated CLI). Merge commits disabled at repository level (owner-reported), squash and rebase enabled; the ruleset's `allowed_merge_methods` still lists "merge" (see section 12). Pages off; secret scanning and push protection on (owner-reported); no tag ruleset yet; no baseline tag yet.
- History: two real-progress files were purged from all history on 2026-11-09 (`proj/got_old.json`, `proj/mig_final.json`). V-1 to V-10 all passed on a fresh clone of the real remote. Remote `main` = `8e5d4bdd7df1aa249cbcddb3d1b83668f7a0d21b` (old `16ceab46…` is obsolete). Offline backup at `C:\oot-prepurge-backup\` (contains the purged files, never to be exposed); purge workspace `C:\oot-purge-work\`. The old working copy `C:\Users\harpz\Documents\GitHub\OOT-Tracker` holds pre-purge history and must not be pulled into or reused.
- Phase 0: **complete**, local commit `8a5a9be9bd285aea882baefa2a2d977b875c1ae4` on branch `fix/phase-0` in `C:\Users\harpz\Documents\GitHub\OOT-Tracker-clean`. **Not pushed.** Runner result: 25 PASS, 12 UNCHECKED, 6 XFAIL, 0 FAIL. Build hash `d9f96a343e7b0f6182cb5db1d8b8d11bb39595271d0b580bbcdeab557016a9ac`, unchanged.
- Phases 1 to 5: **not started and not yet authorised to start.**
- Production, live tracker, production data, GitHub settings and deployment: untouched by Claude.

## 3. Approved decisions (Session 6 Scope v3, D-1 to D-31, plus later decisions)

All of these are in force. Short wording here; the full wording is in `SESSION_6_IMPLEMENTATION_SCOPE.md` section 1 and in the sections cited.

| # | Decision | Class |
|---|---|---|
| D-1 | Option A: `zhrpo/OOT-Tracker` is the permanent source repository. `proj/` is the application source; audit documents and scripts live under `audit/` (history preserved); implementation on `fix/*` branches; `main` protected; LF line endings enforced by `.gitattributes`; audit restrictions kept and separate implementation rules added | AUTHORIZED, done in Phase 0 |
| D-2 | No interim release after Phase 2. F-013 and F-022 must be resolved before any release. Phases 0 to 3 are required scope; Phase 4 is the real-provider verification gate. The owner does all publishing; Claude may prepare a verified build, hash and release notes and never publishes or deploys | AUTHORIZED rule |
| D-3 | Q3, sync conflicts: strict logical clocks. No wall-clock time decides a winner. Logical counters and deterministic device ids break ties. Causal order is preserved. The ambiguity of genuinely concurrent offline edits is documented. A visible notice names the row when another device's edit replaces a local change. Option C (wall-clock tie-break) is not implemented | AUTHORIZED design, Phase 3 |
| D-4 | Q4, migration and backup: migrate only exact matches; never touch ambiguous saves; back up the complete original save first, never overwrite a backup, verify the backup was written before changing the save; remove only `DT-1`, `DT-2`, `DT-3`, `MKT-1`; record a marker; test every branch on synthetic fixtures; verify restore reproduces the original exactly. A visible "Restore my earlier save" action in the settings/account area with confirmation; backups kept until the owner deletes them; the real save is never read or modified | AUTHORIZED design, Phase 2 |
| D-5 | F-033, Rule A: both rows of each Magic Meter twin pair require the Magic Meter; changes limited to rows that lack it, verified against source first | AUTHORIZED, Phase 1 |
| D-6 | Q2: remove `index.html` and `themed.html` only after confirming no build, test or runtime dependency uses them | AUTHORIZED, done in Phase 0 |
| D-7 | F-042 and F-043 deferred; disagreements stay documented | DEFERRED |
| D-8 | F-044 and F-045 included in the data batch | AUTHORIZED, Phase 1 |
| D-9 | F-029 and F-045 save impact accepted (earlier rows may appear completed); release note required | AUTHORIZED rule |
| D-10 | F-016: test hooks behind a **build-time** test flag, completely excluded from production builds | AUTHORIZED, Phase 1 |
| D-11 | F-028: day/night filter extended to Skulltulas and Hearts as well as Quests | AUTHORIZED, Phase 1 |
| D-12 | Q5: real-provider verification only after Phase 3 passes; two independent authenticated accounts are not assumed; cross-account isolation stays unverified without them | AUTHORIZED gate, Phase 4 |
| D-13 | Publishing is under the owner's exclusive control | AUTHORIZED rule |
| D-14 | U-2: the owner configures `main` branch protection | Done (ruleset 26902224) |
| D-15 | U-3: HC-2, GF-2 and CL-2 deferred until independently source-verified; only high-confidence corrections in Phase 1; deferred findings keep their classification | DEFERRED |
| D-16 | U-5: server revision / compare-and-set capability is checked only in Phase 4; nothing is assumed | DEFERRED to Phase 4 |
| D-17 | U-6: no arbitrary numeric counter limit; the Phase 3 design must preserve causal order, detect suspiciously large counters, never silently discard valid edits, explain reconciliation and preserve pending local operations. The proof-based policy is approved **conditionally** (conditions C-1 to C-6, section 6 below) | AUTHORIZED with conditions, Phase 3 |
| D-18 | U-7: older builds will not understand the new sync format but must not overwrite or destroy progress stored in it; cutover safeguards S-1 to S-6 (section 6) are tested before release; no compatibility mirror unless the design shows it necessary | AUTHORIZED requirement, Phase 3 |
| D-19 | U-8: install Python dependencies and Playwright on the Windows machine in Phase 0, using the existing Python 3.11 | AUTHORIZED, done in Phase 0 |
| D-20 | U-9: two independent accounts unresolved until Phase 4 | Open by decision |
| D-21 | U-10: a build-time flag satisfies F-016; hooks absent from production builds | AUTHORIZED |
| D-22 | U-1: the owner changes repository visibility; the two JSON files were inspected locally (contents not printed) | Done |
| D-23 | Q-A: SQ-42 is included in the Magic Meter review; verify its acquisition requirements before any change | AUTHORIZED, conditional on the verification |
| D-24 | Q-B: counter-anomaly policy approved conditionally (C-1 to C-6) | AUTHORIZED with conditions |
| D-25 | Q-C: remove the two player-data files from the tree and make `shot_r3.py` synthetic | AUTHORIZED, done (files absent; shot_r3 uses a synthetic fixture) |
| D-26 | History purge of those two files | AUTHORIZED separately and executed 2026-11-09 under explicit approvals; verified V-1 to V-10 |
| D-27 | Q-D: repository private, later restored to public by the owner | Superseded: now public (see section 2) |
| D-28 | Q-E: owner configures branch protection including blocking force pushes | Done |
| D-29 | Q-F: independent accounts unresolved until Phase 4 | Open by decision |
| D-30 | Q-G: provider revision capability deferred to Phase 4 | DEFERRED |
| D-31 | Q-H: Switch 2 IT-22 verified independently; no change | Done |

**Later decisions (after Scope v3):**

| # | Decision | Class |
|---|---|---|
| L-1 | Git workflow: all implementation on `fix/*` branches; pull requests required for every change to `main`; Claude may prepare and open pull requests; the owner reviews and merges; squash merging preferred; no direct pushes to `main` | AUTHORIZED rule, permanent |
| L-2 | Documentation updates reflecting the verified GitHub configuration and workflow are approved, but only after the history cleanup was resolved, and never combined with the history rewrite. The cleanup is resolved; the broad documentation reconciliation (section 11) has not been separately scheduled | AUTHORIZED in principle; timing REQUIRES ADDITIONAL APPROVAL |
| L-3 | Phase 0 authorised and its exclusions defined (section 4, Phase 0 and section 10) | AUTHORIZED, done |
| L-4 | The merge-method discrepancy (the ruleset lists "merge") is a documentation and configuration review item for later; not to be changed during Phase 0 | DEFERRED |
| L-5 | Do not create the baseline tag yet; do not create the tag ruleset yet | PROHIBITED until the owner approves (see section 9) |
| L-6 | Audit governance (this task): the master audit specification is the permanent overarching authority; traceability matrix and README created; CLAUDE.md updated | AUTHORIZED, documentation only |

## 4. Phases

Order 0, 1, 2, 3, 4, 5. A phase starts only after the previous exit criterion is met and the owner's start approval is given. Each ends with a report and updates to the audit records and traceability rows. Commits happen on `fix/*` branches; pushes and pull requests only when the owner asks; the owner merges.

### Phase 0: repository, toolchain, baseline, runner. **AUTHORIZED. COMPLETE (local commit 8a5a9be, not pushed).**
Done: clean clone and branch; `audit/` layout; `.gitattributes`; Python 3.11 venv with Playwright and Pillow; repository-relative paths via `audit/lib/oot_env.py`; baseline hash reproduced (LF output fix in `build.py`); unified runner `audit/scripts/run_all.py` with privacy guard and self-test (F-002); stale tests repaired (F-001); `index.html` and `themed.html` removed after a dependency check; player-data files absent and `shot_r3.py` synthetic; `CLAUDE.md` rewritten. Results and exclusions: `PHASE_0_REPORT.md`. Phase 0 changed no tracker behaviour.

### Phase 1: F-011, F-009, high-confidence data corrections, F-016, F-028 (one rebuild). **NOT yet authorised to start (REQUIRES ADDITIONAL APPROVAL).**
- F-011: one `saveLocal()` call at `app.js` L489. F-009: `well.after` gains `prelude` in `main.py`.
- Data batch (high confidence only): F-029 (MQ-17 gives IT-2 and IT-63; IT-63 requires MQ-17; text), F-030 (GAN-1 needs the Hookshot only), F-031 rows DMT-1, HF-2, IC-3, HP-15, F-032 rows ZR-1 and GV-3 (and the Switch 2 note on GV-3), F-044 (HP-29), F-045 (MQ-31 gains IT-22 and IT-21), F-033 (SQ-25 and SQ-40, and SQ-42 if the verification step does not contradict the analysis).
- **Not in Phase 1:** HC-2, GF-2, CL-2 (DEFERRED), F-042, F-043 (DEFERRED), F-010 and other hygiene items unless separately approved.
- F-033 analysis (read-only, Session 6): IT-22/SQ-20 (N64, 3DS) already agree; IT-21 is the meter itself; Switch 2 IT-22/SQ-19 agree (same fairy gives meter and Din's Fire); SQ-25 and SQ-40 lack IT-21; SQ-42 lacks IT-21. SQ-42 verification (before any edit): re-read row and Switch 2 override; the vendored randomizer extract has no fairy reward rules; find one independent source on whether Nayru's Love can be received before the Magic Meter; if the source contradicts the analysis, stop and ask. Rule A is a tracker design rule, not a randomizer requirement.
- F-016: the five hooks (`__oot`, `__ootDefVer`, `__ootNoAsk`, `__ootNoVeil`, `__ootOpen`) compiled in only with `build.py --test-hooks`; the shipping build omits the code; a runner check asserts none of the five names is in the shipping file. The test harness (`pwpatch.py`) and the runner use the test variant.
- F-028: the time filter appears on Skulltulas and Hearts (same rule as Quests).
- Affected: `proj/main.py`, `gate.py`, `fix4.py`, `links.py`, `vers.py`, `build.py`, `app.js`, `template.html`, `pwpatch.py`.
- Exit: the acceptance table (section 8); a rebuild diff shows only the intended rows change in all three versions.

### Phase 2: F-012 and the Q4 migration. **NOT yet authorised to start.**
`SKULL_DEFAULTS = []`; remove the `app.js` L136 seeding; adjust the build assertion (`build.py` L563 to L564); update the legacy banner text; implement the Q4 migration (verify the backup is written, then modify) with marker and restore UI. Runs before and independently of the Phase 3 format change. Affected: `data.py`, `build.py`, `app.js`, `template.html`.

### Phase 3: sync redesign (one unit). **NOT yet authorised to start.**
F-013, F-022, F-019, F-020, F-038, F-039 together; design in section 6 (REMEDIATION_PLAN 1.1 to 1.4 as amended by D-3). Affected: `app.js` (`flush`, `initRemote`, `saveLocal`, `normalize` call sites, progress-code import, status text), `template.html` (`#sync`), harness stand-ins. Exit: regression suite in section 8 passes under both stand-in models (M1, M2).

### Phase 4: real-provider verification (gate). **NOT yet authorised; blocked on Phase 3 and on the owner's go-ahead on the day.**
New test artifact with a new id, never the production slug; isolation proven before any write; synthetic data only; production metadata recorded before and after; stop if isolation cannot be shown. Publishing even the test artifact needs the owner's approval that day. Learns: server-revision/compare-and-set capability (D-16), snapshot order and duplication, cache behaviour, behaviour across reload, size limits, error codes. Cross-account isolation stays **unverified** unless two independent authenticated accounts exist (D-12, D-29).

### Phase 5: release preparation only. **NOT yet authorised.**
Full runner green, rebuild and hash recorded, release notes drafted, previous live artifact version and hash recorded for rollback. **The owner publishes.**

## 5. Findings: in scope, deferred, outside the plan

- **In scope (Phases 0 to 3):** F-001, F-002, F-003 (done in Phase 0), F-009, F-011, F-012, F-013, F-016, F-019, F-020, F-022, F-028, F-029, F-030, F-033, F-038, F-039, F-044, F-045, and the high-confidence parts of F-031 (DMT-1, HF-2, IC-3, HP-15) and F-032 (ZR-1, GV-3).
- **Gate:** F-021 (Phase 4).
- **Deferred, classifications unchanged:** F-031 row HC-2; F-032 rows GF-2 and CL-2; F-042; F-043; F-035; F-036; unverified parts of F-040 and F-041.
- **Hygiene, not scheduled:** F-005, F-010, F-014, F-023, F-024, F-025 (F-010 is Low and has not been approved).
- **No action:** F-007, F-008, F-015, F-017, F-018, F-026/F-034, F-027, F-037.
- **F-004** resolved by D-1. **Proposed F-046** (real-progress files in a public repository): not registered until the owner acknowledges it.

## 6. Design and migration requirements (binding on Phases 2 and 3)

### Sync (Phase 3; D-3, D-17, D-18, D-24)
- Document v3 at a new path (`oot_tracker_v3`); the v2 document is read once, imported with counter 0 and never deleted.
- Each tick or untick is an entry `[on, counter, deviceId]` (untick is a tombstone). One user action stamps one counter on every key it changes. The counter is one more than the highest counter ever seen on this device (local or remote, any key), persisted. No wall-clock value is read for ordering.
- Per key, the higher `(counter, deviceId)` wins (commutative, associative, idempotent). Every snapshot, the first included, is merged, never assigned.
- Persisted pending set, retry with backoff, status text derived from state, upload when no document exists, `#sync` as a polite live region.
- Visible notice when a merge replaces a local change not yet acknowledged (or made after the last merge) with a different remote value: names the row; causally later arrivals produce no notice.
- Documented ambiguity: genuinely concurrent offline edits to the same row are decided by counter then device id, not by real time.
- Validation (F-038): ids checked against known plus retired ids; counters must be safe integers.
- **Approved conditions for anomalous counters (D-24):**
  - C-1 Operation-count validation: each device keeps a persisted monotonic operation count `n[device]` written with every save. A lower received `n[device]` is a stale or replayed document (take the maximum, no data loss). An entry counter must be a non-negative safe integer and must not exceed the sum of all `n`. A violation flags the entry.
  - C-2 Duplicate and replay handling: an entry is identified by `(key, counter, device)`; identical re-delivery changes nothing; an older entry arriving after a newer one changes nothing; the same identity with a different value is a collision: both are logged, a fixed deterministic rule (to be fixed in the Phase 3 design note) gives the same result on every device, and the user is told.
  - C-3 Pending local edits are never cleared, dropped or rolled back by a merge, flagged entry, retry failure or restart; if a flagged entry beats a pending operation it is re-issued with a counter above it and the user sees a notice naming the rows.
  - C-4 A flagged but representable counter is ordered like any other and adopted by the clock, so later edits win; a counter beyond the safe-integer guard or not an integer is quarantined (kept in the document and the log, not applied, not deleted), the row keeps its best valid entry and the user is told. Quarantine applies only to provably invalid entries.
  - C-5 No valid operation is silently discarded.
  - C-6 The extra document field `n` is accepted; the weaker no-extra-field fallback only with the owner's approval if C-1 proves unworkable.
- **Cutover safeguards (D-18), each tested before release:** S-1 new document path and new localStorage key, old key and v2 document untouched; S-2 later v2 keys are imported only as additions with counter 0, absence in v2 never unticks; S-3 an older tab still open keeps writing only the old key, which v3 reads only through the marker-guarded import; S-4 v3 refuses to treat a local save with a v3 marker but no valid entry map as empty; S-5 after v3 data exists any v2 write leaves the v3 document byte-identical; S-6 release notes say older builds do not show v3 progress.
- Server revisions or compare-and-set are not used or assumed before Phase 4; the design must work without them.

### Migration (Phase 2; D-4)
Trigger: the unprefixed ids present are exactly a subset of the four defaults, there are no version-prefixed ids and no other unprefixed ids, and no setting beyond the defaults was ever stored. In every other case change nothing and keep the existing prompt. Steps: write a full local backup under a new key and an account `backup` field; verify by reading it back; only then remove exactly those ids and record a marker; never overwrite an existing backup; restore reproduces the original byte for byte after a confirmation; backups are kept until the owner deletes them; new players start with `defaults = []`. Tests (synthetic): (a) exact subset migrates; (b) four plus another id untouched; (c) any prefixed id untouched; (d) a stored setting untouched; (e) an existing backup is not overwritten; (f) a failed or unverifiable backup leaves the save unchanged; (g) restore equals the original; (h) cancel changes nothing; (i) the marker prevents repeats; (j) the backup is read back before the save is modified.

## 7. Release gates (all required before the owner is told a build is ready)

1. Phases 0 to 3 complete; the runner is green apart from documented, expected exceptions.
2. No open release blocker (F-013, F-022, F-009, F-019, F-012 fixed and tested; F-021 resolved or left "unverified" with reasons the owner accepts in writing).
3. Phase 4 completed under the Q5 conditions, or the owner explicitly waives it knowing sync is then unverified on the real provider.
4. The shipping build contains none of the five hooks and its hash reproduces from a clean LF checkout.
5. Q4 and cutover tests pass on every branch; restore is tested byte for byte.
6. The privacy guard passes.
7. Release notes read by the owner.
8. Production untouched by Claude; publishing by the owner only.
9. **The requirements of `MASTER_AUDIT_SPEC.md` section 13G are met and the traceability matrix has been reconciled.** These plan gates are necessary but not sufficient for a release recommendation.

Release notes must state: players who ticked the four defaults before the fix keep them if indistinguishable from real ticks; players past MQ-17 or MQ-31 may see earlier rows (Light Medallion, Din's Fire and Magic Meter prerequisites) become complete; same-row edits from different devices are resolved by a documented rule, not real time, with a visible notice; older builds do not show progress saved in the new format; cross-account isolation is unverified unless two independent accounts were used; HC-2, GF-2, CL-2, F-035, F-036, F-042 and F-043 remain unverified or deferred.

## 8. Acceptance criteria and regression tests per finding

Every test exits non-zero on failure and runs in `run_all.py`; synthetic data only; each fix has a test that fails on the baseline (proved on a disposable copy). Behaviour tests run for n64, 3ds and sw2; sync tests also with the page opened on each version.

| Finding | Acceptance | Tests |
|---|---|---|
| F-002 | One command, one pass/fail; injected failure fails it | runner self-test (done P0) |
| F-001 | Two stale tests replaced and passing on the shipped page | test.py, test_contrast.py (done P0) |
| F-003 / Q2 | Build has no `index.html` / `themed.html`; nothing references them | build, runner (done P0) |
| F-011 | A migrating load keeps lock, filters, tab, open walkthroughs | test_engine N2 flips to PASS |
| F-009 | MQ-34 or MQ-30 alone ticks MQ-22; no MQ-22 lock after MQ-41; S18 still passes; fixture: `sw2:MQ-41` without MQ-22 gains it and keeps settings | S1b x3, new tests, graph_check, build_audit B1-B8, test_progression_s4 |
| F-029 | MQ-17 gives IT-2 and IT-63; IT-63 requires MQ-17; text corrected; fixture past MQ-17 gains IT-63 | data_audit_s5 D1, new fixture |
| F-030 | GAN-1 needs the Hookshot only | D2 |
| F-031 (high) | DMT-1, HF-2, IC-3, HP-15 corrected; HC-2 unchanged | D3, D4, D8, D10 pass; D9 still fails (deferred) |
| F-032 (high) | ZR-1, GV-3 corrected; GF-2, CL-2 unchanged | D5 passes; D6 split per row (GV-3 passes; GF-2 and CL-2 still fail, deferred) |
| F-033 | Verification first; SQ-25, SQ-40 (and SQ-42 per verification) require the meter in all versions; Switch 2 IT-22/SQ-19 and SQ-20 unchanged | new twin-row tests per version |
| F-044 | HP-29 ready without a Hookshot | reviewed list updated; new row test |
| F-045 | MQ-31 not ready without Din's Fire and Magic Meter; fixture past MQ-31 gains earlier rows | data_audit_s5c, new fixture |
| Data batch | Rebuild diff shows only intended rows in all versions; data_audit outcomes limited to deferred rows | scripts above; runner expected-failure list updated |
| F-016 | Shipping file contains none of the five hook names; hooks variant works for the suite | build check in runner |
| F-028 | Time filter on Skulltulas, Hearts, Quests; ignored elsewhere; persists; labels unchanged | extend P3/P4 |
| F-012 | New player in each default version starts with zero ticks; H2 shows only `sw2:LW-1`; banner hidden for a new player; banner and claim still work for a synthetic pre-version save | N4, H2, new banner tests |
| Q4 | Branches (a) to (j) in section 6 | synthetic fixtures |
| F-013, F-022 | All 26 runs of test_sync and 6 of test_sync_s4 pass under M1 and M2; new B4, I1, O1, M1-v2, Z1 (seeded, at least 50 seeds, 3 devices x 200 operations) | REMEDIATION_PLAN 1.5 with the D-3 changes |
| D-3 | Causal case: later untick wins everywhere; concurrent case deterministic and identical on all devices and the server regardless of delivery order; no test depends on the device clock (clocks at +1 h and -1 h give the same result); restart with pending changes; notice names the row for a replaced pending change; none for a causally later arrival | new tests |
| D-24 | Tests for C-1 to C-6 (impossible counter flagged without reverting the row; stale or replayed document ignored without data loss; duplicates, old and out-of-order entries change nothing; collision rule identical on all devices; pending edits survive flagged entries, retries, restarts and are re-issued with a notice; overflow-range counter quarantined; no valid operation lost without a notice) | new tests |
| D-18 | S-1 to S-5 using the baseline build as the old client against the same stand-in | cutover tests |
| F-019 | Status derived from state; never "Saved" while failing; correct text after retry | S1 status checks |
| F-020 | Out-of-order and duplicate snapshots change nothing | O1 |
| F-038 | Junk ids dropped and not written back; array capped; malformed counters flagged | security_s5 S3 flips to PASS |
| F-039 | `#sync` is `aria-live="polite"`; distinct failed-save wording | a11y_s5 live-region check |
| Privacy guard | Fails on any real-save-shaped file or on fixtures without `"synthetic": true` | runner (done P0) |
| Whole suite | The legacy scripts that give a verdict keep passing; counts recorded before and after | runner |

A fix does not change the matching `AUDIT_TRACEABILITY.md` rows until these tests have been run and recorded.

## 9. Backup, rollback and recovery

- Repository: the pre-purge history exists only in `C:\oot-prepurge-backup\` (mirror and bundle, verified; contains real-progress files; never uploaded, shared or committed; deleted only when the owner decides). Each phase is a `fix/*` branch; a phase is undone by discarding the branch or reverting its merge. The old-to-new commit mapping is in `C:\oot-purge-work\clone\.git\filter-repo\commit-map` (old `16ceab46…` is new `8e5d4bdd…`; all nine hashes changed).
- The baseline tag `audit-baseline-s5` is to be created on the rewritten commit that corresponds to the old `16ceab4` (`8e5d4bd…`) and a tag ruleset for `audit-baseline-*` afterwards. **Neither may be created until the owner approves (L-5).**
- Player data: Q4 backup key and account `backup` field verified before any change and never overwritten; v3 leaves v2 untouched (S-1). No real save is ever read.
- Release rollback (owner's action): the previous live artifact version and hash are recorded read-only before release; rollback means the owner republishes that build. Progress made in v3 after the switch is not shown by an older build (accepted) but is not deleted.
- Test artifact (Phase 4): separate id and namespace; deleting it removes nothing from production; production metadata compared before and after.

## 10. PROHIBITED actions

Without a separate, explicit, written owner approval for that exact action, Claude must not:
- push to `main`, merge any pull request, enable auto-merge, or disable or modify ruleset `protect-main`;
- change repository visibility, rulesets, merge settings or any other GitHub setting;
- publish, deploy, overwrite or modify the live artifact, or publish even a test artifact (Phase 4 needs approval on the day);
- read, access, compare, migrate or modify the owner's real saves or production database records; add any real save or progress export to the repository, a fixture or a test;
- rewrite Git history again, force-push, delete the offline backup, `C:\oot-purge-work\` or the old working copy, or pull into the old working copy;
- create the baseline tag or the tag ruleset (L-5);
- begin Phase 1, 2, 3, 4 or 5 without that phase's start approval;
- change tracker behaviour, data, save migration, sync behaviour or sync format, test hooks, or the day/night filter outside an authorised phase; implement any of F-029 to F-045 fixes outside Phase 1 (and the Phase 2 and 3 items outside those phases);
- implement the HC-2, GF-2, CL-2, F-042 or F-043 changes (deferred);
- introduce a wall-clock tie-break (Option C) or an arbitrary numeric counter limit;
- treat completion of an implementation phase as completion of master audit requirements, or issue a release-readiness recommendation before the section 13G conditions are met;
- register F-046 before the owner acknowledges it;
- expose credentials, tokens or account information in any report.

## 11. REQUIRES ADDITIONAL APPROVAL (decided in principle or proposed, not yet approved to do)

1. Starting Phase 1, 2, 3, 4 and 5 (each separately).
2. Pushing `fix/phase-0` and opening its pull request; pushing any later governance or phase commit.
3. The broad documentation reconciliation approved in principle by L-2: update `NEXT_SESSION.md` (private repository statement, push to `main`, owner decisions list), `SESSION_6_IMPLEMENTATION_SCOPE.md` and `PRE_PURGE_CHECKLIST.md` (private repository, force-push exception, tag steps, old paths), `REMEDIATION_PLAN.md` (title, section order, the wall-clock clock in 1.2, 1.4 and 7.1 replaced by D-3), F-004 and F-016 statuses, F-006 note about the removed files, F-031/F-032 deferral notes, AUDIT_PROGRESS and AUDIT_TESTS Session 6 entries.
4. Creating the baseline tag and the tag ruleset (L-5).
5. Ruleset's `allowed_merge_methods` (remove "merge" so it matches the decision that merge commits are disabled) and any other GitHub setting change.
6. The Phase 3 design note: the deterministic collision rule for C-2 and the wording of notices, before Phase 3 implementation.
7. Registering proposed F-046.
8. Scheduling and approving the Phase 4 test-artifact publication on the day, and confirming whether two independent accounts will exist.
9. Further audit work that is not remediation (it stays read-only): reading the unread source files, per-entry game-data verification, UX evaluation, real screen reader and browser zoom testing, HTML validation, performance and memory testing. These are required by the master specification and tracked in the matrix; they are not part of the remediation phases above.

## 12. Decisions that could not be reconstructed with confidence (owner to answer)

1. **Timing and vehicle of the broad documentation reconciliation (section 11, item 3).** L-2 approves it "after the history cleanup is resolved", which is now the case, but the owner has not said when or in which pull request. Proposed: its own `fix/*` pull request, reviewed before Phase 1. Not assumed.
2. **Baseline tag target and name.** The owner said not to create it yet. The old hash `16ceab4` no longer exists in the remote; the plan above assumes `audit-baseline-s5` on `8e5d4bd…`. Not confirmed.
3. **Whether Phase 0 should be pushed as one pull request or combined with the governance documents.** The governance documents are a separate local commit on the same branch; how they reach `main` is not decided.
4. **Ruleset merge methods.** Whether to remove "merge" from `allowed_merge_methods` is open (L-4).
5. **SQ-42 inclusion** depends on the Phase 1 verification step; outcome unknown.
6. **C-2 collision rule and notice wording** are not fixed (Phase 3 design note).
7. **Q-F and Q-G** (independent accounts; provider revision capability) are open by decision.
8. **Whether the unscheduled hygiene items (F-005, F-010, F-014, F-023, F-024, F-025) and the deferred rows will be scheduled** in any later phase is not decided.
9. **How the remaining master-audit work (section 11, item 9) will be scheduled**, since it is audit examination, not remediation, and the plan does not authorise a start date.
