# MASTER AUDIT SPECIFICATION

**Status: authoritative. Do not edit the text between the BEGIN and END markers.**

This file preserves, verbatim and in full, the original document "Ocarina of Time Tracker: The Adventure Edition: Comprehensive Pre-Release Audit", as provided by the owner on 2026-11-09 (Session 6). It is the overarching authority for the whole project: it defines the ultimate objective, the examination requirements, the evidence standards, the required deliverables and the standard for release readiness. Nothing in the approved remediation plan (`APPROVED_REMEDIATION_PLAN.md`), in any implementation phase, in any phase report or in any other repository document supersedes, reduces or reinterprets it. If any other copy or summary of this specification disagrees with the text below, the text below, which is the owner's original, governs.

The text between the markers is not formatted, summarized, re-ordered, shortened or reinterpreted. Only these lines (outside the markers) were added. Lines of the original that contain a single "⸻" are the owner's own section separators. The original had no Markdown heading marks, so the section titles appear as plain lines.

Integrity: the SHA-256 of the exact bytes between the markers (UTF-8, LF line endings, from the first character after the BEGIN line to the last character before the END line, without the line break after BEGIN and before END) is recorded in `audit/README.md`. Any change to the original text must be made only on the owner's explicit written instruction and recorded there.

Navigation (not part of the original): 1 Primary Objectives, 2 Important Examination Rules, 3 Audit A Architecture and Code Quality, 4 Audit B Progression Logic and Dependency Engine, 5 Audit C Game-Data Accuracy, 6 Audit D Version-Specific Correctness, 7 Audit E Saving, Synchronization, and Data Integrity, 8 Audit F User Experience and Accessibility, 9 Audit G Testing and Edge Cases, 10 Audit H Build and Release Integrity, 11 Security and Privacy Audit, 12 Required Audit Deliverables, 13 Additional Audit Execution Requirements (A to G), 14 Final Instructions.

<!-- BEGIN ORIGINAL SPECIFICATION -->
Ocarina of Time Tracker: The Adventure Edition

Comprehensive Pre-Release Audit

You are acting as a senior software engineering team conducting a comprehensive pre-release audit of a software application.

Your team consists of:

* A senior software architect.
* A senior Python developer.
* A senior JavaScript developer.
* A QA and automation engineer.
* A game-data accuracy researcher.
* A UI/UX and accessibility specialist.
* A database and synchronization specialist.
* A release and deployment engineer.

Your assignment is to conduct an exhaustive examination of the entire Ocarina of Time Tracker: The Adventure Edition project.

This is not a casual code review. The objective is to determine whether the project is genuinely ready for public release.

You must examine the actual implementation, not simply evaluate its documentation or rely on the developer’s description of how it should work.

⸻

1. Primary Objectives

Evaluate the project across all of the following dimensions:

1. Technical stability and reliability.
2. Code correctness and logical consistency.
3. Game-data accuracy and completeness.
4. Progression and dependency correctness.
5. Version-specific behavior.
6. Save persistence and synchronization.
7. User experience and accessibility.
8. Responsive design and visual consistency.
9. Test coverage and regression protection.
10. Build integrity and deployment reliability.
11. Security and data integrity.
12. Long-term maintainability and organization.

The ultimate question is:

Can a player confidently use this tracker to achieve 100% completion of Ocarina of Time without encountering incorrect information, broken progression logic, lost progress, misleading instructions, or frustrating interface behavior?

2. Important Examination Rules

Follow these rules throughout the audit.

Do not assume the implementation is correct.

The developer’s documentation describes intended behavior. Your responsibility is to determine whether the actual implementation fulfills that behavior.

Do not modify the project during the initial investigation.

The first phase is strictly read-only. Do not rewrite code, change game data, reorganize files, or modify existing tests.

Do not confuse passing tests with correctness.

Existing tests may contain incomplete coverage or incorrect assumptions. Independently evaluate what they actually prove.

Do not invent defects.

Distinguish confirmed defects from potential issues, subjective recommendations, and unverified suspicions.

Provide evidence.

Every finding must identify the affected file, relevant function or data entry, the observed behavior, and the reason it matters.

Verify rather than speculate.

Run code, build the application, execute tests, inspect browser behavior, and reproduce problems whenever possible.

Protect existing user progress.

Any recommendation involving IDs, migrations, dependency changes, linked rows, or save normalization must consider existing saved data.

Respect version differences.

Never assume N64, 3DS, and Switch 2 share identical game mechanics, locations, rewards, or progression.

Do not prematurely declare success.

A successful build, passing test suite, or absence of obvious errors does not establish release readiness.

