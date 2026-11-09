# Remediation plan — Session 4 (2026-11-09)

Audit-only document. **Nothing in this plan has been implemented.** Line numbers refer to `proj/app.js` and the build sources in `proj/` as of sha256 `d9f96a34…16a9ac` (equal to live artifact version `1794245267-84a7`).

Priority order (release-blocking first): **F-013 + F-022 + F-019** (one sync redesign) → **F-009** → **F-012**. Rationale in AUDIT_FINDINGS.md "Session 4 consolidated register".

---

## 1. F-013 — sync data loss (High, confirmed) — together with F-022, F-019, F-020

### 1.1 Root cause (from code, confirmed by `test_sync.py` and `test_sync_s4.py`)
The account document is one whole set of ticked keys (`{v:2, got:[...]}`), written with `ref.set` of the complete local set (`flush()` L1135–1154) and read by replacing the complete local set (`initRemote()` L1161–1212). Four mechanisms follow from that:
1. **Whole-set overwrite.** Each write replaces everything; two devices writing from different bases leave only the last writer's set (B1, B2, B3, C).
2. **No intent is stored for an untick.** A removed key is simply absent, which is indistinguishable from "never seen". So no merge can tell "B removed KF-1" from "B never had KF-1" (B3 M2: KF-1 comes back).
3. **Failures are forgotten.** `catch` sets `dirty = false` and never retries (L1149–1151). The next snapshot then replaces local state (L1195–1197) (D1, D3), and the status reads "Saved to your account" (F-019).
4. **The first load replaces rather than merges.** With a document: replaced, and only this page session's `early` ops are replayed (F1, F2). Without a document: nothing is uploaded and the status claims it is saved (H1). Another device then creates the document and its snapshot erases this device's progress, local storage included (H1b, **F-022**).
5. Snapshots carry no ordering, so a stale snapshot is applied like a fresh one (E2, F-020).

Merging the completion lists (union) would fix (1) and (4) but breaks unticks: every untick would be resurrected by any device that still holds the key. It is **not** sufficient (owner requirement).

### 1.2 Recommended solution: per-key last-writer-wins register map (state-based CRDT) with persisted pending state
**Document format v3** (new path, see 1.4):
```
{ v: 3,
  e: { "sw2:KF-1": [1, 1731171234567012, "d7f3"],     // [on 1/0, hlc timestamp, device id]
       "sw2:LW-1": [0, 1731171299000004, "a1c9"] } }   // 0 = tombstone: an intentional untick
```
- **Every tick and untick is an entry**, not a set membership. An untick writes a tombstone (`on = 0`) with a fresh timestamp. Tombstones are never garbage-collected. The key space is bounded (3 versions × ~550 rows ≈ 1,650 entries ≈ 60 KB worst case), so they cost little.
- **Timestamp = hybrid logical clock (HLC):** `max(wall-clock ms, last seen + 1)` × 1000 + counter. Merging any remote entry advances the local clock, so a device with a slow clock still orders after what it has seen. Ties break on device id (random, stored in localStorage).
- **Merge rule (commutative, associative, idempotent):** per key, keep the entry with the greater `(t, device)`. The visible set is every key whose winning entry has `on = 1`.
- **One operation stamps one timestamp:** `tickOn`/`tickOff` already return the full cascade in `log` (`[key, on]` pairs, L285). Every pair in one user action gets that action's timestamp. Undo writes the reverse pairs with a new timestamp.
- **Derived additions** (`normalize()` ancestor/needs/link catch-up, L436–488) are applied after every merge. They are stamped with the timestamp of the entry that caused them, not with "now". A later explicit untick then always beats them. Such an untick may arrive in a later merge with an older timestamp than "now" but a newer one than the cause.

**Write path**
- `pending` = the set of keys changed locally since the last acknowledged write. It is persisted in localStorage together with the entry map on every change (`saveLocal`). It is never cleared on failure.
- `flush()`: if pending is non-empty, write the full merged map (`ref.set`, or a field-level update if the provider supports it, see 1.4). On success, clear only the keys whose entries are unchanged since the write started. On failure, keep everything pending and retry with backoff (1 s, 2 s, 4 s … max 60 s). Also retry on the `online` event and when the page becomes visible.
- **Read-merge-write convergence:** whole-document writes can still race (A and B both write from base S0). That is safe here. Each device keeps its own entries locally. When B's write overwrites A's, A's next snapshot no longer contains A's entries, so A's merged map differs from the server map, A marks those keys pending again and re-writes. Every device re-asserts what the server is missing, so all devices converge to the same per-key winner. (If the provider supports compare-and-set, `ifVersion`, use it to cut the extra round trips; correctness does not depend on it.)

