# Findings register

Classification: Confirmed defect · Suspected defect · Verified correct behavior · Unverified behavior · Recommended improvement.
Severity: Critical · High · Medium · Low · Informational. Confidence: High · Medium · Low.
Each finding records the session it was raised in. Changed findings keep their ID and get a dated note.

---

### F-001 — Two existing test scripts are stale and crash
- Session: 1 · Category: G Testing · Severity: Low · Classification: Confirmed defect · Confidence: High
- Files: `test.py`, `test_contrast.py`
- Evidence: `testlogs/test.log`: `Locator.check: Timeout … waiting for input[data-id='KF-1']`. `testlogs/test_contrast.log`: `wait_for_selector(".row")` timeout.
- Cause: `test.py` does not load the `pwpatch` harness, so area cards start closed and KF-1 is never rendered; it also defaults to `index.html`, not the shipped `themed2.html`. `test_contrast.py` targets `themed.html` (the old theme).
- Expected: every script in the suite either runs against the shipped page or is removed/marked as retired.
- Recommended: retire both or point them at `themed2.html` with the harness. Regression test: no.

### F-002 — Test failures do not produce a failing exit status
- Session: 1 · Category: G Testing · Severity: Medium · Classification: Confirmed defect · Confidence: High
- Files: all `test_*.py`
- Evidence: every script that ran to completion returned exit code 0. Failures are only printed (`FAILS: [...]`, `BELOW 4.5: …`). No script calls `sys.exit(1)` on failure (grep: the only matches are the word "assert" in strings/comments). Some scripts (`test_t2.py`, `test_desk.py`, `test_resp.py`) only print measurements and check nothing.
- Impact: a regression is only caught if someone reads each log. There is no single pass/fail signal before publishing.
- Recommended: a runner that executes the suite and fails on any `FAIL`/non-empty `FAILS:`/crash; make each script exit non-zero on failure. Regression test: n/a.

### F-003 — Build still produces two unshipped pages
- Session: 1 · Category: A / H · Severity: Low · Classification: Recommended improvement · Confidence: High
- File: `build.py` lines 680–681 (`index.html`, `themed.html`), plus `theme.js`, `theme.css`.
- Evidence: only `themed2.html` is published (artifact holds one file, sha matches `themed2.html`).
- Impact: extra code paths to keep working, stale tests target them (F-001), larger review surface.
- Recommended: confirm with the owner (Q2), then drop. No save impact.

### F-004 — No version control; sources mixed with 260+ scratch files
- Session: 1 · Category: A Maintainability / H Release · Severity: Medium · Classification: Recommended improvement · Confidence: High
- Evidence: 322 files in one directory; 70 `.bak` copies; 143 screenshots; ~25 scratch scripts; `git` absent.
- Impact: no reliable history of data changes (important for a data-correction-heavy project), rollback depends on ad-hoc backups, easy to edit the wrong copy.
- Recommended: put the 22 shipped source files + tests in a git repository; move scratch and screenshots out.

### F-005 — HTML assembly uses chained string replacement of placeholders
- Session: 1 · Category: H Build · Severity: Low · Classification: Recommended improvement · Confidence: High
- File: `build.py` `render()` (lines 667–669).
- Evidence: `tpl.replace("/*__APP__*/", app).replace("__TITLE__", …).replace("/*__THEME_CSS__*/", css).replace("/*__THEME_JS__*/", js)` then `.replace("__DATA__", blob)`. Any later-inserted text containing `__DATA__` would be overwritten by the data blob. Today no inserted file contains these tokens (grep: 0 matches in app.js, theme2.js, scenes3.js, models5_*.js), so there is no current defect.
- The data blob itself is escaped for `</` and `<!--` (line 660), so it cannot close its `<script>` tag (verified by reading).
- Recommended: assert in the build that inserted files contain no placeholder tokens. Regression test: build-time assert.

