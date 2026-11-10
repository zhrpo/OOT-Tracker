# Session 6 implementation scope (DRAFT v3 for owner approval)

Written 2026-11-09 from the repository at `16ceab4`; revised after the owner's answers to U-1…U-10 and Q-A…Q-H (repository confirmed private). **Documentation only.** Nothing here is implemented, and nothing is authorized until the owner approves this document in writing. Until then CLAUDE.md audit rules stay in force: no fixes, no branches, no tags, no restructuring, no installs, no builds, no test runs, no commits or pushes, no publishing, no production or save access.

Sources: NEXT_SESSION.md, REMEDIATION_PLAN.md (§1–§8), AUDIT_FINDINGS.md (F-001…F-045), owner decisions of 2026-11-09.

---

## 0. Prerequisites (owner actions, before any implementation)

| # | Prerequisite | Owner / status |
|---|---|---|
| P-1 | Repository **private**. **Confirmed by the owner on 2026-11-09.** (Claude's own unauthenticated checks returned HTTP 200/public earlier in the session and 404 later, consistent with this.) Claude never changes visibility and re-checks read-only before any push. | Owner, **done** |
| P-2 | `main` branch protection configured by the owner **before implementation**, including blocking force-pushes (exact settings: §7.7). Claude does not configure or attempt it. The history purge (§7.6) needs a force-push, so it needs a temporary, owner-controlled exception to that block. | Owner, before implementation |
| P-3 | Approved: remove the two player-data files from the working tree and make `shot_r3.py` synthetic (D-25). Recommended, **not yet approved for execution**: purge them from Git history (D-26, §7.6). | Owner; purge execution needs separate approval |
| P-4 | Approval of this scope document. Phase 0 then needs its own start approval. | Owner |
| P-5 | Phase 4 only: a go-ahead on the day; availability of two independent authenticated accounts is **unconfirmed** (U-9). | Owner |

---

## 1. Decisions recorded (owner-approved, 2026-11-09)

| # | Decision | Record |
|---|---|---|
| D-1 | **Repository (Option A).** `zhrpo/OOT-Tracker` becomes the permanent source repository. `proj/` stays the application source; audit docs and scripts move under `audit/` (history preserved with `git mv`); the Session 5 baseline is tagged `audit-baseline-s5`; implementation on `fix/*` branches; `main` protected; `.gitattributes` enforces LF; audit restrictions kept, implementation rules added (§9). | Approved. Restructure not yet authorized. |
| D-2 | **Release strategy.** No interim release after Phase 2. F-013 and F-022 must be resolved before any release. Phases 0–3 are required scope; Phase 4 is the real-provider verification gate. The owner does all publishing; Claude may prepare a verified build, hash and release notes and never publishes or deploys. | Approved. |
| D-3 | **Q3: Option A, strict logical clocks.** No wall-clock time decides a winner. Logical counters plus deterministic device ids break ties. Causal order preserved when a device has seen another's edit. Concurrent-offline ambiguity documented. Visible notice, naming the row, when another device's edit replaces a local change. Option C (wall-clock tie-break) not implemented. | Approved. |
| D-4 | **Q4: migration and backup.** Migrate only exact-match saves; never touch ambiguous saves; back up the complete original first; never overwrite an existing backup; **verify the backup was written before modifying the original**; remove only the four ids; record a migration marker; test every branch on synthetic fixtures; verify restore reproduces the original exactly. Restore: visible **"Restore my earlier save"** action in the settings/account area, confirmation before replacing current progress. Backups kept until the owner deletes them. The owner's real save is never read or modified. | Approved. |
| D-5 | **F-033, Rule A.** Both rows of each Magic Meter twin pair require the Magic Meter; changes limited to the rows that lack it, verified against source first (§4, result in §3 Phase 1). | Approved (verification done: §3 Phase 1). |
| D-6 | **Q2.** Remove `index.html` / `themed.html` only after confirming no build, test or runtime dependency uses them. | Approved, conditional. |
| D-7 | **F-042 / F-043** deferred; stay documented. | Approved. |
| D-8 | **F-044 and F-045** included. | Approved. |
| D-9 | **F-029 / F-045 save impact:** accept earlier rows appearing completed where appropriate; release note required. | Approved. |
| D-10 | **F-016:** hooks behind a **build-time** test flag; completely excluded from production builds, not merely hidden in the UI. | Approved. |
| D-11 | **F-028:** day/night filter extended to Skulltulas and Hearts as well as Quests. | Approved. |
| D-12 | **Q5:** real-provider verification only after Phase 3 passes; two independent accounts not assumed; otherwise cross-account isolation stays **unverified**. | Approved. |
| D-13 | **Publishing:** exclusive owner control. | Approved. |
| D-14 | **U-2:** the owner configures `main` branch protection before implementation (P-2). Claude does not attempt it. | Approved. |
| D-15 | **U-3:** **HC-2, GF-2, CL-2 deferred** until independently source-verified. Only high-confidence corrections in Phase 1. The deferred findings keep their classification (F-031 and F-032 stay "Confirmed defect", now partially fixed). | Approved. |
| D-16 | **U-5:** whether the provider offers server revisions / compare-and-set is **deferred to Phase 4**. No capability is assumed. | Approved. |
| D-17 | **U-6:** no arbitrary numeric counter limit. The Phase 3 design must detect suspiciously large counters, never silently discard valid edits, explain reconciliation, and preserve pending local operations. The proposed policy (§3 Phase 3, "Anomaly policy") needs the owner's approval before it is implemented. | Approved as requirement; policy **not yet approved**. |
| D-18 | **U-7:** older builds will not understand the new sync format, but must not be able to overwrite or destroy progress stored in it. Safeguards are specified (§3 Phase 3, "Cutover safeguards") and tested before release. No compatibility mirror unless the design shows it is necessary. | Approved as requirement. |
| D-19 | **U-8:** installing Python dependencies and Playwright on this Windows machine is approved **as part of Phase 0**, using the existing Python 3.11 (not the Store `python3` stub). | Approved (applies only once Phase 0 is authorized). |
| D-20 | **U-9:** two independent authenticated accounts remain unconfirmed; an open Phase 4 dependency. | Open by decision. |
| D-21 | **U-10:** a build-time test flag satisfies the F-016 requirement; hooks must not be present in production builds. | Approved. |
| D-22 | **U-1:** owner changes repository visibility (P-1). Local inspection of the two JSON files done (§7.2). No deletion, history rewrite or visibility change without separate approval. | Approved; file/history action pending. |
| D-23 | **Q-A (F-033):** SQ-42 (Nayru's Love quest) is included in the Magic Meter consistency review. Its actual acquisition requirements are verified before any change (result and procedure: §3 Phase 1). | Approved. |
| D-24 | **Q-B (counter anomalies):** the proof-based policy is approved **conditionally**: operation-count validation, duplicate/replay handling, preservation of pending local edits, protection against inflated counters; no valid operation is silently discarded (§3 Phase 3, "Approved conditions"). | Approved with conditions. |
| D-25 | **Q-C (player-data files):** remove `proj/got_old.json` and `proj/mig_final.json` from the working tree; replace the real-progress input in `proj/shot_r3.py` with synthetic data. | Approved. Executed in Phase 0, only after the scope is approved. |
| D-26 | **Git history:** purging the two files from history is **recommended** because the repository was previously public. Backup, rewrite, force-push and baseline-tag procedure documented (§7.6). | Recommended. **Not executed; execution needs separate approval.** |
| D-27 | **Q-D:** repository is now private (owner confirmation). | Recorded. |
| D-28 | **Q-E:** the owner configures `main` branch protection, including blocking force-pushes, before implementation. | Owner action. |
| D-29 | **Q-F:** availability of two independent authenticated accounts stays unresolved until Phase 4. | Open by decision. |
| D-30 | **Q-G:** provider revision / compare-and-set verification is deferred to Phase 4. | Deferred. |
| D-31 | **Q-H:** Switch 2 IT-22 requirements verified independently (result: §3 Phase 1). | Done (documentation check). |

Earlier decisions that still stand: Q3/Q4/Q5 conditions (AUDIT_PROGRESS.md), D1 isolation rule, production read-only.

---

## 2. Findings in and out of scope

**In scope (Phases 0–3):** F-001, F-002, F-003 (conditional), F-009, F-011, F-012, F-013, F-016, F-019, F-020, F-022, F-028, F-029, F-030, F-033, F-038, F-039, F-044, F-045, and the **high-confidence** parts of F-031 (DMT-1, HF-2, IC-3, HP-15) and F-032 (ZR-1, GV-3).
**Gate:** F-021 (Phase 4).
**Deferred, documented, classification unchanged:** F-031 row HC-2; F-032 rows GF-2, CL-2; F-042; F-043; F-035; F-036; and the unverified parts of F-040 and F-041.
**Hygiene, not scheduled:** F-005, F-010, F-014, F-023, F-024, F-025. (F-010 is Low and unapproved; listed so it is not lost.)
**No action:** F-007, F-008, F-015, F-017, F-018, F-026/F-034, F-027, F-037.
**F-004** is resolved by D-1 after the restructure. **Proposed F-046** (player-data files in a public repository) is not registered until the owner acknowledges it.

---

## 3. Phases, dependencies, affected files

Order: 0 → 1 → 2 → 3 → 4 → 5. Each phase starts only after the previous exit criterion and the owner's start approval. Each ends with a documentation update and a report. Commits and pushes happen only when the owner asks (and never while P-1 is unconfirmed).

### Phase 0: Repository, toolchain, baseline, runner
1. Verify P-1, P-2 (read-only), record in the phase report.
2. Repository cleanup in the order of §7.6: history purge **only if the owner separately approves its execution** → remove the two player-data files from the tree (D-25) → replace the real input in `shot_r3.py` with synthetic data → then tag the baseline (step 3) on the resulting history.
3. Tag `audit-baseline-s5`; create `fix/phase-0`; add `.gitattributes` (`* text=auto eol=lf`; binary exceptions).
4. Move audit docs, `scripts/`, `testlogs/`, `DEPENDENCY_MAP.*` under `audit/` with `git mv`; update path references (§7.5).
5. Toolchain (D-19): use the existing Python 3.11; create a virtual environment inside the repo (ignored by git); `pip install playwright` and the Playwright browser, or point at the installed Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`) through one environment setting. Pin versions in a `requirements.txt`. Nothing is installed outside the repo's environment.
6. Replace the 70 hard-coded `/home/claude/...` paths with paths resolved from the repository root; `build.py` output path likewise.
7. Rebuild on LF; the shipping file must hash to `d9f96a34…16a9ac`. If it does not, stop and diff (do not proceed).
8. Run every documented script once and compare exit codes with the Session 5 table (baseline record).
9. `audit/scripts/run_all.py` (F-002): per-test timeout; non-zero exit, timeout or non-empty `FAILS:` fails; verdict-less scripts "unchecked"; known-failing scripts listed as expected; self-test with an injected failure on a disposable copy. Replace `test.py` and `test_contrast.py` (F-001).
10. Remove `index.html` / `themed.html` from the build only after the §7.4 dependency check (D-6).
11. Add the **privacy guard** (§7.3) to the runner.
- **Affected:** `proj/build.py`, 70 path-bearing scripts, `proj/test*.py`, `.gitattributes`, `.gitignore`, `requirements.txt`, `CLAUDE.md`, all docs (paths).
- **Exit:** baseline hash reproduced; expected-exit table matches Session 5; runner fails on an injected failure; `themed2.html` content unchanged; privacy guard passes.

### Phase 1: F-011, F-009, high-confidence data corrections, F-016, F-028 (one rebuild)
- **F-011:** `saveLocal()` at `app.js` L489. **F-009:** `well.after += prelude` in `main.py`.
- **Data batch (high confidence only):** F-029 (MQ-17 gives IT-2 and IT-63; IT-63 requires MQ-17; text), F-030 (GAN-1), F-031 rows DMT-1, HF-2, IC-3, HP-15, F-032 rows ZR-1, GV-3 (and the Switch 2 note on GV-3), F-044 (HP-29), F-045 (MQ-31 gains IT-22 and IT-21), F-033 (below). **Not changed:** HC-2, GF-2, CL-2, F-042, F-043.
- **F-033 verification against source (read-only, from the shipped payload `out/themed2.html`, `gate.py`, `extra.py`, `links.py`, `fix4.py`; no rebuild, no test run). Requirement ids: IT-21 Magic Meter, IT-35 bombs, IT-64 Zelda's Lullaby, MQ-13 King Zora step.**

  | Pair | Item row requires | Quest row requires | Result |
  |---|---|---|---|
  | IT-21 Magic Meter / SQ-19 | n/a (the meter itself; cannot require itself) | IT-35, IT-64 | No change possible |
  | IT-22 Din's Fire / SQ-20, N64 and 3DS | IT-35, IT-64, IT-21 | IT-35, IT-64, IT-21 | **Agree. No change.** |
  | **Switch 2 (Q-H):** IT-22 / SQ-19 | IT-22 override: IT-35, IT-64 | SQ-19: IT-35, IT-64 | **Agree.** On Switch 2 the Death Mountain fairy gives the Magic Meter and Din's Fire together, so IT-22 cannot require the meter it receives at the same time. No change. |
  | **Switch 2:** SQ-20 (now the spin-attack fairy, no longer a spell) | n/a | IT-35, IT-64 (override) | Not a Magic Meter pair on Switch 2. No change. |
  | IT-23 Farore's Wind / SQ-25 | MQ-13, IT-21 | MQ-13, IT-35 | **SQ-25 lacks IT-21: change (all versions)** |
  | IT-25 Double Magic / SQ-40 | IT-15, IT-8, IT-21 | IT-15, IT-8 | **SQ-40 lacks IT-21: change (all versions)** |
  | IT-24 Nayru's Love / SQ-42 | MQ-32, MQ-28, MQ-30, IT-21 | IT-53, (IT-11 or IT-17), IT-18, IT-35 | **SQ-42 lacks IT-21.** Candidate change, subject to the verification step below. The two rows also differ in story prerequisites (the item row lists three story steps, the quest row none); that secondary difference is **not** part of this change. |

  **Verification of SQ-42's actual acquisition requirements (Phase 1, before any edit):** (1) re-read the SQ-42 row text and the Switch 2 override (Gerudo's card, hover boots or Longshot, Lens of Truth, bombs; 300-rupee offering on Switch 2); (2) check the OoT Randomizer extract already vendored (`testlogs/s5_rando_extract.json`): it lists the Colossus Great Fairy Fountain region with entry condition `True`, but the extract does **not** contain the fairy reward location rules, so it cannot show whether the spell needs the meter; (3) look for one independent source stating whether Nayru's Love can be received before the Magic Meter. The Magic Meter requirement on the other twins is a **tracker design rule** (Rule A: you cannot use the spell without the meter), not something the randomizer imposes. Rule: if verification shows the quest can be done without the meter in the game, Rule A is applied as a deliberate consistency choice and documented as such in the help text; if verification shows anything that contradicts the table above, stop and ask. **Changes: SQ-25 and SQ-40, and SQ-42 if the verification step does not contradict the table.** Nothing is changed before the owner approves the scope.
- **F-016 (build-time flag):** the five hooks (`__oot`, `__ootDefVer`, `__ootNoAsk`, `__ootNoVeil`, `__ootOpen`) are compiled in only when `build.py --test-hooks` is passed. The shipping build omits the code itself (not a hidden or disabled path). The runner builds and tests the hooks variant; the shipping variant is checked, by a text search of the built file, to contain none of the five names (including inside `pwpatch`-facing code). The release hash is the shipping variant's.
- **F-028:** time filter on Skulltulas and Hearts (same rule as Quests).
- **Affected:** `proj/main.py`, `gate.py`, `fix4.py`, `links.py`, `vers.py`, `build.py`, `app.js` (L489, hook block, filter L500–501 and L1074), `template.html`, `pwpatch.py` (build variant).
- **Exit:** acceptance table §4; rebuild diff (the `f009_probe.py` method) shows only intended rows change, all three versions.

### Phase 2: F-012 and Q4 migration
- `SKULL_DEFAULTS = []`; remove `app.js` L136 seeding; adjust `build.py` L563–564; update the legacy banner text; implement the Q4 migration (order: **verify backup written → then modify**) with marker and the "Restore my earlier save" action (settings/account area, confirmation). The Q4 migration is independent of and runs before the Phase 3 format change.
- **Affected:** `proj/data.py`, `build.py`, `app.js` (load path, banner, settings), `template.html`.
- **Exit:** §4 criteria for F-012 and Q4.

### Phase 3: Sync redesign (one unit; F-013, F-022, F-019, F-020, F-038, F-039)
Design per REMEDIATION_PLAN §1 as **amended by D-3**: replaces the wall-clock hybrid clock with a Lamport counter.
- Document v3 at a new path `oot_tracker_v3`; v2 read once and imported with counter 0; v2 never deleted.
- Each tick/untick is an entry `[on, counter, deviceId]` (untick = tombstone). One user action stamps one counter on every key it changes. Counter = one more than the highest counter ever seen on this device (local or remote, any key), persisted. **No wall-clock value is read for ordering.**
- Merge per key: higher `(counter, deviceId)` wins; commutative, associative, idempotent. Every snapshot, the first included, is merged, never assigned.
- Persisted pending set, retry with backoff, derived status text, upload when no document exists, `#sync` a polite live region.
- **Conflict notice:** when a merge replaces a local change not yet acknowledged (or made after the last merge) with a different remote value, show "Another device changed *<row name>*; your change was replaced", and keep a short recent-notices list. A causally later remote change that simply arrives is not a conflict and shows no notice.
- **Documented ambiguity:** genuinely concurrent offline edits to the same row are decided by counter then device id, not by real time; a device with more edits can win over a later edit from another.
- Server revision / compare-and-set: **not evaluated in this phase** (D-16); the design must work without it.

**Anomaly policy: APPROVED CONDITIONALLY (D-24). The conditions are in "Approved conditions" below and take precedence over items 1–4; any deviation returns to the owner.**
1. *No arbitrary numeric limit.* Detection uses an invariant instead of a threshold. A Lamport counter value `c` implies at least `c` events happened in its causal history. The document records, per device, how many operations that device has performed (`n[deviceId]`, monotonic). Invariant: every entry counter ≤ Σ `n`. An entry that violates it is **provably impossible** and is flagged as anomalous. Entries that are not structurally valid integers are also flagged. (A pure arithmetic overflow guard at the language's safe-integer range is a technical necessity, not a policy limit.)
2. *Valid edits are never discarded.* A flagged entry is not deleted and its row is not reverted. It still takes part in ordering, so a corrupt entry can never silently erase a valid one by being dropped, and a valid entry is never dropped for looking odd.
3. *Reconciliation.* When any device receives a flagged counter, it adopts it for its own clock like any other counter, so every edit it makes afterwards gets a higher counter and wins. For **pending local operations** made before the flagged entry was seen and now losing to it: they are kept (never cleared), re-issued with a counter above the flagged one on the next write, and the user sees a notice naming the rows ("re-applied after an unusual entry from another device"). The flagged entry itself is recorded in a local anomaly log shown in the sync details.
4. *Cost and limits (to be stated to the owner).* The extra `n` map adds a small field to the document and one counter per device to maintain. A hostile or buggy writer can still inflate `n` as well; this only matters for the owner's own document (F-038 context). If the owner prefers a simpler design without `n`, the fallback is: flag any received counter that exceeds the highest counter this device has ever seen plus the number of entries in the document, which is weaker but also needs no fixed constant.

**Approved conditions (D-24), required in the Phase 3 design note and tests:**
- **C-1 Operation-count validation.** Each device keeps a persisted, monotonic operation count `n[device]`, written with every save. Receiving a lower `n[device]` than already known is a stale or replayed document: take the maximum, do not treat it as an anomaly and do not lose data. Validation rules: (a) every entry counter must be a non-negative safe integer; (b) every entry counter must be ≤ Σ `n`, since a Lamport counter implies at least that many events; (c) `n[device]` can never decrease across a device's own saves. A violation of (a) or (b) flags the entry.
- **C-2 Duplicate and replay handling.** An entry is identified by `(key, counter, device)`. Re-delivery of an identical entry (duplicate snapshot, replayed write, repeated import) changes nothing (idempotent). An older entry arriving after a newer one for the same key loses to it and changes nothing. Two entries with the same `(key, counter, device)` but different values are a collision: both are kept in the anomaly log, the result is chosen by a fixed deterministic rule fixed in the design note and identical on every device, and the user is told.
- **C-3 Pending local edits are preserved.** Local pending operations are never cleared, dropped or rolled back by a merge, flagged entry, reconciliation, retry failure or restart. If a flagged entry beats a pending operation, the operation is re-issued with a counter above it on the next write, and the user sees a notice naming the rows.
- **C-4 Inflated counters.** A flagged but representable counter is ordered like any other and adopted by the local clock, so every later edit beats it; the rows it controls can be corrected by an ordinary tick or untick. A counter beyond the safe-integer overflow guard, or not an integer, **cannot** be adopted without breaking the clock: it is quarantined (kept in the document and in the anomaly log, not applied, not deleted), the row keeps its best valid entry, and the user is told. The quarantine is for entries that are provably invalid; it never applies to an entry that is merely unusual.
- **C-5 No valid operation silently discarded.** Every valid tick or untick either wins, or loses to a later or concurrent edit and, when it was a pending local change, produces a visible notice. Anything flagged or quarantined is recorded and surfaced, never dropped without a trace.
- **C-6** The extra document field (`n`) is accepted. The weaker no-extra-field fallback stays available only if C-1 proves unworkable, and only with the owner's approval.

**Cutover safeguards (D-18; each is tested before release):**
- S-1. v3 uses a **new document path and a new localStorage key**; the old key and v2 document are left untouched, so an older page cannot overwrite v3 entries (it writes only the old key and the v2 document).
- S-2. The v3 build imports new keys that appear later in the v2 document **only as additions with counter 0**; it never treats absence in v2 as an untick, so a stale or whole-set v2 write cannot delete v3 progress.
- S-3. An older tab still open on the same browser keeps writing the old local key; v3 never reads the old key after migration except through the marker-guarded import (no resurrection of old state).
- S-4. v3 refuses to run a second time on a local save that has the v3 marker without a valid entry map (no half-migrated state is read as empty).
- S-5. After v3 data exists, any v2 write still leaves the v3 document byte-identical (asserted).
- S-6. The release note says older builds do not show v3 progress and that a v2 "Saved" message from an older build does not include it.
- No mirror (v2 write-back from v3) is built unless a test shows S-1…S-5 are insufficient.
- **Affected:** `app.js` (`flush`, `initRemote`, `saveLocal`, `normalize` call sites, progress-code import, status text), `template.html` (`#sync`), harness stand-ins.
- **Exit:** the regression suite in §4 passes under both stand-in delivery models (M1, M2).

### Phase 4: Real-provider verification (gate, Q5)
- Preconditions: Phase 3 green; P-1, P-2 in place; the owner's go-ahead on the day; P-5.
- Steps (REMEDIATION_PLAN §7.3): new test artifact with a new id, never the production slug; prove isolation **before any write**; synthetic data only; run the sync scenarios; re-check production metadata unchanged; stop if isolation cannot be shown. Publishing the *test* artifact needs the owner's explicit approval that day.
- **Learn here (nothing assumed, D-16):** whether the provider offers server revisions / compare-and-set, snapshot order and duplication (F-020), cache behaviour, behaviour across reload, size limits, error codes.
- Cross-account isolation stays **unverified** unless two independent authenticated accounts are provided (D-20).
- Exit: F-021 closed, or left open with exact reasons.

### Phase 5: Release preparation only
Full runner green; rebuild; shipping hash recorded; release notes; previous live artifact version and hash recorded for rollback. **The owner publishes.**

---

## 4. Acceptance criteria and regression tests

General: every test exits non-zero on failure and runs in `run_all.py`; synthetic data only; each fix has a test that fails on the baseline tag (proved on a disposable copy).

| Finding | Acceptance | Tests |
|---|---|---|
| F-002 | One command, one pass/fail; injected failure fails it; timeouts and no-verdict scripts are not "pass" | runner self-test |
| F-001 | The two stale tests replaced, passing against the shipped page | new replacements |
| F-003 / Q2 | Build has no `index.html` / `themed.html`; nothing references them | build, runner, §7.4 list |
| F-011 | A migrating load keeps lock, filters, tab, open walkthroughs | `test_engine.py` N2 flips to PASS |
| F-009 | MQ-34 or MQ-30 alone ticks MQ-22; no `MQ-22` lock on KF-1, LLR-3, HP-8, SQ-6 after MQ-41; S18 still passes; fixture: `sw2:MQ-41` without MQ-22 gains it and keeps settings | S1b ×3, new tests, `graph_check`, `build_audit` B1–B8, `test_progression_s4` |
| F-029 | MQ-17 gives IT-2 and IT-63; IT-63 requires MQ-17; text corrected; fixture: a save past MQ-17 gains IT-63 | `data_audit_s5` D1, new fixture |
| F-030 | GAN-1 needs the Hookshot only | D2 |
| F-031 (high) | DMT-1, HF-2, IC-3, HP-15 corrected. **HC-2 unchanged** | D3, D4, D8, D10 pass; D9 still fails (expected, deferred) |
| F-032 (high) | ZR-1, GV-3 corrected. **GF-2, CL-2 unchanged** | D5 passes; D6 split into per-row checks (GV-3 passes; GF-2 and CL-2 still fail, expected, deferred) |
| F-033 | Verification step first (SQ-42 acquisition requirements). Then SQ-25, SQ-40 (and SQ-42 per the verification) require the Magic Meter in all versions. Unchanged: IT-22/SQ-20 (N64, 3DS), IT-22/SQ-19 and SQ-20 (Switch 2). One rule stated in help text | new twin-row tests per version |
| F-044 | HP-29 ready without a Hookshot | `data_audit_s5b` reviewed list updated; new row test |
| F-045 | MQ-31 not ready without Din's Fire and Magic Meter; fixture: save past MQ-31 gains earlier rows | `data_audit_s5c`, new fixture |
| Data batch | Rebuild diff shows only intended rows in all versions. `data_audit_s5` ends with only the deferred-row checks failing; `_s5b` and `_s5c` keep only the deferred and F-042/F-043 rows in their reviewed open lists; the runner's expected-failure list is updated to match | scripts above |
| F-016 | Shipping file contains none of the five hook names or their code; hooks variant works for the suite | build check in runner |
| F-028 | Time filter on Skulltulas, Hearts, Quests; ignored elsewhere; persists; labels unchanged | extend P3/P4 |
| F-012 | New player in each default version starts with zero ticks; H2 shows only `sw2:LW-1`; banner hidden for new players; banner and claim still work for a synthetic pre-version save | N4, H2, new banner tests |
| Q4 | (a) exact subset of the four defaults → migrated; (b) four plus any other id → untouched; (c) any prefixed id → untouched; (d) a stored setting beyond defaults → untouched; (e) existing backup → never overwritten; (f) backup write fails or fails verification → original save unchanged; (g) restore reproduces the original save exactly (byte comparison) after confirmation; (h) cancel changes nothing; (i) marker prevents repeat; (j) the backup is verified by reading it back before the original is modified | one synthetic fixture per branch |
| F-013, F-022 | All 26 runs of `test_sync.py` and 6 of `test_sync_s4.py` pass under M1 and M2; new B4, I1, O1, M1-v2, Z1 (seeded, ≥50 seeds, 3 devices × 200 ops) | REMEDIATION_PLAN §1.5 with D-3 changes |
| D-3 | Causal case: B saw A's tick and unticks later → untick wins everywhere. Concurrent case: deterministic and identical on all devices and the server regardless of delivery order. **No test depends on the device clock**; clocks at +1 h and −1 h give the same result as normal. Restart with pending changes. Notice names the row when a pending change is replaced; no notice for a causally later arrival | new tests |
| U-6 / D-24 | Tests for C-1…C-6: impossible counter flagged, row not reverted; stale or replayed document ignored without data loss; duplicate, old and out-of-order entries change nothing; collision rule identical on all devices; pending edits survive flagged entries, retries and restarts and are re-issued with a notice; overflow-range counter quarantined, not adopted, logged; a flagged but representable counter adopted so later edits win; no scenario loses a valid operation without a notice | new tests |
| U-7 | S-1…S-5: baseline-tag build (as the "old client") run against the same stand-in after v3 progress: v3 document and keys unchanged after any v2 write; new v2 keys imported as additions only; absence in v2 never unticks; old local key never overwrites v3 state | cutover tests |
| F-019 | Status derived from state; a never-recovering failure never shows "Saved"; correct text after retry | S1 status checks |
| F-020 | Out-of-order and duplicate snapshots change nothing | O1 |
| F-038 | Junk ids dropped, not written back; array capped; malformed counters flagged | `security_s5` S3 flips to PASS |
| F-039 | `#sync` is `aria-live="polite"`; failed-save wording distinct | `a11y_s5` live-region check |
| Privacy guard | Fails if a tracked file outside the fixtures folder holds a list of 10 or more row ids, or if a tracked file matches the patterns in §7.3 | runner |
| Whole suite | The 24 passing legacy scripts still pass; counts recorded before and after | runner |

Version coverage: every behavior test runs for n64, 3ds and sw2; sync tests also run with the page opened on each version.

---

## 5. Backup, rollback and recovery

- **Repository:** `audit-baseline-s5` tag; each phase on its own branch; a phase is undone by discarding the branch or reverting its merge. Before any history rewrite (only if separately approved, §7.2) a full mirror backup is taken first.
- **Player data (code):** Q4 backup key plus an account `backup` field, verified before any change, never overwritten, kept until the owner deletes it. v3 leaves v2 untouched (S-1).
- **No real save is ever read.** Fixtures are synthetic and stored in a clearly named fixtures folder.
- **Release rollback (owner's action):** the previous live artifact version and hash are recorded read-only before release; rollback means the owner republishes that build. Progress made in v3 after the switch is not shown by an older build (accepted, D-18) but is not deleted.
- **Test artifact (Phase 4):** separate id and namespace; deleting it removes nothing from production; production metadata compared before and after.

---

## 6. Release gates

All must be true before the owner is told a build is ready:
1. Phases 0–3 complete; `run_all.py` green apart from the documented expected failures (deferred rows HC-2, GF-2, CL-2, F-042, F-043).
2. No open release blocker: F-013, F-022, F-009, F-019, F-012 fixed and tested; F-021 resolved or left "unverified" with reasons the owner accepts in writing.
3. Phase 4 completed under the Q5 conditions, or the owner explicitly waives it knowing sync is then unverified on the real provider.
4. The shipping build contains none of the five hooks; its hash reproduces from a clean LF checkout.
5. Q4 and cutover tests pass on every branch; restore tested byte for byte.
6. Privacy guard passes; the repository is confirmed private (P-1).
7. Release notes read by the owner.
8. Production untouched by Claude; publishing by the owner only.

**Release notes must state:** players who ticked the four defaults before the fix keep them if indistinguishable from real ticks; players past MQ-17 or MQ-31 may see earlier rows (Light Medallion, Din's Fire and Magic Meter prerequisites) become complete; the sync conflict rule is logical, not by real time, with a visible notice; older builds do not show progress saved in the new format; cross-account isolation is unverified unless two independent accounts were used; HC-2, GF-2, CL-2, F-035, F-036, F-042 and F-043 remain unverified or deferred.

**Blocks publishing:** any release blocker open; hash not reproduced from a clean checkout; a test failing outside the documented list; hooks in the shipping file; repository not confirmed private; Phase 4 isolation not shown; missing owner approval.

---

## 7. Repository findings and privacy safeguards

### 7.1 Visibility
The owner confirmed on 2026-11-09 that the repository is now private (P-1, D-27). Earlier evidence from Claude's own unauthenticated checks: HTTP 200 and `public`, later HTTP 404. Separately, the question of whether anyone cloned, forked or indexed the repository while it was public cannot be answered from here (fork and star counts were not read before it became unreachable).

### 7.2 `proj/got_old.json` and `proj/mig_final.json`: local inspection (contents not printed)
- **Format:** both are JSON lists of strings: 82 and 91 entries, no duplicates. Every entry is a row id with the `sw2:` prefix in the tracker's own id format (for example, "version:row-id"). No other fields: no names, email addresses, account ids, timestamps, device or save-settings data.
- **Appear to contain real progress?** **Yes, most likely.** They are not synthetic-looking: they are in the exact shape of the tracker's save (`got` array), cover Switch 2 only, and one of them is loaded by `proj/shot_r3.py` into a variable called `mine`. Both were copied in from `/home/claude/build` (the owner's working folder) in the first audit commit (`a97c1f2`) and are not referenced anywhere else. I cannot prove whose progress they are without comparing with the owner's save, which I will not do. **Personal data in the strict sense: none found** (progress ids only).
- **Required by the application, build or tests?** **No.** `build.py` does not read them; no test reads them. Only `proj/shot_r3.py` (a scratch screenshot script with a hard-coded `/home/claude/build/mig_final.json` path, not part of the test suite) loads `mig_final.json`. `got_old.json` is referenced by nothing. They appear only in the first audit commit's tree and in one sentence of AUDIT_PROGRESS.md.
- **Owner decision (Q-C, D-25): steps (1) and (2) below are approved (executed in Phase 0 after scope approval); (3) and (4) follow. History purge is a separate decision (D-26).** Recommendation text: (1) remove both files from the working tree (`git rm`), and retire or rewrite `shot_r3.py` to use synthetic data; (2) keep a copy only outside the repository if you want one; (3) record the exposure as proposed F-046; (4) add the privacy guard (§7.3).
- **Purging history: implications. The owner's decision D-26 recommends it because the repository was previously public. Not executed; execution needs separate approval. Full procedure and order: §7.6.**
  - Removing the files from the tree does **not** remove them from earlier commits; they stay readable in history (first appearing in `a97c1f2` and every later commit).
  - Because the repository was public, anything that copied it in that time (clones, forks, caches, search or archive services) keeps its own copy; a purge cannot recall those. The data is only a list of row ids, so the practical sensitivity is low; weigh that against the cost below.
  - A purge rewrites every commit from `a97c1f2` on: all commit hashes change (including `16ceab4`, the baseline cited throughout the audit docs, and the planned tag), existing clones and any open branches become incompatible, and it requires a **force-push** to every branch and tag. Branch protection (P-2) would need to allow force-push temporarily, and your approval each time. GitHub may keep cached views of old commits reachable by hash until garbage collection; removing them completely requires a request to GitHub support. Anyone who cloned earlier must delete and re-clone.
  - Procedure if you choose it: confirm P-1 (private) first; take a full mirror backup (`git clone --mirror`) kept offline; run a history filter (for example `git filter-repo --path proj/got_old.json --path proj/mig_final.json --invert-paths`) on a fresh clone; verify the files are absent from every commit and that the tree otherwise matches; rewrite the hashes cited in the docs; force-push with lease; re-create the baseline tag on the new history; ask GitHub support to drop cached objects if you want that; re-verify all clones.
  - Owner decision: purge is recommended (D-26). It is not run until the owner separately approves it; it comes before the baseline tag and the restructure (§7.6).
- **Nothing here has been done:** no file deleted, no history touched, visibility untouched.

### 7.3 Safeguards to add (Phase 0, after approval)
1. `.gitignore` patterns for stray save snapshots (`got_*.json`, `mig_*.json`, `*save*.json`, `*.progress`) outside a `fixtures/` folder.
2. The runner's privacy guard (§4): fails if a tracked file outside `fixtures/` holds a list of 10 or more row ids; fixtures must carry a `"synthetic": true` marker and are checked for it.
3. No tracked script may read a path outside the repository (checked by search).
4. `check_user.py` stays excluded (F-006); no real save is added to the repository, ever.
5. Claude confirms P-1 (read-only) before any push.

### 7.4 `index.html` / `themed.html` (Q2) dependency list
`proj/build.py` L680–681 builds them; `theme.js` and `theme.css` serve only `themed.html`. These scripts mention one or both pages and each must be checked for a run-time load: `test.py`, `test_contrast.py`, `test_db.py`, `test_desk.py`, `test_gate.py`, `test_resp.py`, `test_side.py`, `test_tools.py`, `test_ui.py`, `test_ver.py`, and the scratch scripts `shot_review.py`, `shot_rows.py`, `shot_th.py`, `shot_theme.py`, `shot_theme2.py`. Committed copies `out/index.html`, `out/themed.html` exist. Removal is blocked until each is shown not to need them or is rewritten or retired.

### 7.5 Missing sources and path references
- **Missing source:** none found. `proj/` builds byte-for-byte to the live hash (committed blob), so every file `build.py` reads is present: `template.html`, `app.js`, `theme2.js`, `theme2.css`, `scenes3.js`, `scenes3.css`, `models5_toolkit.js`, `models5_items.js` and the data modules. `build.py` reads no fonts or images. Not carried over (documented earlier): 143 screenshots, 70 `.bak` files, `oot_serif.b64` (listed as unused art), `check_user.py`. What else `/home/claude/build` held cannot be checked from here (the folder is gone).
- **Paths that would break:** 70 files hard-code `/home/claude/...`; `build.py` L671 writes to `/home/claude/audit/out`; scratch scripts reference `/home/claude/build/theme2.js` and `mig_final.json`; all docs cite `scripts/`, `testlogs/`, `proj/`; REMEDIATION_PLAN cites `app.js` line numbers (valid only while `app.js` is unchanged); CLAUDE.md step 1 uses a Linux symlink that cannot run on Windows; the working tree is CRLF (`core.autocrlf=true`), so a rebuild may not hash identically until LF is enforced.
- **Build output:** `out/` is committed. Proposal: track only a recorded hash file.

---

### 7.6 History purge: backup, rewrite, force-push, baseline tag (RECOMMENDED, NOT EXECUTED)

Recommended order (each step needs the owner's approval to start where marked; nothing here has been run):
1. **Done / owner:** repository private (P-1); `main` protection configured including the force-push block (P-2, §7.7); scope approved (P-4); **separate approval of the purge** (D-26).
2. **Offline mirror backup** (so the old history can always be recovered): `git clone --mirror <remote> <outside-the-repo-folder>/oot-tracker-prepurge.git`, stored somewhere that is **not** the repository and not published. It contains the player-data files by design; keep it private and delete it when the owner chooses.
3. **Fresh working clone** for the rewrite (never the current working folder): `git clone <remote> <new-folder>`; confirm `git rev-parse origin/main` equals `16ceab4` (or note the later head).
4. **Pre-scan** the whole history for other real-save files, not only the two known paths (any tracked JSON list of 10 or more `sw2:`/`n64:`/`3ds:` ids, any file named like a save, `check_user.py` if ever committed). Add any further paths to the filter list; stop and ask if something unexpected appears.
5. **Rewrite:** `git filter-repo --invert-paths --path proj/got_old.json --path proj/mig_final.json` (plus any paths from step 4) on that fresh clone. The tool must be installed first; the owner approves that install as part of the purge approval.
6. **Verify** before pushing: `git log --all -- proj/got_old.json proj/mig_final.json` prints nothing; the new head tree equals the old head tree minus exactly those two files (`git diff --stat old-head new-head` shows only them); every other file byte-identical; the old-to-new commit map (`.git/filter-repo/commit-map`) is saved to `audit/` (after restructure) for reference.
7. **Update references:** every document that cites `16ceab4`, `a97c1f2` or other hashes gets the new hash from the commit map, in a documentation commit on the rewritten history. The uncommitted `SESSION_6_IMPLEMENTATION_SCOPE.md` is copied across from the old working folder; it is not lost by the purge.
8. **Force-push** (the owner performs or explicitly instructs): the owner temporarily permits force-push on `main` (or uses their bypass), then `git push --force-with-lease --all` and `git push --force --tags` from the rewritten clone, then **immediately restores the protection**. Any other remote branches and tags are rewritten the same way; stale branches are deleted.
9. **Baseline tag replacement.** No `audit-baseline-s5` tag exists today (to be confirmed by `git tag -l` before the purge). Order: **purge first, then create `audit-baseline-s5`** on the rewritten commit that corresponds to old `16ceab4`, so no tag ever points at purged history. If any tag was created before the purge, delete it locally and on the remote and recreate it at the mapped commit; tell the owner the old tag hash.
10. **Replace the working copy:** delete the current local folder after copying the scope document, and re-clone from the rewritten remote. Any other machine or clone must also be deleted and re-cloned (a `git pull` into an old clone would reintroduce the purged history).
11. **Exposure follow-up (owner, outside Git):** check Settings → Forks / Insights → Forks for forks made while public (a fork keeps its own copy and cannot be purged from here); ask GitHub support to garbage-collect cached objects and views reachable by the old commit hashes; check that GitHub Pages was never enabled, and review old issues, pull requests and release assets for attachments.
12. Then **Phase 0 proper** starts: replace the real input in `shot_r3.py` with synthetic data (D-25), restructure, and the tag-dependent steps.
- If the owner chooses **not** to purge, the order is instead: tree-removal commit → `shot_r3.py` fix → tag baseline; the two files stay readable in history and the exposure is recorded as proposed F-046.
- **Risks to state:** all commit hashes from `a97c1f2` onward change; clones and open branches become incompatible; the audit trail's commit references need the mapping file; the purge cannot recall copies made while the repository was public.

### 7.7 GitHub settings the owner configures (Claude does not touch them)

Repository **Settings** (all owner-side):
1. **General → Danger Zone → visibility: Private** (done, P-1). Re-check afterwards that **Pages** is disabled (Settings → Pages, source "None").
2. **Branches → Branch protection rule (or Rules → Rulesets) for `main`:**
   - Require a pull request before merging (required approvals may be 0 for a solo owner).
   - **Block force pushes: ON.** (Temporarily allowed only for the purge, §7.6 step 8, then restored.)
   - Restrict deletions: ON.
   - Require linear history: optional (recommended; keeps the audit trail simple).
   - Require status checks: leave OFF for now (no CI exists); revisit once `run_all.py` can run in CI.
   - Do not allow bypassing the rules, **except** the owner's temporary exception for the purge.
   - Restrict who can push to matching branches: the owner only.
3. **Tags:** add a tag rule (Rulesets, target tags, pattern `audit-baseline-*`) restricting updates and deletions, created **after** the baseline tag exists.
4. **Collaborators and teams:** review the list; remove anyone not intended; check Deploy keys and Webhooks/Integrations for anything unexpected.
5. **Forking:** turn off "Allow forking" if the option is shown for the private repository.
6. **Security (if available on your plan):** secret scanning / push protection. Not a substitute for the privacy guard in §7.3.
Confirm to Claude in chat once these are set; Claude records it without verifying from the outside, since the settings cannot be read without admin access.

---

## 8. Approved versus not yet authorized

**Approved decisions:** §1.

**Not authorized until the owner approves this document:** Phase 0 and everything in it (installs, restructure, tag, branch, `.gitattributes`, path edits, rebuild, test runs); any source, data or test change in any phase. Each later phase needs its own start approval.

**Not authorized under any current decision (separate explicit approval each time):** changing repository visibility (owner only); deleting either player-data file (approved in principle, D-25; executed only in Phase 0 after scope approval); rewriting or purging Git history (recommended, D-26, procedure §7.6, not executed); force-push; any commit or push (only when asked, and not while P-1 is unconfirmed); any publish or deploy, including the Phase 4 test artifact; any production or database access; any read of the owner's saves; registering F-046; implementing the U-6 anomaly policy before it is approved.

---

## 9. Implementation rules (proposed to replace the audit parts of CLAUDE.md after approval)

1. Production read-only. Claude never publishes. Synthetic data only; no real save in the repository or in tests.
2. Work only on `fix/*` branches; `main` changes only by the owner's merge (protection configured by the owner, P-2).
3. One phase at a time, owner approval to start each; a phase report and doc update at its end.
4. No change outside the approved phase scope; anything else is a proposal.
5. Finding IDs never renumber; new IDs only after owner acknowledgement (next F-046).
6. Every test exits non-zero on failure; baseline results recorded before each change.
7. Audit documents under `audit/` stay append-only except for corrections the owner approves.
8. Commit and push only when asked; never push unless the repository is confirmed private.

---

## 10. Remaining unresolved questions

| # | Question | Needed from |
|---|---|---|
| O-1 | **Execute the history purge (D-26)?** Separate approval, plus approval to install `git-filter-repo` for it, and a date. | Owner |
| O-2 | Confirmation that the §7.7 settings are in place, including how you will grant and revoke the temporary force-push exception for the purge. | Owner |
| O-3 | Exposure while public: forks, clones, caches (§7.6 step 11). Whether you want to ask GitHub support to purge cached views. | Owner |
| O-4 | **SQ-42 (Q-A):** the verification step in Phase 1 decides whether the Magic Meter is added; a contradiction stops and asks. The secondary difference (IT-24 lists three story steps, SQ-42 none) is outside this change. | Phase 1 |
| O-5 | **Phase 3 design note:** the deterministic collision rule (C-2) and the final text of the notices, for owner review before implementation (the policy itself is approved with conditions C-1 to C-6). | Phase 3 start |
| O-6 | **Q-F, Phase 4:** two independent authenticated accounts. Unresolved by decision; if unavailable, cross-account isolation stays unverified. | Owner, before Phase 4 |
| O-7 | **Q-G, Phase 4:** whether the provider supports server revisions / compare-and-set. Not assumed; deferred. | Phase 4 |

Resolved in this revision: Q-A (included, with verification), Q-B (approved with conditions), Q-C (removal approved), Q-D (private), Q-E (owner action), Q-H (Switch 2 IT-22 verified, no change).

---

## 11. Proposed corrections to existing documents (not made)

1. NEXT_SESSION.md: line 3 ("end of Session 4"); the repo is described as private (it was public during Session 6, P-1); `zhrpo/oot-tracker` should read `zhrpo/OOT-Tracker`; the open-decisions list omits the implementation-order and publishing decisions and needs the decisions of §1.
2. CLAUDE.md: Linux symlink step; "commit and push at the end of every session" (owner now says only when asked, and not unless private); audit-copy wording (D-1); add §9 after approval.
3. REMEDIATION_PLAN.md: title says "Session 4"; section order (6, 7, 6.0, 6.1, 7.x, 8) should be reordered; §1.2, §1.4 "Clock skew" and §7.1 replace the wall-clock hybrid clock with the Lamport counter (D-3); §6/§6.0 data batch splits into included rows and deferred rows (HC-2, GF-2, CL-2); §6 F-033 limited to SQ-25 and SQ-40 (plus Q-A); §8.3 item 7 and the §8.6 list are now decided; §8.4 Phase 0 gains the privacy steps; the plan's v2/v3 cutover (§1.4) gains S-1…S-6; add the U-6 policy once approved.
4. AUDIT_FINDINGS.md: F-004 after D-1; F-016 recommendation now a decision; F-006 should mention `got_old.json` and `mig_final.json` and the proposed F-046; F-031 and F-032 get a dated note that HC-2, GF-2 and CL-2 are deferred; F-033 verification table (§3 Phase 1).
5. AUDIT_PROGRESS.md: record Session 6 start, the decisions of 2026-11-09, the visibility observations.
6. AUDIT_TESTS.md / AUDIT_VERIFICATION.md: hash note (committed blob versus CRLF working tree) and path changes after restructure; expected results of `data_audit_s5*` after the batch (deferred rows still fail).
7. REMEDIATION_PLAN.md §6 and AUDIT_FINDINGS.md F-033: record SQ-42 in the review, the Switch 2 IT-22 verification, and the Rule A basis (design rule, not a randomizer requirement). AUDIT_PROGRESS.md: record the Q-A to Q-H answers and the private confirmation.