**Read path**
- Every snapshot, the first included, is **merged**, never assigned. A stale or out-of-order snapshot cannot override newer local entries because the merge only takes greater timestamps (fixes E2/F-020 without relying on provider ordering).
- First snapshot with **no document**: if there are local entries, mark them all pending and write (fixes H1/H1b/F-022).
- First snapshot **with a document**: merge, then write back if the local map has anything the server lacks (fixes F1, F2).

**Status (F-019)** is derived from state, never set on snapshot arrival:

| State | Text |
|---|---|
| no account available | "Saved on this device only" |
| pending empty and last write acknowledged | "Saved to your account" |
| pending non-empty, write in flight | "Saving…" |
| pending non-empty, last write failed or offline | "Not saved to your account yet — will retry" (+ count of changes) |

**Reload with pending changes:** the map and `pending` are in localStorage, so the reopened page merges its own map with the server snapshot and re-sends. This fixes F1 and D1 even under M1, where queued writes do not survive.

**Conflict policy (to confirm with the owner, see Q3):** the latest intent per row wins, across devices. If device A ticks KF-1 at 10:00 and device B, offline since 09:00 with KF-1 ticked, unticks KF-1 at 10:05, the untick wins. If B's untick was at 09:30, the 10:00 tick wins. Cascades are not re-derived across devices: an untick of a story step on B removes later steps on B (one action, one timestamp). A tick on A after that time wins for the keys A touched.

### 1.3 Alternatives considered
| Option | Keeps unticks | Concurrent edits | Offline | Notes |
|---|---|---|---|---|
| A. Union merge of `got` arrays | **No** (resurrects) | yes | yes | Rejected: violates the untick requirement. |
| B. Keep whole-set LWW, add retry + "dirty wins" | yes | **No** (B1/B2 still lose) | partly | Fixes D-scenarios and F-019 only. Insufficient alone. |
| C. One database document per row (`.../oot/<ver>:<id>`) | needs tombstone docs | yes, per row | needs a local queue | Avoids whole-doc races, but ~1,650 docs, more listeners, migration cost. Same semantics as the recommendation with more moving parts. |
| D. Server compare-and-set (`ifVersion`) + op log replay | yes (ops) | yes | yes (queued ops) | Strong ordering. Depends on page-SDK support, which is unknown (the session 3 tool-level `db_write` has `ifVersion`; the page SDK `ref.set` is not known to). Can be layered on the recommendation later. |
| **E. Per-key LWW map + HLC + persisted pending (recommended)** | yes (tombstones) | yes, converges | yes | Works with whole-document `set` only. Deterministic and testable offline. |

### 1.4 Side effects and regression risks
- **Old pages still open** (a tab loaded before the update) keep writing v2 whole sets. Mitigation: store v3 under a **new document** `data/users/<uid>/oot_tracker_v3`. On first v3 load, read `oot_tracker` (v2) once and import every key as an entry with `t = 0`, so any real later action beats it. For a transition period, keep listening to v2 and import new v2 keys as `t = 0` additions. Known limit: an untick made on an old page is not carried over. This is acceptable because one owner reloads quickly, but it must be stated.
- `normalize()` is called from three places today (start-up, remote load, code import). All three must stamp derived entries as above, or a stale device could resurrect rows via ancestor catch-up.
- **Progress code import** (`xapply` handler, L1525–1541) becomes a batch of tick entries with one timestamp. It should not create tombstones for absent keys. It adds keys directly to `got`, bypassing `setRaw`, so it must be routed through the new entry writer.
- There is no "clear all progress" control in the UI today (checked: none in `template.html`/`app.js`). The test hook `__oot.clear` (F-016) clears without entries. If a reset control is added later, it must write tombstones for every key in one action.
- **F-011 interaction:** the migrating-load write (L489) must use the full `saveLocal()` shape. Fix F-011 in the same change.
- **Undo** after a merge: the undo log holds `[key, on]`. Undo writes new entries rather than restoring old timestamps. That is correct but must be tested against a concurrent remote change.
- Payload size and write frequency grow slightly. The existing 350 ms debounce stays.
- **Clock skew:** HLC tolerates skew for ordering but not for intent: a device clock hours ahead would win every conflict until others catch up. The "latest intent wins" rule makes this visible only in true conflicts. Document it.