⸻

3. Audit A: Architecture and Code Quality

Examine every source file.

Review:

* Project organization and separation of responsibilities.
* Naming conventions and consistency.
* Duplicated logic and unnecessary complexity.
* Dead code and unused functions.
* Circular or fragile dependencies.
* Error handling.
* Unexpected global state.
* Data structure consistency.
* JavaScript rendering efficiency.
* Python build-step reliability.
* Maintainability and extensibility.
* Potential performance bottlenecks.
* Unnecessary code or overly complicated implementations.

Pay particular attention to whether the current architecture makes future additions or corrections unnecessarily difficult.

Determine whether there are architectural improvements worth making before release.

Do not recommend architectural rewrites simply because another design is possible. Improvements should have a clear, measurable benefit and should not introduce unnecessary risk.

4. Audit B: Progression Logic and Dependency Engine

This is one of the most important parts of the project.

Examine:

* main.py
* gate.py
* links.py
* era.py
* regroup.py
* areas.py
* build.py
* app.js

Independently validate:

* AND requirements.
* OR requirements.
* Nested requirement groups.
* Story prerequisites.
* Item requirements.
* Song requirements.
* Token thresholds.
* Child and adult Link restrictions.
* Day and night restrictions.
* Two-age achievements.
* Dungeon and temple progression.
* Reward propagation.
* Linked achievements.
* Checklist parent-child relationships.
* Upgrade dependencies.
* Reverse propagation when unticking.

Pay particular attention to the following scenarios:

1. Completing a later story step must correctly complete all preceding steps.
2. Completing a step must grant all appropriate rewards.
3. Linked achievements must remain synchronized.
4. Completing every checklist item must complete its parent.
5. Completing a parent must correctly complete its children.
6. Unticking an achievement must reverse all dependent progress.
7. Unticking something must not remove unrelated progress.
8. OR requirements must unlock when any valid alternative is satisfied.
9. AND requirements must remain locked until every requirement is satisfied.
10. No achievement should unlock prematurely.
11. No achievement should remain permanently inaccessible when its legitimate requirements are satisfied.

Investigate potential dependency cycles, contradictory requirements, unreachable rows, and incorrectly configured progression chains.

Test each game version independently.

Pay particular attention to whether the effective completion calculation, dependency propagation, and readiness calculation can disagree with one another.

Determine whether a row can appear complete while its requirements are unsatisfied, or appear ready when its next actionable step is not actually available.

5. Audit C: Game-Data Accuracy

Independently verify the actual game information.

Audit all:

* 40 main story steps.
* 100 Gold Skulltulas.
* 36 Pieces of Heart, including version-specific replacements or additions.
* 44 side quests.
* 77 items, songs, upgrades, bottles, and medallions.
* 180 dungeon walkthrough steps.
* 14 dungeon and temple walkthroughs.
* House of Skulltula reward tiers.
* Mask trading sequence.
* Biggoron’s Sword trading sequence.
* Magic Bean locations and planting requirements.

Check every entry for:

* Correct location.
* Correct age.
* Correct time of day.
* Correct prerequisites.
* Correct required equipment.
* Correct reward.
* Correct collection method.
* Correct progression order.
* Accurate instructions.
* Appropriate version assignment.

Use reliable, version-specific sources to independently verify the information.

Do not simply compare the tracker against its own source files or repeat the same walkthrough information used to create it.

When sources disagree:

* Identify the disagreement.
* Record the conflicting sources.
* Determine whether the discrepancy can be independently resolved.
* If it cannot, recommend clearly documenting the uncertainty.

Do not silently choose whichever source is most convenient.

For every audited entry, record:

* Tracker ID.
* Game version.
* Information being verified.
* Verification status.
* Supporting source.
* Whether the source directly covers that version.
* Confidence level.

Distinguish independently verified information from information inferred from another version.

Do not mark an entry as independently verified when its only supporting evidence comes from the tracker itself.

Do not assign a passing status to an entire category merely because no errors were discovered.

Absence of a discovered error is not proof of accuracy.

6. Audit D: Version-Specific Correctness

Examine all three versions independently:

* Original Nintendo 64.
* Nintendo 3DS.
* Nintendo Switch 2 remake.

Inspect:

* vers.py
* vnew.py
* fix4.py
* All version-dependent requirements and overrides.

Verify that:

* Overrides apply only to their intended versions.
* New rows exist only where appropriate.
* Removed rows do not interfere with progression.
* Changed locations are accurate.
* Changed rewards are accurate.
* Requirements reflect the correct version.
* Age and time restrictions are correct.
* Version-specific story dependencies remain valid.
* Version-specific checklists are constructed correctly.

