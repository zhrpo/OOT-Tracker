# Audit documentation: purpose and hierarchy

This folder is the permanent audit of "Ocarina of Time Tracker: The Adventure Edition" and the record of the remediation work done under it. The documents have a fixed order of authority. If two documents disagree, the one higher in this list governs, and the disagreement is written down (see "Known historical inconsistencies"), never silently corrected.

## Hierarchy

1. **`MASTER_AUDIT_SPEC.md`: the authoritative definition of the audit.** The owner's original "Comprehensive Pre-Release Audit", preserved verbatim. It defines the ultimate objective, the examination requirements, the evidence standards, the required deliverables and the standard for release readiness. It is the overarching authority for the whole project, however many remediation sessions or implementation phases are completed. Nothing below supersedes, reduces or reinterprets it, and it is edited only on the owner's explicit written instruction.
2. **`APPROVED_REMEDIATION_PLAN.md`: the authorised scope of implementation and remediation work.** Records, per item, what is authorised, deferred, awaiting further approval or prohibited. It says what may be changed; it does not say whether the application is ready, and it does not lower any requirement in the master specification.
3. **`AUDIT_TRACEABILITY.md`: the requirement-by-requirement accounting.** Every requirement of the master specification as an individual row with its status, evidence, related findings and remaining work. This, not any phase report, says what has actually been examined, verified, deferred or left outstanding.
4. **The audit execution records** (detailed evidence and history):
   - `AUDIT_PROGRESS.md`: session log, files inspected, category status, unresolved questions, next action.
   - `AUDIT_FINDINGS.md`: the findings register F-001 to F-045 (classification, severity, confidence, evidence).
   - `AUDIT_VERIFICATION.md`: game-data and behaviour verification matrices and source references.
   - `AUDIT_TESTS.md`: test execution records, recommendations and results.

## Other documents in this folder

| Document | Role |
|---|---|
| `NEXT_SESSION.md` | Session handoff written at the end of Session 5 (partly outdated, see below) |
| `REMEDIATION_PLAN.md` | The Sessions 4 and 5 remediation designs (sections 1 to 8). Historical detail behind the approved plan |
| `SESSION_6_IMPLEMENTATION_SCOPE.md` | Draft v3 of the Session 6 implementation scope, the longest form of each Session 6 decision. Summarised and classified in `APPROVED_REMEDIATION_PLAN.md` |
| `PRE_PURGE_CHECKLIST.md` | Preparation record for the history purge (now executed and verified) |
| `PHASE_0_REPORT.md` | Report of Phase 0 (see below) |
| `DEPENDENCY_MAP.md`, `DEPENDENCY_MAP.json` | Session 2 dependency map |
| `scripts/` | Audit tests, probes and `run_all.py` (the single pass/fail entry point) |
| `testlogs/` | Committed evidence from earlier sessions (read-only record; runs write to a scratch copy) |
| `fixtures/` | Synthetic data only (`"synthetic": true`); never real saves |
| `lib/oot_env.py` | Path and browser helper used by scripts and legacy tests |

## How phase reports and later reports relate to these records

A report such as `PHASE_0_REPORT.md`, and every future `PHASE_n_REPORT.md`, describes **what was done in that phase**: files changed, commands run, results, limits, what was left alone. It is an execution record that belongs under item 4 of the hierarchy. It is not a verification record and cannot change a requirement's status by itself. At the end of a phase:
1. add the evidence it produced to `AUDIT_TESTS.md` (and `AUDIT_VERIFICATION.md` or `AUDIT_FINDINGS.md` where relevant);
2. update the affected rows of `AUDIT_TRACEABILITY.md`, raising a status only when the corrected behaviour was tested against the relevant scenarios, and saying whether the verification was independent of the implementing session;
3. update `AUDIT_PROGRESS.md` and the status of any finding in the way the findings rules allow, without rewriting history.
Completing a phase never completes the matching master audit requirements. For example, finishing the Phase 3 sync redesign is implementation; the sync requirements (specification section 7) stay open until the redesigned behaviour is tested against the specified scenarios, and the real-provider and cross-account checks (Phase 4, Blocked) are done or explicitly left unverified.

## Required reading at the start of every audit or remediation session

1. This file.
2. `MASTER_AUDIT_SPEC.md`.
3. `APPROVED_REMEDIATION_PLAN.md`.
4. `AUDIT_TRACEABILITY.md`.
5. The relevant parts of `AUDIT_PROGRESS.md`, `AUDIT_FINDINGS.md`, `AUDIT_VERIFICATION.md` and `AUDIT_TESTS.md`.
6. Confirm the current branch, commit and project state (`git branch --show-current`, `git rev-parse HEAD`, `git status`, the remote head).
7. State the exact task that is authorised before beginning work.

## Integrity of the master specification