### 1.5 Required regression tests (all must pass under both delivery models M1 and M2 of the stand-in harness)
1. All 26 session 3 runs (`test_sync.py`: A, B1, B2, B3, C, D1, D2, D3, E1, E2, F1, F2, G1) and the six session 4 runs (`test_sync_s4.py`: H1, H1b, H2) pass. Today: 8/26 and 0/6.
2. New: **B4** same-row tick on A vs untick on B, both orders and both timestamp orders → the later intent wins on both devices and the server.
3. New: **I1** intentional untick survives a device that still holds the row and saves something else (no resurrection).
4. New: **R1** failed write → status "Not saved…" → automatic retry succeeds → "Saved to your account". With retries failing forever, the status never reads "Saved".
5. New: **R2** reload with pending changes under M1 (writes do not survive): the changes reach the server after reopening.
6. New: **O1** out-of-order and duplicate snapshot delivery (shuffle and repeat): final state unchanged.
7. New: **M1-v2** migration fixtures (synthetic): a v2 doc with keys of all three versions plus unprefixed legacy keys → the v3 map holds the same visible set. An old-format writer after migration does not delete v3 progress.
8. New: **Z1 randomized convergence** (seeded, recorded): 3 devices × 200 ops (tick/untick/undo/reload/offline/online), random delivery order, 10% write failures, random snapshot duplication. Oracle: per key, the last intent by HLC. All devices and the server equal the oracle after quiescence. At least 50 seeds.
9. New: **S1** status text check in every scenario above (F-019).
10. Existing engine tests (`test_engine.py`, R undo invariants, N2/N3/N5) still pass.
11. **Real provider** (blocked today, D1): repeat 1–6 in an owner-approved isolated test artifact before claiming "sync verified" (F-021).

### 1.6 Verification across versions
Keys are version-prefixed, so the design is version-agnostic. Each version still needs its own checks:
- G1 extended: the same row ticked on n64 and unticked on sw2 → independent results.
- Z1 draws keys from all three versions.
- Migration fixtures contain `n64:`, `3ds:`, `sw2:` and unprefixed keys.
- Version-only rows: IT-52 (Potion Shop bottle) and SQ-44 (sw2 only) survive a sync through a device viewing n64.
- 3DS `hs20_3ds` / sw2 `hs20_sw` Stone of Agony links keep their version-specific link after a merge.

---

## 2. F-019 — "Saved to your account" after progress was dropped (Medium, confirmed)

1. **Root cause:** the status is written as a side effect of events, not derived from state. `flush()` failure sets `dirty = false` (L1150) and "Saved on this device only". Any later snapshot then sets "Saved to your account" (L1194, L1207) without checking that local changes reached the server. The first snapshot with no document also sets it (H1).
2. **Recommended:** derive the status from `{account available, pending count, write in flight, last write result}` (table in 1.2). Show a distinct "Not saved to your account yet — will retry" state with the number of unsynced changes.
3. **Alternatives:** (a) only stop overwriting the failure text on snapshot. That is minimal, but still wrong after H1 and after a failed write followed by a snapshot that removed the change. (b) A "last synced at" timestamp. That is useful in addition, not a substitute.
4. **Side effects:** more status changes visible to the player (offline play shows "Not saved…" until reconnect). This needs wording review and an accessibility change: `#sync` (`template.html` L377) is a plain `<span>` today, with no `aria-live`. Make it `aria-live="polite"` so screen-reader users hear "Not saved…".
5. **Regression tests:** status assertions in D1, D3, F1, F2, H1, H1b, R1, R2. A never-recovering failure never shows "Saved". Status after a successful retry.
6. **Versions:** status is global, not per version. Run the status checks with the page on each version (`#…-n64`, `#…-3ds`, `#…-sw2`) to make sure version switching does not reset it.

Depends on: F-013 (same code). Implement together.

---

## 3. F-009 — child rows stay locked after finishing the game (High, confirmed)