Pay special attention to whether changes in one version accidentally affect another.

Verify the complete 100% completion path for every version.

Establish the actual identity and availability of each version before researching its information.

For the Switch 2 version in particular:

* Establish that the sources being used actually cover the Switch 2 release.
* Do not assume N64 or 3DS information is unchanged.
* Verify version-specific changes independently.
* Distinguish confirmed changes from inferred similarities.
* Record information that cannot be independently verified.

Do not invent version-specific mechanics, changes, rewards, or locations.

If reliable information is unavailable, document the limitation rather than guessing.

7. Audit E: Saving, Synchronization, and Data Integrity

Examine the complete persistence implementation.

Test:

* Initial save creation.
* Saving individual achievements.
* Reloading the application.
* Browser refreshes.
* Closing and reopening the application.
* Switching between versions.
* Switching between tabs.
* Changing filters.
* Saving walkthrough preferences.
* Progress-code generation.
* Progress-code imports.
* Merging progress codes.
* Old save migration.
* Retired IDs.
* Missing or newly added rows.
* Offline progress.
* Remote synchronization.
* Simultaneous changes from multiple devices.
* Conflicting local and remote updates.
* Delayed database responses.
* Failed synchronization.
* Recovery after network interruption.

Determine whether any scenario can result in lost progress, corrupted progress, duplicate progress, or incorrect merges.

Specifically examine the synchronization change log and how local changes are reconciled with remote state.

Verify that existing player data survives all proposed changes.

Pay particular attention to:

* Race conditions.
* Out-of-order remote responses.
* Stale local state.
* Duplicate synchronization events.
* Partial writes.
* Interrupted saves.
* Failed migrations.
* Version isolation.
* Conflicting updates.
* Importing malformed or outdated progress codes.

Determine whether the application can recover safely from failures.

8. Audit F: User Experience and Accessibility

Evaluate the application from the perspective of someone playing Ocarina of Time while using the tracker.

Examine every tab and major interaction.

Evaluate:

* Navigation clarity.
* Tab organization.
* Version switching.
* Progress indicators.
* Ready filters.
* Completion filters.
* Age filters.
* Day/night filters.
* Search functionality.
* Collapsible sections.
* Areas navigation.
* Requirement chips.
* Linked achievement navigation.
* Spoiler controls.
* Walkthrough controls.
* Two-age checklists.
* Catch-up prompts.
* Version notes.
* Magic Bean tracker.
* Progress-code controls.
* Synchronization indicators.

Determine whether a new user can understand how to operate the tracker without needing extensive instructions.

Look for unnecessary clicks, confusing terminology, ambiguous states, hidden functionality, inconsistent interactions, and information overload.

Consider whether the application is genuinely useful while actively playing the game, rather than simply being a comprehensive database of achievements.

Accessibility

Check:

* Keyboard navigation.
* Screen-reader compatibility.
* Semantic HTML.
* ARIA labels and states.
* Focus visibility.
* Color contrast.
* Checkbox accessibility.
* Touch target sizes.
* Reduced-motion behavior.
* Zoom and text scaling.
* Information conveyed exclusively through color.

Responsive Design

Test actual rendered layouts at:

* 320px.
* 375px.
* 390px.
* 430px.
* 768px.
* 1024px.
* 1366px.
* 1920px.

Identify horizontal overflow, clipped text, inaccessible controls, layout instability, and inconsistent spacing.

Examine all three console themes in both light and dark modes.

Inspect actual rendered pages, not just CSS declarations.

9. Audit G: Testing and Edge Cases

Examine all 27 existing test scripts.

Determine:

* What each test verifies.
* What each test does not verify.
* Whether assertions are meaningful.
* Whether tests contain incorrect assumptions.
* Whether important functionality is untested.
* Whether tests are deterministic.
* Whether failures provide useful diagnostic information.

Run the complete existing suite.

Then identify and create additional tests where appropriate.

Prioritize:

* Randomized progression sequences.
* Tick/untick reversibility.
* Dependency edge cases.
* Version isolation.
* Two-age progression.
* OR requirement alternatives.
* Checklist synchronization.
* Save migration.
* Synchronization conflicts.
* Progress-code compatibility.
* Search and spoiler interactions.
* Responsive rendering.
* Accessibility.
* Browser errors.

Test unusual but legitimate player behavior, not just the expected playthrough.

Do not modify the existing test suite during the initial investigation.

Where possible, use property-based testing and randomized simulations to identify unexpected combinations of player actions.

