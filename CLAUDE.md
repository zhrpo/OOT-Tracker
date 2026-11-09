# OoT Tracker pre-release audit — session rules

This repo is the persistent workspace for the audit of "Ocarina of Time Tracker: The Adventure Edition". It is the
**audit copy**, not the live tracker.

## Start of every session
1. `ln -sfn /home/claude/oot-tracker /home/claude/audit` (scripts hard-code `/home/claude/audit`).
2. Read `NEXT_SESSION.md` first, then `AUDIT_PROGRESS.md`, `AUDIT_FINDINGS.md`, `AUDIT_TESTS.md`, `AUDIT_VERIFICATION.md` in full. They are the only source of truth; earlier chats are not available.
3. `cd proj && python3 build.py && sha256sum ../out/themed2.html` must match the hash in NEXT_SESSION.md.

## End of every session
Update the five docs (and `REMEDIATION_PLAN.md` if relevant), then commit and push to `main` with a message naming the session.

## Rules
- Production is read-only. Live artifact `573b4659-23ad-4fdc-b76d-0801cdf31f91`: metadata/file list only. Never publish over it, never write to production data, never read the owner's saved progress into tests. Synthetic data only.
- Exception (owner Q5, 2026-11-09): a **separate** test artifact (new unique ID, separate database document/namespace) may be published for sync tests only after isolation is demonstrated before any database write (test copy cannot read or write the production save; production metadata recorded before and unchanged after). If isolation cannot be guaranteed, stop. Cross-account isolation stays "unverified" without genuinely independent authenticated accounts.
- Implement no fixes unless the owner opens an implementation session.
- Preserve finding IDs (next: see NEXT_SESSION.md). Item IDs never renumber.
- Every test exits non-zero on failure.
- Keep replies short.