1. **Root cause:** a data omission in `main.py`. The Bottom of the Well step (`well`, MQ-30, Child) comes after `storms` only. The child Spirit Temple (`spiritchild`, MQ-34) comes after `colossus` only. Doing either as a child after the Master Sword (MQ-17) is impossible without going back in time, which the app models as the Prelude of Light step (MQ-22, `BACK` in `app.js` L207). Neither step lists `prelude` as a prerequisite, so ticking MQ-30, MQ-34 or anything after them never ticks MQ-22. `stuckAdult()` (L208) then stays true, and `reqOf()` (L212) adds `[[MQ-22]]` to every child row outside the story tab.
2. **Recommended:** add `"prelude"` to `well.after` in `main.py` (`after=["storms", "prelude"]`). `spiritchild` inherits it through `colossus → well`. A data-only change, no `app.js` change.
   - Measured in a disposable build (`scripts/f009_probe.py`, `testlogs/f009_probe.json`): the build passes all assertions. Steps newly implying MQ-22: MQ-30, 31, 33, 34, 35, 37–41. Generated rows that change, identical in n64/3ds/sw2: MQ-30, BW-1/2/3 and their `.2` steps (the `@well` requirement now includes the Prelude), IT-18 (Lens of Truth) and IT-18.2, and DG-157 (first Bottom of the Well walkthrough step).
3. **Alternatives considered:**
   - (a) Runtime rule: `stuckAdult()` returns false once any child-age story step after MQ-17 is ticked. Rejected: it duplicates game knowledge in code, and the data would still say MQ-30 does not need the Prelude.
   - (b) Auto-tick MQ-22 in `tickOn` when a child story step is ticked while adult. Rejected for the same reason, and it adds a special case to the cascade.
   - (c) Rely on "I'm here". Rejected: it does not help players who tick rows directly.
4. **Side effects and regression risks:**
   - Existing saves that contain MQ-30 or later gain MQ-22 through `normalize()` ancestor catch-up (L460–466) on the next load. That load is a migrating load, which today also drops settings (F-011). Fix F-011 first or together.
   - BW-1/2/3 and the Lens of Truth row show a "Prelude of Light" chip in Needs. This is correct in game terms but a visible change.
   - The "tick earlier steps?" prompt (`pendingEarlier`) now offers MQ-22 (and MQ-20, 21) when ticking MQ-30+. This is intended, but the prompt count grows by up to three.
   - Era hints (`era.py`) for BW/IT-18 rows: the probe shows `ages` text in the diff only where `q` changed. Review the wording.
   - Existing tests with fixed expectations (`test_paths.py`, `test_play.py`, `test_r*.py`) may assert step counts. Re-run all.
   - With synced saves, the MQ-22 catch-up is a derived addition. Under the new sync design (1.2) it is stamped with the cause's timestamp.
5. **Regression tests:**
   - `test_engine.py` S1b (must flip to PASS ×3).
   - New: tick MQ-34 only → MQ-22 ticked. Tick MQ-30 only → MQ-22 ticked.
   - New: KF-1, LLR-3, HP-8, SQ-6 have no `MQ-22` clause after MQ-41 (probe1 expectations inverted).
   - S18 (child lock while adult, open after Prelude) still PASS.
   - Migration fixture: a save with `sw2:MQ-41` and no MQ-22 gains `sw2:MQ-22` and keeps its settings.
   - `graph_check.py` exit 0.
   - `build_audit.py` B1–B8 PASS (B1 recompiles `@well` from the new `after`).
   - `test_progression_s4.py` P1–P5 PASS.
6. **Verification across versions:** the probe shows the identical change set in n64, 3ds and sw2. Run S1b, the new tests and the migration fixture for each version. On sw2, also check the two-Link rows whose child half is in the well (BW-1/2/3 `.2`) and HP-6/HP-7 (sw2 Both rows). P5 must still lock their child half while stuck, and unlock it after MQ-22.

---

## 4. F-012 — new players start with four Skulltulas ticked (Medium, confirmed; updated session 4)