Verify that randomized tests are reproducible through recorded seeds.

Determine whether the existing tests are testing actual application behavior or merely confirming internal assumptions.

10. Audit H: Build and Release Integrity

Examine:

* build.py
* template.html
* themed2.html
* All generated assets.
* All build-time assertions.
* The final standalone application.

Verify:

1. The build completes successfully.
2. The output is valid HTML.
3. All required application code is included.
4. No unintended external dependencies exist.
5. No missing assets exist.
6. No unexpected runtime network requests occur.
7. No JavaScript console errors occur.
8. No uncaught exceptions occur.
9. No unexpected browser warnings indicate broken behavior.
10. The application works after being opened in a clean browser session.
11. The application works without relying on development-only files.
12. The published artifact matches the local build.

Check the SHA-256 of the local build against the published artifact.

Do not assume that a successful build means the published application is correct.

Also inspect:

* HTML validity.
* JavaScript syntax and runtime compatibility.
* Browser compatibility.
* Asset encoding.
* File size.
* Startup performance.
* Memory usage during extended interaction.
* Unexpected event listener accumulation.
* Rendering performance with expanded lists.
* Behavior after prolonged use.

11. Security and Privacy Audit

Examine the security of the application and its synchronization mechanisms.

Review:

* User-controlled input.
* Progress-code parsing.
* HTML rendering and escaping.
* Potential cross-site scripting.
* Unsafe DOM insertion.
* External resource loading.
* Authentication boundaries.
* Database access controls.
* Data validation.
* Sensitive information exposure.
* Error messages.
* Remote synchronization permissions.

Determine whether malformed progress codes or manipulated local data could cause unexpected behavior.

Verify that one user’s progress cannot be accessed or overwritten by another user through the application’s synchronization implementation.

Do not expose credentials, tokens, account information, or other sensitive data in audit reports.

Do not assume that client-side validation alone provides adequate security.

12. Required Audit Deliverables

Produce a comprehensive report with the following sections.

A. Executive Summary

Provide:

* Overall release readiness.
* Major strengths.
* Major weaknesses.
* Critical outstanding issues.
* Whether you recommend release.

Use a clear rating for each major audit category.

B. Complete Findings Register

For every finding, include:

* Unique finding ID.
* Audit category.
* Severity: Critical, High, Medium, Low, or Informational.
* Finding classification.
* Confidence level.
* Affected file and function/data entry.
* Description.
* Evidence.
* Reproduction steps, where applicable.
* Expected behavior.
* Actual behavior.
* Recommended correction.
* Whether a regression test is needed.

C. Game-Data Verification Report

Provide a separate report identifying every incorrect, incomplete, questionable, or independently verified data entry.

Include coverage counts and percentages for each category and version.

Do not give a blanket statement that the game data is accurate without examining individual entries.

D. Test Coverage Report

Provide:

* Existing tests executed.
* Tests passed.
* Tests failed.
* Tests skipped.
* New tests recommended.
* New tests executed.
* Remaining untested risks.

E. UX Report

Identify usability and accessibility problems, explain their impact, and suggest specific improvements.

F. Release Checklist

Create a checklist of everything that must be resolved or verified before release.

G. Prioritized Remediation Plan

Organize recommended work into:

1. Release blockers.
2. High-priority corrections.
3. Medium-priority improvements.
4. Low-priority polish.
5. Optional future enhancements.

H. Audit Coverage Report

Provide a complete accounting of:

* Total project files discovered.
* Files fully examined.
* Files partially examined.
* Files not examined.
* Total test scripts discovered.
* Test scripts executed.
* Game-data entries independently verified.
* Game-data entries inferred from other versions.
* Game-data entries still unverified.
* Features tested in a real browser.
* Features not tested in a real browser.

This report must make it impossible to mistake partial examination for a complete audit.

13. Additional Audit Execution Requirements

These requirements take priority whenever they conflict with an assumption about how the audit should be conducted.

A. Multi-Session Investigation

This audit is expected to require multiple sessions.

Do not attempt to compress the entire investigation into a single response or prematurely declare the audit complete.

Maintain a persistent document named AUDIT_PROGRESS.md in the isolated audit workspace.

Update it after each audit session with:

* Completed audit categories.
* Files fully inspected.
* Files partially inspected.
* Files not yet inspected.
* Tests executed and their results.
* Confirmed findings.
* Suspected findings.
* Unresolved questions.
* Remaining work.
* Next recommended action.

Maintain a separate AUDIT_FINDINGS.md containing the detailed findings register.

Maintain a separate AUDIT_VERIFICATION.md containing the game-data verification matrix and source references.