### F-006 — A test embeds a snapshot of a real player's save
- Session: 1 · Category: Security & privacy / G · Severity: Low · Classification: Recommended improvement · Confidence: High
- File: `check_user.py` (literal `got = [...]` list of `sw2:` ids).
- Evidence: the list is the player's progress at an earlier date (it contains `MQ-14`, retired, and `SQ-17`). It is loaded only into a `file://` page's throwaway storage; nothing is sent anywhere.
- Impact: low (progress ids only, no account data), but test data should be synthetic per the audit rules, and the snapshot is stale so its output no longer reflects the real save.
- Recommended: replace with a synthetic fixture, or keep it explicitly labelled as a migration fixture.

### F-007 — Build is reproducible and the published artifact matches it
- Session: 1 · Category: H · Severity: Informational · Classification: Verified correct behavior · Confidence: High
- Evidence: isolated build `out/themed2.html` sha256 `d9f96a343e7b0f6182cb5db1d8b8d11bb39595271d0b580bbcdeab557016a9ac`; same hash for `/home/claude/tracker/themed2.html`; artifact `list_files` (version `1794245267-84a7`) reports the same hash. Build log: `build.log`, exit 0, all build-time assertions passed.

### F-008 — Clean load: no external requests, no console errors
- Session: 1 · Category: H · Severity: Informational · Classification: Verified correct behavior (limited) · Confidence: Medium
- Evidence: `scripts/net_check.py`, fresh browser context per version (n64, 3ds, sw2), `file://` load: 0 non-local requests, 0 console errors, 0 warnings, 0 page errors.
- Limitation: `file://` does not exercise the artifact runtime (database sync). Confidence is Medium until the page is checked inside the artifact viewer.

---
## Session 2 findings (2026-11-09) — application logic and state integrity

Line numbers refer to `proj/app.js` (identical to the shipped source).

### F-009 — Finishing the game (or the child Spirit Temple) can leave every child row locked
- Category: B Progression · Severity: **High** · Classification: Confirmed defect · Confidence: High
- Files: `app.js` `reqOf()` L209–213, `stuckAdult()` L208 (`BACK = 'MQ-22'`); `main.py` after-lists of `well` (MQ-30), `spiritchild` (MQ-34), and the endgame steps.
- Explanation: child rows outside the story tab get an extra lock while `stuckAdult()` (Master Sword taken, Prelude of Light MQ-22 not ticked). No story step lists MQ-22 as a prerequisite — not even the two child-era steps that require going back to child Link (MQ-30, MQ-34). So ticking MQ-41 (or MQ-34) ticks the Master Sword through its ancestors but never MQ-22, and the "tick earlier steps?" prompt (`pendingEarlier`, L394) does not offer it either.
- Reproduction: any version, empty save, tick MQ-41 → open KF-1: "Locked. … Master Sword can only go back …" (`unmet = [[["MQ-22"]]]`). Tick MQ-34 alone → MQ-22 stays unticked.
- Expected: going back to child Link is implied by any child step done after the Master Sword; finishing the story never locks child rows.
- Actual: all child-only Skulltulas, Hearts, side quests and items stay locked and are excluded from Ready until MQ-22 is ticked by hand. "I'm here" (L1313–1318) avoids it only because it ticks every step by index.
- Impact: a player who ticks the last step they reached sees large parts of three tabs locked with a misleading message.
- Remediation: add `prelude` to the `after` list of `well` and `spiritchild` (and therefore everything after them). Save impact: none negative — existing saves only gain MQ-22 through `normalize()` ancestor catch-up (L460–466). Needs a regression test (S1b exists).
- Evidence: `scripts/test_engine.py` S1b (FAIL ×3 versions), `scripts/probe1.py`.