1. **Root cause:** `data.py` `SKULL_DEFAULTS = ['DT-1','DT-2','DT-3','MKT-1']` is emitted as payload `defaults` (`build.py` L524). `app.js` L136 seeds `got` with these **unprefixed** ids when there is no local save. Unprefixed ids are "legacy" by design (L185), so `renderLegacy()` (L960) asks which game they belong to, and answering ticks them. **New in session 4 (H2, both models):** if the new player is signed in, the very first save uploads the four unprefixed ids to the account document. Every other device on the account then shows the legacy prompt too, including a device that has its own save.
2. **Recommended:**
   - (a) Build: `SKULL_DEFAULTS = []`, plus a build assertion that `defaults` is empty, or remove the payload key.
   - (b) `app.js`: remove the L136 seeding, so a new player starts with an empty set.
   - (c) Keep the legacy/claim code for genuine pre-version saves.
3. **Alternatives considered:**
   - Prefix the defaults with the default version (`sw2:DT-1`…). Rejected: still four false ticks.
   - Keep them and only reword the banner. Rejected: it does not address the false ticks.
   - **Optional, owner decision Q4:** a one-time cleanup that removes the legacy ids only when the legacy subset is exactly `{DT-1, DT-2, DT-3, MKT-1}`. That is the untouched default and indistinguishable from it. The cleanup would apply to local storage and, after the F-013 redesign, as tombstones for those unprefixed keys. Risk: a genuine pre-version save that contained exactly those four (and no other legacy ids) loses them. Low likelihood, but it is the player's data, hence the owner decision.
4. **Side effects and regression risks:**
   - Players who already claimed the defaults keep four version-prefixed ticks. They cannot be told apart from real ticks, so no automatic removal is possible. Mention it in the release notes.
   - Account documents that already contain the unprefixed four keep prompting until claimed or cleaned (Q4).
   - The legacy banner text says "They are the pre-ticked Skulltulas or …". Update it to drop the pre-ticked clause.
   - `build.py` L563–564 asserts defaults exist. Adjust it.
   - `check_user.py` / F-006 fixture unaffected.
5. **Regression tests:**
   - `test_engine.py` N4 (must flip to PASS).
   - `test_sync_s4.py` H2 (account receives only `sw2:LW-1`).
   - New: the legacy banner is hidden for a new player.
   - New: the legacy banner is still shown, and the claim still works, for a synthetic pre-version save `{got:['KF-1','HP-3']}`.
   - New (if Q4 is accepted): legacy subset exactly the four defaults → cleaned. Legacy subset of the four plus `KF-1` → nothing removed.
6. **Verification across versions:** a new player in each default version (`__ootDefVer` = n64, 3ds, sw2, and the `#…-<ver>` hash) starts with zero ticks on every tab. A claim to each version still prefixes correctly on a genuine legacy fixture. H2 runs with the page opened on each version.

---

## 5. Sequencing and release gate
1. F-011 (one-line `saveLocal()` at L489) and F-009 data fix. Small, independent. Re-run engine, graph and build audits.
2. F-012 build + L136.
3. F-013/F-019/F-020/F-022 sync redesign on a branch, with regression suites 1.5 (1–10) green under both stand-in models.
4. Real-provider verification in an owner-approved isolated test artifact (D1 conditions; needs a publish of a **test** artifact, which the audit rules so far forbid. Owner decision Q5).
5. Release only when 1–4 are complete and the suite runner (F-002) gives one pass/fail result.


## 6. Game-data defects F-029…F-033 (session 5, DRAFT, not implemented)

One data batch, all in the source modules (`main.py`, `gate.py`, `fix4.py`, `links.py`, `vers.py`), no engine change:

| Finding | Change | Save impact |
|---|---|---|
| F-029 | `MQ-17` gives `IT-2`,`IT-63`; `MQ-37` gives `IT-28` only; `IT-63` requires `MQ-17`; text "After the Master Sword" | Players past `MQ-17` gain `IT-63` through `normalize()` (correct) |
| F-030 | `GAN-1` requires the Hookshot only | None |
| F-031 | `DMT-1` + `(IT-29 \| IT-35)`; `HF-2` + `(IT-14 \| IT-16)` and Fire Arrows as an alternative to Din's Fire; `HC-2` (n64/3ds) + `IT-14`; `IC-3` + bottle; `HP-15` `(SQ-23 \| IT-17)` and text | None (ticked rows never lock) |
| F-032 | `ZR-1` (n64/3ds) no bomb requirement; `GV-3` `IT-16 & (SQ-28 \| IT-17)`; `GF-2` Hookshot + card; `CL-2` Hookshot or Longshot; fix the Switch 2 note that says N64 needs the Longshot | None |
| F-033 | Choose one Magic Meter rule for `IT-23`/`SQ-25`, `IT-25`/`SQ-40`, `IT-21`/`SQ-19`, `IT-22`/`SQ-20`; owner decision | None |