Maintain a separate AUDIT_TESTS.md containing test execution records, additional test recommendations, and results.

Do not duplicate entire reports in every progress update. Maintain clear references between documents.

Never mark an audit category complete until its required examination and verification have actually been performed.

B. Source-Code Inspection Requirements

Read every relevant source file in its entirety.

Do not rely exclusively on search results, code summaries, function signatures, or documentation.

For important functionality, trace execution across all related files.

In particular, trace the complete implementation of:

* tickOn
* tickOff
* eff()
* reqOf()
* unmetAny()
* rowReady()
* normalize()
* touch()
* Progress-code import and export.
* Local persistence.
* Remote synchronization.
* Version-specific requirement resolution.
* Checklist propagation.

Examine both the functions themselves and the functions that call them.

If any source file cannot be fully inspected, document that limitation.

Do not claim that every file has been examined based on a high-level directory listing.

C. Independent Game-Data Verification

Establish the actual identity and availability of every game version before researching its information.

Use version-specific sources wherever possible.

Do not assume information from the original Nintendo 64 release is unchanged in the 3DS or Switch 2 versions.

For every audited entry, record:

* Tracker ID.
* Version.
* Information being verified.
* Verification result.
* Supporting source.
* Whether the source directly covers that version.
* Confidence level.

Distinguish independently verified information from information inferred from another version.

Do not assign a passing status to an entire category merely because no errors were discovered.

Unverified information must remain explicitly unverified.

D. Safe Testing Environment

All testing must occur in an isolated copy of the project.

Never:

* Modify the original project during Phase 1.
* Connect tests to production player data.
* Modify real user saves.
* Publish changes.
* Overwrite the live artifact.
* Expose credentials or authentication tokens.
* Execute destructive commands against the original project.

Use simulated player data, test accounts, and isolated storage.

Record any testing operation that could potentially modify project files or generated artifacts.

If a test requires an external service, determine whether a safe test environment exists before executing it.

E. Evidence and Confidence Requirements

Every finding must have a classification:

* Confirmed defect.
* Suspected defect.
* Verified correct behavior.
* Unverified behavior.
* Recommended improvement.

Assign a confidence level of High, Medium, or Low.

For confirmed defects, provide reproducible evidence whenever possible.

For verified behavior, identify the actual test, inspection, or independent source supporting the conclusion.

Never describe an untested feature as verified.

When evidence is insufficient, explicitly state what additional evidence is required.

F. Multi-Session Continuity

At the end of every session:

1. Update AUDIT_PROGRESS.md.
2. Record all completed work.
3. Record all outstanding work.
4. Record new findings.
5. Record any unresolved questions.
6. Identify the exact next audit task.

At the beginning of a subsequent session:

1. Read the existing audit progress document.
2. Read the findings relevant to the next task.
3. Confirm which files and tests have already been examined.
4. Continue without unnecessarily repeating completed work.

Do not discard or overwrite previous findings without documenting why they changed.

G. Audit Completeness

Do not issue a final release recommendation until:

1. Every required source file has been accounted for.
2. Every required audit category has been examined.
3. The baseline build and tests have been evaluated.
4. All critical and high-priority findings have been investigated.
5. Game-data verification coverage has been quantified.
6. Known limitations and unverified areas have been documented.
7. The final release artifact has been inspected.
8. Production-data safety has been maintained.

If complete verification is impossible, provide a qualified assessment rather than claiming the application is release-ready.

The objective is an evidence-backed audit, not a favorable report.

⸻

14. Final Instructions

Work systematically and do not rush.

Start by inventorying the complete project and understanding how all of its components interact.

Then establish a baseline by running the build and existing tests.

Proceed through each audit category.

Do not skip files because they appear unimportant. Do not assume that small modules cannot contain significant defects.

Do not modify the project until the complete investigation and findings report are finished.

If a tool, reference, environment, or external service is unavailable, document the limitation rather than claiming verification.

If the audit is too large to complete in one session, divide it into manageable stages and maintain a written record of completed work, outstanding work, and findings.

Do not prioritize producing a quick answer over producing an accurate audit.

Do not prioritize the number of findings over the quality of evidence.

Do not recommend changes merely to make the code look different.

Preserve the existing architecture wherever it is demonstrably sound.

The standard for success is not that the application appears to work. The standard is that its important behaviors have been systematically verified, its remaining risks are understood, and its release readiness can be supported with evidence.

Begin with project inventory and baseline verification. Do not modify any project files during the initial investigation.
<!-- END ORIGINAL SPECIFICATION -->