### F-010 — Reload can add a prize the tick deliberately withheld ("up" links)
- Category: B / E · Severity: Low · Classification: Confirmed defect · Confidence: High
- Files: `tickOn()` L308–310 (gives an "up" prize only if `reqMet(prize)`), `normalize()` L467–473 (adds every linked prize of a ticked quest, unconditionally).
- Reproduction: sw2, Locks off, empty save, tick SQ-27 (Dampé's race) → Hookshot IT-16 not ticked. Reload → IT-16 ticked.
- Expected: the same state before and after a reload. Actual: state changes on load.
- Impact: low. With Locks on, every current "up" link's quest already requires what its prize requires (checked by reading gate data for SQ-21/HP-4, SQ-27/IT-16, SQ-33/IT-51 sw2, SQ-37/HP-35), so it only shows with Locks off. It is still an inconsistency between two code paths.
- Remediation: make `normalize()` skip "up" links (or apply the same `reqMet` rule). Regression test: N1b.
- Evidence: `test_engine.py` N1b (FAIL), `probe1.py`.

### F-011 — A load that migrates old progress throws away saved settings
- Category: E Persistence · Severity: Low · Classification: Confirmed defect · Confidence: High
- File: `app.js` L489: `if (normalize()) localStorage.setItem(LS_KEY, JSON.stringify({ got, ver }))`; the full shape is written by `saveLocal()` L1126.
- Reproduction: save `{got:[…,'sw2:MQ-14'], lock:false, status:'todo', tab:'skull', dg:{MQ-3:true}}`; open the page → stored save now has only `got` and `ver`; reload → Locks on, status all, tab main, walkthroughs closed.
- Impact: after any data update that migrates saves (retired ids, new links), a player who closes the page before touching anything loses their lock setting, filters, open walkthroughs and tab. Progress itself is kept.
- Remediation: call `saveLocal()` instead. Regression test: N2.
- Evidence: `test_engine.py` N2 (FAIL).

### F-012 — A brand-new player starts with four rows ticked and a confusing prompt
- Category: B / F · Severity: **Medium** · Classification: Confirmed defect · Confidence: High
- Files: `app.js` L136 (`if (!hasStored) got = new Set(D.defaults)`), build `defaults = ['DT-1','DT-2','DT-3','MKT-1']`, `renderLegacy()` L960–968.
- Reproduction: clean browser, open the tracker → banner "4 checkmarks are not tied to a game yet. They are the pre-ticked Skulltulas…". Choosing a game marks DT-1, DT-2, DT-3 and MKT-1 as collected.
- Expected: a new player starts with nothing collected.
- Impact: first-run confusion and four false Skulltula ticks if the player answers the prompt. For an existing player with a save, no effect.
- Remediation: empty `defaults` in the build (saves that already contain these ids keep them). Regression test: N4.
- Evidence: `test_engine.py` N4 (FAIL).

### F-013 — Sync: last-writer-wins, no retry after a failed save, and the first remote load discards local-only progress
- Category: E Sync · Severity: **High** · Classification: **Confirmed defect** (session 3, reproduced by running the shipped sync code against a local stand-in database) · Confidence: High for the app-side logic; the real platform provider was not exercised (see AUDIT_VERIFICATION.md, session 3)
- File: `app.js` `flush()` L1135–1154, `initRemote()` L1161–1212.
- Code path: (1) `catch` sets `dirty = false`, shows "Saved on this device only", never retries. (2) once not dirty, any differing snapshot replaces the whole local set (L1195–1197). (3) first remote load replaces local progress, re-applying only this page session's `early` ops; earlier offline progress is not merged. (4) every write is a whole-set `ref.set`, so concurrent devices end with the last writer's set.
- Runtime evidence (`scripts/test_sync.py`, `testlogs/sync_results.json`, `testlogs/sync_table.md`): 18 of 26 scenario runs lost or reverted a deliberate change, under both delivery models:
  - B1/B2 (two devices tick different rows): the second save to land erases the first device's tick, in both orders, and the snapshot then removes it from the first device too.
  - B3 (A adds KF-2 while B unticks KF-1): M1 lost KF-2; M2 brought KF-1 back.
  - C (offline on A while B plays): M1 lost A's offline ticks; M2 (queued writes replayed) erased B's tick.
  - D1, F1, F2 (failed save, reload during a save, earlier offline session): the next page open shows the server set and silently drops the local ticks; the status then reads "Saved to your account".
  - D3 (failed save, then another device's update arrives): the failed tick is overwritten on the device that made it.
- Passing controls (harness can pass): A normal, D2, E1, G1 under both models.
- Status: reproduced. Not downgraded. Remediation (not applied, audit only): per-key merge or field-level updates instead of whole-set `set`; keep `dirty` true and retry on failure; union local and remote on first load (with tombstones for unticks); a visible "not synced" state.

### F-019 — Sync status can say "Saved to your account" while local ticks were just discarded
- Category: E Sync / UX · Severity: Medium · Classification: Confirmed defect (session 3) · Confidence: High
- Evidence: D1, F1, F2 status text after the loss is "Saved to your account" (`sync_results.json` `status_text`). The player gets no signal that progress was dropped.

### F-020 — Out-of-order snapshots would be applied (provider-dependent)
- Category: E Sync · Severity: Low · Classification: Suspected defect, conditional · Confidence: Medium
- Evidence: E2 — a stale snapshot delivered after a successful save replaced local state (lost KF-1 under both models). Snapshots carry no version check. Firestore-style listeners deliver in order, so impact depends on the platform provider, which was not verifiable.

### F-021 — Real-provider sync and cross-account isolation are unverified at runtime
- Category: E Sync / security · Severity: Informational (risk) · Classification: Unverified · Confidence: n/a
- No signed-in viewer runtime was available (artifact emulator refused: no session token; no browser or device bridge). Publishing a test artifact was excluded by the session rules. Cross-account isolation rests on platform documentation ("data/users/<id>/ is private even from the owner") and the code path using `user.id()`; not tested with independent identities.

### F-014 — Per-version checklists are indexed from the first list only
- Category: A / B · Severity: Low · Classification: Recommended improvement · Confidence: High
- File: `app.js` L42–48: version checklists (`r.v[ver].subs`) are indexed only when the base row has none, and only the first version's list.
- Evidence: `graph_check.py` notes BW-1, BW-2, SP-2, SP-3 carry sw2 lists that are not indexed. Compared field by field: same ids and order, only `q` differs (the UI reads `q` per version from `rowMap()`), so behavior is correct today.
- Risk: a future version list with different ids or order would tick the wrong steps. Recommend a build assertion that every version's checklist has the same ids in the same order as the indexed one.

### F-015 — Locks are advisory: completed rows can sit on unmet requirements
- Category: B · Severity: Informational · Classification: Verified correct behavior (by design) · Confidence: High
- Files: `tickOn()` L291–346 (never checks requirements), `tickOff()` L349–392, change handler L1241–1248 (the only lock check).
- Observed: (a) with Locks on, the UI refuses to tick a locked row even when the checkbox is forced (S10 PASS). (b) With Locks off, any row can be ticked. (c) Unticking an item does not untick rows that needed it (a collected Skulltula stays collected). (d) Unticking an item a story step gave keeps the step when later steps are ticked (D1: untick Fairy Bow after finishing → Forest Temple stays, bow goes).
- Note for the owner: this is consistent with "things you collected stay collected", but it means "ticked" does not guarantee "requirements met". Worth one line in the help text.

### F-016 — The test hook `window.__oot` ships in the release
- Category: Security / A · Severity: Informational · Classification: Recommended improvement · Confidence: High
- File: `app.js` L1555. Exposes tick/untick/clear and internals to the page. There is no security boundary on the client anyway (the player owns their data), so no risk to others; it just widens the surface. Optional: expose only when a test flag is set.

### F-017 — Version-foreign ids in requirements and links
- Category: B · Severity: Informational · Classification: Verified correct behavior · Confidence: High
- Evidence: `graph_check.py`: on n64/3DS, 14 bottle requirements list IT-52 (sw2-only Potion Shop bottle) as one option; the link IT-52→SQ-44 has no version tag. In every case another option is live and the app's `exists()` filter skips the missing end. No effect; noted for data hygiene.

### F-018 — Static dependency graph is sound in all three versions
- Category: B · Severity: Informational · Classification: Verified correct behavior · Confidence: High
- Evidence: `graph_check.py` (exit 0): every `after` reference exists and points earlier (no startup-crash risk, no cycles); no requirement clause is made only of rows missing in a version; reachability fixpoint: 538/538 (n64), 538/538 (3DS), 548/548 (sw2) rows can be completed; no checklist step is weaker than its parent's single-option requirements.
- Limitation: the fixpoint ignores the age-switch rule (it only delays) and day/night (not modeled by the engine at all; time tags are labels and a filter on the Quests tab).

### Updates to earlier findings
- F-002 (2026-11-09, session 2): unchanged for the existing suite. The new audit tests (`scripts/graph_check.py`, `scripts/test_engine.py`) exit non-zero on failure and do not depend on reading output.
- F-001 (session 2 recommendation): `test.py` → **replace**: its intent (tick a Skulltula, reload, check it persisted) is covered for the shipped page by `test_engine.py` N-tests only for load paths, not for a UI tick + reload, so a replacement test is needed before retiring it. `test_contrast.py` → **retire** once audit G confirms `test_contrast2.py`/`test_cards.py` cover the same checks on the shipped theme. Nothing deleted during the audit.

---
## Session 4 findings (2026-11-09) — requirement compiler, progression, sync branches

Sources at sha256 `d9f96a34…16a9ac` (rebuilt from `proj/` at session start: identical, so no source change since session 3). Evidence files are in `testlogs/`.

### F-022 — First sync with no account document never uploads this device's progress; another device's first save then erases it
- Category: E Sync · Severity: **High** · Classification: **Confirmed defect** (stand-in harness, both delivery models) · Confidence: High for app-side logic (real provider not exercised, F-021)
- File: `app.js` `initRemote()` L1180–1194: when the first snapshot has `exists = false`, local `got` is kept but `dirty` is not set, so nothing is written. L1194 then sets "Saved to your account".
- Reproduction: `scripts/test_sync_s4.py` H1/H1b. Device A has `sw2:KF-1, sw2:KF-2` in local storage and the account has no document. A opens: 0 saves sent, status "Saved to your account", server still has no document (H1). Device B then ticks LW-1 and creates the document. B's snapshot reaches A (not dirty), which replaces A's set. KF-1 and KF-2 are gone from A's screen and A's local storage (H1b).
- Expected: the device's progress reaches the account on first connect, and the status only says saved once it has.
- Impact: a player who used the tracker before signing in, or the first time on a new account, can lose all of it to a second device. Silent: the status said "Saved to your account" throughout.
- Relation: same code area as F-013/F-019 and fixed by the same redesign (REMEDIATION_PLAN.md §1), but a distinct trigger: no document, rather than an existing one. Kept as its own ID.
- Evidence: `testlogs/sync_s4_results.json`, `testlogs/test_sync_s4.log`.

### F-023 — The build silently accepts several kinds of override mistakes; its own reachability check is weaker than it looks
- Category: H Build / B · Severity: Medium · Classification: Recommended improvement (no current defect: B1–B8 pass on today's data) · Confidence: High
- Files: `build.py` `attach()` L35–54 (GATE_V/BOTH_V matched by scanning, unknown ids ignored), `quest_rows_items()` L189–212 (`attach()` is never applied to items), reachability simulation L576–646.
- Evidence (`scripts/build_mutation.py`, disposable copies under `/tmp/s4mut`, `testlogs/build_mutation.json`): 7 deliberate source mistakes, **5 built with exit 0**:
  - M1: a GATE_V entry for an item row is dropped.
  - M2: a GATE_V entry with a mistyped row id is dropped.
  - M3: an OV text override with a mistyped id is dropped.
  - M5: removing the sw2 Spin Attack link and making IT-77 unobtainable on sw2 passes, because the build simulation applies links from every version.
  - M6: an OV age that BOTH_V overwrites passes.
  - Caught by the build: M4 (bad version key) and M7 (unknown requirement token). All 7 are caught by `scripts/build_audit.py`.
- Fragile assumptions in the build simulation: it ignores link version tags, the conditional "up" rule, story `needs`, the stuck-as-adult rule, and two-Link and dungeon checklist steps. The real guard today is `graph_check.py` / `build_audit.py` B7, which are not part of the build. `app.js` hard-codes `BACK = 'MQ-22'` while ids are assigned by the build; this is safe only because of the "ids never renumber" rule.
- Recommended: make `build.py` assert that every GATE / GATE_V / BOTH / BOTH_V / OV / ONLY key names an existing row (and, for GATE_V/BOTH_V, a row type that applies them); make its simulation version-aware (or run `build_audit.py` as a build step); emit `BACK` from the build.

### F-024 — Contradictory age definitions for three Switch 2 hearts in the sources
- Category: B / data hygiene · Severity: Low · Classification: Confirmed defect (source inconsistency; output as intended) · Confidence: High
- Evidence: `build_audit.py` I1. `vers.OV` sets sw2 `age` for HP-6 = Child, HP-7 = Child and HP-17 = Adult; `links.BOTH_V` (L43–48) sets the same rows to Both. `attach()` (L40–44) silently lets BOTH_V win. The final data (Both, two-Link checklist) matches the row text, so no user-visible defect. But anyone editing OV sees an age that has no effect.
- Recommended: remove the overridden `age` from those three OV entries; the F-023 assertion would prevent recurrence.

### F-025 — Dead or misleading code in the compiler and runtime
- Category: A · Severity: Informational · Classification: Recommended improvement · Confidence: High
- `fix4.py` L268–271: a loop over BW text tuples whose body is `pass`. The intended N64/3DS text is already in the base data, so it has no effect.
- `app.js` `lockText()` (L248–256) is never called. Its helper `clauseText()` is used only by it; `leafLabel()` is also used by the era note (L606), where only Adult rows reach it.
- `app.js` L93 `FULLN` counts full links of **all** versions. It only gates `SUBPAIR` (shared two-Link steps), which today applies only to IT-69 ↔ SQ-12, so there is no effect. It would misfire if a version-specific full link were added to a quest with a checklist.

### F-026 — Row text names tools that are not in the row's requirements (list for game-data audit C)
- Category: C / B · Severity: Informational (risk) · Classification: Unverified · Confidence: n/a
- Evidence: `build_audit.py` I2: 32 row/tool pairs (28 n64, 28 3ds, 25 sw2) where `how`/`where` names a tool absent from the row's requirements. Many are alternatives or implied by a story step (for example, Forest Temple tokens name the Hookshot, which `@forest` implies). Some may be missing requirements. The project policy is "every row lists the tools truly needed" (`proj/audit_notes.md`). Bombchus are not tracked at all, yet HP-4, KAK-5 (n64/3ds) and SP-2 need them.
- Full list: `testlogs/build_audit.json` → `info.I2_text_tool_not_required`. Needs source-cited verification in audit C, not a code change.

### F-027 — Requirement compiler, OR logic, generated-vs-runtime data and day/night labels verified
- Category: B · Severity: Informational · Classification: **Verified correct behavior** · Confidence: High
- `build_audit.py` (exit 0), 8 checks:
  - B1/B2: every skull, heart, side, item and song requirement equals an independent re-compilation of `gate.py` + `fix4.py` + `extra.py`, base and per version.
  - B3: every GATE_V/BOTH_V/BOTH entry reaches the output.
  - B4: every requirement leaf has a readable label.
  - B5: no clause made only of missing rows.
  - B6: the child half of a two-Link row never needs adult-only equipment (adult-learned songs are allowed, correctly).
  - B7: a version-aware fixpoint with app semantics completes every row and step: 538/538/548.
  - B8: every table key is a real row and version.
- `test_progression_s4.py` (exit 0, 27/27), all three versions:
  - P1: 34/34/39 OR clauses, 110/110/122 options. Each option alone satisfies its clause, nothing is unlocked early, options naming a missing row never satisfy, and each option plus the other clauses unlocks the row.
  - P2: runtime `rowMap()`/`reqOf()` equals the generated data per version for all 538/538/548 rows and steps.
  - P3: Day/Night/Day + night tags match each version's label, including the sw2-only changes HF-1/HC-1 → Night and LH-3 → Any.
  - P4: the Quests-tab time filter hides only the opposite time, is hidden and has no effect on other tabs, and persists across a reload.
  - P5: the child half of a two-Link row is locked behind the Prelude while stuck as adult, and unlocked after it.
- Day/night has no engine logic (as recorded in F-018). Labels and the Quests filter are the whole feature, and both behave as designed.
- Note (not a defect): 7 n64/3ds and 9 sw2 OR options cannot be tested in isolation because ticking one also gives a sibling. For example, ticking the Hookshot implies the story steps that give the Boomerang, so "Boomerang or Hookshot" is effectively "Boomerang" once the story is followed.

### F-028 — The day/night filter exists only on the Quests tab
- Category: F UX · Severity: Low · Classification: Recommended improvement · Confidence: High
- Evidence: `app.js` L500–501 and L1074 (filter applies and is shown only when the tab is `side`). Time labels elsewhere (`build_audit.json` I3): 32 Night Skulltulas (all versions), 3 Day and 3 Night Hearts, 1 Night and 3–4 Day items. A player hunting night tokens cannot filter for them.
- Recommended: offer the time filter on Skulltulas and Hearts (same rule as Quests), or state in the help text that it is Quests-only.

### Updates to earlier findings (session 4)
- **F-009** (2026-11-09, s4): root cause narrowed to `main.py`: `well` (MQ-30) `after=["storms"]`; `spiritchild` (MQ-34) inherits through `colossus`. The fix needs only `well` (`after=["storms","prelude"]`). Impact measured in a disposable build (`scripts/f009_probe.py`): it builds clean; the same 10 rows change in all three versions. Plan: REMEDIATION_PLAN.md §3. Classification and severity unchanged (Confirmed, High).
- **F-012** (2026-11-09, s4): **impact extended.** For a signed-in new player, the first save uploads the four **unprefixed** default ids to the account document (`test_sync_s4.py` H2, both models: server = `DT-1, DT-2, DT-3, MKT-1, sw2:LW-1`), so the legacy prompt then appears on every device of the account. Severity stays Medium; now recommended as release-blocking (see the register). Plan: REMEDIATION_PLAN.md §4.
- **F-013** (2026-11-09, s4): unchanged classification (Confirmed, High). Remediation designed (REMEDIATION_PLAN.md §1): a per-key last-writer-wins map with tombstones and HLC timestamps, persisted pending state, retry, and merge on every snapshot. Union merge rejected because it resurrects unticks.
- **F-019** (2026-11-09, s4): additional trigger H1 (first snapshot with no document). Plan §2.
- **F-020** (2026-11-09, s4): unchanged (Suspected, conditional). The F-013 design makes snapshot order irrelevant, so it is fixed by the same change regardless of provider behavior.
- **F-018** (2026-11-09, s4): the session 2 fixpoint is now confirmed by an independent version-aware fixpoint on the generated data (`build_audit.py` B7). Its limits stand.

---
## Session 4 consolidated register (all findings, prioritized)

Order: release-blocking first, then by severity. "Blocks release" is the audit's recommendation; the owner decides.

| Rank | ID | Title (short) | Classification | Severity | Blocks release | Why |
|---|---|---|---|---|---|---|
| 1 | F-013 | Sync last-writer-wins, no retry, first load replaces | Confirmed defect | High | **Yes** | Silent loss of deliberate ticks and unticks across devices (18/26 runs) |
| 2 | F-022 | First sync without document doesn't upload; second device erases | Confirmed defect | High | **Yes** | Silent total loss of pre-sign-in or first-use progress |
| 3 | F-009 | Child rows locked after finishing the game | Confirmed defect | High | **Yes** | Core progression wrong for every player who reaches the end; misleading lock text |
| 4 | F-019 | "Saved to your account" after loss | Confirmed defect | Medium | **Yes** (with F-013) | Hides F-013/F-022 from the player; same code |
| 5 | F-012 | New player starts with 4 ticks; uploaded unprefixed to account | Confirmed defect | Medium | **Yes** | Wrong first-run state for every new player; now propagates through sync |
| 6 | F-021 | Real-provider sync and cross-account isolation | Unverified | Info (risk) | **Release gate** | After the F-013 fix, sync must be verified on the real provider before it is called fixed |
| 7 | F-011 | Migrating load drops settings | Confirmed defect | Low | No (fix with F-009) | F-009's fix triggers a migrating load for every save past MQ-30 |
| 8 | F-020 | Out-of-order snapshots applied | Suspected (conditional) | Low | No (fixed by F-013 design) | Provider-dependent |
| 9 | F-010 | Reload adds a withheld "up" prize | Confirmed defect | Low | No | Locks-off only; state differs after reload |
| 10 | F-002 | Tests never fail the exit status | Confirmed defect | Medium | No (release-process gate) | Needed to gate the fixes above |
| 11 | F-023 | Build accepts override mistakes; weak reachability check | Recommended improvement | Medium | No | No current defect; high value for a data-heavy project |
| 12 | F-004 | No version control | Recommended improvement | Medium | No | Strongly advised before the sync redesign |
| 13 | F-024 | Contradictory OV ages (HP-6/7/17 sw2) | Confirmed defect (source) | Low | No | Output correct |
| 14 | F-028 | Day/night filter only on Quests | Recommended improvement | Low | No | UX |
| 15 | F-001 | Two stale tests crash | Confirmed defect | Low | No | Test hygiene |
| 16 | F-003 | Two unshipped pages still built | Recommended improvement | Low | No | Awaits Q2 |
| 17 | F-005 | Placeholder chained replace | Recommended improvement | Low | No | No current defect |
| 18 | F-006 | Real save snapshot in a test | Recommended improvement | Low | No | Not shipped |
| 19 | F-014 | Per-version checklists indexed from first list | Recommended improvement | Low | No | Correct today |
| 20 | F-025 | Dead/misleading code | Recommended improvement | Info | No | — |
| 21 | F-016 | Test hook ships | Recommended improvement | Info | No | — |
| 22 | F-026 | Text names tools not required (32 pairs) | Unverified | Info (risk) | No | Input for audit C |
| 23 | F-015 | Locks are advisory | Verified correct (by design) | Info | No | Help-text note |
| 24 | F-017 | Version-foreign ids in OR options | Verified correct | Info | No | — |
| 25 | F-018 | Static graph sound | Verified correct | Info | No | — |
| 26 | F-027 | Compiler, OR, runtime data, day/night verified | Verified correct | Info | No | — |
| 27 | F-007 | Build reproducible, matches live | Verified correct | Info | No | Re-confirmed s4 |
| 28 | F-008 | Clean load | Verified correct (limited) | Info | No | — |

By classification: Confirmed defects: F-001, F-002, F-009, F-010, F-011, F-012, F-013, F-019, F-022, F-024. Suspected: F-020. Unverified: F-021, F-026. Recommended improvements: F-003, F-004, F-005, F-006, F-014, F-016, F-023, F-025, F-028. Verified correct: F-007, F-008, F-015, F-017, F-018, F-027. No finding was removed, downgraded or merged in session 4.