Verification: re-run `data_audit_s5.py` (must reach 16/16), `build_audit.py`, `test_progression_s4.py`, `graph_check.py`, plus a rebuild diff showing only the intended rows changed (the F-009 probe method, `scripts/f009_probe.py`). Run this batch together with F-009/F-011 (§3) because both rebuild the data.

## 7. Owner decisions of session 5 and their effect on §1–§4

### 7.1 Q3 — latest intent per row wins, no blind trust in device clocks (applies to §1.2)
§1.2 already specifies a per-key register map with tombstones; the clock is the open design point. Requirements: a tick and an untick on the same row from two devices resolve to the later intent on **both** devices, deterministically, regardless of delivery order; nothing is lost silently. Candidate mechanisms to evaluate in the implementation session, in order of preference:
1. **Hybrid logical clock** per write (physical time + counter + device id), merged on every received snapshot (the receiver advances its clock to the maximum seen). A badly wrong device clock cannot rewrite history already seen, but a clock far in the future can win every conflict; mitigate by bounding accepted skew against the server's `updatedAt` and surfacing the case.
2. **Server-assigned revision** (compare-and-set on the document version, retry with merge), if the platform exposes it. Requires `describe_capabilities`/provider documentation; not verified.
3. Pure device timestamps: rejected.
The regression suite §1.5 gains: tick-then-untick from A then B, simultaneous untick/tick, out-of-order snapshot, A's clock +1 h and −1 h, restart with pending writes.

### 7.2 Q4 — removing the four unprefixed defaults (applies to §4)
The owner authorizes removal only where the four ids can be **confidently** identified as tracker defaults. A save that holds `DT-1`, `DT-2`, `DT-3`, `MKT-1` cannot, by content alone, be told from a genuine pre-version save that holds exactly those four (the limitation recorded in F-012). Rule for the implementation: migrate **only** when the unprefixed ids present are exactly a subset of the four defaults, there are no version-prefixed ids and no other unprefixed ids, and no setting beyond the defaults was ever stored; in every other case leave the entries untouched and show the existing prompt. Steps: (1) write a full backup of the original save under a new key (local) and a `backup` field (account document) before changing anything; (2) remove only those ids, nothing else, and record a migration marker; (3) provide a restore path that puts the backup back (reversible); (4) new players start with `defaults = []`. The audit must not read the owner's save to decide: the rule is tested on synthetic saves covering each branch. If the owner wants the ambiguous case decided, that is their call, not the migration's.

### 7.3 Q5 — separate test artifact (applies to §5 step 4, the F-021 gate)
Approved only under isolation proof. Procedure for the implementation or sync-verification session: (a) publish a new artifact with a new ID; never the production slug; (b) before any write, show that the test page's database paths resolve inside the test artifact, that a read of the production path through it returns nothing, and record the production document's `version` and `updatedAt`; (c) synthetic progress only; (d) exercise the §1.5 scenarios; (e) re-check production metadata unchanged; (f) if (b) cannot be shown, stop and keep sync "Unverified". Cross-account isolation remains **unverified** unless two genuinely independent authenticated accounts are available.

### 6.1 Further small items from session 5 part 2 (draft)
F-038 (validate ids against known + retired ids, cap length) belongs in §1 with the sync redesign. F-039 (polite live region for `#sync`, distinct failed-save text) belongs with F-019 (§2). Existing-suite fixes (F-001/F-002) are release-process work. A unified runner **is appropriate**: a new `scripts/run_all.py` that (a) runs each audit script and each legacy script as a subprocess from the right directory with a per-test timeout (longest is `test_overflow.py`, 119 s), (b) treats a non-zero exit, a timeout, or a printed `FAILS:` list that is not empty/0 as failure, (c) lists scripts that print no verdict (8 today) as "unchecked" rather than passing, and (d) removes the dependency on the `/home/claude/audit` path. Replace `test.py` and `test_contrast.py` (stale), leave the others unchanged until an implementation session is opened.

### 7.4 Consolidated plan
Deferred by the owner until the remaining audit areas are complete (C part 2, F, G, Security). Sections 1–4 and 6 are the inputs.