SHA-256 of the exact specification text between the `BEGIN ORIGINAL SPECIFICATION` and `END ORIGINAL SPECIFICATION` markers in `MASTER_AUDIT_SPEC.md` (UTF-8, LF line endings, from the first character after the BEGIN line to the last character before the END line, excluding the line break after BEGIN and before END): `70f7830b3a87e4c4057176aade408fa631de48498fb24723d294dd8dd7befea7` (25,011 characters, 800 lines). If a check gives a different value, the specification was altered; stop and tell the owner.

## Conventions

- Finding IDs F-001 to F-045 exist; the next is F-046 (a proposed F-046 about the removed real-progress files is not registered until the owner acknowledges it). Item IDs never renumber.
- Requirement IDs in the matrix (for example `PRG-09`, `EXE-15`; prefixes: ARC, PRG, DAT, VER, SYN, UX, TST, BLD for audits A to H) never change or disappear.
- Dates are 2026-11-09 for Sessions 1 to 6 so far; times are recorded in the session logs where known.
- Production is read-only; synthetic data only; the owner publishes (see `CLAUDE.md`).

## Known historical inconsistencies and outdated statements (recorded, not corrected)

The historical record is preserved; these notes say where it no longer matches the present state or where documents disagree. Proposed corrections are tracked in `APPROVED_REMEDIATION_PLAN.md` section 11, item 3.

1. **`NEXT_SESSION.md`:** its first sentence says "Written ... at the end of Session 4" inside a document titled as the Session 5 handoff; it calls the repository private (it is public since the owner restored it, and `zhrpo/oot-tracker` is spelled `zhrpo/OOT-Tracker`); it says Session 6 may not start without approval (superseded by the approved plan); its repository layout paragraph describes the pre-Phase-0 layout (a note was added at its top); its open-decisions list omits several now-decided items.
2. **`AUDIT_PROGRESS.md`:** the category table marks B "Complete" and G "Done for the audit", meaning the examination was carried out. Master specification 13A says a category is not complete until examination and verification have been performed; open defects (for example F-009) and unverified areas remain. Status words there refer to examination, not to verified requirements; the matrix is the authority. The Session 5 part 1 entry says audits F, G and Security were not started; later entries supersede it. "Next recommended action (session 6, if the owner opens one)" and the earlier "(superseded)" blocks are historical. Session 1 records "not a git repository", which is no longer true.
3. **`AUDIT_TESTS.md`:** records 27 scripts discovered (25 `test_*.py`, `test.py`, `check_user.py`); the repository holds 26 because `check_user.py` embeds a real save and is excluded (F-006). "24 of 26 pass" counts scripts that exit 0, including seven that print no verdict or only page errors; the Phase 0 runner reports 19 legacy PASS and 7 legacy UNCHECKED, with `test.py` and `test_contrast.py` repaired. The first Session 5 run (`-I`, parallel) is marked invalid in the record.
4. **`AUDIT_VERIFICATION.md`:** the entry-record section says "none yet" and the version identity table is unverified, while the master specification requires per-entry records and identity before research; the later session tables are aggregate. Several sentences say "Verified" for behaviours verified only on the local stand-in.
5. **`AUDIT_FINDINGS.md`:** F-037 contains a literal `\n` where a line break was intended; F-001 and F-002 evidence was corrected later in Session 5 and the corrections are recorded in place; register ranking text for F-023 (Medium) differs from its classification (Recommended improvement), both as recorded.
6. **`REMEDIATION_PLAN.md`:** the title says "Session 4" although it holds Session 4 and 5 material; sections are out of order (6, 7, 6.0, 6.1, 7.1 to 7.4, then 8); sections 1.2, 1.4 and 7.1 specify a wall-clock hybrid logical clock, which owner decision D-3 replaced by logical counters (Option A); section 8.4 Phase 0 and section 8.6 list items that are now decided or done.
7. **`SESSION_6_IMPLEMENTATION_SCOPE.md` (draft v3) and `PRE_PURGE_CHECKLIST.md`:** written before the repository was restored to public, before the ruleset existed, before the history purge was executed and before Phase 0; they still describe a private repository, a temporary force-push exception, the old layout (`scripts/`, `testlogs/`, root-level audit documents), and tag steps that the owner postponed.
8. **`PHASE_0_REPORT.md`:** its list of unreconciled documentation is the same set recorded here.
9. **The master specification itself:** it speaks of "Phase 1" as the read-only investigation phase and of "27" test scripts; the project later used "Phase 0 to 5" for remediation phases. These are different uses of "phase"; matrix rows keep the specification's wording and note the difference.
10. **Counts:** Session 1 records 322 files in the original working folder; the repository had 196 tracked files at the end of Phase 0 (sources only, by design: screenshots, `.bak` files and the real-save script were excluded).
